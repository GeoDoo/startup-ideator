import { describe, it, expect } from "vitest";
import { VENTURE_SECTIONS } from "./venture-questions";

describe("venture input questions can be rendered by the venture input engine", () => {
  it("covers passions, problem spaces, and anti-preferences so the AI has enough signal", () => {
    const keys = VENTURE_SECTIONS.map((s) => s.key);
    expect(keys).toContain("passions");
    expect(keys).toContain("problem-spaces");
    expect(keys).toContain("anti-preferences");
  });

  it("provides at least two options for every select question", () => {
    const selects = VENTURE_SECTIONS.flatMap((s) =>
      s.questions.filter((q) => q.options)
    );
    for (const q of selects) {
      expect(q.options!.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("gives every question a label so the form renders text for each field", () => {
    for (const section of VENTURE_SECTIONS) {
      for (const q of section.questions) {
        expect(q.label.length).toBeGreaterThan(0);
      }
    }
  });

  it("gives every section a description so users understand the context", () => {
    for (const section of VENTURE_SECTIONS) {
      expect(section.title.length).toBeGreaterThan(0);
      expect(section.description.length).toBeGreaterThan(0);
    }
  });
});
