# System Architecture Diagram

Visão geral da arquitetura do SmartOLT.

## Camadas de Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        Clientes                              │
│                     (Browser, Mobile)                        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS/WebSocket
┌────────────────────────▼────────────────────────────────────┐
│                  Frontend (Next.js)                          │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ App Router + TypeScript + shadcn/ui + Tailwind        │  │
│ │ - Dashboard                                            │  │
│ │ - OLT Management                                       │  │
│ │ - ONU Management                                       │  │
│ │ - Authorization                                        │  │
│ │ - Settings, Reports, Diagnostics                      │  │
│ └────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API / GraphQL
┌────────────────────────▼────────────────────────────────────┐
│               API Gateway / Backend (Node.js)               │
│ ┌────────────────────────────────────────────────────────┐  │
│ │ Features-oriented Architecture                         │  │
│ │ - Auth: JWT, Sessions                                  │  │
│ │ - Features:                                            │  │
│ │   - dashboard/                                         │  │
│ │   - onu/                                               │  │
│ │   - olt/                                               │  │
│ │   - authorization/                                     │  │
│ │   - settings/                                          │  │
│ │   - reports/                                           │  │
│ │   - diagnostics/                                       │  │
│ │ - Drivers: OLT Communication                           │  │
│ │ - Shared: Types, Utils, Errors                         │  │
│ └────────────────────────────────────────────────────────┘  │
└────┬──────────────────┬────────────────────────────────┬───┘
     │                  │                                │
     │ SQL              │ gRPC/HTTP                      │ Job Queue
     │                  │                                │
┌────▼──────────┐  ┌───▼──────────┐          ┌──────────▼──┐
│  PostgreSQL   │  │ OLT Hardware  │          │    Workers   │
│  Database     │  │ (via drivers) │          │ (Node.js)    │
└───────────────┘  └───────────────┘          │ - Telemetry  │
                                              │ - Auto Auth  │
                                              │ - Status     │
                                              └──────────────┘
```

## Componentes

### Frontend Layer
- Next.js com App Router
- TypeScript + shadcn/ui para componentes
- Tailwind para styling
- Hooks customizados para estado
- Integração com API backend

### API Layer
- Node.js + Express/Fastify
- TypeScript com tipos explícitos
- Arquitetura orientada a features
- Middleware de autenticação
- RLS em database level

### Data Layer
- PostgreSQL (relacional)
- RLS (Row Level Security)
- Índices para performance
- Migrações versionadas

### OLT Drivers
- Abstração para comunicação com OLTs
- Suporte a múltiplos fabricantes
- Interface uniforme
- Tratamento de erros

### Workers
- Node.js (TypeScript)
- Job queue (BullMQ ou similar)
- Processamento assíncrono
- Telemetria e monitoring

## Fluxo de Dados

1. **Usuário acessa Frontend**
   - Browser requisita página
   - Next.js renderiza componentes
   - Frontend faz requisição à API

2. **API processa requisição**
   - Valida token JWT
   - Executa RLS policies
   - Chama service apropriado
   - Retorna dados validados

3. **Backend acessa dados**
   - Query em PostgreSQL
   - Aplica transformações
   - Retorna JSON ao frontend

4. **Frontend renderiza resultado**
   - Atualiza UI com dados
   - Mostra feedback ao usuário

5. **Workers processam jobs**
   - Telemetria de OLTs
   - Auto-autorização
   - Refresh de status
   - Executam assincronamente

## Próximas Versões Deste Diagrama

- Detalhamento de cada feature
- Fluxos de autenticação
- Comunicação OLT em detalhe
- Escalabilidade horizontal
