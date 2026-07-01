import type { QuizQuestion, Choices } from '../types.js';
import { mulberry32, shuffle } from './rng.js';

/** Seeded, stable shuffle of [answer, ...distractors]; returns options + the answer's index. */
export function toChoices(question: QuizQuestion, seed?: number): Choices {
  const rng = seed === undefined ? Math.random : mulberry32(seed);
  const options = shuffle([question.answer, ...question.distractors], rng);
  return { options, correctIndex: options.indexOf(question.answer) };
}
