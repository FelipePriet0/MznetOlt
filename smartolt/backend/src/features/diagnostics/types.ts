export type DetectorType = 'rx_trend' | 'tx_dying' | 'flapping' | 'ghost_onu' | 'reactive_drop'
export type Urgency = 'low' | 'medium' | 'high' | 'critical'
export type TicketStatus = 'open' | 'in_field' | 'resolved' | 'closed' | 'false_positive'

export type DiagnosticRule = {
  id: number
  detector_type: DetectorType
  enabled: boolean
  config: Record<string, unknown>
}

// Dados mínimos de cada ONU necessários para todos os detectores
export type JobOnu = {
  id: number
  olt_id: number
  pon_port_id: number
  serial_number: string
  status: string
  last_seen_at: string | null
  last_known_signal: number | null
}

// O que um detector retorna por ONU que ele quer sinalizar
export type DetectorMatch = {
  onu_id: number
  olt_id: number
  urgency: Urgency
  title: string
  facts: Record<string, unknown>
}

// Assinatura de um detector
export type Detector = (onus: JobOnu[], rule: DiagnosticRule) => Promise<DetectorMatch[]>
