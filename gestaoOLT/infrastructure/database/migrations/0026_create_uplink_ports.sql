CREATE TABLE uplink_ports (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  olt_id          BIGINT NOT NULL REFERENCES olts(id) ON DELETE CASCADE,
  name            TEXT   NOT NULL,
  fiber           TEXT,
  admin_state     TEXT   NOT NULL DEFAULT 'Habilitado',
  status          TEXT   NOT NULL DEFAULT 'Habilitado',
  negotiation     TEXT   NOT NULL DEFAULT 'Auto',
  mtu             INTEGER,
  duplex          TEXT   NOT NULL DEFAULT 'Auto',
  pvid            INTEGER NOT NULL DEFAULT 1,
  vlan_mode       TEXT   NOT NULL DEFAULT 'Porta',
  tagged_vlans    TEXT,
  description     TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uplink_ports_olt_name_unique UNIQUE (olt_id, name)
);

CREATE INDEX uplink_ports_olt_id_idx ON uplink_ports (olt_id);
