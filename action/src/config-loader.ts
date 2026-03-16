import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import type { TeamConfig } from './types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const repoRoot = resolve(__dirname, '../../../');

export async function loadConfig(): Promise<TeamConfig> {
  const configPath = resolve(repoRoot, 'config/team-config.yml');
  const raw = readFileSync(configPath, 'utf8');
  const config = yaml.load(raw) as TeamConfig;

  if (!Array.isArray(config.deploy_points) || config.deploy_points.length === 0) {
    throw new Error('team-config.yml must have a deploy_points array');
  }

  for (const dp of config.deploy_points) {
    if (!dp.environment) throw new Error('Each deploy_point must have an environment');
    if (!dp.personas?.length) throw new Error(`deploy_point "${dp.environment}" must have at least one persona`);
  }

  if (!config.ai_provider?.type) {
    throw new Error('team-config.yml must have ai_provider.type (anthropic | github-copilot | openai | azure-openai)');
  }

  if (config.team?.jira_project_key) {
    process.env['JIRA_PROJECT_KEY'] = config.team.jira_project_key;
  }

  return config;
}
