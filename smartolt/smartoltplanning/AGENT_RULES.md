# Agent Rules

## Princípios Fundamentais

Estes são os princípios que devem guiar qualquer desenvolvimento neste projeto.

### 1. Planning é a Source of Truth

- Sempre ler e consultar os arquivos em `planning/` antes de gerar código
- Nunca inventar detalhes de produtos, tabelas, endpoints ou regras de negócio
- Nunca modificar arquivos de planning sem instrução explícita do usuário
- Quando há dúvida, consultar o planning primeiro

### 2. Implementação por Features

- Sempre implementar por feature, seguindo a estrutura `features/<domínio>/<feature>`
- Cada feature deve ser isolada e autocontida
- Evitar espalhar regra de negócio em pastas genéricas (`services/`, `repositories/`, `libs/`, etc.)
- Comunicação entre features deve ser explícita e mínima

### 3. Arquitetura Orientada a Domínios

- Organizar código por domínio de negócio (dashboard, onu, olt, authorization, settings, reports, diagnostics)
- Cada domínio é independente no máximo possível
- Compartilhar apenas tipos, utilitários e drivers quando absolutamente necessário

### 4. Escalabilidade por Vertical Slices

- O projeto deve estar preparado para crescer por vertical slices completos
- Uma feature completa deve incluir: tipos, schema, repository, service, permissões, comandos
- Isso permite que novas features sejam adicionadas sem afetar features existentes

### 5. Sem Prematuridade

- Não criar abstrações genéricas antes de terem múltiplos casos de uso
- Não implementar padrões sofisticados quando simples é suficiente
- Deixar o design evoluir conforme o projeto cresce

## Estrutura de Feature (Padrão)

Cada feature futura deve seguir este padrão:

```
features/<domínio>/<feature>/
  index.ts                    # Exports públicos
  types.ts                    # Tipos de domínio
  schema.ts                   # Validações (Zod)
  repository.ts               # Acesso a dados
  service.ts                  # Lógica de negócio
  permissions.ts              # RLS e autorização
  command.ts                  # (Opcional) Mutações críticas
  validator.ts                # (Opcional) Validações complexas
  driver.ts                   # (Opcional) Integração com OLT
  mapper.ts                   # (Opcional) Transformação de dados
```

## Padrões de Código

- Manter types explícitos e bem-definidos
- Evitar duplicação de lógica
- Services não devem acessar UI
- Drivers falam apenas com hardware/OLT
- Features não devem depender diretamente de outras sem necessidade real

## Quando Não Seguir Estas Regras

Somente com instrução explícita do usuário.
