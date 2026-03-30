# Plano OLT Feature — Progresso

> Baseado nas fotos da pasta `photosolt/` — UX idêntica ao SmartOLT original, UI nossa.

---
## Status Geral

| #   | Feature            | Status      | Rota Frontend                  | Observações                                                                                                                                                                                           |
| --- | ------------------ | ----------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Página inicial OLT | ✅ Concluído | `/olts`                        | Tabela com colunas ID/Nome/IP/Fabricante/Zona/Ação. Botões: Desativar (eye) + Excluir (trash). Botão "Nova OLT" no header                                                                             |
| 2   | Adicionar OLT      | ✅ Concluído | `/olts/new`                    | Página completa (não modal). Campos: Nome, IP, TCP, telnet user/pass, SNMP RO/RW, UDP, IPTV, Fabricante (dropdown), HW Version (dropdown), Tipo PON (radio). Comunidades SNMP geradas automaticamente |
| 3   | Detalhes da OLT    | ✅ Concluído | `/olts/[id]`                   | Tabs: Detalhes / Cartões PON / Portas PON / VLANs / Uplink / Avançado. Detalhes: tabela config esquerda + imagem OLT direita. Botões: Editar / Histórico / Backups                                    |
| 3.1 | Editar OLT         | ✅ Concluído | `/olts/[id]/edit`              | Mesmo formulário de Adicionar, pré-preenchido. Salva via PATCH `/api/olt/:id`                                                                                                                         |
| 3.2 | Histórico          | ✅ Concluído | `/olts/[id]/history`           | Foto: `HISTÓRICO (CTA DETALHESOLT).png`                                                                                                                                                               |
| 3.3 | Backups            | ✅ Concluído | `/olts/[id]/backups`           | Foto: `BACKUPS.png`                                                                                                                                                                                   |
| 4   | Cartões OLT        | ✅ Concluído | Tab `boards` em `/olts/[id]`   | Foto: `CARTOES OLT.png` — já existe tab básica, precisa adequar à foto                                                                                                                                |
| 5   | Uplink             | ✅ Concluído | Tab `uplink` em `/olts/[id]`   | Foto: `UPLINK.png`                                                                                                                                                                                    |
| 5.1 | Mockup Uplink      | ⏳ Pendente  | —                              | Foto: `MOCKUPUPLINK.png`                                                                                                                                                                              |
| 6   | VLANs              | ⏳ Pendente  | `/vlans` (rota separada)       | Foto: `VLAN.png`. Tabela: VLAN + Descrição + Excluir. Tab VLANs já existe em OLT detail, mas precisa rota própria `/vlans`                                                                            |
| 6.1 | Adicionar VLAN     | ⏳ Pendente  | Modal em `/vlans`              | Foto: `ADICIONAR VLAN.png` — já temos modal básico                                                                                                                                                    |
| 7   | Avançado           | ⏳ Pendente  | Tab `advanced` em `/olts/[id]` | Foto: `AVANÇADO.png`                                                                                                                                                                                  |

---

## Infraestrutura Feita

### Backend
- `DELETE /api/olt/:id` — excluir OLT
- `PATCH /api/olt/:id` — editar OLT (aceita todos os novos campos)
- Migration `0022` — novos campos na tabela `olts`:
  - `tcp_port` (INT, default 2333)
  - `telnet_user`, `telnet_password` (TEXT nullable)
  - `snmp_ro_community`, `snmp_rw_community` (TEXT nullable)
  - `snmp_udp_port` (INT, default 2161)
  - `iptv_enabled` (BOOL, default false)
  - `hw_version` (TEXT nullable)
  - `pon_type` (TEXT, default 'GPON')
  - `location_id` e `zone_id` tornados nullable
- `SUPABASE_ANON_KEY` adicionada ao `.env` (necessária para `signInWithPassword`)
- `supabaseAuth` — cliente separado com anon key para auth

### Frontend
- `oltApi.delete()` — método de exclusão
- `OltDetail` type atualizado com todos os novos campos
- `CreateOltInput` type atualizado (campos opcionais)
- Imagens OLT copiadas para `public/olt-images/` (huawei.png, zte.png)

---

## Próximos Passos (em ordem)

