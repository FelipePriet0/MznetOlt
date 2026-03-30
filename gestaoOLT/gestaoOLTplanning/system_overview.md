# System Overview

## Objetivo do Projeto

SmartOLT é um sistema de gestão de rede para Provedores de Internet (ISP), permitindo gerenciamento centralizado de equipamentos OLT (Optical Line Terminal), monitoramento de ONUs (Optical Network Units), autorização de clientes e diagnósticos de rede.

## Módulos Principais

1. **Dashboard**
   - Visão geral do estado da rede
   - Métricas principais e alertas

2. **OLTs (Optical Line Terminals)**
   - Gerenciamento de equipamentos OLT
   - Status e configurações
   - Integrações com drivers de hardware

3. **ONUs (Optical Network Units)**
   - Listagem e gerenciamento de unidades terminais
   - Status de conexão e performance
   - Relacionamento com OLTs

4. **Authorization**
   - Autorização de novos equipamentos
   - Permissões de acesso
   - Validação de segurança

5. **Settings**
   - Configurações gerais do sistema
   - Preferências de usuário
   - Integrações externas

6. **Reports**
   - Relatórios de performance
   - Análise histórica de dados
   - Exportações

7. **Diagnostics**
   - Ferramentas de diagnóstico
   - Testes de conectividade
   - Logs e troubleshooting

## Hierarquia de Rede

```
OLT (Optical Line Terminal)
  ├─ Board
  │   ├─ PON Port
  │   │   ├─ ONU (Optical Network Unit)
  │   │   └─ ONU
  │   └─ PON Port
  └─ Board
```

## Visão de Arquitetura

- **Frontend**: Next.js (App Router) com interface responsiva
- **Backend**: API TypeScript/Node.js com features isoladas
- **Workers**: Jobs assíncronos para telemetria, autorização automática, refresh de status
- **Banco**: PostgreSQL (futuramente via Supabase)
- **Drivers**: Camada de abstração para comunicação com OLTs

## Próximas Fases

1. **Fase 1**: Scaffolding completo (atual)
2. **Fase 2**: Schema do banco e migrações
3. **Fase 3**: Implementação de features por vertical slice
4. **Fase 4**: Autenticação e RLS
5. **Fase 5**: Integração com drivers de OLT
6. **Fase 6**: Workers e jobs assíncronos
