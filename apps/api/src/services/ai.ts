import { generateObject, type LanguageModel } from 'ai';
import { google } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const ExplanationSchema = z.object({
  explanation: z.string(),
  causes: z.array(z.string()).length(3),
  fix: z.string(),
});

type AIProvider = 'google' | 'openai' | 'anthropic';

const providers: Record<AIProvider, (model: string) => LanguageModel> = {
  google,
  openai,
  anthropic,
};

function resolveModel(): LanguageModel {
  const provider = (process.env.AI_PROVIDER || 'google') as AIProvider;
  const modelName = process.env.AI_MODEL || 'gemini-2.0-flash';

  const factory = providers[provider];
  if (!factory) {
    const supported = Object.keys(providers).join(', ');
    throw new Error(`Unsupported AI provider: "${provider}". Use: ${supported}`);
  }

  return factory(modelName);
}

export async function explainError(message: string, stack?: string | null) {
  const model = resolveModel();

  const prompt = `You are a senior software engineer. Explain this error clearly and concisely.

Error: ${message}
Stack: ${stack || 'No stack trace available'}

Return JSON only. No extra text, no markdown, no generic advice.`;

  const result = await generateObject({
    model,
    schema: ExplanationSchema,
    prompt,
  });

  return result.object;
}
