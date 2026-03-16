/**
 * AI provider abstraction.
 * Configure via ai_provider.type in team-config.yml:
 *
 *   anthropic       — Anthropic API (AI_API_KEY)
 *   github-copilot  — GitHub Copilot Enterprise OpenAI-compatible API (GITHUB_TOKEN)
 *   openai          — OpenAI API (AI_API_KEY)
 *   azure-openai    — Azure OpenAI (AI_API_KEY + azure_endpoint + azure_deployment in config)
 */

import { callAnthropic } from './providers/anthropic.js';
import { callOpenAICompatible } from './providers/openai-compatible.js';
import type { TeamConfig } from './types.js';

const GITHUB_COPILOT_ENDPOINT = 'https://api.githubcopilot.com';

export async function callAI(prompt: string, config: TeamConfig): Promise<string> {
  const provider = config.ai_provider;
  const { type, model } = provider;
  const maxTokens = config.generation?.max_tokens ?? 2048;

  switch (type) {
    case 'anthropic':
      return callAnthropic(prompt, { model, maxTokens });

    case 'github-copilot':
      return callOpenAICompatible(prompt, {
        model,
        maxTokens,
        baseURL: GITHUB_COPILOT_ENDPOINT,
        apiKey: process.env['GITHUB_TOKEN'],
      });

    case 'openai':
      return callOpenAICompatible(prompt, {
        model,
        maxTokens,
        apiKey: process.env['AI_API_KEY'],
      });

    case 'azure-openai':
      return callOpenAICompatible(prompt, {
        model: provider.azure_deployment ?? model,
        maxTokens,
        baseURL: provider.azure_endpoint,
        apiKey: process.env['AI_API_KEY'],
        isAzure: true,
      });

    default: {
      const exhaustive: never = type;
      throw new Error(`Unknown ai_provider.type: "${exhaustive}". Use anthropic | github-copilot | openai | azure-openai`);
    }
  }
}
