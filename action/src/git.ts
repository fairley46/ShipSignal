import { execSync } from 'child_process';
import type { TeamConfig, GitContext } from './types.js';
import { getPlatformEnv } from './ci-platform.js';

export async function extractGitContext(_config: TeamConfig): Promise<GitContext> {
  const platformEnv = getPlatformEnv();

  let diffSummary = '';
  let diffLineCount = 0;

  try {
    const raw = execSync('git diff HEAD~1 HEAD --stat --unified=0', {
      encoding: 'utf8',
      maxBuffer: 512 * 1024,
    });
    diffSummary = raw.length > 8000 ? raw.slice(0, 8000) + '\n... [diff truncated]' : raw;
    diffLineCount = raw.split('\n').length;
  } catch {
    diffSummary = '[git diff unavailable — first commit or shallow clone]';
  }

  let commitMessages = '';
  try {
    commitMessages = execSync('git log --oneline -20 --pretty=format:"%h %s%n%b"', {
      encoding: 'utf8',
    }).slice(0, 4000);
  } catch {
    commitMessages = '[commit log unavailable]';
  }

  const ticketPattern = /[A-Z][A-Z0-9]+-\d+/g;
  const combined = commitMessages + diffSummary;
  const allTickets = [...new Set(combined.match(ticketPattern) ?? [])];

  const projectKey = process.env['JIRA_PROJECT_KEY'];
  const ticketIds = projectKey
    ? allTickets.filter(id => id.startsWith(`${projectKey}-`))
    : allTickets;

  return {
    diffSummary,
    diffLineCount,
    commitMessages,
    ticketIds,
    sha: (platformEnv.sha ?? 'unknown').slice(0, 8),
    branch: platformEnv.branch ?? 'unknown',
    ciPlatform: platformEnv.platform,
  };
}
