/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

interface InteractiveGraphProps {
  fn: (x: number) => number;
  hole?: { x: number, y: number };
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
  targetX,
  valueX,
}) => {
  const [internalDragX, setInternalDragX] = useState(range[0]);
  const dragX = valueX !== undefined ? valueX : internalDragX;

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);

  const padding = 40;
  const plotWidth = dimensions.width - padding * 2;
  const plotHeight = dimensions.height - padding * 2;

  // Calculate Y range dynamically from function values
  const calculateYRange = () => {
    let minY = Infinity;
    let maxY = -Infinity;
    
    for (let x = range[0]; x <= range[1]; x += 0.1) {
      if (hole && Math.abs(x - hole.x) < 0.01) continue;
      const y = fn(x);
      if (!Number.isNaN(y) && Number.isFinite(y)) {
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
    
    // Include hole in range
    if (hole && !Number.isNaN(hole.y) && Number.isFinite(hole.y)) {
      minY = Math.min(minY, hole.y);
      maxY = Math.max(maxY, hole.y);
    }
    
    // Include drag point in range
    const dragY = fn(dragX);
    if (!Number.isNaN(dragY) && Number.isFinite(dragY)) {
      minY = Math.min(minY, dragY);
      maxY = Math.max(maxY, dragY);
    }
    
    // Add padding (10% margin)
    const yRange = maxY - minY;
    const margin = yRange * 0.1 || 1; // fallback to 1 if range is 0
    
    return {
      minY: minY - margin,
      maxY: maxY + margin
    };
  };

  const { minY, maxY } = calculateYRange();

  const toScreenX = (x: number) => padding + ((x - range[0]) / (range[1] - range[0])) * plotWidth;
  const toScreenY = (y: number) => dimensions.height - padding - ((y - minY) / (maxY - minY)) * plotHeight;

  const fromScreenX = (sx: number) => {
    const relativeX = (sx - padding) / plotWidth;
    return range[0] + relativeX * (range[1] - range[0]);
  };

  const points = [];
  for (let x = range[0]; x <= range[1]; x += 0.05) {
    if (hole && Math.abs(x - hole.x) < 0.01) continue;
    const y = fn(x);
    if (!Number.isNaN(y)) {
      points.push(`${toScreenX(x)},${toScreenY(y)}`);
    }
  }

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const sx = clientX - rect.left;
    const x = Math.max(range[0], Math.min(range[1], fromScreenX(sx)));
    if (valueX === undefined) {
      setInternalDragX(x);
    }
    if (onValueChange) onValueChange(x, fn(x));
  };

  const dragY = fn(dragX);
  const isDragValid = !Number.isNaN(dragY);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-64 bg-[#1C1C1E] rounded-2xl border-b-4 border-black relative overflow-hidden cursor-crosshair touch-none"
      onMouseMove={(e) => e.buttons === 1 && handleDrag(e)}
      onMouseDown={handleDrag}
      onTouchMove={handleDrag}
    >
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }} />
      <svg width="100%" height="100%" className="select-none relative z-10">
        {/* Grid Lines */}
        <line x1={padding} y1={dimensions.height - padding} x2={dimensions.width - padding} y2={dimensions.height - padding} stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <line x1={padding} y1={padding} x2={padding} y2={dimensions.height - padding} stroke="rgba(255,255,255,0.3)" strokeWidth="2" />

        {/* Function Path */}
        <polyline
          points={points.join(' ')}
          fill="none"
          stroke="#58CC02"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 10px rgba(88,204,2,0.5))' }}
        />

        {/* Hole */}
        {hole && !Number.isNaN(hole.y) && (
          <circle
            cx={toScreenX(hole.x)}
            cy={toScreenY(hole.y)}
            r="8"
            fill="#1C1C1E"
            stroke="#58CC02"
            strokeWidth="3"
          />
        )}

        {/* Drag Point */}
        {isDragValid && (
          <motion.circle
            cx={toScreenX(dragX)}
            cy={toScreenY(dragY)}
            r="10"
            fill="#FF4B4B"
            initial={false}
            animate={{ cx: toScreenX(dragX), cy: toScreenY(dragY) }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ filter: 'drop-shadow(0 0 10px rgba(255,75,75,0.5))' }}
          />
        )}

        {/* Labels */}
        <text x={padding} y={dimensions.height - 10} fontSize="14" fontWeight="bold" fill="rgba(255,255,255,0.5)" textAnchor="middle">
          {range[0]}
        </text>
        <text x={dimensions.width - padding} y={dimensions.height - 10} fontSize="14" fontWeight="bold" fill="rgba(255,255,255,0.5)" textAnchor="middle">
          {range[1]}
        </text>
        <text x={padding - 5} y={dimensions.height - padding} fontSize="12" fontWeight="bold" fill="rgba(255,255,255,0.5)" textAnchor="end">
          {minY.toFixed(1)}
        </text>
        <text x={padding - 5} y={padding + 5} fontSize="12" fontWeight="bold" fill="rgba(255,255,255,0.5)" textAnchor="end">
          {maxY.toFixed(1)}
        </text>
      </svg>

      {/* Value Overlay */}
      <div className="absolute top-4 right-4 bg-white text-v-text px-4 py-2 rounded-xl text-sm font-mono font-bold shadow-lg border-2 border-v-line">
        x: {dragX.toFixed(2)} | y: {isDragValid ? dragY.toFixed(2) : 'Inexistente'}
      </div>
    </div>
  );
};
