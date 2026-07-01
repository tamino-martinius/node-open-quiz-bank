import type { QuizQuestion, QuestionQuery, Quiz } from '../types.js';
import { filterQuestions, orderQuestions } from './select.js';

export function createQuizFromPool(
  questions: readonly QuizQuestion[],
  query: Omit<QuestionQuery, 'lang'>,
): Quiz {
  const order = orderQuestions(filterQuestions(questions, query), query);
  let cursor = 0;
  const servedIds: string[] = [];

  function next(n?: number): QuizQuestion | QuizQuestion[] | undefined {
    if (n === undefined) {
      const q = order[cursor];
      if (q === undefined) return undefined;
      cursor += 1;
      servedIds.push(q.id);
      return q;
    }
    const batch = order.slice(cursor, cursor + n);
    cursor += batch.length;
    for (const q of batch) servedIds.push(q.id);
    return batch;
  }

  return {
    next: next as Quiz['next'],
    remaining: () => order.length - cursor,
    served: () => servedIds.slice(),
    reset: () => {
      cursor = 0;
      servedIds.length = 0;
    },
  };
}
