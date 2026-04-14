/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Lesson, Question } from '../types';
import { TactileApproximation } from './question-types/TactileApproximation';
import { LateralDetective } from './question-types/LateralDetective';
import { FactorizationPuzzle } from './question-types/FactorizationPuzzle';
import { TrigSlider } from './question-types/TrigSlider';
import { InfinityRace } from './question-types/InfinityRace';
import { EBoss } from './question-types/EBoss';
import { FlashcardIndeterminacy } from './question-types/FlashcardIndeterminacy';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';

interface LessonPlayerProps {
  lesson: Lesson;
  onComplete: (xp: number) => void;
  onCancel: () => void;
  hearts: number;
  onLoseHeart: () => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  lesson,
  onComplete,
  onCancel,
  hearts,
  onLoseHeart,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // State for specific question types
  const [tactileSuccess, setTactileSuccess] = useState(false);
  const [detectiveSuccess, setDetectiveSuccess] = useState<boolean | null>(null);
  const [puzzleSuccess, setPuzzleSuccess] = useState(false);
  const [trigAnswer, setTrigAnswer] = useState<number | null>(null);
  const [raceWinner, setRaceWinner] = useState<string | null>(null);
  const [eBossGuess, setEBossGuess] = useState<number | null>(null);
  const [flashcardChoice, setFlashcardChoice] = useState<boolean | null>(null);

  const currentItem = lesson.items[currentIndex];
  const progress = ((currentIndex + 1) / lesson.items.length) * 100;

  const resetStates = () => {
    setIsAnswered(false);
    setIsCorrect(false);
    setSelectedOption(null);
    setTactileSuccess(false);
    setDetectiveSuccess(null);
    setPuzzleSuccess(false);
    setTrigAnswer(null);
    setRaceWinner(null);
    setEBossGuess(null);
    setFlashcardChoice(null);
  };

