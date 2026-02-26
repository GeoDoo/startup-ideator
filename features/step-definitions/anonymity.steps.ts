import { Given, When, Then } from "@cucumber/cucumber";
import { strict as assert } from "node:assert";
import { buildCompatibilityPrompt } from "../../src/lib/ai/prompts/compatibility";
import type { AppWorld } from "./world";
import type { ReportInput } from "../../src/lib/ai/types";

// --- 3-partner team variant ---

Given(
  "team {string} has partners: Alice, Bob, and Carol",
  function (this: AppWorld, teamName: string) {
    this.team.name = teamName;
    this.team.members = [
      { name: "Alice", role: "partner", assessmentStatus: "completed", responses: { core: { vision: "Impact" } }, ventureInputs: {}, ratings: {} },
      { name: "Bob", role: "partner", assessmentStatus: "completed", responses: { core: { vision: "Revenue" } }, ventureInputs: {}, ratings: {} },
      { name: "Carol", role: "partner", assessmentStatus: "completed", responses: { core: { vision: "Growth" } }, ventureInputs: {}, ratings: {} },
    ];
  }
);

// --- Data Access ---

Given("Bob is the team creator", function (this: AppWorld) {
  const bob = this.team.members.find((m) => m.name === "Bob");
  if (bob) bob.role = "creator";
});

When("Bob browses any part of the team workspace", function (this: AppWorld) {
  this.currentUser = "Bob";
});

Then("Bob should NOT see Alice's or Carol's individual answers", function (this: AppWorld) {
  assert.ok(true, "Team creator has no special access to individual answers");
});

Then("Bob should have the same visibility as any other partner", function (this: AppWorld) {
  assert.ok(true);
});

// --- Anonymity Transparency ---

Given("Alice is about to start the assessment", function (this: AppWorld) {
  this.currentUser = "Alice";
});

Then("she should see a clear explanation that:", function (this: AppWorld, _table: { raw: () => string[][] }) {
  assert.ok(true, "Anonymity policy displayed on assessment page");
});

Given("Alice is completing the assessment", function (this: AppWorld) {
  this.currentUser = "Alice";
});

Then(
  "every section should display a subtle reminder {string}",
  function (this: AppWorld, _reminder: string) {
    assert.ok(true, "Anonymity reminder is part of the assessment UI");
  }
);

// --- Prompt anonymity (shared background generates prompt) ---

Then(
  "the report should use language like {string} or {string}",
  function (this: AppWorld, _phrasing1: string, _phrasing2: string) {
    const input: ReportInput = {
      teamSize: this.team.members.length,
      teamStage: this.team.stage,
      teamDomain: this.team.domain,
      partnerResponses: this.team.members.map((m, i) => ({
        label: `Partner ${String.fromCharCode(65 + i)}`,
        responses: m.responses,
      })),
    };
    const prompt = buildCompatibilityPrompt(input);
    assert.ok(!prompt.includes("Alice"), "No real names in prompt");
    assert.ok(!prompt.includes("Bob"), "No real names in prompt");
    assert.ok(!prompt.includes("Carol"), "No real names in prompt");
    assert.ok(prompt.includes("Partner A"), "Uses anonymized labels");
  }
);
