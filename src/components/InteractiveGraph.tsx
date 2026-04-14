/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Canvas-based interactive graph.
 * Replaces the previous SVG polyline approach, which incorrectly connected
 * adjacent points across holes and jump discontinuities.
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  setupCanvas,
  drawBackground,
  drawGrid,
  plotFunction,
  drawHole,
  drawDot,
  drawAxisLabels,
  DEFAULT_PAD,
} from '../lib/mathGraph';

interface InteractiveGraphProps {
  fn: (x: number) => number;
  hole?: { x: number; y: number };
  range: [number, number];
  onValueChange?: (x: number, y: number) => void;
  targetX?: number;
  valueX?: number;
}

export const InteractiveGraph: React.FC<InteractiveGraphProps> = ({
  fn,
  hole,
  range,
  onValueChange,
  valueX,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [internalX, setInternalX] = useState(range[0]);
  const dragX = valueX !== undefined ? valueX : internalX;

  // Draw whenever dragX or range changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { ctx, width, height } = setupCanvas(canvas);

    drawBackground(ctx, width, height);
    drawGrid(ctx, width, height, DEFAULT_PAD);

    const result = plotFunction(ctx, fn, width, height, {
      xMin: range[0],
      xMax: range[1],
      holeAt: hole?.x,
      holeY: hole?.y,
      color: '#58CC02',
      lineWidth: 3,
    });

    const { toScreenX, toScreenY, yMin, yMax } = result;

    // Axes labels
    drawAxisLabels(ctx, width, height, range[0], range[1], yMin, yMax);

    // Draggable point
    const dragY = fn(dragX);
    if (Number.isFinite(dragY)) {
      drawDot(ctx, toScreenX(dragX), toScreenY(dragY), '#FF4B4B', 9);
    }

    // Target X dashed line
    if (hole) {
      const tx = toScreenX(hole.x);
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = 'rgba(255,200,0,0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tx, DEFAULT_PAD.top);
      ctx.lineTo(tx, height - DEFAULT_PAD.bottom);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [dragX, fn, hole, range]);

  // Mouse / touch drag
  const handlePointer = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const relX = (clientX - rect.left) / rect.width;
    const x = Math.max(range[0], Math.min(range[1], range[0] + relX * (range[1] - range[0])));
    if (valueX === undefined) setInternalX(x);
    if (onValueChange) onValueChange(x, fn(x));
  };

  const dragY = fn(dragX);

  return (
    <div
      ref={containerRef}
      className="w-full h-64 relative cursor-crosshair touch-none"
      onMouseMove={(e) => e.buttons === 1 && handlePointer(e)}
      onMouseDown={handlePointer}
      onTouchMove={handlePointer}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded-2xl border-b-4 border-black"
        style={{ width: '100%', height: '100%' }}
      />
      {/* Value overlay */}
      <div className="absolute top-3 right-3 bg-white text-v-text px-3 py-1.5 rounded-xl text-sm font-mono font-bold shadow border-2 border-v-line">
        x: {dragX.toFixed(2)} | y: {Number.isFinite(dragY) ? dragY.toFixed(2) : 'Inexistente'}
      </div>
    </div>
  );
};
