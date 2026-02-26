import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockReset } from "vitest-mock-extended";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { requestAccountDeletion, cancelAccountDeletion, getDeletionStatus } from "./privacy";

const mockedPrisma = vi.mocked(prisma, true);
const mockedAuth = vi.mocked(auth);

describe("requesting account deletion", () => {
  beforeEach(() => {
    mockReset(mockedPrisma);
    mockedAuth.mockReset();
  });

  it("rejects when the user is not authenticated", async () => {
    mockedAuth.mockResolvedValue(null);

    const result = await requestAccountDeletion();
    expect(result.success).toBe(false);
  });

  it("prevents duplicate pending deletion requests", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } });
    mockedPrisma.deletionRequest.findUnique.mockResolvedValue({
      id: "dr1", userId: "u1", status: "pending",
      scheduledAt: new Date(),
    } as never);

    const result = await requestAccountDeletion();
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/already pending/i);
  });

  it("schedules deletion 30 days in the future", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } });
    mockedPrisma.deletionRequest.findUnique.mockResolvedValue(null);
    mockedPrisma.deletionRequest.upsert.mockResolvedValue({} as never);

    const now = Date.now();
    const result = await requestAccountDeletion("I want to leave");
    expect(result.success).toBe(true);
    expect(result.scheduledAt).toBeDefined();

    const scheduledMs = new Date(result.scheduledAt!).getTime();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    expect(scheduledMs - now).toBeGreaterThan(thirtyDaysMs - 5000);
    expect(scheduledMs - now).toBeLessThan(thirtyDaysMs + 5000);
  });

  it("accepts an optional reason without error", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } });
    mockedPrisma.deletionRequest.findUnique.mockResolvedValue(null);
    mockedPrisma.deletionRequest.upsert.mockResolvedValue({} as never);

    const result = await requestAccountDeletion("No longer needed");
    expect(result.success).toBe(true);
    expect(result.scheduledAt).toBeDefined();
  });

  it("succeeds without a reason when none is provided", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } });
    mockedPrisma.deletionRequest.findUnique.mockResolvedValue(null);
    mockedPrisma.deletionRequest.upsert.mockResolvedValue({} as never);

    const result = await requestAccountDeletion();
    expect(result.success).toBe(true);
    expect(result.scheduledAt).toBeDefined();
  });
});

describe("cancelling account deletion", () => {
  beforeEach(() => {
    mockReset(mockedPrisma);
    mockedAuth.mockReset();
  });

  it("rejects when the user is not authenticated", async () => {
    mockedAuth.mockResolvedValue(null);
    const result = await cancelAccountDeletion();
    expect(result.success).toBe(false);
  });

  it("succeeds for an authenticated user with a pending request", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } });
    mockedPrisma.deletionRequest.updateMany.mockResolvedValue({ count: 1 } as never);

    const result = await cancelAccountDeletion();
    expect(result.success).toBe(true);
  });
});

describe("checking deletion status", () => {
  beforeEach(() => {
    mockReset(mockedPrisma);
    mockedAuth.mockReset();
  });

  it("returns null for unauthenticated users", async () => {
    mockedAuth.mockResolvedValue(null);
    const result = await getDeletionStatus();
    expect(result).toBeNull();
  });

  it("returns the current deletion request", async () => {
    mockedAuth.mockResolvedValue({ user: { id: "u1" } });
    const pending = { id: "dr1", userId: "u1", status: "pending", scheduledAt: new Date() };
    mockedPrisma.deletionRequest.findUnique.mockResolvedValue(pending as never);

    const result = await getDeletionStatus();
    expect(result).toEqual(pending);
  });
});
