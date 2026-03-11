# System_overview  
  
# SYSTEM OVERVIEW  
  
## 1. Objetivo do Sistema  
  
O **SmartOLT** é um sistema de gestão e provisionamento de rede para provedores de internet (ISP) que operam infraestrutura **GPON**.  
  
O sistema permite que operadores:  
  
- gerenciem equipamentos de rede (OLTs e ONUs)  
- monitorem o estado da rede  
- provisionem novos clientes  
- executem diagnósticos  
- automatizem processos operacionais  
- gerem relatórios de rede  
  
O sistema combina funcionalidades típicas de:  
  
- **NMS (Network Management System)**  
- **Provisioning System**  
- **Network Monitoring Platform**  
  
---  
  
# 2. Papel do Sistema na Rede  
  
O sistema **não é a fonte de verdade da rede física**.  
  
A rede real existe dentro dos equipamentos:  
  
**OLT**  
**ONU**  
**Switches**  
**Backbone**  
  
O sistema atua como camada de:  
  
- **Management Plane**  
- **Control Plane**  
  
Isso significa que ele:  
  
- envia comandos para os equipamentos  
- coleta dados operacionais  
- mantém uma representação lógica da rede  
  
---  
  
# 3. Modelo de Rede GPON  
  
A rede GPON segue uma estrutura hierárquica.   
  
**OLT**  
**└── Board**  
**└── PON Port**  
**└── ONU**  
  
### OLT  
  
Equipamento central da rede óptica.  
  
Responsável por controlar múltiplas ONUs conectadas através de portas PON.  
  
---  
  
### Board  
  
Placa física instalada dentro da OLT.  
  
Cada board contém múltiplas portas PON.  
  
---  
  
### PON Port  
  
Porta óptica que distribui sinal para múltiplas ONUs.  
  
Uma única porta PON pode atender dezenas de ONUs.  
  
---  
  
### ONU  
  
Equipamento instalado no cliente final.  
  
Responsável por converter sinal óptico em rede local (Ethernet/Wi-Fi).  
  
---  
  
# 4. Entidades Principais do Sistema  
  
O sistema modela os seguintes objetos de domínio:  
  
- **OLT**  
- **Board**  
- **PON Port**  
- **ONU**  
- **VLAN**  
- **Speed Profile**  
- **Authorization Preset**  
- **Zone**  
- **Location**  
- **User**  
  
Essas entidades representam a topologia lógica da rede e suas configurações.  
  
---  
  
# 5. Fluxos Operacionais Principais  
  
## 5.1 Descoberta de ONU  
  
Quando uma ONU conecta na rede:  
  
**ONU conecta na fibra**  
**↓**  
**OLT detecta novo serial**  
**↓**  
**ONU aparece como “unconfigured”**  
**↓**  
**Sistema lista a ONU para autorização**  
  
---  
  
## 5.2 Autorização de ONU  
  
Fluxo típico de provisionamento de cliente.  
  
**ONU aparece como não autorizada**  
**↓**  
**Operador abre tela de ONUs detectadas**  
**↓**  
**Operador seleciona preset de autorização**  
**↓**  
**Sistema envia configuração para OLT**  
**↓**  
**OLT registra ONU**  
**↓**  
**ONU passa a operar na rede**  
  
---  
  
# 6. Arquitetura Técnica do Sistema  
  
O sistema é dividido em cinco camadas principais.  
  
---  
  
## Frontend  
  
Interface administrativa utilizada pelos operadores de rede.  
  
Responsável por:  
  
- visualização da topologia  
- execução de ações operacionais  
- configuração de rede  
- monitoramento de estado  
  
---  
  
## Backend API  
  
Camada responsável por:  
  
- lógica de negócio  
- validação de dados  
- controle de acesso  
- orquestração de operações  
  
A API conecta o frontend ao banco de dados e aos drivers de rede.  
  
---  
  
## Database  
  
Banco **PostgreSQL** responsável por armazenar:  
  
- estado lógico da rede  
- histórico de eventos  
- configurações  
- usuários  
- presets  
- relatórios  
  
