import type { QuizQuestion, QuestionQuery } from '../types.js';

test('types compile and shape a question', () => {
  const q: QuizQuestion = {
    id: 'en-geography-abc123',
    lang: 'en',
    prompt: 'Capital of France?',
    answer: 'Paris',
    distractors: ['Berlin', 'Rome', 'Madrid'],
    tags: ['geography', 'capitals'],
    difficulty: 1,
  };
  const query: QuestionQuery = { lang: 'en', categories: ['geography'], seed: 1 };
  expect(q.id).toMatch(/^en-geography-/);
  expect(query.lang).toBe('en');
});
