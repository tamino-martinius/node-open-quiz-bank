import { CATEGORIES } from './categories.js';

test('every expected category has en+de labels and an icon', () => {
  const ids = [
    'geography','history','science','nature','arts','technology','sports','math',
    'food','space','mythology','music','language','film','popculture','videogames',
  ];
  for (const id of ids) {
    const meta = CATEGORIES[id];
    expect(meta).toBeDefined();
    expect(meta.id).toBe(id);
    expect(meta.label.en.length).toBeGreaterThan(0);
    expect(meta.label.de.length).toBeGreaterThan(0);
    expect(meta.icon.length).toBeGreaterThan(0);
  }
});
