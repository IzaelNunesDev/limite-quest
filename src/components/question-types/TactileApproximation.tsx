import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Target, CheckCircle } from 'lucide-react';
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

interface TactileApproximationProps {
  fn: string;
  targetX: number;
  targetY: number;
  domain?: [number, number];
  onSuccess: () => void;
  isAnswered: boolean;
}

export const TactileApproximation: React.FC<TactileApproximationProps> = ({
  fn,
  targetX,
  targetY,
  domain = [-10, 10],
  onSuccess,
  isAnswered,
}) => {
  const [currentX, setCurrentX] = useState<number>(targetX + 1.5);
  const [precision, setPrecision] = useState(0);
  const [isClose, setIsClose] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [autoAnimDone, setAutoAnimDone] = useState(false);
  const [liveRows, setLiveRows] = useState<{ x: number; y: number; side: 'left' | 'right' | 'live' }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-approach animation on mount (builds intuition before slider interaction)
  useEffect(() => {
    const positions = [targetX + 1.5, targetX + 0.5, targetX + 0.1, targetX + 0.01];
    let i = 0;
    const id = setInterval(() => {
      if (i < positions.length) {
        const x = positions[i];
        setCurrentX(x);
        const y = evaluateFn(x);
        if (Number.isFinite(y)) {
          setLiveRows(prev => {
            const next = [...prev, { x, y, side: 'live' as const }];
            return next.slice(-4);
          });
        }
        const dist = Math.abs(x - targetX);
        if (dist < 0.001) setPrecision(3);
        else if (dist < 0.01) setPrecision(2);
        else if (dist < 0.1) setPrecision(1);
        i++;
      } else {
        clearInterval(id);
        setAutoAnimDone(true);
        // Reset to a comfortable starting position for manual exploration
        setCurrentX(targetX + 1.0);
        setPrecision(0);
        setLiveRows([]);
      }
    }, 600);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs only on mount

  const evaluateFn = useCallback((x: number): number => {
    try {
      const processedFn = fn
        .replace(/\bx\*\*2\b/g, 'x*x').replace(/\bx\*\*3\b/g, 'x*x*x')
        .replace(/\bsqrt\(/g, 'sqrt(').replace(/\babs\(/g, 'abs(')
        .replace(/\bsin\(/g, 'sin(').replace(/\bcos\(/g, 'cos(')
        .replace(/\btan\(/g, 'tan(').replace(/\blog\(/g, 'log(')
        .replace(/\bpi\b/g, 'pi').replace(/\be\b(?!\+|-|\d)/g, 'e');
      const f = new Function(
        'x', 'sqrt', 'abs', 'sin', 'cos', 'tan', 'log', 'pow', 'pi', 'e',
        `return ${processedFn}`,
      );
      return f(x, Math.sqrt, Math.abs, Math.sin, Math.cos, Math.tan, Math.log, Math.pow, Math.PI, Math.E);
    } catch {
      return NaN;
    }
  }, [fn]);

  // ── Canvas drawing ─────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { ctx, width, height } = setupCanvas(canvas);
    const xMin = Math.max(domain[0], targetX - 2.5);
    const xMax = Math.min(domain[1], targetX + 2.5);

    drawBackground(ctx, width, height);
    drawGrid(ctx, width, height, DEFAULT_PAD);

    const result = plotFunction(ctx, evaluateFn, width, height, {
      xMin,
      xMax,
      holeAt: targetX,
      holeY: targetY,
      color: '#58CC02',
      lineWidth: 3,
    });

    const { toScreenX, toScreenY } = result;

    // Dashed target line
    drawDashedLine(
      ctx,
      toScreenX(targetX), DEFAULT_PAD.top,
      toScreenX(targetX), height - DEFAULT_PAD.bottom,
      'rgba(255,200,0,0.4)',
    );

    // Hole at target
    drawHole(ctx, toScreenX(targetX), toScreenY(targetY), '#1C1C1E', '#58CC02', 10);

    // Target Y label
    ctx.fillStyle = '#58CC02';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`y = ${targetY}`, toScreenX(targetX) + 14, toScreenY(targetY) - 8);

    // Current X point with guide lines
    const currentY = evaluateFn(currentX);
    if (Number.isFinite(currentY)) {
      const cx = toScreenX(currentX);
      const cy = toScreenY(currentY);
      const hx = toScreenX(targetX);
      const hy = toScreenY(targetY);

      // Crosshair guide lines
      drawDashedLine(ctx, cx, cy, hx, cy, 'rgba(255,75,75,0.3)', [3, 3]);
      drawDashedLine(ctx, cx, cy, cx, hy, 'rgba(255,75,75,0.3)', [3, 3]);

      drawDot(ctx, cx, cy, '#FF4B4B', 8);
    }

    // Axis labels
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(xMin.toFixed(1), DEFAULT_PAD.left, height - 6);
    ctx.fillText(xMax.toFixed(1), width - DEFAULT_PAD.right, height - 6);

  }, [currentX, targetX, targetY, domain, evaluateFn]);

  // ── Slider handler ─────────────────────────────────────────────────────────

  const handleSliderChange = (x: number) => {
    if (isAnswered) return;
    const clamped = Math.max(domain[0], Math.min(domain[1], x));
    setCurrentX(clamped);
    setHasInteracted(true);

    // Add live row (keep last 3)
    const y = evaluateFn(clamped);
    if (Number.isFinite(y)) {
      setLiveRows(prev => {
        const side: 'left' | 'right' = clamped < targetX ? 'left' : 'right';
        const next = [...prev.filter(r => r.side !== 'live'), { x: clamped, y, side: 'live' as const }];
        return next.slice(-4);
      });
    }

    const dist = Math.abs(clamped - targetX);
    if (dist < 0.001) { setPrecision(3); setIsClose(true); onSuccess(); }
    else if (dist < 0.01) { setPrecision(3); setIsClose(true); }
    else if (dist < 0.1) { setPrecision(2); setIsClose(true); }
    else if (dist < 0.5) { setPrecision(1); setIsClose(false); }
    else { setPrecision(0); setIsClose(false); }
  };

  const sliderMin = Math.max(domain[0], targetX - 2);
  const sliderMax = Math.min(domain[1], targetX + 2);
  const currentY = evaluateFn(currentX);

  const zone = precision === 3
    ? { color: 'bg-green-200 text-green-800', text: '✓ No alvo!' }
    : precision === 2
    ? { color: 'bg-yellow-200 text-yellow-800', text: 'Muito perto!' }
    : precision === 1
    ? { color: 'bg-blue-200 text-blue-800', text: 'Perto...' }
    : { color: 'bg-slate-200 text-slate-600', text: 'Longe do alvo' };

  // ── Fixed bilateral table rows ─────────────────────────────────────────────

  const leftRows = [
    { x: targetX - 0.1, label: '−0.1' },
    { x: targetX - 0.01, label: '−0.01' },
    { x: targetX - 0.001, label: '−0.001' },
  ];
  const rightRows = [
    { x: targetX + 0.001, label: '+0.001' },
    { x: targetX + 0.01, label: '+0.01' },
    { x: targetX + 0.1, label: '+0.1' },
  ];

  return (
    <div className="space-y-5">
      {/* Banner */}
      <motion.div className={cn('p-4 rounded-xl border-2 flex items-start gap-3',
        isClose ? 'bg-green-50 border-green-300' : 'bg-blue-50 border-blue-200')}>
        {isClose
          ? <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
          : <Target className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />}
        <div>
          <p className="font-bold text-slate-700">
            {isClose
              ? '✓ Chegando perto! Continue ajustando...'
              : `Objetivo: aproxime x de ${targetX} e observe para onde f(x) caminha`}
          </p>
          {!hasInteracted && (
            <p className="text-sm text-slate-500 mt-1">Use o slider para mover o ponto vermelho.</p>
          )}
        </div>
      </motion.div>

      {/* Canvas */}
      <div className="relative">
        <canvas ref={canvasRef} className="w-full h-64 rounded-2xl border-2 border-slate-700"
          style={{ width: '100%', height: '256px' }} />
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur text-v-text px-3 py-2 rounded-xl text-sm font-mono font-bold shadow border border-v-line">
          x = {currentX.toFixed(4)} | f = {Number.isFinite(currentY) ? currentY.toFixed(4) : '—'}
        </div>
      </div>

      {/* Bilateral approximation table */}
      <div className="bg-white rounded-2xl border-2 border-v-line p-4">
        <h4 className="font-bold text-v-text mb-3 text-center text-sm">
          Tabela de Aproximação — x → {targetX}
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {/* Left side */}
          <div>
            <p className="text-xs font-bold text-blue-600 mb-1.5 text-center">← Pela esquerda</p>
            <div className="space-y-1 font-mono text-xs">
              {leftRows.map((row, i) => {
                const y = evaluateFn(row.x);
                const active = precision >= (3 - i);
                return (
                  <div key={row.label} className={cn('flex justify-between p-1.5 rounded transition-colors',
                    active ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-400')}>
                    <span>x = {row.x.toFixed(4)}</span>
                    <span>{Number.isFinite(y) ? y.toFixed(3) : '—'}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div>
            <p className="text-xs font-bold text-purple-600 mb-1.5 text-center">Pela direita →</p>
            <div className="space-y-1 font-mono text-xs">
              {rightRows.map((row, i) => {
                const y = evaluateFn(row.x);
                const active = precision >= (i + 1);
                return (
                  <div key={row.label} className={cn('flex justify-between p-1.5 rounded transition-colors',
                    active ? 'bg-purple-50 text-purple-800 font-bold' : 'text-slate-400')}>
                    <span>x = {row.x.toFixed(4)}</span>
                    <span>{Number.isFinite(y) ? y.toFixed(3) : '—'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live value from slider */}
        <AnimatePresence>
          {hasInteracted && Number.isFinite(currentY) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-2 rounded-lg bg-red-50 border border-red-200 font-mono text-xs font-bold text-red-700 flex justify-between"
            >
              <span>→ slider: x = {currentX.toFixed(5)}</span>
              <span>f(x) = {currentY.toFixed(5)}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zone indicator */}
        <div className={cn('mt-3 p-2 rounded-lg text-center font-bold text-sm', zone.color)}>
          {zone.text}
        </div>
      </div>

      {/* Slider */}
      <div className="bg-slate-50 rounded-xl p-4 border-2 border-v-line">
        <div className="flex justify-between items-center mb-2">
          <p className="font-bold text-slate-600 text-sm">
            {autoAnimDone ? `Deslize → x = ${targetX}` : '🟡 Observe a aproximação automática...'}
          </p>
          <span className={cn('px-3 py-1 rounded-lg font-bold text-sm', zone.color)}>
            x = {currentX.toFixed(3)}
          </span>
        </div>
        <input type="range" min={sliderMin} max={sliderMax} step="0.0001" value={currentX}
          onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
          disabled={isAnswered || !autoAnimDone}
          className={cn(
            'w-full h-3 bg-white rounded-full appearance-none border-2 border-v-line accent-v-primary',
            autoAnimDone ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
          )} />
        <div className="flex justify-between text-xs text-slate-500 font-medium mt-1">
          <span>{sliderMin.toFixed(1)}</span>
          <span className="text-v-primary font-bold">alvo → {targetX}</span>
          <span>{sliderMax.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};
