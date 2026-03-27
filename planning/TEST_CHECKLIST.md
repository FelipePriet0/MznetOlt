# SmartOLT — Test Checklist
> Gerado em: 2026-03-12
> Cruzamento entre: Menu Map × Backend implementado × Frontend implementado
>
> Legenda:
> - ✅ **Testável agora** — frontend + backend prontos
> - ⚠️ **Frontend OK, backend faltando** — UI existe mas endpoint não retorna dados reais
> - ❌ **Não implementado** — nem frontend nem backend ainda

---

## 0. Autenticação ✅ (Fechado) 

| # | Feature | Rota | Status | O que testar |
|---|---------|------|--------|-------------| 
| 0.1 | Login com credenciais válidas | `/login` | ✅ | Entra com `felipepriet0@hotmail.com` + senha correta → redireciona para `/dashboard` |
| 0.2 | Login com credenciais inválidas | `/login` | ✅ | Email inexistente → mensagem "Invalid email or password." |
| 0.3 | Login com campos vazios | `/login` | ✅ | Submeter form vazio → não envia request |
| 0.4 | Show/hide senha | `/login` | ✅ | Clicar no olho → tipo do input muda de password para text |
| 0.5 | Redirecionar se já logado | `/login` | ✅ | Acessar `/login` com token válido no localStorage → redireciona para `/dashboard` |
| 0.6 | AuthGuard — rota protegida | `/dashboard` | ✅ | Acessar `/dashboard` sem token → redireciona para `/login` | 
| 0.7 | Logout | Sidebar | ✅ | Botão de logout existe no sidebar → limpa token e redireciona |

---

## 1. Dashboard ✅

| # | Feature | Rota | Status | O que testar |
|---|---------|------|--------|-------------|
| 1.1 | Card Total ONUs | `/dashboard` | ✅ | Número carregado do `GET /api/dashboard/summary` |
| 1.2 | Card ONUs Online | `/dashboard` | ✅ | Número de ONUs com status online |
| 1.3 | Card ONUs Offline | `/dashboard` | ✅ | Número de ONUs com status offline |
| 1.4 | Card Não Configuradas | `/dashboard` | ✅ | Número de ONUs unconfigured |
| 1.5 | Barras de qualidade de sinal | `/dashboard` | ✅ | Normal / Weak / Critical com percentuais |
| 1.6 | Card Sync Status | `/dashboard` | ✅ | Última sincronização, status running/idle |
| 1.7 | Feed de eventos recentes | `/dashboard` | ✅ | Lista de eventos com ícone por tipo |
| 1.8 | Botão Refresh | `/dashboard` | ✅ | Clicar → recarrega todos os dados |
| 1.9 | Skeleton loading | `/dashboard` | ✅ | Ao entrar na página → skeletons aparecem enquanto carrega |
| 1.10 | Card aguardando autorização | `/dashboard` | ❌ | Endpoint `GET /dashboard/get_waiting_auth` não implementado |
| 1.11 | Gráfico de estado da rede | `/dashboard` | ❌ | Endpoint de gráficos não implementado |
| 1.12 | Filtro por OLT | `/dashboard` | ❌ | Seletor lateral de OLTs não implementado |
| 1.13 | Gráfico de autorizações por dia | `/dashboard` | ❌ | Endpoint não implementado |
| 1.14 | Tabela de falhas em PON | `/dashboard` | ❌ | Endpoint não implementado |

---

## 2. ONUs — Tela: Lista de ONUs Configuradas 

| # | Feature | Rota | Status | O que testar | 
|---|---------|------|--------|-------------|
| 2.1 | Listagem de ONUs | `/onus` | ✅ | Tabela carrega com dados reais do banco | ✅ 
| 2.2 | Colunas da tabela | `/onus` | ✅ | Serial, status, location (OLT/Board/PON), model, signal dBm, admin state, last seen | 
| 2.3 | Busca por serial | `/onus` | ✅ | Digitar serial + Enter → filtra tabela |
| 2.4 | Botão Search | `/onus` | ✅ | Clicar no botão Search → aplica filtro |
| 2.5 | Filtro por Status | `/onus` | ✅ | Clicar chips All/Online/Offline/Unconfigured/Configured → filtra |
| 2.6 | Contador de filtros ativos | `/onus` | ✅ | Badge numérico no botão Filters quando há filtros ativos |
| 2.7 | Botão Clear filtros | `/onus` | ✅ | Limpa todos os filtros ativos |
| 2.8 | Paginação — próxima página | `/onus` | ✅ | Clicar Next → carrega próxima página |
| 2.9 | Paginação — página anterior | `/onus` | ✅ | Clicar Prev → volta para página anterior |
| 2.10 | Clicar na linha → detalhe | `/onus` | ✅ | Clicar em qualquer linha → navega para `/onus/{id}` |
| 2.11 | Botão Refresh | `/onus` | ✅ | Recarrega lista mantendo filtros |
| 2.12 | Estado vazio | `/onus` | ✅ | Se sem dados → mensagem "No ONUs found" |
| 2.13 | Skeleton loading | `/onus` | ✅ | Skeletons aparecem enquanto carrega |
| 2.14 | Signal colorido | `/onus` | ✅ | Verde >-24 / Amarelo -24 a -27 / Vermelho <-27 dBm |

