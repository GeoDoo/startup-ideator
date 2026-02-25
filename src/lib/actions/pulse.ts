"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function getOrCreatePulseAssessment(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });
  if (!membership) return null;

  const schedule = await prisma.pulseSchedule.findUnique({
    where: { teamId },
  });

  if (!schedule || !schedule.active) return null;

  let assessment = await prisma.assessment.findFirst({
    where: {
      teamId,
      memberId: membership.id,
      type: "pulse",
      status: "in_progress",
    },
    include: { responses: true },
    orderBy: { createdAt: "desc" },
  });

  if (!assessment) {
    assessment = await prisma.assessment.create({
      data: { teamId, memberId: membership.id, type: "pulse" },
      include: { responses: true },
    });
  }

  return assessment;
}

export async function configurePulseSchedule(
  teamId: string,
  frequency: string
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });
  if (!membership || membership.role !== "creator") {
    return { success: false, error: "Only the team creator can configure this" };
  }

  const validFrequencies = ["weekly", "biweekly", "monthly", "quarterly"];
  if (!validFrequencies.includes(frequency)) {
    return { success: false, error: "Invalid frequency" };
  }

  const nextDue = computeNextDue(frequency);

  await prisma.pulseSchedule.upsert({
    where: { teamId },
    update: { frequency, nextDue, active: true },
    create: { teamId, frequency, nextDue },
  });

  return { success: true };
}

export async function getPulseSchedule(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });
  if (!membership) return null;

  return prisma.pulseSchedule.findUnique({ where: { teamId } });
}

export async function recordMilestone(
  teamId: string,
  title: string,
  description?: string
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  if (!title.trim() || title.length > 200) {
    return { success: false, error: "Title must be between 1 and 200 characters" };
  }

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });
  if (!membership) return { success: false, error: "Not a team member" };

  await prisma.milestone.create({
    data: {
      teamId,
      title: title.trim(),
      description: description?.trim() || null,
      recordedBy: session.user.id,
    },
  });

  return { success: true };
}

export async function getTeamMilestones(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });
  if (!membership) return [];

  return prisma.milestone.findMany({
    where: { teamId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTrendData(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });
  if (!membership) return null;

  const [reports, milestones, pulseAssessments] = await Promise.all([
    prisma.report.findMany({
      where: { teamId, type: "compatibility", status: "ready" },
      orderBy: { createdAt: "asc" },
      select: { id: true, version: true, scores: true, createdAt: true },
    }),
    prisma.milestone.findMany({
      where: { teamId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.assessment.findMany({
      where: { teamId, type: "pulse", status: "completed" },
      include: { responses: true },
      orderBy: { completedAt: "asc" },
    }),
  ]);

  return { reports, milestones, pulseAssessments };
}

function computeNextDue(frequency: string): Date {
  const now = new Date();
  switch (frequency) {
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "biweekly":
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    case "quarterly":
      return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    case "monthly":
    default:
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }
}
