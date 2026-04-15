/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Dojo — Academia Delta
 *
 * Aba de prática com geração procedural infinita de exercícios.
 * Gemini entra como "Professor IA" apenas após 2 erros na mesma questão.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Flame, CheckCircle2, XCircle, Sparkles, RefreshCw, GraduationCap, Loader2, Coins } from 'lucide-react';
import {
  GeneratedQuestion,
  ApparatusType,
  generateForApparatus,
} from '../lib/generators';
import { useGeminiTutor } from '../hooks/useGeminiTutor';
import { cn } from '../lib/utils';

// ── Apparatus selector ───────────────────────────────────────────────────────

const APPARATUSES: { type: ApparatusType; emoji: string; label: string; desc: string; color: string }[] = [
  {
    type: 'diff-squares',
    emoji: '🔢',
    label: 'Maratona de Fatoração',
    desc: 'Cancele fatores em limites com diferença de quadrados',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    type: 'common-factor',
    emoji: '🧮',
    label: 'Fator Comum',
    desc: 'Coloque em evidência e simplifique limites racionais',
    color: 'from-purple-500 to-violet-600',
  },
  {
    type: 'lateral-detection',
    emoji: '🔍',
    label: 'Caça-Indeterminações',
    desc: 'Identifique rapidamente o tipo de cada limite',
    color: 'from-emerald-500 to-teal-600',
  },
];

const DAILY_GOAL = 10; // exercícios para ganhar bônus

// ── Main Dojo component ───────────────────────────────────────────────────────

interface DojoProps {
  deltaCoins: number;
  dojoStatsToday: { date: string; exercisesCompleted: number; dailyBonusClaimed: boolean };
  onReward: (coins: number) => void;
  onUpdateStats: (stats: { exercisesCompleted: number; dailyBonusClaimed: boolean }) => void;
}

