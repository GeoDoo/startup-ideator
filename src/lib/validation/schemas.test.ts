import { describe, it, expect } from "vitest";
import {
  compatibilityReportSchema,
  reportScoresSchema,
  ventureInputResponsesSchema,
} from "./schemas";

const VALID_REPORT = {
  summary: "A strong partnership",
  overallScore: 82,
  archetype: {
    name: "Complementary Builders",
    description: "Partners who excel at different things",
    strengths: ["Diverse skills", "Balanced perspectives"],
    watchOuts: ["Communication gaps"],
  },
  alignmentMap: [
    { dimension: "Vision", score: 90, summary: "Well aligned", details: "Both want to build products" },
  ],
  riskRadar: [
    { risk: "Burnout", severity: "medium" as const, description: "High intensity", mitigation: "Set boundaries" },
  ],
  blindSpots: [
    { area: "Market validation", description: "Neither has done it", category: "Experience" },
  ],
  recommendations: [
    { priority: 1, title: "Define roles", description: "Clarify who owns what", timeframe: "Week 1" },
  ],
  scores: [
    { dimension: "Vision", score: 90, maxScore: 100 },
  ],
};

describe("validating AI-generated compatibility reports", () => {
  it("accepts a well-formed report from the AI", () => {
    expect(compatibilityReportSchema.safeParse(VALID_REPORT).success).toBe(true);
  });

  it("rejects a report when the AI omits the summary", () => {
    const { summary, ...broken } = VALID_REPORT;
    void summary;
    expect(compatibilityReportSchema.safeParse(broken).success).toBe(false);
  });

  it("rejects a report when the AI returns a score above 100", () => {
    const result = compatibilityReportSchema.safeParse({ ...VALID_REPORT, overallScore: 150 });
    expect(result.success).toBe(false);
  });

  it("rejects a report when the AI invents a severity level", () => {
    const result = compatibilityReportSchema.safeParse({
      ...VALID_REPORT,
      riskRadar: [{ risk: "X", severity: "extreme", description: "Bad", mitigation: "Fix" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects completely malformed AI output (e.g. a string)", () => {
    expect(compatibilityReportSchema.safeParse("I'm sorry, I can't help with that").success).toBe(false);
  });
});

describe("validating report scores read from the database", () => {
  it("accepts a valid scores array for trend charting", () => {
    const result = reportScoresSchema.safeParse([
      { dimension: "Vision", score: 85 },
      { dimension: "Skills", score: 72 },
    ]);
    expect(result.success).toBe(true);
  });

  it("rejects corrupted score data missing the dimension name", () => {
    expect(reportScoresSchema.safeParse([{ score: 85 }]).success).toBe(false);
  });

  it("falls back gracefully when scores field is not an array", () => {
    expect(reportScoresSchema.safeParse("null").success).toBe(false);
  });
});

describe("validating venture input responses from the database", () => {
  it("accepts the nested section/question response structure", () => {
    const result = ventureInputResponsesSchema.safeParse({
      passions: { "personal-passions": "AI and robotics" },
      problems: { "problem-spaces": ["healthcare", "education"] },
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty response object for a fresh input", () => {
    expect(ventureInputResponsesSchema.safeParse({}).success).toBe(true);
  });

  it("rejects a primitive where a response object is expected", () => {
    expect(ventureInputResponsesSchema.safeParse("not an object").success).toBe(false);
  });
});
