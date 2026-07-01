#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DATA = join('src', 'data');
const langs = ['en', 'de'];

function categoriesOf(lang) {
  return readdirSync(join(DATA, lang))
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts')
    .map((f) => f.replace(/\.ts$/, ''))
    .sort();
}
function countIds(file) {
  return (readFileSync(file, 'utf8').match(/^ {6}id: '/gm) || []).length;
}

const CATEGORY_IDS = {};
const COUNTS = {};
for (const lang of langs) {
  const cats = categoriesOf(lang);
  CATEGORY_IDS[lang] = cats;
  COUNTS[lang] = {};
  for (const c of cats) COUNTS[lang][c] = countIds(join(DATA, lang, `${c}.ts`));

  // barrel
  const imports = cats
    .map((c) => `import { QUESTIONS as ${c} } from './${c}.js';`)
    .join('\n');
  const barrel =
    `import type { QuizQuestion } from '../../types.js';\n${imports}\n\n` +
    `export const BY_CATEGORY: Record<string, readonly QuizQuestion[]> = { ${cats.join(', ')} };\n` +
    `export const QUESTIONS: readonly QuizQuestion[] = [${cats.map((c) => `...${c}`).join(', ')}];\n`;
  writeFileSync(join(DATA, lang, 'index.ts'), barrel);
}

const manifest =
  `import type { Lang } from '../types.js';\n\n` +
  `export const CATEGORY_IDS: Record<Lang, readonly string[]> = ${JSON.stringify(CATEGORY_IDS, null, 2)};\n\n` +
  `export const COUNTS: Record<Lang, Readonly<Record<string, number>>> = ${JSON.stringify(COUNTS, null, 2)};\n`;
writeFileSync(join('src', 'core', 'manifest.ts'), manifest);

console.log('Generated manifest.ts and per-language barrels.');
