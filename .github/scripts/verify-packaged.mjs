#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const tgzArg = process.argv[2];
if (!tgzArg) {
  console.error('usage: verify-packaged.mjs <path-to-.tgz>');
  process.exit(2);
}
const tgz = resolve(process.cwd(), tgzArg);
const node = process.execPath;

const results = [];
let aborted = false;
function step(name, fn, { critical = false } = {}) {
  if (aborted) { process.stdout.write(`\n=== ${name} (skipped) ===\n`); results.push([name, 'skip']); return false; }
  process.stdout.write(`\n=== ${name} ===\n`);
  try { fn(); results.push([name, true]); return true; }
  catch (err) { console.error(String(err && err.message ? err.message : err)); results.push([name, false]); if (critical) aborted = true; return false; }
}
function run(cmd, args, opts = {}) { execFileSync(cmd, args, { stdio: 'inherit', ...opts }); }
function npmInstall(args, cwd) {
  if (process.platform === 'win32') run(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm', ...args], { cwd });
  else run('npm', args, { cwd });
}

const tmp = mkdtempSync(join(tmpdir(), 'oqb-verify-'));
try {
  writeFileSync(join(tmp, 'package.json'), JSON.stringify({ name: 'oqb-consumer', private: true, version: '0.0.0' }, null, 2) + '\n');
  step('install packed tarball + typescript', () => {
    npmInstall(['install', tgz, 'typescript@latest', '--no-audit', '--no-fund', '--silent'], tmp);
  }, { critical: true });

  step('copy smoke consumers', () => {
    copyFileSync(join(here, 'smoke', 'consumer.cjs'), join(tmp, 'consumer.cjs'));
    copyFileSync(join(here, 'smoke', 'consumer.mjs'), join(tmp, 'consumer.mjs'));
  }, { critical: true });
  step('runtime: CommonJS require()', () => run(node, ['--test', 'consumer.cjs'], { cwd: tmp }));
  step('runtime: ESM import', () => run(node, ['--test', 'consumer.mjs'], { cwd: tmp }));

  step('bundling: Rollup (the bundler behind Vite/webpack production builds) bundles the async root entry and it actually loads data', () => {
    npmInstall(['install', 'rollup@latest', '@rollup/plugin-node-resolve@latest', '--no-audit', '--no-fund', '--silent'], tmp);
    writeFileSync(
      join(tmp, 'bundle-entry.mjs'),
      "import { getQuestions } from 'open-quiz-bank';\n" +
        "const r = await getQuestions({ lang: 'en', count: 1 });\n" +
        "if (!r.length || typeof r[0].prompt !== 'string') throw new Error('bundled root import returned no data');\n" +
        "console.log('BUNDLE_OK');\n",
    );
    // Use Rollup's JS API, not esbuild: esbuild has built-in "glob-import"
    // resolution for a dynamic import() with a template-literal path, so it
    // silently and correctly bundles this exact bug pattern — it would never
    // go red. Rollup (what Vite's production build actually uses) has no such
    // resolution; it builds without error but the output 404s at runtime on
    // the real bug, which is the actual, faithful failure mode being guarded
    // against. This also sidesteps the Windows `npx` ENOENT problem esbuild's
    // CLI invocation had, since it's a plain Node script run via `node`.
    writeFileSync(
      join(tmp, 'run-rollup.mjs'),
      "import { rollup } from 'rollup';\n" +
        "import resolve from '@rollup/plugin-node-resolve';\n" +
        "const bundle = await rollup({ input: 'bundle-entry.mjs', plugins: [resolve()] });\n" +
        "await bundle.write({ dir: 'bundle-out', format: 'esm', entryFileNames: '[name].mjs', chunkFileNames: '[name]-[hash].mjs' });\n" +
        "await bundle.close();\n",
    );
    run(node, [join(tmp, 'run-rollup.mjs')], { cwd: tmp });
    const out = execFileSync(node, [join(tmp, 'bundle-out', 'bundle-entry.mjs')], { cwd: tmp, encoding: 'utf8' });
    if (out.trim() !== 'BUNDLE_OK') throw new Error(`unexpected bundle output: ${out}`);
  });

  const tscBin = join(tmp, 'node_modules', 'typescript', 'bin', 'tsc');
  const useMain = "import { getQuestions, type QuizQuestion } from 'open-quiz-bank';\nexport const a: Promise<QuizQuestion[]> = getQuestions({ lang: 'en', seed: 1 });\n";
  const useSub = "import { getQuestions } from 'open-quiz-bank/en';\nexport const b: string[] = getQuestions({ seed: 1 }).map((q) => q.id);\n";
  const useDe = "import { getQuestions } from 'open-quiz-bank/de';\nexport const d: string[] = getQuestions({ seed: 1 }).map((q) => q.id);\n";
  function typeCase(dir, pkgType, modes) {
    const d = join(tmp, dir);
    mkdirSync(d, { recursive: true });
    if (pkgType) writeFileSync(join(d, 'package.json'), JSON.stringify({ type: pkgType }) + '\n');
    writeFileSync(join(d, 'use_main.ts'), useMain);
    writeFileSync(join(d, 'use_sub.ts'), useSub);
    writeFileSync(join(d, 'use_de.ts'), useDe);
    for (const m of modes) {
      step(`types: ${dir} (module=${m.module}, moduleResolution=${m.moduleResolution})`, () => {
        const extra = m.ignoreDeprecations ? ['--ignoreDeprecations', m.ignoreDeprecations] : [];
        run(node, [tscBin, '--noEmit', '--strict', '--skipLibCheck', '--target', 'es2022',
          '--module', m.module, '--moduleResolution', m.moduleResolution, ...extra,
          join(d, 'use_main.ts'), join(d, 'use_sub.ts'), join(d, 'use_de.ts')], { cwd: tmp });
      });
    }
  }
  typeCase('types-cjs', 'commonjs', [{ module: 'node16', moduleResolution: 'node16' }]);
  typeCase('types-esm', 'module', [
    { module: 'nodenext', moduleResolution: 'nodenext' },
    { module: 'esnext', moduleResolution: 'bundler' },
  ]);
} finally {
  try { rmSync(tmp, { recursive: true, force: true }); } catch { /* best effort */ }
}

process.stdout.write('\n=== verify-packaged summary ===\n');
for (const [name, status] of results) {
  process.stdout.write(`${status === true ? 'PASS' : status === 'skip' ? 'SKIP' : 'FAIL'}  ${name}\n`);
}
if (results.some(([, s]) => s === false)) { process.stderr.write('\npackaged checks failed\n'); process.exit(1); }
process.stdout.write('\nAll packaged checks passed.\n');
