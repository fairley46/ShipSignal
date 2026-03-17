import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { loadConfig, repoRoot } from './config-loader.js';
import { fetchPRDescription } from './github.js';
import { fetchJiraTickets } from './jira.js';
import { buildPrompt } from './prompt-builder.js';
import { callAI } from './ai-provider.js';
import type { GitContext, TeamConfig } from './types.js';

// StdioServerTransport uses stdout for JSON-RPC. Redirect console.log to stderr
// so output from imported modules (jira.ts, config-loader.ts, etc.) doesn't
// corrupt the stream.
console.log = (...args: unknown[]) => {
  process.stderr.write(args.map(String).join(' ') + '\n');
};

process.stderr.write(`Legibly MCP: repo root = ${repoRoot}\n`);

function buildMcpGitContext(opts: {
  diff?: string;
  sha?: string;
  branch?: string;
  commitMessages?: string;
}): GitContext {
  const combined = (opts.commitMessages ?? '') + (opts.diff ?? '');
  const ticketIds = [...new Set(combined.match(/[A-Z][A-Z0-9]+-\d+/g) ?? [])];
  const rawDiff = opts.diff ?? '';
  return {
    diffSummary: rawDiff
      ? (rawDiff.length > 8000 ? rawDiff.slice(0, 8000) + '\n...[truncated]' : rawDiff)
      : '[diff not provided — translation based on PR description]',
    diffLineCount: rawDiff ? rawDiff.split('\n').length : 0,
    commitMessages: opts.commitMessages ?? '[commit messages not provided]',
    ticketIds,
    sha: opts.sha?.slice(0, 8) ?? 'on-demand',
    branch: opts.branch ?? 'on-demand',
  };
}

function getPersonaDescription(personaName: string): string {
  const personaPath = resolve(repoRoot, 'personas', `${personaName}.md`);
  if (!existsSync(personaPath)) return '';
  const lines = readFileSync(personaPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      return trimmed;
    }
  }
  return '';
}

async function main(): Promise<void> {
  let config: TeamConfig;
  try {
    config = await loadConfig();
  } catch (err) {
    process.stderr.write(
      `Legibly MCP: failed to load config: ${err instanceof Error ? err.message : String(err)}\n`
    );
    process.exit(1);
  }

  const server = new McpServer({
    name: 'legibly',
    version: '1.0.0',
  });

  // Tool: list-personas
  server.tool(
    'list-personas',
    'List all personas configured in Legibly, with the environments they appear in and a one-line description.',
    {},
    async () => {
      const personaMap = new Map<string, string[]>();
      for (const dp of config.deploy_points) {
        for (const persona of dp.personas) {
          const envs = personaMap.get(persona) ?? [];
          envs.push(dp.environment);
          personaMap.set(persona, envs);
        }
      }

      const lines: string[] = ['**Legibly Personas**\n'];
      for (const [name, envs] of personaMap) {
        const description = getPersonaDescription(name);
        lines.push(`**${name}**`);
        lines.push(`  Environments: ${envs.join(', ')}`);
        if (description) lines.push(`  ${description}`);
        lines.push('');
      }

      return {
        content: [{ type: 'text' as const, text: lines.join('\n') }],
      };
    }
  );

  // Tool: translate
  server.tool(
    'translate',
    'Translate a PR into audience-specific release notes using Legibly. Provide either pr_url or pr_description (or both), plus a persona name.',
    {
      pr_url: z
        .string()
        .optional()
        .describe(
          'GitHub PR URL (e.g. https://github.com/org/repo/pull/123). Requires GITHUB_TOKEN env var.'
        ),
      pr_description: z
        .string()
        .optional()
        .describe('PR body text, pasted directly. Alternative or supplement to pr_url.'),
      persona: z
        .string()
        .describe('Persona name to generate for. Use list-personas to see available options.'),
      environment: z
        .string()
        .optional()
        .describe(
          'Deployment environment: production, staging, hotfix, canary. Defaults to production.'
        ),
      diff: z
        .string()
        .optional()
        .describe('Optional git diff. Run: git diff HEAD~1 HEAD --stat --unified=0'),
      commit_messages: z
        .string()
        .optional()
        .describe('Optional commit messages. Run: git log --oneline -20'),
      sha: z.string().optional().describe('Optional commit SHA for frontmatter metadata.'),
      branch: z.string().optional().describe('Optional branch name for frontmatter metadata.'),
    },
    async (input) => {
      const {
        pr_url,
        pr_description,
        persona,
        environment,
        diff,
        commit_messages,
        sha,
        branch,
      } = input;

      const resolvedEnv = environment ?? 'production';

      if (!pr_url && !pr_description) {
        return {
          content: [
            {
              type: 'text' as const,
              text: 'Error: at least one of pr_url or pr_description is required.',
            },
          ],
          isError: true,
        };
      }

      // Validate persona exists
      const personaPath = resolve(repoRoot, 'personas', `${persona}.md`);
      if (!existsSync(personaPath)) {
        const available = [
          ...new Set(config.deploy_points.flatMap((dp) => dp.personas)),
        ];
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error: persona "${persona}" not found.\n\nAvailable personas: ${available.join(', ')}\n\nUse the list-personas tool to see details.`,
            },
          ],
          isError: true,
        };
      }

      // Resolve deploy point
      const deployPoint =
        config.deploy_points.find((dp) => dp.environment === resolvedEnv) ??
        config.deploy_points[0]!;

      // Fetch PR description from URL if provided
      let prDescriptionText = pr_description ?? 'No pull request description provided.';
      if (pr_url) {
        const match = pr_url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
        if (!match) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `Error: could not parse GitHub PR URL: ${pr_url}\n\nExpected format: https://github.com/owner/repo/pull/123`,
              },
            ],
            isError: true,
          };
        }
        const [, owner, repo, prNumber] = match;
        const repository = `${owner}/${repo}`;
        const fetched = await fetchPRDescription(
          prNumber,
          repository,
          process.env['GITHUB_TOKEN']
        );
        prDescriptionText = pr_description
          ? `${fetched}\n\n---\n\n${pr_description}`
          : fetched;
      }

      // Build git context (no live git calls — use provided inputs)
      const gitContext = buildMcpGitContext({
        diff,
        sha,
        branch,
        commitMessages: commit_messages,
      });

      // Fetch Jira tickets — gracefully no-ops if not configured
      const jiraTickets = await fetchJiraTickets(gitContext.ticketIds, config.jira);

      try {
        const prompt = await buildPrompt({
          personaName: persona,
          deployEnv: deployPoint.environment,
          deployPoint,
          gitContext,
          prDescription: prDescriptionText,
          jiraTickets,
          config,
        });

        const content = await callAI(prompt, config);

        if (content.trim() === '<!-- no-user-visible-changes -->') {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'No user-visible changes detected for this persona. The AI determined that this deployment does not contain changes relevant to this audience.',
              },
            ],
          };
        }

        return {
          content: [{ type: 'text' as const, text: content }],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error generating release notes: ${message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('Legibly MCP server running on stdio\n');
}

main().catch((err) => {
  process.stderr.write(
    `Legibly MCP fatal error: ${err instanceof Error ? err.message : String(err)}\n`
  );
  process.exit(1);
});
