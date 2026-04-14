/**
 * Phase-1 teaching step: a silent animation that builds visual intuition
 * before any formula is shown. The user watches (~15 s), then clicks continue.
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';

type ConceptVisual =
  | 'lateral-approach'
  | 'bridge-broken'
  | 'unit-circle'
  | 'infinity-growth';

interface ConceptIntroProps {
  visual: ConceptVisual;
  caption: string;
  onContinue: () => void;
}

// ── Lateral approach: two dots converge on a hole from both sides ────────────

function LateralApproachAnim() {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const W = 320;
  const CX = W / 2;
  const CY = 60;

  return (
    <svg width={W} height={130} viewBox={`0 0 ${W} 130`} className="overflow-visible">
      <defs>
        <filter id="gblue">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="gpurple">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Number line */}
      <line x1={20} y1={CY} x2={W - 20} y2={CY} stroke="#475569" strokeWidth="2" />

      {/* Tick marks */}
      {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75].map((v, i) => {
        const sx = 20 + (v / 2) * (W - 40);
        return (
          <g key={i}>
            <line x1={sx} y1={CY - 5} x2={sx} y2={CY + 5} stroke="#475569" strokeWidth="1.5" />
            <text x={sx} y={CY + 18} textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="monospace">
              {v.toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* Open circle at x=1 */}
      <circle cx={CX} cy={CY} r={11} fill="#1e293b" stroke="#94a3b8" strokeWidth="2.5" />
      <text x={CX} y={CY - 18} textAnchor="middle" fontSize="12" fill="#94a3b8" fontFamily="monospace" fontWeight="bold">1</text>

      {/* Blue dot — approaches from left */}
      <motion.circle
        initial={{ cx: 50 }}
        animate={{ cx: phase >= 1 ? CX - 24 : 50 }}
        transition={{ duration: 1.8, ease: 'easeInOut' }}
        cy={CY} r={10}
        fill="#3b82f6"
        filter="url(#gblue)"
      />
      <text x={50} y={CY - 18} textAnchor="middle" fontSize="11" fill="#3b82f6" fontWeight="bold">x→1⁻</text>

      {/* Purple dot — approaches from right */}
      <motion.circle
        initial={{ cx: W - 50 }}
        animate={{ cx: phase >= 1 ? CX + 24 : W - 50 }}
        transition={{ duration: 1.8, ease: 'easeInOut' }}
        cy={CY} r={10}
        fill="#a855f7"
        filter="url(#gpurple)"
      />
      <text x={W - 50} y={CY - 18} textAnchor="middle" fontSize="11" fill="#a855f7" fontWeight="bold">x→1⁺</text>

      {/* Convergence values */}
      <AnimatePresence>
        {phase >= 2 && (
          <>
            <motion.text
              key="lL"
              x={CX - 28} y={CY + 30}
              textAnchor="middle" fontSize="12"
              fill="#3b82f6" fontWeight="bold"
              initial={{ opacity: 0, y: CY + 40 }}
              animate={{ opacity: 1, y: CY + 30 }}
              transition={{ duration: 0.5 }}
            >
              L⁻ = 2
            </motion.text>
            <motion.text
              key="lR"
              x={CX + 28} y={CY + 30}
              textAnchor="middle" fontSize="12"
              fill="#a855f7" fontWeight="bold"
              initial={{ opacity: 0, y: CY + 40 }}
              animate={{ opacity: 1, y: CY + 30 }}
              transition={{ duration: 0.5 }}
            >
              L⁺ = 2
            </motion.text>
            <motion.text
              key="eq"
              x={CX} y={CY + 50}
              textAnchor="middle" fontSize="13"
              fill="#22c55e" fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              L⁻ = L⁺ → limite existe!
            </motion.text>
          </>
        )}
      </AnimatePresence>
    </svg>
  );
}

// ── Bridge broken: dots arrive at DIFFERENT y-values ─────────────────────────

function BridgeBrokenAnim() {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 2400);
    const t3 = setTimeout(() => setPhase(3), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const W = 320;
  const H = 160;
  const CX = W / 2;
  const topY = 45;    // y=-1 maps here (lower)
  const botY = 115;   // this is not used
  const yMinus1 = 110; // screen-y for function value -1
  const yPlus1 = 50;   // screen-y for function value +1

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {/* Axis */}
      <line x1={20} y1={H / 2} x2={W - 20} y2={H / 2} stroke="#475569" strokeWidth="1.5" />
      <line x1={CX} y1={15} x2={CX} y2={H - 10} stroke="#475569" strokeWidth="1.5" strokeDasharray="4,3" />

      {/* Left curve: flat at y = -1 (screen yMinus1) */}
      <motion.line
        x1={20} y1={yMinus1}
        x2={CX - 16} y2={yMinus1}
        stroke="#3b82f6" strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />

      {/* Right curve: flat at y = +1 (screen yPlus1) */}
      <motion.line
        x1={CX + 16} y1={yPlus1}
        x2={W - 20} y2={yPlus1}
        stroke="#a855f7" strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
      />

      {/* Blue open circle at approach */}
      <AnimatePresence>
        {phase >= 2 && (
          <motion.circle key="hl" cx={CX} cy={yMinus1} r={9}
            fill="#1e293b" stroke="#3b82f6" strokeWidth="2.5"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
          />
        )}
      </AnimatePresence>

      {/* Purple open circle at approach */}
      <AnimatePresence>
        {phase >= 2 && (
          <motion.circle key="hr" cx={CX} cy={yPlus1} r={9}
            fill="#1e293b" stroke="#a855f7" strokeWidth="2.5"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}
          />
        )}
      </AnimatePresence>

      {/* Gap arrow + X */}
      <AnimatePresence>
        {phase >= 3 && (
          <motion.g key="gap"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 250 }}
          >
            <line x1={CX} y1={yPlus1 + 11} x2={CX} y2={yMinus1 - 11} stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
            <text x={CX + 12} y={(yPlus1 + yMinus1) / 2 + 4} fontSize="12" fill="#ef4444" fontWeight="bold">gap!</text>
            <text x={20} y={yMinus1 + 4} textAnchor="middle" fontSize="11" fill="#3b82f6" fontWeight="bold">−1</text>
            <text x={W - 20} y={yPlus1 + 4} textAnchor="end" fontSize="11" fill="#a855f7" fontWeight="bold">+1</text>
          </motion.g>
        )}
      </AnimatePresence>

      {/* Labels */}
      <text x={55} y={yMinus1 - 12} textAnchor="middle" fontSize="11" fill="#3b82f6" fontWeight="bold">x→a⁻</text>
      <text x={W - 55} y={yPlus1 - 12} textAnchor="middle" fontSize="11" fill="#a855f7" fontWeight="bold">x→a⁺</text>
    </svg>
  );
}

