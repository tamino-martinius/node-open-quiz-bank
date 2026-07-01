import { getQuestions, countQuestions, getQuestionById, getCategories, createQuiz } from './index.js';

test('getQuestions loads a category lazily and is deterministic', async () => {
  const a = await getQuestions({ lang: 'en', categories: ['geography'], count: 5, seed: 1 });
  const b = await getQuestions({ lang: 'en', categories: ['geography'], count: 5, seed: 1 });
  expect(a).toHaveLength(5);
  expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  expect(a.every((q) => q.tags[0] === 'geography')).toBe(true);
});

test('countQuestions counts matches', async () => {
  expect(await countQuestions({ lang: 'en', categories: ['geography'] })).toBe(539);
});

test('getQuestionById finds by id', async () => {
  const [q] = await getQuestions({ lang: 'en', categories: ['geography'], count: 1, seed: 2 });
  expect((await getQuestionById('en', q.id))!.id).toBe(q.id);
  expect(await getQuestionById('en', 'en-geography-does-not-exist')).toBeUndefined();
});

test('getCategories is per-language and sync', () => {
  expect(getCategories('en').map((c) => c.id)).not.toContain('popculture');
  expect(getCategories('de').map((c) => c.id)).toContain('popculture');
  expect(getCategories('en')).toHaveLength(14);
  expect(getCategories('de')).toHaveLength(16);
});

test('getQuestionById returns undefined when the id lang does not match', async () => {
  const [q] = await getQuestions({ lang: 'en', categories: ['geography'], count: 1, seed: 2 });
  expect(await getQuestionById('de', q.id)).toBeUndefined();
});

test('createQuiz resolves a session that walks without repeats', async () => {
  const quiz = await createQuiz({ lang: 'en', categories: ['space'], seed: 3 });
  const first = quiz.next();
  const second = quiz.next();
  expect(first!.id).not.toBe(second!.id);
});

test('createQuiz walks several questions without repeats', async () => {
  const quiz = await createQuiz({ lang: 'en', categories: ['space'], seed: 3 });
  const ids = [quiz.next(), quiz.next(), quiz.next(), quiz.next(), quiz.next()]
    .filter(Boolean)
    .map((q) => q!.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(ids.length).toBeGreaterThanOrEqual(5);
});
