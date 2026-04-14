/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';

interface InfiniteZoomProps {
  fn: (x: number) => number;
  targetX: 'infinity' | number;
}

export const InfiniteZoom: React.FC<InfiniteZoomProps> = ({ fn, targetX }) => {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="w-full h-64 bg-[#1C1C1E] rounded-2xl border-b-4 border-black relative overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute top-4 left-4 text-white text-sm font-mono font-bold bg-white/10 px-3 py-1 rounded-lg">
        x → {targetX === 'infinity' ? '∞' : targetX}
      </div>
      
      <motion.div 
        className="text-5xl font-black text-v-secondary drop-shadow-[0_0_15px_rgba(28,176,246,0.5)]"
        animate={{ scale: 1 + (zoom - 1) * 0.1 }}
      >
        f(x) = {fn(zoom * 100).toFixed(6)}
      </motion.div>

      <div className="absolute bottom-6 left-6 right-6 space-y-2 z-10">
        <div className="flex justify-between text-white text-xs font-bold uppercase tracking-widest opacity-70">
          <span>Aumentar x</span>
          <span>x = {Math.round(zoom * 100)}</span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="1000" 
          value={zoom} 
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full h-3 bg-white/20 rounded-full appearance-none cursor-pointer accent-v-secondary"
        />
      </div>

      {/* Visual Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-v-secondary/40 rounded-full"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%` 
            }}
            animate={{ 
              scale: [1, 2, 1],
              opacity: [0.2, 0.8, 0.2],
              x: (Math.random() - 0.5) * 100 * zoom,
              y: (Math.random() - 0.5) * 100 * zoom,
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );
};