---

## 3. ONUs — Tela: Detalhe da ONU

| # | Feature | Rota | Status | O que testar |
|---|---------|------|--------|-------------|
| 3.1 | Card Signal Quality | `/onus/{id}` | ✅ | Barra de progresso + badge Good/Weak/Critical |
| 3.2 | Card Network Position | `/onus/{id}` | ✅ | OLT, Board, PON com índices |
| 3.3 | Card Device Information | `/onus/{id}` | ✅ | Vendor, model, serial, admin state |
| 3.4 | Sidebar Status Overview | `/onus/{id}` | ✅ | Status com dot animado + last seen |
| 3.5 | Timestamps | `/onus/{id}` | ✅ | created_at e updated_at formatados |
| 3.6 | Botão voltar | `/onus/{id}` | ✅ | Seta ← → volta para `/onus` |
| 3.7 | Skeleton loading | `/onus/{id}` | ✅ | Skeletons enquanto carrega |
| 3.8 | ONU não encontrada | `/onus/99999` | ✅ | Mensagem de erro + botão Go back |
| 3.9 | Consulta de sinal em tempo real | `/onus/{id}` | ❌ | Endpoint `GET /api/onu/get_onu_status_and_signal/{id}` não implementado |
| 3.10 | Gráfico de sinal histórico | `/onus/{id}` | ❌ | Endpoint de séries de sinal não implementado |
| 3.11 | Gráfico de tráfego | `/onus/{id}` | ❌ | Endpoint de tráfego não implementado |
| 3.12 | Configuração em execução | `/onus/{id}` | ❌ | Endpoint `GET /onu/get_running_config/{id}` não implementado |
| 3.13 | Info de software/firmware | `/onus/{id}` | ❌ | Endpoint não implementado |
| 3.14 | Ações: Reboot / Resync / Disable | `/onus/{id}` | ❌ | Endpoints de ações não implementados |
| 3.15 | Editar dados do cliente | `/onus/{id}` | ❌ | Endpoint de update não implementado |

---

## 4. ONUs — Tela: ONUs Não Configuradas

| # | Feature | Rota | Status | O que testar |
|---|---------|------|--------|-------------|
| 4.1 | Página existe | `/onus/unconfigured` | ❌ | Rota não criada no frontend |
| 4.2 | Listagem de ONUs detectadas | — | ❌ | Endpoint `GET /api/onu?status=unconfigured` (usa o mesmo endpoint) |
| 4.3 | Botão Autorizar ONU inline | — | ❌ | Não implementado na listagem |
| 4.4 | Predefinições de autorização | — | ⚠️ | Existe em `/authorization` mas não vinculado à listagem |

---

## 5. OLTs — Tela: Lista de OLTs

| # | Feature | Rota | Status | O que testar |
|---|---------|------|--------|-------------|
| 5.1 | Listagem de OLTs | `/olts` | ✅ | Tabela carrega OLTs do banco |
| 5.2 | Colunas da tabela | `/olts` | ✅ | Nome + IP, vendor badge, location, zone, data |
| 5.3 | Vendor badge colorido | `/olts` | ✅ | Huawei=vermelho, ZTE=azul, Nokia=roxo, Fiberhome=verde |
| 5.4 | Busca por nome/IP | `/olts` | ✅ | Digitar + Enter ou clicar Search → filtra |
| 5.5 | Botão Clear busca | `/olts` | ✅ | Aparece quando há busca ativa → limpa |
| 5.6 | Botão Refresh | `/olts` | ✅ | Recarrega lista |
| 5.7 | Clicar linha → detalhe | `/olts` | ✅ | Navega para `/olts/{id}` |
| 5.8 | Botão New OLT (admin only) | `/olts` | ✅ | Visível apenas para role admin → abre modal |
| 5.9 | Botão New OLT (não admin) | `/olts` | ✅ | Invisível para role technician/reader |
| 5.10 | Modal criar OLT — campos | `/olts` | ✅ | Name, Vendor, Mgmt IP (obrigatórios), Location ID, Zone ID |
| 5.11 | Modal criar OLT — validação | `/olts` | ✅ | Submeter com campos obrigatórios vazios → erro |
| 5.12 | Modal criar OLT — sucesso | `/olts` | ✅ | OLT criada → modal fecha, lista atualiza |
| 5.13 | Modal fechar com X | `/olts` | ✅ | Clicar X ou backdrop → fecha modal |
| 5.14 | Skeleton loading | `/olts` | ✅ | Skeletons enquanto carrega |
| 5.15 | Estado vazio | `/olts` | ✅ | Mensagem "No OLTs registered yet" |

