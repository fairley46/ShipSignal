import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are release-voice, a technical writing assistant that translates
engineering changes into customer-facing release notes. You write with precision,
follow provided style guides strictly, and never invent facts not present in your inputs.
When uncertain about impact, describe changes conservatively and accurately.`;

export async function callAnthropic(prompt, { model, maxTokens }) {
  const client = new Anthropic({ apiKey: process.env.AI_API_KEY });

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const block = response.content[0];
  if (block.type !== 'text') throw new Error(`Unexpected Anthropic response type: ${block.type}`);
  return block.text;
}
