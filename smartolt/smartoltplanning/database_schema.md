# Database Schema

Este arquivo é a **fonte de verdade** do schema PostgreSQL do projeto.

## Status Atual

Fase de scaffolding - Schema ainda não foi definido.

## Áreas Principais a Serem Modeladas

### Equipamentos
- OLTs (Optical Line Terminals)
- Boards (módulos dentro de OLTs)
- PON Ports (portas PON)
- ONUs (Optical Network Units)

### Usuários e Autorização
- Users
- Roles (Admin, Técnico, Leitor)
- Permissions
- Authorization Requests
- Device Authorization

### Monitoramento e Telemetria
- Device Status
- Performance Metrics
- Event Logs
- Diagnostic Logs
- Alerts

### Configurações
- User Settings
- System Settings
- Integration Settings
- OLT Configurations

## Convenções de Schema

- Usar timestamps com timezone: `created_at timestamp with time zone`
- Usar UUIDs para IDs primários
- Usar soft deletes quando apropriado
- Adicionar `updated_at` em tabelas mutáveis
- Usar RLS (Row Level Security) para controle de acesso
- Usar índices apropriados para performance

## Timeline

1. Fase 2: Design completo do schema
2. Fase 2: Criação de migrações
3. Fase 2+: Evolução conforme features são adicionadas

## Próximos Passos

- Definir tabelas por domínio (olt, onu, authorization, etc)
- Estabelecer relacionamentos
- Definir políticas de RLS
