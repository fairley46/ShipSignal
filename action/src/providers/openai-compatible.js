import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are ShipSignal, a technical writing assistant that translates
engineering changes into customer-facing release notes. You write with precision,
follow provided style guides strictly, and never invent facts not present in your inputs.
When uncertain about impact, describe changes conservatively and accurately.`;

export async function callOpenAICompatible(prompt, { model, maxTokens, baseURL, apiKey, isAzure }) {
  const clientOptions = { apiKey };

  if (baseURL) clientOptions.baseURL = baseURL;

  if (isAzure) {
    // Azure OpenAI requires api-version query param
    clientOptions.defaultQuery = { 'api-version': '2024-02-01' };
    clientOptions.defaultHeaders = { 'api-key': apiKey };
    clientOptions.apiKey = 'placeholder'; // OpenAI SDK requires a non-empty key
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
