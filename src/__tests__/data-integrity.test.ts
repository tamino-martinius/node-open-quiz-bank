import { QUESTIONS as EN } from '../data/en/index.js';
import { QUESTIONS as DE } from '../data/de/index.js';
import { CATEGORIES } from '../core/categories.js';
import { COUNTS } from '../core/manifest.js';
import { validateBank } from '../core/validate.js';

const categoryIds = new Set(Object.keys(CATEGORIES));

test('en data is valid', () => {
  expect(validateBank(EN, categoryIds)).toEqual([]);
});

test('de data is valid', () => {
  expect(validateBank(DE, categoryIds)).toEqual([]);
});

test('manifest counts match actual per-category counts', () => {
  const actual: Record<string, number> = {};
  for (const q of [...EN, ...DE]) {
    const key = `${q.lang}:${q.tags[0]}`;
    actual[key] = (actual[key] ?? 0) + 1;
  }
  for (const lang of ['en', 'de'] as const)
    for (const [cat, n] of Object.entries(COUNTS[lang]))
      expect(actual[`${lang}:${cat}`]).toBe(n);
});

test('totals hold', () => {
  expect(EN).toHaveLength(2871);
  expect(DE).toHaveLength(5075);
});
