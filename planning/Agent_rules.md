# Agent_rules  
  
# AGENT RULES  
  
Este documento define as **regras obrigatórias para qualquer agente de IA que gere código neste repositório**.  
  
O objetivo é garantir:  
  
- consistência arquitetural  
- previsibilidade de comportamento  
- baixo acoplamento  
- decisões explícitas  
- ausência de invenções de estrutura, regra de negócio ou contratos  
  
Este documento deve ser tratado como **regra operacional do repositório**.  
  
---  
  
# 1. SOURCE OF TRUTH  
  
Os arquivos dentro da pasta `/planning` são a **fonte oficial de verdade do projeto**.  
  
Antes de gerar qualquer código, o agente **DEVE ler no mínimo**:  
  
**planning/system_overview.md**  
**planning/feature_map.md**  
**planning/menu_map.md**  
**planning/database_schema.md**  
**planning/network_model.md**  
**planning/coding_rules.md**  
  
Esses arquivos definem:  
  
- arquitetura do sistema  
- modelo de domínio  
- estrutura de features  
- schema do banco  
- regras de código  
- hierarquia de rede  
  
Se algo **não estiver definido nesses arquivos**, o agente:  
  
- **não deve inventar comportamento de negócio**  
- **não deve inventar tabelas**  
- **não deve inventar endpoints**  
  
Quando necessário, o agente pode:  
  
- solicitar clarificação  
- gerar apenas **scaffolding técnico vazio**  
- criar **interfaces ou estruturas neutras**, sem inventar lógica  
  
---  
  
# 2. ESCOPO DE LEITURA  
  
Para reduzir consumo de tokens e evitar análise desnecessária do projeto, o agente deve ler apenas:  
  
- arquivos dentro de `/planning`  
- arquivos diretamente relacionados à tarefa solicitada  
- arquivos da feature sendo modificada  
  
O agente **não deve escanear o repositório inteiro sem necessidade**.  
  
A leitura deve ser **determinística e focada**.  
  
---  
  
# 3. ARQUITETURA DO PROJETO  
  
O projeto utiliza **arquitetura orientada a features**.  
  
Estrutura principal:  
  
**features///**  
  
[Exemplo:](Exemplo:)  
  
**features/onu/list-configured-onus**  
**features/authorization/authorize-onu**  
**features/olt/list-olts**  
  
Cada feature representa **uma unidade isolada de funcionalidade do sistema**.  
  
Features devem ser:  
  
- pequenas  
- previsíveis  
- independentes  
- explicitamente nomeadas  
  
Uma feature deve representar **uma ação clara do sistema**.  
  
---  
  
# 4. ESTRUTURA PADRÃO DE FEATURE  
  
Toda feature deve seguir, preferencialmente, a estrutura abaixo:  
  
**index.ts**  
**types.ts**  
**schema.ts**  
**repository.ts**  
**service.ts**  
**permissions.ts**  
  
Arquivos opcionais:  
  
**command.ts**  
**validator.ts**  
**mapper.ts**  
**driver.ts**  
  
Responsabilidades:  
  
| Arquivo | Responsabilidade |  
|---|---|  
| types.ts | Tipos TypeScript |  
| schema.ts | Schemas de validação |  
| repository.ts | Acesso ao banco |  
| service.ts | Lógica de negócio |  
| permissions.ts | Controle de acesso |  
| command.ts | Mutações |  
| validator.ts | Validação de entrada |  
| mapper.ts | Transformação de dados |  
| driver.ts | Integração com OLT ou dispositivos |  
  
A lógica deve permanecer **dentro da feature**, evitando dependências externas desnecessárias.  
  
---  
  
# 5. PROIBIÇÕES  
  
O agente **nunca deve**:  
  
- inventar tabelas  
- inventar endpoints  
- inventar campos de domínio sem base no planning  
- modificar arquivos em `/planning`  
- acessar banco fora de `repository`  
- acessar OLT fora de `driver`  
- espalhar lógica entre features  
- misturar UI com backend  
- refatorar partes não solicitadas  
- renomear ou mover arquivos sem instrução explícita  
- alterar schema ou contratos sem instrução explícita  
- alterar dependências do projeto sem instrução explícita  
  
Essas regras existem para **preservar estabilidade arquitetural**.  
  
---  
  
# 6. SEPARAÇÃO DE RESPONSABILIDADES  
  
Cada camada tem responsabilidade específica.  
  
**Repository**  
**→ acesso ao banco de dados**  
  
**Service**  
**→ lógica da feature**  
  
**Driver**  
**→ comunicação com OLTs**  
  
**Validator**  
**→ validação de entrada**  
  
**Mapper**  
**→ transformação de dados**  
  
**Permissions**  
**→ controle de acesso da feature**  
  
Diretrizes adicionais:  
  
- **Services nunca acessam banco diretamente**  
- **Repositories nunca executam lógica de negócio**  
- **Drivers nunca manipulam regras de domínio**  
  
---  
  
# 7. ESCOPO DE ESCRITA  
  
O agente deve modificar **apenas os arquivos necessários** para cumprir a tarefa solicitada.  
  
Não deve:  
  
- alterar código fora da feature  
- modificar partes não relacionadas  
- alterar arquitetura existente sem instrução explícita  
  
Mudanças devem ser **localizadas e previsíveis**.  
  
---  
  
# 8. PADRÕES DE QUALIDADE  
  
O código gerado deve:  
  
- ser simples  
- ser previsível  
- ser explicitamente tipado  
- evitar duplicação  
- evitar acoplamento desnecessário  
- manter responsabilidades claras  
  
Evitar:  
  
- lógica implícita  
- funções excessivamente grandes  
- dependências ocultas  
  
---  
  
# 9. SAÍDA ESPERADA DO AGENTE  
  
O agente deve ser **objetivo e focado**.  
  
Evitar:  
  
- explicações longas  
- alternativas paralelas  
- refactors não solicitados  
- código fora do escopo da tarefa  
  
A resposta deve conter apenas:  
  
- código necessário  
- arquivos modificados  
- alterações mínimas requeridas  
  
---  
  
# 10. PRINCÍPIO FUNDAMENTAL  
  
Este projeto segue a regra:  
  
**PLANNING FIRST**  
**CODE SECOND**  
  
Nada de negócio deve ser implementado antes de estar definido em **planning**.  
  
Scaffolding técnico vazio é permitido quando:  
  
- compatível com planning  
- não introduz comportamento implícito  
- não inventa regras de domínio.  
