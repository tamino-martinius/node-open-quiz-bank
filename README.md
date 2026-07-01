# open-quiz-bank

[![CI](https://github.com/tamino-martinius/node-open-quiz-bank/actions/workflows/ci.yml/badge.svg)](https://github.com/tamino-martinius/node-open-quiz-bank/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/open-quiz-bank)](https://www.npmjs.com/package/open-quiz-bank)

Open, seedable bilingual (English + German) quiz question bank with a small query API.

- **~7,946 questions** across English (14 categories, 2,871 questions) and German (16 categories, 5,075 questions)
- **Seeded, deterministic** selection — same seed always returns the same questions
- **Dual CJS + ESM** build; tree-shakeable per-language sync entries
- **Code license:** MIT — **Question data license:** CC0-1.0

## Licensing and provenance

| Asset | License |
|-------|---------|
| Source code (`src/`, `dist/`, `esm/`) | MIT |
| Question data (`src/data/`) | CC0-1.0 |

All questions were authored by the maintainer with AI assistance and manually fact-checked. No third-party share-alike or copyrighted content was used, so the CC0 dedication is clean.

## Install

```bash
npm install open-quiz-bank
```

Requires Node.js >= 22.

## Quick start

### Async main entry

The default entry (`open-quiz-bank`) lazy-loads only the categories you request, which lets bundlers (Webpack, Vite, esbuild) code-split each category module automatically.

```ts
import { getQuestions, getCategories, createQuiz, toChoices } from 'open-quiz-bank';

// Fetch up to 10 seeded English geography questions at difficulty 1–3
const qs = await getQuestions({
  lang: 'en',
  categories: ['geography'],
  difficulty: { min: 1, max: 3 },
  count: 10,
  seed: 42,
});

console.log(qs[0].prompt);

// List available categories for a language (synchronous)
const cats = getCategories('en');
cats.forEach((c) => console.log(c.id, c.label.en));
```

### Sync per-language entry

The `/en` and `/de` sub-entries eagerly bundle all questions for that language at import time. They expose the same API without `await` and without a `lang` parameter.

```ts
import { getQuestions, getCategories, createQuiz, toChoices } from 'open-quiz-bank/en';

// No await — questions are already in memory
const qs = getQuestions({ categories: ['history'], count: 10, seed: 42 });
console.log(qs.length); // up to 10

const cats = getCategories();
```

```ts
import { getQuestions } from 'open-quiz-bank/de';

const qs = getQuestions({ categories: ['videogames'], count: 5, seed: 123 });
```

## Quiz sessions

`createQuiz` returns a stateful `Quiz` object that lets you step through questions one at a time (or in batches) and reset back to the start.

```ts
import { createQuiz, toChoices } from 'open-quiz-bank';

// A quiz session walks the FULL matching pool in a seeded order — it does NOT
// use `count`. Narrow the query (categories / tags / difficulty) to size the pool.
const quiz = await createQuiz({ lang: 'en', categories: ['science'], seed: 7 });

const first = quiz.next();          // one question (undefined once exhausted)
const nextThree = quiz.next(3);     // a batch of the next three
console.log(quiz.remaining());      // questions left = poolSize - 4
console.log(quiz.served().length);  // 4

quiz.reset();                       // restart the identical seeded order
```

`toChoices` can also be used standalone with a sync per-language import:

```ts
import { getQuestions, toChoices } from 'open-quiz-bank/en';

const [q] = getQuestions({ count: 1, seed: 5 });
const { options, correctIndex } = toChoices(q, 5);
```

## Seed / determinism contract

- When `seed` is provided, `getQuestions`, `createQuiz`, and `toChoices` are fully deterministic: the same seed always returns the same questions in the same order with the same shuffled choices.
- When `seed` is omitted, selection order and `toChoices` shuffling use `Math.random()`.
- The `count` parameter is a soft cap: you may receive fewer results if the filtered pool is smaller.
- `createQuiz` ignores `count` — a session always walks the full matching pool in the seeded order. To get a fixed number of questions, use `getQuestions({ …, count })`; to make a shorter session, narrow the query with `categories` / `tags` / `difficulty`.

## API reference

### Main entry (`open-quiz-bank`) — async

| Function | Signature | Returns |
|----------|-----------|---------|
| `getQuestions` | `(query: QuestionQuery) => Promise<QuizQuestion[]>` | Filtered + seeded selection |
| `countQuestions` | `(query: QuestionQuery) => Promise<number>` | Count without loading all data |
| `getQuestionById` | `(lang: Lang, id: string) => Promise<QuizQuestion \| undefined>` | Single question by ID |
| `getCategories` | `(lang: Lang) => CategoryMeta[]` | Category list (sync) |
| `createQuiz` | `(query: QuestionQuery) => Promise<Quiz>` | Stateful quiz session |
| `toChoices` | `(question: QuizQuestion, seed?: number) => Choices` | Shuffled answer options |

### Per-language entries (`open-quiz-bank/en`, `open-quiz-bank/de`) — sync

Same function names, all synchronous; no `lang` parameter needed.

| Function | Signature | Returns |
|----------|-----------|---------|
| `getQuestions` | `(query?: Omit<QuestionQuery, 'lang'>) => QuizQuestion[]` | Filtered + seeded selection |
| `countQuestions` | `(query?: Omit<QuestionQuery, 'lang'>) => number` | Count |
| `getQuestionById` | `(id: string) => QuizQuestion \| undefined` | Single question by ID |
| `getCategories` | `() => CategoryMeta[]` | Category list |
| `createQuiz` | `(query?: Omit<QuestionQuery, 'lang'>) => Quiz` | Stateful quiz session |
| `toChoices` | `(question: QuizQuestion, seed?: number) => Choices` | Shuffled answer options |

### Types

```ts
type Lang = 'en' | 'de';
type Difficulty = 1 | 2 | 3 | 4 | 5;

interface QuizQuestion {
  id: string;
  lang: Lang;
  prompt: string;
  answer: string;
  distractors: string[];
  tags: string[];
  difficulty: Difficulty;
  asOf?: string;
  source?: string;
  explanation?: string;
}

interface QuestionQuery {
  lang: Lang;            // required on the main entry
  categories?: string[];
  tags?: string[];       // any of these tags (OR)
  allTags?: string[];    // all of these tags (AND)
  difficulty?: { min?: Difficulty; max?: Difficulty };
  count?: number;        // soft cap on results
  seed?: number;         // deterministic selection when set
  excludeIds?: Iterable<string>;
  spreadDifficulty?: boolean; // spread selected questions evenly across difficulty levels
}

interface Choices {
  options: string[];     // shuffled [answer, ...distractors]
  correctIndex: number;  // index of the correct answer in options
}

interface Quiz {
  next(): QuizQuestion | undefined;
  next(n: number): QuizQuestion[];
  remaining(): number;
  served(): readonly string[];
  reset(): void;
}

interface CategoryMeta {
  id: string;
  label: Record<Lang, string>;
  icon: string;
}
```

## Categories

### English (14 categories, 2,871 questions)

`arts`, `film`, `food`, `geography`, `history`, `language`, `math`, `music`, `mythology`, `nature`, `science`, `space`, `sports`, `technology`

### German (16 categories, 5,075 questions)

`arts`, `film`, `food`, `geography`, `history`, `language`, `math`, `music`, `mythology`, `nature`, `popculture`, `science`, `space`, `sports`, `technology`, `videogames`

## Bundler code-splitting note

The main entry (`open-quiz-bank`) uses dynamic `import('./data/${lang}/${category}.js')` expressions with a literal path prefix. Bundlers that analyse static import patterns (Webpack, Vite, esbuild) will code-split each category into its own chunk automatically. If you only ever query a single language or a few categories, your bundle will only include those chunks.

The per-language entries (`/en`, `/de`) eagerly import everything for that language; prefer them for server-side usage where startup cost is acceptable and you want the simpler sync API.

## Contributing

Question data is generated with AI assistance and validated programmatically. To add or update questions:

1. Edit the data generation scripts (see `scripts/`).
2. Rebuild the data files and manifest: `npm run gen`
3. Run the full test suite (includes data-integrity checks): `npm test`

The data-integrity suite enforces: unique IDs, valid difficulty values (1–5), at least one distractor per question, and correct language tags.
