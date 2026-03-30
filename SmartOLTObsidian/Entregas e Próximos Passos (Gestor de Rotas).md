# MZNET OLT — Guia do Gestor (Notion Style)

— Documento operacional para o Gestor de Rotas (ISP) e seu agente de I.A. Ler uma vez e executar de ponta a ponta.

## 1) Visão Geral

- Arquitetura: Front (Next.js), API (Node/Express), Banco (Postgres/Supabase), Workers (telemetria/automação), Drivers OLT (Base/Mock/Vendor).
- Domínios: Dashboard, ONUs, OLTs, Authorization, Settings, Reports, Diagnostics, RBAC.
- Status: nossa frente concluída. Falta conectar ambiente/servidor e a(s) OLT(s), semear cadastros e agendar workers.

## 2) Catálogo de Endpoints (API)
 
- Auth
  - `POST /api/auth/login` → retorna token; `GET /api/auth/me` → identidade.
- Health
  - `GET /health` → liveness.
- Dashboard
  - `GET /api/dashboard/summary`, `/sync-status`, `/recent-events`, `/onu-signal-stats`, `/onu-auth-per-day`, `/network-status`.
- Settings
  - Zones: `GET/POST/PATCH/DELETE /api/settings/zones[/:id]`
  - VLANs: `GET/POST/DELETE /api/settings/vlans[/:id]`
- OLTs
  - `GET/POST /api/olt` • `GET/PATCH/DELETE /api/olt/:id`
  - Saúde/histórico: `GET /api/olt/:id/health` • `GET /api/olt/:id/history`
  - Backups: `GET/POST /api/olt/:id/backups` • `DELETE /api/olt/:id/backups/:backupId`
  - Uplink ports: `GET /api/olt/:id/uplink-ports` • `PATCH /api/olt/:id/uplink-ports/:portId`
  - Boards/PON: `GET /api/olt/:id/boards` • `GET /api/boards` • `GET /api/boards/:id/pon-ports` • `GET /api/pon-ports` • `PATCH /api/pon-ports/:portId` • `POST /api/pon-ports/:portId/restart-onus`
- ONUs
  - Lista: `GET /api/onu` • Não configuradas: `GET /api/onu/unconfigured`
  - Detalhes: `GET /api/onu/:id` • Status: `GET /api/onu/:id/status`
  - Ações: `POST /api/onu/resync` • `POST /api/onu/disable` • `PATCH /api/onu/:id`
  - Info: `GET /api/onu/:id/running-config` • `GET /api/onu/:id/software-info`
  - Telemetria: `GET /api/onu/:id/signal-history` • `GET /api/onu/:id/traffic`
  - Ethernet: `GET /api/onu/:id/ethernet-ports` • `PATCH /api/onu/:id/ethernet-ports/:portId`
- Authorization
  - `GET /api/authorization/presets` • `GET /api/authorization/presets/default` • `POST /api/authorization/authorize`
- Diagnostics
  - Tickets: `GET /api/tickets` • Eventos: `GET /api/tickets/:id/events` (via tabela `ticket_events`)

## 3) Catálogo de Tabelas (Banco)

Identidade e Acesso
- `users`: id, email, name, role_id, created_at, updated_at
- `roles`: id, code ('admin'|'technician'|'reader'), name

Settings (cadastros mestres)
- `zones`: id, name, created_at, updated_at
- `locations`: id, name, created_at, updated_at
- `vlans`: id, name, vlan_id, created_at
- `speed_profiles`: id, name, down_mbps, up_mbps
- `onu_types`: id, vendor, model
- `authorization_presets`: id, name, description, is_default, created_at
- `authorization_preset_profiles`: id, authorization_preset_id, onu_type_id, service_vlan, line_profile, service_profile, native_vlan, pppoe_enabled, created_at

