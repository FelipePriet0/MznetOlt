## MZNET OLT

Plataforma para gestão de OLTs/ONUs com authorization, telemetria e diagnósticos.

## Overview
- Objetivo: unificar visibilidade e operação de rede GPON (OLTs/ONUs) com automação segura e auditável.
- Entregáveis principais: Frontend (Next.js), Backend (Node/Express), Banco (PostgreSQL/Supabase), Workers, Drivers de OLT.
- Guia operacional do Gestor (produção): `SmartOLTObsidian/Entregas e Próximos Passos (Gestor de Rotas).md`

## Arquitetura
- Frontend (Next.js App Router, shadcn/ui) → API (Express/JWT) → Banco (Postgres/Supabase) → Workers (telemetria/sync) → Drivers OLT (SSH/Telnet/SNMP).
- Diagramas: `SmartOLTObsidian/MznetOLT diagram.md`, `SmartOLTObsidian/SmartoltLikeApp.md`

## Principais Features
- ONUs: lista/detalhe, status, telemetria (sinal/tráfego), ações (resync/disable), portas Ethernet.
- OLTs: cadastro, boards, PONs, uplinks, backups, settings avançadas.
- Authorization: presets + perfis por tipo de ONU, execução e registro de autorizações.
- Settings: zones, locations, VLANs, speed profiles, onu types.
- Dashboard: resumos e gráficos com amostras históricas.
- Diagnostics: regras, tickets e eventos (observabilidade operacional).

## Tech Stack
- Frontend: Next.js, TypeScript, shadcn/ui.
- Backend: Node.js/Express, JWT próprio.
- Banco: PostgreSQL (Supabase).
- Workers: jobs de telemetria, sync, auto‑authorization (skeleton).
- Integração OLT: drivers Base/Mock/Vendor (SSH/Telnet/SNMP conforme vendor).

## Estrutura do Repositório
- `smartolt/frontend` — App Next.js (UI).
- `smartolt/backend` — API Express (`src/api/*/routes.ts`).
- `smartolt/workers` — Jobs de coleta/automação.
- `smartolt/infrastructure/database/migrations` — Migrações SQL (fonte de schema).
- `SmartOLTObsidian` — Documentação operacional (inclui guia do Gestor).
- `mcp-client` — Cliente MCP para Supabase (inspeção/admin segura).

## Pré‑requisitos
- Node.js 20+
- npm
- Projeto Supabase (Postgres) e chaves de API
- (Opcional) Docker para banco local

## Variáveis de Ambiente (por serviço)
- Comuns: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`
- MCP/Automação (opcional): `MCP_URL`, `SUPABASE_MCP_TOKEN`

## Setup Rápido (local)
1) Banco: aplicar migrações em `smartolt/infrastructure/database/migrations` (via Supabase Studio/CLI)
2) Backend:
- `cd smartolt/backend && npm install && npm run dev`
- Healthcheck: `GET /health`
3) Frontend:
- `cd smartolt/frontend && npm install && npm run dev`
4) Workers (quando necessário):
- `cd smartolt/workers && npm install && npm run dev`

## Banco e Migrações
- Fonte: `smartolt/infrastructure/database/migrations`
- Tabelas‑chave: `olts`, `boards`, `pon_ports`, `onus`, `authorization_presets`, `authorization_preset_profiles`, `onu_network_snapshots`, `onu_signal_history`, `onu_traffic_samples`, `network_status_samples`, `uplink_ports`, `olt_backups`, `diagnostic_*`
- Apêndice operacional (payload mínimo/constraints): ver “Apêndice A” no guia do Gestor.

## Serviços e Comandos
- Backend (dev): `npm run dev`
- Frontend (dev): `npm run dev`
- Workers (dev): `npm run dev`
- Base URL/portas conforme `.env`

## API
- Auth: `POST /api/auth/login`, `GET /api/auth/me` (JWT)
- OLTs/Boards/PON/Uplinks/Backups: rotas em `smartolt/backend/src/api/olt/routes.ts`
- ONUs: lista/status/detalhe/ações/telemetria em `.../api/onu/routes.ts`
- Authorization: presets e execução em `.../api/authorization/routes.ts`
- Settings: zones e VLANs em `.../api/settings/routes.ts`
- Dashboard/Diagnostics: `.../api/dashboard/routes.ts`, `.../api/diagnostics/routes.ts`
- Catálogo completo: `SmartOLTObsidian/Entregas e Próximos Passos (Gestor de Rotas).md`

## Workers e Agendamentos
- Telemetria → `onu_signal_history`, `onu_traffic_samples`, `network_status_samples`
- Descoberta/sync → `onu_network_snapshots`, `network_events`
- Auto‑authorization → skeleton (requer presets e regras)

## Segurança
- Segredos via Secret Manager/Render/Cloud Run (não versionar)
- RLS conforme políticas do ambiente (quando aplicável)
- Rotação periódica: `ANON`, `SERVICE_ROLE`, `JWT_SECRET`

## Observabilidade
- Logs do backend e workers
- Dashboards do front alimentados por `*_samples`

## Deploy (alto nível)
- Ambientes: dev/homolog/prod (domínios e TLS)
- Variáveis por serviço; rotas L3 até as OLTs (ACL/NAT)
- Protocolos para OLTs: SSH/Telnet (`olts.tcp_port`), SNMP UDP/`olts.snmp_udp_port`

## Troubleshooting
- 400/409 em writes → ver payload mínimo e UNIQUE/FKs (apêndice)
- Sem telemetria → checar workers e conectividade OLT
- Auth quebrada → revisar `JWT_SECRET` e fluxo de login

## Roadmap / Limitações
- Reports/Automations/VoIP/ACLs — planejados
- Suporte a vendors adicionais através de `VendorOLT`

## Referências
- Guia do Gestor: `SmartOLTObsidian/Entregas e Próximos Passos (Gestor de Rotas).md`
- Diagramas: `SmartOLTObsidian/MznetOLT diagram.md`, `SmartOLTObsidian/SmartoltLikeApp.md`
- Migrações: `smartolt/infrastructure/database/migrations/`
- MCP client: `mcp-client/`
