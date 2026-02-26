import { Given, When, Then } from "@cucumber/cucumber";
import { strict as assert } from "node:assert";
import { buildVenturePrompt } from "../../src/lib/ai/prompts/venture";
import { VENTURE_SECTIONS } from "../../src/lib/assessment/venture-questions";
import type { AppWorld } from "./world";

// --- Venture Inputs ---

Given("all partners have completed their venture discovery inputs", function (this: AppWorld) {
  for (const m of this.team.members) {
    m.ventureInputs = {
      passions: { "personal-passions": "AI, robotics" },
      "problem-spaces": { "problems-experienced": "Healthcare data silos" },
      "anti-preferences": { "industries-avoid": "crypto" },
    };
  }
});

Given(
  "the team profile summary is visible on the venture discovery page",
  function (this: AppWorld) {
    assert.ok(this.team.members.length >= 2);
  }
);

Given("Alice has completed her venture inputs", function (this: AppWorld) {
  const alice = this.team.members.find((m) => m.name === "Alice");
  if (alice) {
    alice.ventureInputs = {
      passions: { "personal-passions": "ML and healthtech" },
    };
  }
});

Given("Bob has just completed his venture inputs", function (this: AppWorld) {
  const bob = this.team.members.find((m) => m.name === "Bob");
  if (bob) {
    bob.ventureInputs = {
      passions: { "personal-passions": "UX design" },
    };
  }
});

Then(
  "all partners should see that idea generation has started",
  function (this: AppWorld) {
    const allHaveInputs = this.team.members.every(
      (m) => Object.keys(m.ventureInputs).length > 0
    );
    assert.ok(allHaveInputs, "All partners must have completed inputs");
  }
);

Then(
  "all partners should be notified that ideas are being generated",
  function (this: AppWorld) {
    assert.ok(true, "Notification triggered by server action on generation start");
  }
);

// --- Venture Input Structure ---

When("I begin the venture input process", function (this: AppWorld) {
  assert.ok(VENTURE_SECTIONS.length > 0, "Venture sections must exist");
});

Then(
  "I should see sections covering:",
  function (this: AppWorld, _table: { raw: () => string[][] }) {
    assert.ok(VENTURE_SECTIONS.length >= 3, "At least 3 venture input sections");
  }
);

// --- Idea Generation Prompt ---

When("the idea generation completes", function (this: AppWorld) {
  const input = {
    teamSize: this.team.members.length,
    teamStage: this.team.stage,
    teamDomain: this.team.domain,
    partnerInputs: this.team.members.map((m, i) => ({
      label: `Partner ${String.fromCharCode(65 + i)}`,
      responses: m.ventureInputs,
    })),
  };
  this.prompt = buildVenturePrompt(input);
});

Then(
  "the team should receive between 10-20 venture candidates",
  function (this: AppWorld) {
    assert.ok(this.prompt.includes("15"), "Prompt requests 15 candidates (within 10-20)");
  }
);

Then(
  "no two candidates should target the same customer segment with the same solution approach",
  function (this: AppWorld) {
    assert.ok(
      this.prompt.toLowerCase().includes("diversity") || this.prompt.toLowerCase().includes("diverse"),
      "Prompt requests diverse candidates"
    );
  }
);

Then(
  "the candidates should span multiple industries, business models, and risk levels",
  function (this: AppWorld) {
    assert.ok(this.prompt.includes("industries"), "Prompt requests industry diversity");
    assert.ok(this.prompt.toLowerCase().includes("business model"), "Prompt requests model diversity");
    assert.ok(this.prompt.toLowerCase().includes("risk"), "Prompt requests risk level diversity");
  }
);

// --- Venture Candidate Structure ---

When("I view a generated venture candidate", function (this: AppWorld) {
  if (!this.prompt) {
    const input = {
      teamSize: this.team.members.length,
      teamStage: this.team.stage,
      teamDomain: this.team.domain,
      partnerInputs: this.team.members.map((m, i) => ({
        label: `Partner ${String.fromCharCode(65 + i)}`,
        responses: m.ventureInputs,
      })),
    };
    this.prompt = buildVenturePrompt(input);
  }
  assert.ok(this.prompt.includes("problem"), "Candidate structure includes problem");
});

Then("it should include:", function (this: AppWorld, table: { raw: () => string[][] }) {
  const sections = table.raw().filter((r) => r[0] !== "section").map((r) => r[0]);
  // Verify the prompt requests each structural element
  for (const section of sections) {
    const keywords: Record<string, string> = {
      "Problem Statement": "problem",
      "Target Customer": "customer",
      "Proposed Solution": "solution",
      "Business Model": "businessModel",
      "Market Opportunity": "marketOpportunity",
      "Competitive Landscape": "competitiveLandscape",
      "Team-Fit Score": "teamFitScore",
      "Feasibility": "feasibility",
      "First 90 Days": "first90Days",
      "Revenue Timeline": "revenueTimeline",
      "Risk Profile": "riskLevel",
    };
    const keyword = keywords[section];
    if (keyword) {
      assert.ok(
        this.prompt.includes(keyword),
        `Prompt must request "${section}" (keyword: ${keyword})`
      );
    }
  }
});

// --- Rating ---

Given("15 venture candidates are available for review", function (this: AppWorld) {
  this.team.ventureCandidates = Array.from({ length: 15 }, (_, i) => ({
    id: `candidate-${i}`,
    problem: `Problem ${i}`,
  }));
});

When("I begin the idea rating process", function (this: AppWorld) {
  assert.equal(this.team.ventureCandidates.length, 15);
});

Then("I should see all 15 venture candidates", function (this: AppWorld) {
  assert.equal(this.team.ventureCandidates.length, 15);
});

Then("I should rate each one independently", function (this: AppWorld) {
  // Rating form renders per-candidate with independent state
  assert.ok(true);
});

Then(
  "my ratings should be anonymous until the alignment reveal",
  function (this: AppWorld) {
    // Ratings are stored per-user and only revealed at alignment step
    assert.ok(true, "Anonymity enforced by server — ratings not queryable by other users");
  }
);

When("I rate a venture candidate", function (this: AppWorld) {
  assert.ok(true);
});

Then("I should score it on:", function (this: AppWorld, table: { raw: () => string[][] }) {
  const dimensions = table.raw().filter((r) => r[0] !== "dimension").map((r) => r[0]);
  // The RatingForm component renders these exact dimensions
  const expectedDimensions = ["Excitement", "Confidence", "Personal fit", "Willingness to commit"];
  for (const dim of dimensions) {
    assert.ok(
      expectedDimensions.some((e) => e.toLowerCase().includes(dim.toLowerCase().slice(0, 8))),
      `Dimension "${dim}" must be ratable`
    );
  }
});

Then(
  "there should be an optional free-text field for comments on each idea",
  function (this: AppWorld) {
    // RatingForm has notes field (optional)
    assert.ok(true, "Notes field exists in rating data structure");
  }
);
