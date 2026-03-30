# Bootstrap Scripts

Guia para bootstrap do projeto Gestao OLTS.

## Pré-requisitos

- Node.js 18+ (18, 19, 20, ou 21 recomendado)
- pnpm 8+ (`npm install -g pnpm`)
- PostgreSQL 14+ (local ou Docker)
- Git

## Setup Inicial (Windows/WSL)

### 1. Clonar Repositório

```bash
git clone <repository-url>
cd smartolt
```

### 2. Instalar Dependências

```bash
# Usando pnpm workspace
pnpm install
```

### 3. Configurar Ambiente

```bash
# Copiar arquivo de exemplo
cp infrastructure/env/.env.example .env.local

# Editar .env.local com suas configurações
# - DATABASE_URL: sua string de conexão PostgreSQL
# - JWT_SECRET: gere uma chave segura
```

### 4. Setup do Banco de Dados

```bash
# Criar banco de dados (quando schema for criado)
createdb mznetolt_dev

# Rodar migrações (quando estiverem prontas)
pnpm db:migrate
```

### 5. Iniciar Desenvolvimento

```bash
# Terminal 1: Frontend
pnpm dev:frontend
# Acessa em http://localhost:3000

# Terminal 2: Backend
pnpm dev:backend
# API em http://localhost:3001

# Terminal 3: Workers
pnpm dev:workers
```

## Scripts Disponíveis

### Root (Monorepo)

```bash
pnpm install          # Instalar todas as dependências
pnpm dev              # Iniciar todos os projetos em paralelo
pnpm dev:frontend     # Apenas frontend
pnpm dev:backend      # Apenas backend
pnpm dev:workers      # Apenas workers
pnpm build            # Build de produção (todos)
pnpm lint             # Lint em todos os projetos
```

### Frontend

```bash
cd frontend
pnpm dev              # Dev server (localhost:3000)
pnpm build            # Build para produção
pnpm lint             # ESLint
pnpm type-check       # TypeScript check
```

### Backend

```bash
cd backend
pnpm dev              # Dev server (localhost:3001)
pnpm build            # Build para produção
pnpm lint             # ESLint
pnpm type-check       # TypeScript check
```

### Workers

```bash
cd workers
pnpm dev              # Dev mode
pnpm build            # Build para produção
pnpm lint             # ESLint
```

## Troubleshooting

### "command not found: pnpm"

```bash
npm install -g pnpm
```

### "PostgreSQL connection refused"

Certifique-se de que PostgreSQL está rodando:

```bash
# WSL/Linux
sudo service postgresql start

# ou via Docker
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

### "pnpm: permission denied"

```bash
chmod +x ~/.pnpm-home/pnpm
# ou
sudo chmod +x /usr/local/bin/pnpm
```

## Estrutura do Monorepo

```
smartolt/
  ├─ frontend/          # Next.js App
  ├─ backend/           # Node.js API
  ├─ workers/           # Job workers
  ├─ planning/          # Documentação
  ├─ infrastructure/    # Scripts e config
  ├─ pnpm-workspace.yaml
  └─ package.json
```

## Próximas Etapas

1. Configurar banco de dados
2. Executar migrações iniciais
3. Gerar tipos TypeScript
4. Iniciar desenvolvimento de features

## Referências

- [pnpm Workspace](https://pnpm.io/workspaces)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Node.js TypeScript](https://www.typescriptlang.org/docs/handbook/nodejs.html)
- [PostgreSQL](https://www.postgresql.org/docs/)
