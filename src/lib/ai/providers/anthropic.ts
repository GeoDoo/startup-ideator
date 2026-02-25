import Anthropic from "@anthropic-ai/sdk";
import { type AIProvider, type CompatibilityReport, type ReportInput, type VentureCandidateData } from "../types";
import { buildCompatibilityPrompt } from "../prompts/compatibility";

export class AnthropicProvider implements AIProvider {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async generateCompatibilityReport(input: ReportInput): Promise<CompatibilityReport> {
    const prompt = buildCompatibilityPrompt(input);

    const message = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Anthropic");
    }

    return parseJSON<CompatibilityReport>(textBlock.text, "compatibility report");
  }

  async generateVentureCandidates(prompt: string): Promise<VentureCandidateData[]> {
    const message = await this.client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16384,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Anthropic");
    }

    return parseJSON<VentureCandidateData[]>(textBlock.text, "venture candidates");
  }
}

function parseJSON<T>(raw: string, context: string): T {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(
      `Failed to parse ${context} JSON from AI. ` +
      `Response started with: "${cleaned.slice(0, 120)}..."`
    );
  }
}
