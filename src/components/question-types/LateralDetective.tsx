import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Search, ArrowLeft, ArrowRight, Check, X, AlertCircle } from 'lucide-react';

interface LateralDetectiveProps {
  fnLeft: string;
  fnRight: string;
  targetX: number;
  onSuccess: (exists: boolean) => void;
  isAnswered: boolean;
}

export const LateralDetective: React.FC<LateralDetectiveProps> = ({
  fnLeft,
  fnRight,
  targetX,
  onSuccess,
  isAnswered
}) => {
  const [investigatedLeft, setInvestigatedLeft] = useState(false);
  const [investigatedRight, setInvestigatedRight] = useState(false);
  const [leftValue, setLeftValue] = useState<number | null>(null);
  const [rightValue, setRightValue] = useState<number | null>(null);
  const [conclusion, setConclusion] = useState<boolean | null>(null);

  const evaluateFn = (fn: string, x: number): number => {
    try {
      const mathContext = {
        x,
        sqrt: Math.sqrt,
        abs: Math.abs,
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        log: Math.log,
        pow: Math.pow,
        pi: Math.PI,
        e: Math.E,
      };

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

  const handleInvestigateLeft = () => {
    if (isAnswered || investigatedLeft) return;
    setInvestigatedLeft(true);

    // Approach from the left: evaluate at values getting closer to targetX
    const approachValues = [targetX - 0.1, targetX - 0.01, targetX - 0.001, targetX - 0.0001];
    const values = approachValues.map(x => evaluateFn(fnLeft, x));
    const validValues = values.filter(v => Number.isFinite(v));

    if (validValues.length === 0) {
      setLeftValue(Infinity); // Does not exist
    } else if (validValues.some(v => Math.abs(v) > 1000)) {
      setLeftValue(Infinity); // Goes to infinity
    } else {
      // Check convergence
      const last = validValues[validValues.length - 1];
      setLeftValue(last);
    }
  };

  const handleInvestigateRight = () => {
    if (isAnswered || investigatedRight) return;
    setInvestigatedRight(true);

    const approachValues = [targetX + 0.1, targetX + 0.01, targetX + 0.001, targetX + 0.0001];
    const values = approachValues.map(x => evaluateFn(fnRight, x));
    const validValues = values.filter(v => Number.isFinite(v));

    if (validValues.length === 0) {
      setRightValue(-Infinity); // Does not exist
    } else if (validValues.some(v => Math.abs(v) > 1000)) {
      setRightValue(Infinity); // Goes to infinity
    } else {
      const last = validValues[validValues.length - 1];
      setRightValue(last);
    }
  };

  const handleConclusion = (exists: boolean) => {
    if (isAnswered) return;
    setConclusion(exists);
  };

  const handleConfirm = () => {
    if (conclusion === null) return;
    onSuccess(conclusion);
  };

  const bothInvestigated = investigatedLeft && investigatedRight;

  // Determine if limits match
  const limitsMatch = (() => {
    if (leftValue === null || rightValue === null) return false;
    if (!Number.isFinite(leftValue) || !Number.isFinite(rightValue)) {
      // Both go to infinity? Still doesn't match if different directions
      return false;
    }
    return Math.abs(leftValue - rightValue) < 0.01;
  })();

  const isCorrect = conclusion === limitsMatch;

  // Get display value for limits
  const formatLimit = (val: number | null): string => {
    if (val === null) return 'Calculando...';
    if (!Number.isFinite(val)) return 'Não existe (∞)';
    return val.toFixed(4);
  };

  return (
    <div className="space-y-6">
      {/* Context/Explanation */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Search className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-700">
            Investigando os limites laterais em x = {targetX}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Para que o limite exista, os valores pela esquerda e pela direita devem convergir para o mesmo número.
            Clique em "Investigar" em cada lado para descobrir!
          </p>
        </div>
      </div>

      {/* Side-by-side investigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Side */}
        <div className="bg-white rounded-2xl border-2 border-v-line border-b-4 overflow-hidden">
          <div className="bg-v-secondary text-white px-4 py-2 font-bold text-sm flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Pela Esquerda (x → {targetX}⁻)
          </div>
          <div className="p-4 space-y-3">
            <div className="bg-slate-900 rounded-xl p-3 text-center">
              <span className="text-slate-400 text-xs font-mono">Aproximando pela esquerda...</span>
              <div className="font-mono text-2xl font-black text-v-secondary mt-1">
                {formatLimit(leftValue)}
              </div>
            </div>

            {/* Visual approach table */}
            {investigatedLeft && (
              <div className="text-xs font-mono space-y-1 bg-slate-50 p-2 rounded-lg">
                {[0.1, 0.01, 0.001].map(step => {
                  const x = targetX - step;
                  const y = evaluateFn(fnLeft, x);
                  return (
                    <div key={step} className="flex justify-between text-slate-600">
                      <span>x = {x.toFixed(4)}</span>
                      <span>f(x) = {Number.isFinite(y) ? y.toFixed(4) : '∞'}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {!investigatedLeft ? (
              <button
                onClick={handleInvestigateLeft}
                disabled={isAnswered}
                className="w-full v-btn-primary text-sm !py-3"
              >
                <Search className="w-4 h-4 inline mr-2" /> Investigar Lado Esquerdo
              </button>
            ) : (
              <div className={cn(
                "p-2 rounded-lg text-center font-bold text-sm",
                Number.isFinite(leftValue) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {Number.isFinite(leftValue) ? `L⁻ ≈ ${leftValue?.toFixed(2)}` : 'O limite lateral não existe!'}
              </div>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="bg-white rounded-2xl border-2 border-v-line border-b-4 overflow-hidden">
          <div className="bg-v-primary text-white px-4 py-2 font-bold text-sm flex items-center justify-end gap-2">
            Direita (x → {targetX}⁺) <ArrowRight className="w-4 h-4" />
          </div>
          <div className="p-4 space-y-3">
            <div className="bg-slate-900 rounded-xl p-3 text-center">
              <span className="text-slate-400 text-xs font-mono">Aproximando pela direita...</span>
              <div className="font-mono text-2xl font-black text-v-primary-dark mt-1">
                {formatLimit(rightValue)}
              </div>
            </div>

            {investigatedRight && (
              <div className="text-xs font-mono space-y-1 bg-slate-50 p-2 rounded-lg">
                {[0.1, 0.01, 0.001].map(step => {
                  const x = targetX + step;
                  const y = evaluateFn(fnRight, x);
                  return (
                    <div key={step} className="flex justify-between text-slate-600">
                      <span>x = {x.toFixed(4)}</span>
                      <span>f(x) = {Number.isFinite(y) ? y.toFixed(4) : '∞'}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {!investigatedRight ? (
              <button
                onClick={handleInvestigateRight}
                disabled={isAnswered}
                className="w-full v-btn-success text-sm !py-3"
              >
                <Search className="w-4 h-4 inline mr-2" /> Investigar Lado Direito
              </button>
            ) : (
              <div className={cn(
                "p-2 rounded-lg text-center font-bold text-sm",
                Number.isFinite(rightValue) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              )}>
                {Number.isFinite(rightValue) ? `L⁺ ≈ ${rightValue?.toFixed(2)}` : 'O limite lateral não existe!'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conclusion Section */}
      <AnimatePresence>
        {bothInvestigated && !isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-50 p-5 rounded-2xl border-2 border-v-line"
          >
            <div className="text-center space-y-3">
              <h3 className="font-bold text-v-text text-lg flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" /> Qual a sua conclusão?
              </h3>

              <div className="bg-white p-3 rounded-xl border border-v-line">
                <p className="text-sm text-slate-600">
                  L⁻ = <span className={cn("font-bold", Number.isFinite(leftValue) ? "text-v-secondary" : "text-v-danger")}>
                    {formatLimit(leftValue)}
                  </span>
                  {' | '}
                  L⁺ = <span className={cn("font-bold", Number.isFinite(rightValue) ? "text-v-primary-dark" : "text-v-danger")}>
                    {formatLimit(rightValue)}
                  </span>
                </p>
              </div>

              <p className="text-sm text-slate-500">
                {limitsMatch
                  ? "Os dois lados convergem para o mesmo valor..."
                  : "Os valores são diferentes ou um deles não existe..."}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleConclusion(true)}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl font-bold border-2 border-b-4 transition-all text-sm",
                    conclusion === true
                      ? "bg-green-100 border-green-500 text-green-700"
                      : "bg-white border-v-line text-v-text hover:bg-slate-50"
                  )}
                >
                  <Check className="w-4 h-4 inline mr-1" /> O limite Existe
                </button>
                <button
                  onClick={() => handleConclusion(false)}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl font-bold border-2 border-b-4 transition-all text-sm",
                    conclusion === false
                      ? "bg-red-100 border-red-500 text-red-700"
                      : "bg-white border-v-line text-v-text hover:bg-slate-50"
                  )}
                >
                  <X className="w-4 h-4 inline mr-1" /> O limite NÃO Existe
                </button>
              </div>

              {conclusion !== null && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleConfirm}
                  className="w-full v-btn-primary mt-2"
                >
                  CONFIRMAR RESPOSTA
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Answer Feedback */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "p-5 rounded-2xl border-4 text-center",
              limitsMatch
                ? "bg-green-100 border-green-400"
                : "bg-red-100 border-red-400"
            )}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              {limitsMatch ? (
                <>
                  <Check className="w-8 h-8 text-green-600" />
                  <span className="font-black text-2xl text-green-700">O Limite Existe!</span>
                </>
              ) : (
                <>
                  <X className="w-8 h-8 text-red-600" />
                  <span className="font-black text-2xl text-red-700">O Limite NÃO Existe</span>
                </>
              )}
            </div>
            <p className="text-base font-medium text-slate-700">
              {limitsMatch
                ? `Os limites laterais são iguais: L ≈ ${leftValue?.toFixed(4)}`
                : `Os limites laterais são diferentes: L⁻ ≈ ${leftValue !== null ? (Number.isFinite(leftValue) ? leftValue.toFixed(2) : '∞') : '?'} e L⁺ ≈ ${rightValue !== null ? (Number.isFinite(rightValue) ? rightValue.toFixed(2) : '∞') : '?'}. Para o limite existir, ambos devem convergir para o mesmo valor!`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