// ── Infinity growth: bars growing at different rates ──────────────────────────

function InfinityGrowthAnim() {
  const [step, setStep] = useState(0);
  const xVals = [1, 10, 100, 1000];
  const x = xVals[Math.min(step, xVals.length - 1)];
  const num = 2 * x + 1;
  const den = x + 3;
  const maxVal = Math.max(num, den);
  const barMax = 180;

  useEffect(() => {
    const id = setInterval(() => {
      setStep(s => (s < xVals.length - 1 ? s + 1 : s));
    }, 1200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3 pt-2">
      <p className="text-xs font-mono text-slate-400">x = {x.toLocaleString()}</p>
      <div className="flex items-end gap-8 h-[120px]">
        {[
          { label: '2x+1', value: num, color: '#22c55e' },
          { label: 'x+3', value: den, color: '#3b82f6' },
        ].map(({ label, value, color }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <motion.div
              className="w-16 rounded-t-lg"
              style={{ backgroundColor: color }}
              animate={{ height: Math.max(4, (value / maxVal) * barMax) }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
            <span className="text-xs font-mono font-bold" style={{ color }}>{label}</span>
            <span className="text-xs font-mono text-slate-400">{value.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <p className="text-sm font-bold text-slate-500">
        razão ≈ <span className="text-yellow-600">{(num / den).toFixed(3)}</span> → 2
      </p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const PHASE_LABEL: Record<ConceptVisual, string> = {
  'lateral-approach': 'Conceito: Dois Caminhos',
  'bridge-broken': 'Conceito: Ponte Quebrada',
  'unit-circle': 'Conceito: Limite Fundamental',
  'infinity-growth': 'Conceito: Corrida ao Infinito',
};

export const ConceptIntro: React.FC<ConceptIntroProps> = ({ visual, caption, onContinue }) => {
  const [ready, setReady] = useState(false);

  // Auto-unlock "continue" after the animation has had time to play
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="flex flex-col items-center gap-6 py-4"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Phase badge */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-purple-100 rounded-full border border-purple-200">
        <span className="text-purple-700 font-bold text-sm">{PHASE_LABEL[visual]}</span>
      </div>

      {/* Animation area */}
      <div className="bg-slate-900 rounded-3xl p-8 w-full flex flex-col items-center min-h-[180px] justify-center shadow-lg border border-slate-700">
        {visual === 'lateral-approach' && <LateralApproachAnim />}
        {visual === 'bridge-broken' && <BridgeBrokenAnim />}
        {visual === 'infinity-growth' && <InfinityGrowthAnim />}
        {visual === 'unit-circle' && (
          <div className="text-slate-300 text-center space-y-2 py-4">
            <p className="text-5xl font-black text-white">sin(u)/u</p>
            <p className="text-2xl text-yellow-400 font-bold">→ 1</p>
            <p className="text-sm text-slate-400 mt-2">quando u → 0</p>
          </div>
        )}
      </div>

      {/* Caption */}
      <p className="text-center text-lg font-bold text-slate-600 max-w-sm leading-snug">
        {caption}
      </p>

      {/* Continue */}
      <AnimatePresence>
        {ready && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={onContinue}
            className="flex items-center gap-2 v-btn-primary min-w-[220px] justify-center"
          >
            Ver Exemplo <ArrowRight className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {!ready && (
        <p className="text-sm text-slate-400 animate-pulse">Aguarde a animação...</p>
      )}
    </motion.div>
  );
};
