# Backend Architecture

Este documento define os padrões oficiais do backend SmartOLT.

Ele deve ser seguido por:
- desenvolvedores
- agentes de código
- futuras refatorações

---

# 1. Feature Based Architecture

Todo código do backend é organizado por feature.

Estrutura:

src/features/<domain>/<feature>/

Exemplo:

features/
  olt/
    get-olt-health/
      repository.ts
      service.ts
      types.ts

---

# 2. Camadas

Cada feature possui 3 camadas principais.

## types.ts

Define apenas tipos.

Nunca contém lógica.

Exemplo:

export type Input = {...}
export type Item = {...}
export type Output = {...}

---

## repository.ts

Responsável por acessar o banco.

Somente repository pode:

- chamar supabase
- executar queries SQL
- acessar tabelas

Repository nunca contém:

- validação de input
- lógica de negócio
- controle de permissão

---

## service.ts

Responsável por:

- validação
- orquestração
- regras simples

Service nunca acessa banco diretamente.

Service sempre chama repository.

Padrão de nome:

execute<FeatureName>()

Exemplo:

// series-related services removidos

---

# 3. Padrão de respostas

## Séries temporais

Padrão descontinuado no momento (feature de gráficos removida).

---

## Snapshot

Retornam estado atual.

Formato:

Output = {
  item: {...} | null
}

Exemplo:

GetOltHealthOutput

---

# 4. Telemetria

Telemetria é armazenada em tabelas específicas.

Padrão descontinuado no momento (feature de gráficos removida).

---

# 5. Regras importantes

Nunca:

- acessar banco fora de repository
- misturar lógica de driver com feature
- criar features fora de src/features
- retornar dados sem tipagem
- criar services que falam com supabase

Sempre:

- usar types.ts
- usar repository.ts
- usar service.ts
