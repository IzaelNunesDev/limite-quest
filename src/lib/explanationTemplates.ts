/**
 * Deterministic explanation templates.
 *
 * Replaces any AI-generated explanations for core limit concepts.
 * Each template returns a structured object with a quick summary,
 * step-by-step reasoning, a visual hint key, and a conclusion.
 */

export interface ExplanationTemplate {
  quick: string;
  steps: string[];
  visual: string;
  conclusion: string;
}

type TemplateFn = (params?: any) => ExplanationTemplate;

export const templates: Record<string, TemplateFn> = {
  /** |x − a| / (x − a) at x = a → limit does not exist */
  'lateral-modulo': (a: number = 1) => ({
    quick: `Esquerda: −1 | Direita: +1 — destinos diferentes`,
    steps: [
      `Para x → ${a}⁻ (esquerda, x < ${a}): |x − ${a}| = −(x − ${a})`,
      `→ f(x) = −(x−${a}) / (x−${a}) = −1`,
      `Para x → ${a}⁺ (direita, x > ${a}): |x − ${a}| = +(x − ${a})`,
      `→ f(x) = +(x−${a}) / (x−${a}) = +1`,
      `L⁻ = −1 ≠ L⁺ = +1`,
    ],
    visual: 'split-colors',
    conclusion: 'Limite NÃO existe: os lados chegam a valores diferentes.',
  }),

  /** √x at x = 0 — left side doesn't exist in ℝ */
  'lateral-sqrt-zero': () => ({
    quick: `√x não existe para x < 0 (nos reais)`,
    steps: [
      `Para x → 0⁺: √x → 0 (existe e vale 0)`,
      `Para x → 0⁻: √x não é real → não existe`,
      `Sem limite pela esquerda → limite global inexistente`,
    ],
    visual: 'half-domain',
    conclusion: 'Limite unilateral: só existe L⁺ = 0.',
  }),

  /** sin(ku) / (ku) → 1 as u → 0 */
  'trig-fundamental': () => ({
    quick: `sin(u)/u → 1 quando u → 0`,
    steps: [
      `Princípio: lim sin(u)/u = 1 quando u → 0`,
      `Identifique u — deve ser igual no seno E no denominador`,
      `Se temos sin(ku), o denominador precisa ser ku`,
      `Puxe k: k · [sin(ku)/(ku)] = k · 1 = k`,
    ],
    visual: 'unit-circle',
    conclusion: 'Alinhe o denominador com o argumento do seno.',
  }),

  /** (x² − a²) / (x − a) factored by difference of squares */
  'factoring-diff-squares': (a: number = 1) => ({
    quick: `x²−${a * a} = (x−${a})(x+${a}) — o fator cancela`,
    steps: [
      `Reconheça: x² − ${a * a} = (x − ${a})(x + ${a})`,
      `O fator (x − ${a}) cancela com o denominador`,
      `Sobra: x + ${a} — contínuo em x = ${a}`,
      `Substitua: ${a} + ${a} = ${2 * a}`,
    ],
    visual: 'cancel-factor',
    conclusion: `Limite = ${2 * a}`,
  }),

  /** (x³ + 1) / (x + 1) factored by sum of cubes */
  'factoring-sum-cubes': () => ({
    quick: `x³+1 = (x+1)(x²−x+1) — o fator cancela`,
    steps: [
      `Soma de cubos: a³+b³ = (a+b)(a²−ab+b²)`,
      `Com a=x, b=1: x³+1 = (x+1)(x²−x+1)`,
      `O fator (x+1) cancela com o denominador`,
      `Sobra: x²−x+1`,
      `Substitua x = −1: 1−(−1)+1 = 3`,
    ],
    visual: 'cancel-factor',
    conclusion: 'Limite = 3',
  }),

  /** Rational function where num and den have same degree */
  'infinity-same-degree': (coef: number = 2) => ({
    quick: `Mesmo grau → razão dos coeficientes líderes`,
    steps: [
      `Divide tudo por x^n (n = grau de numerador = grau de denominador)`,
      `Termos de grau menor → 0 (ex: 1/x → 0 quando x → ∞)`,
      `Sobra: coeficiente líder do num / coeficiente líder do den`,
    ],
    visual: 'fade-small-terms',
    conclusion: `Limite = ${coef}`,
  }),

  /** Rational function where denominator has higher degree */
  'infinity-higher-denom': () => ({
    quick: `Denominador de grau maior → limite = 0`,
    steps: [
      `Divide tudo pela maior potência`,
      `Numerador → 0, denominador → constante`,
      `Toda a fração → 0`,
    ],
    visual: 'denominator-wins',
    conclusion: 'Limite = 0',
  }),

  /** Euler's number as (1 + k/x)^x */
  'euler-compound': (k: number = 1) => ({
    quick: `(1 + k/x)^x → eᵏ quando x → ∞`,
    steps: [
      `Forma padrão: lim (1 + k/x)^x = eᵏ`,
      `Identifique k na expressão`,
      `k = ${k}, então o limite é e^${k}`,
    ],
    visual: 'euler-machine',
    conclusion: `Limite = e^${k} ≈ ${Math.exp(k).toFixed(3)}`,
  }),
};

export function getTemplate(key: string, params?: any): ExplanationTemplate | null {
  const factory = templates[key];
  return factory ? factory(params) : null;
}
