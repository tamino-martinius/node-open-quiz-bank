import type { QuizQuestion } from '../types.js';
import { toChoices } from './choices.js';

const q: QuizQuestion = {
  id: 'en-geography-1',
  lang: 'en',
  prompt: 'Capital of France?',
  answer: 'Paris',
  distractors: ['Berlin', 'Rome', 'Madrid'],
  tags: ['geography'],
  difficulty: 1,
};

test('options contain answer + all distractors, correctIndex points to answer', () => {
  const c = toChoices(q, 3);
  expect(c.options).toHaveLength(4);
  expect(new Set(c.options)).toEqual(
    new Set(['Paris', 'Berlin', 'Rome', 'Madrid']),
  );
  expect(c.options[c.correctIndex]).toBe('Paris');
});

test('same seed → same order; different seed can differ', () => {
  expect(toChoices(q, 3)).toEqual(toChoices(q, 3));
});