export const Dojo: React.FC<DojoProps> = ({
  deltaCoins,
  dojoStatsToday,
  onReward,
  onUpdateStats,
}) => {
  const [activeApparatus, setActiveApparatus] = useState<ApparatusType | null>(null);
  const [question, setQuestion] = useState<GeneratedQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [streak, setStreak] = useState(0);
  const [errCount, setErrCount] = useState(0);
  const [showBonusBanner, setShowBonusBanner] = useState(false);
  const { hint, state: tutorState, requestHint, reset: resetTutor } = useGeminiTutor();

  const today = new Date().toDateString();
  const isToday = dojoStatsToday.date === today;
  const completed = isToday ? dojoStatsToday.exercisesCompleted : 0;
  const bonusClaimed = isToday && dojoStatsToday.dailyBonusClaimed;

  const nextQuestion = useCallback((type: ApparatusType) => {
    setQuestion(generateForApparatus(type));
    setSelected(null);
    setAnswered(false);
    setErrCount(0);
    resetTutor();
  }, [resetTutor]);

  const handleSelectApparatus = (type: ApparatusType) => {
    setActiveApparatus(type);
    setStreak(0);
    nextQuestion(type);
  };

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
  };

  const handleCheck = () => {
    if (selected === null || !question || answered) return;
    setAnswered(true);

    if (selected === question.correctIndex) {
      // Correct
      const newStreak = streak + 1;
      setStreak(newStreak);
      const newCompleted = completed + 1;
      const newBonusClaimed = bonusClaimed || newCompleted >= DAILY_GOAL;

      onUpdateStats({
        exercisesCompleted: newCompleted,
        dailyBonusClaimed: newBonusClaimed,
      });

      if (!bonusClaimed && newCompleted >= DAILY_GOAL) {
        onReward(15);
        setShowBonusBanner(true);
        setTimeout(() => setShowBonusBanner(false), 3500);
      }
    } else {
      // Wrong
      setStreak(0);
      const newErr = errCount + 1;
      setErrCount(newErr);
    }
  };

  const handleRequestAI = () => {
    if (!question || selected === null) return;
    requestHint(question.meta, question.options[selected]);
  };

  if (!activeApparatus || !question) {
    return <ApparatusSelector onSelect={handleSelectApparatus} completed={completed} bonusClaimed={bonusClaimed} />;
  }

  const isCorrect = answered && selected === question.correctIndex;
  const isWrong = answered && selected !== question.correctIndex;
  const canAskAI = isWrong && errCount >= 2;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveApparatus(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-bold text-sm transition-colors"
        >
          ← Aparelhos
        </button>
        <div className="flex items-center gap-3">
          {/* Streak */}
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full">
            <Flame className={cn('w-4 h-4', streak > 0 ? 'text-orange-500' : 'text-slate-300')} />
            <span className={cn('font-black text-sm', streak > 0 ? 'text-orange-600' : 'text-slate-400')}>
              {streak}
            </span>
          </div>
          {/* Daily progress */}
          <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-full">
            <Dumbbell className="w-4 h-4 text-yellow-600" />
            <span className="font-black text-sm text-yellow-700">{completed}/{DAILY_GOAL}</span>
          </div>
        </div>
      </div>

      {/* Progress bar toward daily goal */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
          animate={{ width: `${Math.min(100, (completed / DAILY_GOAL) * 100)}%` }}
        />
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="space-y-5"
        >
          {/* Type badge */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold border border-indigo-200">
              {question.title}
            </span>
            {streak >= 3 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold border border-orange-200"
              >
                🔥 {streak} em sequência!
              </motion.span>
            )}
          </div>

          {/* Expression */}
          <div className="bg-slate-900 rounded-2xl px-6 py-5 text-center border border-slate-700 shadow-lg">
            <p className="text-xs text-slate-400 font-mono mb-2">Calcule:</p>
            <p className="text-xl font-black text-white font-mono tracking-wide leading-snug">
              {question.expression}
            </p>
          </div>

          {/* Options */}
          <div className="grid gap-3">
            {question.options.map((opt, idx) => (
              <motion.button
                key={idx}
                whileHover={!answered ? { scale: 1.01 } : {}}
                whileTap={!answered ? { scale: 0.99 } : {}}
                disabled={answered}
                onClick={() => handleSelect(idx)}
                className={cn(
                  'p-4 text-left rounded-2xl border-2 border-b-4 transition-all font-medium text-base',
                  !answered && selected === idx
                    ? 'border-blue-400 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
                  answered && idx === question.correctIndex && 'border-green-400 bg-green-50 text-green-900',
                  answered && selected === idx && idx !== question.correctIndex && 'border-red-400 bg-red-50 text-red-900',
                )}
              >
                <span className="font-mono text-slate-400 mr-2 text-sm">{String.fromCharCode(65 + idx)})</span>
                {opt}
              </motion.button>
            ))}
          </div>

          {/* Check / Next button */}
          {!answered ? (
            <button
              onClick={handleCheck}
              disabled={selected === null}
              className={cn(
                'w-full py-4 rounded-2xl font-black text-lg transition-all',
                selected !== null ? 'v-btn-primary' : 'bg-slate-100 text-slate-400 cursor-not-allowed',
              )}
            >
              VERIFICAR
            </button>
          ) : (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => nextQuestion(activeApparatus)}
              className="w-full py-4 rounded-2xl font-black text-lg v-btn-success flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" /> Próxima questão
            </motion.button>
          )}

          {/* Feedback panel */}
          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'p-5 rounded-2xl border-2 space-y-3',
                  isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300',
                )}
              >
                <div className="flex items-center gap-2">
                  {isCorrect
                    ? <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                    : <XCircle className="w-6 h-6 text-red-600 shrink-0" />}
                  <p className="font-black text-base">
                    {isCorrect ? '🎉 Correto!' : '❌ Não foi dessa vez'}
                  </p>
                </div>
                <p className="text-sm font-medium text-slate-700 leading-relaxed">
                  {question.explanation}
                </p>

                {/* AI tutor section - only after 2 errors */}
                {isWrong && (
                  <div className="pt-2 border-t border-red-200">
                    {!canAskAI ? (
                      <p className="text-xs text-red-400 font-medium">
                        Erre mais {2 - errCount} vez(es) para desbloquear o Professor IA
                      </p>
                    ) : tutorState === 'idle' ? (
                      <button
                        onClick={handleRequestAI}
                        className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-violet-300 text-violet-700 rounded-xl font-bold text-sm hover:bg-violet-50 transition-colors"
                      >
                        <GraduationCap className="w-4 h-4" />
                        Pedir dica ao Professor IA
                      </button>
                    ) : tutorState === 'loading' ? (
                      <div className="flex items-center gap-2 text-violet-600 text-sm font-medium">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        O Professor está analisando sua resposta...
                      </div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-3 bg-violet-50 border border-violet-200 rounded-xl"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-violet-600" />
                          <span className="font-bold text-violet-700 text-sm">Professor IA</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{hint}</p>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Bonus banner */}
      <AnimatePresence>
        {showBonusBanner && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 border-4 border-white"
          >
            <Coins className="w-7 h-7" />
            <div>
              <p className="font-black text-lg">Bônus Diário!</p>
              <p className="text-sm font-medium opacity-90">+15 Delta Coins conquistados!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Apparatus Selector ────────────────────────────────────────────────────────

function ApparatusSelector({
  onSelect,
  completed,
  bonusClaimed,
}: {
  onSelect: (t: ApparatusType) => void;
  completed: number;
  bonusClaimed: boolean;
}) {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-28">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
          <Dumbbell className="w-9 h-9 text-white" />
        </div>
        <h2 className="text-3xl font-black text-v-text">Academia Delta</h2>
        <p className="text-slate-500 font-medium">Escolha um aparelho para treinar</p>
      </div>

      {/* Daily progress */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-yellow-800 text-sm">Meta diária</span>
          <span className="font-black text-yellow-700">
            {bonusClaimed ? '✅ Completa!' : `${completed}/${DAILY_GOAL}`}
          </span>
        </div>
        <div className="h-3 bg-yellow-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
            animate={{ width: `${Math.min(100, (completed / DAILY_GOAL) * 100)}%` }}
          />
        </div>
        {!bonusClaimed && (
          <p className="text-xs text-yellow-600 font-medium mt-2">
            Complete {DAILY_GOAL} exercícios para ganhar +15 Delta Coins 🪙
          </p>
        )}
      </div>

      {/* Apparatus cards */}
      <div className="space-y-4">
        {APPARATUSES.map(app => (
          <motion.button
            key={app.type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(app.type)}
            className="w-full text-left"
          >
            <div className={`bg-gradient-to-r ${app.color} rounded-2xl p-5 shadow-lg border-b-4 border-black/10`}>
              <div className="flex items-center gap-4">
                <span className="text-4xl">{app.emoji}</span>
                <div>
                  <p className="font-black text-white text-lg">{app.label}</p>
                  <p className="text-white/80 text-sm font-medium">{app.desc}</p>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
