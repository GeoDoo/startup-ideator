"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendEmail, invitationEmail } from "@/lib/email";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  teamId: z.string().min(1),
});

export type InviteResult = {
  success: boolean;
  error?: string;
};

export async function invitePartner(formData: FormData): Promise<InviteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in" };
  }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    teamId: formData.get("teamId"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { email, teamId } = parsed.data;

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });

  if (!membership || membership.role !== "creator") {
    return { success: false, error: "Only the team creator can invite partners" };
  }

  if (email === session.user.email) {
    return { success: false, error: "You cannot invite yourself" };
  }

  const existingMember = await prisma.teamMember.findFirst({
    where: { teamId, user: { email } },
  });

  if (existingMember) {
    return { success: false, error: "This person is already a partner" };
  }

  const memberCount = await prisma.teamMember.count({ where: { teamId } });
  if (memberCount >= 10) {
    return { success: false, error: "Maximum team size of 10 partners reached" };
  }

  const existingInvite = await prisma.invitation.findFirst({
    where: { email, teamId, status: "pending" },
  });

  if (existingInvite) {
    return { success: false, error: "This person has already been invited" };
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { name: true },
  });

  const invitation = await prisma.invitation.create({
    data: {
      email,
      teamId,
      invitedBy: session.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const link = `${baseUrl}/invite/${invitation.token}`;
  const emailContent = invitationEmail(
    team?.name || "a team",
    session.user.name || session.user.email || "A co-founder",
    link
  );

  await sendEmail({ to: email, ...emailContent });

  return { success: true };
}

export async function acceptInvitation(token: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in", redirect: `/login?callbackUrl=/invite/${token}` };
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { team: true },
  });

  if (!invitation) {
    return { success: false, error: "This invitation is no longer valid" };
  }

  if (invitation.status !== "pending") {
    if (invitation.status === "accepted") {
      return { success: true, redirect: `/teams/${invitation.teamId}` };
    }
    return { success: false, error: "This invitation is no longer valid" };
  }

  if (invitation.expiresAt < new Date()) {
    return { success: false, error: "This invitation has expired" };
  }

  const existingMember = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId: invitation.teamId } },
  });

  if (existingMember) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "accepted" },
    });
    return { success: true, redirect: `/teams/${invitation.teamId}` };
  }

  const memberCount = await prisma.teamMember.count({ where: { teamId: invitation.teamId } });
  if (memberCount >= 10) {
    return { success: false, error: "This team has reached maximum capacity" };
  }

  await prisma.$transaction([
    prisma.teamMember.create({
      data: {
        userId: session.user.id,
        teamId: invitation.teamId,
        role: "partner",
      },
    }),
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "accepted" },
    }),
  ]);

  return { success: true, redirect: `/teams/${invitation.teamId}` };
}

export async function revokeInvitation(invitationId: string): Promise<InviteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in" };
  }

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { team: { include: { members: true } } },
  });

  if (!invitation) {
    return { success: false, error: "Invitation not found" };
  }

  const isCreator = invitation.team.members.some(
    (m) => m.userId === session.user.id && m.role === "creator"
  );

  if (!isCreator) {
    return { success: false, error: "Only the team creator can revoke invitations" };
  }

  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "revoked" },
  });

  return { success: true };
}
