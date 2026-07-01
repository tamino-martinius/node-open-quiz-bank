import type { QuizQuestion, QuestionQuery } from '../types.js';
import { mulberry32, shuffle } from './rng.js';

type CoreQuery = Omit<QuestionQuery, 'lang'> & { lang?: QuestionQuery['lang'] };

export function filterQuestions(
  questions: readonly QuizQuestion[],
  query: CoreQuery,
): QuizQuestion[] {
  const exclude = query.excludeIds ? new Set(query.excludeIds) : undefined;
  const min = query.difficulty?.min ?? 1;
  const max = query.difficulty?.max ?? 5;
  const cats = query.categories;
  const anyTags = query.tags;
  const allTags = query.allTags;
  return questions.filter((q) => {
    if (exclude?.has(q.id)) return false;
    if (q.difficulty < min || q.difficulty > max) return false;
    if (cats && !cats.includes(q.tags[0])) return false;
    if (anyTags && !anyTags.some((t) => q.tags.includes(t))) return false;
    if (allTags && !allTags.every((t) => q.tags.includes(t))) return false;
    return true;
  });
}

function spread(
  questions: readonly QuizQuestion[],
  rng: () => number,
): QuizQuestion[] {
  const buckets = new Map<number, QuizQuestion[]>();
  for (const q of questions) {
    const b = buckets.get(q.difficulty) ?? [];
    b.push(q);
    buckets.set(q.difficulty, b);
  }
  const shuffled = [...buckets.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, bucket]) => shuffle(bucket, rng));
  const out: QuizQuestion[] = [];
  let added = true;
  for (let round = 0; added; round++) {
    added = false;
    for (const b of shuffled) {
      if (round < b.length) {
        out.push(b[round]);
        added = true;
      }
    }
  }
  return out;
}

export function orderQuestions(
  questions: readonly QuizQuestion[],
  query: CoreQuery,
): QuizQuestion[] {
  const rng = query.seed === undefined ? Math.random : mulberry32(query.seed);
  return query.spreadDifficulty
    ? spread(questions, rng)
    : shuffle(questions, rng);
}

export function selectQuestions(
  questions: readonly QuizQuestion[],
  query: CoreQuery,
): QuizQuestion[] {
  const ordered = orderQuestions(filterQuestions(questions, query), query);
  return query.count === undefined ? ordered : ordered.slice(0, query.count);
}
