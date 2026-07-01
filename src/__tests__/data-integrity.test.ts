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

test('manifest counts exactly match actual per-category counts (both directions)', () => {
  const actual = { en: {} as Record<string, number>, de: {} as Record<string, number> };
  for (const q of EN) actual.en[q.tags[0]] = (actual.en[q.tags[0]] ?? 0) + 1;
  for (const q of DE) actual.de[q.tags[0]] = (actual.de[q.tags[0]] ?? 0) + 1;
  expect(actual.en).toEqual(COUNTS.en);
  expect(actual.de).toEqual(COUNTS.de);
});

test('totals hold', () => {
  expect(EN).toHaveLength(2871);
  expect(DE).toHaveLength(5075);
});
