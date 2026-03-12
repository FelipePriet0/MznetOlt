# PHASE 2 — Frontend Connection to API
> **Fonte única da verdade para o Agent Code.**
> Ao iniciar qualquer sessão na Fase 2, leia APENAS este arquivo. Ele contém estado atual, arquitetura, e tarefas com status explícito. Não precisa ler código.

---

## Estado atual do Frontend (pré-Fase 2)

| Item | Estado |
|---|---|
| Framework | Next.js 14 App Router |
| Estilização | Tailwind CSS + shadcn-compat (class-variance-authority) |
| Componentes existentes | `Sidebar`, `Button`, `Card` |
| Páginas existentes | Somente `/dashboard` (placeholder estático, sem API) |
| Auth | ❌ Nenhuma — sem login, sem contexto, sem token |
| API client | ❌ Nenhum — zero chamadas HTTP em todo o frontend |
| State management | ❌ Nenhum — zero contextos/stores |

---

## Estrutura de pastas alvo (a criar)

```
frontend/
├── app/
│   ├── login/
│   │   └── page.tsx                  ← tela de login
│   ├── (dashboard)/
│   │   ├── layout.tsx                ← já existe, adicionar AuthGuard
│   │   ├── dashboard/
│   │   │   └── page.tsx              ← já existe, conectar à API
│   │   ├── onus/
│   │   │   ├── page.tsx              ← lista de ONUs
│   │   │   └── [id]/
│   │   │       └── page.tsx          ← detalhe da ONU
│   │   ├── olts/
│   │   │   ├── page.tsx              ← lista de OLTs
│   │   │   └── [id]/
│   │   │       └── page.tsx          ← detalhe da OLT
│   │   ├── authorization/
│   │   │   └── page.tsx              ← presets + autorizar ONU
│   │   └── settings/
│   │       └── page.tsx              ← zonas, tipos ONU, speed profiles
├── lib/
│   ├── api/
│   │   ├── client.ts                 ← fetch wrapper tipado
│   │   ├── auth.ts                   ← login, me
│   │   ├── dashboard.ts              ← summary, signal-stats, recent-events
│   │   ├── olt.ts                    ← list, create, detail, health
│   │   ├── onu.ts                    ← list, detail
│   │   ├── authorization.ts          ← presets, default, authorize
│   │   └── settings.ts              ← zones, onu-types, speed-profiles
│   └── auth/
│       └── context.tsx               ← AuthContext + AuthProvider
├── hooks/
│   ├── use-auth.ts                   ← useAuth() hook
│   └── use-api.ts                    ← useApi() hook genérico
└── components/
    ├── layout/
    │   ├── sidebar.tsx               ← já existe
    │   └── auth-guard.tsx            ← redireciona para /login se sem token
    └── shared/
        ├── button.tsx                ← já existe
        ├── card.tsx                  ← já existe
        ├── data-table.tsx            ← tabela reutilizável
        ├── status-badge.tsx          ← badge de status de ONU (online/offline/etc)
        └── loading-skeleton.tsx     ← estado de carregamento
```

---

## Decisões de Arquitetura (fixas — não re-discutir)

