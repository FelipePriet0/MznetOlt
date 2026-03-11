CREATE TABLE network_sync_runs (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  olt_id BIGINT NOT NULL REFERENCES olts(id),
  job_name TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  duration_ms INTEGER,
  error_message TEXT,
  stats_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX network_sync_runs_olt_id_idx ON network_sync_runs (olt_id);
CREATE INDEX network_sync_runs_job_name_idx ON network_sync_runs (job_name);
CREATE INDEX network_sync_runs_status_idx ON network_sync_runs (status);
CREATE INDEX network_sync_runs_started_at_idx ON network_sync_runs (started_at DESC);
