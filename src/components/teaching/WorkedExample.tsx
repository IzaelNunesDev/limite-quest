/**
 * Phase-2 teaching step: the app walks through the solution of an example
 * problem. The student clicks "Próximo" to advance each step.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { WorkedStep } from '../../types';
import { cn } from '../../lib/utils';

interface WorkedExampleProps {
  expression: string;
  steps: WorkedStep[];
  conclusion: string;
  onDone: () => void;
}

const HIGHLIGHT_STYLE: Record<string, string> = {
  left: 'border-l-4 border-blue-400 bg-blue-50 text-blue-900',
  right: 'border-l-4 border-purple-400 bg-purple-50 text-purple-900',
  cancel: 'border-l-4 border-green-400 bg-green-50 text-green-900',
  none: 'bg-slate-50 text-slate-700',
};

export const WorkedExample: React.FC<WorkedExampleProps> = ({
  expression,
  steps,
  conclusion,
  onDone,
}) => {
  const [current, setCurrent] = useState(0);
  const done = current >= steps.length;

  const handleNext = () => {
    if (!done) {
      setCurrent(c => c + 1);
    } else {
      onDone();
    }
  };

  return (
    <div className="space-y-5">
      {/* Phase badge */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-100 rounded-full border border-blue-200 w-fit">
        <span className="text-blue-700 font-bold text-sm">Exemplo Guiado</span>
      </div>

      {/* Expression header */}
      <div className="bg-slate-900 rounded-2xl px-6 py-4 text-center border border-slate-700">
        <p className="text-xs text-slate-400 font-mono mb-1">Resolver:</p>
        <p className="text-2xl font-black text-white font-mono tracking-wide">{expression}</p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-2 justify-center">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i < current ? 'bg-v-primary w-5' : i === current ? 'bg-v-secondary w-5' : 'bg-slate-200 w-2',
            )}
          />
        ))}
        <motion.div
          className={cn('h-2 rounded-full transition-all duration-300', done ? 'bg-v-primary w-5' : 'bg-slate-200 w-2')}
        />
      </div>

      {/* Steps — reveal one at a time */}
      <div className="space-y-3">
        <AnimatePresence>
          {steps.slice(0, current).map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                'p-4 rounded-xl text-base font-medium leading-relaxed',
                HIGHLIGHT_STYLE[step.highlight ?? 'none'],
              )}
            >
              <span className="font-black text-slate-400 mr-2 text-sm">{i + 1}.</span>
              {step.text}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Current step being revealed (animated) */}
        {!done && current < steps.length && (
          <motion.div
            key={`current-${current}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className={cn(
              'p-4 rounded-xl text-base font-medium leading-relaxed ring-2',
              HIGHLIGHT_STYLE[steps[current].highlight ?? 'none'],
              steps[current].highlight === 'left' ? 'ring-blue-300' :
              steps[current].highlight === 'right' ? 'ring-purple-300' :
              steps[current].highlight === 'cancel' ? 'ring-green-300' :
              'ring-slate-300',
            )}
          >
            <span className="font-black text-slate-400 mr-2 text-sm">{current + 1}.</span>
            {steps[current].text}
          </motion.div>
        )}

        {/* Conclusion */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-2xl bg-[#D7FFB8] border-2 border-v-primary flex items-start gap-3"
            >
              <CheckCircle2 className="w-6 h-6 text-v-primary-dark shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-v-primary-dark text-base">Conclusão</p>
                <p className="text-v-primary-dark font-medium mt-0.5">{conclusion}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation button */}
      <button
        onClick={handleNext}
        className={cn(
          'w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all',
          done ? 'v-btn-success' : 'v-btn-primary',
        )}
      >
        {done ? 'Agora você tenta!' : (
          <>Próximo passo <ChevronRight className="w-5 h-5" /></>
        )}
      </button>
    </div>
  );
};
