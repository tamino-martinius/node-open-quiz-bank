import { QUESTIONS } from './data/de/index.js';
import { CATEGORY_IDS } from './core/manifest.js';
import { createLanguageApi } from './core/language-api.js';

export type {
  QuizQuestion,
  QuestionQuery,
  CategoryMeta,
  Quiz,
  Lang,
  Difficulty,
  DifficultyRange,
  Choices,
} from './types.js';
export { toChoices } from './core/choices.js';

const api = createLanguageApi(QUESTIONS, CATEGORY_IDS.de);
export const getQuestions = api.getQuestions;
export const countQuestions = api.countQuestions;
export const getQuestionById = api.getQuestionById;
export const getCategories = api.getCategories;
export const createQuiz = api.createQuiz;
