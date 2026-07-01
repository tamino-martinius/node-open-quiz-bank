export type Lang = 'en' | 'de';
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface QuizQuestion {
  id: string;
  lang: Lang;
  prompt: string;
  answer: string;
  distractors: string[];
  tags: string[];
  difficulty: Difficulty;
  asOf?: string;
  source?: string;
  explanation?: string;
}

export interface CategoryMeta {
  id: string;
  label: Record<Lang, string>;
  icon: string;
}

export interface DifficultyRange {
  min?: Difficulty;
  max?: Difficulty;
}

export interface QuestionQuery {
  lang: Lang;
  categories?: string[];
  tags?: string[];
  allTags?: string[];
  difficulty?: DifficultyRange;
  count?: number;
  seed?: number;
  excludeIds?: Iterable<string>;
  spreadDifficulty?: boolean;
}

export interface Choices {
  options: string[];
  correctIndex: number;
}

export interface Quiz {
  next(): QuizQuestion | undefined;
  next(n: number): QuizQuestion[];
  remaining(): number;
  served(): readonly string[];
  reset(): void;
}
