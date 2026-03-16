import { readFileSync } from 'fs';
import { resolve } from 'path';
import { repoRoot } from './config-loader.js';
import type { PromptBuilderOptions } from './types.js';

const ENVIRONMENT_FRAMINGS: Record<string, string> = {
  production: 'Frame all changes as delivered value that customers can use today. Write in present tense.',
  staging: 'Frame changes as what is being validated before production. Internal Jira ticket references are appropriate.',
  hotfix: 'Lead directly with what was broken and what is now resolved. Be factual and direct about severity.',
  canary: 'Frame as a gradual rollout — changes are being validated on a subset of traffic, not yet universally available.',
};

const DEFAULT_FRAMING = 'Frame changes clearly for the target audience. Be specific about what changed and what it means for them.';

const PERSONA_NAME_PATTERN = /^[a-z0-9-]+$/;

function resolvePersonaPath(personaName: string): string {
  if (!PERSONA_NAME_PATTERN.test(personaName)) {
    throw new Error(
      `Invalid persona name: "${personaName}"\n` +
      `  Persona names must only contain lowercase letters, numbers, and hyphens.`
    );
  }

  const personasDir = resolve(repoRoot, 'personas');
  const personaPath = resolve(personasDir, `${personaName}.md`);

  // Guard against path traversal
  if (!personaPath.startsWith(personasDir + '/') && personaPath !== personasDir) {
    throw new Error(`Path traversal detected for persona name: "${personaName}"`);
  }

  return personaPath;
}

export async function buildPrompt(options: PromptBuilderOptions): Promise<string> {
  const { personaName, deployEnv, deployPoint, gitContext, prDescription, jiraTickets } = options;

  const template = readFileSync(resolve(repoRoot, 'prompts/core-prompt.md'), 'utf8');
  const voiceContent = readFileSync(resolve(repoRoot, 'config/voice.md'), 'utf8');
  const personaPath = resolvePersonaPath(personaName);
  const personaContent = readFileSync(personaPath, 'utf8');

  const framing = ENVIRONMENT_FRAMINGS[deployEnv];
  if (!framing) {
    console.warn(
      `Warning: no environment framing defined for "${deployEnv}". Using default.\n` +
      `  Add it to ENVIRONMENT_FRAMINGS in prompt-builder.ts for tailored output.`
    );
  }

  const jiraBlock = jiraTickets.length
    ? jiraTickets.map(t =>
        `**${t.id}** (${t.priority} | ${t.status})\n` +
        `Summary: ${t.summary}\n` +
        `Description: ${t.description}\n` +
        `Labels: ${t.labels.join(', ') || 'none'}`
      ).join('\n\n---\n\n')
    : 'No Jira tickets found for this deployment.';

  const isoDate = new Date().toISOString().split('T')[0] ?? '';

  return template
    .replace('{{DEPLOY_ENVIRONMENT}}', deployEnv)
    .replace('{{ENVIRONMENT_DESCRIPTION}}', deployPoint.description ?? '')
    .replace('{{ENVIRONMENT_AUDIENCE_FRAMING}}', framing ?? DEFAULT_FRAMING)
    .replace('{{VOICE_MD_CONTENT}}', voiceContent)
    .replace('{{PERSONA_NAME}}', personaName)
    .replace('{{PERSONA_MD_CONTENT}}', personaContent)
    .replace('{{GIT_DIFF_SUMMARY}}', gitContext.diffSummary)
    .replace('{{COMMIT_MESSAGES}}', gitContext.commitMessages)
    .replace('{{PR_DESCRIPTION}}', prDescription)
    .replace('{{JIRA_TICKETS_BLOCK}}', jiraBlock)
    .replace(/\{\{ISO_DATE\}\}/g, isoDate)
    .replace(/\{\{GIT_SHA_SHORT\}\}/g, gitContext.sha)
    .replace(/\{\{BRANCH_NAME\}\}/g, gitContext.branch);
}
