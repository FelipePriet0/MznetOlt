# Plano para erros do Advisor Supabase

Este documento consolida o status atual, o diagnóstico dos findings do Advisor do Supabase e o plano de correção. Quando for corrigir, peça para a LLM ler e aplicar o que estiver aqui.

## Contexto e status atual

- Remoções de features (/graphs, /diagnostico, /tarefas, /relatorios) concluídas no runtime (código backend/frontend atualizado) sem alterar documentos de planejamento.
- Migrações destrutivas aplicadas exatamente como no repo:
  - `smartolt/infrastructure/database/migrations/0017_drop_graphs_tables.sql`
  - `smartolt/infrastructure/database/migrations/0018_drop_settings_aux_tables.sql`
- Tabelas dropadas e confirmadas ausentes no catálogo: `onu_signal_samples`, `onu_traffic_samples`, `uplink_samples`, `olt_health_samples`, `onu_status_snapshots`, `onu_types`, `speed_profiles`, `odbs`.
- PostgREST: endpoints para as tabelas dropadas retornam PGRST205 (não existem) — OK.
- Dependências (views/policies/triggers/constraints): sem referências remanescentes às tabelas removidas.
- Colunas intencionais em `public.onus` preservadas: `onu_type_id`, `odb_id`, `download_profile`, `upload_profile` (TEXT para perfis). FKs ausentes para `onu_type_id/odb_id` são esperadas (design).

## Findings do Advisor (export)

1) 26x `RLS Disabled in Public` (ERROR)

- Itens “stale” (já resolvidos por DROP; tendem a sumir após refresh do cache):
  - `public.onu_types`, `public.speed_profiles`, `public.odbs`, `public.onu_signal_samples`, `public.onu_traffic_samples`, `public.uplink_samples`, `public.olt_health_samples`, `public.onu_status_snapshots`.

- Itens que requerem decisão/ação:
  - Internas / staging (não devem ser expostas ao cliente):
    - `public.import_onus_staging`, `public.import_olts_staging`, `public.network_events`, `public.network_sync_runs`, `public.onu_network_snapshots`, `public.onu_events`, `public.authorization_presets`, `public.authorization_preset_profiles`.
  - Domínio possivelmente exposto ao cliente (avaliar se o frontend usa PostgREST direto):
    - `public.olts`, `public.onus`, `public.pon_ports`, `public.vlans`, `public.ethernet_ports`, `public.locations`, `public.boards`, `public.zones`, `public.users`, `public.roles`.

2) 1x `Sensitive Columns Exposed` (ERROR)

- `public.import_onus_staging.password` identificado como sensível e exposto sem RLS.

## Ações já aplicadas

- REVOKE imediato para bloquear PostgREST com `anon`/`authenticated` nas tabelas internas/staging:

```sql
REVOKE ALL ON TABLE public.import_onus_staging FROM anon, authenticated;
REVOKE ALL ON TABLE public.import_olts_staging FROM anon, authenticated;
REVOKE ALL ON TABLE public.network_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.network_sync_runs FROM anon, authenticated;
REVOKE ALL ON TABLE public.onu_network_snapshots FROM anon, authenticated;
REVOKE ALL ON TABLE public.onu_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.authorization_presets FROM anon, authenticated;
REVOKE ALL ON TABLE public.authorization_preset_profiles FROM anon, authenticated;
```

- Verificado: chamadas REST a essas tabelas retornam 401 (permission denied) — bloqueio efetivo.

## Plano de correção (para aplicar quando definido com redes/segurança)

Ordem sugerida:

1) Atualizar cache do Studio/PostgREST (findings “stale” de tabelas já dropadas devem desaparecer).

2) Definir política por classe de tabela:

