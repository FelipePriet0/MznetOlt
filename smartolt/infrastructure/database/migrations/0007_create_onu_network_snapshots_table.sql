CREATE TABLE onu_network_snapshots (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  olt_id BIGINT NOT NULL REFERENCES olts(id),
  onu_serial TEXT NOT NULL,
  onu_id BIGINT REFERENCES onus(id),
  source TEXT NOT NULL,
  last_known_status TEXT,
  last_known_signal NUMERIC,
  last_seen_at TIMESTAMPTZ NOT NULL,
  raw_snapshot JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX onu_network_snapshots_olt_id_idx ON onu_network_snapshots (olt_id);
CREATE INDEX onu_network_snapshots_onu_serial_idx ON onu_network_snapshots (onu_serial);
CREATE INDEX onu_network_snapshots_last_seen_at_idx ON onu_network_snapshots (last_seen_at DESC);
