import { mkdirSync, writeFileSync, readdirSync, unlinkSync } from 'fs';
import { resolve, join } from 'path';
import { repoRoot } from './config-loader.js';
import type { GeneratedNote, OutputConfig } from './types.js';

const DRY_RUN = process.env['DRY_RUN'] === 'true';

function pruneOldFiles(folder: string, personaName: string, maxFiles: number): void {
  let existing: string[];
  try {
    existing = readdirSync(folder);
  } catch {
    return;
  }

  // Files match YYYY-MM-DD-{sha8}-{persona}.md — the date prefix makes sort = chronological order.
  const personaFiles = existing
    .filter(f => f.endsWith(`-${personaName}.md`))
    .sort(); // oldest first

  const toDelete = personaFiles.slice(0, Math.max(0, personaFiles.length - maxFiles));
  for (const f of toDelete) {
    const target = join(folder, f);
    try {
      unlinkSync(target);
      console.log(`  Pruned: ${f} (max_files_per_persona=${maxFiles})`);
    } catch (err) {
      console.warn(`  Could not prune ${f}: ${String(err)}`);
    }
  }
}

export async function writeOutput(note: GeneratedNote, outputConfig: OutputConfig): Promise<string> {
  const basePath = outputConfig.base_path ?? 'release-notes';
  const subfolderByEnv = outputConfig.subfolder_by_environment !== false;
  const maxFiles = outputConfig.max_files_per_persona ?? 50;

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
    if (maxFiles > 0) {
      console.log(`DRY RUN — would prune to ${maxFiles} files for persona: ${note.personaName}`);
    }
    console.log('─'.repeat(60));
    console.log(note.content);
    console.log('─'.repeat(60) + '\n');
    return fullPath;
  }

  mkdirSync(folder, { recursive: true });
  writeFileSync(fullPath, note.content, 'utf8');
  console.log(`  Written: release-notes/${note.deployEnv}/${filename}`);

  if (maxFiles > 0) {
    pruneOldFiles(folder, note.personaName, maxFiles);
  }

  return fullPath;
}
