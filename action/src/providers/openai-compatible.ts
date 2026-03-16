import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are ShipSignal, a technical writing assistant that translates
engineering changes into customer-facing release notes. You write with precision,
follow provided style guides strictly, and never invent facts not present in your inputs.
When uncertain about impact, describe changes conservatively and accurately.`;

interface OpenAICompatibleOptions {
  model: string;
  maxTokens: number;
  baseURL?: string;
  apiKey?: string;
  isAzure?: boolean;
}

export async function callOpenAICompatible(
  prompt: string,
  options: OpenAICompatibleOptions
): Promise<string> {
  const { model, maxTokens, baseURL, apiKey, isAzure } = options;

  const clientOptions: ConstructorParameters<typeof OpenAI>[0] = {
    apiKey: apiKey ?? 'placeholder',
  };

  if (baseURL) clientOptions.baseURL = baseURL;

  if (isAzure) {
    clientOptions.defaultQuery = { 'api-version': '2024-02-01' };
    clientOptions.defaultHeaders = { 'api-key': apiKey };
    clientOptions.apiKey = 'placeholder';
  }

  const client = new OpenAI(clientOptions);

  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
  });

  return response.choices[0]?.message?.content ?? '';
}
