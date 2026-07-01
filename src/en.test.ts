import * as en from './en.js';
import { getQuestions as asyncGet } from './index.js';

test('sync en.getQuestions matches async main entry for the same query+seed', async () => {
  const sync = en.getQuestions({ categories: ['geography'], count: 5, seed: 1 });
  const asyncR = await asyncGet({ lang: 'en', categories: ['geography'], count: 5, seed: 1 });
  expect(sync.map((q) => q.id)).toEqual(asyncR.map((q) => q.id));
});

test('sync getCategories and getQuestionById work without await', () => {
  expect(en.getCategories().map((c) => c.id)).toContain('history');
  const [q] = en.getQuestions({ categories: ['history'], count: 1, seed: 4 });
  expect(en.getQuestionById(q.id)!.id).toBe(q.id);
});
