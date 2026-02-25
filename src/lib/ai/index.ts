import { type AIProvider } from "./types";
import { AnthropicProvider } from "./providers/anthropic";
import { OpenAIProvider } from "./providers/openai";

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || "anthropic";

  switch (provider) {
    case "openai":
      return new OpenAIProvider();
    case "anthropic":
    default:
      return new AnthropicProvider();
  }
}

export * from "./types";
