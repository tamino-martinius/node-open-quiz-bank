// ── Quiz question library: schema & query types ──
//
// A reusable bank of trivia questions for quiz games. Questions are tagged
// (so games can build categories), difficulty-ranked (so games can balance
// rounds), exist in German and/or English as independent sets, and carry an
// optional `asOf` date for answers that can drift over time.

/** Supported languages. German and English are independent question sets. */
export type Lang = 'en' | 'de';

/** 1 = easiest (household-name facts) … 5 = hardest (specialist trivia). */
export type Difficulty = 1 | 2 | 3 | 4 | 5;

/** A single multiple-choice question with a known, correct answer. */
export interface QuizQuestion {
  /** Stable, unique, language-suffixed id, e.g. `geo-capital-france-en`. */
  id: string;
  lang: Lang;
  /** The question prompt shown to the player. */
  prompt: string;
  /** The canonical correct answer. */
  answer: string;
  /** Plausible wrong options (always ≥3 here, so games can render 4-way MC). */
  distractors: string[];
  /** Tags for filtering. `tags[0]` is the primary category; the rest are facets. */
  tags: string[];
  difficulty: Difficulty;
  /**
   * ISO `yyyy-mm-dd` the answer was verified. REQUIRED for volatile facts whose
   * answer can change; omitted for stable facts (capitals, element symbols…).
   */
  asOf?: string;
  /** Optional provenance / how the answer is known. */
  source?: string;
  /** Optional one-liner shown after answering. */
  explanation?: string;
}

/** Display metadata for a primary category (a tag used as `tags[0]`). */
export interface CategoryMeta {
  /** The tag string, e.g. `geography`. */
  id: string;
  /** Human label per language. */
  label: Record<Lang, string>;
  /** Emoji glyph for cards/menus. */
  icon: string;
}

/** Inclusive difficulty band. */
export interface DifficultyRange {
  min?: Difficulty;
  max?: Difficulty;
}

/** Query for {@link getQuestions}. All filters are ANDed together. */
export interface QuestionQuery {
  lang: Lang;
  /**
   * Primary categories (tags[0]) to load. This is the LAZY-LOAD scope — only the
   * matching `data/<lang>/<source>/<category>.ts` leaves are imported. Omit to
   * load every category for the language.
   */
  categories?: string[];
  /** Restrict to one source bucket; omit for both. */
  source?: 'generated' | 'imported';
  /** Keep only questions carrying at least one of these tags (facet filter). */
  tags?: string[];
  /** Keep only questions carrying every one of these tags. */
  allTags?: string[];
  difficulty?: DifficultyRange;
  /** How many to return. Omit for all matches. */
  count?: number;
  /** Seed for deterministic selection/shuffle (shared `mulberry32`). */
  seed?: number;
  /** Ids to skip (e.g. already-asked this session). */
  excludeIds?: Iterable<string>;
  /** Round-robin across the difficulty band instead of uniform random. */
  spreadDifficulty?: boolean;
}
