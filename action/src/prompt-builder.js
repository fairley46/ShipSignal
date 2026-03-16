import { readFileSync } from 'fs';
import { resolve } from 'path';
import { repoRoot } from './config-loader.js';

const ENVIRONMENT_FRAMINGS = {
  production: 'Frame all changes as delivered value that customers can use today. Write in present tense.',
  staging: 'Frame changes as what is being validated before production. Internal Jira ticket references are appropriate.',
  hotfix: 'Lead directly with what was broken and what is now resolved. Be factual and direct about severity.',
  canary: 'Frame as a gradual rollout — changes are being validated on a subset of traffic, not yet universally available.',
};

export async function buildPrompt({ personaName, deployEnv, deployPoint, gitContext, prDescription, jiraTickets, config }) {
  const template = readFileSync(resolve(repoRoot, 'prompts/core-prompt.md'), 'utf8');
  const voiceContent = readFileSync(resolve(repoRoot, 'config/voice.md'), 'utf8');
  const personaContent = readFileSync(resolve(repoRoot, `personas/${personaName}.md`), 'utf8');

  const jiraBlock = jiraTickets.length
    ? jiraTickets.map(t =>
        `**${t.id}** (${t.priority} | ${t.status})\n` +
        `Summary: ${t.summary}\n` +
        `Description: ${t.description}\n` +
        `Labels: ${t.labels.join(', ') || 'none'}`
      ).join('\n\n---\n\n')
    : 'No Jira tickets found for this deployment.';

  const isoDate = new Date().toISOString().split('T')[0];

  return template
    .replace('{{DEPLOY_ENVIRONMENT}}', deployEnv)
    .replace('{{ENVIRONMENT_DESCRIPTION}}', deployPoint.description ?? '')
    .replace('{{ENVIRONMENT_AUDIENCE_FRAMING}}', ENVIRONMENT_FRAMINGS[deployEnv] ?? '')
    .replace('{{VOICE_MD_CONTENT}}', voiceContent)
    .replace('{{PERSONA_NAME}}', personaName)
    .replace('{{PERSONA_MD_CONTENT}}', personaContent)
    .replace('{{GIT_DIFF_SUMMARY}}', gitContext.diffSummary)
    .replace('{{COMMIT_MESSAGES}}', gitContext.commitMessages)
    .replace('{{PR_DESCRIPTION}}', prDescription ?? 'No PR description available.')
    .replace('{{JIRA_TICKETS_BLOCK}}', jiraBlock)
    .replace(/\{\{ISO_DATE\}\}/g, isoDate)
    .replace(/\{\{GIT_SHA_SHORT\}\}/g, gitContext.sha)
    .replace(/\{\{BRANCH_NAME\}\}/g, gitContext.branch);
}
