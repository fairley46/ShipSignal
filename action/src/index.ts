import { loadConfig } from './config-loader.js';
import { extractGitContext } from './git.js';
import { fetchPRDescription } from './github.js';
import { fetchJiraTickets } from './jira.js';
import { buildPrompt } from './prompt-builder.js';
import { callAI } from './ai-provider.js';
import { writeOutput } from './output-writer.js';
import type { GeneratedNote } from './types.js';
import { getPlatformEnv } from './ci-platform.js';
import { fetchMRMetadata } from './gitlab.js';
import { fetchPRMetadata as fetchBitbucketPR } from './bitbucket.js';

function checkSecrets(providerType: string): void {
  const needsApiKey = providerType !== 'github-copilot';
  if (needsApiKey && !process.env['AI_API_KEY']) {
    console.log(`AI_API_KEY secret is not set (required for provider: ${providerType}).`);
    console.log('Add it to your repo or org secrets under Settings > Secrets and variables > Actions.');
    console.log('Skipping Legibly run.');
    process.exit(0);
  }
  if (providerType === 'github-copilot' && !process.env['GITHUB_TOKEN']) {
    console.log('GITHUB_TOKEN is not set (required for github-copilot provider). Skipping.');
    process.exit(0);
  }
}

async function run(): Promise<void> {
  const config = await loadConfig();

  checkSecrets(config.ai_provider.type);

  const deployEnv = process.env['DEPLOY_ENVIRONMENT'];
  if (!deployEnv) throw new Error('DEPLOY_ENVIRONMENT env var is required');

  const deployPoint = config.deploy_points.find(dp => dp.environment === deployEnv);
  if (!deployPoint) {
    console.log(`No deploy point configured for environment: ${deployEnv}. Skipping.`);
    process.exit(0);
  }

  const personaOverride = process.env['PERSONA_OVERRIDE'];
  const activePersonas = personaOverride
    ? personaOverride.split(',').map(p => p.trim())
    : deployPoint.personas;

  console.log(`Environment: ${deployEnv} | Personas: ${activePersonas.join(', ')}`);

  const gitContext = await extractGitContext(config);

  if (gitContext.diffLineCount < (config.generation?.min_diff_lines ?? 5)) {
    console.log(`Diff too small (${gitContext.diffLineCount} lines). Skipping generation.`);
    process.exit(0);
  }

  const platformEnv = getPlatformEnv();
  let prDescription = 'No pull request description available.';

  if (platformEnv.platform === 'gitlab') {
    const mr = await fetchMRMetadata(
      platformEnv.repoUrl,
      platformEnv.prNumber,
      process.env['CI_PROJECT_ID']
    );
    if (mr?.description) prDescription = mr.description;
    if (mr?.title && !gitContext.branch) { /* branch already set */ }
  } else if (platformEnv.platform === 'bitbucket') {
    const workspace = process.env['BITBUCKET_WORKSPACE'] ?? '';
    const slug = process.env['BITBUCKET_REPO_SLUG'] ?? '';
    const pr = await fetchBitbucketPR(workspace, slug, platformEnv.prNumber);
    if (pr?.description) prDescription = pr.description;
  } else {
    // github (guarded internally) + generic
    prDescription = await fetchPRDescription(
      process.env['PR_NUMBER'],
      process.env['GH_REPOSITORY'],
      process.env['GITHUB_TOKEN']
    );
  }

  const jiraTickets = await fetchJiraTickets(gitContext.ticketIds, config.jira);

  const generated: GeneratedNote[] = [];

  for (const personaName of activePersonas) {
    console.log(`Generating for persona: ${personaName}`);

    const prompt = await buildPrompt({
      personaName,
      deployEnv,
      deployPoint,
      gitContext,
      prDescription,
      jiraTickets,
      config,
    });

    const content = await callAI(prompt, config);

    if (content.trim() === '<!-- no-user-visible-changes -->') {
      console.log(`  No user-visible changes for ${personaName}, skipping.`);
      continue;
    }

    generated.push({ personaName, content, deployEnv });
  }

  for (const note of generated) {
    await writeOutput(note, config.output ?? {});
  }

  console.log(`Done. Generated ${generated.length} release note file(s).`);
}

run().catch(err => {
  console.error('Legibly failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
