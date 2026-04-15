/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ReviewSession: sessão de revisão Leitner com concept cards intercalados.
 *
 * Fluxo:
 *  1. Se houver um concept card relacionado → exibe primeiro (flip card)
 *  2. Questão procedural → resposta + promoção/rebaixamento Leitner
 *  3. Repetir até acabar a fila
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, X, BookOpen, RotateCcw, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { Question, ConceptCard } from '../types';
import { cn } from '../lib/utils';

interface ReviewSessionProps {
  /** Questões procedurais do Leitner (caixa 1 ou agendadas). */
  procedural: Question[];
  /** Concept cards disponíveis para intercalar. */
  conceptCards: ConceptCard[];
  onComplete: (results: { id: string; correct: boolean }[]) => void;
  onCancel: () => void;
}

// ── Concept card flip ────────────────────────────────────────────────────────

function ConceptFlipCard({ card, onContinue }: { card: ConceptCard; onContinue: () => void }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-100 rounded-full border border-purple-200 w-fit">
        <BookOpen className="w-4 h-4 text-purple-600" />
        <span className="text-purple-700 font-bold text-sm">Conceito — Revise antes de Praticar</span>
      </div>

      {/* Card flip */}
      <div
        className="cursor-pointer"
        onClick={() => setFlipped(f => !f)}
        style={{ perspective: '800px' }}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d', position: 'relative', minHeight: 180 }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 rounded-3xl p-8 border-2 border-slate-700 shadow-xl text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-white font-bold text-xl leading-snug">{card.q}</p>
            <p className="text-slate-400 text-sm mt-4 animate-pulse">Toque para revelar a resposta</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-700 to-indigo-800 rounded-3xl p-8 border-2 border-purple-500 shadow-xl text-center"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-white font-black text-2xl leading-snug">{card.a}</p>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {flipped && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onContinue}
            className="w-full v-btn-primary flex items-center justify-center gap-2"
          >
            Entendido, próxima questão <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {!flipped && (
        <p className="text-center text-slate-400 text-sm">Clique no card para ver a resposta</p>
      )}
    </div>
  );
}

// ── Simple multiple-choice reviewer ─────────────────────────────────────────

