import { CATEGORY_IDS } from './manifest.js';
import { LOADERS } from './loaders.js';

test('LOADERS has a working loader for every manifest category', async () => {
  for (const lang of ['en', 'de'] as const) {
    for (const category of CATEGORY_IDS[lang]) {
      const mod = await LOADERS[lang][category]();
      expect(mod.QUESTIONS.length).toBeGreaterThan(0);
    }
  }
});
