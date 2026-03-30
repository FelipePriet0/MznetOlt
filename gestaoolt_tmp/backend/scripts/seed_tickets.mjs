/**
 * Cria tickets de teste para cada tipo de detector e chama o LLM em cada um.
 * Rode com: node scripts/seed_tickets.mjs
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const DETECTOR_CONTEXT = {
  reactive_drop: 'A ONU ficou offline. A correlação com outras ONUs na mesma PON e OLT indica a provável causa raiz.',
  flapping:      'A ONU entrou e saiu do ar repetidamente em um curto período. Isso indica instabilidade no link óptico.',
  rx_trend:      'O sinal óptico de recepção (RX) da ONU está em queda gradual e constante ao longo do tempo.',
  tx_dying:      'O laser de transmissão (TX) da ONU está apresentando degradação progressiva.',
  ghost_onu:     'A ONU está online mas não apresenta tráfego de dados durante o horário comercial.',
}

const SEED_TICKETS = [
  {
    onu_id: 108, olt_id: 31,
    detector_type: 'reactive_drop',
    urgency: 'high',
    title: 'ONU offline — Possível falha no tronco da PON (FHTTE6F94112)',
    facts: {
      scope: 'trunk',
      serial_number: 'FHTTE6F94112',
      last_seen_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      offline_on_pon: 4,
      total_on_pon: 12,
      offline_on_olt: 5,
      total_on_olt: 38,
      pon_correlation_threshold: 3,
    },
  },
  {
    onu_id: 109, olt_id: 31,
    detector_type: 'flapping',
    urgency: 'high',
    title: 'ONU instável — Quedas repetidas detectadas (ALKL49538AD1)',
    facts: {
      serial_number: 'ALKL49538AD1',
      drops_in_window: 7,
      window_hours: 24,
      last_drop_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      affected_pon_onus: 1,
    },
  },
  {
    onu_id: 110, olt_id: 31,
    detector_type: 'rx_trend',
    urgency: 'medium',
    title: 'ONU com sinal RX em queda gradual (HWTCE1E1917E)',
    facts: {
      serial_number: 'HWTCE1E1917E',
      rx_slope_dbm_per_day: -0.9,
      rx_current_dbm: -25.4,
      rx_7_days_ago_dbm: -19.1,
      rx_critical_threshold_dbm: -28.0,
      estimated_days_to_critical: 3,
      r2: 0.94,
    },
  },
  {
    onu_id: 111, olt_id: 31,
    detector_type: 'tx_dying',
    urgency: 'high',
    title: 'ONU com laser TX degradando (ALKL1A55DCD5)',
    facts: {
      serial_number: 'ALKL1A55DCD5',
      tx_slope_dbm_per_day: -1.1,
      tx_current_dbm: -3.8,
      tx_7_days_ago_dbm: 2.9,
      rx_current_dbm: -20.1,
      rx_slope_dbm_per_day: -0.05,
      diagnosis_hint: 'TX caindo com RX estável — falha no transmissor da ONU',
    },
  },
  {
    onu_id: 112, olt_id: 31,
    detector_type: 'ghost_onu',
    urgency: 'low',
    title: 'ONU online sem tráfego em horário comercial (ZTEG41AC4ABE)',
    facts: {
      serial_number: 'ZTEG41AC4ABE',
      rx_current_dbm: -21.3,
      status: 'online',
      traffic_bytes_last_6h: 1240,
      traffic_threshold_bytes: 500000,
      window_start: '09:00',
      window_end: '18:00',
      hours_without_traffic: 6,
    },
  },
]

async function generateDiagnosis(detectorType, facts) {
  const context = DETECTOR_CONTEXT[detectorType] ?? ''
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{
      role: 'user',
      content: `Você é um técnico sênior de redes GPON de uma empresa de telecomunicações.
Com base nos dados abaixo, escreva um diagnóstico objetivo para o técnico de campo em português brasileiro.

CONTEXTO DO PROBLEMA:
${context}

DADOS COLETADOS:
${JSON.stringify(facts, null, 2)}

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
  console.log('[seed-tickets] Inserindo tickets de teste...\n')

  for (const ticket of SEED_TICKETS) {
    process.stdout.write(`  ${ticket.detector_type} (${ticket.urgency}) → `)

    const { data, error } = await supabase
      .from('diagnostic_tickets')
      .insert({
        ...ticket,
        status: 'open',
        opened_at: new Date().toISOString(),
        facts: ticket.facts,
      })
      .select('id')
      .single()

    if (error) {
      console.log(`ERRO ao inserir: ${error.message}`)
      continue
    }

    const ticketId = data.id
    process.stdout.write(`inserido #${ticketId} → gerando diagnóstico... `)

    try {
      const diagnosis = await generateDiagnosis(ticket.detector_type, ticket.facts)
      if (!diagnosis) { console.log('LLM vazio'); continue }

      await supabase
        .from('diagnostic_tickets')
        .update({ diagnosis, updated_at: new Date().toISOString() })
        .eq('id', ticketId)

      console.log('OK')
      console.log('\n' + diagnosis + '\n')
    } catch (err) {
      console.log(`ERRO LLM: ${err.message}`)
    }
  }

  console.log('[seed-tickets] Concluído.')
}

main()
