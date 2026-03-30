-- Enforce uniqueness of management IPs for OLTs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'olts_mgmt_ip_unique'
  ) THEN
    ALTER TABLE IF EXISTS public.olts
      ADD CONSTRAINT olts_mgmt_ip_unique UNIQUE (mgmt_ip);
  END IF;
END$$;

