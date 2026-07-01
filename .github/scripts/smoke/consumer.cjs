'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const main = require('open-quiz-bank');
const en = require('open-quiz-bank/en');

test('CJS: main entry getQuestions resolves', async () => {
  const r = await main.getQuestions({ lang: 'de', categories: ['film'], count: 2, seed: 1 });
  assert.equal(r.length, 2);
});

test('CJS: sync per-language entry works', () => {
  const r = en.getQuestions({ categories: ['space'], count: 2, seed: 1 });
  assert.equal(r.length, 2);
});
