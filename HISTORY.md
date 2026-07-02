# History

## vNext

TBD

## v1.0.0

- **Package created:** initial release of `open-quiz-bank`.
- **Async main entry** (`open-quiz-bank`): `getQuestions`, `countQuestions`, `getQuestionById`, `getCategories`, `createQuiz`, `toChoices` — lazy per-category loading enables bundler code-splitting.
- **Sync per-language entries** (`open-quiz-bank/en`, `open-quiz-bank/de`): same API surface without `await`; eagerly loads all questions for the selected language.
- **Seeded, deterministic selection**: pass a numeric `seed` to get reproducible question order; supports `count`, `difficulty` range, `tags`/`allTags`, `spreadDifficulty`, and `excludeIds` filters.
- **Quiz sessions** (`createQuiz`): stateful `Quiz` object with `next()` / `next(n)`, `remaining()`, `served()`, and `reset()`.
- **`toChoices`**: seeded shuffle of `[answer, ...distractors]` returning `{ options, correctIndex }`.
- **~7,946 bilingual questions**: English (14 categories, 2,871 questions) and German (16 categories, 5,075 questions). All questions authored by the maintainer, AI-assisted and fact-checked.
- **Dual CJS + ESM build** (`dist/` + `esm/`) with full TypeScript declarations.
- **Data license CC0-1.0, code license MIT.**
- **CI** (lint + test + build on every push/PR) and **OIDC-based automated npm release** workflow.
