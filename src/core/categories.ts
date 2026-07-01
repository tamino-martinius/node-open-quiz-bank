import type { CategoryMeta } from '../types.js';

export const CATEGORIES: Record<string, CategoryMeta> = {
  geography: { id: 'geography', label: { en: 'Geography', de: 'Geografie' }, icon: '🌍' },
  history: { id: 'history', label: { en: 'History', de: 'Geschichte' }, icon: '🏛️' },
  science: { id: 'science', label: { en: 'Science', de: 'Wissenschaft' }, icon: '🔬' },
  nature: { id: 'nature', label: { en: 'Nature', de: 'Natur' }, icon: '🌿' },
  arts: { id: 'arts', label: { en: 'Arts', de: 'Kunst' }, icon: '🎨' },
  technology: { id: 'technology', label: { en: 'Technology', de: 'Technik' }, icon: '💻' },
  sports: { id: 'sports', label: { en: 'Sports', de: 'Sport' }, icon: '⚽' },
  math: { id: 'math', label: { en: 'Mathematics', de: 'Mathematik' }, icon: '➗' },
  food: { id: 'food', label: { en: 'Food & Drink', de: 'Essen & Trinken' }, icon: '🍽️' },
  space: { id: 'space', label: { en: 'Space', de: 'Weltall' }, icon: '🚀' },
  mythology: { id: 'mythology', label: { en: 'Mythology', de: 'Mythologie' }, icon: '🐉' },
  music: { id: 'music', label: { en: 'Music', de: 'Musik' }, icon: '🎵' },
  language: { id: 'language', label: { en: 'Language', de: 'Sprache' }, icon: '🗣️' },
  film: { id: 'film', label: { en: 'Film & TV', de: 'Film & TV' }, icon: '🎬' },
  popculture: { id: 'popculture', label: { en: 'Pop Culture', de: 'Popkultur' }, icon: '🌟' },
  videogames: { id: 'videogames', label: { en: 'Video Games', de: 'Videospiele' }, icon: '🎮' },
};
