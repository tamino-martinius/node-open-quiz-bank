import { CATEGORY_IDS, COUNTS } from './manifest.js';

test('manifest lists per-language categories and counts summing to totals', () => {
  expect(CATEGORY_IDS.en).toContain('geography');
  expect(CATEGORY_IDS.de).toContain('popculture');
  expect(CATEGORY_IDS.en).not.toContain('popculture');
  const sum = (r: Readonly<Record<string, number>>) => Object.values(r).reduce((a, b) => a + b, 0);
  expect(sum(COUNTS.en)).toBe(2871);
  expect(sum(COUNTS.de)).toBe(5075);
});
