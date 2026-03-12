-- Create table for ONU optical signal samples (rx/tx dBm) used by
-- features like dashboard-onu-signal-stats and onu signal history.

CREATE TABLE IF NOT EXISTS onu_signal_samples (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  onu_id BIGINT NOT NULL REFERENCES onus(id),
  rx_dbm NUMERIC NOT NULL,
  tx_dbm NUMERIC,
  collected_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_onu_signal_samples_onu_id
  ON onu_signal_samples (onu_id);

CREATE INDEX IF NOT EXISTS idx_onu_signal_samples_collected_at
  ON onu_signal_samples (collected_at);

CREATE INDEX IF NOT EXISTS idx_onu_signal_samples_onu_id_collected_at
  ON onu_signal_samples (onu_id, collected_at DESC);

