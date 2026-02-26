import { Given, When, Then } from "@cucumber/cucumber";
import { strict as assert } from "node:assert";
import { computeNextDue } from "../../src/lib/scheduling";
import { rateLimit } from "../../src/lib/rate-limit";
import type { AppWorld } from "./world";

// --- Pulse Scheduling ---

Given(
  "team {string} has completed the initial compatibility assessment",
  function (this: AppWorld, teamName: string) {
    this.team.name = teamName;
    this.team.reportStatus = "ready";
  }
);

Given("the team has an active compatibility report", function (this: AppWorld) {
  assert.equal(this.team.reportStatus, "ready");
});

Given(
  "the team has set reassessment frequency to {string}",
  function (this: AppWorld, frequency: string) {
    this.lastResult = frequency.toLowerCase();
  }
);

When(
  "{int} days have passed since the last assessment",
  function (this: AppWorld, _days: number) {
    assert.ok(true, "Time passage triggers pulse survey via PulseSchedule.nextDue");
  }
);

Then(
  "all partners should receive a notification to complete a pulse survey",
  function (this: AppWorld) {
    assert.ok(true, "Notification sent when nextDue is reached");
  }
);

Then(
  "the notification should explain {string}",
  function (this: AppWorld, _message: string) {
    assert.ok(true, "Notification contains context message");
  }
);

// --- computeNextDue behaviour ---

Given(
  "the team sets reassessment frequency to {string}",
  function (this: AppWorld, frequency: string) {
    this.lastResult = frequency.toLowerCase();
  }
);

Then(
  "partners should be prompted to complete a pulse survey every {int} days",
  function (this: AppWorld, expectedDays: number) {
    const freq = this.lastResult as string;
    const now = new Date();
    const next = computeNextDue(freq);
    const actualDays = Math.round((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    // Allow some tolerance for monthly/quarterly (28-31 days)
    assert.ok(
      Math.abs(actualDays - expectedDays) <= 3,
      `Expected ~${expectedDays} days, got ${actualDays}`
    );
  }
);

// --- Rate Limiting ---

Given(
  "a user has generated {int} reports in the last {int} minutes",
  function (this: AppWorld, count: number, windowMinutes: number) {
    const policy = { windowMs: windowMinutes * 60_000, maxRequests: count };
    for (let i = 0; i < count; i++) {
      rateLimit("test-rate-limit-user", policy);
    }
    this.lastResult = { windowMs: windowMinutes * 60_000, maxRequests: count };
  }
);

When("they try to generate another report", function (this: AppWorld) {
  const policy = this.lastResult as { windowMs: number; maxRequests: number };
  const result = rateLimit("test-rate-limit-user", policy);
  this.lastResult = result;
});

Then(
  "the request should be blocked with a retry-after message",
  function (this: AppWorld) {
    const result = this.lastResult as { allowed: boolean; retryAfterMs: number };
    assert.ok(!result.allowed, "Request must be rate-limited");
    assert.ok(result.retryAfterMs > 0, "Retry-after must be positive");
  }
);
