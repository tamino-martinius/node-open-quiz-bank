import { CATEGORY_IDS, COUNTS } from './manifest.js';
import { CATEGORIES } from './categories.js';

test('manifest lists per-language categories and counts summing to totals', () => {
  expect(CATEGORY_IDS.en).toContain('geography');
  expect(CATEGORY_IDS.de).toContain('popculture');
  expect(CATEGORY_IDS.en).not.toContain('popculture');
  const sum = (r: Readonly<Record<string, number>>) => Object.values(r).reduce((a, b) => a + b, 0);
  expect(sum(COUNTS.en)).toBe(2871);
  expect(sum(COUNTS.de)).toBe(5075);
});

test('every manifest category id has metadata (no manifest→meta drift)', () => {
  for (const lang of ['en', 'de'] as const) {
    for (const id of CATEGORY_IDS[lang]) {
      expect(CATEGORIES[id]).toBeDefined();
    }
  }
});
