import type { QuizQuestion } from '../../types.js';
import { QUESTIONS as arts } from './arts.js';
import { QUESTIONS as film } from './film.js';
import { QUESTIONS as food } from './food.js';
import { QUESTIONS as geography } from './geography.js';
import { QUESTIONS as history } from './history.js';
import { QUESTIONS as language } from './language.js';
import { QUESTIONS as math } from './math.js';
import { QUESTIONS as music } from './music.js';
import { QUESTIONS as mythology } from './mythology.js';
import { QUESTIONS as nature } from './nature.js';
import { QUESTIONS as science } from './science.js';
import { QUESTIONS as space } from './space.js';
import { QUESTIONS as sports } from './sports.js';
import { QUESTIONS as technology } from './technology.js';

export const BY_CATEGORY: Record<string, readonly QuizQuestion[]> = { arts, film, food, geography, history, language, math, music, mythology, nature, science, space, sports, technology };
export const QUESTIONS: readonly QuizQuestion[] = [...arts, ...film, ...food, ...geography, ...history, ...language, ...math, ...music, ...mythology, ...nature, ...science, ...space, ...sports, ...technology];
