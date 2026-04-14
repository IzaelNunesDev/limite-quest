import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Check, X } from 'lucide-react';

interface FactorizationPuzzleProps {
  expression: string;
  blocks: string[];
  correctBlocks: string[];
  denominator: string;
  onSuccess: () => void;
  isAnswered: boolean;
}

export const FactorizationPuzzle: React.FC<FactorizationPuzzleProps> = ({
  expression,
  blocks,
  correctBlocks,
  denominator,
  onSuccess,
  isAnswered
}) => {
  const [slots, setSlots] = useState<(string | null)[]>(Array(correctBlocks.length).fill(null));
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const checkAnswer = useCallback(() => {
    if (slots.some(s => s === null)) return;

    const sortedSlots = [...slots].sort();
    const sortedCorrect = [...correctBlocks].sort();
    const correct = JSON.stringify(sortedSlots) === JSON.stringify(sortedCorrect);
    setIsCorrect(correct);

    if (correct) {
      setTimeout(() => onSuccess(), 1200);
    }
  }, [slots, correctBlocks, onSuccess]);

  useEffect(() => {
    if (slots.every(s => s !== null) && !isAnswered) {
      checkAnswer();
    }
  }, [slots, isAnswered, checkAnswer]);

  const handleBlockClick = (block: string) => {
    if (isAnswered || isCorrect !== null) return;

    const emptySlotIndex = slots.findIndex(s => s === null);
    if (emptySlotIndex !== -1) {
      const newSlots = [...slots];
      newSlots[emptySlotIndex] = block;
      setSlots(newSlots);
    }
  };

  const handleSlotClick = (index: number) => {
    if (isAnswered || isCorrect !== null) return;

    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);
    setIsCorrect(null);
  };

  const handleRetry = () => {
    setSlots(Array(correctBlocks.length).fill(null));
    setIsCorrect(null);
  };

  return (
    <div className="space-y-8 flex flex-col items-center">
      {/* Context/Explanation */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3 w-full max-w-lg">
        <span className="text-2xl">💡</span>
        <div>
          <p className="font-bold text-slate-700">
            Fatore o numerador para simplificar a expressão!
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Selecione os fatores corretos que, multiplicados, resultam no numerador da expressão.
          </p>
        </div>
      </div>

      {/* Expression Display */}
      <div className="text-center space-y-2">
        <h3 className="font-bold text-v-text text-xl">Fatore a expressão:</h3>
        <p className="text-2xl font-mono bg-slate-100 px-6 py-3 rounded-xl inline-block border-2 border-v-line">
          {expression}
        </p>
      </div>

      {/* Factorization Display */}
      <div className="flex flex-col items-center gap-4">
        {/* " = " indicator */}
        <p className="text-slate-500 font-bold text-lg">=</p>

        {/* Numerator Slots */}
        <div className="flex items-center gap-3">
          <div className="flex gap-4">
            <AnimatePresence>
              {slots.map((slot, i) => (
                <motion.div
                  key={`slot-${i}`}
                  onClick={() => handleSlotClick(i)}
                  className={cn(
                    "w-28 h-14 border-4 border-dashed rounded-xl flex items-center justify-center font-mono text-lg font-bold cursor-pointer transition-colors",
                    slot
                      ? isCorrect === true
                        ? "border-v-primary bg-[#D7FFB8] text-v-primary-dark border-solid"
                        : isCorrect === false
                          ? "border-v-danger bg-[#FFD7D7] text-v-danger border-solid"
                          : "border-v-secondary bg-v-secondary-light text-v-secondary border-solid"
                      : "border-slate-300 bg-slate-50"
                  )}
                  initial={slot ? { scale: 0.8 } : {}}
                  animate={{ scale: 1 }}
                >
                  {slot || "?"}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Fraction Line */}
        <div className="w-48 h-1 bg-v-text rounded-full" />

        {/* Denominator */}
        <motion.div
          className={cn(
            "text-2xl font-mono font-bold text-v-text px-6 py-2",
            isCorrect === true && "opacity-30"
          )}
        >
          {denominator}
        </motion.div>

        {/* Cancelation animation */}
        {isCorrect === true && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold text-v-primary mt-2"
          >
            <Check className="w-6 h-6 inline mr-2" />
            Os fatores cancelam! Sobra apenas o termo simplificado.
          </motion.div>
        )}

        {isCorrect === false && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold text-v-danger mt-2 flex items-center gap-2"
          >
            <X className="w-6 h-6" />
            Fatores incorretos. Tente novamente!
            <button
              onClick={handleRetry}
              className="ml-2 px-4 py-2 bg-v-secondary text-white rounded-xl font-bold text-sm hover:bg-v-secondary-dark transition-colors"
            >
              Tentar de novo
            </button>
          </motion.div>
        )}
      </div>

      {/* Available Blocks */}
      <div className="space-y-2">
        <p className="text-center font-bold text-slate-600 text-sm">Blocos disponíveis:</p>
        <div className="flex flex-wrap gap-3 justify-center max-w-md">
          {blocks.map((block, i) => {
            const isUsed = slots.includes(block);
            return (
              <button
                key={i}
                onClick={() => handleBlockClick(block)}
                disabled={isUsed || isAnswered || isCorrect !== null}
                className={cn(
                  "px-5 py-3 rounded-xl border-b-4 font-mono text-lg font-bold transition-all",
                  isUsed
                    ? "bg-slate-200 border-slate-300 text-slate-400 opacity-50 cursor-not-allowed"
                    : "bg-white border-v-line text-v-text hover:bg-slate-50 active:border-b-0 active:translate-y-1"
                )}
              >
                {block}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
