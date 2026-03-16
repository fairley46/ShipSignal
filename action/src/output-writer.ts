import { mkdirSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';
import { repoRoot } from './config-loader.js';
import type { GeneratedNote, OutputConfig } from './types.js';

const DRY_RUN = process.env['DRY_RUN'] === 'true';

export async function writeOutput(note: GeneratedNote, outputConfig: OutputConfig): Promise<string> {
  const basePath = outputConfig.base_path ?? 'release-notes';
  const subfolderByEnv = outputConfig.subfolder_by_environment !== false;

  const date = new Date().toISOString().split('T')[0];
  const sha = (process.env['GH_SHA'] ?? 'unknown').slice(0, 8);
  const filename = `${date}-${sha}-${note.personaName}.md`;

  const folder = subfolderByEnv
    ? resolve(repoRoot, basePath, note.deployEnv)
    : resolve(repoRoot, basePath);

  const fullPath = join(folder, filename);

  if (DRY_RUN) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`DRY RUN — would write: release-notes/${note.deployEnv}/${filename}`);
    console.log('─'.repeat(60));
    console.log(note.content);
    console.log('─'.repeat(60) + '\n');
    return fullPath;
  }

  mkdirSync(folder, { recursive: true });
  writeFileSync(fullPath, note.content, 'utf8');
  console.log(`  Written: release-notes/${note.deployEnv}/${filename}`);
  return fullPath;
}
