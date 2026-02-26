import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { computeNextDue } from "./scheduling";

describe("scheduling the next pulse survey", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-01T12:00:00Z"));
  });

  afterEach(() => vi.useRealTimers());

  it("schedules a weekly pulse 7 days from now", () => {
    const next = computeNextDue("weekly");
    const diffDays = (next.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    expect(Math.round(diffDays)).toBe(7);
  });

  it("schedules a biweekly pulse 14 days from now", () => {
    const next = computeNextDue("biweekly");
    const diffDays = (next.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    expect(Math.round(diffDays)).toBe(14);
  });

  it("schedules a monthly pulse roughly one month from now", () => {
    const next = computeNextDue("monthly");
    expect(next.getMonth()).toBe(3); // April
    expect(next.getDate()).toBe(1);
  });

  it("schedules a quarterly pulse roughly three months from now", () => {
    const next = computeNextDue("quarterly");
    expect(next.getMonth()).toBe(5); // June
    expect(next.getDate()).toBe(1);
  });

  it("defaults to monthly when given an unknown frequency", () => {
    const next = computeNextDue("daily-is-not-supported");
    expect(next.getMonth()).toBe(3);
  });
});
