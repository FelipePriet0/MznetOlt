-- Adiciona campos de configuração às portas PON
ALTER TABLE pon_ports
  ADD COLUMN IF NOT EXISTS admin_state TEXT NOT NULL DEFAULT 'enabled',
  ADD COLUMN IF NOT EXISTS min_range_meters INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_range_meters INT NOT NULL DEFAULT 20000;
