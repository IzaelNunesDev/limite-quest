# QWEN.md — Limite Quest

## Visão Geral

**Limite Quest** é um aplicativo educacional gamificado para ensino de **limites de cálculo**, inspirado no estilo de design do Duolingo. O app transforma conceitos matemáticos (aproximação, limites laterais, limites no infinito, trigonometria e número de Euler) em uma jornada interativa com ilhas, lições, desafios e recompensas.

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 6
- **Estilização:** Tailwind CSS v4 (com tema customizado)
- **Animações:** Motion (Framer Motion)
- **Ícones:** Lucide React
- **Gráficos/Visualizações:** Componentes interativos customizados
- **AI:** Google Gemini (`@google/genai`)
- **Outras deps:** Recharts (gráficos), canvas-confetti (efeitos), clsx/tailwind-merge (utilitários de classe)

## Estrutura do Projeto

```
limite-quest/
├── src/
│   ├── App.tsx              # Componente principal (estado global, rotas, layout)
│   ├── main.tsx             # Entry point (React DOM)
│   ├── index.css            # Tailwind + tema customizado + classes utilitárias
│   ├── types.ts             # Tipos TypeScript (Question, Lesson, Island, UserState)
│   ├── constants.ts         # Dados das 5 ilhas, lições e estado inicial do usuário
│   ├── components/
│   │   ├── IslandMap.tsx            # Mapa de ilhas com nós de lição
│   │   ├── LessonPlayer.tsx         # Player de lições (fluxo de questões)
│   │   ├── InfiniteZoom.tsx         # Componente de zoom infinito
│   │   ├── InteractiveGraph.tsx     # Gráfico interativo
│   │   ├── ReviewSession.tsx        # Sessão de revisão (sistema Leitner)
│   │   ├── SettingsModal.tsx        # Modal de configurações
│   │   ├── Toast.tsx                # Notificações toast
│   │   └── question-types/          # Componentes por tipo de questão
│   │       ├── TactileApproximation.tsx
│   │       ├── LateralDetective.tsx
│   │       ├── InfinityRace.tsx
│   │       ├── TrigSlider.tsx
│   │       ├── FactorizationPuzzle.tsx
│   │       ├── FlashcardIndeterminacy.tsx
│   │       └── EBoss.tsx
│   └── lib/
│       └── utils.ts         # Utilitários (cn, formatXP, getHeartsRecoveryTime)
├── index.html               # HTML entry
├── vite.config.ts           # Configuração do Vite (React + Tailwind plugins)
├── tsconfig.json            # TypeScript (ES2022, strict mode)
├── package.json
└── .env.example
```

## Funcionalidades

### Gamificação
- **XP** — pontos de experiência ao completar lições
- **Corações (hearts)** — sistema de vidas (5 corações, recuperam 1 a cada 15 min)
- **Streak** — dias consecutivos jogando
- **Delta Coins** — moeda virtual para a loja
- **Sistema Leitner** — flashcards com caixas de repetição espaçada

### 5 Ilhas (Conteúdo de Limites)
| Ilha | Tema |
|------|------|
| 1 | A Noção Intuitiva (aproximação, tabelas, indeterminação 0/0) |
| 2 | Limites Laterais (esquerda vs direita, funções com salto) |
| 3 | Infinito e Além (limites no infinito, corridas de polinômios) |
| 4 | Limites Trigonométricos (sin(x)/x, tan(x)/x) |
| 5 | O Número de Euler (juros contínuos, exponenciais, logaritmos) |

### Tipos de Questão
- `tactile-approximation` — sliders para aproximar valores num gráfico
- `multiple-choice` — múltipla escolha
- `true-false` — verdadeiro ou falso
- `lateral-detective` — investigar limites laterais
- `factorization-puzzle` — fatoração de expressões
- `infinity-race` — corridas de crescimento no infinito
- `trig-slider` — sliders para limites trigonométricos
- `flashcard-indeterminacy` — flashcards de indeterminação
- `e-boss` — desafios sobre o número *e*

### Telas
- **Trilha (Map)** — mapa de ilhas com nós de lições (estilo Duolingo)
- **Loja Delta** — loja de itens cosméticos e power-ups
- **Ranking** — liga de classificação por XP
- **Review** — sessão de revisão com sistema Leitner

## Comandos

### Desenvolvimento
```bash
npm install       # Instalar dependências
npm run dev       # Rodar servidor dev (porta 3000)
npm run build     # Build de produção (gera em dist/)
npm run preview   # Preview do build de produção
npm run clean     # Limpar pasta dist/
npm run lint      # Type check com TypeScript
```

### Variáveis de Ambiente
| Variável | Descrição |
|----------|-----------|
| `GEMINI_API_KEY` | Chave da API do Google Gemini (requerida para funcionalidades AI) |
| `APP_URL` | URL de hospedagem do app |

Configure via `.env.local` (não versionado). Veja `.env.example` para referência.

## Persistência

O estado do usuário (`UserState`) é salvo em **localStorage** sob a chave `limite-quest-user` e persiste entre sessões.

## Convenções de Código

- **TypeScript strict** — sem `any` implícito, tipos bem definidos em `types.ts`
- **Estilização** — Tailwind CSS com tema customizado (prefixo `v-` para "Limite Quest")
- **Componentes** — arquivos `.tsx` nomeados em PascalCase
- **Classes CSS custom** — prefixo `v-` (ex: `v-card`, `v-btn-primary`, `v-node`)
- **Utilitários de classe** — usa `clsx` + `tailwind-merge` via função `cn()`
- **Animações** — Motion (`motion/`) com `AnimatePresence` para transições
- **License header** — `SPDX-License-Identifier: Apache-2.0` nos arquivos fonte
- **Path aliases** — `@/*` mapeia para a raiz do projeto

## Arquitetura

- **Estado global** gerenciado no `App.tsx` via `useState` + `localStorage`
- **State management** — React state local (sem Redux/Context por enquanto)
- **Roteamento** — tabs controladas por estado (`activeTab`), sem react-router
- **Componentes de questão** — cada tipo tem seu próprio componente em `question-types/`
- **Conteúdo hard-coded** — ilhas e lições definidas em `constants.ts`
