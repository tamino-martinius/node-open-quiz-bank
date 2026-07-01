import type {
  QuizQuestion,
  QuestionQuery,
  CategoryMeta,
  Quiz,
} from '../types.js';
import { selectQuestions, filterQuestions } from './select.js';
import { createQuizFromPool } from './quiz.js';
import { CATEGORIES } from './categories.js';

type Query = Omit<QuestionQuery, 'lang'>;

export interface LanguageApi {
  getQuestions(query?: Query): QuizQuestion[];
  countQuestions(query?: Query): number;
  getQuestionById(id: string): QuizQuestion | undefined;
  getCategories(): CategoryMeta[];
  createQuiz(query?: Query): Quiz;
}

/** Build the synchronous, single-language API over an in-memory question pool. */
export function createLanguageApi(
  questions: readonly QuizQuestion[],
  categoryIds: readonly string[],
): LanguageApi {
  return {
    getQuestions: (query = {}) => selectQuestions(questions, query),
    countQuestions: (query = {}) => filterQuestions(questions, query).length,
    getQuestionById: (id) => questions.find((q) => q.id === id),
    getCategories: () => categoryIds.map((id) => CATEGORIES[id]),
    createQuiz: (query = {}) => createQuizFromPool(questions, query),
  };
}