### 1. API Base URL
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```
Variável de ambiente no `frontend/.env.local`. O `client.ts` lê ela.

### 2. Auth (JWT)
- Token armazenado em `localStorage` key `smartolt_token`
- `AuthContext` expõe: `{ user, token, login(), logout(), isLoading }`
- `AuthGuard` no layout `(dashboard)` redireciona para `/login` se sem token
- `login` page redireciona para `/dashboard` após token salvo

### 3. HTTP Client (`lib/api/client.ts`)
```typescript
// Padrão de todas as funções de API:
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T>
// - injeta Authorization: Bearer <token> automaticamente
// - lança ApiError com { status, message } em caso de erro HTTP
// - base URL = process.env.NEXT_PUBLIC_API_URL
```

### 4. Data Fetching
- Páginas simples (lista, dashboard): `useEffect` + `useState` (Client Component)
- Não usar Server Components para dados autenticados (JWT está no browser)
- Pattern: `const { data, loading, error } = useApi(() => api.onu.list(filters))`

### 5. Sem bibliotecas extras
- Sem axios, sem React Query, sem Zustand — apenas `fetch` nativo + React Context
- Motivo: npm registry bloqueado (403). Usar apenas o que já está instalado.

---

## Mapeamento: Endpoint → Página Frontend

| Endpoint Backend | Página / Componente | Status |
|---|---|---|
| `POST /api/auth/login` | `app/login/page.tsx` | ✅ |
| `GET /api/auth/me` | `lib/auth/context.tsx` (bootstrap) | ✅ |
| `GET /api/dashboard/summary` | `app/(dashboard)/dashboard/page.tsx` | ✅ |
| `GET /api/dashboard/onu-signal-stats` | `app/(dashboard)/dashboard/page.tsx` | ✅ |
| `GET /api/dashboard/recent-events` | `app/(dashboard)/dashboard/page.tsx` | ✅ |
| `GET /api/dashboard/sync-status` | `app/(dashboard)/dashboard/page.tsx` | ✅ |
| `GET /api/onu` | `app/(dashboard)/onus/page.tsx` | ✅ |
| `GET /api/onu/:id` | `app/(dashboard)/onus/[id]/page.tsx` | ✅ |
| `GET /api/olt` | `app/(dashboard)/olts/page.tsx` | ✅ |
| `POST /api/olt` | `app/(dashboard)/olts/page.tsx` (modal) | ✅ |
| `GET /api/olt/:id` | `app/(dashboard)/olts/[id]/page.tsx` | ✅ |
| `GET /api/olt/:id/health` | `app/(dashboard)/olts/[id]/page.tsx` | ✅ |
| `GET /api/authorization/presets` | `app/(dashboard)/authorization/page.tsx` | ✅ |
| `GET /api/authorization/presets/default` | `app/(dashboard)/authorization/page.tsx` | ✅ |
| `POST /api/authorization/authorize` | `app/(dashboard)/authorization/page.tsx` | ✅ |
| `GET /api/settings/zones` | `app/(dashboard)/settings/page.tsx` | ✅ |
| `GET /api/settings/onu-types` | `app/(dashboard)/settings/page.tsx` | ✅ |
| `GET /api/settings/speed-profiles` | `app/(dashboard)/settings/page.tsx` | ✅ |

---

## Checklist de Tarefas (com status)

> Legenda: ⬜ não iniciado · 🔄 em progresso · ✅ concluído · ❌ bloqueado

### Fundação (fazer primeiro — tudo depende disto)

| # | Tarefa | Arquivo | Status |
|---|---|---|---|
| F1 | Criar `.env.local` com `NEXT_PUBLIC_API_URL` | `frontend/.env.local` | ✅ |
| F2 | Criar API client tipado | `frontend/lib/api/client.ts` | ✅ |
| F3 | Criar funções de auth API | `frontend/lib/api/auth.ts` | ✅ |
| F4 | Criar AuthContext + AuthProvider | `frontend/lib/auth/context.tsx` | ✅ |
| F5 | Criar hook `useAuth` | `frontend/hooks/use-auth.ts` | ✅ |
| F6 | Criar hook `useApi` genérico | `frontend/hooks/use-api.ts` | ✅ |
| F7 | Criar `AuthGuard` component | `frontend/components/layout/auth-guard.tsx` | ✅ |
| F8 | Atualizar `app/layout.tsx` com `AuthProvider` | `frontend/app/layout.tsx` | ✅ |
| F9 | Atualizar `(dashboard)/layout.tsx` com `AuthGuard` | `frontend/app/(dashboard)/layout.tsx` | ✅ |

### Módulos API (criar após F1-F2)

| # | Tarefa | Arquivo | Status |
|---|---|---|---|
| A1 | Funções de dashboard | `frontend/lib/api/dashboard.ts` | ✅ |
| A2 | Funções de ONU | `frontend/lib/api/onu.ts` | ✅ |
| A3 | Funções de OLT | `frontend/lib/api/olt.ts` | ✅ |
| A4 | Funções de authorization | `frontend/lib/api/authorization.ts` | ✅ |
| A5 | Funções de settings | `frontend/lib/api/settings.ts` | ✅ |

### Componentes compartilhados

| # | Tarefa | Arquivo | Status |
|---|---|---|---|
| C1 | Tabela genérica reutilizável | `frontend/components/shared/data-table.tsx` | ✅ |
| C2 | Badge de status de ONU | `frontend/components/shared/status-badge.tsx` | ✅ |
| C3 | Skeleton de carregamento | `frontend/components/shared/skeleton.tsx` | ✅ |

### Páginas

| # | Tarefa | Arquivo | Endpoints usados | Status |
|---|---|---|---|---|
| P1 | Login page | `app/login/page.tsx` | `POST /api/auth/login` | ✅ |
| P2 | Dashboard conectado | `app/(dashboard)/dashboard/page.tsx` | summary, signal-stats, recent-events | ✅ |
| P3 | Lista de ONUs | `app/(dashboard)/onus/page.tsx` | `GET /api/onu` | ✅ |
| P4 | Detalhe da ONU | `app/(dashboard)/onus/[id]/page.tsx` | `GET /api/onu/:id` | ✅ |
| P5 | Lista de OLTs | `app/(dashboard)/olts/page.tsx` | `GET /api/olt`, `POST /api/olt` | ✅ |
| P6 | Detalhe da OLT | `app/(dashboard)/olts/[id]/page.tsx` | `GET /api/olt/:id`, `GET /api/olt/:id/health` | ✅ |
| P7 | Authorization | `app/(dashboard)/authorization/page.tsx` | presets, default, authorize | ✅ |
| P8 | Settings | `app/(dashboard)/settings/page.tsx` | zones, onu-types, speed-profiles | ✅ |

---

## Tipos TypeScript dos Responses de API

> Copiar estes tipos direto em `lib/api/*.ts` — não importar do backend.

### Auth
```typescript
type LoginResponse = { token: string; user: { id: number; name: string; email: string; role_code: string } }
type MeResponse = { id: number; name: string; email: string; role_code: string }
```

### Dashboard
```typescript
type DashboardSummary = { total_onus: number; online_onus: number; offline_onus: number; unconfigured_onus: number; configured_onus: number }
type SignalStatsResponse = { warning_count: number; critical_count: number; normal_count: number }
type RecentEventsResponse = { items: Array<{ id: number; type: string; description: string; created_at: string }> }
```

### ONU
```typescript
type OnuListResponse = { items: OnuItem[]; total: number; page: number; page_size: number }
type OnuItem = { id: number; serial_number: string; status: string; admin_state: string; olt_id: number; board_id: number; pon_port_id: number }
type OnuDetail = OnuItem & { created_at: string; updated_at: string }
```

### OLT
```typescript
type OltListResponse = { items: OltItem[]; total: number; page: number; page_size: number }
type OltItem = { id: number; name: string; vendor: string; model: string; mgmt_ip: string; status: string }
type OltDetail = OltItem & { location_id: number; zone_id: number; created_at: string }
type OltHealth = { cpu_usage: number; memory_usage: number; temperature: number; fan_status: string; collected_at: string }
```

### Authorization
```typescript
type AuthorizationPreset = { id: number; name: string; description: string | null; is_default: boolean; is_active: boolean }
type AuthorizationPresetsResponse = { items: AuthorizationPreset[]; total: number; page: number; page_size: number }
type AuthorizeOnuResponse = { success: boolean; event_id: number | null }
```

### Settings
```typescript
type ZonesResponse = { items: Array<{ id: number; name: string; created_at: string }> }
type OnuTypesResponse = { items: Array<{ id: number; name: string; vendor: string; created_at: string }> }
type SpeedProfilesResponse = { items: Array<{ id: number; name: string; download_mbps: number; upload_mbps: number }> }
```

---

## Ordem de execução recomendada

```
Sessão 1: F1 → F2 → F3 → F4 → F5 → F6 → F7 → F8 → F9 → A1-A5 → P1
          (fundação completa + login funcionando)

Sessão 2: C1 → C2 → C3 → P2 → P3
          (dashboard real + lista de ONUs)

Sessão 3: P4 → P5 → P6
          (detalhe ONU + OLTs)

Sessão 4: P7 → P8
          (authorization + settings)
```

---

## Instrução para Agent Code

Ao iniciar uma sessão de Fase 2:
1. Leia este arquivo: `planning/PHASE2.md`
2. Identifique as tarefas com status `⬜` mais próximas do topo
3. Comece pela primeira tarefa pendente da seção "Fundação"
4. Ao concluir cada tarefa, atualize o status para `✅` neste arquivo
5. Se encontrar bloqueio, marque `❌` e descreva o problema no campo Status
6. **Nunca invente tipos ou endpoints** — use apenas o que está documentado neste arquivo

---

*Última atualização: 2026-03-11 — ✅ FASE 2 COMPLETA. Todos os 18 endpoints conectados. Próximo: Fase 3 (Testes) + Fase 4 (Dados Reais)*
