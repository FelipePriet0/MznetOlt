/**
 * Busca todos os tickets com diagnosis=null e chama o LLM para cada um.
 * Rode com: node scripts/retry_diagnosis.mjs
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// Usa service role com header que desabilita RLS
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { db: { schema: 'public' }, global: { headers: { 'x-supabase-bypass-rls': 'true' } } }
)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const DETECTOR_CONTEXT = {
  reactive_drop: 'A ONU ficou offline. A correlação com outras ONUs na mesma PON e OLT indica a provável causa raiz.',
  flapping:      'A ONU entrou e saiu do ar repetidamente em um curto período. Isso indica instabilidade no link óptico.',
  rx_trend:      'O sinal óptico de recepção (RX) da ONU está em queda gradual e constante ao longo do tempo.',
  tx_dying:      'O laser de transmissão (TX) da ONU está apresentando degradação progressiva.',
  ghost_onu:     'A ONU está online mas não apresenta tráfego de dados durante o horário comercial.',
}

async function generateDiagnosis(detectorType, facts) {
  const context = DETECTOR_CONTEXT[detectorType] ?? ''
  const factsText = JSON.stringify(facts, null, 2)

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `Você é um técnico sênior de redes GPON de uma empresa de telecomunicações.
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
- Máximo 2 itens por seção`,
    }],
    max_tokens: 300,
    temperature: 0.3,
  })

  return response.choices[0]?.message?.content?.trim() ?? null
}

async function main() {
  console.log('[retry-diagnosis] Buscando tickets sem diagnóstico...')

  // --force reescreve todos os tickets; sem flag, só os sem diagnóstico
  const force = process.argv.includes('--force')
  let query = supabase.from('diagnostic_tickets').select('id, detector_type, facts').order('opened_at', { ascending: true })
  if (!force) query = query.is('diagnosis', null)
  const { data: tickets, error } = await query

  if (error) {
    console.error('[retry-diagnosis] Erro ao buscar tickets:', error)
    process.exit(1)
  }

  if (!tickets || tickets.length === 0) {
    console.log('[retry-diagnosis] Nenhum ticket sem diagnóstico. Tudo ok!')
    return
  }

  console.log(`[retry-diagnosis] ${tickets.length} ticket(s) para processar\n`)

  let ok = 0
  let fail = 0

  for (const ticket of tickets) {
    process.stdout.write(`  ticket #${ticket.id} (${ticket.detector_type}) → `)

    try {
      const diagnosis = await generateDiagnosis(ticket.detector_type, ticket.facts)

      if (!diagnosis) {
        console.log('LLM retornou vazio, pulando')
        fail++
        continue
      }

      const { error: updateError } = await supabase
        .from('diagnostic_tickets')
        .update({ diagnosis, updated_at: new Date().toISOString() })
        .eq('id', ticket.id)

      if (updateError) throw updateError

      console.log('OK')
      ok++
    } catch (err) {
      console.log(`ERRO: ${err.message}`)
      fail++
    }
  }

  console.log(`\n[retry-diagnosis] Concluído — ok=${ok} falhou=${fail}`)
}

main()
