ALTER TABLE olts
  ALTER COLUMN location_id DROP NOT NULL,
  ALTER COLUMN zone_id     DROP NOT NULL,
  ADD COLUMN tcp_port          INTEGER      NOT NULL DEFAULT 2333,
  ADD COLUMN telnet_user       TEXT,
  ADD COLUMN telnet_password   TEXT,
  ADD COLUMN snmp_ro_community TEXT,
  ADD COLUMN snmp_rw_community TEXT,
  ADD COLUMN snmp_udp_port     INTEGER      NOT NULL DEFAULT 2161,
  ADD COLUMN iptv_enabled      BOOLEAN      NOT NULL DEFAULT false,
  ADD COLUMN hw_version        TEXT,
  ADD COLUMN pon_type          TEXT         NOT NULL DEFAULT 'GPON';
