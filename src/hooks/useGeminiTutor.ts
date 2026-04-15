/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Hook para chamar o Gemini como "Professor Particular" no Dojo.
 * Só é ativado após o aluno errar 2+ vezes a mesma questão.
 */

import { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';

type TutorState = 'idle' | 'loading' | 'done' | 'error';

interface UseGeminiTutorReturn {
  hint: string | null;
  state: TutorState;
  requestHint: (meta: Record<string, any>, userAnswer: string) => void;
  reset: () => void;
}

const SYSTEM_INSTRUCTION = `Você é um professor de pré-cálculo simpático, direto e encorajador.
Você trabalha em um app de aprendizado gamificado chamado Limite Quest.
Seja BREVÍSSIMO (máx. 3 frases). Use linguagem simples. Sem LaTeX ou markdown complexo.
Foque apenas no ERRO ESPECÍFICO do aluno. Nunca resolva o problema inteiro.
Termine com uma dica de como pensar, não com a resposta.`;

function buildPrompt(meta: Record<string, any>, userAnswer: string): string {
  switch (meta.type) {
    case 'diff-squares':
      return `O aluno está resolvendo: lim (x² − ${meta.aSquared}) / (x − ${meta.a}) quando x → ${meta.a}.
A resposta correta é ${meta.answer}. O aluno escolheu: "${userAnswer}".
Explique brevemente por que a escolha dele está errada e lembre a regra de Diferença de Quadrados (a² − b²). Não resolva tudo.`;

    case 'common-factor':
      return `O aluno está resolvendo: lim (${meta.a}x + ${meta.a * meta.b}) / (x + ${meta.b}) quando x → ${meta.targetX}.
A resposta correta é ${meta.a}. O aluno escolheu: "${userAnswer}".
Explique por que errou e quando usamos fator comum em evidência. Máx. 3 frases.`;

    case 'lateral-detection':
      return `O aluno está identificando o tipo de limite para: ${meta.scenario}.
O aluno escolheu: "${userAnswer}". Explique por que está incorreto.
Dê uma dica sobre como reconhecer este padrão. Máx. 3 frases.`;

    default:
      return `O aluno errou a questão sobre limites e escolheu: "${userAnswer}".
Dê uma dica pedagógica curta sobre como pensar em limites de forma geral.`;
  }
}

export function useGeminiTutor(): UseGeminiTutorReturn {
  const [hint, setHint] = useState<string | null>(null);
  const [state, setState] = useState<TutorState>('idle');

  const requestHint = useCallback(async (meta: Record<string, any>, userAnswer: string) => {
    setState('loading');
    setHint(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        setHint('Configure GEMINI_API_KEY no .env para ativar o Professor IA.');
        setState('done');
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = buildPrompt(meta, userAnswer);

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        config: { systemInstruction: SYSTEM_INSTRUCTION },
        contents: prompt,
      });

      const text = response.text ?? 'O professor está ocupado agora. Tente a dica determinística abaixo.';
      setHint(text);
      setState('done');
    } catch (err) {
      console.error('[useGeminiTutor] error:', err);
      setHint('Não foi possível conectar ao Professor IA. Releia a explicação abaixo.');
      setState('error');
    }
  }, []);

  const reset = useCallback(() => {
    setHint(null);
    setState('idle');
  }, []);

  return { hint, state, requestHint, reset };
}
