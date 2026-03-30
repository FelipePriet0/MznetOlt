CREATE TABLE roles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT roles_name_unique UNIQUE (name),
  CONSTRAINT roles_code_unique UNIQUE (code)
);

INSERT INTO roles (name, code) VALUES
  ('Leitor', 'reader'),
  ('Técnico', 'technician'),
  ('Admin', 'admin');