1. **3.2 Histórico** — analisar foto `HISTÓRICO (CTA DETALHESOLT).png` -> UX da page /detalhesdaolt/histórico
2. **3.3 Backups** — analisar foto `BACKUPS.png` -> UX da page /detalhesdaolt/backup
3. **4 Cartões OLT** — analisar foto `CARTOES OLT.png`  -> UX da page /detalhesdaolt/backup
4. **5 Uplink + analisar fotos `UPLINK.png -> UX da page /Uplink
5. **5.1** — analisar fotos `MOCKUPUPLINK.pn -> UX da page /uplink/configurar
6. **6 VLANs analisar fotos `VLAN.png ` -> UX da page /vlan (obs: em /vlans 
tabela precisa apenas de coluna de:  VLAN | COLUNA DE DESCRIÇÃO | AÇÃO: EXCLUIR)
7. **6.1** — analisar fotos  `ADICIONAR VLAN.png` -> UX da page /vlan/adicionarvlan 
8. **7 Avançado** — analisar foto `AVANÇADO.png` -> UX da page /avançado

---

## Convenções do Projeto

- Stack: Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui
- Backend: Node.js custom HTTP + Supabase
- Auth: JWT próprio (HS256), token em localStorage (`smartolt_token`)
- Padrão de formulário: página completa centrada, label à esquerda + input à direita (grid 220px / 1fr)
- Padrão de lista: `DataTable` component ou `<table>` direta
- Português BR em toda a UI

---

*Última atualização: 2026-03-26*




Mockup adicionar vlan -> Corrigir
Cartoes OLT -> Corrigir


leia: @planning/menu_map.md.md da linha 631 a linha 867 para você entender os ENDPOINTS. feature,   tuuuudo dessas abas. Ai analise a foto `UPLINK.png para identificra a estrutura UX e aplique a ux    deles, na nossa UI com funcionamento full Stack de tudo 



Contexto do projeto:

  Estamos construindo um clone funcional do SmartOLT (sistema de gerenciamento de rede GPON). As fotos de   referência da UX original estão em photosolt/. O planejamento de endpoints e features está em
  planning/menu_map.md.md linhas 631–867. Nossas migrations estão em
  smartolt/infrastructure/database/migrations/. O backend é Node/Express + Supabase em
  smartolt/backend/src/. O frontend é Next.js em smartolt/frontend/app/(dashboard)/.

  Regra de ouro:
  Para cada aba/página listada abaixo, você deve:
  1. Ler a foto de referência em photosolt/[NOME].png — extrair todas as colunas, CTAs, cards, toggles e   
  textos visíveis
  2. Ler o código atual da página correspondente
  3. Ler os handlers e tipos do backend relevantes
  4. Comparar foto vs implementação atual — listar todas as divergências
  5. Implementar full-stack: migration se precisar de coluna nova → handler backend → tipo frontend → UI — 
  nada fica como stub ou "em breve" sem justificativa explícita
  6. Confirmar cada item antes de avançar para o próximo

  Nunca assuma que está pronto sem comparar item por item com a foto.

  Abas a fechar (em ordem):
  - UPLINK.png → /olts/[id] aba Uplink
  - MOCKUPUPLINK.png → modal "Configurar porta uplink"
  - VLAN.png → aba VLANs (tabela: VLAN | Descrição | Excluir)
  - ADICIONAR VLAN.png → modal Adicionar VLAN
  - AVANÇADO.png → aba Avançado
  - CARTOES OLT.png → aba Cartões OLT
  - HISTÓRICO (CTA DETALHESOLT).png → /olts/[id]/history
  - BACKUPS.png → /olts/[id]/backups

  Padrões do projeto:
  - UI: Tailwind + shadcn, tema dark, badges coloridos (green=Habilitado, red=Abaixo/Erro)
  - Backend: sempre via supabase.from(...), handlers separados por feature, rotas registradas em routes.ts 
  - Migrações: numeradas sequencialmente (0027_...sql), sempre com IF NOT EXISTS
  - Scripts de seed: em smartolt/backend/scripts/*.mjs, usam dotenv + supabase service role

  ---
  Com esse prompt você teria contexto, regras, localização dos arquivos e ordem de execução — zero
  descoberta progressiva.