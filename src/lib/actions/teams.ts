"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters").max(100),
  stage: z.string().optional(),
  domain: z.string().optional(),
});

export type TeamResult = {
  success: boolean;
  error?: string;
};

export async function createTeam(formData: FormData): Promise<TeamResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be logged in" };
  }

  const parsed = createTeamSchema.safeParse({
    name: formData.get("name"),
    stage: formData.get("stage") || undefined,
    domain: formData.get("domain") || undefined,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, stage, domain } = parsed.data;

  const existingTeam = await prisma.team.findFirst({
    where: {
      name,
      members: { some: { userId: session.user.id } },
    },
  });

  if (existingTeam) {
    return { success: false, error: "You already have a team with this name" };
  }

  const team = await prisma.team.create({
    data: {
      name,
      stage: stage || null,
      domain: domain || null,
      members: {
        create: {
          userId: session.user.id,
          role: "creator",
        },
      },
    },
  });

  redirect(`/teams/${team.id}`);
}

export async function getUserTeams() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const memberships = await prisma.teamMember.findMany({
    where: { userId: session.user.id },
    include: {
      team: {
        include: {
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return memberships.map((m) => ({
    id: m.team.id,
    name: m.team.name,
    stage: m.team.stage,
    domain: m.team.domain,
    role: m.role,
    memberCount: m.team._count.members,
  }));
}

export async function getTeamById(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.teamMember.findUnique({
    where: {
      userId_teamId: { userId: session.user.id, teamId },
    },
    include: {
      team: {
        include: {
          members: {
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
          },
          invitations: {
            where: { status: "pending" },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!membership) return null;

  return { ...membership.team, currentUserRole: membership.role };
}
