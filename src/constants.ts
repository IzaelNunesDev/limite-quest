/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Island, UserState, ConceptCard } from './types';

export const INITIAL_USER_STATE: UserState = {
  xp: 0,
  hearts: 5,
  deltaCoins: 0,
  streak: 0,
  lastPlayed: null,
  completedLessons: [],
  unlockedIslands: ['island-1'],
  leitnerBoxes: { 1: [], 2: [], 3: [], 4: [] },
  conceptLeitnerBoxes: { 1: [], 2: [], 3: [], 4: [] },
  inventory: [],
};

// ── Concept flashcard deck ────────────────────────────────────────────────────
// These are shown BEFORE procedural questions in ReviewSession based on tag matching.

export const CONCEPT_CARDS: ConceptCard[] = [
  {
    id: 'c1',
    q: 'O que significa x → 1⁻ ?',
    a: 'x se aproxima de 1 por valores MENORES que 1 (vindo da esquerda)',
    tags: ['lateral', 'notation'],
  },
  {
    id: 'c2',
    q: 'O que significa x → 1⁺ ?',
    a: 'x se aproxima de 1 por valores MAIORES que 1 (vindo da direita)',
    tags: ['lateral', 'notation'],
  },
  {
    id: 'c3',
    q: 'Quando um limite NÃO existe?',
    a: 'Quando os limites laterais diferem (L⁻ ≠ L⁺), ou quando a função diverge para ±∞',
    tags: ['lateral', 'existence'],
  },
  {
    id: 'c4',
    q: 'Por que 0/0 é indeterminação?',
    a: 'Porque não diz qual é o limite — pode ser qualquer número. Precisamos fatorar para descobrir.',
    tags: ['indeterminacao', 'factoring'],
  },
  {
    id: 'c5',
    q: 'O limite fundamental da trigonometria:',
    a: 'lim sin(u)/u = 1, quando u → 0. O argumento do seno DEVE ser igual ao denominador.',
    tags: ['trig', 'fundamental'],
  },
  {
    id: 'c6',
    q: 'Qual é o limite de uma função contínua em x = a?',
    a: 'Simplesmente f(a) — basta substituir. Funções contínuas "não têm saltos".',
    tags: ['continuidade', 'substituicao'],
  },
  {
    id: 'c7',
    q: 'Quando x → ∞ e numerador e denominador têm o mesmo grau, o limite é...?',
    a: 'A razão entre os coeficientes LÍDERES (do maior grau).',
    tags: ['infinito', 'racional'],
  },
];

