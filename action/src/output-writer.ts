import { mkdirSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { repoRoot } from './config-loader.js';
import type { GeneratedNote, OutputConfig } from './types.js';

export async function writeOutput(note: GeneratedNote, outputConfig: OutputConfig): Promise<string> {
  const basePath = outputConfig.base_path ?? 'release-notes';
  const subfolderByEnv = outputConfig.subfolder_by_environment !== false;

  const date = new Date().toISOString().split('T')[0];
  const sha = (process.env['GH_SHA'] ?? 'unknown').slice(0, 8);
  const filename = `${date}-${sha}-${note.personaName}.md`;

  const folder = subfolderByEnv
    ? resolve(repoRoot, basePath, note.deployEnv)
    : resolve(repoRoot, basePath);

  mkdirSync(folder, { recursive: true });

  const fullPath = join(folder, filename);
  writeFileSync(fullPath, note.content, 'utf8');

  console.log(`  Written: release-notes/${note.deployEnv}/${filename}`);
  return fullPath;
}
