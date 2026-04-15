/**
 * Rich lesson/module introduction component.
 *
 * Sections are revealed progressively as the student clicks "Próximo".
 * Supports four section types, each with its own visual language:
 *
 *  hook          → yellow callout — the attention-grabbing question or fact
 *  analogy       → 2-column card — real world (left) vs. mathematics (right)
 *  insight       → purple callout — the key conceptual takeaway
 *  numbered-list → numbered card — a sequence of ideas or examples
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, BookOpen } from 'lucide-react';
import { IntroSection } from '../../types';
import { cn } from '../../lib/utils';

interface LessonIntroCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  accentColor?: string;
  sections: IntroSection[];
  onDone: () => void;
}

// ── Individual section renderers ──────────────────────────────────────────────

function HookSection({ section }: { section: IntroSection }) {
  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5">
      <p className="text-amber-900 font-bold text-lg leading-relaxed">
        💡 {section.content}
      </p>
    </div>
  );
}

function AnalogySection({ section }: { section: IntroSection }) {
  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {section.title && (
        <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200">
          <p className="font-bold text-slate-600 text-sm">🔗 {section.title}</p>
        </div>
      )}
      <div className="grid grid-cols-2 divide-x divide-slate-200">
        <div className="p-5 bg-blue-50">
          <p className="text-xs font-black text-blue-500 uppercase tracking-wider mb-2">
            Mundo Real
          </p>
          <p className="text-slate-700 text-sm leading-relaxed">{section.realWorld}</p>
        </div>
        <div className="p-5 bg-purple-50">
          <p className="text-xs font-black text-purple-500 uppercase tracking-wider mb-2">
            Matemática
          </p>
          <p className="text-slate-700 text-sm leading-relaxed">{section.mathWorld}</p>
        </div>
      </div>
    </div>
  );
}

function InsightSection({ section }: { section: IntroSection }) {
  return (
    <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-5 flex gap-4">
      <span className="text-3xl shrink-0 leading-none mt-0.5">
        {section.icon ?? '🎯'}
      </span>
      <div>
        {section.title && (
          <p className="font-black text-purple-800 text-base mb-1">{section.title}</p>
        )}
        <p className="text-purple-700 leading-relaxed">{section.content}</p>
      </div>
    </div>
  );
}

function NumberedListSection({ section }: { section: IntroSection }) {
  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 shadow-sm">
      {section.title && (
        <p className="font-bold text-slate-700 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-slate-500" /> {section.title}
        </p>
      )}
      <ol className="space-y-3">
        {section.items?.map((item, i) => (
          <li key={i} className="flex gap-3 items-start">
            <span className="w-7 h-7 rounded-full bg-v-secondary text-white font-black text-sm flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="text-slate-600 leading-relaxed pt-0.5">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function renderSection(section: IntroSection, i: number) {
  return (
    <motion.div
      key={i}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {section.type === 'hook' && <HookSection section={section} />}
      {section.type === 'analogy' && <AnalogySection section={section} />}
      {section.type === 'insight' && <InsightSection section={section} />}
      {section.type === 'numbered-list' && <NumberedListSection section={section} />}
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export const LessonIntroCard: React.FC<LessonIntroCardProps> = ({
  title,
  subtitle,
  icon,
  accentColor = '#8b5cf6',
  sections,
  onDone,
}) => {
  const [revealed, setRevealed] = useState(1); // first section always visible
  const allShown = revealed >= sections.length;

  const handleNext = () => {
    if (allShown) {
      onDone();
    } else {
      setRevealed(r => r + 1);
    }
  };

  return (
    <div className="space-y-5">
      {/* Colored header */}
      <div
        className="rounded-3xl px-8 py-10 text-white text-center shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}bb 100%)`,
        }}
      >
        {icon && (
          <div className="text-7xl mb-4 drop-shadow-lg">{icon}</div>
        )}
        <h2 className="text-3xl font-black leading-tight drop-shadow">{title}</h2>
        {subtitle && (
          <p className="text-white/80 font-semibold mt-2 text-lg">{subtitle}</p>
        )}
      </div>

      {/* Section progress dots */}
      <div className="flex justify-center gap-2">
        {sections.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              i < revealed ? 'bg-v-secondary w-5' : 'bg-slate-200 w-2',
            )}
          />
        ))}
      </div>

      {/* Revealed sections (stack up) */}
      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {sections.slice(0, revealed).map((section, i) => (
            <React.Fragment key={i}>
              {renderSection(section, i)}
            </React.Fragment>
          ))}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <button
        onClick={handleNext}
        className={cn(
          'w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all',
          allShown ? 'v-btn-success' : 'v-btn-primary',
        )}
      >
        {allShown ? (
          'Pronto! Vamos começar →'
        ) : (
          <>Próximo <ChevronRight className="w-5 h-5" /></>
        )}
      </button>

      {/* Hint when not all shown */}
      {!allShown && (
        <p className="text-center text-xs text-slate-400">
          Seção {revealed} de {sections.length}
        </p>
      )}
    </div>
  );
};
