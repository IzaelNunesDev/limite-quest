import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { AlertCircle, Lightbulb } from 'lucide-react';

interface FlashcardIndeterminacyProps {
  expression: string;
  isIndeterminate: boolean;
  onSuccess: () => void;
  isAnswered: boolean;
  onChoice: (choice: boolean) => void;
  userChoice: boolean | null;
}

export const FlashcardIndeterminacy: React.FC<FlashcardIndeterminacyProps> = ({
  expression,
  isIndeterminate,
  onSuccess,
  isAnswered,
  onChoice,
  userChoice
}) => {
  // Context info for each expression
  const getContext = () => {
    const expr = expression.replace(/\s/g, '');
    if (expr === '0/0') {
      return {
        title: 'Forma indeterminada clássica',
        explanation: '0/0 aparece quando tanto o numerador quanto o denominador tendem a zero. Não podemos dizer quanto vale — pode ser qualquer número! Precisamos simplificar a expressão.',
        example: 'Ex: lim (x²-1)/(x-1) quando x→1 dá 0/0, mas o limite é 2!'
      };
    }
    if (expr === '1/0') {
      return {
        title: 'Não é indeterminado — tende a infinito',
        explanation: 'Um número dividido por um valor que tende a zero cresce sem parar. O limite tende a +∞ ou -∞ (dependendo do sinal). Isso é "determinado" no sentido de que sabemos o comportamento!',
        example: 'Ex: lim 1/x quando x→0⁺ = +∞'
      };
    }
    if (expr === '∞/∞') {
      return {
        title: 'Forma indeterminada',
        explanation: 'Quando numerador e denominador crescem infinitamente, não sabemos quem "ganha". Pode tender a 0, infinito, ou uma constante.',
        example: 'Ex: lim x/x² quando x→∞ = 0, mas lim x²/x = ∞'
      };
    }
    if (expr === '0·∞') {
      return {
        title: 'Forma indeterminada',
        explanation: 'Zero vezes infinito é imprevisível: zero pode "vencer" ou infinito pode dominar.',
        example: 'Depende das funções envolvidas!'
      };
    }
    return {
      title: 'Análise da expressão',
      explanation: 'Pense: essa expressão tem um valor definido ou precisamos de mais informações para determinar o limite?',
      example: ''
    };
  };

  const context = getContext();

  return (
    <div className="space-y-6 flex flex-col items-center">
      {/* Context/Explanation */}
      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3 w-full max-w-lg">
        <Lightbulb className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-slate-700">
            O que é uma indeterminação?
          </p>
          <p className="text-sm text-slate-600 mt-1">
            {context.explanation}
          </p>
          {context.example && (
            <p className="text-xs text-slate-500 mt-1 italic">
              {context.example}
            </p>
          )}
        </div>
      </div>

      {/* Flashcard */}
      <motion.div
        className={cn(
          "w-72 h-40 rounded-3xl flex items-center justify-center shadow-xl border-4",
          "bg-white border-v-line"
        )}
      >
        <div className="text-5xl font-black font-mono text-v-text">
          {expression}
        </div>
      </motion.div>

      {/* Context badge */}
      <div className="bg-slate-100 rounded-xl px-4 py-2 text-center">
        <span className="text-sm font-bold text-slate-600">{context.title}</span>
      </div>

      {/* Choice Buttons */}
      {!isAnswered && (
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <button
            onClick={() => onChoice(true)}
            className={cn(
              "py-5 px-6 rounded-2xl font-bold text-base transition-all border-2 border-b-4",
              userChoice === true
                ? "bg-v-danger/20 border-v-danger text-v-danger"
                : "bg-white border-v-line text-v-text hover:bg-slate-50"
            )}
          >
            <AlertCircle className="w-5 h-5 inline mr-2" />
            SIM, é indeterminado
          </button>
          <button
            onClick={() => onChoice(false)}
            className={cn(
              "py-5 px-6 rounded-2xl font-bold text-base transition-all border-2 border-b-4",
              userChoice === false
                ? "bg-v-primary/20 border-v-primary text-v-primary"
                : "bg-white border-v-line text-v-text hover:bg-slate-50"
            )}
          >
            NÃO, é determinado
          </button>
        </div>
      )}
    </div>
  );
};