O banco **não substitui a OLT como fonte de verdade da rede física**.  
  
Ele representa apenas o estado lógico conhecido pelo sistema.  
  
---  
  
## Workers  
  
Processos assíncronos responsáveis por:  
  
- coleta de telemetria  
- sincronização com equipamentos  
- monitoramento de rede  
- automações operacionais  
  
Workers executam tarefas como:  
  
- descoberta de ONUs  
- atualização de status  
- coleta de sinal  
- execução de diagnósticos  
  
---  
  
## OLT Drivers  
  
Camada responsável por comunicação direta com os equipamentos de rede.  
  
Drivers encapsulam diferenças entre fabricantes.  
  
Isso permite que o restante do sistema opere com **uma interface comum**, independentemente do fabricante da OLT.  
  
Exemplo de fabricantes suportados:  
  
**Huawei**  
**ZTE**  
**Fiberhome**  
**VSOL**  
  
Drivers executam comandos como:  
  
**listar ONUs**  
**autorizar ONU**  
**reboot ONU**  
**coletar sinal**  
**listar portas PON**  
  
---  
  
# 7. Sincronização de Dados  
  
O sistema mantém sincronização constante com os equipamentos de rede.  
  
Fluxo típico de atualização:  
  
**OLT**  
**↓**  
**Workers coletam informações**  
**↓**  
**Database é atualizado**  
**↓**  
**Backend API expõe os dados**  
**↓**  
**Frontend apresenta estado da rede**  
  
Isso permite que o sistema mantenha uma visão atualizada da rede.  
  
---  
  
# 8. Estado da Rede  
  
Existem dois tipos de estado no sistema:  
  
**Estado real**  
  
Estado que existe diretamente nos equipamentos de rede.  
  
Esse estado vive dentro das OLTs e ONUs.  
  
**Estado armazenado**  
  
Estado registrado no banco de dados do sistema.  
  
Esse estado representa **a visão conhecida da rede pelo sistema**.  
  
Workers são responsáveis por sincronizar essas duas visões.  
  
Exemplo de divergência possível:  
  
**OLT: ONU offline**  
**Database: ONU online**  
  
Esse tipo de situação pode ocorrer quando há:  
  
- atraso na coleta de telemetria  
- falha de comunicação com a OLT  
- reinicialização de equipamentos  
  
---  
  
# 9. Tipos de Operação  
  
O sistema executa dois tipos principais de operação.  
  
---  
  
## Operações síncronas  
  
Executadas diretamente pelo operador através da interface.  
  
Exemplos:  
  
**autorizar ONU**  
**reboot ONU**  
**configurar VLAN**  
**alterar perfil de velocidade**  
  
---  
  
## Operações assíncronas  
  
Executadas automaticamente por workers em background.  
  
Exemplos:  
  
**descoberta de ONUs**  
**coleta de sinal óptico**  
**atualização de status da rede**  
**sincronização da topologia**  
**execução de diagnósticos**  
  
---  
  
# 10. Estados Operacionais da Rede  
  
O sistema monitora estados operacionais de ONUs como:  
  
**online**  
**offline**  
**los**  
**power-fail**  
**unconfigured**  
**weak-signal**  
  
  
Esses estados permitem diagnóstico e operação da rede.  
  
---  
  
# 11. Arquitetura de Código  
  
O sistema utiliza **arquitetura orientada a features**.  
  
Estrutura principal:  
  
**features//**  
  
**Exemplo: **  
  
**features/onu/list-configured-onus**  
**features/authorization/authorize-onu**  
**features/olt/list-olts**  
  
Cada feature representa uma unidade isolada de funcionalidade.  
  
---  
  
# 12. Relação com os Arquivos de Planning  
  
Este documento descreve **a visão geral do sistema**.  
  
Detalhes específicos estão definidos em:  
  
**feature_map.md**  
**menu_map.md**  
**database_schema.md**  
**network_model.md**  
  
Esses arquivos formam a **source of truth do projeto**.  
