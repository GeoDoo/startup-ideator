"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function exportUserData() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      teams: {
        include: {
          team: { select: { name: true, stage: true, domain: true } },
          assessments: { include: { responses: true } },
          ventureInputs: true,
          ventureRatings: true,
        },
      },
      notifications: true,
      notificationPrefs: true,
    },
  });

  if (!user) return null;

  return {
    profile: {
      name: user.name,
      email: user.email,
      timezone: user.timezone,
      createdAt: user.createdAt,
    },
    teams: user.teams.map((tm) => ({
      teamName: tm.team.name,
      role: tm.role,
      joinedAt: tm.joinedAt,
      assessments: tm.assessments.map((a) => ({
        type: a.type,
        status: a.status,
        completedAt: a.completedAt,
        responses: a.responses.map((r) => ({
          section: r.sectionKey,
          question: r.questionKey,
          answer: r.answer,
        })),
      })),
      ventureInputs: tm.ventureInputs.map((vi) => ({
        status: vi.status,
        responses: vi.responses,
      })),
      ventureRatings: tm.ventureRatings.map((vr) => ({
        excitement: vr.excitement,
        confidence: vr.confidence,
        fit: vr.fit,
        commitment: vr.commitment,
      })),
    })),
    notificationPreferences: user.notificationPrefs,
    exportedAt: new Date().toISOString(),
  };
}

export async function requestAccountDeletion(reason?: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const existing = await prisma.deletionRequest.findUnique({
    where: { userId: session.user.id },
  });

  if (existing && existing.status === "pending") {
    return { success: false, error: "A deletion request is already pending" };
  }

  const scheduledAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.deletionRequest.upsert({
    where: { userId: session.user.id },
    update: { status: "pending", reason, scheduledAt, processedAt: null },
    create: { userId: session.user.id, reason, scheduledAt },
  });

  return { success: true, scheduledAt };
}

export async function cancelAccountDeletion() {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  await prisma.deletionRequest.updateMany({
    where: { userId: session.user.id, status: "pending" },
    data: { status: "cancelled" },
  });

  return { success: true };
}

export async function getDeletionStatus() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.deletionRequest.findUnique({
    where: { userId: session.user.id },
  });
}
