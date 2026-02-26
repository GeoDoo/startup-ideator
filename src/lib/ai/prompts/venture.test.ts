import { describe, it, expect } from "vitest";
import { buildVenturePrompt } from "./venture";

describe("building the venture idea generation prompt", () => {
  const input = {
    teamSize: 2,
    teamStage: "idea" as string | null,
    teamDomain: "healthtech" as string | null,
    partnerInputs: [
      {
        label: "Partner A",
        responses: {
          passions: { "personal-passions": "ML, running, health tracking" },
          constraints: { budget: "bootstrapped", "anti-preferences": "no crypto" },
        },
      },
      {
        label: "Partner B",
        responses: {
          passions: { "personal-passions": "UX design, mental health" },
          constraints: { budget: "small angel round", "anti-preferences": "no hardware" },
        },
      },
    ],
  };

  it("feeds each partner's passions into the prompt so ideas reflect the team", () => {
    const prompt = buildVenturePrompt(input);
    expect(prompt).toContain("ML, running, health tracking");
    expect(prompt).toContain("UX design, mental health");
  });

  it("includes anti-preferences so the AI can avoid unwanted directions", () => {
    const prompt = buildVenturePrompt(input);
    expect(prompt).toContain("no crypto");
    expect(prompt).toContain("no hardware");
  });

  it("requests exactly 15 diverse venture candidates", () => {
    const prompt = buildVenturePrompt(input);
    expect(prompt).toContain("15");
    expect(prompt).toMatch(/diversity|diverse/i);
  });

  it("asks for structured JSON so we can store and rate each idea", () => {
    const prompt = buildVenturePrompt(input);
    expect(prompt).toContain("JSON");
    expect(prompt).toContain("problem");
    expect(prompt).toContain("solution");
    expect(prompt).toContain("teamFitScore");
  });

  it("defaults to 'Pre-idea' and 'Open' when stage/domain are null", () => {
    const minimal = { ...input, teamStage: null, teamDomain: null };
    const prompt = buildVenturePrompt(minimal);
    expect(prompt).toContain("Pre-idea");
    expect(prompt).toContain("Open");
  });
});
