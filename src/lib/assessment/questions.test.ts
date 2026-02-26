import { describe, it, expect } from "vitest";
import { ASSESSMENT_SECTIONS } from "./questions";

describe("assessment questions can be rendered by the assessment engine", () => {
  it("covers all five partnership dimensions so nothing is missed", () => {
    const keys = ASSESSMENT_SECTIONS.map((s) => s.key);
    expect(keys).toContain("identity-motivation");
    expect(keys).toContain("working-style");
    expect(keys).toContain("skills-capabilities");
    expect(keys).toContain("structural-practical");
    expect(keys).toContain("relationship-trust");
  });

  it("provides min and max for every slider so the range input can render", () => {
    const sliders = ASSESSMENT_SECTIONS.flatMap((s) =>
      s.questions.filter((q) => q.type === "slider")
    );
    expect(sliders.length).toBeGreaterThan(0);
    for (const q of sliders) {
      expect(q.min).toBeDefined();
      expect(q.max).toBeDefined();
      expect(q.max!).toBeGreaterThan(q.min!);
    }
  });

  it("provides at least two options for every select question so users have a choice", () => {
    const selects = ASSESSMENT_SECTIONS.flatMap((s) =>
      s.questions.filter((q) => q.type === "single-select" || q.type === "multi-select")
    );
    expect(selects.length).toBeGreaterThan(0);
    for (const q of selects) {
      expect(q.options!.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("provides scenarios for every scenario question so the prompt can render", () => {
    const scenarioQs = ASSESSMENT_SECTIONS.flatMap((s) =>
      s.questions.filter((q) => q.type === "scenario")
    );
    expect(scenarioQs.length).toBeGreaterThan(0);
    for (const q of scenarioQs) {
      expect(q.scenarios!.length).toBeGreaterThan(0);
    }
  });

  it("provides left/right labels for every spectrum question", () => {
    const spectrumQs = ASSESSMENT_SECTIONS.flatMap((s) =>
      s.questions.filter((q) => q.type === "spectrum")
    );
    expect(spectrumQs.length).toBeGreaterThan(0);
    for (const q of spectrumQs) {
      expect(q.spectrums!.length).toBeGreaterThan(0);
      for (const sp of q.spectrums!) {
        expect(sp.left).toBeTruthy();
        expect(sp.right).toBeTruthy();
      }
    }
  });

  it("gives every question a user-facing label so the form isn't blank", () => {
    for (const section of ASSESSMENT_SECTIONS) {
      for (const q of section.questions) {
        expect(q.label.length).toBeGreaterThan(0);
      }
    }
  });
});
