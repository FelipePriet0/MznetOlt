# Feature Map

Este arquivo é a **fonte de verdade** sobre todas as features do projeto, organizadas por domínio.

## Domínios e Features

### dashboard
- [ ] Dashboard overview
- [ ] Widgets e cards
- [ ] Real-time metrics
- [ ] Alerts and notifications

### onu
- [ ] List ONUs
- [ ] ONU details
- [ ] ONU performance metrics
- [ ] ONU configuration
- [ ] ONU troubleshooting

### olt
- [ ] List OLTs
- [ ] OLT details
- [ ] Board management
- [ ] PON port management
- [ ] OLT status and health
- [ ] OLT configuration

### authorization
- [ ] Authorization requests
- [ ] Auto-authorization rules
- [ ] Authorization history
- [ ] Device whitelist management
- [ ] Manual approval workflow

### settings
- [ ] User preferences
- [ ] System settings
- [ ] Integration settings
- [ ] Notification preferences
- [ ] Theme and language

### reports
- [ ] Performance reports
- [ ] Historical data analysis
- [ ] Export functionality
- [ ] Scheduled reports
- [ ] Custom reports

### diagnostics
- [ ] Network diagnostics
- [ ] Connectivity tests
- [ ] Log viewer
- [ ] Performance analysis
- [ ] Event history

### auth
- [ ] User authentication
- [ ] Session management
- [ ] Token refresh
- [ ] Permission checking
- [ ] Role-based access

## Padrão de Nomeação

```
features/<domínio>/<feature_name>/
```

Exemplo:
- `features/olt/list-olts/`
- `features/onu/onu-details/`
- `features/authorization/auto-rules/`

## Status

- Fase atual: Scaffolding
- Próxima: Feature definition e schema design
