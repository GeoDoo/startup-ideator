"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai";
import { rateLimit } from "@/lib/rate-limit";
import { type AnonymizedPartnerResponse, type CompatibilityReport } from "@/lib/ai/types";
import { compatibilityReportSchema } from "@/lib/validation/schemas";

const REPORT_RATE_LIMIT = { windowMs: 10 * 60 * 1000, maxRequests: 3 };

export async function generateReport(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const { allowed, retryAfterMs } = await rateLimit(
    `report:${session.user.id}`,
    REPORT_RATE_LIMIT
  );
  if (!allowed) {
    const minutes = Math.ceil(retryAfterMs / 60_000);
    return { success: false, error: `Rate limited. Try again in ${minutes} minute${minutes > 1 ? "s" : ""}.` };
  }

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });
  if (!membership) return { success: false, error: "Not a team member" };

  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: {
      assessments: {
        where: { type: "initial", status: "completed" },
        include: { responses: true },
        take: 1,
      },
    },
  });

  const completedMembers = members.filter((m) => m.assessments.length > 0);
  if (completedMembers.length < 2) {
    return { success: false, error: "All partners must complete the assessment first" };
  }
  if (completedMembers.length !== members.length) {
    return { success: false, error: "Not all partners have completed the assessment yet" };
  }

  const existingReport = await prisma.report.findFirst({
    where: { teamId, type: "compatibility", status: { in: ["ready", "generating"] } },
    orderBy: { createdAt: "desc" },
  });

  if (existingReport?.status === "ready") {
    return { success: true, reportId: existingReport.id };
  }
  if (existingReport?.status === "generating") {
    const STALE_THRESHOLD_MS = 10 * 60 * 1000;
    const age = Date.now() - existingReport.createdAt.getTime();
    if (age > STALE_THRESHOLD_MS) {
      await prisma.report.update({
        where: { id: existingReport.id },
        data: { status: "failed" },
      });
    } else {
      return { success: false, error: "A report is already being generated. Please wait." };
    }
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });

  const report = await prisma.report.create({
    data: { teamId, type: "compatibility", status: "generating" },
  });

  const partnerResponses: AnonymizedPartnerResponse[] = completedMembers.map((m, i) => {
    const responsesBySection: Record<string, Record<string, unknown>> = {};
    for (const resp of m.assessments[0].responses) {
      if (!responsesBySection[resp.sectionKey]) {
        responsesBySection[resp.sectionKey] = {};
      }
      responsesBySection[resp.sectionKey][resp.questionKey] = resp.answer;
    }
    return {
      label: `Partner ${String.fromCharCode(65 + i)}`,
      responses: responsesBySection,
    };
  });

  try {
    const provider = getAIProvider();
    const raw = await provider.generateCompatibilityReport({
      teamSize: completedMembers.length,
      teamStage: team?.stage || null,
      teamDomain: team?.domain || null,
      partnerResponses,
    });

    const validated = compatibilityReportSchema.safeParse(raw);
    if (!validated.success) {
      throw new Error(`AI returned invalid report structure: ${validated.error.issues[0].message}`);
    }

    const result = validated.data;
    await prisma.report.update({
      where: { id: report.id },
      data: {
        status: "ready",
        content: result as unknown as object,
        scores: result.scores as unknown as object,
      },
    });

    return { success: true, reportId: report.id };
  } catch (error) {
    await prisma.report.update({
      where: { id: report.id },
      data: { status: "failed" },
    });
    console.error("Report generation failed:", error);
    return { success: false, error: "Report generation failed. Please try again." };
  }
}

export async function getReport(teamId: string, reportId?: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });
  if (!membership) return null;

  if (reportId) {
    return prisma.report.findUnique({
      where: { id: reportId, teamId },
    });
  }

  return prisma.report.findFirst({
    where: { teamId, type: "compatibility", status: "ready" },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLatestReport(teamId: string): Promise<CompatibilityReport | null> {
  const report = await getReport(teamId);
  if (!report?.content) return null;

  const parsed = compatibilityReportSchema.safeParse(report.content);
  if (!parsed.success) {
    console.error("Corrupt report data:", parsed.error.issues[0]);
    return null;
  }
  return parsed.data;
}
