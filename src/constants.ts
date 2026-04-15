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
  unlockedIslands: ['island-0', 'island-1', 'island-2', 'island-3', 'island-4', 'island-5'], // DEV: todas desbloqueadas
  leitnerBoxes: { 1: [], 2: [], 3: [], 4: [] },
  conceptLeitnerBoxes: { 1: [], 2: [], 3: [], 4: [] },
  inventory: [],
  dojoStatsToday: { date: '', exercisesCompleted: 0, dailyBonusClaimed: false },
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
  // ── Island 0: Pré-Cálculo ─────────────────────────────────────────────────
  // Fundações para alunos que nunca viram o assunto.
  {
    id: 'island-0',
    title: 'Pré-Cálculo',
    lessons: [
      // ─ Lição P-0: A Anatomia da Fração ──────────────────────────────────
      {
        id: 'lesson-p-0',
        title: 'A Anatomia da Fração',
        description: 'Por que 5/0 quebra tudo? Entenda frações de uma vez por todas.',
        xpReward: 40,
        items: [
          {
            type: 'lesson-intro',
            title: 'A Anatomia da Fração',
            subtitle: 'O que numerador e denominador realmente significam',
            icon: '🍕',
            accentColor: '#dc2626',
            sections: [
              {
                type: 'hook',
                content: 'Você tem 1 pizza e precisa dividir entre amigos. O NUMERADOR é o que você tem (1 pizza). O DENOMINADOR é para quantas pessoas você divide. Simples? Agora: e se não tiver ninguém para dividir? O sistema trava.',
              },
              {
                type: 'analogy',
                title: 'Pizza ÷ pessoas = fração',
                realWorld: '1 pizza ÷ 4 pessoas = 1/4 cada uma. 1 pizza ÷ 8 pessoas = 1/8 cada uma (fatia menor!). Mais pessoas = fatia menor.',
                mathWorld: '1/n: quanto maior o n (denominador), menor o resultado. Quando n → ∞, a fatia → 0. Quando n → 0, a fatia explodiria para ∞.',
              },
              {
                type: 'insight',
                icon: '💥',
                title: 'Por que 5/0 é proibido pela matemática',
                content: 'Dividir 5 por 0 seria distribuir 5 pizzas para 0 pessoas. Quanto cada pessoa recebe? A pergunta não faz sentido — não há pessoas! O resultado seria "infinito" ou "indefinido", e a matemática simplesmente não aceita isso como resposta.',
              },
              {
                type: 'numbered-list',
                title: 'O roteiro da fração:',
                items: [
                  'Numerador (em cima): o que você TEM — o "bolo" a dividir',
                  'Denominador (embaixo): em quantas partes iguais você DIVIDE',
                  'Resultado: o tamanho de cada parte',
                  'Denominador zero: proibido! Sistema quebra, resultado "não existe"',
                ],
              },
            ],
          },
          {
            id: 'qp-0-1',
            type: 'true-false',
            title: 'O Botão de Pânico',
            description: 'É matematicamente possível calcular o valor de 5 ÷ 0?',
            content: {},
            correctAnswer: false,
            explanation: '❌ NÃO existe! Dividir por zero não tem resposta definida na matemática. É como perguntar "quanto é 5 pizzas para 0 pessoas?" — a pergunta em si não faz sentido. Por isso dizemos que 5/0 é "indefinido".',
          },
          {
            id: 'qp-0-2',
            type: 'multiple-choice',
            title: 'Lendo a Fração',
            description: 'Na fração 3/8, o que representa o número 8 (o denominador)?',
            content: {
              options: [
                'A quantidade que você tem (3 coisas)',
                'O número de partes em que o todo está dividido',
                'O resultado da divisão',
                'Um expoente aplicado ao 3',
              ],
            },
            correctAnswer: 1,
            explanation: 'O denominador (8) representa em quantas partes iguais o todo foi dividido. 3/8 = "tenho 3, de um total dividido em 8 partes". É a fatia de uma pizza cortada em 8 pedaços!',
          },
          {
            id: 'qp-0-3',
            type: 'true-false',
            title: 'Comparando Frações',
            description: '3/4 representa uma fatia MAIOR do que 3/8?',
            content: {},
            correctAnswer: true,
            explanation: 'Verdadeiro! Com o mesmo numerador (3), a fração com MENOR denominador é maior: 4 partes iguais são maiores que 8 partes iguais. 3/4 = 0,75 e 3/8 = 0,375.',
          },
          {
            id: 'qp-0-4',
            type: 'multiple-choice',
            title: 'Frações e o Zero',
            description: 'O que acontece com 1/x quando x se aproxima de 0 (sem ser zero)?',
            content: {
              options: [
                '1/x se aproxima de 0',
                '1/x se aproxima de 1',
                '1/x cresce sem limite (→ ∞)',
                '1/x se aproxima de −1',
              ],
            },
            correctAnswer: 2,
            explanation: 'Faça as contas: 1/0.1 = 10, 1/0.01 = 100, 1/0.001 = 1000... Quanto mais próximo de zero o denominador fica, maior fica o resultado. Ele "explode" para infinito — daí por que 1/0 é indefinido!',
          },
        ],
      },

      // ─ Lição P-1: O Que É Uma Função? ──────────────────────────────────
      {
        id: 'lesson-p-1',
        title: 'O Que É Uma Função?',
        description: 'A base de todo o cálculo — máquinas que transformam números.',
        xpReward: 40,
        items: [
          {
            type: 'lesson-intro',
            title: 'Funções — Máquinas de Transformar',
            subtitle: 'A peça mais fundamental do cálculo',
            icon: '⚙️',
            accentColor: '#2563eb',
            sections: [
              {
                type: 'hook',
                content: 'Imagine uma máquina de café. Você coloca grãos → sai café. Coloca grãos especiais → sai café especial. Para cada tipo de entrada, uma saída consistente e previsível. Uma função matemática funciona exatamente assim!',
              },
              {
                type: 'analogy',
                title: 'Máquina = função',
                realWorld: 'Máquina de café: entra "grãos arábica" → sai "espresso forte". Sempre o mesmo resultado para a mesma entrada.',
                mathWorld: 'f(x) = 2x + 1: entra x = 3 → sai 7. Entra x = 10 → sai 21. Previsível, sem surpresas.',
              },
              {
                type: 'insight',
                icon: '⚖️',
                title: 'A regra de ouro',
                content: 'Cada entrada x produz EXATAMENTE UMA saída f(x). Se uma entrada produz dois resultados diferentes — não é função. É como uma máquina que às vezes faz café, às vezes faz suco: caótica, imprevisível.',
              },
              {
                type: 'numbered-list',
                title: 'Funções que você já usa sem perceber:',
                items: [
                  'Preço = f(quantidade): entrou 3 itens, saiu R$15',
                  'Temperatura = f(hora do dia): entrou "12h", saiu "32°C"',
                  'Distância = f(tempo): entrou "2 horas a 60 km/h", saiu "120 km"',
                  'Área = f(lado): entrou "lado = 5", saiu "25 m²"',
                ],
              },
            ],
          },
          {
            id: 'qp-1-1',
            type: 'true-false',
            title: 'Teste de Função',
            description: 'Uma tabela tem: x=1→y=2, x=2→y=4, x=2→y=6. Isso representa uma função?',
            content: {},
            correctAnswer: false,
            explanation: 'NÃO é função! O valor x=2 produz duas saídas diferentes (4 e 6). Uma função exige que cada entrada tenha exatamente UMA saída.',
          },
          {
            id: 'qp-1-2',
            type: 'multiple-choice',
            title: 'Notação de Função',
            description: 'Se f(x) = x² + 3, qual é o valor de f(4)?',
            content: {
              options: ['7', '16', '19', '11'],
            },
            correctAnswer: 2,
            explanation: 'f(4) = 4² + 3 = 16 + 3 = 19. Substitua o x pelo valor de entrada e calcule!',
          },
          {
            id: 'qp-1-3',
            type: 'multiple-choice',
            title: 'Identificando a Função',
            description: 'Qual das opções a seguir NÃO representa uma função?',
            content: {
              options: [
                'f(x) = x + 5 (para todo x real)',
                'Uma tabela onde x=1→3, x=2→6, x=3→9',
                'Um círculo desenhado no plano cartesiano',
                'f(x) = x²',
              ],
            },
            correctAnswer: 2,
            explanation: 'Um círculo NO PLANO CARTESIANO não é função: para um valor de x (exceto nas bordas), existem DOIS valores de y (cima e baixo). Viola a regra de uma entrada → uma saída.',
          },
        ],
      },

      // ─ Lição P-2: Lendo Gráficos ────────────────────────────────────────
      {
        id: 'lesson-p-2',
        title: 'Gráficos — A Foto da Função',
        description: 'Como interpretar o comportamento de funções visualmente.',
        xpReward: 40,
        items: [
          {
            type: 'lesson-intro',
            title: 'Gráficos — A Linguagem Visual',
            subtitle: 'Como uma função conta sua história',
            icon: '📈',
            accentColor: '#16a34a',
            sections: [
              {
                type: 'hook',
                content: 'Olhe o gráfico de temperatura de uma cidade ao longo do dia. Você vê quando fez calor, quando esfriou, o pico às 14h, a queda à meia-noite. Sem ler um único número, você entende a história. Gráficos matemáticos contam histórias da mesma forma!',
              },
              {
                type: 'analogy',
                title: 'Temperatura vs função',
                realWorld: 'Eixo horizontal = horas (0h a 24h). Eixo vertical = temperatura em °C. Cada ponto no gráfico diz "às xh, fazia y°C".',
                mathWorld: 'Eixo x = entrada da função. Eixo y = f(x) = saída. Cada ponto (x, y) no gráfico diz "quando entra x, sai y".',
              },
              {
                type: 'numbered-list',
                title: 'O que você pode ler num gráfico:',
                items: [
                  'Zeros: onde a curva CRUZA o eixo x — o resultado é zero',
                  'Máximos/mínimos: picos e vales — onde a função muda de crescente para decrescente',
                  'Crescimento: curva sobe da esquerda para direita',
                  'Descontinuidades: buracos, saltos ou quebras na curva',
                  'Comportamento extremo: o que acontece quando x vai para ±∞',
                ],
              },
              {
                type: 'insight',
                icon: '✏️',
                title: 'O teste da linha vertical',
                content: 'Para saber se um gráfico representa UMA função: trace uma linha vertical em qualquer ponto. Se ela cruzar a curva em MAIS DE UM ponto, não é função. É o "teste da linha vertical".',
              },
            ],
          },
          {
            id: 'qp-2-1',
            type: 'true-false',
            title: 'Crescimento ou Decrescimento?',
            description: 'No gráfico de f(x) = x², a função é CRESCENTE para x > 0.',
            content: {},
            correctAnswer: true,
            explanation: 'Verdadeiro! Para x > 0, quanto maior o x, maior o x². A parábola vai subindo para a direita. Graficamente, a curva sobe da esquerda para direita quando x é positivo.',
          },
          {
            id: 'qp-2-2',
            type: 'multiple-choice',
            title: 'Lendo o Gráfico',
            description: 'Se f(x) = x² − 4, em quais valores de x o gráfico cruza o eixo x (zeros da função)?',
            content: {
              options: [
                'x = 4 apenas',
                'x = −4 e x = 4',
                'x = −2 e x = 2',
                'x = 0 apenas',
              ],
            },
            correctAnswer: 2,
            explanation: 'Zeros são onde f(x) = 0: x² − 4 = 0 → x² = 4 → x = ±2. O gráfico cruza o eixo x em x = −2 e x = 2.',
          },
          {
            id: 'qp-2-3',
            type: 'tactile-approximation',
            title: 'Explorando a Parábola',
            description: 'Use o slider para explorar f(x) = x². Observe como o valor de y muda conforme x varia.',
            content: {
              function: 'x*x',
              targetX: 2,
              targetY: 4,
              domain: [-3, 3],
            },
            correctAnswer: 4,
            explanation: 'A parábola f(x) = x² tem valor 4 quando x=2. Ela é simétrica: f(2) = f(−2) = 4. O vértice (ponto mais baixo) está em x=0, f(0)=0.',
          },
        ],
      },

      // ─ Lição P-3: Continuidade — A Estrada Sem Buracos ─────────────────
      {
        id: 'lesson-p-3',
        title: 'Continuidade',
        description: 'Quando uma função se comporta sem saltos ou buracos.',
        xpReward: 50,
        items: [
          {
            type: 'lesson-intro',
            title: 'Continuidade — A Estrada Sem Buracos',
            subtitle: 'Funções que você pode desenhar sem tirar o lápis do papel',
            icon: '🛣️',
            accentColor: '#7c3aed',
            sections: [
              {
                type: 'hook',
                content: 'Imagine dirigir numa estrada. Se há um buraco — você para abruptamente. Se a estrada simplesmente some e reaparece 100m à frente — você teria que "pular". Uma função CONTÍNUA é como uma estrada perfeita: você vai do ponto A ao B sem interrupções.',
              },
              {
                type: 'analogy',
                title: 'Estrada vs função',
                realWorld: 'Estrada perfeita SP→RJ: você dirige sem parar, sem pular, sem teleportar. O caminho é suave do início ao fim.',
                mathWorld: 'f(x) = x² é contínua: você pode desenhar toda a parábola sem tirar o lápis do papel. Nenhuma quebra.',
              },
              {
                type: 'numbered-list',
                title: 'Os 3 tipos de descontinuidade:',
                items: [
                  '🕳️ Buraco (removível): a função existe em todos os pontos EXCETO em x=a. O gráfico tem um pontinho vazio. Ex: (x²−1)/(x−1) em x=1',
                  '⚡ Salto: a função "pula" de um valor para outro. Ex: |x|/x — vale −1 para x<0 e +1 para x>0',
                  '💥 Infinita: a função explode para ±∞. Ex: 1/x em x=0',
                ],
              },
              {
                type: 'insight',
                icon: '🔍',
                title: 'Continuidade e limites são inseparáveis',
                content: 'Uma função f é contínua em x=a quando: (1) f(a) existe, (2) o limite em x=a existe, E (3) f(a) = limite. Se qualquer uma falha, há descontinuidade. É exatamente por isso que estudamos limites!',
              },
            ],
          },
          {
            id: 'qp-3-1',
            type: 'true-false',
            title: 'É Contínua?',
            description: 'A função f(x) = x² é contínua em TODOS os pontos reais.',
            content: {},
            correctAnswer: true,
            explanation: 'Verdadeiro! f(x) = x² é uma parábola suave, sem buracos nem saltos. Você pode desenhá-la inteira sem tirar o lápis. É contínua em todo ponto real.',
          },
          {
            id: 'qp-3-2',
            type: 'multiple-choice',
            title: 'Identifique a Descontinuidade',
            description: 'A função f(x) = 1/x tem uma descontinuidade em x = 0. De que tipo é?',
            content: {
              options: [
                'Buraco removível — dá para "consertar"',
                'Salto — a função pula de um valor para outro',
                'Infinita — a função explode para ±∞',
                'Não tem descontinuidade',
              ],
            },
            correctAnswer: 2,
            explanation: 'Quando x se aproxima de 0 pela direita, 1/x → +∞. Pela esquerda, 1/x → −∞. A função "explode" — é uma descontinuidade infinita. Não dá para "consertar".',
          },
          {
            id: 'qp-3-3',
            type: 'lateral-detective',
            title: 'Investigando a Descontinuidade',
            description: 'Investigue f(x) = (x²−1)/(x−1) em x = 1. O limite bilateral existe?',
            content: {
              functionLeft: '(x*x - 1)/(x - 1)',
              functionRight: '(x*x - 1)/(x - 1)',
              targetX: 1,
            },
            correctAnswer: true,
            explanation: '(x²−1)/(x−1) = (x−1)(x+1)/(x−1) = x+1 (cancela!). Então quando x→1, o limite é 1+1=2. O limite EXISTE, mesmo que f(1) seja indefinido. Buraco removível!',
          },
        ],
      },

      // ─ Lição P-4: Kit de Fatoração ──────────────────────────────────────
      {
        id: 'lesson-p-4',
        title: 'Kit de Fatoração',
        description: 'A ferramenta secreta para resolver indeterminações 0/0.',
        xpReward: 60,
        items: [
          {
            type: 'lesson-intro',
            title: 'Kit de Fatoração',
            subtitle: 'Refatorar expressões para cancelar o problema',
            icon: '🔧',
            accentColor: '#7c3aed',
            sections: [
              {
                type: 'hook',
                content: 'Você já refatorou código espaguete? Fatorar uma expressão algébrica é exatamente isso: reescrever de forma mais limpa sem mudar o resultado. Em limites, isso nos permite cancelar o fator problemático que cria o 0/0.',
              },
              {
                type: 'analogy',
                title: 'Código vs álgebra',
                realWorld: 'Código: "salario + salario * 0.10" pode ser refatorado para "salario * 1.10" — mesmo resultado, mais limpo.',
                mathWorld: '2x + 4 pode ser "fatorado" para 2(x + 2) — mesmo resultado, fator comum "em evidência".',
              },
              {
                type: 'insight',
                icon: '⭐',
                title: 'A Diferença de Quadrados — seu superpoder',
                content: 'A²− B² = (A − B)(A + B). Sempre. Esta identidade é o bisturi do Cálculo. Quando vir x² − 4, pense: (x − 2)(x + 2). Quando vir x² − 9, pense: (x − 3)(x + 3). Memorize isso.',
              },
              {
                type: 'numbered-list',
                title: 'As 2 ferramentas do kit:',
                items: [
                  '🔨 Fator Comum: ax + ab = a(x + b) — coloque a em evidência',
                  '⚔️ Diferença de Quadrados: x² − a² = (x − a)(x + a)',
                  '🎯 Objetivo: cancelar o fator (x − a) que trava o denominador',
                  '✅ Após cancelar: substitua x = a normalmente — sem divisão por zero!',
                ],
              },
            ],
          },
          {
            type: 'worked-example',
            title: 'Resolvendo lim (x²−4)/(x−2) quando x→2',
            expression: '(x² − 4) / (x − 2)',
            steps: [
              {
                text: 'Tente substituir diretamente: (4 − 4)/(2 − 2) = 0/0 — Indeterminação!',
                highlight: 'none',
              },
              {
                text: 'Reconheça x² − 4 = x² − 2² → aplique diferença de quadrados',
                highlight: 'left',
              },
              {
                text: 'x² − 4 = (x − 2)(x + 2) → fatore o numerador',
                highlight: 'left',
              },
              {
                text: 'A fração vira (x − 2)(x + 2) / (x − 2) → o fator (x − 2) cancela!',
                highlight: 'cancel',
              },
              {
                text: 'Sobra apenas (x + 2) → substitua x = 2: 2 + 2 = 4',
                highlight: 'right',
              },
            ],
            conclusion: 'O limite é 4. A fatoração revelou o que a indeterminação escondia.',
          },
          {
            id: 'qp-4-1',
            type: 'multiple-choice',
            title: 'Reconhecendo a Diferença de Quadrados',
            description: 'Qual das opções é igual a x² − 9?',
            content: {
              options: [
                '(x − 9)(x + 1)',
                '(x − 3)(x + 3)',
                '(x − 9)',
                '(x + 3)²',
              ],
            },
            correctAnswer: 1,
            explanation: 'x² − 9 = x² − 3² = (x − 3)(x + 3). Diferença de quadrados: A² − B² = (A − B)(A + B). Aqui A = x e B = 3.',
          },
          {
            id: 'qp-4-2',
            type: 'multiple-choice',
            title: 'Fator Comum em Evidência',
            description: 'Como reescrever 3x + 12 usando fator comum?',
            content: {
              options: [
                '3(x + 4)',
                '3(x + 12)',
                '(3 + x)(4)',
                '12(x + 1)',
              ],
            },
            correctAnswer: 0,
            explanation: '3x + 12 = 3·x + 3·4 = 3(x + 4). O fator comum é 3 — colocamos ele fora dos parênteses.',
          },
          {
            id: 'qp-4-3',
            type: 'multiple-choice',
            title: 'Aplicando no Limite',
            description: 'Qual é o resultado de lim (x² − 16)/(x − 4) quando x → 4?',
            content: {
              options: ['4', '8', '16', 'Não existe'],
            },
            correctAnswer: 1,
            explanation: 'x² − 16 = (x − 4)(x + 4). Cancela (x − 4). Sobra x + 4. Em x = 4: 4 + 4 = 8. O limite é 8!',
          },
        ],
      },
    ],
    bossId: 'boss-0',
  },

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
            type: 'lesson-intro',
            title: 'O que é um Limite?',
            subtitle: 'A ideia mais importante do Cálculo',
            icon: '🌉',
            accentColor: '#3b82f6',
            sections: [
              {
                type: 'hook',
                content: 'Imagine uma ponte com um buraco exatamente no ponto x = 1. Você não pode PISAR no 1, mas pode chegar tão perto quanto quiser: 0.9, 0.99, 0.999... Para onde você está indo? É para isso que serve o limite!',
              },
              {
                type: 'analogy',
                title: 'A analogia da ponte',
                realWorld: 'Você caminha pela ponte e chega a 1mm do buraco. Não caiu — mas claramente estava indo para o outro lado.',
                mathWorld: 'f(x) = (x²−1)/(x−1) não existe em x=1, mas quando x se aproxima de 1, f(x) se aproxima de 2.',
              },
              {
                type: 'insight',
                icon: '🔑',
                title: 'A regra de ouro do limite',
                content: 'O limite NÃO é o valor da função no ponto. É o valor para onde a função CAMINHA conforme x se aproxima. A função pode nem existir no ponto — e o limite ainda existe!',
              },
              {
                type: 'numbered-list',
                title: 'Como calculamos limites:',
                items: [
                  'Nos aproximamos de x = a pelos dois lados (esquerda e direita)',
                  'Observamos para onde f(x) está indo (não o valor em x=a)',
                  'Se os dois lados concordam → o limite existe e é esse valor',
                  'Se discordam ou a função explode → o limite não existe',
                ],
              },
            ],
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
      // ─ Lição 2-2: Quando o Limite EXISTE ─────────────────────────────────
      {
        id: 'lesson-2-2',
        title: 'Quando os Dois Lados Concordam',
        description: 'Nem sempre a ponte está quebrada — descubra quando o limite existe!',
        xpReward: 80,
        items: [
          // Phase 1: conceito visual — dois pontos chegando ao MESMO destino
          {
            type: 'concept',
            title: 'Dois Caminhos, Um Destino',
            visual: 'lateral-approach',
            caption: 'Quando azul e roxo chegam juntos — o limite EXISTE!',
          },
          // Phase 2: exemplo guiado — x² em x=0 (ambos lados → 0)
          {
            type: 'worked-example',
            title: 'Resolvendo lim x² quando x→0',
            expression: 'f(x) = x²',
            steps: [
              {
                text: 'Quando x → 0⁻ (x vem da esquerda, x < 0): f(x) = x² sempre é positivo',
                highlight: 'left',
              },
              {
                text: 'Calculamos: f(−0.1) = 0.01, f(−0.01) = 0.0001 ... → 0',
                highlight: 'left',
              },
              {
                text: 'Quando x → 0⁺ (x vem da direita, x > 0): f(x) = x² também é positivo',
                highlight: 'right',
              },
              {
                text: 'Calculamos: f(0.1) = 0.01, f(0.01) = 0.0001 ... → 0',
                highlight: 'right',
              },
              {
                text: 'L⁻ = 0 = L⁺ → os dois lados concordam!',
                highlight: 'cancel',
              },
            ],
            conclusion: 'O limite EXISTE e vale 0. Uma função contínua no ponto tem limite igual ao valor.',
          },
          // Phase 3: aluno tenta — x²-1 em x=1
          {
            id: 'q2-2-1',
            type: 'lateral-detective',
            title: 'Você tenta: Limite de x² em x = 2',
            description: 'Investigue f(x) = x² em x = 2. O limite bilateral existe?',
            content: {
              functionLeft: 'x*x',
              functionRight: 'x*x',
              targetX: 2,
            },
            correctAnswer: true,
            explanation: 'x² é contínua! Pela esquerda e pela direita, f(x) → 4. L⁻ = L⁺ = 4 → limite EXISTE e vale 4.',
            phase: 'scaffolded',
          },
          // Phase 4: desafio — (x²−4)/(x−2) em x=2
          {
            id: 'q2-2-2',
            type: 'lateral-detective',
            title: 'Desafio: a Diferença de Quadrados',
            description: 'Investigue f(x) = (x²−4)/(x−2) em x = 2. O limite bilateral existe?',
            content: {
              functionLeft: '(x*x - 4)/(x - 2)',
              functionRight: '(x*x - 4)/(x - 2)',
              targetX: 2,
            },
            correctAnswer: true,
            explanation: '(x²−4)/(x−2) = (x−2)(x+2)/(x−2) = x+2. Cancela! Quando x→2, o limite é 4. Existe, mesmo com o buraco em x=2.',
            phase: 'challenge',
          },
        ],
      },

      // ─ Lição 2-3: Funções por Partes ───────────────────────────────────
      {
        id: 'lesson-2-3',
        title: 'Funções por Partes',
        description: 'Quando a função muda de regra — o limite pode ou não existir.',
        xpReward: 90,
        items: [
          {
            type: 'lesson-intro',
            title: 'Funções por Partes',
            subtitle: 'Uma função, duas (ou mais) personalidades',
            icon: '🧩',
            accentColor: '#0891b2',
            sections: [
              {
                type: 'hook',
                content: 'Imagine um táxi: até 5 km custa R$15 fixos. Acima de 5 km, cobra R$3/km extra. É uma função por partes — duas regras diferentes dependendo da "zona" em que x está.',
              },
              {
                type: 'analogy',
                title: 'Táxi vs matemática',
                realWorld: 'x ≤ 5 km → preço = R$15. x > 5 km → preço = R$15 + 3(x−5). Mesma função, regra diferente.',
                mathWorld: 'f(x) = {x+1 se x<0; x² se x≥0}. Em x=0 temos um ponto de transição — precisamos checar os dois lados.',
              },
              {
                type: 'insight',
                icon: '🔍',
                title: 'A estratégia para limites em funções por partes',
                content: 'Calcule o limite pela esquerda usando a regra da esquerda, e pela direita usando a regra da direita. Se coincidirem → limite existe. Se divergirem → limite não existe (salto).',
              },
              {
                type: 'numbered-list',
                title: 'Passo a passo:',
                items: [
                  'Identifique o ponto de transição (onde as regras mudam)',
                  'Calcule o limite esquerdo com a regra de x < a',
                  'Calcule o limite direito com a regra de x > a',
                  'Compare: L⁻ = L⁺ → existe. L⁻ ≠ L⁺ → não existe.',
                ],
              },
            ],
          },
          {
            id: 'q2-3-1',
            type: 'true-false',
            title: 'Função por Partes em x = 0',
            description: 'Seja f(x) = {−1 se x < 0; +1 se x ≥ 0}. O limite de f(x) quando x → 0 existe?',
            content: {},
            correctAnswer: false,
            explanation: 'Pela esquerda: f(x) = −1 → L⁻ = −1. Pela direita: f(x) = +1 → L⁺ = +1. Como −1 ≠ +1, o limite NÃO existe — é um salto!',
          },
          {
            id: 'q2-3-2',
            type: 'multiple-choice',
            title: 'Encontre o Limite',
            description: 'Seja f(x) = {x² se x ≤ 1; 2x−1 se x > 1}. Qual é o lim f(x) quando x → 1?',
            content: {
              options: [
                '1 (limite existe — L⁻ = L⁺ = 1)',
                '0 (não existe — L⁻ = 0, L⁺ = 1)',
                'Não existe — as regras divergem',
                '2 (limite existe — L⁻ = L⁺ = 2)',
              ],
            },
            correctAnswer: 0,
            explanation: 'Pela esquerda: f(x) = x² → quando x→1⁻, f→1. Pela direita: f(x) = 2x−1 → quando x→1⁺, f→2(1)−1=1. L⁻ = L⁺ = 1 → limite EXISTE e vale 1!',
          },
          {
            id: 'q2-3-3',
            type: 'lateral-detective',
            title: 'Investigando a Junção',
            description: 'Investigue f(x) = |x| em x = 0. Em cada lado: f(x) = x se x ≥ 0, e f(x) = −x se x < 0.',
            content: {
              functionLeft: 'abs(x)',
              functionRight: 'abs(x)',
              targetX: 0,
            },
            correctAnswer: true,
            explanation: 'Pela esquerda: |x| = −x → quando x→0⁻, |x|→0. Pela direita: |x| = x → quando x→0⁺, |x|→0. L⁻ = L⁺ = 0 → limite EXISTE e vale 0!',
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
            type: 'lesson-intro',
            title: 'Limites no Infinito',
            subtitle: 'O que acontece quando x cresce sem parar?',
            icon: '🚀',
            accentColor: '#8b5cf6',
            sections: [
              {
                type: 'hook',
                content: 'Quem fica mais rico mais rápido: quem ganha x² reais por mês ou quem ganha x³? Quando x = 10, a diferença é 100 vs 1000. Quando x = 1000, é 1 milhão vs 1 bilhão. Isso é o que estudamos aqui — corrida de funções rumo ao infinito!',
              },
              {
                type: 'analogy',
                title: 'Corrida de crescimento',
                realWorld: 'Empresa A cresce 100 funcionários/ano (linear). Empresa B dobra de tamanho todo ano (exponencial). Quem domina no longo prazo?',
                mathWorld: 'Na razão x/x², quando x → ∞, o denominador vence: 1/x → 0. O "vencedor" determina o limite da fração.',
              },
              {
                type: 'numbered-list',
                title: 'As 3 regras da corrida ao infinito:',
                items: [
                  'Denominador de grau maior → limite = 0 (denominador vence)',
                  'Numerador de grau maior → limite = ∞ (numerador vence)',
                  'Mesmo grau → limite = razão dos coeficientes líderes (empate técnico)',
                ],
              },
              {
                type: 'insight',
                icon: '💡',
                title: 'Dica prática',
                content: 'Ignore tudo exceto o MAIOR expoente de cada lado. Em (3x² + 5x) / (x² − 1), concentre-se apenas em 3x²/x² = 3. Termos menores "desaparecem" no infinito.',
              },
            ],
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
            type: 'lesson-intro',
            title: 'O Limite Trigonométrico',
            subtitle: 'A equação mais surpreendente da trigonometria',
            icon: '〰️',
            accentColor: '#0891b2',
            sections: [
              {
                type: 'hook',
                content: 'O ângulo de um círculo e o seno desse ângulo são coisas diferentes... exceto quando o ângulo é MUITO pequeno. Nesse caso, sin(x) ≈ x. E isso muda tudo no cálculo!',
              },
              {
                type: 'analogy',
                realWorld: 'Numa estrada muito longa e levemente curva, a curvatura é tão pequena que parece reta. Quanto menor o trecho, mais parecida com uma linha reta.',
                mathWorld: 'Sin(x)/x → 1 quando x → 0. Para ângulos minúsculos, o arco (x) e o seno (sin x) são quase iguais.',
              },
              {
                type: 'insight',
                icon: '📐',
                title: 'O limite fundamental da trigonometria',
                content: 'lim (x→0) sin(u)/u = 1 — SOMENTE quando o argumento do seno (u) é IGUAL ao denominador. Se temos sin(3x), o denominador também precisa ser 3x!',
              },
              {
                type: 'numbered-list',
                title: 'Como usar na prática:',
                items: [
                  'Identifique o "u" dentro do seno: sin(5x) → u = 5x',
                  'O denominador deve ser esse mesmo u: precisamos de 5x embaixo',
                  'Se não for, ajuste: sin(5x)/x = 5 · sin(5x)/(5x) = 5 · 1 = 5',
                  'Sempre verifique: argumento do seno = denominador?',
                ],
              },
            ],
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
            type: 'lesson-intro',
            title: 'O Número e — Nascido dos Juros',
            subtitle: 'O número mais importante do cálculo',
            icon: '💰',
            accentColor: '#d97706',
            sections: [
              {
                type: 'hook',
                content: 'Suponha que um banco oferece 100% ao ano. Se você aplica R$1, no final do ano tem R$2. Mas e se os juros fossem pagos mensalmente? Trimestralmente? A cada segundo? A cada fração de segundo... infinitas vezes?',
              },
              {
                type: 'analogy',
                title: 'A questão do banco',
                realWorld: 'Juros compostos: mais vezes você recalcula, mais você ganha. Banco A: 1 vez/ano → R$2,00. Banco B: 12 vezes/ano → R$2,61. Banco C: 365 vezes/ano → R$2,714.',
                mathWorld: 'A fórmula é (1 + 1/n)^n. Quando n → ∞ (juros contínuos), essa expressão converge para e ≈ 2,71828...',
              },
              {
                type: 'numbered-list',
                title: 'Veja a convergência acontecer:',
                items: [
                  'n = 1 : (1 + 1/1)¹ = 2,000',
                  'n = 2 : (1 + 1/2)² = 2,250',
                  'n = 12 : (1 + 1/12)¹² ≈ 2,613',
                  'n = 365 : (1 + 1/365)³⁶⁵ ≈ 2,7145',
                  'n = 1.000.000 : ≈ 2,71828... → e',
                ],
              },
              {
                type: 'insight',
                icon: '🔑',
                title: 'Por que e é tão especial?',
                content: 'e é a ÚNICA base onde a derivada de eˣ é ela própria. Isso significa: o número e descreve qualquer crescimento que é proporcional ao que já existe — células crescendo, juros compostos, radioatividade, populações.',
              },
            ],
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
