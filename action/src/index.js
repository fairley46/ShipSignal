import { loadConfig } from './config-loader.js';
import { extractGitContext } from './git.js';
import { fetchPRDescription } from './github.js';
import { fetchJiraTickets } from './jira.js';
import { buildPrompt } from './prompt-builder.js';
import { callAI } from './ai-provider.js';
import { writeOutput } from './output-writer.js';

async function run() {
  const config = await loadConfig();

  const deployEnv = process.env.DEPLOY_ENVIRONMENT;
  const deployPoint = config.deploy_points.find(dp => dp.environment === deployEnv);

  if (!deployPoint) {
    console.log(`No deploy point configured for environment: ${deployEnv}. Skipping.`);
    process.exit(0);
  }

  const personaOverride = process.env.PERSONA_OVERRIDE;
  const activePersonas = personaOverride
    ? personaOverride.split(',').map(p => p.trim())
    : deployPoint.personas;

  console.log(`Environment: ${deployEnv} | Personas: ${activePersonas.join(', ')}`);

  const gitContext = await extractGitContext(config);

  if (gitContext.diffLineCount < (config.generation?.min_diff_lines ?? 5)) {
    console.log(`Diff too small (${gitContext.diffLineCount} lines). Skipping generation.`);
    process.exit(0);
  }

  const prDescription = await fetchPRDescription(
    process.env.PR_NUMBER,
    process.env.GH_REPOSITORY,
    process.env.GITHUB_TOKEN
  );

  const jiraTickets = await fetchJiraTickets(gitContext.ticketIds, config.jira);

  const generated = [];

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
  console.error('ShipSignal failed:', err.message);
  process.exit(1);
});
