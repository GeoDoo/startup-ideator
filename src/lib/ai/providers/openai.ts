import OpenAI from "openai";
import { type AIProvider, type CompatibilityReport, type ReportInput, type VentureCandidateData } from "../types";
import { buildCompatibilityPrompt } from "../prompts/compatibility";

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateCompatibilityReport(input: ReportInput): Promise<CompatibilityReport> {
    const prompt = buildCompatibilityPrompt(input);

    const response = await this.client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert startup partnership advisor. Respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      max_tokens: 8192,
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("No response from OpenAI");

    return parseJSON<CompatibilityReport>(text, "compatibility report");
  }

  async generateVentureCandidates(prompt: string): Promise<VentureCandidateData[]> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert venture strategist. Respond with a JSON array." },
        { role: "user", content: prompt },
      ],
      max_tokens: 16384,
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("No response from OpenAI");

    const parsed = parseJSON<Record<string, unknown>>(text, "venture candidates");
    if (Array.isArray(parsed)) return parsed as VentureCandidateData[];

    const candidates = parsed.candidates ?? parsed.ideas ?? parsed.ventures;
    if (Array.isArray(candidates)) return candidates as VentureCandidateData[];

    throw new Error("OpenAI response did not contain a recognizable array of venture candidates");
  }
}

function parseJSON<T>(raw: string, context: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new Error(
      `Failed to parse ${context} JSON from OpenAI. ` +
      `Response started with: "${raw.slice(0, 120)}..."`
    );
  }
}
