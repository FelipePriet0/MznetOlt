CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_email_unique UNIQUE (email)
);

ALTER TABLE users
  ADD COLUMN role_id BIGINT REFERENCES roles(id);

UPDATE users
SET role_id = roles.id
FROM roles
WHERE users.role = 'Leitor' AND roles.code = 'reader';

UPDATE users
SET role_id = roles.id
FROM roles
WHERE users.role = 'Técnico' AND roles.code = 'technician';

UPDATE users
SET role_id = roles.id
FROM roles
WHERE users.role = 'Admin' AND roles.code = 'admin';

ALTER TABLE users
  ALTER COLUMN role_id SET NOT NULL;
