CREATE TABLE onu_traffic_samples (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  onu_id BIGINT NOT NULL REFERENCES onus(id),
  rx_bytes BIGINT NOT NULL,
  tx_bytes BIGINT NOT NULL,
  collected_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_onu_traffic_samples_onu_id ON onu_traffic_samples (onu_id);
CREATE INDEX idx_onu_traffic_samples_collected_at ON onu_traffic_samples (collected_at);
CREATE INDEX idx_onu_traffic_samples_onu_id_collected_at ON onu_traffic_samples (onu_id, collected_at);

CREATE TABLE uplink_samples (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  olt_id BIGINT NOT NULL REFERENCES olts(id),
  errors BIGINT NOT NULL,
  octets BIGINT NOT NULL,
  collected_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_uplink_samples_olt_id ON uplink_samples (olt_id);
CREATE INDEX idx_uplink_samples_collected_at ON uplink_samples (collected_at);
CREATE INDEX idx_uplink_samples_olt_id_collected_at ON uplink_samples (olt_id, collected_at);

CREATE TABLE olt_health_samples (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  olt_id BIGINT NOT NULL REFERENCES olts(id),
  cpu_usage NUMERIC NOT NULL,
  memory_usage NUMERIC NOT NULL,
  temperature NUMERIC NOT NULL,
  fan_status TEXT NOT NULL,
  collected_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_olt_health_samples_olt_id ON olt_health_samples (olt_id);
CREATE INDEX idx_olt_health_samples_collected_at ON olt_health_samples (collected_at);
CREATE INDEX idx_olt_health_samples_olt_id_collected_at ON olt_health_samples (olt_id, collected_at);
