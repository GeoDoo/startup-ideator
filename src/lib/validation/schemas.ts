import { z } from "zod";

export const compatibilityReportSchema = z.object({
  summary: z.string(),
  overallScore: z.number().min(0).max(100),
  archetype: z.object({
    name: z.string(),
    description: z.string(),
    strengths: z.array(z.string()),
    watchOuts: z.array(z.string()),
  }),
  alignmentMap: z.array(
    z.object({
      dimension: z.string(),
      score: z.number(),
      summary: z.string(),
      details: z.string(),
    })
  ),
  riskRadar: z.array(
    z.object({
      risk: z.string(),
      severity: z.enum(["low", "medium", "high", "critical"]),
      description: z.string(),
      mitigation: z.string(),
    })
  ),
  blindSpots: z.array(
    z.object({
      area: z.string(),
      description: z.string(),
      category: z.string(),
    })
  ),
  recommendations: z.array(
    z.object({
      priority: z.number(),
      title: z.string(),
      description: z.string(),
      timeframe: z.string(),
    })
  ),
  scores: z.array(
    z.object({
      dimension: z.string(),
      score: z.number(),
      maxScore: z.number(),
    })
  ),
});

export const reportScoresSchema = z.array(
  z.object({
    dimension: z.string(),
    score: z.number(),
  })
);

export const ventureInputResponsesSchema = z.record(
  z.string(),
  z.record(z.string(), z.unknown())
);

export const ventureSelectionAnalysisSchema = z.object({
  deepAnalysis: z.unknown().nullable().optional(),
  actionPlan: z.unknown().nullable().optional(),
});

export type ValidatedCompatibilityReport = z.infer<typeof compatibilityReportSchema>;
