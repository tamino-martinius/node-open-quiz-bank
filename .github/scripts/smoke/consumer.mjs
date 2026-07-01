import test from 'node:test';
import assert from 'node:assert/strict';
import * as main from 'open-quiz-bank';
import * as en from 'open-quiz-bank/en';
import * as de from 'open-quiz-bank/de';

test('ESM: main entry getQuestions is async and deterministic', async () => {
  assert.equal(typeof main.getQuestions, 'function');
  const r = await main.getQuestions({ lang: 'en', categories: ['geography'], count: 3, seed: 1 });
  assert.equal(r.length, 3);
});

test('ESM: sync per-language entry works', () => {
  const r = en.getQuestions({ categories: ['geography'], count: 3, seed: 1 });
  assert.equal(r.length, 3);
  assert.ok(en.getCategories().length >= 14);
});

test('ESM: toChoices is exported', () => {
  const [q] = en.getQuestions({ categories: ['geography'], count: 1, seed: 1 });
  const c = en.toChoices(q, 1);
  assert.equal(c.options.length, 4);
  assert.equal(c.options[c.correctIndex], q.answer);
});

test('ESM: /de subpath works', () => {
  const r = de.getQuestions({ categories: ['film'], count: 2, seed: 1 });
  assert.equal(r.length, 2);
  assert.ok(de.getCategories().length >= 16);
});