function QuestionReviewer({
  question,
  onResult,
}: {
  question: Question;
  onResult: (correct: boolean) => void;
}) {
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
  };

  const handleCheck = () => {
    if (selected === null) return;
    const correct = selected === question.correctAnswer;
    setAnswered(true);
    // slight delay so user sees the result color
    setTimeout(() => onResult(correct), 1200);
  };

  // For non-multiple-choice, just show description + a self-report
  if (question.type !== 'multiple-choice' && question.type !== 'true-false') {
    return (
      <div className="space-y-5">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700">
          <p className="text-white font-bold text-lg leading-snug">{question.description}</p>
        </div>
        <p className="text-slate-500 text-sm text-center font-medium">
          Responda mentalmente, depois avalie você mesmo:
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onResult(false)}
            className="py-4 px-6 rounded-2xl bg-red-100 border-2 border-b-4 border-red-300 text-red-700 font-bold text-lg hover:bg-red-200 transition-colors"
          >
            ✗ Errei
          </button>
          <button
            onClick={() => onResult(true)}
            className="py-4 px-6 rounded-2xl bg-green-100 border-2 border-b-4 border-green-300 text-green-700 font-bold text-lg hover:bg-green-200 transition-colors"
          >
            ✓ Acertei
          </button>
        </div>
        <p className="text-xs text-slate-400 text-center">
          Resposta: <span className="font-bold text-slate-600">{question.explanation}</span>
        </p>
      </div>
    );
  }

  const options: string[] =
    question.type === 'true-false'
      ? ['Falso', 'Verdadeiro']
      : question.content.options;

  const correctIdx =
    question.type === 'true-false'
      ? (question.correctAnswer ? 1 : 0)
      : question.correctAnswer;

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-700">
        <p className="text-white font-bold text-lg leading-snug">{question.description}</p>
      </div>

      <div className="grid gap-3">
        {options.map((opt, idx) => (
          <button
            key={idx}
            disabled={answered}
            onClick={() => handleSelect(idx)}
            className={cn(
              'p-4 text-left rounded-2xl border-2 border-b-4 transition-all font-bold text-base',
              !answered && selected === idx
                ? 'border-blue-400 bg-blue-50 text-blue-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
              answered && idx === correctIdx && 'border-green-400 bg-green-50 text-green-800',
              answered && selected === idx && idx !== correctIdx && 'border-red-400 bg-red-50 text-red-800',
            )}
          >
            <span className="font-mono mr-2 opacity-50">{String.fromCharCode(65 + idx)})</span>
            {opt}
          </button>
        ))}
      </div>

      {!answered && (
        <button
          onClick={handleCheck}
          disabled={selected === null}
          className={cn(
            'w-full py-4 rounded-2xl font-bold text-lg transition-all',
            selected !== null ? 'v-btn-primary' : 'bg-slate-100 text-slate-400 cursor-not-allowed',
          )}
        >
          VERIFICAR
        </button>
      )}

      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'p-4 rounded-2xl border-2 flex items-start gap-3',
              selected === correctIdx ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300',
            )}
          >
            {selected === correctIdx
              ? <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
              : <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />}
            <p className="text-sm font-medium text-slate-700">{question.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main ReviewSession ────────────────────────────────────────────────────────

export const ReviewSession: React.FC<ReviewSessionProps> = ({
  procedural,
  conceptCards,
  onComplete,
  onCancel,
}) => {
  const [phase, setPhase] = useState<'intro' | 'concept' | 'question' | 'done'>('intro');
  const [qIndex, setQIndex] = useState(0);
  const [results, setResults] = useState<{ id: string; correct: boolean }[]>([]);
  const [conceptShown, setConceptShown] = useState(false);

  const total = procedural.length;
  const currentQ = procedural[qIndex];
  const progress = total > 0 ? ((qIndex) / total) * 100 : 0;

  // Pick a concept card relevant to the current question (by tag)
  const relevantConcept = useCallback((): ConceptCard | null => {
    if (conceptShown || conceptCards.length === 0 || !currentQ) return null;
    // Just pick the first available concept card for now
    return conceptCards[qIndex % conceptCards.length] ?? null;
  }, [conceptCards, conceptShown, qIndex, currentQ]);

  const startSession = () => {
    if (total === 0) {
      setPhase('done');
      return;
    }
    const concept = relevantConcept();
    setPhase(concept ? 'concept' : 'question');
  };

  const afterConcept = () => {
    setConceptShown(true);
    setPhase('question');
  };

  const handleResult = (correct: boolean) => {
    const next = [...results, { id: currentQ.id, correct }];
    setResults(next);
    const nextIdx = qIndex + 1;
    if (nextIdx >= total) {
      setPhase('done');
    } else {
      setQIndex(nextIdx);
      // Show concept card every 3 questions
      const showConcept = nextIdx % 3 === 0 && conceptCards.length > 0;
      setConceptShown(!showConcept);
      setPhase(showConcept ? 'concept' : 'question');
    }
  };

  const correctCount = results.filter(r => r.correct).length;

  return (
    <div className="fixed inset-0 bg-slate-900/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border-b-8 border-v-line max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 bg-v-secondary text-white flex justify-between items-center border-b-4 border-v-secondary-dark shrink-0">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 fill-current" />
            <h3 className="font-black text-xl uppercase tracking-tight">Revisão Relâmpago</h3>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X />
          </button>
        </div>

        {/* Progress bar */}
        {phase !== 'intro' && phase !== 'done' && (
          <div className="h-2 bg-slate-100 shrink-0">
            <motion.div
              className="h-full bg-v-primary"
              animate={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <AnimatePresence mode="wait">

            {/* Intro */}
            {phase === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center space-y-6 py-4"
              >
                <div className="w-20 h-20 bg-v-secondary-light rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-10 h-10 text-v-secondary" />
                </div>
                <div>
                  <h4 className="text-2xl font-black text-v-text mb-2">Hora da Revisão!</h4>
                  {total === 0 ? (
                    <p className="text-slate-500 font-medium">
                      Nenhuma questão pendente. Complete uma lição para começar.
                    </p>
                  ) : (
                    <p className="text-slate-600 font-medium">
                      Você tem <span className="font-black text-v-secondary">{total} questão
                      {total !== 1 && 's'}</span> para revisar hoje.
                      {conceptCards.length > 0 && (
                        <> Também há <span className="font-black text-purple-600">{conceptCards.length} conceito
                        {conceptCards.length !== 1 && 's'}</span> para reforçar.</>
                      )}
                    </p>
                  )}
                </div>
                <button onClick={startSession} className="v-btn-primary w-full text-lg">
                  {total === 0 ? 'Fechar' : 'Começar Revisão'}
                </button>
              </motion.div>
            )}

            {/* Concept card */}
            {phase === 'concept' && relevantConcept() && (
              <motion.div
                key={`concept-${qIndex}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <ConceptFlipCard card={relevantConcept()!} onContinue={afterConcept} />
              </motion.div>
            )}

            {/* Question */}
            {phase === 'question' && currentQ && (
              <motion.div
                key={`q-${qIndex}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">
                    Questão {qIndex + 1} de {total}
                  </span>
                  <span className="text-sm font-bold text-v-secondary">
                    {results.filter(r => r.correct).length} ✓
                  </span>
                </div>
                <h3 className="font-black text-xl text-v-text">{currentQ.title}</h3>
                <QuestionReviewer question={currentQ} onResult={handleResult} />
              </motion.div>
            )}

            {/* Done */}
            {phase === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-4"
              >
                <div className="text-6xl">
                  {total === 0 ? '🎯' : correctCount === total ? '🏆' : correctCount >= total / 2 ? '⭐' : '💪'}
                </div>
                <div>
                  <h4 className="text-2xl font-black text-v-text mb-1">Revisão Completa!</h4>
                  {total > 0 && (
                    <p className="text-slate-600">
                      <span className="font-black text-green-600">{correctCount}</span> de{' '}
                      <span className="font-black">{total}</span> corretas
                    </p>
                  )}
                </div>

                {total > 0 && (
                  <div className="bg-slate-50 rounded-2xl p-4 text-sm text-left space-y-2 border border-v-line">
                    <p className="font-bold text-slate-600">Sistema Leitner:</p>
                    <p className="text-slate-500">
                      ✓ Questões corretas foram promovidas para a caixa seguinte
                    </p>
                    <p className="text-slate-500">
                      ✗ Questões erradas voltaram para a caixa 1
                    </p>
                  </div>
                )}

                <button onClick={() => onComplete(results)} className="v-btn-primary w-full text-lg">
                  Concluir Revisão
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
