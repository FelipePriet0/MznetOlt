CREATE TABLE olt_backups (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  olt_id        BIGINT NOT NULL REFERENCES olts(id) ON DELETE CASCADE,
  status        TEXT   NOT NULL DEFAULT 'success', -- 'success' | 'error'
  size_kb       INTEGER,
  next_backup_at TIMESTAMPTZ,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX olt_backups_olt_id_idx     ON olt_backups (olt_id);
CREATE INDEX olt_backups_created_at_idx ON olt_backups (created_at DESC);
