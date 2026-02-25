export interface CompatibilityReport {
  summary: string;
  overallScore: number;
  archetype: {
    name: string;
    description: string;
    strengths: string[];
    watchOuts: string[];
  };
  alignmentMap: {
    dimension: string;
    score: number;
    summary: string;
    details: string;
  }[];
  riskRadar: {
    risk: string;
    severity: "low" | "medium" | "high" | "critical";
    description: string;
    mitigation: string;
  }[];
  blindSpots: {
    area: string;
    description: string;
    category: string;
  }[];
  recommendations: {
    priority: number;
    title: string;
    description: string;
    timeframe: string;
  }[];
  scores: {
    dimension: string;
    score: number;
    maxScore: number;
  }[];
}

export interface VentureCandidateData {
  problem: string;
  solution: string;
  customer: string;
  businessModel: string;
  marketOpportunity: string;
  competitiveLandscape: string;
  teamFitScore: number;
  feasibility: string;
  first90Days: string;
  revenueTimeline: string;
  riskLevel: string;
  industry: string;
}

export interface AIProvider {
  generateCompatibilityReport(input: ReportInput): Promise<CompatibilityReport>;
  generateVentureCandidates(prompt: string): Promise<VentureCandidateData[]>;
}

export interface ReportInput {
  teamSize: number;
  teamStage: string | null;
  teamDomain: string | null;
  partnerResponses: AnonymizedPartnerResponse[];
}

export interface AnonymizedPartnerResponse {
  label: string;
  responses: Record<string, Record<string, unknown>>;
}
