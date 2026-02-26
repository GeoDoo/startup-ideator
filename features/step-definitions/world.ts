import { setWorldConstructor, World } from "@cucumber/cucumber";

export interface TeamMember {
  name: string;
  role: string;
  assessmentStatus: "not-started" | "in-progress" | "completed";
  responses: Record<string, Record<string, unknown>>;
  ventureInputs: Record<string, Record<string, unknown>>;
  ratings: Record<string, number>;
}

export interface TeamContext {
  name: string;
  stage: string | null;
  domain: string | null;
  members: TeamMember[];
  reportStatus: "none" | "generating" | "ready" | "failed";
  reportContent: unknown;
  ventureCandidates: unknown[];
}

export class AppWorld extends World {
  team: TeamContext = {
    name: "",
    stage: null,
    domain: null,
    members: [],
    reportStatus: "none",
    reportContent: null,
    ventureCandidates: [],
  };

  currentUser: string = "";
  lastError: string | null = null;
  lastResult: unknown = null;
  prompt: string = "";
}

setWorldConstructor(AppWorld);
