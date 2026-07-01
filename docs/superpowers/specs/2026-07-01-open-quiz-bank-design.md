# open-quiz-bank — Design

**Date:** 2026-07-01
**Status:** Approved (ready for implementation planning)

## Summary

Turn the existing bilingual (de/en) quiz-question collection into an open-source
npm package, `open-quiz-bank`. The package ships both the question **data** and a
small **query API** for building quiz games: list categories, and pick questions by
difficulty range, category set, tag filters, with an ignorelist and deterministic
(seeded) selection.

- **Code:** MIT.
- **Questions:** CC0-1.0.
- **CI/release:** mirror the `node-ts-dedent` pattern (dual CJS+ESM build, 3×3
  OS/Node matrix, npm OIDC trusted publishing with provenance, `verify-packaged`
  job, HISTORY.md rolling, publish-then-PR-back-to-main).

## Background & context

- An existing `types.ts` already sketches the schema (`QuizQuestion`,
  `CategoryMeta`, `Lang`, `Difficulty`) and the query interface (`QuestionQuery`).
- ~7,946 questions across 55 files today: `data/{de,en}/{generated,imported}/<category>.ts`,
  each exporting `export const QUESTIONS: readonly QuizQuestion[]`. Raw size ≈ 2.3 MB.
  - en: 2,871 questions, 14 categories.
  - de: 5,075 questions, 16 categories (adds `popculture`, `videogames`).
- **Category sets differ by language** — `getCategories(lang)` is inherently per-language.
- No category display metadata (`CategoryMeta` values) exists yet; it must be authored.

### Licensing provenance (why CC0 is sound)

All questions ultimately originate from the author:
- "generated" = AI-generated from synthetic/imaginary fact lists the author curated
  (hot-or-not quality filtered).
- "imported" = written by the author (sometimes inspired by quiz shows watched), then
  rephrased/enriched (difficulty, distractors) by AI.
- Every question was fact-checked (Claude + ChatGPT); doubtful ones removed. Duplicates
  removed by AI. Some questions were translated de↔en where they travel well.

No third-party share-alike dataset is in the chain, so relicensing the questions as
CC0-1.0 is legally clean.

## Decisions

1. **Drop the `generated`/`imported` distinction entirely.** The quality bar is uniform
   after fact-checking and the generated set is small. Merge into `data/<lang>/<category>.ts`,
   remove `source` from `QuestionQuery`, and drop the `source` segment from ids. The origin
   story lives in the README only.
2. **Load architecture = both, sync-per-language.**
   - Main entry (`open-quiz-bank`): **async**, lazily dynamic-imports only the
     `data/<lang>/<category>` leaves a query touches (bundlers code-split per category).
   - Per-language entries (`open-quiz-bank/en`, `open-quiz-bank/de`): **sync**, eagerly
     bundle just that one language.
   - Both delegate to one pure, sync core selector — identical behavior, only data
     delivery differs.
3. **API additions confirmed:** `toChoices()` seeded shuffle helper and a stateful
   `createQuiz()` session.
4. **Naming:** unscoped `open-quiz-bank` (verified free on npm).
5. **Dual license declaration:** root `LICENSE` = MIT, `data/LICENSE` = CC0-1.0,
   `package.json` `"license": "MIT"`, README documents both.
6. **Ship en categories as-is** even where thin (`music`/`language`/`film` ≈ 12–13
   questions). May grow later.
7. **`engines.node >= 22`** (everything below is EOL), TypeScript target **ES2022**.

## Repository layout

Everything compiled lives under `src/` so the dual `tsc` build emits it cleanly.

```
src/
  types.ts              # QuizQuestion, CategoryMeta, Lang, Difficulty, QuestionQuery, Quiz…
  core/
    rng.ts              # mulberry32 + seeded Fisher–Yates shuffle
    select.ts           # PURE sync: filter → seeded select (+ spreadDifficulty)
    choices.ts          # toChoices(question, seed)
    quiz.ts             # createQuiz session (generic over a sync OR async loader)
    categories.ts       # authored CategoryMeta (label {en,de} + emoji icon); hand-maintained
    manifest.ts         # GENERATED: per-lang category list + counts
  data/
    en/<category>.ts    # flattened: one file per category, `source` dropped
    de/<category>.ts
    en/index.ts         # GENERATED barrel (re-exports every en category's QUESTIONS)
    de/index.ts         # GENERATED barrel
  index.ts              # async main entry (lazy per-category dynamic import)
  en.ts                 # sync entry: statically imports src/data/en/*, exposes sync API
  de.ts                 # sync entry
scripts/
  build-manifest.mjs    # regenerates manifest.ts + data/*/index.ts barrels from the data dir
  validate-data.mjs     # data-integrity checks (also invoked by the test suite)
  migrate-data.mjs      # one-time: merge sources, rewrite ids, move under src/, fix imports
```

- The existing top-level `data/` and `types.ts` move under `src/`.
- Each category's `generated` + `imported` files merge into a single
  `src/data/<lang>/<category>.ts`.
