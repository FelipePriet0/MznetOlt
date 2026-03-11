# feature_map   
  
# FEATURE MAP  
  
Este documento lista **todas as funcionalidades do sistema**, organizadas por **domínio de negócio**.  
  
Cada funcionalidade do sistema é representada como uma **feature isolada**, seguindo arquitetura **feature-oriented**.  
  
Estrutura padrão:  
  
**features//**  
  
[Exemplo:](Exemplo:)  
  
**features/onu/list-configured-onus**  
**features/authorization/authorize-onu**  
**features/olt/list-olts**  
  
Cada feature representa **uma unidade funcional clara do sistema**.  
  
Uma feature normalmente corresponde a:  
  
- uma operação da interface  
- um endpoint da API  
- uma ação operacional na rede  
- uma consulta ao banco  
- uma automação de provisionamento  
  
---  
  
# REGRAS DE ORGANIZAÇÃO  
  
As features devem obedecer às seguintes regras:  
  
1. Cada feature deve representar **uma ação específica e isolada**  
2. Features devem possuir **nomes explícitos**  
3. Evitar features genéricas como:  
  
**process-onu**  
**handle-olt**  
**manage-network**  
  
4. Preferir verbos claros:  
  
**list**  
**get**  
**create**  
**update**  
**delete**  
**authorize**  
**reboot**  
**sync**  
**configure**  
  
5. Cada feature deve ter **responsabilidade única**.  
  
---  
  
# DOMÍNIOS DO SISTEMA  
  
Os domínios representam **grupos de funcionalidades relacionadas** dentro do sistema.  
  
Domínios atuais:  
  
- Dashboard  
- ONU  
- Authorization  
- OLT  
- Reports  
- Diagnostics  
- Settings  
  
---  
  
# DASHBOARD DOMAIN  
  
O domínio **Dashboard** fornece métricas operacionais e visão geral da rede.  
  
Essas features normalmente são **consultas agregadas** que alimentam gráficos, indicadores e painéis.  
  
Features:  
  
**features/dashboard/get-network-kpis**  
**features/dashboard/get-online-onus**  
**features/dashboard/get-offline-onus**  
**features/dashboard/get-weak-signal-onus**  
**features/dashboard/get-authorization-stats**  
  
---  
  
# ONU DOMAIN  
  
O domínio **ONU** concentra operações relacionadas aos dispositivos do cliente final.  
  
Inclui:  
  
- monitoramento  
- telemetria  
- controle operacional  
- ações administrativas  
  
Features:  
  
**features/onu/list-configured-onus**  
**features/onu/get-onu-details**  
**features/onu/get-onu-status**  
**features/onu/get-onu-signal-history**  
**features/onu/get-onu-traffic-history**  
**features/onu/reboot-onu**  
**features/onu/resync-onu**  
**features/onu/disable-onu**  
**features/onu/factory-reset-onu**  
  
Essas features interagem com:  
  
- banco de dados  
- drivers de OLT  
- workers de monitoramento  
  
---  
  
# AUTHORIZATION DOMAIN  
  
O domínio **Authorization** controla o processo de **provisionamento de novas ONUs**.  
  
Fluxo típico:  
  
**ONU detectada pela OLT**  
**↓**  
**Sistema lista ONU como “unconfigured”**  
**↓**  
**Operador seleciona preset**  
**↓**  
**Sistema envia configuração para OLT**  
**↓**  
**ONU passa a operar na rede**  
  
Features:

**features/authorization/list-unconfigured-onus**
**features/authorization/authorize-onu**
**features/authorization/list-presets**
**features/authorization/create-preset**
**features/authorization/update-preset**
**features/authorization/delete-preset**  
  
Presets representam **templates de configuração de ONU**.  
  
---  
  
# OLT DOMAIN  
  
O domínio **OLT** concentra funcionalidades relacionadas à gestão dos equipamentos OLT.  
  
Inclui:  
  
- cadastro de OLTs  
- consulta de informações do equipamento  
- configuração de portas  
- consulta de VLANs  
  
Features:  
  
**features/olt/list-olts**  
**features/olt/create-olt**  
**features/olt/update-olt**  
**features/olt/get-olt-details**  
**features/olt/list-pon-ports**  
**features/olt/list-uplink-ports**  
**features/olt/list-vlans**  
**features/olt/configure-pon-port**  
  
Essas features interagem diretamente com:  
  
- banco de dados  
- drivers de OLT  
- workers de sincronização  
  
---  
  
# REPORTS DOMAIN  
  
O domínio **Reports** concentra funcionalidades relacionadas a geração e manipulação de relatórios.  
  
Esses relatórios podem incluir:  
  
- inventário de rede  
- histórico de eventos  
- exportações operacionais  
- auditorias de configuração  
  
Features:  
  
**features/reports/list-reports**  
**features/reports/export-reports**  
**features/reports/import-reports**  
  
---  
  
# DIAGNOSTICS DOMAIN  
  
O domínio **Diagnostics** reúne ferramentas operacionais utilizadas para troubleshooting de rede.  
  
Essas ferramentas podem executar:  
  
- diagnósticos de ONU  
- testes de conectividade  
- coleta de informações da rede  
- análise de eventos  
  
Features:  
  
**features/diagnostics/list-tools**  
**features/diagnostics/run-diagnostic**  
**features/diagnostics/view-history**  
  
---  
  
# SETTINGS DOMAIN  
  
O domínio **Settings** controla configurações administrativas do sistema.  
  
Essas configurações normalmente incluem:  
  
- perfis de velocidade  
- tipos de ONU  
- zonas de rede  
- localizações  
- configurações gerais  
  
Features:

**features/settings/list-speed-profiles**
**features/settings/create-speed-profile**
**features/settings/list-onu-types**
**features/settings/list-zones**
**features/settings/list-locations**
**features/settings/get-general-settings**
**features/settings/update-general-settings**  
  
Essas configurações são utilizadas por múltiplos domínios do sistema.  
  
---  
  
# RELAÇÃO COM OUTROS ARQUIVOS DE PLANNING  
  
Este arquivo define **quais funcionalidades existem no sistema**.  
  
Outros arquivos definem aspectos complementares:  
  
**menu_map.md**  
**→ estrutura de menus e telas**  
  
**database_schema.md**  
**→ schema do banco de dados**  
  
**network_model.md**  
**→ modelo de topologia GPON**  
  
**coding_rules.md**  
**→ regras de implementação**  
  
O **Feature Map** serve como **mapa funcional do sistema**.  
  
Ele é utilizado por:  
  
- desenvolvedores  
- arquitetos de software  
- agentes de IA  
- ferramentas de geração de código  
