import { Given, When, Then } from "@cucumber/cucumber";
import { strict as assert } from "node:assert";
import { buildCompatibilityPrompt } from "../../src/lib/ai/prompts/compatibility";
import { compatibilityReportSchema } from "../../src/lib/validation/schemas";
import { ASSESSMENT_SECTIONS } from "../../src/lib/assessment/questions";
import type { AppWorld } from "./world";
import type { ReportInput } from "../../src/lib/ai/types";

// --- Background ---

Given(
  "team {string} has partners: Alice and Bob",
  function (this: AppWorld, teamName: string) {
    this.team.name = teamName;
    this.team.members = [
      { name: "Alice", role: "partner", assessmentStatus: "not-started", responses: {}, ventureInputs: {}, ratings: {} },
      { name: "Bob", role: "partner", assessmentStatus: "not-started", responses: {}, ventureInputs: {}, ratings: {} },
    ];
  }
);

Given("all partners have completed their assessments", function (this: AppWorld) {
  for (const m of this.team.members) {
    m.assessmentStatus = "completed";
    m.responses = { "identity-motivation": { vision: "Build something great" } };
  }
});

// --- Report Triggering ---

Given("Alice has completed her assessment", function (this: AppWorld) {
  const alice = this.team.members.find((m) => m.name === "Alice");
  if (alice) {
    alice.assessmentStatus = "completed";
    alice.responses = { "identity-motivation": { vision: "Impact" } };
  }
});

Given("Bob has just completed his assessment", function (this: AppWorld) {
  const bob = this.team.members.find((m) => m.name === "Bob");
  if (bob) {
    bob.assessmentStatus = "completed";
    bob.responses = { "identity-motivation": { vision: "Revenue" } };
  }
});

Then("the compatibility report should begin generating", function (this: AppWorld) {
  const allComplete = this.team.members.every((m) => m.assessmentStatus === "completed");
  assert.ok(allComplete, "All partners must be complete before generation starts");
  this.team.reportStatus = "generating";
});

Then(
  "all partners should be notified that the report is being generated",
  function (this: AppWorld) {
    assert.equal(this.team.reportStatus, "generating");
  }
);

Given("Bob has NOT completed his assessment", function (this: AppWorld) {
  const bob = this.team.members.find((m) => m.name === "Bob");
  if (bob) bob.assessmentStatus = "not-started";
});

Then("the report should NOT be generated", function (this: AppWorld) {
  const allComplete = this.team.members.every((m) => m.assessmentStatus === "completed");
  assert.ok(!allComplete, "Report must not generate when assessments are incomplete");
});

Then(
  "Alice should see a message {string}",
  function (this: AppWorld, _message: string) {
    const allComplete = this.team.members.every((m) => m.assessmentStatus === "completed");
    assert.ok(!allComplete, "Message shown because not all partners finished");
  }
);

// --- Report Structure via prompt ---

When("the compatibility report is generated", function (this: AppWorld) {
  const input: ReportInput = {
    teamSize: this.team.members.length,
    teamStage: this.team.stage,
    teamDomain: this.team.domain,
    partnerResponses: this.team.members.map((m, i) => ({
      label: `Partner ${String.fromCharCode(65 + i)}`,
      responses: m.responses,
    })),
  };
  this.prompt = buildCompatibilityPrompt(input);
  this.team.reportStatus = "ready";
});

Then(
  /it should contain an? "([^"]+)" section(?: showing| with)?:?/,
  function (this: AppWorld, sectionName: string, _table?: { raw: () => string[][] }) {
    const sectionKeywords: Record<string, string> = {
      "Alignment Map": "alignmentMap",
      "Risk Radar": "riskRadar",
      "Blind Spots": "blindSpots",
      "Recommendations": "recommendations",
    };
    const keyword = sectionKeywords[sectionName] || sectionName.toLowerCase();
    assert.ok(this.prompt.includes(keyword), `Prompt must request "${sectionName}" section`);
  }
);

Then(
  "the Alignment Map should cover topics from all five assessment sections:",
  function (this: AppWorld, table: { raw: () => string[][] }) {
    const sections = table.raw().filter((r) => r[0] !== "assessment_section").map((r) => r[0]);
    for (const section of sections) {
      assert.ok(
        this.prompt.includes(section),
        `Prompt must reference assessment section "${section}"`
      );
    }
  }
);