---

## 6. OLTs — Tela: Detalhe da OLT

| # | Feature | Rota | Status | O que testar |
|---|---------|------|--------|-------------|
| 6.1 | Card Device Information | `/olts/{id}` | ✅ | Nome, IP, vendor, location, zone, timestamps |
| 6.2 | Health card — CPU | `/olts/{id}` | ✅ | Valor % + barra colorida (verde/amarelo/vermelho) |
| 6.3 | Health card — Memory | `/olts/{id}` | ✅ | Valor % + barra colorida |
| 6.4 | Health card — Temperature | `/olts/{id}` | ✅ | Valor °C + barra |
| 6.5 | Health card — Fan | `/olts/{id}` | ✅ | Status do fan (normal/warning/critical) |
| 6.6 | Sidebar System Status | `/olts/{id}` | ✅ | Badges de status por métrica |
| 6.7 | Timestamps sidebar | `/olts/{id}` | ✅ | created_at, updated_at, health collected_at |
| 6.8 | Sem dados de health | `/olts/{id}` | ✅ | Mensagem "No health data available yet" |
| 6.9 | Botão voltar | `/olts/{id}` | ✅ | Volta para `/olts` |
| 6.10 | Botão Refresh | `/olts/{id}` | ✅ | Recarrega detail + health |
| 6.11 | OLT não encontrada | `/olts/99999` | ✅ | Mensagem erro + Go back |
| 6.12 | Skeleton loading | `/olts/{id}` | ✅ | Skeletons enquanto carrega |
| 6.13 | Aba Boards/Cartões | `/olts/{id}` | ❌ | Endpoint `GET /olt/get_boards/{id}` não implementado |
| 6.14 | Aba Portas PON | `/olts/{id}` | ❌ | Endpoint `GET /olt/get_pon_ports/{id}` não implementado |
| 6.15 | Aba Uplink | `/olts/{id}` | ❌ | Endpoint de uplinks não implementado |
| 6.16 | Aba VLANs | `/olts/{id}` | ❌ | Endpoint de VLANs não implementado |
| 6.17 | Aba IPs de gerência | `/olts/{id}` | ❌ | Endpoint não implementado |
| 6.18 | Editar OLT | `/olts/{id}` | ❌ | Endpoint `PUT /api/olt/{id}` não implementado |
| 6.19 | Histórico / Backups | `/olts/{id}` | ❌ | Endpoints não implementados |

---

## 7. Authorization

| # | Feature | Rota | Status | O que testar |
|---|---------|------|--------|-------------|
| 7.1 | Listar presets | `/authorization` | ✅ | Cards de presets carregam do banco |
| 7.2 | Banner preset padrão | `/authorization` | ✅ | Destaque com ⭐ do preset marcado como default |
| 7.3 | Selecionar preset | `/authorization` | ✅ | Clicar no card → borda azul + "Selected preset" |
| 7.4 | Deselecionar preset | `/authorization` | ✅ | Clicar novamente no mesmo card → deseleciona |
| 7.5 | Badge Active/Inactive | `/authorization` | ✅ | Verde para ativo, cinza para inativo |
| 7.6 | Preset inativo — não clicável | `/authorization` | ✅ | Opacidade 50% + `pointer-events-none` |
| 7.7 | Busca de presets | `/authorization` | ✅ | Digitar + Enter → filtra presets |
| 7.8 | Botão Clear busca | `/authorization` | ✅ | Aparece quando busca ativa → limpa |
| 7.9 | Skeleton loading presets | `/authorization` | ✅ | Skeletons enquanto carrega |
| 7.10 | Sem presets | `/authorization` | ✅ | Mensagem "No authorization presets found" |
| 7.11 | Painel autorizar — ONU ID inválido | `/authorization` | ✅ | ID vazio ou não-numérico → erro de validação |
| 7.12 | Autorizar ONU sem preset | `/authorization` | ✅ | Usa preset padrão automaticamente |
| 7.13 | Autorizar ONU com preset selecionado | `/authorization` | ✅ | Preset aparece destacado no painel |
| 7.14 | Resultado de sucesso | `/authorization` | ✅ | Banner verde + "Authorization successful!" + Event ID |
| 7.15 | Resultado de falha | `/authorization` | ✅ | Banner vermelho com mensagem de erro |
| 7.16 | Botão Reset | `/authorization` | ✅ | Aparece após resultado → limpa form |
| 7.17 | Botão Refresh | `/authorization` | ✅ | Recarrega lista de presets |
| 7.18 | Instruções de uso | `/authorization` | ✅ | Card com 4 passos visível na sidebar |

