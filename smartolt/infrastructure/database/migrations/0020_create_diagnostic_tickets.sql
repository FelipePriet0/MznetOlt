-- Tickets gerados automaticamente pelo job de diagnóstico.
-- Deduplicação: só pode existir um ticket aberto por (onu_id, detector_type).

CREATE TABLE IF NOT EXISTS diagnostic_tickets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  onu_id BIGINT NOT NULL REFERENCES onus(id),
  olt_id BIGINT NOT NULL REFERENCES olts(id),

  -- Detector que originou o ticket
  detector_type TEXT NOT NULL,

  -- Urgência calculada pelo job
  urgency TEXT NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),

  -- Ciclo de vida do ticket
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_field', 'resolved', 'closed', 'false_positive')),

  -- Título curto gerado pelo job (ex: "Tendência de queda de RX — ONU 1234")
  title TEXT NOT NULL,

  -- Diagnóstico em português claro, redigido pelo LLM com base em `facts`
  diagnosis TEXT,

  -- Fatos estruturados coletados pelo job (para auditoria e prompt do LLM)
  -- Ex: { "rx_samples": [...], "slope": -0.15, "r2": 0.92, "window_hours": 24 }
  facts JSONB NOT NULL DEFAULT '{}',

  opened_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  closed_at   TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Impede abrir dois tickets ativos para a mesma ONU com o mesmo detector
CREATE UNIQUE INDEX IF NOT EXISTS diagnostic_tickets_dedup_idx
  ON diagnostic_tickets (onu_id, detector_type)
  WHERE status IN ('open', 'in_field');

CREATE INDEX IF NOT EXISTS diagnostic_tickets_onu_id_idx
  ON diagnostic_tickets (onu_id);

CREATE INDEX IF NOT EXISTS diagnostic_tickets_olt_id_idx
  ON diagnostic_tickets (olt_id);

CREATE INDEX IF NOT EXISTS diagnostic_tickets_status_idx
  ON diagnostic_tickets (status);

CREATE INDEX IF NOT EXISTS diagnostic_tickets_urgency_idx
  ON diagnostic_tickets (urgency);

CREATE INDEX IF NOT EXISTS diagnostic_tickets_opened_at_idx
  ON diagnostic_tickets (opened_at DESC);
