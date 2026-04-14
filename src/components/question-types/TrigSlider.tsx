import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { Info } from 'lucide-react';

interface TrigSliderProps {
  expression: string;
  targetMultiplier: number;
  onSuccess: () => void;
  isAnswered: boolean;
  userAnswer: number | null;
  onAnswer: (value: number) => void;
}

export const TrigSlider: React.FC<TrigSliderProps> = ({
  expression,
  targetMultiplier,
  onSuccess,
  isAnswered,
  userAnswer,
  onAnswer,
}) => {
  const multiplier = userAnswer ?? 1;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isCorrect = multiplier === targetMultiplier;

  // Draw the trig visualization on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= width; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i <= height; i += 30) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();

    // Scale: show x from -2π to 2π
    const xRange = 2 * Math.PI;
    const yMax = 2;

    const toScreenX = (x: number) => centerX + (x / xRange) * width;
    const toScreenY = (y: number) => centerY - (y / yMax) * (height / 2);

    // Draw y = x reference line (dashed green)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.beginPath();
    for (let x = -xRange; x <= xRange; x += 0.05) {
      const sx = toScreenX(x);
      const sy = toScreenY(x);
      if (x === -xRange) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Label for y=x
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('y = x', toScreenX(1.5) + 5, toScreenY(1.5) - 5);

    // Draw sin(kx) curve
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(59,130,246,0.3)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    let started = false;

    for (let x = -xRange; x <= xRange; x += 0.02) {
      const y = Math.sin(multiplier * x);
      const sx = toScreenX(x);
      const sy = toScreenY(y);

      if (!started) {
        ctx.moveTo(sx, sy);
        started = true;
      } else {
        ctx.lineTo(sx, sy);
      }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Label for sin(kx)
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`sin(${multiplier}x)`, toScreenX(1.2) - 5, toScreenY(Math.sin(multiplier * 1.2)) - 8);

    // Origin point
    ctx.beginPath();
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('-2π', toScreenX(-2 * Math.PI), height - 8);
    ctx.fillText('0', centerX, height - 8);
    ctx.fillText('2π', toScreenX(2 * Math.PI), height - 8);
  }, [multiplier]);

  return (
    <div className="space-y-6 flex flex-col items-center">
      {/* Context/Explanation */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-start gap-3 w-full max-w-lg">
        <Info className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-700">
            O limite fundamental: lim sin(u)/u = 1
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Quando o argumento do seno (u) é igual ao denominador, o limite vale 1.
            Se temos sin(<b>{targetMultiplier}x</b>), o denominador também deve ser <b>{targetMultiplier}x</b>!
            Ajuste o slider para escolher o valor de k.
          </p>
        </div>
      </div>

      {/* Question Display */}
      <div className="text-center space-y-2">
        <h3 className="font-bold text-v-text text-lg">Encontre k para que o limite seja 1:</h3>
        <p className="text-3xl font-black text-v-secondary font-mono bg-slate-100 px-6 py-3 rounded-xl border-2 border-v-line">
          lim (x→0) sin({targetMultiplier}x) / (k·x)
        </p>
      </div>

      {/* Visual Canvas */}
      <div className="relative w-full max-w-md">
        <canvas
          ref={canvasRef}
          className="w-full h-56 rounded-2xl border-2 border-v-line"
          style={{ width: '100%', height: '224px' }}
        />
        {/* Legend */}
        <div className="absolute top-3 left-3 bg-white/90 px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-500"></div>
            <span className="text-blue-600">sin({multiplier}x)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-green-500" style={{ borderTop: '2px dashed' }}></div>
            <span className="text-green-600">y = x</span>
          </div>
        </div>

        {/* Target hint */}
        <div className="absolute bottom-3 right-3 bg-white/90 px-3 py-2 rounded-lg border-2 border-slate-200 text-xs font-bold">
          <span className="text-slate-500">Alvo: k = </span>
          <span className="text-v-secondary font-black">{targetMultiplier}</span>
        </div>
      </div>

      {/* Slider */}
      <div className="bg-white rounded-2xl border-2 border-v-line p-4 w-full max-w-md">
        <div className="flex justify-between items-center mb-3">
          <span className="font-bold text-slate-700">Valor de k:</span>
          <span className={cn(
            "px-4 py-2 rounded-lg font-black text-xl",
            multiplier === targetMultiplier
              ? "bg-[#D7FFB8] text-v-primary-dark"
              : "bg-slate-100 text-slate-600"
          )}>
            {multiplier}
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="6"
          step="1"
          value={multiplier}
          onChange={(e) => {
            if (!isAnswered) {
              onAnswer(Number(e.target.value));
            }
          }}
          disabled={isAnswered}
          className="w-full h-6 bg-slate-200 rounded-full appearance-none cursor-pointer accent-v-secondary"
        />

        {/* Tick marks */}
        <div className="flex justify-between px-1 mt-2">
          {[1, 2, 3, 4, 5, 6].map(k => (
            <div
              key={k}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                k === multiplier
                  ? k === targetMultiplier
                    ? "bg-green-500 text-white scale-110 shadow-lg"
                    : "bg-blue-500 text-white scale-110"
                  : "bg-slate-100 text-slate-500"
              )}
            >
              {k}
            </div>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="bg-slate-50 rounded-xl p-3 text-center text-sm text-slate-600 font-medium max-w-md border border-v-line">
        <span className="font-bold">Dica:</span> Para sin(<b>{targetMultiplier}x</b>), o denominador precisa ser{' '}
        <span className="font-mono font-black text-v-secondary">{targetMultiplier}x</span>{' '}
        para que sin(u)/u → 1.
      </div>

      {/* Success Feedback (only shown after answered correctly) */}
      <AnimatePresence>
        {isAnswered && isCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-100 border-2 border-green-400 rounded-xl p-5 text-center max-w-md"
          >
            <p className="font-black text-xl text-green-700">Perfeito!</p>
            <p className="text-base text-green-600 mt-1">
              Com k = {targetMultiplier}, temos sin({targetMultiplier}x)/({targetMultiplier}x) → 1 ✓
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
