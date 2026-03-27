import OpenAI from 'openai'
import { env } from '@/config/env'
import type { DetectorType } from './types'

const DETECTOR_CONTEXT: Record<DetectorType, string> = {
  reactive_drop: 'A ONU ficou offline. A correlação com outras ONUs na mesma PON e OLT indica a provável causa raiz.',
  flapping: 'A ONU entrou e saiu do ar repetidamente em um curto período. Isso indica instabilidade no link óptico.',
  rx_trend: 'O sinal óptico de recepção (RX) da ONU está em queda gradual e constante ao longo do tempo.',
  tx_dying: 'O laser de transmissão (TX) da ONU está apresentando degradação progressiva.',
  ghost_onu: 'A ONU está online mas não apresenta tráfego de dados durante o horário comercial.',
}

export async function generateDiagnosis(
  detectorType: DetectorType,
  facts: Record<string, unknown>
): Promise<string | null> {
  if (!env.OPENAI_API_KEY) return null

  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY })

  const context = DETECTOR_CONTEXT[detectorType] ?? ''
  const factsText = JSON.stringify(facts, null, 2)

  const prompt = `Você é um técnico sênior de redes GPON de uma empresa de telecomunicações.
Com base nos dados abaixo, escreva um diagnóstico objetivo para o técnico de campo em português brasileiro.

CONTEXTO DO PROBLEMA:
${context}

DADOS COLETADOS:
${factsText}

FORMATO OBRIGATÓRIO (use exatamente esta estrutura, em no máximo 2 blocos):

**Diagnóstico**
• [o que está acontecendo com a ONU, interpretando os dados]

**Prováveis Causas**
• [causa mais provável]
• [causa alternativa se houver]

**Como Resolver**
• [ação principal]
• [ação complementar se necessário]

REGRAS:
- Use bullets (•) em todos os itens, nunca prosa corrida
- Seja direto — sem introduções, sem conclusões
- Não repita os números brutos dos dados — interprete-os
- Máximo 2 itens por seção`

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.3,
    })

    return response.choices[0]?.message?.content?.trim() ?? null
  } catch (err) {
    console.error('[llm-diagnosis] Erro ao chamar OpenAI:', err)
    return null
  }
}
