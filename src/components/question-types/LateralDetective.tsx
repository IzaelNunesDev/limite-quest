import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Search, ArrowLeft, ArrowRight, Check, X, AlertCircle } from 'lucide-react';
import {
  setupCanvas,
  drawBackground,
  drawGrid,
  plotFunction,
  drawHole,
  drawDot,
  drawDashedLine,
  DEFAULT_PAD,
} from '../../lib/mathGraph';

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
  isAnswered,
}) => {
  const [investigatedLeft, setInvestigatedLeft] = useState(false);
  const [investigatedRight, setInvestigatedRight] = useState(false);
  const [leftValue, setLeftValue] = useState<number | null>(null);
  const [rightValue, setRightValue] = useState<number | null>(null);
  const [conclusion, setConclusion] = useState<boolean | null>(null);
  const [bridgeBroken, setBridgeBroken] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Safe function evaluator ────────────────────────────────────────────────

  const evaluateFn = useCallback((fn: string, x: number): number => {
    try {
      const processedFn = fn
        .replace(/Math\.sqrt/g, 'sqrt').replace(/Math\.abs/g, 'abs')
        .replace(/Math\.sin/g, 'sin').replace(/Math\.cos/g, 'cos')
        .replace(/Math\.tan/g, 'tan').replace(/Math\.log/g, 'log')
        .replace(/Math\.pow/g, 'pow').replace(/Math\.PI/g, 'pi')
        .replace(/Math\.E/g, 'e');
      const f = new Function(
        'x', 'sqrt', 'abs', 'sin', 'cos', 'tan', 'log', 'pow', 'pi', 'e',
        `return ${processedFn}`,
      );
      return f(x, Math.sqrt, Math.abs, Math.sin, Math.cos, Math.tan, Math.log, Math.pow, Math.PI, Math.E);
    } catch {
      return NaN;
    }
  }, [fnLeft, fnRight]);

  // ── Split canvas: blue left, purple right ─────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { ctx, width, height } = setupCanvas(canvas);
    drawBackground(ctx, width, height);
    drawGrid(ctx, width, height);

    const pad = DEFAULT_PAD;
    const plotW = width - pad.left - pad.right;
    const xRange = 3; // show [targetX-1.5, targetX+1.5]
    const xMin = targetX - 1.5;
    const xMax = targetX + 1.5;

    // Evaluate the function to build toScreenX/Y
    const fnL = (x: number) => evaluateFn(fnLeft, x);
    const fnR = (x: number) => evaluateFn(fnRight, x);

    // Use the left function's y-range as the base (same fn usually)
    const result = plotFunction(ctx, fnL, width, height, {
      xMin,
      xMax,
      holeAt: targetX,
      holeY: evaluateFn(fnLeft, targetX - 0.0001), // approach from left for y-range calc
      color: 'transparent',   // we draw manually below
      lineWidth: 0,
    });

    const { toScreenX, toScreenY, yMin, yMax } = result;

    // Dashed vertical at targetX
    drawDashedLine(
      ctx,
      toScreenX(targetX), pad.top,
      toScreenX(targetX), height - pad.bottom,
      'rgba(255,200,0,0.5)',
    );

    // LEFT side: blue curve for x < targetX
    const steps = 300;
    const xStep = (xMax - xMin) / steps;
    const gapHalf = xStep * 5;

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#3b82f680';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    let penDown = false;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * xStep;
      if (x >= targetX - gapHalf) break; // stop before the hole
      const y = fnL(x);
      if (!Number.isFinite(y) || Math.abs(y) > (yMax - yMin) * 8) { penDown = false; continue; }
      const sx = toScreenX(x);
      const sy = toScreenY(y);
      if (!penDown) { ctx.moveTo(sx, sy); penDown = true; }
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // RIGHT side: purple curve for x > targetX
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#a855f780';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    penDown = false;
    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * xStep;
      if (x <= targetX + gapHalf) { penDown = false; continue; }
      const y = fnR(x);
      if (!Number.isFinite(y) || Math.abs(y) > (yMax - yMin) * 8) { penDown = false; continue; }
      const sx = toScreenX(x);
      const sy = toScreenY(y);
      if (!penDown) { ctx.moveTo(sx, sy); penDown = true; }
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Open circles at the hole (approach values)
    const yFromLeft = evaluateFn(fnLeft, targetX - 0.001);
    const yFromRight = evaluateFn(fnRight, targetX + 0.001);

    if (investigatedLeft && Number.isFinite(yFromLeft)) {
      drawHole(ctx, toScreenX(targetX), toScreenY(yFromLeft), '#1C1C1E', '#3b82f6', 9);
    }
    if (investigatedRight && Number.isFinite(yFromRight)) {
      drawHole(ctx, toScreenX(targetX), toScreenY(yFromRight), '#1C1C1E', '#a855f7', 9);
    }

    // Dots showing current approach progress
    if (investigatedLeft && Number.isFinite(yFromLeft)) {
      drawDot(ctx, toScreenX(targetX - 0.15), toScreenY(yFromLeft), '#3b82f6', 7, true);
    }
    if (investigatedRight && Number.isFinite(yFromRight)) {
      drawDot(ctx, toScreenX(targetX + 0.15), toScreenY(yFromRight), '#a855f7', 7, true);
    }

    // Gap indicator when both investigated and different
    if (investigatedLeft && investigatedRight && bridgeBroken) {
      const sy1 = toScreenY(yFromLeft);
      const sy2 = toScreenY(yFromRight);
      const sx = toScreenX(targetX);
      // Red lightning bolt gap
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(sx, Math.min(sy1, sy2) + 10);
      ctx.lineTo(sx, Math.max(sy1, sy2) - 10);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(xMin.toFixed(1), pad.left, height - 6);
    ctx.fillText(xMax.toFixed(1), pad.left + plotW, height - 6);
    ctx.fillText(String(targetX), toScreenX(targetX), height - 6);

  }, [investigatedLeft, investigatedRight, bridgeBroken, targetX, fnLeft, fnRight, evaluateFn]);

  // ── Investigation handlers ─────────────────────────────────────────────────

  const handleInvestigateLeft = () => {
    if (isAnswered || investigatedLeft) return;
    setInvestigatedLeft(true);
    const vals = [targetX - 0.1, targetX - 0.01, targetX - 0.001, targetX - 0.0001];
    const ys = vals.map(x => evaluateFn(fnLeft, x)).filter(Number.isFinite);
    setLeftValue(ys.length === 0 ? Infinity : Math.abs(ys[ys.length - 1]) > 1000 ? Infinity : ys[ys.length - 1]);
  };

  const handleInvestigateRight = () => {
    if (isAnswered || investigatedRight) return;
    setInvestigatedRight(true);
    const vals = [targetX + 0.1, targetX + 0.01, targetX + 0.001, targetX + 0.0001];
    const ys = vals.map(x => evaluateFn(fnRight, x)).filter(Number.isFinite);
    setRightValue(ys.length === 0 ? -Infinity : Math.abs(ys[ys.length - 1]) > 1000 ? Infinity : ys[ys.length - 1]);
  };

  // Trigger bridge-broken animation after both sides investigated
  useEffect(() => {
    if (investigatedLeft && investigatedRight) {
      const match =
        leftValue !== null && rightValue !== null &&
        Number.isFinite(leftValue) && Number.isFinite(rightValue) &&
        Math.abs(leftValue - rightValue) < 0.01;
      if (!match) {
        const t = setTimeout(() => setBridgeBroken(true), 600);
        return () => clearTimeout(t);
      }
    }
  }, [investigatedLeft, investigatedRight, leftValue, rightValue]);

  const bothInvestigated = investigatedLeft && investigatedRight;

  const limitsMatch =
    leftValue !== null && rightValue !== null &&
    Number.isFinite(leftValue) && Number.isFinite(rightValue) &&
    Math.abs(leftValue - rightValue) < 0.01;

  const formatLimit = (val: number | null) =>
    val === null ? '...' : !Number.isFinite(val) ? '∞' : val.toFixed(4);

  return (
    <div className="space-y-5">
      {/* Context */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Search className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-700">Investigando limites laterais em x = {targetX}</p>
          <p className="text-sm text-slate-600 mt-1">
            <span className="font-bold text-blue-600">Azul = esquerda</span> &nbsp;|&nbsp;
            <span className="font-bold text-purple-600">Roxo = direita</span>.
            Para o limite existir, ambos precisam convergir para o <em>mesmo</em> valor.
          </p>
        </div>
      </div>

      {/* Split canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-56 rounded-2xl border-2 border-slate-700"
          style={{ width: '100%', height: '224px' }}
        />
        {/* Left label */}
        <div className="absolute top-2 left-3 bg-blue-600/90 text-white text-xs font-bold px-2 py-1 rounded-lg">
          ← esquerda
        </div>
        {/* Right label */}
        <div className="absolute top-2 right-3 bg-purple-600/90 text-white text-xs font-bold px-2 py-1 rounded-lg">
          direita →
        </div>
        {/* Bridge broken badge */}
        <AnimatePresence>
          {bridgeBroken && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white font-black text-sm px-3 py-1.5 rounded-xl shadow-lg"
            >
              Ponte quebrada!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side-by-side panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left panel */}
        <div className="bg-white rounded-2xl border-2 border-v-line border-b-4 overflow-hidden">
          <div className="bg-blue-600 text-white px-4 py-2 font-bold text-sm flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Pela Esquerda (x → {targetX}⁻)
          </div>
          <div className="p-4 space-y-3">
            <div className="bg-slate-900 rounded-xl p-3 text-center">
              <span className="text-slate-400 text-xs font-mono">Limite pela esquerda</span>
              <div className="font-mono text-2xl font-black text-blue-400 mt-1">{formatLimit(leftValue)}</div>
            </div>
            {investigatedLeft && (
              <div className="text-xs font-mono space-y-1 bg-slate-50 p-2 rounded-lg">
                {[0.1, 0.01, 0.001].map(step => {
                  const x = targetX - step;
                  const y = evaluateFn(fnLeft, x);
                  return (
                    <div key={step} className="flex justify-between text-slate-600">
                      <span className="text-blue-600">x = {x.toFixed(4)}</span>
                      <span>f(x) = {Number.isFinite(y) ? y.toFixed(4) : '∞'}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {!investigatedLeft ? (
              <button onClick={handleInvestigateLeft} disabled={isAnswered}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors">
                <Search className="w-4 h-4 inline mr-2" />Investigar Esquerda
              </button>
            ) : (
              <div className={cn('p-2 rounded-lg text-center font-bold text-sm',
                Number.isFinite(leftValue) ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700')}>
                {Number.isFinite(leftValue) ? `L⁻ ≈ ${leftValue?.toFixed(3)}` : 'Não existe (∞)'}
              </div>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="bg-white rounded-2xl border-2 border-v-line border-b-4 overflow-hidden">
          <div className="bg-purple-600 text-white px-4 py-2 font-bold text-sm flex items-center justify-end gap-2">
            Pela Direita (x → {targetX}⁺) <ArrowRight className="w-4 h-4" />
          </div>
          <div className="p-4 space-y-3">
            <div className="bg-slate-900 rounded-xl p-3 text-center">
              <span className="text-slate-400 text-xs font-mono">Limite pela direita</span>
              <div className="font-mono text-2xl font-black text-purple-400 mt-1">{formatLimit(rightValue)}</div>
            </div>
            {investigatedRight && (
              <div className="text-xs font-mono space-y-1 bg-slate-50 p-2 rounded-lg">
                {[0.1, 0.01, 0.001].map(step => {
                  const x = targetX + step;
                  const y = evaluateFn(fnRight, x);
                  return (
                    <div key={step} className="flex justify-between text-slate-600">
                      <span className="text-purple-600">x = {x.toFixed(4)}</span>
                      <span>f(x) = {Number.isFinite(y) ? y.toFixed(4) : '∞'}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {!investigatedRight ? (
              <button onClick={handleInvestigateRight} disabled={isAnswered}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors">
                <Search className="w-4 h-4 inline mr-2" />Investigar Direita
              </button>
            ) : (
              <div className={cn('p-2 rounded-lg text-center font-bold text-sm',
                Number.isFinite(rightValue) ? 'bg-purple-100 text-purple-700' : 'bg-red-100 text-red-700')}>
                {Number.isFinite(rightValue) ? `L⁺ ≈ ${rightValue?.toFixed(3)}` : 'Não existe (∞)'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conclusion */}
      <AnimatePresence>
        {bothInvestigated && !isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-50 p-5 rounded-2xl border-2 border-v-line space-y-4"
          >
            <h3 className="font-bold text-v-text text-lg flex items-center gap-2 justify-center">
              <AlertCircle className="w-5 h-5" /> Qual a sua conclusão?
            </h3>

            {/* Summary comparison */}
            <div className="bg-white p-3 rounded-xl border border-v-line text-center text-sm">
              <span className="font-bold text-blue-600">L⁻ = {formatLimit(leftValue)}</span>
              {' '}vs{' '}
              <span className="font-bold text-purple-600">L⁺ = {formatLimit(rightValue)}</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConclusion(true)}
                className={cn('flex-1 py-3 px-4 rounded-xl font-bold border-2 border-b-4 transition-all text-sm',
                  conclusion === true ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-v-line text-v-text hover:bg-slate-50')}
              >
                <Check className="w-4 h-4 inline mr-1" />Limite Existe
              </button>
              <button
                onClick={() => setConclusion(false)}
                className={cn('flex-1 py-3 px-4 rounded-xl font-bold border-2 border-b-4 transition-all text-sm',
                  conclusion === false ? 'bg-red-100 border-red-500 text-red-700' : 'bg-white border-v-line text-v-text hover:bg-slate-50')}
              >
                <X className="w-4 h-4 inline mr-1" />Não Existe
              </button>
            </div>

            {conclusion !== null && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => onSuccess(conclusion!)}
                className="w-full v-btn-primary"
              >
                CONFIRMAR RESPOSTA
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-answer feedback */}
      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn('p-5 rounded-2xl border-4 text-center',
              limitsMatch ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400')}
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              {limitsMatch ? (
                <><Check className="w-8 h-8 text-green-600" /><span className="font-black text-2xl text-green-700">Limite Existe!</span></>
              ) : (
                <><X className="w-8 h-8 text-red-600" /><span className="font-black text-2xl text-red-700">Limite NÃO Existe</span></>
              )}
            </div>
            <p className="text-base font-medium text-slate-700">
              {limitsMatch
                ? `L⁻ = L⁺ ≈ ${leftValue?.toFixed(4)}`
                : `L⁻ = ${formatLimit(leftValue)} ≠ L⁺ = ${formatLimit(rightValue)} — os lados não concordam.`}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
