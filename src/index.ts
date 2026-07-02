import type {
  QuizQuestion,
  QuestionQuery,
  CategoryMeta,
  Lang,
  Quiz,
} from './types.js';
import { selectQuestions, filterQuestions } from './core/select.js';
import { createQuizFromPool } from './core/quiz.js';
import { CATEGORIES } from './core/categories.js';
import { CATEGORY_IDS } from './core/manifest.js';
import { LOADERS } from './core/loaders.js';

export type {
  QuizQuestion,
  QuestionQuery,
  CategoryMeta,
  Lang,
  Quiz,
  Difficulty,
  DifficultyRange,
  Choices,
} from './types.js';
export { toChoices } from './core/choices.js';

async function loadCategory(
  lang: Lang,
  category: string,
): Promise<readonly QuizQuestion[]> {
  const load = LOADERS[lang][category];
  if (!load) return [];
  const mod = await load();
  return mod.QUESTIONS;
}

async function loadPool(query: QuestionQuery): Promise<QuizQuestion[]> {
  const cats = query.categories ?? CATEGORY_IDS[query.lang];
  const chunks = await Promise.all(
    cats.map((c) => loadCategory(query.lang, c)),
  );
  return chunks.flat();
}

export async function getQuestions(
  query: QuestionQuery,
): Promise<QuizQuestion[]> {
  return selectQuestions(await loadPool(query), query);
}

export async function countQuestions(query: QuestionQuery): Promise<number> {
  return filterQuestions(await loadPool(query), query).length;
}

export async function getQuestionById(
  lang: Lang,
  id: string,
): Promise<QuizQuestion | undefined> {
  const category = CATEGORY_IDS[lang].find((cat) =>
    id.startsWith(`${lang}-${cat}-`),
  );
  if (!category) return undefined;
  return (await loadCategory(lang, category)).find((q) => q.id === id);
}

export function getCategories(lang: Lang): CategoryMeta[] {
  return CATEGORY_IDS[lang].map((id) => CATEGORIES[id]);
}

export async function createQuiz(query: QuestionQuery): Promise<Quiz> {
  return createQuizFromPool(await loadPool(query), query);
}
