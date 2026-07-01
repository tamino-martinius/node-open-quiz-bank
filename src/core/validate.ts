import type { QuizQuestion } from '../types.js';

export function validateBank(
  questions: readonly QuizQuestion[],
  categoryIds: ReadonlySet<string>,
): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const q of questions) {
    if (seen.has(q.id)) errors.push(`duplicate id: ${q.id}`);
    seen.add(q.id);
    if (!/^(en|de)-[a-z]+-[0-9a-f]+$/.test(q.id)) errors.push(`bad id shape: ${q.id}`);
    if (!q.id.startsWith(`${q.lang}-`)) errors.push(`lang/id mismatch: ${q.id}`);
    if (q.difficulty < 1 || q.difficulty > 5) errors.push(`bad difficulty: ${q.id}`);
    if (q.distractors.length < 3) errors.push(`<3 distractors: ${q.id}`);
    if (new Set(q.distractors).size !== q.distractors.length) errors.push(`dup distractors: ${q.id}`);
    if (q.distractors.includes(q.answer)) errors.push(`answer in distractors: ${q.id}`);
    if (q.tags.length === 0) errors.push(`no tags: ${q.id}`);
    if (!categoryIds.has(q.tags[0])) errors.push(`unknown category ${q.tags[0]}: ${q.id}`);
    if (q.asOf !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(q.asOf)) errors.push(`bad asOf: ${q.id}`);
  }
  return errors;
}
