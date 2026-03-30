-- Log imutável de tudo que acontece com um ticket.
-- Cada transição de status, diagnóstico gerado, observação do técnico = um evento.

CREATE TABLE IF NOT EXISTS ticket_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  ticket_id BIGINT NOT NULL REFERENCES diagnostic_tickets(id) ON DELETE CASCADE,

  -- Tipo do evento
  event_type TEXT NOT NULL CHECK (event_type IN (
    'opened',               -- job abriu o ticket
    'diagnosis_generated',  -- LLM gerou o diagnóstico
    'confirmed',            -- técnico confirmou o problema
    'dispatched',           -- técnico foi a campo
    'resolved',             -- problema resolvido
    'closed',               -- ticket encerrado administrativamente
    'false_positive',       -- marcado como falso positivo
    'note_added'            -- observação livre do técnico
  )),

  -- 'system' para o job/LLM, ou identificador do usuário que agiu
  actor TEXT NOT NULL DEFAULT 'system',

  -- Texto livre (observação do técnico, nota, etc.)
  notes TEXT,

  -- Dados adicionais contextuais (ex: localização do técnico, versão do diagnóstico)
  metadata JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ticket_events_ticket_id_idx
  ON ticket_events (ticket_id);

CREATE INDEX IF NOT EXISTS ticket_events_created_at_idx
  ON ticket_events (created_at DESC);
