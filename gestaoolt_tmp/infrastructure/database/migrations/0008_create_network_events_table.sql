CREATE TABLE network_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  olt_id BIGINT NOT NULL REFERENCES olts(id),
  onu_id BIGINT REFERENCES onus(id),
  onu_serial TEXT NOT NULL,
  event_type TEXT NOT NULL,
  previous_state JSONB,
  current_state JSONB,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX network_events_olt_id_idx ON network_events (olt_id);
CREATE INDEX network_events_onu_id_idx ON network_events (onu_id);
CREATE INDEX network_events_onu_serial_idx ON network_events (onu_serial);
CREATE INDEX network_events_event_type_idx ON network_events (event_type);
CREATE INDEX network_events_created_at_idx ON network_events (created_at DESC);