- The per-data-file type import becomes `import type { QuizQuestion } from '../../types';`
  (no `.ts` extension — the compiled build must resolve it).

## Data model

`QuizQuestion` stays as in the current `types.ts`, **minus `source`**:

```ts
export type Lang = 'en' | 'de';
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface QuizQuestion {
  id: string;              // <lang>-<category>-<hash>, globally unique
  lang: Lang;
  prompt: string;
  answer: string;
  distractors: string[];   // >= 3, distinct, none equal to answer
  tags: string[];          // tags[0] = primary category; rest = facets
  difficulty: Difficulty;
  asOf?: string;           // yyyy-mm-dd, required for volatile facts
  source?: string;         // free-text provenance note (NOT the generated/imported bucket)
  explanation?: string;
}

export interface CategoryMeta {
  id: string;                    // the tag string, e.g. 'geography'
  label: Record<Lang, string>;   // human label per language
  icon: string;                  // emoji glyph
}
```

Note: `QuizQuestion.source` (a free-text provenance one-liner already used by some
questions) is unrelated to the dropped generated/imported bucket and is retained.

### IDs

Rewrite `<lang>-<source>-<category>-<hash>` → `<lang>-<category>-<hash>`. The migration
verifies global uniqueness after the transform and re-hashes any collision produced by
merging the two source buckets of a category.

## Query interface

```ts
export interface DifficultyRange { min?: Difficulty; max?: Difficulty; }

export interface QuestionQuery {
  lang: Lang;                        // omitted on per-language entries (implied)
  categories?: string[];             // primary categories to load (the lazy-load scope)
  tags?: string[];                   // keep questions with >= 1 of these tags
  allTags?: string[];                // keep questions with ALL of these tags
  difficulty?: DifficultyRange;      // inclusive band
  count?: number;                    // how many to return; omit for all matches
  seed?: number;                     // deterministic selection/shuffle
  excludeIds?: Iterable<string>;     // ignorelist
  spreadDifficulty?: boolean;        // round-robin across the band instead of uniform random
}
```

`source` is removed from the query. All filters are ANDed.

## Determinism (the seed contract)

- Shared **`mulberry32(seed)`** PRNG + seeded Fisher–Yates shuffle in `core/rng.ts`.
- **Contract:** the same `(query including seed, data)` yields a **byte-identical**
  result — across the sync per-language entries and the async main entry, and across
  Node and browsers.
- **Selection algorithm:** filter candidates → seeded shuffle → take `count`.
- **`spreadDifficulty`:** bucket the filtered candidates by difficulty across the
  requested band, seeded-shuffle within each bucket, then round-robin the buckets — so a
  returned round is evenly spread across difficulties instead of clumped.
- **`toChoices(q, seed)`:** seeded shuffle of `[answer, ...distractors]`; returns
  `{ options: string[], correctIndex: number }`.
- **No seed** → falls back to `Math.random()` (explicit non-deterministic opt-out).

## Public API

### Main entry `open-quiz-bank` (async, lazy)

```ts
getQuestions(query: QuestionQuery): Promise<QuizQuestion[]>
getQuestionById(lang: Lang, id: string): Promise<QuizQuestion | undefined>
countQuestions(query: QuestionQuery): Promise<number>
getCategories(lang: Lang): CategoryMeta[]         // sync — reads manifest/metadata, no data load
createQuiz(query: QuestionQuery): Promise<Quiz>    // resolves once its matching pool is loaded
```

Lazy loading dynamic-imports only `./data/<lang>/<category>.js` for the requested
categories (or all categories for the language when `categories` is omitted). The literal
`./data/` prefix lets Webpack/Vite/esbuild code-split each category into its own chunk.
`getCategories` never loads question data — it reads the generated manifest + authored
metadata.

### Per-language entries `open-quiz-bank/en` and `open-quiz-bank/de` (sync, eager)

```ts
getQuestions(query: Omit<QuestionQuery, 'lang'>): QuizQuestion[]   // no await
getQuestionById(id: string): QuizQuestion | undefined
countQuestions(query: Omit<QuestionQuery, 'lang'>): number
getCategories(): CategoryMeta[]
createQuiz(query: Omit<QuestionQuery, 'lang'>): Quiz               // sync
```

These statically import all categories for the one language and delegate to the same
pure `select()` core.

### `createQuiz` session

Deterministically pre-orders the full matching pool by `seed` (seeded shuffle), then
walks it, remembering what it served (no repeats without the caller managing `excludeIds`).

```ts
interface Quiz {
  next(): QuizQuestion | undefined
  next(n: number): QuizQuestion[]
  remaining(): number
  served(): readonly string[];        // ids served so far
  reset(): void;                       // restart the same seeded order
}
```

On the async main entry `createQuiz` returns `Promise<Quiz>` (pool loaded up front);
afterwards `.next()` is synchronous. On per-language entries `createQuiz` is fully sync.

