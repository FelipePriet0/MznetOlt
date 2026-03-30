CREATE TABLE authorization_presets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT authorization_presets_name_unique UNIQUE (name)
);

CREATE TABLE authorization_preset_profiles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  authorization_preset_id BIGINT NOT NULL REFERENCES authorization_presets(id),
  onu_type_id BIGINT REFERENCES onu_types(id),
  service_vlan TEXT,
  line_profile TEXT,
  service_profile TEXT,
  native_vlan TEXT,
  pppoe_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT authorization_preset_profiles_preset_type_unique UNIQUE (authorization_preset_id, onu_type_id)
);
