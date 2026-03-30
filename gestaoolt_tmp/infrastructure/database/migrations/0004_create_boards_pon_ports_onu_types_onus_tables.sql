CREATE TABLE boards (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  olt_id BIGINT NOT NULL REFERENCES olts(id),
  slot_index INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT boards_olt_id_slot_index_unique UNIQUE (olt_id, slot_index)
);

CREATE TABLE pon_ports (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  board_id BIGINT NOT NULL REFERENCES boards(id),
  pon_index INTEGER NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pon_ports_board_id_pon_index_unique UNIQUE (board_id, pon_index)
);

CREATE TABLE onu_types (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vendor TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT onu_types_vendor_model_unique UNIQUE (vendor, model)
);

CREATE TABLE onus (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  serial_number TEXT NOT NULL,
  olt_id BIGINT NOT NULL REFERENCES olts(id),
  board_id BIGINT NOT NULL REFERENCES boards(id),
  pon_port_id BIGINT NOT NULL REFERENCES pon_ports(id),
  onu_type_id BIGINT REFERENCES onu_types(id),
  status TEXT NOT NULL,
  admin_state TEXT NOT NULL,
  last_known_signal NUMERIC,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT onus_serial_number_unique UNIQUE (serial_number)
);