### `toChoices` helper

```ts
toChoices(question: QuizQuestion, seed?: number): { options: string[]; correctIndex: number }
```

Exported from the main entry and both per-language entries.

## Packaging (dual CJS + ESM)

`package.json` `exports`:

```jsonc
"exports": {
  ".":    { "import": { "types": "./esm/index.d.ts",  "default": "./esm/index.js"  },
            "require": { "types": "./dist/index.d.ts", "default": "./dist/index.js" } },
  "./en": { "import": { "types": "./esm/en.d.ts",     "default": "./esm/en.js"     },
            "require": { "types": "./dist/en.d.ts",    "default": "./dist/en.js"    } },
  "./de": { "import": { "types": "./esm/de.d.ts",     "default": "./esm/de.js"     },
            "require": { "types": "./dist/de.d.ts",    "default": "./dist/de.js"    } }
}
```

- Build mirrors ts-dedent: `tsc --module commonjs --outDir dist` +
  `tsc --module es6 --outDir esm`, `rootDir: src`, `declaration: true`, target ES2022.
- `prebuild`/`preversion` runs `build-manifest.mjs` first, so `manifest.ts` and the
  `data/*/index.ts` barrels are regenerated from the data directory (never hand-edited).
- `files`: `["dist", "esm", "src"]`.
- `main`/`module`/`types` set alongside `exports` for legacy resolvers.
- Dynamic `import()` compiles correctly under both `module: commonjs` (require-based
  helper) and `module: es6`; the explicit `.js` in the dynamic specifier keeps Node ESM
  resolution working.

## Data-integrity validation (`scripts/validate-data.mjs`, also run in tests)

Over every question:
- `id` globally unique; matches `^<lang>-<category>-[0-9a-f]+$`; `lang` matches its file/dir.
- `difficulty ∈ {1,2,3,4,5}`.
- `distractors.length >= 3`, all distinct, none equal to `answer`.
- `tags` non-empty; `tags[0]` is a category that has a `CategoryMeta` entry.
- `asOf`, when present, is a valid `yyyy-mm-dd`.
- Manifest counts equal actual per-category counts.

Failure exits non-zero (used as a CI gate and inside `npm test`).

## Testing (jest + ts-jest, per ts-dedent)

- **core/select:** each filter dimension + ANDing, `count`, `excludeIds`,
  `spreadDifficulty` distribution.
- **determinism:** same seed → identical ids/order; different seed → different order;
  sync `en` entry and async main entry return the same result for the same query.
- **lazy loading:** a single-category query imports only that leaf (spy/mock the loader).
- **choices / createQuiz:** stable seeded shuffle; no repeats across `.next()`;
  `remaining()`/`reset()` behavior.
- **data integrity:** runs the validator over the shipped data.

## CI / release (mirror node-ts-dedent)

- **CI (`ci.yml`):** 3 OS (ubuntu/macos/windows) × Node 22/24/26 — `npm test`
  (lint + jest) + helper-script tests; a `pack` job → `verify-packaged` job across the
  matrix asserting CJS + ESM + types all import and a smoke query works; Codecov upload.
- **Release (`release.yml`):** `workflow_dispatch` with a semver input; OIDC trusted
  publishing with `--provenance`; dist-tag derivation (latest vs prerelease);
  HISTORY.md rolling; release-notes composition; publish-then-PR-back-to-main (never
  pushes to main directly). Port the `.github/scripts/*` helpers from ts-dedent, adapt
  names, and adapt the smoke consumer (`consumer.mjs`/`consumer.cjs`) to run a real
  `getQuestions` query against the packaged artifact.
- Tooling: eslint flat config + prettier, `tsconfig.jest.json`, `.nvmrc`, mirroring
  ts-dedent's setup adapted to Node 22+/ES2022.

## Migration (one-time, scripted & verified)

`scripts/migrate-data.mjs`:
1. For each `(lang, category)`, merge `generated/<category>.ts` + `imported/<category>.ts`
   into `src/data/<lang>/<category>.ts`.
2. Rewrite ids to `<lang>-<category>-<hash>`, dropping the source segment; verify global
   uniqueness and re-hash collisions.
3. Fix the type import path to `../../types`.
4. Move `types.ts` → `src/types.ts` (strip `source` from query type).
5. Run `build-manifest.mjs`, then `validate-data.mjs` — prove nothing broke and the total
   count still equals **7,946**.

## Out of scope (YAGNI)

- Adding new questions or expanding thin en categories (may come later).
- More than de/en languages.
- A separate `open-quiz-bank-data` package (data ships inside the one package).
- Runtime question editing / persistence beyond the in-memory `createQuiz` session.

## Open items for the implementation plan

- Exact `toChoices` behavior when `distractors` has duplicates already filtered by the
  validator (validator guarantees distinctness, so shuffle is over a clean set).
- Whether `getCategories`/manifest also exposes per-category counts publicly (cheap; likely yes).