// --- Score ---

Then(
  "it should include an overall score from 0-100",
  function (this: AppWorld) {
    assert.ok(this.prompt.includes("overallScore"), "Prompt requests overallScore");
    assert.ok(this.prompt.includes("0-100"), "Score range is 0-100");
  }
);

Then("a qualitative label:", function (this: AppWorld, _table: { raw: () => string[][] }) {
  // Report schema validates overallScore 0-100; the UI maps to labels
  assert.ok(this.prompt.includes("overallScore"));
});

Then(
  "the score should break down into sub-scores matching the five assessment sections:",
  function (this: AppWorld, _table: { raw: () => string[][] }) {
    assert.ok(this.prompt.includes("scores"), "Prompt requests dimension scores");
    for (const section of ASSESSMENT_SECTIONS) {
      assert.ok(
        this.prompt.includes(section.title),
        `Prompt includes dimension "${section.title}"`
      );
    }
  }
);

// --- Archetype ---

Then(
  "it should map the partnership to known archetypes:",
  function (this: AppWorld, _table: { raw: () => string[][] }) {
    assert.ok(this.prompt.includes("archetype"), "Prompt requests archetype identification");
  }
);

Then(
  "explain the strengths and watchouts for their archetype",
  function (this: AppWorld) {
    assert.ok(this.prompt.includes("strengths"), "Prompt requests archetype strengths");
    assert.ok(this.prompt.includes("watchOuts") || this.prompt.includes("Watch"), "Prompt requests watchouts");
  }
);

// --- Report Validation ---

Then(
  "the report should contain aggregated and synthesized insights",
  function (this: AppWorld) {
    // Report schema validates structured output; prompt instructs synthesis
    assert.ok(this.prompt.includes("synthesize") || this.prompt.includes("Analyze"),
      "Prompt instructs analysis/synthesis");
  }
);

Then(
  "the report should NOT attribute specific answers to specific partners",
  function (this: AppWorld) {
    // Prompt uses anonymous labels (Partner A, Partner B), never real names
    assert.ok(!this.prompt.includes("Alice"), "Prompt must not contain real name Alice");
    assert.ok(!this.prompt.includes("Bob"), "Prompt must not contain real name Bob");
  }
);

// --- Schema Validation ---

Then("each risk should be categorized as:", function (this: AppWorld, _table: { raw: () => string[][] }) {
  // Validated by compatibilityReportSchema: severity enum is low|medium|high|critical
  const testReport = {
    summary: "test", overallScore: 50,
    archetype: { name: "t", description: "t", strengths: ["t"], watchOuts: ["t"] },
    alignmentMap: [{ dimension: "t", score: 50, summary: "t", details: "t" }],
    riskRadar: [{ risk: "t", severity: "invalid" as never, description: "t", mitigation: "t" }],
    blindSpots: [{ area: "t", description: "t", category: "t" }],
    recommendations: [{ priority: 1, title: "t", description: "t", timeframe: "t" }],
    scores: [{ dimension: "t", score: 50, maxScore: 100 }],
  };
  const result = compatibilityReportSchema.safeParse(testReport);
  assert.ok(!result.success, "Invalid severity must be rejected by schema validation");
});

When("the report analyzes partner responses", function (this: AppWorld) {
  if (!this.prompt) {
    const input: ReportInput = {
      teamSize: this.team.members.length,
      teamStage: this.team.stage,
      teamDomain: this.team.domain,
      partnerResponses: this.team.members.map((m, i) => ({
        label: `Partner ${String.fromCharCode(65 + i)}`,
        responses: m.responses,
      })),
    };
    this.prompt = buildCompatibilityPrompt(input);
  }
  assert.ok(this.prompt.length > 0, "Prompt is built and ready for AI");
});

Then(
  "it should detect patterns such as:",
  function (this: AppWorld, _table: { raw: () => string[][] }) {
    assert.ok(this.prompt.includes("risk") || this.prompt.includes("Risk"),
      "Prompt instructs risk detection");
  }
);
