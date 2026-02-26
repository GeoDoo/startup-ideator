"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getAIProvider } from "@/lib/ai";
import { rateLimit } from "@/lib/rate-limit";
import { buildVenturePrompt } from "@/lib/ai/prompts/venture";
import { ventureInputResponsesSchema } from "@/lib/validation/schemas";

const VENTURE_RATE_LIMIT = { windowMs: 10 * 60 * 1000, maxRequests: 5 };

export async function getOrCreateVentureInput(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });
  if (!membership) return null;

  let input = await prisma.ventureInput.findUnique({
    where: { teamId_memberId: { teamId, memberId: membership.id } },
  });

  if (!input) {
    input = await prisma.ventureInput.create({
      data: { teamId, memberId: membership.id },
    });
  }

  return input;
}

export async function saveVentureInput(
  teamId: string,
  sectionKey: string,
  questionKey: string,
  answer: unknown
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });
  if (!membership) return { success: false };

  const input = await prisma.ventureInput.findUnique({
    where: { teamId_memberId: { teamId, memberId: membership.id } },
  });
  if (!input || input.status === "completed") return { success: false };

  const rawResponses = ventureInputResponsesSchema.safeParse(input.responses);
  const responses = rawResponses.success ? rawResponses.data : {};
  if (!responses[sectionKey]) responses[sectionKey] = {};
  responses[sectionKey][questionKey] = answer;

  await prisma.ventureInput.update({
    where: { id: input.id },
    data: { responses: responses as object },
  });

  return { success: true };
}

export async function submitVentureInput(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });
  if (!membership) return { success: false, error: "Not a team member" };

  await prisma.ventureInput.update({
    where: { teamId_memberId: { teamId, memberId: membership.id } },
    data: { status: "completed", completedAt: new Date() },
  });

  return { success: true };
}

export async function getVentureInputStatus(teamId: string) {
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
      ventureInputs: { select: { status: true } },
    },
  });

  return members.map((m) => ({
    memberId: m.id,
    name: m.user.name,
    isCurrentUser: m.userId === session.user.id,
    status: m.ventureInputs[0]?.status || "not_started",
  }));
}

export async function generateVentureCandidates(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const { allowed, retryAfterMs } = await rateLimit(
    `venture:${session.user.id}`,
    VENTURE_RATE_LIMIT
  );
  if (!allowed) {
    const minutes = Math.ceil(retryAfterMs / 60_000);
    return { success: false, error: `Rate limited. Try again in ${minutes} minute${minutes > 1 ? "s" : ""}.` };
  }

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });
  if (!membership) return { success: false, error: "Not a team member" };

  const inputs = await prisma.ventureInput.findMany({
    where: { teamId, status: "completed" },
    include: { member: { include: { user: { select: { name: true } } } } },
  });

  const memberCount = await prisma.teamMember.count({ where: { teamId } });
  if (inputs.length < memberCount) {
    return { success: false, error: "All partners must complete venture inputs first" };
  }

  const team = await prisma.team.findUnique({ where: { id: teamId } });

  const lastRound = await prisma.ventureCandidate.findFirst({
    where: { teamId },
    orderBy: { round: "desc" },
    select: { round: true },
  });
  const nextRound = (lastRound?.round || 0) + 1;

  try {
    const provider = getAIProvider();
    const prompt = buildVenturePrompt({
      teamSize: memberCount,
      teamStage: team?.stage || null,
      teamDomain: team?.domain || null,
      partnerInputs: inputs.map((inp, i) => ({
        label: `Partner ${String.fromCharCode(65 + i)}`,
        responses: inp.responses as Record<string, Record<string, unknown>>,
      })),
    });

    const result = await provider.generateVentureCandidates(prompt);

    const candidates = await Promise.all(
      result.map((c) =>
        prisma.ventureCandidate.create({
          data: {
            teamId,
            round: nextRound,
            problem: c.problem,
            solution: c.solution,
            customer: c.customer,
            businessModel: c.businessModel,
            marketOpportunity: c.marketOpportunity,
            competitiveLandscape: c.competitiveLandscape,
            teamFitScore: c.teamFitScore,
            feasibility: c.feasibility,
            first90Days: c.first90Days,
            revenueTimeline: c.revenueTimeline,
            riskLevel: c.riskLevel,
            industry: c.industry,
          },
        })
      )
    );

    return { success: true, round: nextRound, count: candidates.length };
  } catch (error) {
    console.error("Venture generation failed:", error);
    return { success: false, error: "Idea generation failed. Please try again." };
  }
}

