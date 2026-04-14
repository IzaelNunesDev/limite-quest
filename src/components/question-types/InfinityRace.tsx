import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { FastForward, Trophy, Check, X } from 'lucide-react';

interface InfinityRaceProps {
  numeratorFn: string;
  denominatorFn: string;
  numeratorLabel: string;
  denominatorLabel: string;
  /** Optional term breakdown for the fade-out visualization */
  numeratorTerms?: string[];
  denominatorTerms?: string[];
  correctWinner: 'numerator' | 'denominator' | 'tie';
  onSuccess: (winner: string) => void;
  isAnswered: boolean;
}

export const InfinityRace: React.FC<InfinityRaceProps> = ({
  numeratorFn,
  denominatorFn,
  numeratorLabel,
  denominatorLabel,
  numeratorTerms,
  denominatorTerms,
  correctWinner,
  onSuccess,
  isAnswered,
}) => {
  const [xValue, setXValue] = useState(1);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [history, setHistory] = useState<
    { x: number; numVal: number; denVal: number; ratio: number }[]
  >([{ x: 1, numVal: 0, denVal: 0, ratio: 0 }]);

  const evaluateFn = (fnStr: string, x: number): number => {
    try {
      const clean = fnStr
        .replace(/Math\.sqrt/g, 'sqrt').replace(/Math\.abs/g, 'abs')
        .replace(/Math\.sin/g, 'sin').replace(/Math\.cos/g, 'cos')
        .replace(/Math\.tan/g, 'tan').replace(/Math\.log/g, 'log')
        .replace(/Math\.pow/g, 'pow').replace(/Math\.PI/g, 'pi').replace(/Math\.E/g, 'e');
      const f = new Function(
        'x', 'sqrt', 'abs', 'sin', 'cos', 'tan', 'log', 'pow', 'pi', 'e',
        `return ${clean}`,
      );
      return f(x, Math.sqrt, Math.abs, Math.sin, Math.cos, Math.tan, Math.log, Math.pow, Math.PI, Math.E);
    } catch { return NaN; }
  };

  const numVal = evaluateFn(numeratorFn, xValue);
  const denVal = evaluateFn(denominatorFn, xValue);
  const ratio = Number.isFinite(numVal) && Number.isFinite(denVal) && denVal !== 0 ? numVal / denVal : NaN;

  const formatNum = (n: number) => {
    if (!Number.isFinite(n)) return '∞';
    if (Math.abs(n) > 1e9) return n.toExponential(1);
    if (Math.abs(n) > 999) return Math.round(n).toLocaleString();
    return n.toFixed(2);
  };

  const handleAdvance = () => {
    if (xValue >= 1_000_000 || isAnswered) return;
    const newX = xValue * 10;
    const newNum = evaluateFn(numeratorFn, newX);
    const newDen = evaluateFn(denominatorFn, newX);
    const newRatio = Number.isFinite(newNum) && Number.isFinite(newDen) && newDen !== 0
      ? newNum / newDen : NaN;
    setXValue(newX);
    setHistory(prev => [...prev, { x: newX, numVal: newNum, denVal: newDen, ratio: newRatio }]);
  };

  // ── Bar visualization ──────────────────────────────────────────────────────

  // How prominent the "small terms" are: fades as x grows
  const smallTermOpacity = Math.max(0, 1 - Math.log10(xValue) / 4);
  const maxVal = Math.max(Math.abs(numVal), Math.abs(denVal), 1);
  const BAR_MAX = 140; // px

  const barHeight = (v: number) => Math.max(4, (Math.abs(v) / maxVal) * BAR_MAX);

  return (
    <div className="space-y-5">
      {/* Context */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 flex items-start gap-3">
        <Trophy className="w-6 h-6 text-purple-600 shrink-0 mt-0.5" />
        <p className="text-sm font-bold text-slate-700">
          Quando x cresce, os termos menores ficam <em>insignificantes</em>.
          Avance x e observe quem domina a razão numerador/denominador.
        </p>
      </div>

      {/* ── Bar visualization ── */}
      <div className="bg-slate-900 rounded-2xl p-5 flex flex-col items-center gap-4 border border-slate-700">
        <p className="text-slate-400 text-xs font-mono">x = {xValue.toLocaleString()}</p>

        {/* Bars */}
        <div className="flex items-end gap-10 h-[160px]">
          {/* Numerator bar */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-green-400 font-mono text-xs font-bold">{formatNum(numVal)}</span>
            <div className="relative flex flex-col items-center">
              {/* Terms breakdown */}
              {numeratorTerms && numeratorTerms.length === 2 && (
                <motion.div
                  className="absolute -top-5 text-xs font-mono text-center leading-none"
                  animate={{ opacity: smallTermOpacity }}
                >
                  <span className="text-green-300">{numeratorTerms[0]}</span>
                  <span className="text-slate-500"> {numeratorTerms[1]}</span>
                </motion.div>
              )}
              <motion.div
                className="w-16 rounded-t-xl bg-green-500 min-h-[4px]"
                animate={{ height: barHeight(numVal) }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
              />
            </div>
            <span className="text-green-400 font-mono text-[11px] text-center font-bold leading-tight max-w-[70px]">
              {numeratorLabel}
            </span>
          </div>

          {/* Denominator bar */}
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-blue-400 font-mono text-xs font-bold">{formatNum(denVal)}</span>
            <div className="relative flex flex-col items-center">
              {denominatorTerms && denominatorTerms.length === 2 && (
                <motion.div
                  className="absolute -top-5 text-xs font-mono text-center leading-none"
                  animate={{ opacity: smallTermOpacity }}
                >
                  <span className="text-blue-300">{denominatorTerms[0]}</span>
                  <span className="text-slate-500"> {denominatorTerms[1]}</span>
                </motion.div>
              )}
              <motion.div
                className="w-16 rounded-t-xl bg-blue-500 min-h-[4px]"
                animate={{ height: barHeight(denVal) }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
              />
            </div>
            <span className="text-blue-400 font-mono text-[11px] text-center font-bold leading-tight max-w-[70px]">
              {denominatorLabel}
            </span>
          </div>
        </div>

        {/* Ratio */}
        <div className="text-center">
          <span className="text-slate-400 text-sm">razão = </span>
          <motion.span
            className="text-yellow-400 font-black text-lg"
            key={ratio.toFixed(3)}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
          >
            {Number.isFinite(ratio) ? ratio.toFixed(4) : '—'}
          </motion.span>
        </div>

        {/* Advance button */}
        <button
          onClick={handleAdvance}
          disabled={xValue >= 1_000_000 || isAnswered}
          className={cn(
            'px-5 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all',
            xValue >= 1_000_000
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white',
          )}
        >
          Avançar x <FastForward className="w-4 h-4" />
        </button>

        {/* Progress */}
        <div className="flex items-center gap-2 text-xs text-slate-500 w-full">
          <span>x=1</span>
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (Math.log10(xValue) / 6) * 100)}%` }}
            />
          </div>
          <span>10⁶</span>
        </div>
      </div>

      {/* Value table (collapsible detail) */}
      <details className="bg-white rounded-2xl border-2 border-v-line overflow-hidden">
        <summary className="px-4 py-3 font-bold text-sm cursor-pointer text-slate-600 hover:bg-slate-50">
          Ver tabela de valores
        </summary>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-v-line bg-slate-50">
                <th className="p-2 text-left text-slate-500">x</th>
                <th className="p-2 text-left text-green-600">{numeratorLabel}</th>
                <th className="p-2 text-left text-blue-600">{denominatorLabel}</th>
                <th className="p-2 text-left text-slate-600">razão</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => (
                <tr key={i} className={cn('border-b border-slate-100',
                  i === history.length - 1 ? 'bg-purple-50 font-bold' : '')}>
                  <td className="p-2">{row.x.toLocaleString()}</td>
                  <td className="p-2 text-green-600">{formatNum(row.numVal)}</td>
                  <td className="p-2 text-blue-600">{formatNum(row.denVal)}</td>
                  <td className="p-2">{Number.isFinite(row.ratio) ? row.ratio.toFixed(4) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      {/* Trend */}
      <div className="text-center bg-slate-50 p-3 rounded-xl border border-v-line text-sm font-bold text-slate-600">
        Tendência: {(() => {
          if (!Number.isFinite(ratio)) return 'Calculando...';
          if (ratio < 0.01) return '→ 0 (denominador domina)';
          if (ratio > 100) return '→ ∞ (numerador domina)';
          return `→ constante ≈ ${ratio.toFixed(3)}`;
        })()}
      </div>

      {/* Guess */}
      {!isAnswered && (
        <div className="space-y-3">
          <p className="text-center font-bold text-v-text">Quem vence quando x → ∞?</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: 'numerator', label: '🚀 Numerador domina', sub: 'fração → ∞' },
              { key: 'tie', label: '⚖️ Empate', sub: 'fração → constante' },
              { key: 'denominator', label: '🏆 Denominador domina', sub: 'fração → 0' },
            ].map(({ key, label, sub }) => (
              <button key={key}
                onClick={() => setSelectedWinner(key)}
                className={cn('py-4 px-4 rounded-xl font-bold border-2 border-b-4 transition-all text-sm',
                  selectedWinner === key
                    ? key === 'numerator' ? 'bg-green-100 border-green-500 text-green-700'
                      : key === 'tie' ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
                      : 'bg-blue-100 border-blue-500 text-blue-700'
                    : 'bg-white border-v-line text-v-text hover:bg-slate-50')}>
                {label}<br />
                <span className="text-xs text-slate-500 font-medium">{sub}</span>
              </button>
            ))}
          </div>
          {selectedWinner && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => onSuccess(selectedWinner)}
              className="w-full v-btn-primary"
            >
              CONFIRMAR RESPOSTA
            </motion.button>
          )}
        </div>
      )}

      {/* Post-answer */}
      <AnimatePresence>
        {isAnswered && selectedWinner && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('p-5 rounded-2xl border-4 text-center',
              selectedWinner === correctWinner ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400')}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              {selectedWinner === correctWinner
                ? <><Check className="w-8 h-8 text-green-600" /><span className="font-black text-2xl text-green-700">Correto!</span></>
                : <><X className="w-8 h-8 text-red-600" /><span className="font-black text-2xl text-red-700">Incorreto</span></>}
            </div>
            <p className="text-base font-medium text-slate-700">
              {correctWinner === 'numerator' && `${numeratorLabel} cresce mais rápido. A fração → ∞.`}
              {correctWinner === 'denominator' && `${denominatorLabel} cresce mais rápido. A fração → 0.`}
              {correctWinner === 'tie' && `Mesmo grau — os coeficientes líderes determinam o limite.`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