Inventário de Rede
- `olts`: id, name, vendor, mgmt_ip, tcp_port, telnet_user, telnet_password, snmp_ro_community, snmp_rw_community, snmp_udp_port, iptv_enabled, hw_version, pon_type, zone_id?, location_id?, advanced settings (ex.: show_disabled_onus, onu_description_format, option82, pppoe+, mac limits, thresholds)
- `boards`: id, olt_id, slot_index, name (UNQ: olt_id+slot_index)
- `pon_ports`: id, board_id, pon_index, name (UNQ: board_id+pon_index)
- `uplink_ports`: id, olt_id, if_name, speed, admin_state, description
- `olt_backups`: id, olt_id, created_at, type, line_count, file_ref
- `olt_history`: id, olt_id, created_at, field, old_value, new_value

ONUs e Configuração
- `onus`: id, serial_number (UNQ), olt_id, board_id, pon_port_id, onu_type_id?, status, admin_state, last_known_signal, last_seen_at, service_port?, contact?, location? etc.
- `ethernet_ports`: id, onu_id, port_index, admin_state, speed, description
- `onu_authorizations`: id, onu_id, preset_id, applied_at, status, result
- `onu_events`: id, onu_id, type, message, created_at
- `import_onus_staging` / `import_olts_staging`: staging para importação em massa

Sincronização e Telemetria
- `network_sync_runs`: id, started_at, finished_at, status, stats
- `onu_network_snapshots`: id, olt_id, onu_serial, status, signal_dbm, collected_at (UNQ combinando chaves)
- `network_events`: id, source, type, payload, created_at
- `onu_signal_history`: id, onu_id, rx_dbm, tx_dbm, temperature, collected_at
- `onu_traffic_samples`: id, onu_id, in_bps, out_bps, collected_at
- `network_status_samples`: id, olt_id, cpu, mem, temp, uptime, collected_at

Diagnóstico e Tickets
- `diagnostic_rules`: id, code, name, description, enabled, params
- `diagnostic_tickets`: id, rule_id, entity_type, entity_id, status, created_at, closed_at
- `ticket_events`: id, ticket_id, type, message, created_at

Relações principais (FK)
- `boards.olt_id → olts.id`
- `pon_ports.board_id → boards.id`
- `onus.(olt_id,board_id,pon_port_id) → (olts,boards,pon_ports)`
- `uplink_ports.olt_id → olts.id`
- `authorization_preset_profiles.authorization_preset_id → authorization_presets.id`
- `ethernet_ports.onu_id → onus.id`
- `onu_signal_history.onu_id → onus.id` • `onu_traffic_samples.onu_id → onus.id`
- `onu_network_snapshots.olt_id → olts.id`
- `olt_backups.olt_id → olts.id` • `olt_history.olt_id → olts.id`

Obs.: schema validado via MCP (execute_sql) e migrations em `smartolt/infrastructure/database/migrations/`.

## 4) Mapeamento API ⇄ Tabelas

- OLTs
  - `POST /api/olt` → escreve `olts`
  - `PATCH /api/olt/:id` → atualiza `olts` (+ registra `olt_history`)
  - `GET /api/olt/:id/boards` → lê `boards`; `GET /api/boards/:id/pon-ports` → lê `pon_ports`
  - `GET/POST/DELETE /api/olt/:id/backups[/:backupId]` → `olt_backups`
  - `GET/PATCH /api/olt/:id/uplink-ports[/:portId]` → `uplink_ports`
- ONUs
  - `GET /api/onu` • `/unconfigured` → `onus`, `onu_network_snapshots`
  - `GET /api/onu/:id` → `onus`, `ethernet_ports`, amostras
  - `POST /api/onu/resync|disable` → ação no driver + evento em `onu_events`
  - `PATCH /api/onu/:id` → `onus` (+ possivelmente `ethernet_ports`)
  - `GET /api/onu/:id/signal-history` → `onu_signal_history`
  - `GET /api/onu/:id/traffic` → `onu_traffic_samples`
- Authorization
  - `GET /api/authorization/presets` → `authorization_presets`, `authorization_preset_profiles`
  - `POST /api/authorization/authorize` → executa driver e grava `onu_authorizations`
- Settings
  - `zones`, `vlans`, `speed_profiles`, `onu_types`
- Dashboard
  - Sumários e gráficos → `*_samples`, `network_events`, `onu_network_snapshots`
