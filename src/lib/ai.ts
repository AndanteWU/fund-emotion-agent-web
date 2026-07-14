import "server-only";

import { createDeepSeek } from "@ai-sdk/deepseek";

export const DEFAULT_DEEPSEEK_MODEL = "deepseek-v4-flash";

export class AiConfigurationError extends Error {
  constructor() {
    super("DeepSeek API is not configured.");
    this.name = "AiConfigurationError";
  }
}

export function getDeepSeekModel() {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new AiConfigurationError();
  }

  const modelId =
    process.env.DEEPSEEK_MODEL?.trim() || DEFAULT_DEEPSEEK_MODEL;
  const deepseek = createDeepSeek({ apiKey });

  return {
    model: deepseek(modelId),
    modelId,
  };
}
