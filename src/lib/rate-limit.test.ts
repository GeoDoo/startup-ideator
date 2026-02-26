import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rate limiting expensive operations", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("lets a user generate a report when they haven't exceeded the limit", async () => {
    const policy = { windowMs: 60_000, maxRequests: 3 };
    expect((await rateLimit("report:alice", policy)).allowed).toBe(true);
    expect((await rateLimit("report:alice", policy)).allowed).toBe(true);
    expect((await rateLimit("report:alice", policy)).allowed).toBe(true);
  });

  it("blocks a user who generates too many reports in a short period", async () => {
    const policy = { windowMs: 60_000, maxRequests: 2 };
    await rateLimit("report:bob", policy);
    await rateLimit("report:bob", policy);

    const third = await rateLimit("report:bob", policy);
    expect(third.allowed).toBe(false);
    expect(third.retryAfterMs).toBeGreaterThan(0);
  });

  it("allows the user to retry after the cooldown period elapses", async () => {
    const policy = { windowMs: 10_000, maxRequests: 1 };
    await rateLimit("report:carol", policy);
    expect((await rateLimit("report:carol", policy)).allowed).toBe(false);

    vi.advanceTimersByTime(11_000);
    expect((await rateLimit("report:carol", policy)).allowed).toBe(true);
  });

  it("does not let one user's activity affect another user", async () => {
    const policy = { windowMs: 60_000, maxRequests: 1 };
    await rateLimit("report:dave", policy);
    expect((await rateLimit("report:dave", policy)).allowed).toBe(false);
    expect((await rateLimit("report:eve", policy)).allowed).toBe(true);
  });

  it("tells the user roughly how long to wait before retrying", async () => {
    const policy = { windowMs: 30_000, maxRequests: 1 };
    await rateLimit("report:frank", policy);

    vi.advanceTimersByTime(10_000);
    const result = await rateLimit("report:frank", policy);
    expect(result.retryAfterMs).toBeLessThanOrEqual(20_000);
    expect(result.retryAfterMs).toBeGreaterThan(19_000);
  });
});
