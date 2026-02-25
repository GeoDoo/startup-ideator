interface VenturePromptInput {
  teamSize: number;
  teamStage: string | null;
  teamDomain: string | null;
  partnerInputs: { label: string; responses: Record<string, Record<string, unknown>> }[];
}

export function buildVenturePrompt(input: VenturePromptInput): string {
  const { teamSize, teamStage, teamDomain, partnerInputs } = input;

  const partnerData = partnerInputs
    .map((p) => {
      const sections = Object.entries(p.responses)
        .map(([section, answers]) => {
          const lines = Object.entries(answers)
            .map(([key, val]) => `  ${key}: ${JSON.stringify(val)}`)
            .join("\n");
          return `[${section}]\n${lines}`;
        })
        .join("\n\n");
      return `--- ${p.label} ---\n${sections}`;
    })
    .join("\n\n");

  return `You are an expert venture strategist and startup idea generator.

Based on the following team profile and preferences from ${teamSize} co-founders, generate 15 unique startup ideas that are specifically tailored to this team's combined skills, interests, and constraints.

TEAM CONTEXT:
- Team size: ${teamSize}
- Stage: ${teamStage || "Pre-idea"}
- Domain focus: ${teamDomain || "Open"}

PARTNER VENTURE INPUTS:
${partnerData}

REQUIREMENTS:
1. Generate exactly 15 venture candidates
2. Ensure diversity across:
   - Risk levels (mix of low, medium, high)
   - Revenue timelines (some quick revenue, some longer horizon)
   - Industries (at least 5 different industries)
   - Business models (variety of models)
3. Each idea must score the team-fit honestly (0-100)
4. Ideas should leverage the team's SPECIFIC skills and interests
5. Respect anti-preferences — do NOT suggest things partners want to avoid

OUTPUT FORMAT:
Return a JSON array of exactly 15 objects, each with:
{
  "problem": "Clear problem statement (2-3 sentences)",
  "solution": "Proposed solution (2-3 sentences)",
  "customer": "Target customer description",
  "businessModel": "Revenue model and pricing approach",
  "marketOpportunity": "Market size and growth potential",
  "competitiveLandscape": "Key competitors and differentiation",
  "teamFitScore": <0-100>,
  "feasibility": "Why this team can build this (or challenges)",
  "first90Days": "Concrete first 90 days action plan",
  "revenueTimeline": "When and how revenue starts",
  "riskLevel": "low|medium|high",
  "industry": "Primary industry/sector"
}

Respond with ONLY the JSON array, no markdown or code blocks.`;
}
