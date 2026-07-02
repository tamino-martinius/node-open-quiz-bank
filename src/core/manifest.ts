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
    "arts": 266,
    "film": 67,
    "food": 197,
    "geography": 557,
    "history": 425,
    "language": 39,
    "math": 194,
    "music": 37,
    "mythology": 165,
    "nature": 286,
    "science": 385,
    "space": 157,
    "sports": 260,
    "technology": 247
  },
  "de": {
    "arts": 255,
    "film": 656,
    "food": 189,
    "geography": 563,
    "history": 423,
    "language": 172,
    "math": 197,
    "music": 224,
    "mythology": 165,
    "nature": 292,
    "popculture": 703,
    "science": 385,
    "space": 161,
    "sports": 240,
    "technology": 249,
    "videogames": 490
  }
};
