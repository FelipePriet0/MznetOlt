ALTER TABLE IF EXISTS onus
  ADD COLUMN IF NOT EXISTS service_port_id INTEGER;

CREATE TABLE IF NOT EXISTS ethernet_ports (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  onu_id BIGINT NOT NULL REFERENCES onus(id) ON DELETE CASCADE,
  port_name TEXT NOT NULL,
  admin_state TEXT NOT NULL DEFAULT 'enabled',
  mode TEXT NOT NULL DEFAULT 'access',
  vlan_id INTEGER,
  dhcp_mode TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ethernet_ports_onu_port_unique UNIQUE (onu_id, port_name)
);