export const ISLANDS: Island[] = [
  {
    id: 'island-1',
    title: 'A Noção Intuitiva',
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'O que é se aproximar?',
        description: 'Entenda o conceito básico de limite através da aproximação.',
        xpReward: 50,
        items: [
          {
            type: 'explanation',
            title: 'A Ponte Quebrada',
            content: 'Imagine que você quer atravessar uma ponte, mas há um buraco exatamente no ponto x = 1. Você não pode pisar no 1, mas pode chegar tão perto quanto quiser: 0.9, 0.99, 0.999...\n\nPara onde você está indo? Essa é a ideia central do LIMITE: não importa o que acontece NO ponto, importa para onde os valores estão caminhando!',
          },
          {
            id: 'q1-1-1',
            type: 'tactile-approximation',
            title: 'Siga o Caminho',
            description: 'Arraste o slider para aproximar x de 1. Observe o gráfico e a tabela de valores. Para onde f(x) está indo?',
            content: {
              function: '(x*x - 1) / (x - 1)',
              targetX: 1,
              targetY: 2,
              domain: [0, 2],
            },
            correctAnswer: 2,
            explanation: 'Mesmo que a função não exista em x=1 (dá 0/0!), os valores de f(x) se aproximam de 2 quando nos aproximamos de 1. Isso é o limite!',
          },
          {
            id: 'q1-1-2',
            type: 'multiple-choice',
            title: 'A Notação',
            description: 'Como escrevemos "o limite de f(x) quando x tende a 1 é 2"?',
            content: {
              options: [
                'lim f(x) = 2 (x -> 1)',
                'f(1) = 2',
                'lim_{x -> 1} f(x) = 2',
                'x -> 1 = 2',
              ],
            },
            correctAnswer: 2,
            explanation: 'A notação padrão usa o subscrito "x → 1" abaixo de lim para indicar a tendência.',
          },
        ],
      },
      {
        id: 'lesson-1-2',
        title: 'Tabelas de Valores',
        description: 'Calculando limites numericamente.',
        xpReward: 50,
        items: [
          {
            type: 'explanation',
            title: 'Aproximação Numérica',
            content: 'Às vezes o gráfico engana. Vamos olhar os números!\n\nSe queremos saber o limite quando x → 1, calculamos f(x) para valores cada vez mais perto de 1:\nf(0.9), f(0.99), f(0.999), f(1.001), f(1.01)...\n\nSe todos esses valores convergem para um número, esse é o limite!',
          },
          {
            id: 'q1-2-1',
            type: 'true-false',
            title: 'Verdadeiro ou Falso',
            description: 'O limite depende do valor da função exatamente no ponto.',
            content: {},
            correctAnswer: false,
            explanation: 'O limite só se importa com o que acontece PERTO do ponto, não NO ponto. É por isso que podemos ter um limite mesmo quando f(a) não existe!',
          },
          {
            id: 'q1-2-2',
            type: 'multiple-choice',
            title: 'Calculando f(0.99)',
            description: 'Se f(x) = x + 1, qual o valor de f(0.99)?',
            content: {
              options: ['1.9', '1.99', '2.0', '1.0'],
            },
            correctAnswer: 1,
            explanation: '0.99 + 1 = 1.99. Estamos chegando perto de 2! Se fizessemos f(0.999) = 1.999, cada vez mais perto de 2.',
          }
        ],
      },
      {
        id: 'lesson-1-3',
        title: 'O Buraco na Função',
        description: 'Por que o limite é útil? Resolva indeterminações com fatoração!',
        xpReward: 60,
        items: [
          {
            type: 'explanation',
            title: 'Indeterminação 0/0',
            content: 'Quando tentamos calcular f(1) em (x²-1)/(x-1), obtemos 0/0. Isso é uma INDETERMINAÇÃO!\n\nO 0/0 não nos dá resposta — pode ser qualquer número! Precisamos simplificar a expressão para "desvendar" o limite.\n\nA ferramenta mais poderosa para isso é a FATORAÇÃO!',
          },
          {
            id: 'q1-3-1',
            type: 'factorization-puzzle',
            title: 'Diferença de Quadrados',
            description: 'Fatore o numerador x² - 1 clicando nos blocos corretos!',
            content: {
              expression: '(x² - 1) / (x - 1)',
              blocks: ['(x - 1)', '(x + 1)', '(x - 2)', '(x + 2)'],
              correctBlocks: ['(x - 1)', '(x + 1)'],
              denominator: '(x - 1)'
            },
            correctAnswer: true,
            explanation: 'Diferença de quadrados: a² - b² = (a-b)(a+b). Então x² - 1 = (x-1)(x+1). O (x-1) cancela com o denominador, sobrando x+1. Quando x→1, o limite é 1+1 = 2!',
          },
          {
            id: 'q1-3-2',
            type: 'factorization-puzzle',
            title: 'Soma de Cubos',
            description: 'Fatore x³ + 1 usando a fórmula da soma de cubos: a³ + b³ = (a+b)(a²-ab+b²)',
            content: {
              expression: '(x³ + 1) / (x + 1)',
              blocks: ['(x + 1)', '(x - 1)', '(x² - x + 1)', '(x² + x + 1)'],
              correctBlocks: ['(x + 1)', '(x² - x + 1)'],
              denominator: '(x + 1)'
            },
            correctAnswer: true,
            explanation: 'Soma de cubos: a³+b³ = (a+b)(a²-ab+b²). Com a=x e b=1: x³+1 = (x+1)(x²-x+1). O (x+1) cancela! Quando x→-1, o limite é (-1)²-(-1)+1 = 3.',
          }
        ]
      },
      {
        id: 'lesson-1-4',
        title: 'Flashcards de Indeterminação',
        description: 'Identifique rapidamente o que é indeterminado.',
        xpReward: 40,
        items: [
          {
            id: 'q1-4-1',
            type: 'flashcard-indeterminacy',
            title: '0/0',
            description: 'A expressão 0/0 é uma forma indeterminada?',
            content: { expression: '0 / 0' },
            correctAnswer: 0,
            explanation: '0/0 é a forma mais clássica de indeterminação! Significa que tanto o numerador quanto o denominador tendem a zero, e precisamos de mais trabalho para descobrir o limite.',
          },
          {
            id: 'q1-4-2',
            type: 'flashcard-indeterminacy',
            title: '1/0',
            description: 'A expressão 1/0 é uma forma indeterminada?',
            content: { expression: '1 / 0' },
            correctAnswer: 1,
            explanation: '1/0 NÃO é indeterminação! Um número dividido por algo que tende a zero cresce sem parar — tende a +∞ ou -∞. Sabemos o comportamento, então é "determinado".',
          }
        ]
      }
    ],
    bossId: 'boss-1',
  },
  {
    id: 'island-2',
    title: 'Limites Laterais',
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'Esquerda vs Direita',
        description: 'Vindo de caminhos diferentes.',
        xpReward: 70,
        items: [
          // ── PHASE 1: conceito visual (sem fórmulas) ──────────────────────
          {
            type: 'concept',
            title: 'Dois caminhos, um destino?',
            visual: 'bridge-broken',
            caption: 'Mesmo ponto, destinos diferentes — a ponte está quebrada.',
          },
          // ── PHASE 2: exemplo guiado ────────────────────────────────────
          {
            type: 'worked-example',
            title: 'Resolvendo |x−1| / (x−1)',
            expression: '|x−1| / (x−1)',
            steps: [
              {
                text: 'Quando x → 1⁻ (x vem da esquerda, então x < 1): |x−1| = −(x−1)',
                highlight: 'left',
              },
              {
                text: 'Substitui: f(x) = −(x−1)/(x−1) = −1    (limite esquerdo = −1)',
                highlight: 'left',
              },
              {
                text: 'Quando x → 1⁺ (x vem da direita, então x > 1): |x−1| = +(x−1)',
                highlight: 'right',
              },
              {
                text: 'Substitui: f(x) = +(x−1)/(x−1) = +1    (limite direito = +1)',
                highlight: 'right',
              },
              {
                text: 'L⁻ = −1  ≠  L⁺ = +1 → os lados NÃO concordam',
                highlight: 'cancel',
              },
            ],
            conclusion: 'O limite não existe porque L⁻ ≠ L⁺.',
            templateKey: 'lateral-modulo',
          },
          // ── PHASE 3: andaime — mesma função, com a investigação visível ─
          {
            id: 'q2-1-1',
            type: 'lateral-detective',
            title: 'Você tenta: O Salto do Módulo',
            description: 'Investigue f(x) = |x−1|/(x−1) em x = 1. Use os botões para explorar cada lado.',
            content: {
              functionLeft: 'abs(x-1)/(x-1)',
              functionRight: 'abs(x-1)/(x-1)',
              targetX: 1,
            },
            correctAnswer: false,
            explanation: 'Pela esquerda: |x−1| = −(x−1) → f = −1. Pela direita: |x−1| = +(x−1) → f = +1. Como −1 ≠ +1, o limite NÃO existe!',
            phase: 'scaffolded',
          },
          // ── PHASE 4: desafio sem andaime ──────────────────────────────
          {
            id: 'q2-1-2',
            type: 'lateral-detective',
            title: 'Desafio: √x em x = 0',
            description: 'Investigue f(x) = √x em x = 0. O limite bilateral existe?',
            content: {
              functionLeft: 'sqrt(x)',
              functionRight: 'sqrt(x)',
              targetX: 0,
            },
            correctAnswer: false,
            explanation: 'Pela direita: √x → 0. Pela esquerda: √x não existe nos reais para x < 0. Sem limite lateral esquerdo → limite NÃO existe.',
            phase: 'challenge',
          },
        ],
      },
    ],
    bossId: 'boss-2',
  },
  {
    id: 'island-3',
    title: 'Infinito e Além',
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'Rumo ao Infinito',
        description: 'O que acontece quando x cresce sem parar?',
        xpReward: 80,
        items: [
          {
            type: 'explanation',
            title: 'O Horizonte Infinito',
            content: 'Quando x → ∞, algumas funções crescem mais rápido que outras. Isso é uma "corrida"!\n\n• Polinômios de grau maior crescem mais rápido\n• x³ vence x², que vence x\n• Se numerator e denominator têm o mesmo grau, o limite é a razão dos coeficientes',
          },
          {
            id: 'q3-1-1',
            type: 'infinity-race',
            title: 'Corrida de Polinômios',
            description: 'Avance x e observe: quem domina, x² ou x³?',
            content: {
              numeratorFn: 'x*x',
              denominatorFn: 'x*x*x',
              numeratorLabel: 'x²',
              denominatorLabel: 'x³',
            },
            correctAnswer: 'denominator',
            explanation: 'x³ cresce muito mais rápido que x². O denominador vence a corrida, então x²/x³ = 1/x → 0!',
          },
          {
            id: 'q3-1-2',
            type: 'infinity-race',
            title: 'Empate Técnico',
            description: 'Compare (2x+1) e (x+3) quando x → ∞. Quem vence?',
            content: {
              numeratorFn: '2*x + 1',
              denominatorFn: 'x + 3',
              numeratorLabel: '2x + 1',
              denominatorLabel: 'x + 3',
              numeratorTerms: ['2x', '+1'],
              denominatorTerms: ['x', '+3'],
            },
            correctAnswer: 'tie',
            explanation: 'Ambos são de grau 1 (crescem linearmente). O limite é a razão dos coeficientes líderes: 2/1 = 2. É um empate — a fração converge para 2!',
          },
          {
            id: 'q3-1-3',
            type: 'infinity-race',
            title: 'A Ilusão da Raiz',
            description: 'Compare √(x²+1) com 3x+2 quando x → ∞.',
            content: {
              numeratorFn: 'sqrt(x*x + 1)',
              denominatorFn: '3*x + 2',
              numeratorLabel: '√(x² + 1)',
              denominatorLabel: '3x + 2',
            },
            correctAnswer: 'tie',
            explanation: 'Para x grande, √(x²+1) ≈ √(x²) = x. Então temos x/(3x) = 1/3. Ambos crescem na mesma taxa — empate! Limite = 1/3.',
          }
        ]
      }
    ],
    bossId: 'boss-3',
  },
  {
    id: 'island-4',
    title: 'Limites Trigonométricos',
    lessons: [
      {
        id: 'lesson-4-1',
        title: 'O Limite Fundamental',
        description: 'O famoso sin(x)/x = 1.',
        xpReward: 90,
        items: [
          {
            type: 'explanation',
            title: 'O Limite Mais Famoso da Trigonomometria',
            content: 'Existe um limite que aparece em TODO lugar no cálculo:\n\nlim sin(u)/u = 1 quando u → 0\n\nIsso significa que para ângulos muito pequenos, sin(u) ≈ u. É como se o seno "copiasse" o ângulo!\n\nMas atenção: o argumento do seno e o denominador precisam ser IGUAIS!',
          },
          {
            id: 'q4-1-1',
            type: 'trig-slider',
            title: 'Ajuste o Denominador',
            description: 'Para sin(3x)/(k·x) tender a 1, qual deve ser o valor de k?',
            content: {
              expression: 'sin(3x) / (kx)',
              targetMultiplier: 3
            },
            correctAnswer: true,
            explanation: 'O limite fundamental é sin(u)/u = 1. Se temos sin(3x), precisamos de 3x no denominador. Logo k = 3!',
          },
          {
            id: 'q4-1-2',
            type: 'tactile-approximation',
            title: 'O Primo do Seno',
            description: 'Aproxime x de 0 na função tan(x)/x. Para onde ela converge?',
            content: {
              function: 'tan(x)/x',
              targetX: 0,
              targetY: 1,
              domain: [-1, 1],
            },
            correctAnswer: 1,
            explanation: 'tan(x) = sin(x)/cos(x). Como cos(0) = 1, temos tan(x)/x ≈ sin(x)/x quando x é pequeno. O limite também é 1!',
          }
        ]
      }
    ],
    bossId: 'boss-4',
  },
  {
    id: 'island-5',
    title: 'O Número de Euler',
    lessons: [
      {
        id: 'lesson-5-1',
        title: 'A Máquina de Juros',
        description: 'Como o crescimento contínuo gera o número e.',
        xpReward: 100,
        items: [
          {
            type: 'explanation',
            title: 'O Número e ≈ 2.71828',
            content: 'Imagine um investimento que rende 100% ao ano, mas os juros são compostos CONTINUAMENTE.\n\nSe dividirmos em n períodos, o resultado é (1 + 1/n)^n.\n\nQuando n → ∞ (juros contínuos), o resultado converge para um número especial: e ≈ 2.71828...\n\nA forma geral é: (1 + k/x)^x → e^k quando x → ∞',
          },
          {
            id: 'q5-1-1',
            type: 'e-boss',
            title: 'O Padrão Exponencial',
            description: 'Gire a manivela para aumentar x. Para qual valor a expressão converge?',
            content: {
              expression: '(1 + 2/x)^x',
              kValue: 2
            },
            correctAnswer: 2,
            explanation: 'A forma geral (1 + k/x)^x converge para e^k. Com k=2, o limite é e² ≈ 7.389!',
          }
        ]
      },
      {
        id: 'lesson-5-2',
        title: 'Logaritmos e Exponenciais',
        description: 'Comportamentos extremos.',
        xpReward: 100,
        items: [
          {
            type: 'explanation',
            title: 'Exponenciais e Logaritmos no Limite',
            content: 'Funções exponenciais (como 3^x) e logarítmicas (como ln(x)) têm comportamentos interessantes:\n\n• Exponenciais são contínuas: lim 3^x quando x→2 = 3² = 9\n• Logaritmos tendem a -∞ quando x→0⁺\n• ln(x) não existe para x ≤ 0',
          },
          {
            id: 'q5-2-1',
            type: 'tactile-approximation',
            title: 'A Curva Exponencial',
            description: 'Aproxime x de 2 na função f(x) = 3^x. Qual o limite?',
            content: {
              function: '3**x',
              targetX: 2,
              targetY: 9,
              domain: [0, 3],
            },
            correctAnswer: 9,
            explanation: 'A função exponencial é contínua em todo ponto real! Basta substituir: 3² = 9. Não há mistério aqui.',
          },
          {
            id: 'q5-2-2',
            type: 'lateral-detective',
            title: 'O Abismo do Logaritmo',
            description: 'Investigue ln(x) em x = 0. O limite existe?',
            content: {
              functionLeft: 'log(x)',
              functionRight: 'log(x)',
              targetX: 0
            },
            correctAnswer: false,
            explanation: 'Pela direita: ln(x) → -∞ quando x→0⁺ (despenca!). Pela esquerda: ln(x) não existe para x < 0. O limite NÃO existe!',
          }
        ]
      }
    ],
    bossId: 'boss-5',
  },
];
