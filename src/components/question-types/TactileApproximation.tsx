import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { Target, CheckCircle, AlertCircle } from 'lucide-react';

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
  isAnswered
}) => {
  const [currentX, setCurrentX] = useState<number>(targetX + 1.5);
  const [precision, setPrecision] = useState(0);
  const [isClose, setIsClose] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Safe math evaluator
  const evaluateFn = (x: number): number => {
    try {
      const mathContext: any = {
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

      // Parse the function string and evaluate safely
      const processedFn = fn
        .replace(/\bx\*\*2\b/g, 'x*x')
        .replace(/\bx\*\*3\b/g, 'x*x*x')
        .replace(/\bsqrt\(/g, 'sqrt(')
        .replace(/\babs\(/g, 'abs(')
        .replace(/\bsin\(/g, 'sin(')
        .replace(/\bcos\(/g, 'cos(')
        .replace(/\btan\(/g, 'tan(')
        .replace(/\blog\(/g, 'log(')
        .replace(/\bpi\b/g, 'pi')
        .replace(/\be\b/g, 'e');

      // Use Function constructor with math context
      const fnWithMath = new Function(
        'x', 'sqrt', 'abs', 'sin', 'cos', 'tan', 'log', 'pow', 'pi', 'e',
        `return ${processedFn}`
      );
      const result = fnWithMath(
        x, Math.sqrt, Math.abs, Math.sin, Math.cos, Math.tan, Math.log, Math.pow, Math.PI, Math.E
      );
      return result;
    } catch (e) {
      return NaN;
    }
  };

  // Draw the graph on canvas
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
    const padding = { top: 30, right: 20, bottom: 40, left: 50 };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;

    // Calculate Y range
    const xMin = Math.max(domain[0], targetX - 2.5);
    const xMax = Math.min(domain[1], targetX + 2.5);
    let yMin = Infinity;
    let yMax = -Infinity;

    const step = (xMax - xMin) / 200;
    for (let x = xMin; x <= xMax; x += step) {
      if (Math.abs(x - targetX) < 0.05) continue;
      const y = evaluateFn(x);
      if (Number.isFinite(y)) {
        yMin = Math.min(yMin, y);
        yMax = Math.max(yMax, y);
      }
    }

    // Include target Y
    if (Number.isFinite(targetY)) {
      yMin = Math.min(yMin, targetY);
      yMax = Math.max(yMax, targetY);
    }

    // Add padding
    const yRange = yMax - yMin || 2;
    yMin -= yRange * 0.15;
    yMax += yRange * 0.15;

    const toScreenX = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth;
    const toScreenY = (y: number) => padding.top + (1 - (y - yMin) / (yMax - yMin)) * plotHeight;

    // Clear
    ctx.fillStyle = '#1C1C1E';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const gx = padding.left + (i / 10) * plotWidth;
      ctx.beginPath();
      ctx.moveTo(gx, padding.top);
      ctx.lineTo(gx, padding.top + plotHeight);
      ctx.stroke();

      const gy = padding.top + (i / 10) * plotHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, gy);
      ctx.lineTo(padding.left + plotWidth, gy);
      ctx.stroke();
    }

    // Axes labels
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(xMin.toFixed(1), padding.left, height - 10);
    ctx.fillText(xMax.toFixed(1), padding.left + plotWidth, height - 10);
    ctx.textAlign = 'right';
    ctx.fillText(yMin.toFixed(1), padding.left - 5, padding.top + plotHeight);
    ctx.fillText(yMax.toFixed(1), padding.left - 5, padding.top + 15);

    // Target X line
    ctx.strokeStyle = 'rgba(255,200,0,0.4)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(toScreenX(targetX), padding.top);
    ctx.lineTo(toScreenX(targetX), padding.top + plotHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw function curve
    ctx.strokeStyle = '#58CC02';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(88,204,2,0.5)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    let started = false;

    for (let x = xMin; x <= xMax; x += step) {
      if (Math.abs(x - targetX) < 0.03) continue;
      const y = evaluateFn(x);
      if (!Number.isFinite(y)) {
        started = false;
        continue;
      }
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

    // Hole at target
    const holeScreenX = toScreenX(targetX);
    const holeScreenY = toScreenY(targetY);
    ctx.beginPath();
    ctx.arc(holeScreenX, holeScreenY, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#1C1C1E';
    ctx.fill();
    ctx.strokeStyle = '#58CC02';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Target Y label
    ctx.fillStyle = '#58CC02';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`y = ${targetY}`, holeScreenX + 15, holeScreenY - 10);

    // Current X point
    const currentY = evaluateFn(currentX);
    if (Number.isFinite(currentY)) {
      const cx = toScreenX(currentX);
      const cy = toScreenY(currentY);

      // Vertical line to target
      ctx.strokeStyle = 'rgba(255,75,75,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx, holeScreenY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(holeScreenX, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#FF4B4B';
      ctx.shadowColor = 'rgba(255,75,75,0.6)';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [currentX, targetX, targetY, domain, evaluateFn]);

  const handleSliderChange = (x: number) => {
    if (isAnswered) return;

    const clampedX = Math.max(domain[0], Math.min(domain[1], x));
    setCurrentX(clampedX);
    setHasInteracted(true);

    const distance = Math.abs(clampedX - targetX);
    if (distance < 0.001) {
      setPrecision(3);
      setIsClose(true);
      onSuccess();
    } else if (distance < 0.01) {
      setPrecision(3);
      setIsClose(true);
    } else if (distance < 0.1) {
      setPrecision(2);
      setIsClose(true);
    } else if (distance < 0.5) {
      setPrecision(1);
      setIsClose(false);
    } else {
      setPrecision(0);
      setIsClose(false);
    }
  };

  const sliderMin = Math.max(domain[0], targetX - 2);
  const sliderMax = Math.min(domain[1], targetX + 2);
  const currentY = evaluateFn(currentX);

  const getZoneInfo = () => {
    if (precision === 0) return { color: 'bg-slate-200', text: 'Longe do alvo', bg: 'bg-slate-50' };
    if (precision === 1) return { color: 'bg-blue-200', text: 'Perto...', bg: 'bg-blue-50' };
    if (precision === 2) return { color: 'bg-yellow-200', text: 'Muito perto!', bg: 'bg-yellow-50' };
    return { color: 'bg-green-200', text: '✓ No alvo!', bg: 'bg-green-50' };
  };

  const zone = getZoneInfo();

  return (
    <div className="space-y-6">
      {/* Instruction Banner */}
      <motion.div
        className={cn(
          "p-4 rounded-xl border-2 flex items-start gap-3",
          isClose ? "bg-green-50 border-green-300" : "bg-blue-50 border-blue-200"
        )}
      >
        {isClose ? <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-0.5" /> : <Target className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />}
        <div>
          <p className="font-bold text-slate-700">
            {isClose
              ? "✓ Você está chegando muito perto! Continue ajustando..."
              : `Objetivo: Aproxime x de ${targetX} para descobrir o limite`}
          </p>
          {!hasInteracted && (
            <p className="text-sm text-slate-500 mt-1">
              Use o slider abaixo para mover o ponto vermelho no gráfico. Observe para onde o y está indo!
            </p>
          )}
        </div>
      </motion.div>

      {/* Graph Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-64 rounded-2xl border-2 border-slate-700"
          style={{ width: '100%', height: '256px' }}
        />
        {/* Value overlay */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur text-v-text px-3 py-2 rounded-xl text-sm font-mono font-bold shadow-lg border border-v-line">
          x = {currentX.toFixed(4)} | y = {Number.isFinite(currentY) ? currentY.toFixed(4) : '—'}
        </div>
      </div>

      {/* Approximation Table */}
      <div className="bg-white rounded-2xl border-2 border-v-line p-4">
        <h4 className="font-bold text-v-text mb-3 text-center">📋 Tabela de Aproximação</h4>
        <p className="text-sm text-slate-500 text-center mb-3">
          Veja os valores de f(x) conforme nos aproximamos de x = {targetX}:
        </p>
        <div className="space-y-2 font-mono text-sm">
          {[
            { x: targetX + 0.1, label: '0.1' },
            { x: targetX + 0.01, label: '0.01' },
            { x: targetX + 0.001, label: '0.001' },
          ].map((item, i) => {
            const y = evaluateFn(item.x);
            const isActive = precision >= i + 1;
            return (
              <div
                key={i}
                className={cn(
                  "flex justify-between p-2 rounded transition-colors",
                  isActive
                    ? cn("font-bold", i === 0 ? "bg-blue-100 text-blue-800" : i === 1 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800")
                    : "text-slate-400"
                )}
              >
                <span>x = {targetX} + {item.label} → {item.x.toFixed(4)}</span>
                <span>f(x) = {Number.isFinite(y) ? y.toFixed(4) : '—'}</span>
              </div>
            );
          })}
        </div>
        <div className={cn(
          "mt-3 p-2 rounded-lg text-center font-bold text-sm",
          zone.color
        )}>
          {zone.text}
        </div>
      </div>

      {/* Slider */}
      <div className="bg-slate-50 rounded-xl p-4 border-2 border-v-line">
        <div className="flex justify-between items-center mb-3">
          <p className="font-bold text-slate-600">Deslize para aproximar x de {targetX}</p>
          <span className={cn(
            "px-3 py-1 rounded-lg font-bold text-sm",
            zone.color
          )}>
            x = {currentX.toFixed(3)}
          </span>
        </div>

        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          step="0.0001"
          value={currentX}
          onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
          disabled={isAnswered}
          className="w-full h-3 bg-white rounded-full appearance-none cursor-pointer border-2 border-v-line accent-v-primary"
        />

        <div className="flex justify-between text-xs text-slate-500 font-medium mt-2">
          <span>{sliderMin.toFixed(1)}</span>
          <span className="text-v-primary font-bold">alvo → {targetX}</span>
          <span>{sliderMax.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};
