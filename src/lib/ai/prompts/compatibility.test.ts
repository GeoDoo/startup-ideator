import { describe, it, expect } from "vitest";
import { buildCompatibilityPrompt } from "./compatibility";
import { type ReportInput } from "../types";

describe("building the compatibility analysis prompt", () => {
  const input: ReportInput = {
    teamSize: 2,
    teamStage: "pre-seed",
    teamDomain: "fintech",
    partnerResponses: [
      {
        label: "Partner A",
        responses: {
          "identity-motivation": { vision: "Build a neobank", "risk-appetite": "high" },
          "working-style": { hours: "60+", conflict: "direct confrontation" },
        },
      },
      {
        label: "Partner B",
        responses: {
          "identity-motivation": { vision: "Disrupt payments", "risk-appetite": "medium" },
          "working-style": { hours: "40-50", conflict: "avoid until calm" },
        },
      },
    ],
  };

  it("never reveals real names — only anonymous labels appear", () => {
    const prompt = buildCompatibilityPrompt(input);
    expect(prompt).toContain("Partner A");
    expect(prompt).toContain("Partner B");
    expect(prompt).not.toContain("Alice");
    expect(prompt).not.toContain("Bob");
  });

  it("includes both partners' actual responses so the AI can compare them", () => {
    const prompt = buildCompatibilityPrompt(input);
    expect(prompt).toContain("Build a neobank");
    expect(prompt).toContain("Disrupt payments");
    expect(prompt).toContain("direct confrontation");
    expect(prompt).toContain("avoid until calm");
  });

  it("includes team context so the AI can tailor advice to the stage", () => {
    const prompt = buildCompatibilityPrompt(input);
    expect(prompt).toContain("pre-seed");
    expect(prompt).toContain("fintech");
    expect(prompt).toContain("2 partners");
  });

  it("asks for JSON output so we can parse it programmatically", () => {
    const prompt = buildCompatibilityPrompt(input);
    expect(prompt).toContain("JSON");
    expect(prompt).toContain("overallScore");
    expect(prompt).toContain("riskRadar");
  });

  it("handles missing stage and domain gracefully", () => {
    const minimal: ReportInput = {
      teamSize: 3,
      teamStage: null,
      teamDomain: null,
      partnerResponses: [
        { label: "Partner A", responses: { core: { q1: "answer" } } },
        { label: "Partner B", responses: { core: { q1: "answer" } } },
        { label: "Partner C", responses: { core: { q1: "answer" } } },
      ],
    };
    const prompt = buildCompatibilityPrompt(minimal);
    expect(prompt).toContain("Not specified");
    expect(prompt).toContain("3 partners");
  });
});