  const handleCheck = () => {
    if (currentItem.type === 'explanation') {
      nextItem();
      return;
    }

    const question = currentItem as Question;
    let correct = false;

    if (question.type === 'multiple-choice') {
      correct = selectedOption === question.correctAnswer;
    } else if (question.type === 'true-false') {
      correct = selectedOption === (question.correctAnswer ? 1 : 0);
    } else if (question.type === 'tactile-approximation') {
      correct = tactileSuccess;
    } else if (question.type === 'lateral-detective') {
      correct = detectiveSuccess === question.correctAnswer;
    } else if (question.type === 'factorization-puzzle') {
      correct = puzzleSuccess;
    } else if (question.type === 'trig-slider') {
      correct = trigAnswer === question.content.targetMultiplier;
    } else if (question.type === 'infinity-race') {
      correct = raceWinner === question.correctAnswer;
    } else if (question.type === 'e-boss') {
      correct = eBossGuess === question.correctAnswer;
    } else if (question.type === 'flashcard-indeterminacy') {
      const isIndeterminate = question.correctAnswer === 0;
      correct = flashcardChoice === isIndeterminate;
    }

    setIsCorrect(correct);
    setIsAnswered(true);

    if (!correct) {
      onLoseHeart();
    } else {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#ef4444', '#10b981']
      });
    }
  };

  const nextItem = () => {
    if (currentIndex < lesson.items.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetStates();
    } else {
      onComplete(lesson.xpReward);
    }
  };

  // Check if user can submit answer
  const canSubmit = () => {
    if (currentItem.type === 'explanation') return true;
    if (isAnswered) return true;

    const question = currentItem as Question;
    switch (question.type) {
      case 'multiple-choice':
        return selectedOption !== null;
      case 'true-false':
        return selectedOption !== null;
      case 'tactile-approximation':
        return tactileSuccess;
      case 'lateral-detective':
        return detectiveSuccess !== null;
      case 'factorization-puzzle':
        return puzzleSuccess;
      case 'trig-slider':
        return trigAnswer !== null;
      case 'infinity-race':
        return raceWinner !== null;
      case 'e-boss':
        return eBossGuess !== null;
      case 'flashcard-indeterminacy':
        return flashcardChoice !== null;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center gap-4 border-b-2 border-v-line bg-white">
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X className="w-6 h-6 text-slate-400" />
        </button>
        <div className="flex-1 h-4 bg-v-line rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-v-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-2 text-v-danger font-bold text-lg">
          <Heart className="w-6 h-6 fill-current" />
          <span>{hearts}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-black text-v-text mb-8">{currentItem.title}</h2>

            {currentItem.type === 'explanation' ? (
              <div className="prose prose-slate">
                <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-line">
                  {currentItem.content}
                </p>
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                  <Info className="w-6 h-6 text-blue-500 shrink-0" />
                  <p className="text-sm text-blue-700 italic">
                    Dica: Limites são sobre "tendência", não sobre o valor exato!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-lg text-slate-600">{(currentItem as Question).description}</p>

                {/* Question Type Renderers */}
                {(currentItem as Question).type === 'tactile-approximation' && (
                  <TactileApproximation
                    fn={(currentItem as Question).content.function}
                    targetX={(currentItem as Question).content.targetX}
                    targetY={(currentItem as Question).content.targetY}
                    domain={(currentItem as Question).content.domain}
                    isAnswered={isAnswered}
                    onSuccess={() => {
                      setTactileSuccess(true);
                    }}
                  />
                )}

                {(currentItem as Question).type === 'lateral-detective' && (
                  <LateralDetective
                    fnLeft={(currentItem as Question).content.functionLeft}
                    fnRight={(currentItem as Question).content.functionRight}
                    targetX={(currentItem as Question).content.targetX}
                    isAnswered={isAnswered}
                    onSuccess={(exists) => {
                      setDetectiveSuccess(exists);
                    }}
                  />
                )}

                {(currentItem as Question).type === 'factorization-puzzle' && (
                  <FactorizationPuzzle
                    expression={(currentItem as Question).content.expression}
                    blocks={(currentItem as Question).content.blocks}
                    correctBlocks={(currentItem as Question).content.correctBlocks}
                    denominator={(currentItem as Question).content.denominator}
                    isAnswered={isAnswered}
                    onSuccess={() => {
                      setPuzzleSuccess(true);
                    }}
                  />
                )}

                {(currentItem as Question).type === 'trig-slider' && (
                  <TrigSlider
                    expression={(currentItem as Question).content.expression}
                    targetMultiplier={(currentItem as Question).content.targetMultiplier}
                    isAnswered={isAnswered}
                    userAnswer={trigAnswer}
                    onAnswer={setTrigAnswer}
                    onSuccess={() => {
                      // Legacy callback — parent handles verification
                    }}
                  />
                )}

                {(currentItem as Question).type === 'infinity-race' && (
                  <InfinityRace
                    numeratorFn={(currentItem as Question).content.numeratorFn}
                    denominatorFn={(currentItem as Question).content.denominatorFn}
                    numeratorLabel={(currentItem as Question).content.numeratorLabel}
                    denominatorLabel={(currentItem as Question).content.denominatorLabel}
                    correctWinner={(currentItem as Question).correctAnswer}
                    isAnswered={isAnswered}
                    onSuccess={(winner) => {
                      setRaceWinner(winner);
                    }}
                  />
                )}

                {(currentItem as Question).type === 'e-boss' && (
                  <EBoss
                    expression={(currentItem as Question).content.expression}
                    kValue={(currentItem as Question).content.kValue}
                    isAnswered={isAnswered}
                    onSuccess={(guess) => {
                      setEBossGuess(guess);
                    }}
                  />
                )}

                {(currentItem as Question).type === 'flashcard-indeterminacy' && (
                  <FlashcardIndeterminacy
                    expression={(currentItem as Question).content.expression}
                    isIndeterminate={(currentItem as Question).correctAnswer === 0}
                    isAnswered={isAnswered}
                    userChoice={flashcardChoice}
                    onChoice={setFlashcardChoice}
                    onSuccess={() => {
                      // Legacy callback — not used anymore since parent handles verification
                    }}
                  />
                )}

                {(currentItem as Question).type === 'multiple-choice' && (
                  <div className="grid gap-3">
                    {(currentItem as Question).content.options.map((option: string, idx: number) => (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => setSelectedOption(idx)}
                        className={cn(
                          "p-4 text-left rounded-2xl border-2 border-b-4 transition-all font-bold text-lg",
                          selectedOption === idx
                            ? "border-v-secondary bg-v-secondary-light text-v-secondary border-b-v-secondary-border"
                            : "border-v-line bg-white text-v-text hover:bg-slate-50",
                          isAnswered && idx === (currentItem as Question).correctAnswer && "border-v-primary bg-[#D7FFB8] text-v-primary-dark border-b-v-primary-dark",
                          isAnswered && selectedOption === idx && idx !== (currentItem as Question).correctAnswer && "border-v-danger bg-[#FFD7D7] text-[#D32F2F] border-b-[#D32F2F]"
                        )}
                      >
                        <span className="font-mono mr-3 opacity-50">{String.fromCharCode(65 + idx)})</span>
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {(currentItem as Question).type === 'true-false' && (
                  <div className="grid grid-cols-2 gap-4">
                    {['Falso', 'Verdadeiro'].map((option, idx) => (
                      <button
                        key={idx}
                        disabled={isAnswered}
                        onClick={() => setSelectedOption(idx)}
                        className={cn(
                          "p-8 text-center rounded-2xl border-2 border-b-4 transition-all font-bold text-xl",
                          selectedOption === idx
                            ? "border-v-secondary bg-v-secondary-light text-v-secondary border-b-v-secondary-border"
                            : "border-v-line bg-white text-v-text hover:bg-slate-50",
                          isAnswered && idx === ((currentItem as Question).correctAnswer ? 1 : 0) && "border-v-primary bg-[#D7FFB8] text-v-primary-dark border-b-v-primary-dark",
                          isAnswered && selectedOption === idx && idx !== ((currentItem as Question).correctAnswer ? 1 : 0) && "border-v-danger bg-[#FFD7D7] text-[#D32F2F] border-b-[#D32F2F]"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer / Feedback */}
      <div className={cn(
        "p-6 md:p-10 border-t-2 transition-colors",
        isAnswered ? (isCorrect ? "bg-[#D7FFB8] border-v-primary" : "bg-[#FFD7D7] border-v-danger") : "bg-white border-v-line"
      )}>
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-6 items-center justify-between">
          {isAnswered && (
            <div className="flex gap-4 items-center flex-1">
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center shrink-0",
                isCorrect ? "bg-white text-v-primary" : "bg-white text-v-danger"
              )}>
                {isCorrect ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
              </div>
              <div>
                <h4 className={cn("font-black text-xl", isCorrect ? "text-v-primary-dark" : "text-[#D32F2F]")}>
                  {isCorrect ? "Excelente!" : "Incorreto"}
                </h4>
                <p className={cn("text-sm font-medium mt-0.5", isCorrect ? "text-v-primary-dark" : "text-[#D32F2F]")}>
                  {(currentItem as Question).explanation}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={canSubmit() ? (isAnswered ? nextItem : handleCheck) : undefined}
            className={cn(
              "w-full sm:w-auto min-w-[200px] py-4 px-8 rounded-2xl font-bold text-lg transition-all",
              canSubmit()
                ? isAnswered
                  ? (isCorrect ? "v-btn-success" : "v-btn-danger")
                  : "v-btn-primary"
                : "bg-v-line text-[#AFB4B9] cursor-not-allowed border-none"
            )}
            disabled={!canSubmit()}
          >
            {currentItem.type === 'explanation' ? "CONTINUAR" : (isAnswered ? "PRÓXIMO" : "VERIFICAR")}
          </button>
        </div>
      </div>
    </div>
  );
};
