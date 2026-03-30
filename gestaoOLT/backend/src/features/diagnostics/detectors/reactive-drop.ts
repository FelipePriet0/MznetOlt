import type { JobOnu, DiagnosticRule, DetectorMatch, Urgency } from '../types'

export async function reactiveDropDetector(
  onus: JobOnu[],
  rule: DiagnosticRule
): Promise<DetectorMatch[]> {
  const config = rule.config as { pon_correlation_threshold?: number }
  const ponThreshold = config.pon_correlation_threshold ?? 3

  // Conta ONUs offline e total por PON e por OLT
  const offlineByPon = new Map<number, number>()
  const totalByPon = new Map<number, number>()
  const offlineByOlt = new Map<number, number>()
  const totalByOlt = new Map<number, number>()

  for (const onu of onus) {
    totalByPon.set(onu.pon_port_id, (totalByPon.get(onu.pon_port_id) ?? 0) + 1)
    totalByOlt.set(onu.olt_id, (totalByOlt.get(onu.olt_id) ?? 0) + 1)

    if (onu.status === 'offline') {
      offlineByPon.set(onu.pon_port_id, (offlineByPon.get(onu.pon_port_id) ?? 0) + 1)
      offlineByOlt.set(onu.olt_id, (offlineByOlt.get(onu.olt_id) ?? 0) + 1)
    }
  }

  const matches: DetectorMatch[] = []

  for (const onu of onus) {
    if (onu.status !== 'offline') continue

    const offlinePon = offlineByPon.get(onu.pon_port_id) ?? 0
    const totalPon = totalByPon.get(onu.pon_port_id) ?? 0
    const offlineOlt = offlineByOlt.get(onu.olt_id) ?? 0
    const totalOlt = totalByOlt.get(onu.olt_id) ?? 0
    const oltOfflineRatio = totalOlt > 0 ? offlineOlt / totalOlt : 0

    let urgency: Urgency
    let scope: 'customer' | 'trunk' | 'infrastructure'

    if (oltOfflineRatio >= 0.5 && totalOlt >= 4) {
      // Metade ou mais das ONUs da OLT offline → problema de infraestrutura
      urgency = 'critical'
      scope = 'infrastructure'
    } else if (offlinePon >= ponThreshold) {
      // Múltiplas ONUs na mesma PON offline → possível falha de tronco
      urgency = 'high'
      scope = 'trunk'
    } else {
      // ONU isolada → problema no cliente
      urgency = 'medium'
      scope = 'customer'
    }

    const scopeLabel = {
      customer: 'Problema no cliente',
      trunk: 'Possível falha no tronco da PON',
      infrastructure: 'Falha de infraestrutura na OLT',
    }[scope]

    matches.push({
      onu_id: onu.id,
      olt_id: onu.olt_id,
      urgency,
      title: `ONU offline — ${scopeLabel} (${onu.serial_number})`,
      facts: {
        scope,
        serial_number: onu.serial_number,
        last_seen_at: onu.last_seen_at,
        offline_on_pon: offlinePon,
        total_on_pon: totalPon,
        offline_on_olt: offlineOlt,
        total_on_olt: totalOlt,
        pon_correlation_threshold: ponThreshold,
      },
    })
  }

  return matches
}
