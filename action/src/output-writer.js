import { mkdirSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { repoRoot } from './config-loader.js';

export async function writeOutput({ personaName, content, deployEnv }, outputConfig) {
  const basePath = outputConfig.base_path ?? 'release-notes';
  const subfolderByEnv = outputConfig.subfolder_by_environment !== false;

  const date = new Date().toISOString().split('T')[0];
  const sha = (process.env.GH_SHA ?? 'unknown').slice(0, 8);
  const filename = `${date}-${sha}-${personaName}.md`;

  const folder = subfolderByEnv
    ? resolve(repoRoot, basePath, deployEnv)
    : resolve(repoRoot, basePath);

  mkdirSync(folder, { recursive: true });

  const fullPath = join(folder, filename);
  writeFileSync(fullPath, content, 'utf8');

  console.log(`  Written: release-notes/${deployEnv}/${filename}`);
  return fullPath;
}
