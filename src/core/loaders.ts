import type { Lang, QuizQuestion } from '../types.js';

type CategoryModule = { QUESTIONS: readonly QuizQuestion[] };

/** One literal-path import() per category — required so bundlers can code-split; see build-manifest.mjs. */
export const LOADERS: Record<Lang, Record<string, () => Promise<CategoryModule>>> = {
  "en": {
    "arts": () => import('../data/en/arts.js'),
    "film": () => import('../data/en/film.js'),
    "food": () => import('../data/en/food.js'),
    "geography": () => import('../data/en/geography.js'),
    "history": () => import('../data/en/history.js'),
    "language": () => import('../data/en/language.js'),
    "math": () => import('../data/en/math.js'),
    "music": () => import('../data/en/music.js'),
    "mythology": () => import('../data/en/mythology.js'),
    "nature": () => import('../data/en/nature.js'),
    "science": () => import('../data/en/science.js'),
    "space": () => import('../data/en/space.js'),
    "sports": () => import('../data/en/sports.js'),
    "technology": () => import('../data/en/technology.js'),
  },
  "de": {
    "arts": () => import('../data/de/arts.js'),
    "film": () => import('../data/de/film.js'),
    "food": () => import('../data/de/food.js'),
    "geography": () => import('../data/de/geography.js'),
    "history": () => import('../data/de/history.js'),
    "language": () => import('../data/de/language.js'),
    "math": () => import('../data/de/math.js'),
    "music": () => import('../data/de/music.js'),
    "mythology": () => import('../data/de/mythology.js'),
    "nature": () => import('../data/de/nature.js'),
    "popculture": () => import('../data/de/popculture.js'),
    "science": () => import('../data/de/science.js'),
    "space": () => import('../data/de/space.js'),
    "sports": () => import('../data/de/sports.js'),
    "technology": () => import('../data/de/technology.js'),
    "videogames": () => import('../data/de/videogames.js'),
  },
};
