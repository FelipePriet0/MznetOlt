-- Migration 0029: Advanced OLT settings
ALTER TABLE olts
  ADD COLUMN IF NOT EXISTS show_disabled_onus        BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onu_description_format    TEXT     NOT NULL DEFAULT 'long',    -- 'short'|'medium'|'long'|'disabled'
  ADD COLUMN IF NOT EXISTS use_dhcp_option82         BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS dhcp_option82_field       TEXT,
  ADD COLUMN IF NOT EXISTS use_dhcp_option82_mgmt    BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS dhcp_option82_mgmt_field  TEXT,
  ADD COLUMN IF NOT EXISTS use_pppoe_plus            BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onu_ip_source_guard       BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS use_max_mac_learn         BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS max_mac_per_onu           INTEGER  NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS use_mac_allowlist         BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS use_mac_denylist          BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS use_port_acl              BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS port_acl_field            TEXT,
  ADD COLUMN IF NOT EXISTS rx_warning_dbm            INTEGER  NOT NULL DEFAULT -30,
  ADD COLUMN IF NOT EXISTS rx_critical_dbm           INTEGER  NOT NULL DEFAULT -32,
  ADD COLUMN IF NOT EXISTS separate_voip_mgmt_hosts  BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS temp_warning_celsius      INTEGER  NOT NULL DEFAULT 45,
  ADD COLUMN IF NOT EXISTS temp_critical_celsius     INTEGER  NOT NULL DEFAULT 55,
  ADD COLUMN IF NOT EXISTS tag_transform_mode        TEXT     NOT NULL DEFAULT 'traduzir',
  ADD COLUMN IF NOT EXISTS use_cvlan_id              BOOLEAN  NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS use_svlan_id              BOOLEAN  NOT NULL DEFAULT false;
