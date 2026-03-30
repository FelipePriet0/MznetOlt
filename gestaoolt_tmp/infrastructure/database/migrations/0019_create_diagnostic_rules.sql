-- Regras configuráveis do sistema de diagnóstico preditivo/reativo.
-- Uma linha por detector_type. Config JSONB guarda thresholds e janelas de tempo.

CREATE TABLE IF NOT EXISTS diagnostic_rules (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Identificador do detector (rx_trend | tx_dying | flapping | ghost_onu | reactive_drop)
  detector_type TEXT NOT NULL,

  enabled BOOLEAN NOT NULL DEFAULT true,

  -- Parâmetros configuráveis pelo provedor. Exemplos:
  --   rx_trend:      { "window_hours": 24, "min_samples": 6, "slope_threshold_dbm_per_hour": -0.1 }
  --   tx_dying:      { "window_hours": 24, "tx_drop_threshold_dbm": 2.0, "rx_stable_threshold_dbm": 1.0 }
  --   flapping:      { "window_hours": 4, "min_events": 5 }
  --   ghost_onu:     { "window_hours": 8, "business_start_hour": 8, "business_end_hour": 20, "max_traffic_bytes": 1048576 }
  --   reactive_drop: { "pon_correlation_threshold": 3 }
  config JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Garante no máximo uma regra por detector
CREATE UNIQUE INDEX IF NOT EXISTS diagnostic_rules_detector_type_unique
  ON diagnostic_rules (detector_type);

-- Seed: insere as 5 regras com configurações padrão
INSERT INTO diagnostic_rules (detector_type, config) VALUES
  ('rx_trend',      '{"window_hours": 24, "min_samples": 6, "slope_threshold_dbm_per_hour": -0.1}'),
  ('tx_dying',      '{"window_hours": 24, "tx_drop_threshold_dbm": 2.0, "rx_stable_threshold_dbm": 1.0}'),
  ('flapping',      '{"window_hours": 4, "min_events": 5}'),
  ('ghost_onu',     '{"window_hours": 8, "business_start_hour": 8, "business_end_hour": 20, "max_traffic_bytes": 1048576}'),
  ('reactive_drop', '{"pon_correlation_threshold": 3}')
ON CONFLICT DO NOTHING;
