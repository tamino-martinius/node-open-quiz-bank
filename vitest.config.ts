import type { Plugin } from 'vitest/config';
import { defineConfig } from 'vitest/config';

// Source modules import siblings with explicit `.js` extensions (the TS ESM
// convention that lets real bundlers code-split). Vite's variable-dynamic-import
// analyzer globs for literal `.js` files — but under `src/` only `.ts` exists —
// so it cannot resolve `import(`./data/${lang}/${category}.js`)`. Rewrite the
// extension to `.ts` for the test transform only; the published build (tsc) is
// untouched, so the shipped code keeps its `.js` specifiers.
const resolveTsDynamicImports: Plugin = {
  name: 'oqb:resolve-ts-dynamic-imports',
  enforce: 'pre',
  transform(code, id) {
    if (!id.includes('/src/') || !code.includes('import(')) return null;
    const out = code.replace(/(import\(\s*`[^`]*)\.js(`)/g, '$1.ts$2');
    return out === code ? null : { code: out, map: null };
  },
};

export default defineConfig({
  plugins: [resolveTsDynamicImports],
  test: {
    globals: true,
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.{test,spec}.ts', 'src/__tests__/**', 'src/data/**'],
    },
  },
});
