import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { FastForward, Trophy, Check, X, Info } from 'lucide-react';

interface InfinityRaceProps {
  numeratorFn: string;
  denominatorFn: string;
  numeratorLabel: string;
  denominatorLabel: string;
  correctWinner: 'numerator' | 'denominator' | 'tie';
  onSuccess: (winner: string) => void;
  isAnswered: boolean;
}

export const InfinityRace: React.FC<InfinityRaceProps> = ({
  numeratorFn,
  denominatorFn,
  numeratorLabel,
  denominatorLabel,
  correctWinner,
  onSuccess,
  isAnswered
}) => {
  const [xValue, setXValue] = useState(1);
  const [advances, setAdvances] = useState(0);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<{ x: number; numVal: number; denVal: number; ratio: number }[]>([
    { x: 1, numVal: 0, denVal: 0, ratio: 0 }
  ]);

  const evaluateFn = (fn: string, x: number): number => {
    try {
      const processedFn = fn
        .replace(/Math\.sqrt/g, 'sqrt')
        .replace(/Math\.abs/g, 'abs')
        .replace(/Math\.sin/g, 'sin')
        .replace(/Math\.cos/g, 'cos')
        .replace(/Math\.tan/g, 'tan')
        .replace(/Math\.log/g, 'log')
        .replace(/Math\.pow/g, 'pow')
        .replace(/Math\.PI/g, 'pi')
        .replace(/Math\.E/g, 'e');

      const fnWithMath = new Function(
        'x', 'sqrt', 'abs', 'sin', 'cos', 'tan', 'log', 'pow', 'pi', 'e',
        `return ${processedFn}`
      );
      return fnWithMath(
        x, Math.sqrt, Math.abs, Math.sin, Math.cos, Math.tan, Math.log, Math.pow, Math.PI, Math.E
      );
    } catch (e) {
      return NaN;
    }
  };

  const numVal = evaluateFn(numeratorFn, xValue);
  const denVal = evaluateFn(denominatorFn, xValue);
  const ratio = denVal !== 0 && Number.isFinite(denVal) && Number.isFinite(numVal) ? numVal / denVal : NaN;

  // Determine who's winning
  const currentLeader = (): string => {
    if (!Number.isFinite(numVal) || !Number.isFinite(denVal)) {
      if (!Number.isFinite(numVal) && Number.isFinite(denVal)) return 'numerator';
      if (Number.isFinite(numVal) && !Number.isFinite(denVal)) return 'denominator';
      return 'tie';
    }
    if (Math.abs(numVal - denVal) < 0.01 * Math.max(Math.abs(numVal), Math.abs(denVal), 1)) {
      return 'tie';
    }
    return Math.abs(numVal) > Math.abs(denVal) ? 'numerator' : 'denominator';
  };

  const handleAdvance = () => {
    if (xValue >= 1000000 || isAnswered) return;

    const newX = xValue * 10;
    const newNum = evaluateFn(numeratorFn, newX);
    const newDen = evaluateFn(denominatorFn, newX);
    const newRatio = newDen !== 0 && Number.isFinite(newDen) && Number.isFinite(newNum) ? newNum / newDen : NaN;

    setXValue(newX);
    setAdvances(advances + 1);
    setHistory(prev => [...prev, { x: newX, numVal: newNum, denVal: newDen, ratio: newRatio }]);
  };

  const handleGuess = (guess: string) => {
    if (isAnswered) return;
    setSelectedWinner(guess);
  };

  const handleConfirm = () => {
    if (selectedWinner === null) return;
    onSuccess(selectedWinner);
  };

  const isCorrect = selectedWinner === correctWinner;

  const formatNumber = (n: number): string => {
    if (!Number.isFinite(n)) return '∞';
    if (Math.abs(n) > 1e6) return n.toExponential(2);
    if (Math.abs(n) > 1000) return Math.round(n).toLocaleString();
    return n.toFixed(2);
  };

  return (
    <div className="space-y-6">
      {/* Context/Explanation */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 flex items-start gap-3">
        <Trophy className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-700">
            Corrida ao Infinito: quem domina?
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Quando x cresce sem parar, algumas funções crescem mais rápido que outras.
            Avance x e observe a razão entre numerador e denominador. Se a razão → 0, o denominador vence!
          </p>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="font-bold text-v-text text-xl">Corrida ao Infinito!</h3>
        <p className="text-slate-500 font-medium">
          Compare <span className="font-mono text-v-primary font-bold">{numeratorLabel}</span> vs{' '}
          <span className="font-mono text-v-secondary font-bold">{denominatorLabel}</span> quando x → ∞
        </p>
      </div>

      {/* Value Table */}
      <div className="bg-white rounded-2xl border-2 border-v-line overflow-hidden">
        <div className="bg-slate-800 text-white px-4 py-3 font-bold text-sm flex items-center justify-between">
          <span>📊 Tabela de Valores</span>
          <button
            onClick={handleAdvance}
            disabled={xValue >= 1000000 || isAnswered}
            className={cn(
              "px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all",
              xValue >= 1000000
                ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 text-white"
            )}
          >
            Avançar x <FastForward className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-v-line bg-slate-50">
                <th className="p-2 text-left text-slate-500">x</th>
                <th className="p-2 text-left text-v-primary">{numeratorLabel}</th>
                <th className="p-2 text-left text-v-secondary">{denominatorLabel}</th>
                <th className="p-2 text-left text-slate-600">Razão (num/den)</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => (
                <tr key={i} className={cn(
                  "border-b border-slate-100",
                  i === history.length - 1 ? "bg-v-secondary-light font-bold" : ""
                )}>
                  <td className="p-2">{row.x.toLocaleString()}</td>
                  <td className="p-2 text-v-primary">{formatNumber(row.numVal)}</td>
                  <td className="p-2 text-v-secondary">{formatNumber(row.denVal)}</td>
                  <td className="p-2">
                    {Number.isFinite(row.ratio)
                      ? row.ratio.toFixed(4)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Progress bar */}
        <div className="flex items-center gap-2 text-xs text-slate-400 px-4 py-2 bg-slate-50">
          <span>1</span>
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (Math.log10(xValue) / 6) * 100)}%` }}
            />
          </div>
          <span>1.000.000</span>
        </div>
      </div>

      {/* Leader indicator */}
      <div className="text-center bg-slate-50 p-3 rounded-xl border border-v-line">
        <span className="text-sm text-slate-500">Tendência da razão: </span>
        <span className={cn(
          "font-bold text-base",
          correctWinner === 'denominator' && "text-v-secondary",
          correctWinner === 'numerator' && "text-v-primary",
          correctWinner === 'tie' && "text-yellow-600"
        )}>
          {(() => {
            const lastRatio = history[history.length - 1]?.ratio;
            if (!Number.isFinite(lastRatio)) return 'Indefinido';
            if (Math.abs(lastRatio) < 0.01) return '→ 0 (denominador domina!)';
            if (Math.abs(lastRatio) > 100) return '→ ∞ (numerador domina!)';
            if (Math.abs(lastRatio - 1) < 0.1) return `→ constante ≈ ${lastRatio.toFixed(2)}`;
            return `≈ ${lastRatio.toFixed(2)} (avançando...)`;
          })()}
        </span>
      </div>

      {/* Guess Buttons */}
      {!isAnswered && (
        <div className="space-y-3">
          <p className="text-center font-bold text-v-text">Quem vence a corrida?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleGuess('numerator')}
              className={cn(
                "py-4 px-4 rounded-xl font-bold border-2 border-b-4 transition-all text-sm",
                selectedWinner === 'numerator'
                  ? "bg-green-100 border-green-500 text-green-700"
                  : "bg-white border-v-line text-v-text hover:bg-slate-50"
              )}
            >
              🚀 Numerador domina
              <br />
              <span className="text-xs text-slate-500 font-medium">fração → ∞</span>
            </button>
            <button
              onClick={() => handleGuess('tie')}
              className={cn(
                "py-4 px-4 rounded-xl font-bold border-2 border-b-4 transition-all text-sm",
                selectedWinner === 'tie'
                  ? "bg-yellow-100 border-yellow-500 text-yellow-700"
                  : "bg-white border-v-line text-v-text hover:bg-slate-50"
              )}
            >
              ⚖️ Empate
              <br />
              <span className="text-xs text-slate-500 font-medium">fração → constante</span>
            </button>
            <button
              onClick={() => handleGuess('denominator')}
              className={cn(
                "py-4 px-4 rounded-xl font-bold border-2 border-b-4 transition-all text-sm",
                selectedWinner === 'denominator'
                  ? "bg-blue-100 border-blue-500 text-blue-700"
                  : "bg-white border-v-line text-v-text hover:bg-slate-50"
              )}
            >
              🏆 Denominador domina
              <br />
              <span className="text-xs text-slate-500 font-medium">fração → 0</span>
            </button>
          </div>

          {selectedWinner && (
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
        {isAnswered && selectedWinner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-5 rounded-2xl border-4 text-center",
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
              {correctWinner === 'numerator' && `O numerador (${numeratorLabel}) cresce mais rápido que o denominador. A fração tende a ∞.`}
              {correctWinner === 'denominator' && `O denominador (${denominatorLabel}) cresce mais rápido. A fração tende a 0.`}
              {correctWinner === 'tie' && `Ambos crescem na mesma taxa (mesmo grau). O limite é a razão dos coeficientes líderes.`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
