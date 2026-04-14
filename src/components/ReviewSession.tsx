/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, X } from 'lucide-react';
import { Question } from '../types';

interface ReviewSessionProps {
  questions: Question[];
  onComplete: (results: { id: string, correct: boolean }[]) => void;
  onCancel: () => void;
}

export const ReviewSession: React.FC<ReviewSessionProps> = ({
  questions,
  onComplete,
  onCancel,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ id: string, correct: boolean }[]>([]);

  // This is a simplified version for now
  return (
    <div className="fixed inset-0 bg-slate-900/90 z-[60] flex items-center justify-center p-6 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border-b-8 border-v-line">
        <div className="p-6 bg-v-secondary text-white flex justify-between items-center border-b-4 border-v-secondary-dark">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 fill-current" />
            <h3 className="font-black text-2xl uppercase tracking-tight">Revisão Relâmpago</h3>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X /></button>
        </div>
        
        <div className="p-8 text-center space-y-8">
          <p className="text-v-text font-bold text-lg">Você tem {questions.length} questões para revisar hoje!</p>
          <button 
            onClick={() => onComplete([])}
            className="v-btn-primary w-full"
          >
            Começar Revisão
          </button>
        </div>
      </div>
    </div>
  );
};