- Diagnostics
  - `diagnostic_rules`, `diagnostic_tickets`, `ticket_events`

## 5) Procedimentos (Passo a Passo com I.A)

Provisionar Ambiente
- Definir deploy (Render/Cloud Run/VPS) e configurar DNS/TLS
- Exportar segredos: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`
- (Opcional) MCP para automações: `SUPABASE_MCP_TOKEN`
- Aplicar/confirmar migrations no Supabase

Conectividade OLT
- Rota L3 do servidor → `olts.mgmt_ip` (ACL/NAT/Firewall)
- Abrir protocolos: SSH/Telnet (`olts.tcp_port`), SNMP UDP/`olts.snmp_udp_port`
- Cadastrar OLT piloto: `POST /api/olt` (vendor, `mgmt_ip`, SNMP, Telnet/SSH)
- Validar: `GET /api/olt/:id/health` • `GET /api/olt/:id/boards`

Seeds de Settings
- Criar `zones`, `locations` (opcional), `vlans`, `speed_profiles`, `onu_types`
- Criar `authorization_presets` + `authorization_preset_profiles` (VLAN/profile por ONU type)

Descoberta e Telemetria
- Agendar workers/scheduler:
  - Descoberta/sync → `onu_network_snapshots` + `network_events`
  - Telemetria → `onu_signal_history`, `onu_traffic_samples`, `network_status_samples`
- Validar dashboard: `GET /api/dashboard/summary` • `/network-status`

Authorization (piloto)
- `GET /api/authorization/presets` → escolher preset
- `POST /api/authorization/authorize` → aplicar
- Verificar em `onu_authorizations` e `GET /api/onu/:id`

Backups e Uplink
- `POST /api/olt/:id/backups` → gerar e armazenar
- `GET/PATCH /api/olt/:id/uplink-ports` → ajustar admin/speed/descrição

Diagnostics
- Ativar `diagnostic_rules` • monitorar `diagnostic_tickets` • consultar `ticket_events`

## 6) Critérios de Aceite

- Login ok; dashboard com sumários e gráficos
- OLT com saúde OK; boards/PON listam
- ONUs listadas (configuradas e não configuradas); detalhe com sinal/telemetria
- Authorization aplica configuração e registra em banco
- Workers alimentam amostras; dashboards atualizam
- Backups e uplinks operacionais; diagnostics registram tickets

## 7) Checklists Operacionais

Infra
- DNS/TLS ativos • Reverse proxy ok • Logs acessíveis
- Segredos em Secret Manager (não versionar)
- Rota/ACL liberadas para `olts.mgmt_ip`

Banco
- Tabelas-chave: `olts`, `boards`, `pon_ports`, `onus`, `authorization_presets`, `authorization_preset_profiles`, `onu_network_snapshots`, `onu_signal_history`, `onu_traffic_samples`, `network_status_samples`, `uplink_ports`, `olt_backups`, `diagnostic_*`
- RLS conforme política do ambiente

Segurança
- Rotação periódica de chaves (`ANON`, `SERVICE_ROLE`, `JWT_SECRET`)
- SNMP RO/RW por ambiente (evitar reuse)

## 8) Riscos e Observações
- Sem conectividade L3 → drivers não funcionam
- Telemetria → planejar retenção/particionamento
- Vendors diferem → ajustar `VendorOLT` (comandos/parsing) se necessário

## 9) Referências

- Diagramas: `SmartOLTObsidian/MznetOLT diagram.md`, `SmartOLTObsidian/SmartoltLikeApp.md`
- Migrations: `smartolt/infrastructure/database/migrations/`
- Endpoints: `smartolt/backend/src/api/*/routes.ts`
- MCP: `mcp-client/` (inspeção/automação controlada)

## 10) Próximos Passos (Gestor)

- Confirmar ambiente e segredos → subir API/Front
- Validar rota L3 → cadastrar OLT piloto
- Semear Settings → Discovery + Authorization (ciclo completo)
- Ativar workers → confirmar dashboards e relatórios

## Apêndice A — Tabelas de Escrita (Compacto)

zones
- PK: id (bigint identity)
- UNIQUE: name (recomendado)
- NOT NULL: name
- Payload mínimo: { "name": "Zona Centro" }

locations
- PK: id (bigint identity)
- NOT NULL: name
- Payload mínimo: { "name": "POP Matriz" }

vlans
- PK: id (bigint identity)
- NOT NULL: name, vlan_id
- Payload mínimo: { "name": "Cliente", "vlan_id": 120 }

speed_profiles
- PK: id (bigint identity)
- NOT NULL: name, down_mbps, up_mbps
- Payload mínimo: { "name": "300M", "down_mbps": 300, "up_mbps": 150 }

onu_types
- PK: id (bigint identity)
- UNIQUE: (vendor, model)
- NOT NULL: vendor, model
- Payload mínimo: { "vendor": "Huawei", "model": "HG8245H" }

authorization_presets
- PK: id (bigint identity)
- Campos chave: name, is_default?, description?
- Payload mínimo: { "name": "Residencial Padrão", "is_default": true }

authorization_preset_profiles
- PK: id (bigint identity)
- FK: authorization_preset_id → authorization_presets.id
- Campos chave: onu_type_id?, service_vlan?, line_profile?, service_profile?, native_vlan?, pppoe_enabled?
- Payload mínimo: { "authorization_preset_id": 1, "onu_type_id": 2, "service_vlan": "120", "pppoe_enabled": false }

olts
- PK: id (bigint identity)
- UNIQUE: mgmt_ip
- NOT NULL: name, vendor, mgmt_ip, tcp_port (default 2333), snmp_udp_port (default 2161), pon_type ('GPON' default)
- FKs: zone_id?, location_id?
- Campos avançados: telnet_user, telnet_password, snmp_ro_community, snmp_rw_community, hw_version, advanced settings (option82, pppoe+, mac limits, thresholds etc.)
- Payload mínimo: { "name": "OLT-01", "vendor": "<Vendor>", "mgmt_ip": "10.0.0.10", "tcp_port": 2333, "snmp_udp_port": 2161 }

boards
- PK: id (bigint identity)
- FK: olt_id → olts.id
- UNIQUE: (olt_id, slot_index)
- NOT NULL: olt_id, slot_index, name
- Payload mínimo: { "olt_id": 1, "slot_index": 0, "name": "Board 0" }

pon_ports
- PK: id (bigint identity)
- FK: board_id → boards.id
- UNIQUE: (board_id, pon_index)
- NOT NULL: board_id, pon_index, name
- Payload mínimo: { "board_id": 1, "pon_index": 1, "name": "PON 1" }

onus
- PK: id (bigint identity)
- FKs: olt_id → olts.id • board_id → boards.id • pon_port_id → pon_ports.id • onu_type_id? → onu_types.id
- UNIQUE: serial_number
- NOT NULL: serial_number, olt_id, board_id, pon_port_id, status, admin_state
- Payload mínimo: { "serial_number": "FTTX1234ABCD", "olt_id": 1, "board_id": 1, "pon_port_id": 1, "status": "online", "admin_state": "enabled" }

ethernet_ports
- PK: id (bigint identity)
- FK: onu_id → onus.id
- Campos: port_index, admin_state, speed, description
- Payload mínimo: { "onu_id": 10, "port_index": 1, "admin_state": "up" }

uplink_ports
- PK: id (bigint identity)
- FK: olt_id → olts.id
- Campos: if_name, speed, admin_state, description
- Payload mínimo: { "olt_id": 1, "if_name": "gei-1/1/1", "admin_state": "up" }

onu_authorizations
- PK: id (bigint identity)
- FK: onu_id → onus.id • preset_id → authorization_presets.id
- Campos: applied_at, status, result
- Payload mínimo: { "onu_id": 10, "preset_id": 1 }

## Apêndice B — Consultas MCP (on‑demand)

- Listar tabelas públicas (base):
  - node mcp-client/tools_inspect.js  → seção “tables”
- Listar colunas (base):
  - node mcp-client/tools_inspect.js  → seção “columns”
- Exemplo genérico (execute_sql):
  - initialize → tools/call { name: "execute_sql", arguments: { query: "select 1" } }
