import type { Lang } from '../types.js';

export const CATEGORY_IDS: Record<Lang, readonly string[]> = {
  "en": [
    "arts",
    "film",
    "food",
    "geography",
    "history",
    "language",
    "math",
    "music",
    "mythology",
    "nature",
    "science",
    "space",
    "sports",
    "technology"
  ],
  "de": [
    "arts",
    "film",
    "food",
    "geography",
    "history",
    "language",
    "math",
    "music",
    "mythology",
    "nature",
    "popculture",
    "science",
    "space",
    "sports",
    "technology",
    "videogames"
  ]
};

export const COUNTS: Record<Lang, Readonly<Record<string, number>>> = {
  "en": {
    "arts": 225,
    "film": 12,
    "food": 161,
    "geography": 539,
    "history": 361,
    "language": 12,
    "math": 181,
    "music": 13,
    "mythology": 151,
    "nature": 269,
    "science": 348,
    "space": 155,
    "sports": 221,
    "technology": 223
  },
  "de": {
    "arts": 232,
    "film": 630,
    "food": 165,
    "geography": 552,
    "history": 376,
    "language": 159,
    "math": 187,
    "music": 207,
    "mythology": 151,
    "nature": 278,
    "popculture": 690,
    "science": 348,
    "space": 159,
    "sports": 222,
    "technology": 229,
    "videogames": 490
  }
};
