import type { QuizQuestion } from '../types.js';
import { filterQuestions, selectQuestions } from './select.js';

const Q = (
  id: string,
  difficulty: 1 | 2 | 3 | 4 | 5,
  tags: string[],
): QuizQuestion => ({
  id,
  lang: 'en',
  prompt: id,
  answer: 'a',
  distractors: ['b', 'c', 'd'],
  tags,
  difficulty,
});

const bank: QuizQuestion[] = [
  Q('en-geography-1', 1, ['geography', 'europe']),
  Q('en-geography-2', 3, ['geography', 'asia']),
  Q('en-history-3', 2, ['history']),
  Q('en-history-4', 5, ['history', 'europe']),
];

test('filters by category (tags[0])', () => {
  expect(
    filterQuestions(bank, { categories: ['geography'] }).map((q) => q.id),
  ).toEqual(['en-geography-1', 'en-geography-2']);
});

test('filters by difficulty range (inclusive)', () => {
  expect(
    filterQuestions(bank, { difficulty: { min: 2, max: 3 } }).map((q) => q.id),
  ).toEqual(['en-geography-2', 'en-history-3']);
});

test('tags = OR, allTags = AND', () => {
  expect(filterQuestions(bank, { tags: ['europe'] }).map((q) => q.id)).toEqual([
    'en-geography-1',
    'en-history-4',
  ]);
  expect(
    filterQuestions(bank, { allTags: ['history', 'europe'] }).map((q) => q.id),
  ).toEqual(['en-history-4']);
});

test('excludeIds removes questions', () => {
  expect(
    filterQuestions(bank, { excludeIds: ['en-geography-1'] }).map((q) => q.id),
  ).toEqual(['en-geography-2', 'en-history-3', 'en-history-4']);
});

test('selectQuestions is deterministic for a seed and respects count', () => {
  const a = selectQuestions(bank, { seed: 5, count: 2 });
  const b = selectQuestions(bank, { seed: 5, count: 2 });
  expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  expect(a).toHaveLength(2);
});

test('spreadDifficulty round-robins across difficulty buckets', () => {
  const spreadBank: QuizQuestion[] = [
    Q('en-a-1', 1, ['a']),
    Q('en-a-2', 1, ['a']),
    Q('en-a-3', 1, ['a']),
    Q('en-b-1', 2, ['b']),
    Q('en-b-2', 2, ['b']),
    Q('en-b-3', 2, ['b']),
  ];
  const out = selectQuestions(spreadBank, { seed: 1, spreadDifficulty: true });
  // Round-robin over difficulty buckets sorted ascending: 1,2,1,2,1,2 — this
  // interleaving is seed-independent (seed only permutes WITHIN each bucket).
  expect(out.map((q) => q.difficulty)).toEqual([1, 2, 1, 2, 1, 2]);
  // and it must still be a permutation of the whole pool
  expect(out.map((q) => q.id).sort()).toEqual(
    spreadBank.map((q) => q.id).sort(),
  );
});
