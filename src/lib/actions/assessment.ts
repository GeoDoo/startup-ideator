"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ASSESSMENT_SECTIONS } from "@/lib/assessment/questions";

export async function getOrCreateAssessment(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });
  if (!membership) return null;

  let assessment = await prisma.assessment.findFirst({
    where: { teamId, memberId: membership.id, type: "initial" },
    include: { responses: true },
  });

  if (!assessment) {
    assessment = await prisma.assessment.create({
      data: { teamId, memberId: membership.id, type: "initial" },
      include: { responses: true },
    });
  }

  return assessment;
}

export async function saveResponse(
  assessmentId: string,
  sectionKey: string,
  questionKey: string,
  answer: unknown
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { member: true },
  });
  if (!assessment) return { success: false, error: "Assessment not found" };

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId: assessment.teamId } },
  });
  if (!membership || membership.id !== assessment.memberId) {
    return { success: false, error: "Access denied" };
  }

  if (assessment.status === "completed") {
    return { success: false, error: "Assessment already submitted" };
  }

  await prisma.assessmentResponse.upsert({
    where: {
      assessmentId_sectionKey_questionKey: {
        assessmentId,
        sectionKey,
        questionKey,
      },
    },
    update: { answer: answer as object },
    create: {
      assessmentId,
      sectionKey,
      questionKey,
      answer: answer as object,
    },
  });

  return { success: true };
}

export async function submitAssessment(assessmentId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: { member: true, responses: true },
  });
  if (!assessment) return { success: false, error: "Assessment not found" };

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId: assessment.teamId } },
  });
  if (!membership || membership.id !== assessment.memberId) {
    return { success: false, error: "Access denied" };
  }

  const requiredAnswers = new Set<string>();
  for (const section of ASSESSMENT_SECTIONS) {
    for (const question of section.questions) {
      if (question.required) {
        requiredAnswers.add(`${section.key}:${question.key}`);
      }
    }
  }

  const answeredKeys = new Set(
    assessment.responses.map((r) => `${r.sectionKey}:${r.questionKey}`)
  );

  const missing = [...requiredAnswers].filter((k) => !answeredKeys.has(k));
  if (missing.length > 0) {
    return {
      success: false,
      error: `Please complete all required questions. ${missing.length} remaining.`,
    };
  }

  await prisma.assessment.update({
    where: { id: assessmentId },
    data: { status: "completed", completedAt: new Date() },
  });

  return { success: true };
}

export async function getTeamAssessmentStatus(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });
  if (!membership) return null;

  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: { select: { id: true, name: true } },
      assessments: {
        where: { type: "initial" },
        select: { status: true, completedAt: true },
      },
    },
  });

  return members.map((m) => ({
    memberId: m.id,
    name: m.user.name,
    isCurrentUser: m.userId === session.user.id,
    status: m.assessments[0]?.status || "not_started",
    completedAt: m.assessments[0]?.completedAt,
  }));
}
