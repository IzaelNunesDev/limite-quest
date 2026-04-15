/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Motor de geração procedural de exercícios para o Dojo.
 *
 * Cada função retorna um GeneratedQuestion com:
 *  - expression  : string formatada para exibição
 *  - options     : 4 alternativas embaralhadas
 *  - correctIndex: índice da resposta correta após embaralhamento
 *  - meta        : dados para o prompt do Gemini quando o aluno erra
 */

export interface GeneratedQuestion {
  id: string;
  title: string;
  expression: string;
  type: 'diff-squares' | 'common-factor' | 'lateral-detection';
  options: string[];
  correctIndex: number;
  explanation: string;
  meta: Record<string, any>;
}

// ── Utilities ────────────────────────────────────────────────────────────────

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

function shuffle<T>(arr: T[]): { shuffled: T[]; correctIndex: number } {
  const correctItem = arr[0]; // correct is always first before shuffle
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return { shuffled: copy, correctIndex: copy.indexOf(correctItem) };
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Generator 1: Diferença de Quadrados ─────────────────────────────────────

/**
 * Gera: lim (x² − a²) / (x − a) quando x → a
 * Resposta: a + a = 2a  (pois cancela o fator)
 */
export function generateDiffSquares(): GeneratedQuestion {
  const a = randInt(2, 7);
  const aSquared = a * a;
  const answer = 2 * a;

  const correct = `${answer}  →  (x+${a}) ao cancelar (x−${a})`;
  const distractors = [
    `${a}  →  apenas a raiz de ${aSquared}`,
    `${aSquared}  →  confundiu com a²`,
    `${a + 1}  →  erro de +1 no fator`,
  ];

  const { shuffled, correctIndex } = shuffle([correct, ...distractors]);

  return {
    id: uid(),
    title: 'Diferença de Quadrados',
    expression: `lim (x² − ${aSquared}) / (x − ${a})   [x → ${a}]`,
    type: 'diff-squares',
    options: shuffled,
    correctIndex,
    explanation: `x² − ${aSquared} = (x − ${a})(x + ${a}). Cancele (x − ${a}) no denominador. Sobra x + ${a}. Substitua x = ${a}: ${a} + ${a} = ${answer}.`,
    meta: { a, aSquared, answer, type: 'diff-squares' },
  };
}

// ── Generator 2: Fator Comum ─────────────────────────────────────────────────

/**
 * Gera: lim (ax + ab) / (x + b) quando x → −b   →   resultado = a
 */
export function generateCommonFactor(): GeneratedQuestion {
  const a = randInt(2, 6);
  const b = randInt(2, 5);
  const numeratorStr = `${a}x + ${a * b}`;
  const denominatorStr = `x + ${b}`;
  const targetX = -b;

  const correct = `${a}  →  fator comum ${a} cancela (x+${b})`;
  const distractors = [
    `${a * b}  →  confundiu com o termo constante`,
    `${b}  →  confundiu com o denominador`,
    `${a + b}  →  somou em vez de cancelar`,
  ];

  const { shuffled, correctIndex } = shuffle([correct, ...distractors]);

  return {
    id: uid(),
    title: 'Fator Comum em Evidência',
    expression: `lim (${numeratorStr}) / (${denominatorStr})   [x → ${targetX}]`,
    type: 'common-factor',
    options: shuffled,
    correctIndex,
    explanation: `${numeratorStr} = ${a}(x + ${b}). O fator (x + ${b}) cancela com o denominador. Sobra ${a}. O limite é ${a}.`,
    meta: { a, b, targetX, type: 'common-factor' },
  };
}

// ── Generator 3: Caça-Indeterminações ───────────────────────────────────────

/**
 * Dado um limite, o aluno deve dizer se é 0/0 (indeterminação),
 * um número real, ou ±∞.
 */
export function generateLateralDetection(): GeneratedQuestion {
  const scenarios = [
    {
      expression: 'lim x² / x   [x → 0]',
      correct: 'Número real: 0  →  x cancela, sobra x → 0',
      distractors: [
        'Indeterminação 0/0  →  não, x cancela!',
        '+∞  →  não há explosão aqui',
        'Não existe  →  o limite existe e vale 0',
      ],
      explanation: 'x²/x = x (para x ≠ 0). Quando x → 0, o limite é 0. Não é indeterminação!',
      meta: { type: 'lateral-detection', scenario: 'x2-over-x' },
    },
    {
      expression: 'lim (x² − 1) / (x − 1)   [x → 1]',
      correct: 'Número real: 2  →  cancela, sobra x+1',
      distractors: [
        'Indeterminação ∞/∞  →  não há infinito aqui',
        'Não existe  →  o limite existe!',
        '1  →  erro ao substituir sem cancelar',
      ],
      explanation: '(x²−1)/(x−1) = (x+1)(x−1)/(x−1) = x+1. Em x=1: 1+1 = 2.',
      meta: { type: 'lateral-detection', scenario: 'diff-squares-1' },
    },
    {
      expression: 'lim 1/x   [x → 0]',
      correct: 'Não existe  →  vai para +∞ e −∞ pelos dois lados',
      distractors: [
        '0  →  errado, não é 0/1',
        '+∞  →  só pela direita; pela esquerda é −∞',
        'Número real finito  →  não, explode para infinito',
      ],
      explanation: '1/x → +∞ quando x → 0⁺ e 1/x → −∞ quando x → 0⁻. Os lados diferem → limite não existe.',
      meta: { type: 'lateral-detection', scenario: '1-over-x' },
    },
    {
      expression: 'lim (x³ + 1) / (x + 1)   [x → −1]',
      correct: 'Número real: 3  →  soma de cubos cancela (x+1)',
      distractors: [
        'Indeterminação 0/0  →  cancela e resolve!',
        '−1  →  não substitua diretamente, há indeterminação',
        'Não existe  →  o limite existe e vale 3',
      ],
      explanation: 'x³+1 = (x+1)(x²−x+1). Cancela (x+1). Sobra x²−x+1. Em x=−1: 1+1+1 = 3.',
      meta: { type: 'lateral-detection', scenario: 'sum-cubes' },
    },
  ];

  const scenario = scenarios[randInt(0, scenarios.length - 1)];
  const { shuffled, correctIndex } = shuffle([scenario.correct, ...scenario.distractors]);

  return {
    id: uid(),
    title: 'Caça-Indeterminações',
    expression: scenario.expression,
    type: 'lateral-detection',
    options: shuffled,
    correctIndex,
    explanation: scenario.explanation,
    meta: scenario.meta,
  };
}

// ── Selector ─────────────────────────────────────────────────────────────────

export type ApparatusType = 'diff-squares' | 'common-factor' | 'lateral-detection';

export function generateForApparatus(type: ApparatusType): GeneratedQuestion {
  switch (type) {
    case 'diff-squares':     return generateDiffSquares();
    case 'common-factor':    return generateCommonFactor();
    case 'lateral-detection': return generateLateralDetection();
  }
}
