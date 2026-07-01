'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const main = require('open-quiz-bank');
const en = require('open-quiz-bank/en');
const de = require('open-quiz-bank/de');

test('CJS: main entry getQuestions resolves', async () => {
  const r = await main.getQuestions({ lang: 'de', categories: ['film'], count: 2, seed: 1 });
  assert.equal(r.length, 2);
});

test('CJS: sync per-language entry works', () => {
  const r = en.getQuestions({ categories: ['space'], count: 2, seed: 1 });
  assert.equal(r.length, 2);
});

test('CJS: /de subpath works', () => {
  const r = de.getQuestions({ categories: ['film'], count: 2, seed: 1 });
  assert.equal(r.length, 2);
});

test('CJS: toChoices is exported and correct', () => {
  const [q] = en.getQuestions({ categories: ['space'], count: 1, seed: 1 });
  const c = en.toChoices(q, 1);
  assert.equal(c.options.length, 4);
  assert.equal(c.options[c.correctIndex], q.answer);
});