- Internas / staging (bloquear totalmente no cliente):
  - Habilitar RLS e não criar políticas (bloqueio por padrão) e manter REVOKEs:
  ```sql
  alter table public.import_onus_staging enable row level security;
  alter table public.import_olts_staging enable row level security;
  alter table public.network_events enable row level security;
  alter table public.network_sync_runs enable row level security;
  alter table public.onu_network_snapshots enable row level security;
  alter table public.onu_events enable row level security;
  alter table public.authorization_presets enable row level security;
  alter table public.authorization_preset_profiles enable row level security;
  -- (sem policies)
  ```
  - Opcional recomendado: mover as tabelas de staging para um schema privado:
  ```sql
  create schema if not exists internal;
  alter table public.import_onus_staging set schema internal;
  alter table public.import_olts_staging set schema internal;
  revoke usage on schema internal from anon, authenticated;
  ```

- Tabelas possivelmente consumidas pelo cliente via PostgREST (definir exposição mínima):
  - Caso não sejam usadas pelo cliente: mesmo tratamento de bloqueio total (RLS ON sem policies + REVOKE).
  - Caso precisem de leitura por usuários autenticados: aplicar política mínima read-only e só criar políticas de escrita onde comprovadamente necessário.
  ```sql
  -- habilitar RLS
  alter table public.<tabela> enable row level security;

  -- leitura para autenticados
  create policy read_auth on public.<tabela>
    for select
    using (auth.uid() is not null);

  -- escrita (opcional; ajuste conforme necessidade)
  create policy insert_auth on public.<tabela>
    for insert
    with check (auth.uid() is not null);

  create policy update_auth on public.<tabela>
    for update
    using (auth.uid() is not null)
    with check (auth.uid() is not null);

  -- exemplo de refino por claim JWT
  -- using (coalesce(current_setting('request.jwt.claims', true)::jsonb ->> 'role','') = 'authenticated')
  ```

3) Sensíveis (alta prioridade):

- `public.import_onus_staging.password` — manter bloqueado no cliente (RLS ON sem policies + REVOKE) e avaliar:
  - Remover a coluna; ou
  - Hashear/criptografar via `pgcrypto`; ou
  - Mover a tabela para schema privado e acessar apenas por backend (service role / RPC protegida).

4) Sanity checks pós-aplicação:

- REST (anon):
  - Tabelas internas/staging: `401 permission denied`.
  - Tabelas públicas com leitura controlada: `200` apenas autenticado; `401/403` para anon.
- Catálogo SQL:
  - `select * from pg_policies where schemaname='public' and tablename in (...);`
  - `select table_name, row_security from information_schema.tables where table_schema='public';`

5) Boas práticas auxiliares:

- Garantir que a chave `service_role` não é usada no frontend (rotacionar se necessário).
- Para acesso de cliente, preferir policies por coluna/tenant sempre que aplicável.

## Apêndice: blocos SQL prontos

### REVOKE (idempotente; já aplicado)

```sql
REVOKE ALL ON TABLE public.import_onus_staging FROM anon, authenticated;
REVOKE ALL ON TABLE public.import_olts_staging FROM anon, authenticated;
REVOKE ALL ON TABLE public.network_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.network_sync_runs FROM anon, authenticated;
REVOKE ALL ON TABLE public.onu_network_snapshots FROM anon, authenticated;
REVOKE ALL ON TABLE public.onu_events FROM anon, authenticated;
REVOKE ALL ON TABLE public.authorization_presets FROM anon, authenticated;
REVOKE ALL ON TABLE public.authorization_preset_profiles FROM anon, authenticated;
```

### Habilitar RLS (bloqueio total por padrão)

```sql
alter table public.<tabela> enable row level security;
-- sem policies → bloqueia anon/auth pelo PostgREST
```

### Políticas de leitura/escrita para autenticados (templates)

```sql
-- leitura
create policy read_auth on public.<tabela>
  for select
  using (auth.uid() is not null);

-- escrita (ajuste conforme o caso)
create policy insert_auth on public.<tabela>
  for insert
  with check (auth.uid() is not null);

create policy update_auth on public.<tabela>
  for update
  using (auth.uid() is not null)
  with check (auth.uid() is not null);
```

### Mover staging para schema privado

```sql
create schema if not exists internal;
alter table public.import_onus_staging set schema internal;
alter table public.import_olts_staging set schema internal;
revoke usage on schema internal from anon, authenticated;
```

