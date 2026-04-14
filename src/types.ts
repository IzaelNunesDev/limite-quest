/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QuestionType =
  | 'multiple-choice'
  | 'tactile-approximation'
  | 'lateral-detective'
  | 'factorization-puzzle'
  | 'trig-slider'
  | 'infinity-race'
  | 'e-boss'
  | 'true-false'
  | 'flashcard-indeterminacy';

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description: string;
  content: any; // Specific to question type
  correctAnswer: any;
  explanation: string;
  animationUrl?: string;
  tag?: 'A' | 'B' | 'C' | 'D';
  /**
   * 4-phase lesson role:
   *  'scaffolded' = shown with visual hints active
   *  'challenge'  = shown without hints, awards XP
   * Omitting the field keeps the original behaviour.
   */
  phase?: 'scaffolded' | 'challenge';
}

export interface ExplanationItem {
  type: 'explanation';
  title: string;
  content: string;
}

// ── 4-phase teaching steps ───────────────────────────────────────────────────

/** Phase 1: silent animation — no formulas yet, just visual intuition. */
export interface ConceptStep {
  type: 'concept';
  title: string;
  /** Which canned animation to render */
  visual:
    | 'lateral-approach'   // two dots converging on a hole
    | 'bridge-broken'      // two dots arrive at different y-values
    | 'unit-circle'        // sin(x)/x squeeze animation
    | 'infinity-growth';   // bars growing at different rates
  caption: string;
}

/** One step inside a worked example. */
export interface WorkedStep {
  text: string;
  /** Controls which side gets the blue/purple highlight */
  highlight?: 'left' | 'right' | 'cancel' | 'none';
}

/** Phase 2: the app resolves a similar problem step-by-step. */
export interface WorkedExampleStep {
  type: 'worked-example';
  title: string;
  /** LaTeX-free expression shown at the top, e.g. "|x−1|/(x−1)" */
  expression: string;
  steps: WorkedStep[];
  conclusion: string;
  /** Key into explanationTemplates for the summary panel */
  templateKey?: string;
}

/** All possible items inside a Lesson */
export type LessonItem =
  | Question
  | ExplanationItem
  | ConceptStep
  | WorkedExampleStep;

export interface Lesson {
  id: string;
  title: string;
  description: string;
  items: LessonItem[];
  xpReward: number;
}

export interface Island {
  id: string;
  title: string;
  lessons: Lesson[];
  bossId?: string;
}

// ── Concept flashcards ───────────────────────────────────────────────────────

export interface ConceptCard {
  id: string;
  q: string;
  a: string;
  /** Used to choose which concept card to show before a related procedural Q */
  tags: string[];
}

// ── User state ───────────────────────────────────────────────────────────────

export interface UserState {
  xp: number;
  hearts: number;
  deltaCoins: number;
  streak: number;
  lastPlayed: string | null;
  completedLessons: string[];
  unlockedIslands: string[];
  /** Leitner boxes for procedural questions */
  leitnerBoxes: {
    [boxId: number]: string[];
  };
  /** Leitner boxes for concept cards */
  conceptLeitnerBoxes: {
    [boxId: number]: string[];
  };
  inventory: string[];
}
