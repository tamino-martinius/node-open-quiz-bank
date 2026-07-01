import { existsSync } from 'node:fs';

test('toolchain is wired: build-markers helper exists', () => {
  expect(existsSync('.github/scripts/write-build-markers.mjs')).toBe(true);
});
