import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockReset } from "vitest-mock-extended";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { saveResponse, submitAssessment, getTeamAssessmentStatus } from "./assessment";

const mockedPrisma = vi.mocked(prisma, true);
const mockedAuth = vi.mocked(auth);

describe("saving an assessment response", () => {
  beforeEach(() => {
    mockReset(mockedPrisma);
    mockedAuth.mockReset();
  });

  it("rejects when the user is not authenticated", async () => {
    mockedAuth.mockResolvedValue(null);

    const result = await saveResponse("a1", "section", "question", "answer");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/authenticated/i);
  });

  it("rejects when the assessment belongs to another member", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } });
    mockedPrisma.assessment.findUnique.mockResolvedValue({
      id: "a1", teamId: "t1", memberId: "m-other", status: "in_progress",
      member: { id: "m-other", userId: "u-other" },
    } as never);
    mockedPrisma.teamMember.findUnique.mockResolvedValue({
      id: "m1", userId: "u1", teamId: "t1",
    } as never);

    const result = await saveResponse("a1", "section", "q1", "answer");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/denied/i);
  });

  it("rejects saving to a completed assessment", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } });
    mockedPrisma.assessment.findUnique.mockResolvedValue({
      id: "a1", teamId: "t1", memberId: "m1", status: "completed",
      member: { id: "m1", userId: "u1" },
    } as never);
    mockedPrisma.teamMember.findUnique.mockResolvedValue({
      id: "m1", userId: "u1", teamId: "t1",
    } as never);

    const result = await saveResponse("a1", "section", "q1", "answer");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/submitted/i);
  });

  it("succeeds when the user owns an in-progress assessment", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } });
    mockedPrisma.assessment.findUnique.mockResolvedValue({
      id: "a1", teamId: "t1", memberId: "m1", status: "in_progress",
      member: { id: "m1", userId: "u1" },
    } as never);
    mockedPrisma.teamMember.findUnique.mockResolvedValue({
      id: "m1", userId: "u1", teamId: "t1",
    } as never);
    mockedPrisma.assessmentResponse.upsert.mockResolvedValue({} as never);

    const result = await saveResponse("a1", "identity", "vision", "Build great things");
    expect(result.success).toBe(true);
  });

  it("rejects when the assessment does not exist", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } });
    mockedPrisma.assessment.findUnique.mockResolvedValue(null);

    const result = await saveResponse("nonexistent", "section", "q1", "answer");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/not found/i);
  });
});

describe("submitting a completed assessment", () => {
  beforeEach(() => {
    mockReset(mockedPrisma);
    mockedAuth.mockReset();
  });

  it("rejects submission when required questions are unanswered", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } });
    mockedPrisma.assessment.findUnique.mockResolvedValue({
      id: "a1", teamId: "t1", memberId: "m1", status: "in_progress",
      member: { id: "m1", userId: "u1" },
      responses: [],
    } as never);
    mockedPrisma.teamMember.findUnique.mockResolvedValue({
      id: "m1", userId: "u1", teamId: "t1",
    } as never);

    const result = await submitAssessment("a1");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/required/i);
  });

  it("rejects submission when the user does not own the assessment", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } });
    mockedPrisma.assessment.findUnique.mockResolvedValue({
      id: "a1", teamId: "t1", memberId: "m-other", status: "in_progress",
      member: { id: "m-other" },
      responses: [],
    } as never);
    mockedPrisma.teamMember.findUnique.mockResolvedValue({
      id: "m1", userId: "u1", teamId: "t1",
    } as never);

    const result = await submitAssessment("a1");
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/denied/i);
  });
});

describe("viewing team assessment status", () => {
  beforeEach(() => {
    mockReset(mockedPrisma);
    mockedAuth.mockReset();
  });

  it("returns null when the user is not a team member", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } });
    mockedPrisma.teamMember.findUnique.mockResolvedValue(null);

    const result = await getTeamAssessmentStatus("t1");
    expect(result).toBeNull();
  });

  it("shows completion status without exposing individual answers", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } });
    mockedPrisma.teamMember.findUnique.mockResolvedValue({
      id: "m1", userId: "u1", teamId: "t1",
    } as never);
    mockedPrisma.teamMember.findMany.mockResolvedValue([
      {
        id: "m1", userId: "u1",
        user: { id: "u1", name: "Alice" },
        assessments: [{ status: "completed", completedAt: new Date() }],
      },
      {
        id: "m2", userId: "u2",
        user: { id: "u2", name: "Bob" },
        assessments: [],
      },
    ] as never);

    const result = await getTeamAssessmentStatus("t1");
    expect(result).toHaveLength(2);
    expect(result![0].status).toBe("completed");
    expect(result![1].status).toBe("not_started");
    // No individual answers exposed — only status
    expect(result![0]).not.toHaveProperty("responses");
    expect(result![0]).not.toHaveProperty("answers");
  });
});
