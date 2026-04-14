import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Settings, Zap, Info, Check, X } from 'lucide-react';

interface EBossProps {
  expression: string;
  kValue: number;
  onSuccess: (guess: number) => void;
  isAnswered: boolean;
}

export const EBoss: React.FC<EBossProps> = ({
  expression,
  kValue,
  onSuccess,
  isAnswered
}) => {
  const [xValue, setXValue] = useState(1);
  const [isCranking, setIsCranking] = useState(false);
  const [selectedGuess, setSelectedGuess] = useState<number | null>(null);
  const [history, setHistory] = useState<{ x: number; value: number }[]>([]);

  const targetValue = Math.exp(kValue);
  const currentValue = xValue > 0 ? Math.pow(1 + kValue / xValue, xValue) : NaN;

  useEffect(() => {
    if (xValue > 1) {
      setHistory(prev => {
        const exists = prev.find(h => h.x === xValue);
        if (exists) return prev;
        return [...prev, { x: xValue, value: currentValue }];
      });
    }
  }, [xValue, currentValue]);

  const handleCrank = () => {
    if (isAnswered || xValue >= 1000000) return;
    setIsCranking(true);

    const newX = xValue === 1 ? 10 : xValue * 10;
    setXValue(newX);

    setTimeout(() => setIsCranking(false), 400);
  };

  const handleGuess = (guess: number) => {
    if (isAnswered) return;
    setSelectedGuess(guess);
  };

  const handleConfirm = () => {
    if (selectedGuess === null) return;
    onSuccess(selectedGuess);
  };

  const isCorrect = selectedGuess === kValue;

  return (
    <div className="space-y-6 flex flex-col items-center">
      {/* Context/Explanation */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3 w-full max-w-lg">
        <Zap className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-700">
            O Número de Euler (e ≈ 2.71828)
          </p>
          <p className="text-sm text-slate-600 mt-1">
            A expressão (1 + k/x)^x converge para e^k quando x → ∞.
            Gire a manivela para aumentar x e observe para onde o valor está indo!
          </p>
        </div>
      </div>

      {/* Boss Title */}
      <div className="text-center space-y-1">
        <h3 className="font-black text-v-danger text-xl uppercase tracking-widest flex items-center justify-center gap-2">
          <Zap className="w-6 h-6 fill-current" /> Desafio Final: A Máquina do Infinito <Zap className="w-6 h-6 fill-current" />
        </h3>
        <p className="text-slate-500 font-medium text-sm">Gire a manivela e descubra o padrão!</p>
      </div>

      {/* The Machine */}
      <div className="relative w-full max-w-md bg-slate-800 rounded-3xl p-6 border-b-8 border-slate-950 shadow-2xl flex flex-col items-center gap-5">

        {/* Expression Display */}
        <div className="bg-slate-900 w-full rounded-xl p-4 border-4 border-slate-700 text-center">
          <span className="font-mono text-xl text-v-accent font-bold">
            {expression}
          </span>
        </div>

        {/* Value Display */}
        <div className="bg-[#1C1C1E] w-full rounded-xl p-5 border-4 border-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />
          <div className="text-center space-y-2 relative z-10">
            <div className="text-slate-400 font-mono text-xs uppercase tracking-widest">Valor (x = {xValue.toLocaleString()})</div>
            <motion.div
              key={xValue}
              initial={{ opacity: 0.5, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-4xl font-black text-[#58CC02] font-mono"
              style={{ textShadow: '0 0 15px rgba(88,204,2,0.5)' }}
            >
              {currentValue.toFixed(6)}
            </motion.div>
          </div>
        </div>

        {/* History Table */}
        {history.length > 0 && (
          <div className="w-full bg-slate-900 rounded-xl p-3 border border-slate-700">
            <p className="text-slate-400 text-xs font-bold mb-2 text-center">📋 Histórico de valores:</p>
            <div className="space-y-1 font-mono text-xs">
              {history.slice(-5).map((h, i) => (
                <div key={i} className="flex justify-between text-slate-300">
                  <span>x = {h.x.toLocaleString()}</span>
                  <span className={cn(
                    "font-bold",
                    Math.abs(h.value - targetValue) < 0.1 ? "text-green-400" : "text-slate-300"
                  )}>
                    {h.value.toFixed(5)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between text-xs font-bold">
              <span className="text-v-accent">Valor alvo: e^{kValue}</span>
              <span className="text-green-400">≈ {targetValue.toFixed(5)}</span>
            </div>
          </div>
        )}

        {/* The Crank */}
        <motion.button
          onClick={handleCrank}
          disabled={isCranking || isAnswered || xValue >= 1000000}
          className={cn(
            "relative transition-transform",
            isCranking ? "animate-spin" : ""
          )}
          whileTap={{ scale: 0.9 }}
        >
          <div className="w-20 h-20 bg-slate-700 rounded-full border-8 border-slate-600 flex items-center justify-center shadow-xl hover:bg-slate-600 transition-colors disabled:opacity-50">
            <Settings className="w-10 h-10 text-slate-300" />
          </div>
          {/* Handle indicator */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-10 bg-v-danger rounded-full border-4 border-red-700" />
        </motion.button>
        <p className="text-slate-400 font-bold uppercase text-xs">
          {xValue >= 1000000 ? 'Máximo alcançado!' : 'Girar Manivela (x × 10)'}
        </p>
      </div>

      {/* Guess Options */}
      {!isAnswered && (
        <div className="w-full max-w-md space-y-3">
          <h4 className="text-center font-bold text-v-text">
            Para qual valor a máquina converge? (1 + {kValue}/x)^x → e^?
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(k => (
              <button
                key={k}
                onClick={() => handleGuess(k)}
                className={cn(
                  "py-4 px-4 rounded-xl font-bold border-2 border-b-4 transition-all font-mono",
                  selectedGuess === k
                    ? k === kValue
                      ? "bg-[#D7FFB8] border-v-primary text-v-primary-dark"
                      : "bg-v-secondary-light border-v-secondary text-v-secondary"
                    : "bg-white border-v-line text-v-text hover:bg-slate-50"
                )}
              >
                e^{k}
                <br />
                <span className="text-xs opacity-70">≈ {Math.exp(k).toFixed(4)}</span>
              </button>
            ))}
          </div>

          {selectedGuess !== null && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleConfirm}
              className="w-full v-btn-primary"
            >
              CONFIRMAR RESPOSTA
            </motion.button>
          )}
        </div>
      )}

      {/* Answer Feedback */}
      <AnimatePresence>
        {isAnswered && selectedGuess !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "w-full max-w-md p-5 rounded-2xl border-4 text-center",
              isCorrect
                ? "bg-green-100 border-green-400"
                : "bg-red-100 border-red-400"
            )}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              {isCorrect ? (
                <>
                  <Check className="w-8 h-8 text-green-600" />
                  <span className="font-black text-2xl text-green-700">Correto!</span>
                </>
              ) : (
                <>
                  <X className="w-8 h-8 text-red-600" />
                  <span className="font-black text-2xl text-red-700">Incorreto</span>
                </>
              )}
            </div>
            <p className="text-base font-medium text-slate-700">
              {isCorrect
                ? `Exato! (1 + ${kValue}/x)^x converge para e^${kValue} ≈ ${targetValue.toFixed(4)}. A forma geral (1 + k/x)^x sempre converge para e^k!`
                : `O limite é e^${kValue} ≈ ${targetValue.toFixed(4)}, não e^{selectedGuess}. Lembre-se: (1 + k/x)^x → e^k.`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
