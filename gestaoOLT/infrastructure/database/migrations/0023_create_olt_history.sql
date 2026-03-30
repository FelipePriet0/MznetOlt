CREATE TABLE olt_history (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  olt_id     BIGINT NOT NULL REFERENCES olts(id) ON DELETE CASCADE,
  action     TEXT   NOT NULL,
  user_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX olt_history_olt_id_idx    ON olt_history (olt_id);
CREATE INDEX olt_history_created_at_idx ON olt_history (created_at DESC);
