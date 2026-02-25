import { type ReportInput } from "../types";

export function buildCompatibilityPrompt(input: ReportInput): string {
  const { teamSize, teamStage, teamDomain, partnerResponses } = input;

  const partnerData = partnerResponses
    .map((p) => {
      const sections = Object.entries(p.responses)
        .map(([section, answers]) => {
          const answerLines = Object.entries(answers)
            .map(([key, val]) => `  ${key}: ${JSON.stringify(val)}`)
            .join("\n");
          return `[${section}]\n${answerLines}`;
        })
        .join("\n\n");
      return `--- ${p.label} ---\n${sections}`;
    })
    .join("\n\n");

  return `You are an expert startup partnership advisor with deep expertise in co-founder dynamics, organizational psychology, and venture building.

Analyze the following assessment responses from ${teamSize} co-founder candidates and produce a comprehensive compatibility report.

CONTEXT:
- Team size: ${teamSize} partners
- Stage: ${teamStage || "Not specified"}
- Domain: ${teamDomain || "Not specified"}

PARTNER ASSESSMENT RESPONSES:
${partnerData}

INSTRUCTIONS:
Produce a JSON object with the following structure. Be specific, actionable, and cite concrete evidence from the responses.

{
  "summary": "2-3 sentence executive summary of the partnership compatibility",
  "overallScore": <number 0-100>,
  "archetype": {
    "name": "Partnership archetype name (e.g., 'Visionary + Operator', 'Technical Twins', 'Complementary Builders')",
    "description": "1-2 sentences describing this archetype",
    "strengths": ["strength1", "strength2", "strength3"],
    "watchOuts": ["watchout1", "watchout2"]
  },
  "alignmentMap": [
    {
      "dimension": "Identity & Motivation",
      "score": <0-100>,
      "summary": "One-line summary",
      "details": "Detailed analysis paragraph"
    },
    { "dimension": "Working Style & Psychology", ... },
    { "dimension": "Skills & Capabilities", ... },
    { "dimension": "Structural & Practical", ... },
    { "dimension": "Relationship & Trust", ... }
  ],
  "riskRadar": [
    {
      "risk": "Risk title",
      "severity": "low|medium|high|critical",
      "description": "What the risk is and why it matters",
      "mitigation": "Concrete steps to address it"
    }
  ],
  "blindSpots": [
    {
      "area": "Blind spot title",
      "description": "What the partners might not see",
      "category": "Category (skills gap, assumption, bias, etc.)"
    }
  ],
  "recommendations": [
    {
      "priority": 1,
      "title": "Action item title",
      "description": "Detailed recommendation",
      "timeframe": "When to do this (e.g., 'Before launching', 'First month')"
    }
  ],
  "scores": [
    { "dimension": "Identity & Motivation", "score": <0-100>, "maxScore": 100 },
    { "dimension": "Working Style & Psychology", "score": <0-100>, "maxScore": 100 },
    { "dimension": "Skills & Capabilities", "score": <0-100>, "maxScore": 100 },
    { "dimension": "Structural & Practical", "score": <0-100>, "maxScore": 100 },
    { "dimension": "Relationship & Trust", "score": <0-100>, "maxScore": 100 }
  ]
}

IMPORTANT:
- Identify at least 3 risks and 3 blind spots
- Provide at least 5 prioritized recommendations
- Be honest about challenges — sugar-coating helps no one
- Reference specific response differences when identifying risks
- Score each dimension independently based on alignment, not individual quality

Respond with ONLY the JSON object, no markdown formatting or code blocks.`;
}
