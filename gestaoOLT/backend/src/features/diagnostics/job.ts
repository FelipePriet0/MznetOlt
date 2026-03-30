import { loadEnabledRules } from './rules-repository'
import { loadAllOnus } from './onus-repository'
import { hasOpenTicket, openTicket, updateTicketDiagnosis, logTicketEvent } from './tickets-repository'
import { detectorRegistry } from './detectors/index'
import { generateDiagnosis } from './llm-diagnosis'
import type { DetectorType } from './types'

export async function runDiagnosticJob(): Promise<void> {
  const startedAt = new Date()
  console.log(`[diagnostic-job] Iniciando às ${startedAt.toISOString()}`)

  try {
    // 1. Carrega regras habilitadas
    const rules = await loadEnabledRules()
    console.log(`[diagnostic-job] ${rules.length} regra(s) habilitada(s)`)

    if (rules.length === 0) return

    // 2. Carrega todas as ONUs uma vez (compartilhado entre detectores)
    const onus = await loadAllOnus()
    console.log(`[diagnostic-job] ${onus.length} ONU(s) carregada(s)`)

    let ticketsOpened = 0
    let ticketsSkipped = 0

    // 3. Executa cada detector habilitado
    for (const rule of rules) {
      const detector = detectorRegistry[rule.detector_type as DetectorType]

      if (!detector) {
        console.warn(`[diagnostic-job] Detector "${rule.detector_type}" não registrado, pulando`)
        continue
      }

      let matches
      try {
        matches = await detector(onus, rule)
      } catch (err) {
        console.error(`[diagnostic-job] Erro no detector "${rule.detector_type}":`, err)
        continue
      }

      console.log(`[diagnostic-job] detector=${rule.detector_type} matches=${matches.length}`)

      // 4. Para cada match: dedup → abre ticket → loga evento
      for (const match of matches) {
        try {
          const alreadyOpen = await hasOpenTicket(match.onu_id, rule.detector_type as DetectorType)
          if (alreadyOpen) {
            ticketsSkipped++
            continue
          }

          const ticketId = await openTicket(match, rule.detector_type as DetectorType)
          await logTicketEvent(ticketId, 'opened', undefined, {
            detector_type: rule.detector_type,
            urgency: match.urgency,
          })

          ticketsOpened++

          // Gera diagnóstico LLM de forma assíncrona — não bloqueia o job
          generateDiagnosis(rule.detector_type as DetectorType, match.facts)
            .then(async (diagnosis) => {
              if (!diagnosis) return
              await updateTicketDiagnosis(ticketId, diagnosis)
              await logTicketEvent(ticketId, 'diagnosis_generated')
            })
            .catch((err) =>
              console.error(`[diagnostic-job] Falha ao gerar diagnóstico ticket ${ticketId}:`, err)
            )
        } catch (err) {
          console.error(
            `[diagnostic-job] Falha ao abrir ticket ONU ${match.onu_id} / detector ${rule.detector_type}:`,
            err
          )
        }
      }
    }

    const elapsed = Date.now() - startedAt.getTime()
    console.log(
      `[diagnostic-job] Concluído em ${elapsed}ms — abertos=${ticketsOpened} ignorados(dedup)=${ticketsSkipped}`
    )
  } catch (err) {
    console.error('[diagnostic-job] Erro fatal:', err)
  }
}

export function startDiagnosticJobScheduler(intervalMs = 60 * 60 * 1000): void {
  const intervalMin = intervalMs / 1000 / 60
  console.log(`[diagnostic-job] Agendador iniciado (intervalo=${intervalMin}min)`)

  // Roda imediatamente no startup
  runDiagnosticJob().catch(console.error)

  // Depois a cada intervalo
  setInterval(() => {
    runDiagnosticJob().catch(console.error)
  }, intervalMs)
}