---

## 8. Settings

| # | Feature | Rota | Status | O que testar |
|---|---------|------|--------|-------------|
| 8.1 | Listar Zones | `/settings` | ✅ | Coluna Zones carrega zonas do banco |
| 8.2 | Listar ONU Types | `/settings` | ✅ | Coluna ONU Types carrega tipos |
| 8.3 | Listar Speed Profiles | `/settings` | ✅ | Coluna Speed Profiles carrega perfis |
| 8.4 | Dot de vendor em ONU Types | `/settings` | ✅ | Cor por vendor (Huawei/ZTE/Nokia/Fiberhome) |
| 8.5 | Barra Download/Upload | `/settings` | ✅ | Gradiente azul→roxo, proporção DL/UL |
| 8.6 | Badge Gig+ | `/settings` | ✅ | Aparece em perfis com download ≥ 1000 Mbps |
| 8.7 | Formatação Gbps | `/settings` | ✅ | 1000 Mbps → exibe "1 Gbps" |
| 8.8 | Badge de contagem | `/settings` | ✅ | Número de items no header de cada seção |
| 8.9 | Summary row | `/settings` | ✅ | Linha final com contagem de Zones, ONU Types, Speed Profiles |
| 8.10 | Skeleton loading | `/settings` | ✅ | Skeletons por seção enquanto carrega |
| 8.11 | Estado vazio por seção | `/settings` | ✅ | Mensagem de vazio por coluna individualmente |
| 8.12 | Botão Refresh all | `/settings` | ✅ | Recarrega as 3 seções |
| 8.13 | Criar/Editar/Excluir zona | `/settings` | ❌ | Endpoints CRUD de zonas não implementados |
| 8.14 | Criar/Editar/Excluir tipo ONU | `/settings` | ❌ | Endpoints CRUD não implementados |
| 8.15 | Criar/Editar/Excluir speed profile | `/settings` | ❌ | Endpoints CRUD não implementados |
| 8.16 | Tela Locations | `/settings/locations` | ❌ | Página e endpoint não implementados |
| 8.17 | Tela ODBs | `/settings/odbs` | ❌ | Página e endpoint não implementados |
| 8.18 | Tela General/Billing | `/settings/billing` | ❌ | Página e endpoint não implementados |

---

## 9. Módulos não implementados (fora de escopo atual)

| Módulo | Status |
|--------|--------|
| Traffic (gráficos de tráfego por ONU/PON) | ❌ |
| Signal (gráficos de sinal histórico) | ❌ |
| Uplink (erros e octets por uplink) | ❌ |
| Diagnostics (ferramentas + histórico) | ❌ |
| Reports (tasks, autorizações, export, import) | ❌ |
| System (utilitários administrativos) | ❌ |
| ONUs Não Configuradas (página separada) | ❌ |

---

## Resumo por prioridade de teste

### 🔴 Testar agora (tudo implementado)
1. Login / Logout / AuthGuard
2. Dashboard — 8 features ativas
3. ONUs lista — 14 features ativas
4. ONU detalhe — 8 features ativas
5. OLTs lista — 15 features ativas (incluindo modal criação)
6. OLT detalhe — 12 features ativas
7. Authorization — 18 features ativas
8. Settings — 12 features ativas

**Total testável agora: ~100 checks**

### 🟡 Implementar na Fase 3
- CRUD completo em Settings (zones, onu types, speed profiles)
- ONUs não configuradas + autorização inline
- Editar OLT
- Logout funcional no sidebar

### 🔵 Implementar na Fase 4+
- Gráficos (signal, traffic, uplink, dashboard)
- Abas da OLT (boards, PON, uplink, VLANs)
- Diagnósticos, Reports, Traffic, Signal