export async function getVentureCandidates(teamId: string, round?: number) {
  const session = await auth();
  if (!session?.user?.id) return [];

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });
  if (!membership) return [];

  return prisma.ventureCandidate.findMany({
    where: round ? { teamId, round } : { teamId },
    include: {
      ratings: { where: { memberId: membership.id } },
      _count: { select: { ratings: true } },
    },
    orderBy: { teamFitScore: "desc" },
  });
}

export async function rateVentureCandidate(
  candidateId: string,
  ratings: { excitement: number; confidence: number; fit: number; commitment: number; rank?: number; notes?: string }
) {
  const session = await auth();
  if (!session?.user?.id) return { success: false };

  for (const val of [ratings.excitement, ratings.confidence, ratings.fit, ratings.commitment]) {
    if (!Number.isInteger(val) || val < 1 || val > 10) {
      return { success: false, error: "Ratings must be integers between 1 and 10" };
    }
  }

  const candidate = await prisma.ventureCandidate.findUnique({
    where: { id: candidateId },
    select: { teamId: true },
  });
  if (!candidate) return { success: false };

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId: candidate.teamId } },
  });
  if (!membership) return { success: false };

  await prisma.ventureRating.upsert({
    where: { candidateId_memberId: { candidateId, memberId: membership.id } },
    update: ratings,
    create: { candidateId, memberId: membership.id, ...ratings },
  });

  return { success: true };
}

export async function getAlignmentReveal(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });
  if (!membership) return null;

  const memberCount = await prisma.teamMember.count({ where: { teamId } });

  const candidates = await prisma.ventureCandidate.findMany({
    where: { teamId },
    include: { ratings: true },
    orderBy: { teamFitScore: "desc" },
  });

  const fullyRated = candidates.filter((c) => c.ratings.length === memberCount);

  const scored = fullyRated.map((c) => {
    const avgExcitement = avg(c.ratings.map((r) => r.excitement));
    const avgConfidence = avg(c.ratings.map((r) => r.confidence));
    const avgFit = avg(c.ratings.map((r) => r.fit));
    const avgCommitment = avg(c.ratings.map((r) => r.commitment));
    const combinedScore = (avgExcitement + avgConfidence + avgFit + avgCommitment) / 4;

    const topPickers = c.ratings.filter((r) => (r.rank ?? 99) <= 5).length;
    const isUnanimousTop = topPickers === memberCount;

    return {
      candidateId: c.id,
      problem: c.problem,
      solution: c.solution,
      industry: c.industry,
      teamFitScore: c.teamFitScore,
      avgExcitement,
      avgConfidence,
      avgFit,
      avgCommitment,
      combinedScore,
      topPickers,
      isUnanimousTop,
      category: isUnanimousTop
        ? "mutual-top"
        : topPickers > 0
          ? "strong-interest"
          : "divergent",
    };
  });

  scored.sort((a, b) => b.combinedScore - a.combinedScore);

  return { candidates: scored, totalMembers: memberCount };
}

export async function selectVenture(teamId: string, candidateId: string) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });
  if (!membership) return { success: false, error: "Not a team member" };

  const candidate = await prisma.ventureCandidate.findUnique({
    where: { id: candidateId },
    select: { teamId: true },
  });
  if (!candidate || candidate.teamId !== teamId) {
    return { success: false, error: "Candidate not found for this team" };
  }

  await prisma.ventureSelection.upsert({
    where: { teamId },
    update: { candidateId, status: "selected" },
    create: { teamId, candidateId },
  });

  return { success: true };
}

export async function getVentureSelection(teamId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await prisma.teamMember.findUnique({
    where: { userId_teamId: { userId: session.user.id, teamId } },
  });
  if (!membership) return null;

  return prisma.ventureSelection.findUnique({
    where: { teamId },
  });
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 10) / 10;
}
