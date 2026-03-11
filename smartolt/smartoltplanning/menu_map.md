# Menu Map

Este arquivo é a **fonte de verdade** sobre estrutura de navegação, telas, features, endpoints e funcionalidades.

## Estrutura de Menu

```
Dashboard
├─ Dashboard Overview
│  └─ Feature: dashboard/overview
│  └─ Route: /dashboard
│
ONUs
├─ ONU List
│  └─ Feature: onu/list-onus
│  └─ Route: /dashboard/onus
│  └─ Endpoint: GET /api/onus
│
├─ ONU Details
│  └─ Feature: onu/onu-details
│  └─ Route: /dashboard/onus/:id
│  └─ Endpoint: GET /api/onus/:id
│
OLTs
├─ OLT List
│  └─ Feature: olt/list-olts
│  └─ Route: /dashboard/olts
│  └─ Endpoint: GET /api/olts
│
├─ OLT Details
│  └─ Feature: olt/olt-details
│  └─ Route: /dashboard/olts/:id
│  └─ Endpoint: GET /api/olts/:id
│
Authorization
├─ Authorization Requests
│  └─ Feature: authorization/auth-requests
│  └─ Route: /dashboard/authorization
│  └─ Endpoint: GET /api/authorization/requests
│
Settings
├─ User Settings
│  └─ Feature: settings/user-settings
│  └─ Route: /dashboard/settings
│  └─ Endpoint: GET/POST /api/settings
│
Reports
├─ Performance Reports
│  └─ Feature: reports/performance-reports
│  └─ Route: /dashboard/reports
│  └─ Endpoint: GET /api/reports
│
Diagnostics
├─ Network Diagnostics
│  └─ Feature: diagnostics/network-diagnostics
│  └─ Route: /dashboard/diagnostics
│  └─ Endpoint: GET /api/diagnostics
```

## Tabelas Relacionadas

| Menu Item | Tabela Principal | Status |
|-----------|------------------|--------|
| Dashboard | N/A | Placeholder |
| ONUs | `onus` | TBD |
| OLTs | `olts` | TBD |
| Authorization | `authorizations` | TBD |
| Settings | `user_settings` | TBD |
| Reports | `reports` | TBD |
| Diagnostics | `diagnostic_logs` | TBD |

## Próximas Atualizações

Este arquivo será detalhado conforme features forem definidas no `feature_map.md`.
