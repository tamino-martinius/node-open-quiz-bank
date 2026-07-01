import type { QuizQuestion } from '../types.js';
import { createQuizFromPool } from './quiz.js';

const bank: QuizQuestion[] = [1, 2, 3, 4, 5].map((n) => ({
  id: `en-geography-${n}`,
  lang: 'en',
  prompt: `${n}`,
  answer: 'a',
  distractors: ['b', 'c', 'd'],
  tags: ['geography'],
  difficulty: 1,
}));

test('next() walks the pool without repeats, then returns undefined', () => {
  const quiz = createQuizFromPool(bank, { seed: 1 });
  const seen = new Set<string>();
  for (let i = 0; i < 5; i++) {
    const q = quiz.next();
    expect(q).toBeDefined();
    if (!q) break;
    expect(seen.has(q.id)).toBe(false);
    seen.add(q.id);
  }
  expect(quiz.next()).toBeUndefined();
  expect(quiz.remaining()).toBe(0);
  expect(quiz.served()).toHaveLength(5);
});

test('next(n) returns a batch and reset() restarts the same seeded order', () => {
  const quiz = createQuizFromPool(bank, { seed: 9 });
  const first = quiz.next(3).map((q) => q.id);
  quiz.reset();
  expect(quiz.next(3).map((q) => q.id)).toEqual(first);
  expect(quiz.remaining()).toBe(2);
});
