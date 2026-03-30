-- Add description column to PON ports for UI display
ALTER TABLE IF EXISTS pon_ports
  ADD COLUMN IF NOT EXISTS description TEXT;

