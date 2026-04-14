/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Lock, Check, Star, Trophy } from 'lucide-react';
import { Island, Lesson } from '../types';
import { cn } from '../lib/utils';

interface IslandMapProps {
  islands: Island[];
  completedLessons: string[];
  unlockedIslands: string[];
  onStartLesson: (lesson: Lesson) => void;
  onBossClick: (islandId: string) => void;
}

export const IslandMap: React.FC<IslandMapProps> = ({
  islands,
  completedLessons,
  unlockedIslands,
  onStartLesson,
  onBossClick,
}) => {
  const totalLessons = islands.reduce((acc, island) => acc + island.lessons.length, 0);
  const completedCount = completedLessons.length;
  const bridgeProgress = (completedCount / totalLessons) * 100;

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-12">
      {/* Bridge Narrative */}
      <div className="v-card space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="font-bold text-v-text text-lg">A Ponte do Infinito</h3>
            <p className="text-sm text-slate-500 font-medium">Reconstrua a ponte resolvendo limites!</p>
          </div>
          <span className="text-v-secondary font-black text-2xl">{Math.round(bridgeProgress)}%</span>
        </div>
        <div className="h-4 bg-v-line rounded-full overflow-hidden flex gap-1 p-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "flex-1 rounded-sm transition-all duration-1000",
                bridgeProgress > (i * 10) ? "bg-v-primary" : "bg-transparent"
              )} 
            />
          ))}
        </div>
      </div>

      {islands.map((island, islandIdx) => {
        const isUnlocked = unlockedIslands.includes(island.id);
        
        return (
          <div key={island.id} className={cn("space-y-8 relative", !isUnlocked && "opacity-60 grayscale")}>
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-white drop-shadow-md bg-v-map-bg inline-block px-8 py-4 rounded-3xl border-b-8 border-v-map-border">
                ILHA {islandIdx + 1}: {island.title.toUpperCase()}
              </h2>
            </div>

            <div className="bg-v-map-bg rounded-[40px] p-10 border-b-8 border-v-map-border relative overflow-hidden flex flex-col items-center gap-8">
              {/* Clouds */}
              <div className="absolute bg-white h-10 w-24 rounded-full opacity-60 top-[10%] left-[5%]" />
              <div className="absolute bg-white h-12 w-32 rounded-full opacity-60 top-[20%] right-[10%]" />
              <div className="absolute bg-white h-8 w-20 rounded-full opacity-60 bottom-[15%] left-[15%]" />

              {/* Path Line */}
              <div className="absolute top-0 bottom-0 w-3 bg-black/10 z-0" />

              {island.lessons.map((lesson, lessonIdx) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isCurrent = !isCompleted && (lessonIdx === 0 || completedLessons.includes(island.lessons[lessonIdx - 1]?.id));
                const isLocked = !isUnlocked || (!isCompleted && !isCurrent);

                // Zig-zag offset
                const offset = (lessonIdx % 2 === 0 ? 50 : -50);

                return (
                  <motion.button
                    key={lesson.id}
                    onClick={() => !isLocked && onStartLesson(lesson)}
                    style={{ x: offset }}
                    className={cn(
                      "v-node group",
                      isLocked ? "v-node-locked" : isCompleted ? "" : "ring-4 ring-white/50"
                    )}
                  >
                    {isLocked ? (
                      <Lock className="w-8 h-8" />
                    ) : isCompleted ? (
                      <Check className="w-10 h-10 stroke-[4]" />
                    ) : (
                      <Star className="w-10 h-10 fill-current text-white" />
                    )}
                    
                    {/* Tooltip-like Label */}
                    <div className={cn(
                      "absolute top-full mt-4 bg-white px-4 py-2 rounded-xl shadow-md border-2 border-v-line whitespace-nowrap z-10",
                      isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                      <p className="text-sm font-bold text-v-text">{lesson.title}</p>
                    </div>

                    {isCurrent && (
                      <div className="absolute -top-10 bg-white text-v-secondary text-xs font-black px-3 py-1.5 rounded-xl border-2 border-v-line uppercase tracking-tighter animate-bounce">
                        Começar
                      </div>
                    )}
                  </motion.button>
                );
              })}

              {/* Boss Castle */}
              {island.bossId && (
                <motion.button
                  onClick={() => {
                    const allCompleted = island.lessons.every(l => completedLessons.includes(l.id));
                    if (allCompleted) {
                      onBossClick(island.id);
                    }
                  }}
                  className={cn(
                    "v-node v-node-boss mt-4",
                    !island.lessons.every(l => completedLessons.includes(l.id)) && "v-node-locked grayscale"
                  )}
                >
                  <Trophy className={cn("w-12 h-12", island.lessons.every(l => completedLessons.includes(l.id)) ? "text-white" : "text-v-locked-dark")} />
                </motion.button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
