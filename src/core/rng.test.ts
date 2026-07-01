import { mulberry32, shuffle } from './rng.js';

test('mulberry32 is deterministic for a seed', () => {
  const a = mulberry32(42);
  const b = mulberry32(42);
  const seqA = [a(), a(), a()];
  const seqB = [b(), b(), b()];
  expect(seqA).toEqual(seqB);
  expect(seqA[0]).toBeGreaterThanOrEqual(0);
  expect(seqA[0]).toBeLessThan(1);
});

test('mulberry32 differs across seeds', () => {
  expect(mulberry32(1)()).not.toEqual(mulberry32(2)());
});

test('shuffle is a permutation and deterministic for a fixed rng', () => {
  const input = [1, 2, 3, 4, 5];
  const out1 = shuffle(input, mulberry32(7));
  const out2 = shuffle(input, mulberry32(7));
  expect(out1).toEqual(out2);
  expect([...out1].sort()).toEqual([1, 2, 3, 4, 5]);
  expect(input).toEqual([1, 2, 3, 4, 5]); // input untouched
});
