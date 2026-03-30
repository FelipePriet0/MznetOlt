
```jsx
   ┌──────────────────────────────────────────────────────────────────────────────┐
│                              SMARTOLT-LIKE APP                              │
└──────────────────────────────────────────────────────────────────────────────┘

                                   USUÁRIO
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND                                   │
│                          Next.js + shadcn/ui + App Router                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ Dashboard │ ONUs │ OLTs │ Authorization │ Settings │ Reports │ Diagnostics  │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                             CAMADA DE APLICAÇÃO                              │
│                    Services / Use Cases / Permissions / Rules                │
├──────────────────────────────────────────────────────────────────────────────┤
│ DashboardService                                                             │
│ OnuService                                                                   │
│ OltService                                                                   │
│ AuthorizationService                                                         │
│ SettingsService                                                              │
│ ReportsService                                                               │
│ DiagnosticsService                                                           │
│ Auth/RBAC Service                                                            │
└──────────────────────────────────────────────────────────────────────────────┘
                         │                         │
                         │                         │
                         ▼                         ▼
        ┌──────────────────────────────┐   ┌──────────────────────────────┐
        │      BANCO DE DADOS          │   │    ENGINE DE INTEGRAÇÃO      │
        │     PostgreSQL / Supabase    │   │         COM A OLT            │
        └──────────────────────────────┘   └──────────────────────────────┘
                         │                         │
                         │                         │
                         ▼                         ▼
┌──────────────────────────────────┐   ┌──────────────────────────────────────┐
│          TABELAS CORE            │   │        REDE / EQUIPAMENTOS           │
├──────────────────────────────────┤   ├──────────────────────────────────────┤
│ users                            │   │ OLT física                           │
│ olts                             │   │ Boards / Cartões                     │
│ olt_boards                       │   │ Portas PON                           │
│ pon_ports                        │   │ Uplinks                              │
│ uplink_ports                     │   │ ONUs                                 │
│ onus                             │   └──────────────────────────────────────┘
│ onu_types                        │
│ speed_profiles                   │
│ zones                            │
│ locations                        │
│ odbs                             │
│ vlans                            │
│ tr069_profiles                   │
│ voip_profiles                    │
│ onu_custom_templates             │
│ onu_authorization_presets        │
│ onu_authorizations               │
│ remote_acls                      │
│ onu_mgmt_ips                     │
│ olt_advanced_settings            │
│ report_tasks                     │
│ report_exports                   │
│ auto_auth_rules                  │
│ auto_auth_tasks                  │
└──────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                            TABELAS DE TELEMETRIA                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ onu_signal_samples                                                          │
│ onu_traffic_samples                                                         │
│ pon_traffic_samples                                                         │
│ uplink_samples                                                              │
│ olt_health_samples                                                          │
└──────────────────────────────────────────────────────────────────────────────┘

════════════════════════════════ FLUXOS PRINCIPAIS ════════════════════════════════

1) DASHBOARD
────────────
UI Dashboard
   │
   ├── GET métricas ONUs online/offline
   ├── GET waiting auth
   ├── GET weak signal
   ├── GET outage pons
   └── GET authorizations per day
   │
   ▼
DashboardService
   │
   ├── lê banco (histórico + agregações)
   ├── lê telemetria
   └── opcionalmente consulta OLT para refresh
   ▼
Banco / Engine OLT

2) FLUXO DE ONUs CONFIGURADAS
─────────────────────────────
Tela ONUs Configuradas
   │
   ├── lista ONUs
   ├── aplica filtros
   ├── paginação
   ├── exportação
   └── abre detalhe da ONU
   ▼
OnuService
   │
   ├── onus
   ├── onu_types
   ├── zones
   ├── odbs
   ├── speed_profiles
   └── sinal/status
   ▼
Banco + Engine OLT

3) FLUXO DE DETALHE DA ONU
──────────────────────────
Tela Detalhe ONU
   │
   ├── informações gerais
   ├── status
   ├── sinal
   ├── tráfego
   ├── VLAN / profile / TR069
   ├── running config
   ├── software info
   └── ações:
   │      reboot
   │      resync
   │      disable
   │      factory reset
   ▼
OnuService
   │
   ├── lê banco para dados persistidos
   ├── chama OLT para status/config real
   └── salva logs / resultados
   ▼
Banco + Engine OLT

4) FLUXO DE ONUs NÃO CONFIGURADAS
─────────────────────────────────
Tela ONUs Não Configuradas
   │
   ├── lista ONUs detectadas
   ├── filtra por OLT
   ├── atualiza descoberta
   ├── abre Authorization
   └── ações automáticas
   ▼
AuthorizationService
   │
   ├── consulta OLT / scan SN
   ├── registra pending/unconfigured
   └── prepara provisionamento
   ▼
Banco + Engine OLT

5) FLUXO DE AUTHORIZATION
─────────────────────────
Tela Authorization
   │
   ├── escolhe preset
   ├── escolhe VLAN
   ├── escolhe speed profile
   ├── bridge/router
   ├── TR069 / VoIP
   └── autoriza ONU
   ▼
AuthorizationService
   │
   ├── lê:
   │    authorization_presets
   │    authorization_preset_profiles
   │    onu_types
   │    speed_profiles
   │    vlans
   │    (Opcional/Futuro) tr069_profiles
   │    (Opcional/Futuro) voip_profiles
   ├── envia comandos para OLT
   └── grava:
   │    onu_authorizations
   ▼
Banco + Engine OLT

6) FLUXO DE OLTs
────────────────
Tela Lista de OLTs
   │
   ├── listar
   ├── exportar
   ├── adicionar
   ├── editar
   └── abrir detalhe
   ▼
OltService
   │
   ├── CRUD olts
   ├── leitura de capacidades
   └── comunicação com OLT
   ▼
Banco + Engine OLT

7) DETALHE DA OLT
─────────────────
Tela Detalhe da OLT
   │
   ├── Detalhes
   ├── Cartões OLT
   ├── Portas PON
   ├── Uplink
   ├── VLANs
   ├── IPs de gerenciamento
   ├── ACLs remotas
   ├── Perfis VoIP
   └── Avançado
   ▼
OltService + SettingsService
   │
   ├── olts
   ├── olt_boards
   ├── pon_ports
   ├── uplink_ports
   ├── vlans
   ├── onu_mgmt_ips
   ├── remote_acls
   ├── voip_profiles
   └── olt_advanced_settings
   ▼
Banco + Engine OLT

8) TELEMETRIA
─────────────
OLT / ONUs
   │
   ├── sinal óptico (ONU)
   ├── tráfego ONU (bps)
   ├── saúde OLT (cpu/mem/temp/uptime)
   └── eventos de rede (quando aplicável)
   ▼
Coletor / Poller / Worker
   │
   ├── grava amostras
   ├── atualiza dashboards
   └── alimenta gráficos
   ▼
onu_signal_history
onu_traffic_samples
network_status_samples

9) SETTINGS
───────────
Settings
   │
   ├── Speed Profiles
   ├── ONU Types
   ├── Zones
   ├── Locations
   ├── VLANs
   ├── (Opcional/Futuro) VoIP Profiles
   ├── (Opcional/Futuro) ACLs
   └── Advanced OLT Settings
   ▼
SettingsService
   │
   ├── mantém cadastros mestres
   ├── abastece Authorization
   ├── abastece filtros
   └── abastece Detalhe ONU / OLT
   ▼
Banco

10) REPORTS
───────────
Reports (Planejado)
   │
   ├── exportações
   ├── relatórios de autorização
   └── importação
   ▼
ReportsService
   │
   ├── lê banco
   └── gera arquivos
   ▼
(Tabelas a definir em fase futura)

11) DIAGNOSTICS
───────────────
Diagnostics
   │
   ├── executa testes
   ├── consulta estado
   ├── registra execuções
   └── mostra histórico
   ▼
DiagnosticsService
   │
   ├── chama OLT
   └── grava resultado
   ▼
diagnostic_rules / diagnostic_tickets / ticket_events

12) AUTOMAÇÕES
──────────────
Ações automáticas (Planejado)
   │
   ├── regras de auto-authorization
   ├── fila de tasks
   ├── pause/resume
   └── histórico
   ▼
Worker de automação
   │
   ├── consome ONUs detectadas
   ├── chama AuthorizationService
   └── registra execução
   ▼
(Tabelas a definir em fase futura)

══════════════════════════════ CONTROLE DE ACESSO ════════════════════════════════

Roles:
- Leitor
- Técnico
- Admin

Fluxo:
Usuário autenticado
   ▼
Auth / RBAC
   ▼
UI habilita ou oculta ações
   ▼
Backend valida permissão
   ▼
Executa leitura / mutação / ação administrativa

══════════════════════════════ RESUMO DO MOTOR REAL ══════════════════════════════

1. O usuário interage com a UI
2. A UI chama serviços da aplicação
3. Os serviços:
   - leem do banco
   - consultam a OLT
   - enviam comandos para a OLT
4. A telemetria é coletada continuamente
5. O banco guarda:
   - configuração
   - histórico
   - telemetria
   - tarefas
   - relatórios
6. O sistema devolve tudo isso em:
   - dashboards
   - tabelas
   - gráficos
   - ações operacionais
```
