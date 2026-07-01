#!/usr/bin/env node
// One-time migration: merge data/<lang>/{generated,imported}/<cat>.ts into
// src/data/<lang>/<cat>.ts, drop the source segment from ids, fix the type import,
// sort by id, and assert global uniqueness + the 7946 total.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'data';
const OUT = join('src', 'data');
const langs = ['en', 'de'];

// Extract the array-body text (between the first '[' after '=' and the final '];').
function bodyOf(text) {
  const start = text.indexOf('[', text.indexOf('QUESTIONS'));
  const end = text.lastIndexOf('];');
  return text.slice(start + 1, end).trim();
}

// Split top-level object literals `{ ... },` from the array body.
function splitObjects(body) {
  const objs = [];
  let depth = 0, start = -1;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === '{') { if (depth === 0) start = i; depth++; }
    else if (ch === '}') { depth--; if (depth === 0) objs.push(body.slice(start, i + 1)); }
  }
  return objs;
}

const idRe = /id:\s*'([^']+)'/;
let total = 0;
const allIds = new Set();

for (const lang of langs) {
  const catFiles = new Map(); // category -> [objectText, ...]
  for (const bucket of ['generated', 'imported']) {
    const dir = join(SRC, lang, bucket);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
      const category = file.replace(/\.ts$/, '');
      const text = readFileSync(join(dir, file), 'utf8');
      const objs = splitObjects(bodyOf(text)).map((o) =>
        // drop the source segment: <lang>-generated-... / <lang>-imported-... -> <lang>-...
        o.replace(/id:\s*'(en|de)-(?:generated|imported)-/, "id: '$1-"),
      );
      const list = catFiles.get(category) ?? [];
      list.push(...objs);
      catFiles.set(category, list);
    }
  }

  const outDir = join(OUT, lang);
  mkdirSync(outDir, { recursive: true });
  for (const [category, objs] of catFiles) {
    // sort by id for stable diffs; assert uniqueness globally
    objs.sort((a, b) => a.match(idRe)[1].localeCompare(b.match(idRe)[1]));
    for (const o of objs) {
      const id = o.match(idRe)[1];
      if (allIds.has(id)) throw new Error(`Duplicate id after migration: ${id}`);
      allIds.add(id);
      if (!new RegExp(`^${lang}-${category}-[0-9a-f]+$`).test(id))
        throw new Error(`Unexpected id shape: ${id}`);
    }
    total += objs.length;
    const out =
      `import type { QuizQuestion } from '../../types.js';\n\n` +
      `export const QUESTIONS: readonly QuizQuestion[] = [\n` +
      objs.map((o) => '  ' + o.replace(/\n/g, '\n  ') + ',').join('\n') +
      `\n];\n`;
    writeFileSync(join(outDir, `${category}.ts`), out);
  }
}

if (total !== 7946) throw new Error(`Expected 7946 questions, got ${total}`);
console.log(`Migrated ${total} questions, ${allIds.size} unique ids.`);
