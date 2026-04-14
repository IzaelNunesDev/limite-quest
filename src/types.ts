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
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  items: (Question | { type: 'explanation', content: string, title: string })[];
  xpReward: number;
}

export interface Island {
  id: string;
  title: string;
  lessons: Lesson[];
  bossId?: string;
}

export interface UserState {
  xp: number;
  hearts: number;
  deltaCoins: number;
  streak: number;
  lastPlayed: string | null;
  completedLessons: string[];
  unlockedIslands: string[];
  leitnerBoxes: {
    [boxId: number]: string[]; // Card IDs
  };
  inventory: string[];
}
