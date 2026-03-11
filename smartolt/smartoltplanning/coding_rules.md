# Coding Rules

Diretrizes técnicas para desenvolvimento no SmartOLT.

## Arquitetura

### 1. Orientada a Features

- Código de negócio deve ficar em `features/<domínio>/<feature>/`
- Cada feature é uma unidade independente
- Features devem ser autodescritivas pelo nome

### 2. Separação por Domínio

- Domínios: dashboard, onu, olt, authorization, settings, reports, diagnostics, auth
- Cada domínio agrupa features relacionadas
- Domínios são blocos autônomos de negócio

### 3. Sem Pastas Genéricas Globais

❌ **Evitar:**
```
src/
  services/
  repositories/
  models/
  utils/
```

✅ **Usar:**
```
src/features/
  olt/list-olts/
    service.ts
    repository.ts
    types.ts
  olt/olt-details/
    service.ts
    repository.ts
```

### 4. Shared Apenas para Verdadeiro Compartilhamento

- `shared/types/` - Tipos primitivos, comuns a múltiplos domínios
- `shared/utils/` - Utilitários puros (helpers, formatters)
- `shared/errors/` - Exceções de negócio comuns
- Nunca colocar lógica de domínio em shared

## Padrões de Código

### 1. Types Explícitos

```typescript
// ✅ Bom: tipos claros
interface OLTDetails {
  id: string;
  ip: string;
  model: string;
  status: 'online' | 'offline' | 'degraded';
}

// ❌ Evitar: tipos implícitos
const getOLT = (id) => {
  return db.query('...');
};
```

### 2. Validação com Zod

```typescript
// ✅ Bom: schema explícito
export const createOLTSchema = z.object({
  ip: z.string().ip(),
  model: z.string(),
});

// ❌ Evitar: validação ad-hoc
if (!data.ip || !data.model) throw new Error('invalid');
```

### 3. Sem Acoplamento entre Features

```typescript
// ❌ Evitar: feature A importando lógica de B
import { getOLTFromB } from '../olt/service';

// ✅ Bom: comunicação via tipos e interfaces
interface IOLTProvider {
  getOLT(id: string): Promise<OLT>;
}
```

### 4. Services Não Acessam UI

- Services devem ser puros e independentes de framework
- Nenhuma dependência de React, Next.js ou similar
- UI deve orquestrar services

### 5. Drivers Falam Apenas com Hardware

- `drivers/olt/` - Interface com OLTs reais
- Abstrair diferenças entre fabricantes
- Retornar tipos padronizados

## Estrutura de Feature Completa

```
features/<domínio>/<feature>/
  index.ts              # Exports públicos
  types.ts              # Interface de domínio
  schema.ts             # Validações Zod
  repository.ts         # Data access
  service.ts            # Lógica de negócio
  permissions.ts        # RLS e autorização
  command.ts            # (Opt) Mutações complexas
  validator.ts          # (Opt) Validações complexas
  driver.ts             # (Opt) Hardware integration
  mapper.ts             # (Opt) Data transformation
```

## Frontend

### 1. Componentes Reutilizáveis em `components/`

```
components/
  ui/                   # shadcn/ui + customizações
  shared/               # Componentes genéricos
  layout/               # Layout estrutural
```

### 2. Hooks em `hooks/`

- Lógica de estado e side effects
- Nomes começam com `use`

### 3. Types em `types/`

```
types/
  domain/               # Tipos de negócio
  api/                  # Tipos de requisição/resposta
  ui/                   # Tipos de UI state
```

### 4. Features em `features/`

Mesmo padrão do backend:
```
features/<domínio>/<feature>/
  page.tsx              # Page component
  components.tsx        # Feature-specific components
  hooks.ts              # Feature-specific hooks
  types.ts              # Feature-specific types
```

## Backend

### 1. Estrutura Base

```
src/
  features/             # Domínios de negócio
  drivers/olt/          # Integração com OLTs
  auth/                 # Autenticação e JWT
  db/                   # Conexão e migrations
  shared/               # Tipos, utils, erros comuns
  index.ts              # Export do servidor
```

### 2. Sem Migrations Ainda

- Placeholder em `db/`
- Schema definido em `planning/database_schema.md`

## Workers

### 1. Estrutura

```
src/
  features/             # Diferentes tipos de jobs
  jobs/                 # Job definitions
  shared/               # Types e utils comuns
```

### 2. Jobs sem Queue Real Ainda

- Placeholders em `jobs/`
- Preparado para BullMQ ou similar no futuro

## Checklist de Qualidade

- [ ] Nenhuma duplicação de código em features diferentes
- [ ] Nenhuma feature depende diretamente de outra
- [ ] Tipos explícitos em todos os interfaces
- [ ] Validação com Zod antes de processar dados
- [ ] Services testáveis (sem dependências framework)
- [ ] Sem console.log em produção
- [ ] Nomes claros e previsíveis
Always follow backend architecture defined in backend/ARCHITECTURE.md
- [ ] Comentários apenas para contexto, não óbvio

## Quando Quebrar Estas Regras

**Nunca**, sem instrução explícita do usuário.
