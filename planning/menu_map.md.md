# Menu Map Intencional — SmartOLT-like

## Objetivo deste documento
Este documento transforma o mapeamento original em uma especificação funcional pronta para leitura por humano e por Agent Code.

Cada menu foi descrito com:
- **objetivo do menu**
- **telas e features**
- **o que cada feature faz**
- **como a feature funciona na UI**
- **endpoints associados**
- **tabelas do banco envolvidas**
- **RLS inicial por role**

## Convenção de permissões
- **👁️** = pode visualizar / consultar, sem alterar estado
- **✅** = pode executar / criar / editar / excluir
- **—** = não se aplica ou não deveria aparecer para a role

## Roles iniciais
- **Leitor**: pode visualizar todas as telas, indicadores, tabelas, gráficos e detalhes, mas não deve disparar mutações.
- **Técnico**: pode visualizar e operar o sistema inteiro.
- **Admin**: pode visualizar e operar o sistema inteiro.

> Observação importante: algumas features da UI já estão confirmadas por endpoint, outras ainda estão **prováveis**. Onde isso ocorrer, o texto marca explicitamente como **confirmado** ou **provável**.

---

# 1. Dashboard

## Objetivo do menu
Entregar uma visão operacional da rede GPON em tempo real. O Dashboard consolida saúde da rede, status de ONUs, eventos de falha, fila de autorização e tendência de crescimento da base.

## Tabelas do banco mais relevantes
- `olts`
- `pon_ports`
- `onus`
- `onu_authorizations`
- `onu_signal_samples`
- `olt_health_samples`
- `uplink_samples` *(indiretamente, quando houver eventos ou agregações de infraestrutura)*

## Tela: Dashboard de Status da Rede GPON

### Feature: Card Aguardando autorização
**O que faz**
Mostra quantas ONUs foram detectadas pela rede, mas ainda não passaram pelo fluxo de autorização/provisionamento.

**Como funciona**
A UI exibe um card com o total principal e subtotais auxiliares como ONUs deletadas, ressincronizadas e recém-detectadas. Ao clicar, o usuário é levado para a tela de ONUs configuradas ou para o fluxo operacional relacionado à fila de autorização, com filtros aplicados.

**Endpoints**
- `GET /dashboard/get_waiting_auth`

**Tabelas de banco**
- `onus` (status `unconfigured` / `detected` / `configured`)
- `onu_authorizations` (fila, sucesso, falha, ressync)

### Feature: Card ONUs Online
**O que faz**
Exibe o total de ONUs conectadas e operando normalmente.

**Como funciona**
A UI mostra o total online e um complemento com o total autorizado. Ao clicar, abre a tela de ONUs configuradas. Se uma OLT estiver selecionada no filtro lateral do Dashboard, a navegação já abre a tela de ONUs filtrada por essa OLT.

**Endpoints**
- `GET /dashboard/get_onus_stats`

**Tabelas de banco**
- `onus`
- `olts`
- `pon_ports`

### Feature: Card Totalmente offline
**O que faz**
Resume ONUs sem comunicação com a OLT.

**Como funciona**
A UI mostra total consolidado e subtotais de causas conhecidas: falha de energia, perda de sinal e estado desconhecido. Ao clicar, abre ONUs configuradas com filtros de status aplicados.

**Endpoints**
- `GET /dashboard/get_onus_stats`

**Tabelas de banco**
- `onus`
- `onu_signal_samples`

### Feature: Card Sinal fraco
**O que faz**
Mostra a quantidade de ONUs com sinal degradado ou crítico.

**Como funciona**
O card resume níveis `warning` e `critical`. Ao clicar, abre a tela de ONUs configuradas já filtrada em `Signal`.

**Endpoints**
- `GET /dashboard/get_onus_signals`

**Tabelas de banco**
- `onus`
- `onu_signal_samples`

### Feature: Gráfico de estado da rede
**O que faz**
Mostra a evolução temporal do estado operacional da rede (online, power fail, signal loss, N/A, maximum).

**Como funciona**
A UI oferece o gráfico e um seletor `More Graphs` para alternar entre visões horária, diária, semanal, mensal e anual.

**Endpoints**
- `GET /graphs_olt/get_daily_onus_statuses/dashboard`
- *(os demais intervalos provavelmente usam o mesmo endpoint com parâmetro ou endpoints irmãos ainda não capturados)*

**Tabelas de banco**
- `onus`
- `onu_signal_samples`
- `olt_health_samples`

### Feature: Lista lateral de OLTs
**O que faz**
Permite segmentar o dashboard por OLT específica.

**Como funciona**
O usuário escolhe `Todos` ou uma OLT específica. A escolha afeta todos os cards, gráficos e eventos da tela.

**Endpoints**
- `GET /olt/listing`
- `GET /api/system/get_local_olts`

**Tabelas de banco**
- `olts`
- `onus`

### Feature: Gráfico de autorizações de ONU por dia
**O que faz**
Mostra o volume diário de ativações.

**Como funciona**
A UI usa gráfico de barras para mostrar ritmo de provisionamento.

**Endpoints**
- `GET /dashboard/get_onus_auth_per_day`

**Tabelas de banco**
- `onu_authorizations`
- `users`

### Feature: Tabela de falhas em portas PON
**O que faz**
Exibe eventos de falha detectados em portas PON com impacto em ONUs.

**Como funciona**
A UI lista OLT, placa/porta, ONUs impactadas, LOS, potência e possível causa.

**Endpoints**
- `GET /dashboard/get_outage_pons`

**Tabelas de banco**
- `olts`
- `pon_ports`
- `onus`
- `onu_signal_samples`

## RLS inicial — Dashboard
| Feature | Leitor | Técnico | Admin |
|---|---|---|---|
| Ver cards do dashboard | 👁️ | ✅ | ✅ |
| Ver gráfico de estado da rede | 👁️ | ✅ | ✅ |
| Filtrar dashboard por OLT | 👁️ | ✅ | ✅ |
| Ver gráfico de autorizações | 👁️ | ✅ | ✅ |
| Ver tabela de falhas em PON | 👁️ | ✅ | ✅ |

---

# 2. ONUs

## Objetivo do menu
É o núcleo operacional do sistema. O módulo de ONUs cobre descoberta, listagem, detalhamento, monitoramento, autorização, alteração de configuração e ações administrativas sobre o equipamento do cliente.

## Tabelas do banco mais relevantes
- `onus`
- `olts`
- `pon_ports`
- `zones`
- `odbs`
- `onu_types`
- `speed_profiles`
- `vlans`
- `tr069_profiles`
- `onu_custom_templates`
- `onu_authorization_presets`
- `onu_authorizations`
- `onu_signal_samples`
- `onu_traffic_samples`

## Tela: ONUs Configuradas

### Feature: Listagem de ONUs configuradas
**O que faz**
Exibe a base de ONUs já autorizadas/provisionadas.

**Como funciona**
A UI mostra uma tabela operacional com status, nome, SN/MAC, posição GPON, zona, ODB, sinal, modo Bridge/Router, VLAN, serviços, tipo e data de autenticação.

**Endpoints**
- `GET /onu/configured`
- `GET /onu/get_configured_list`

**Tabelas de banco**
- `onus`
- `olts`
- `pon_ports`
- `zones`
- `odbs`
- `onu_types`
- `vlans`

### Feature: Visualizar detalhes da ONU
**O que faz**
Abre a página individual da ONU.

**Como funciona**
A tabela de ONUs configuradas possui botão `Visualizar` por linha.

**Endpoint**
- `GET /onu/view/{id}`

**Tabelas de banco**
- `onus`

### Feature: Consulta de status e sinal
**O que faz**
Atualiza o estado operacional e a potência óptica da ONU.

**Como funciona**
Usado tanto na listagem quanto no detalhe, normalmente para refresh de status.

**Endpoint**
- `GET /api/onu/get_onu_status_and_signal/{id}`

**Tabelas de banco**
- `onus`
- `onu_signal_samples`

### Feature: Filtros da listagem
**O que faz**
Permite localizar ONUs por critérios operacionais e cadastrais.

**Como funciona**
A UI usa filtros textuais e popovers/datalists dinâmicos, muitos carregados por endpoints auxiliares.

**Endpoints confirmados/prováveis**
- Search: filtragem local ou query no endpoint de listagem
- OLT: `POST /api/onu/fetch_distinct_options/olt_id`
- Board: `GET /api/onu/fetch_distinct_onu_boards`, `POST /api/onu/fetch_distinct_options/board`
- Port: `GET /api/onu/fetch_distinct_onu_ports`, `POST /api/onu/fetch_distinct_options/port`
- Zone: `GET /api/onu/fetch_zones`, `POST /api/onu/fetch_distinct_options/zone_id`
- ODB: `GET /api/onu/fetch_odbs_for_location/{id}`, `POST /api/onu/fetch_distinct_options/odb_id`
- ONU Type: `POST /api/onu/fetch_distinct_options/onu_type_id`
- Profile / template: `POST /api/onu/fetch_distinct_options/custom_template`
- PON Type: `POST /api/onu/fetch_distinct_options/pon_type`
- VLAN: `GET /api/onu/fetch_vlans_for_extra/{id}`, `GET /api/onu/fetch_vlans_for_extra/{id}/{id}`
- Mgmt IP: `GET /api/onu/fetch_vlans_mgmt/{id}`
- TR-069: `GET /api/onu/fetch_tr069_profiles_for_olt/{id}`

**Tabelas de banco**
- `onus`
- `olts`
- `pon_ports`
- `zones`
- `odbs`
- `onu_types`
- `vlans`
- `tr069_profiles`
- `onu_custom_templates`

### Feature: Paginação
**O que faz**
Divide a listagem em páginas de 100 ONUs.

**Como funciona**
Mantém filtros ativos entre navegações.

**Endpoint**
- `GET /onu/get_configured_list` *(paginação provavelmente por query params)*

**Tabelas de banco**
- `onus`

### Feature: Exportar ONUs configuradas
**O que faz**
Exporta a listagem filtrada.

**Como funciona**
Provavelmente gera CSV/arquivo a partir dos filtros aplicados na tela.

**Endpoint provável**
- `GET /reports/export`

**Tabelas de banco**
- `onus`
- `olts`
- `zones`
- `odbs`

## Tela: Detalhe da ONU

### Feature: Visualizar informações gerais da ONU
**O que faz**
Mostra a ficha operacional e cadastral da ONU.

**Como funciona**
A tela concentra identificação lógica da ONU (OLT, Board, Porta, ID ONU), dados do cliente e status básicos.

**Endpoint**
- `GET /onu/view/{id}`

**Tabelas de banco**
- `onus`
- `olts`
- `pon_ports`
- `zones`
- `odbs`
- `onu_types`

### Feature: Alterar localização lógica da ONU
**O que faz**
Move ONU entre OLT/board/porta, altera ID ONU ou canal GPON.

**Como funciona**
A UI abre modais como `Mover ONU`, `Alterar ID ONU` e `Atualizar canal GPON`.

**Endpoint**
- provável, ainda não capturado

**Tabelas de banco**
- `onus`
- `pon_ports`
- `olts`

### Feature: Substituir ONU por SN
**O que faz**
Troca o equipamento físico preservando o contexto lógico/serviço.

**Como funciona**
A UI abre um fluxo específico de substituição por SN.

**Endpoint**
- provável, ainda não capturado

**Tabelas de banco**
- `onus`

### Feature: Alterar tipo de ONU
**O que faz**
Troca o tipo/modelo lógico associado à ONU.

**Como funciona**
A UI carrega templates compatíveis antes de permitir a alteração.

**Endpoints**
- `GET /api/onu/fetch_custom_templates/{id}`

**Tabelas de banco**
- `onus`
- `onu_types`
- `onu_custom_templates`

### Feature: Atualizar detalhes do cliente
**O que faz**
Edita zona, nome, endereço e contato.

**Como funciona**
A UI abre modal de edição administrativa da instalação.

**Endpoint**
- provável, backend ainda não capturado

**Tabelas de banco**
- `onus`
- `zones`

### Feature: Visualizar status e sinal
**O que faz**
Mostra estado atual, uptime e sinal da ONU.

**Como funciona**
A UI consome o mesmo endpoint para renderizar status, sinal RX/TX e distância.

**Endpoint**
- `GET /api/onu/get_onu_status_and_signal/{id}`

**Tabelas de banco**
- `onus`
- `onu_signal_samples`

### Feature: Visualizar VLAN, modo operacional e TR-069
**O que faz**
Mostra as configurações de serviço da ONU.

**Como funciona**
A UI consulta VLANs de serviço/gerência e perfis TR-069 relacionados à OLT.

**Endpoints**
- `GET /api/onu/fetch_vlans_for_extra/{id}`
- `GET /api/onu/fetch_vlans_for_extra/{id}/{id}`
- `GET /api/onu/fetch_vlans_mgmt/{id}`
- `GET /api/onu/fetch_tr069_profiles_for_olt/{id}`

**Tabelas de banco**
- `onus`
- `vlans`
- `tr069_profiles`

### Feature: Exibir configuração em execução
**O que faz**
Mostra a configuração que foi efetivamente aplicada na OLT.

**Como funciona**
Abre uma saída textual de CLI ou configuração sintetizada do provisionamento.

**Endpoint provável**
- `GET /onu/get_running_config/{id}`

**Tabelas de banco**
- `onus`
- `onu_authorizations`
- `onu_custom_templates`
- `vlans`
- `speed_profiles`

### Feature: Visualizar informações de software
**O que faz**
Mostra firmware e modelo reportados pelo equipamento.

**Endpoint provável**
- `GET /onu/get_software_info/{id}`

**Tabelas de banco**
- `onus`
- `onu_types`

### Feature: Monitoramento em tempo real (AO VIVO)
**O que faz**
Atualiza continuamente sinal e tráfego.

**Endpoints**
- `GET /signal/get_signal_graph_series_for_onu/{id}`
- `GET /traffic/get_daily_for_onu/{id}` *(ou versão `/small` conforme contexto)*

**Tabelas de banco**
- `onu_signal_samples`
- `onu_traffic_samples`

### Feature: Gráfico de tráfego
**O que faz**
Mostra upload e download históricos da ONU.

**Endpoints**
- `GET /traffic/get_daily_for_onu/{id}`
- `GET /traffic/get_daily_for_onu/{id}/small`
- `GET /traffic/get_traffic_graph_series_for_onu/{id}`

**Tabelas de banco**
- `onu_traffic_samples`

### Feature: Gráfico de sinal
**O que faz**
Mostra evolução temporal do sinal óptico.

**Endpoint**
- `GET /signal/get_signal_graph_series_for_onu/{id}`

**Tabelas de banco**
- `onu_signal_samples`

### Feature: Configurar perfil de velocidade
**O que faz**
Permite alterar o perfil de serviço aplicado à ONU.

**Endpoint**
- `GET /speed_profiles`
- *(save ainda não capturado)*

**Tabelas de banco**
- `speed_profiles`
- `onus`
- `vlans`

### Feature: Ações administrativas na ONU
**O que faz**
Executa operações críticas no equipamento: reboot, resync, factory reset, disable.

**Endpoints prováveis**
- `POST /onu/reboot`    
- `POST /onu/resync`
- `POST /onu/factory_reset`
- `POST /onu/disable`

**Tabelas de banco**
- `onus`
- `onu_authorizations`
- `audit_logs` *(recomendado adicionar ao schema)*

## Tela: ONUs Não Configuradas

### Feature: Listagem de ONUs detectadas
**O que faz**
Mostra ONUs vistas pela OLT que ainda não foram autorizadas.

**Como funciona**
A UI agrupa por OLT e exibe tipo PON, board, porta, descrição da PON, SN, tipo e ações.

**Endpoints**
- `GET /onu/unconfigured`
- `GET /onu/get_unconfigured`
- `GET /onu/get_unconfigured_for_olt/{id}`

**Tabelas de banco**
- `onus`
- `olts`
- `pon_ports`
- `onu_types`

### Feature: Atualizar listagem
**O que faz**
Reconsulta a OLT para obter ONUs detectadas.

**Endpoints**
- `GET /onu/get_unconfigured`
- `GET /olt/scan_olt_sn/{id}` *(capturado no fluxo OLT, complementa a descoberta manual)*

**Tabelas de banco**
- `onus`
- `pon_ports`

### Feature: Autorizar ONU
**O que faz**
Inicia o fluxo formal de provisionamento.

**Endpoints**
- `GET /onu_authorization/authorize`
- `POST /onu/authorize` *(provável submit)*

**Tabelas de banco**
- `onus`
- `onu_authorization_presets`
- `onu_authorizations`
- `speed_profiles`
- `vlans`
- `tr069_profiles`

### Feature: Predefinições de autorização
**O que faz**
Abre presets automáticos de provisionamento.

**Endpoints**
- `GET /onu_authorization_presets/listing`
- `GET /onu_authorization_presets/get_default_preset`

**Tabelas de banco**
- `onu_authorization_presets`
- `speed_profiles`
- `vlans`
- `tr069_profiles`

### Feature: Ações automáticas
**O que faz**
Automatiza a autorização de ONUs por regras.

**Como funciona**
A UI expõe CTAs como configurar ações, histórico de tarefas, atualizar e interromper ações automáticas.

**Endpoints prováveis recomendados**
- `GET /onu_auto_authorization/listing`
- `GET /onu_auto_authorization/get_rules`
- `POST /onu_auto_authorization/create`
- `POST /onu_auto_authorization/update/{id}`
- `POST /onu_auto_authorization/delete/{id}`
- `GET /onu_auto_authorization/tasks`
- `GET /onu_auto_authorization/get_tasks_list`
- `GET /onu_auto_authorization/status`
- `POST /onu_auto_authorization/pause`
- `POST /onu_auto_authorization/resume`

**Tabelas de banco**
- `onu_authorization_presets`
- `onu_authorizations`
- `onus`
- `users`
- `auto_authorization_rules` *(recomendado adicionar ao schema)*
- `auto_authorization_tasks` *(recomendado adicionar ao schema)*

## Tela: Authorization

### Feature: Listar presets e obter preset padrão
**Endpoints**
- `GET /onu_authorization_presets/listing`
- `GET /onu_authorization_presets/get_default_preset`

**Tabelas de banco**
- `onu_authorization_presets`
- `speed_profiles`
- `vlans`
- `tr069_profiles`

### Feature: Executar autorização
**Endpoint**
- `GET /onu_authorization/authorize`
- `POST /onu/authorize` *(provável submit)*

**Tabelas de banco**
- `onus`
- `onu_authorizations`
- `onu_authorization_presets`

## RLS inicial — ONUs
| Feature | Leitor | Técnico | Admin |
|---|---|---|---|
| Ver ONUs configuradas | 👁️ | ✅ | ✅ |
| Filtrar ONUs | 👁️ | ✅ | ✅ |
| Ver detalhe da ONU | 👁️ | ✅ | ✅ |
| Ver sinal e tráfego | 👁️ | ✅ | ✅ |
| Exportar ONUs | 👁️ | ✅ | ✅ |
| Autorizar ONU | — | ✅ | ✅ |
| Usar presets de autorização | — | ✅ | ✅ |
| Executar ações automáticas | — | ✅ | ✅ |
| Alterar dados da ONU | — | ✅ | ✅ |
| Reiniciar / ressync / desativar ONU | — | ✅ | ✅ |

---

# 3. OLTs

## Objetivo do menu
Gerenciar a infraestrutura OLT da rede: cadastro, edição, detalhes operacionais, boards, portas PON, uplinks, VLANs, IPs de gerência, ACLs remotas, perfis VoIP e configurações avançadas.

## Tabelas do banco mais relevantes
**Schema atual já cobre:**
- `olts`
- `pon_ports`
- `vlans`
- `tr069_profiles`
- `onus`
- `onu_signal_samples`
- `olt_health_samples`
- `uplink_samples`

**Tabelas recomendadas para fechar o módulo full stack:**
- `olt_boards`
- `uplink_ports`
- `onu_mgmt_ips`
- `remote_acls`
- `voip_profiles`
- `olt_advanced_settings`
- `olt_backups`
- `olt_history_events`

## Tela: Lista de OLTs

### Feature: Listar OLTs
**Endpoints**
- `GET /olt`
- `GET /olt/listing`
- `GET /api/system/get_local_olts`

**Tabelas**
- `olts`

### Feature: Exportar lista de OLTs
**Endpoint**
- `GET /reports/export`

**Tabelas**
- `olts`

### Feature: Abrir criação de OLT
**Endpoint**
- `GET /olt/add`

**Tabelas**
- `olts`

### Feature: Abrir edição de OLT
**Endpoint**
- `GET /olt/edit/{id}`

**Tabelas**
- `olts`

## Tela: Adicionar OLT

### Feature: Criar nova OLT
**O que faz**
Cadastra o equipamento e seus dados de acesso/monitoramento.

**Endpoints**
- `GET /olt/add`
- `POST /olt/store` *(provável)*

**Tabelas**
- `olts`
- `tr069_profiles`

## Tela: Editar OLT

### Feature: Salvar alterações da OLT
**Endpoints**
- `GET /olt/edit/{id}`
- `POST /olt/update/{id}` *(provável)*

**Tabelas**
- `olts`
- `tr069_profiles`

## Tela: Detalhes da OLT

### Feature: Ver dados gerais da OLT
**Endpoints**
- `GET /olt/olt_details/{id}/details`
- `GET /api/olt/get_capabilities/{id}`
- `GET /olt/get_olt_hardware_software_info/{id}`
- `GET /olt/get_olt_uptime_and_env_temperature/{id}`

**Tabelas**
- `olts`
- `olt_health_samples`

### Feature: Ver histórico da OLT
**Endpoint**
- `GET /olt/get_history/{id}`

**Tabelas**
- `olt_history_events` *(recomendada)*

### Feature: Acessar backups da OLT
**Endpoint**
- `GET /olt/backups/{id}`

**Tabelas**
- `olt_backups` *(recomendada)*

### Aba: Cartões OLT

#### Feature: Listar boards / cartões
**Endpoint**
- `GET /olt/get_boards/{id}`

**Tabelas**
- `olt_boards` *(recomendada)*

### Aba: Portas PON

#### Feature: Listar portas PON
**Endpoints**
- `GET /olt/get_pon_list/{id}`
- `GET /olt/get_pon_ports/{id}`

**Tabelas**
- `pon_ports`
- `onus`
- `onu_signal_samples`

#### Feature: Ativar descoberta automática / varrer ONUs
**Endpoint**
- `GET /olt/scan_olt_sn/{id}`

**Tabelas**
- `pon_ports`
- `onus`

### Aba: Uplink

#### Feature: Listar portas uplink
**Endpoints**
- `GET /olt/get_uplink_ports/{id}`
- `GET /uplink/get_daily_for_uplink_errors/{id}/small`
- `GET /uplink/get_daily_for_uplink_oct/{id}/small`

**Tabelas**
- `uplink_ports` *(recomendada)*
- `uplink_samples`

### Aba: VLANs

#### Feature: Listar VLANs
**Endpoint**
- `GET /olt/get_vlans/{id}`

**Tabelas**
- `vlans`
- `onus`

#### Feature: Criar / excluir VLAN
**Endpoints prováveis**
- `POST /vlan/store`
- `POST /vlan/store_bulk`
- `POST /vlan/delete/{id}`

**Tabelas**
- `vlans`

### Aba: IPs de gerenciamento da ONU

#### Feature: Listar IPs de gerenciamento
**Endpoints**
- `GET /olt/get_mgmt_ips/{id}`
- `GET /olt/olt_details/{id}/mgmt_ips`

**Tabelas**
- `onu_mgmt_ips` *(recomendada)*

#### Feature: Adicionar IP de gerenciamento
**Endpoint**
- `GET /onu_mgmt_ips/add/{id}`
- `POST /onu_mgmt_ips/store` *(provável)*

**Tabelas**
- `onu_mgmt_ips` *(recomendada)*

### Aba: ACLs remotas

#### Feature: Gerenciar ACLs remotas
**Endpoints prováveis**
- `GET /olt/acl`
- `POST /olt/acl/update`

**Tabelas**
- `remote_acls` *(recomendada)*

### Aba: Perfis VoIP

#### Feature: Listar / criar perfis VoIP
**Endpoints prováveis**
- `GET /voip_profiles`
- `POST /voip_profiles/store`

**Tabelas**
- `voip_profiles` *(recomendada)*

### Aba: Avançado

#### Feature: Editar configurações avançadas da OLT
**Endpoints prováveis**
- `GET /olt/advanced/{id}`
- `POST /olt/advanced/update/{id}`

**Tabelas**
- `olt_advanced_settings` *(recomendada)*

## RLS inicial — OLTs
| Feature | Leitor | Técnico | Admin |
|---|---|---|---|
| Ver lista de OLTs | 👁️ | ✅ | ✅ |
| Criar OLT | — | ✅ | ✅ |
| Editar OLT | — | ✅ | ✅ |
| Ver detalhe da OLT | 👁️ | ✅ | ✅ |
| Ver boards/cartões | 👁️ | ✅ | ✅ |
| Ver portas PON | 👁️ | ✅ | ✅ |
| Executar scan de ONUs na OLT | — | ✅ | ✅ |
| Ver uplinks | 👁️ | ✅ | ✅ |
| Gerenciar VLANs | — | ✅ | ✅ |
| Gerenciar IPs de gerência | — | ✅ | ✅ |
| Gerenciar ACLs remotas | — | ✅ | ✅ |
| Gerenciar perfis VoIP | — | ✅ | ✅ |
| Editar avançado | — | ✅ | ✅ |
| Ver histórico / backups | 👁️ | ✅ | ✅ |

---

# 4. Traffic

## Objetivo do menu
Exibir telemetria de tráfego das ONUs e das portas PON.

## Tabelas do banco
- `onu_traffic_samples`
- `pon_ports`
- `onus`

### Feature: Tráfego por ONU
**Endpoints**
- `GET /traffic/get_daily_for_onu/{id}/small`
- `GET /traffic/get_traffic_graph_series_for_onu/{id}`

**Tabelas**
- `onu_traffic_samples`
- `onus`

### Feature: Tráfego por PON
**Endpoint**
- `GET /traffic/get_daily_for_pon_port/{id}/small`

**Tabelas**
- `pon_ports`
- `onu_traffic_samples` *(agregado por porta)*

## RLS inicial — Traffic
| Feature | Leitor | Técnico | Admin |
|---|---|---|---|
| Ver tráfego por ONU | 👁️ | ✅ | ✅ |
| Ver tráfego por PON | 👁️ | ✅ | ✅ |

---

# 5. Signal

## Objetivo do menu
Exibir evolução temporal do sinal óptico da ONU.

## Tabelas do banco
- `onu_signal_samples`
- `onus`

### Feature: Gráfico de potência óptica por ONU
**Endpoint**
- `GET /signal/get_signal_graph_series_for_onu/{id}`

**Tabelas**
- `onu_signal_samples`
- `onus`

## RLS inicial — Signal
| Feature | Leitor | Técnico | Admin |
|---|---|---|---|
| Ver gráfico de sinal | 👁️ | ✅ | ✅ |

---

# 6. Uplink

## Objetivo do menu
Monitorar erros e tráfego das interfaces uplink da OLT.

## Tabelas do banco
- `uplink_samples`
- `uplink_ports` *(recomendada)*
- `olts`

### Feature: Erros de uplink
**Endpoint**
- `GET /uplink/get_daily_for_uplink_errors/{id}/small`

**Tabelas**
- `uplink_samples`

### Feature: Octets/bytes de uplink
**Endpoint**
- `GET /uplink/get_daily_for_uplink_oct/{id}/small`

**Tabelas**
- `uplink_samples`

## RLS inicial — Uplink
| Feature | Leitor | Técnico | Admin |
|---|---|---|---|
| Ver erros de uplink | 👁️ | ✅ | ✅ |
| Ver tráfego de uplink | 👁️ | ✅ | ✅ |

---

# 7. Diagnostics

## Objetivo do menu
Disponibilizar ferramentas de diagnóstico e histórico de execuções operacionais.

## Tabelas do banco
- `diagnostic_runs` *(recomendada)*
- `diagnostic_templates` *(recomendada)*
- `users`

### Feature: Ferramentas de diagnóstico
**Endpoints**
- `GET /diagnostics`
- `GET /diagnostics/get_diagnostics_list`

### Feature: Execuções recentes
**Endpoints**
- `GET /diagnostics/get_diagnostics_list`

## RLS inicial — Diagnostics
| Feature | Leitor | Técnico | Admin |
|---|---|---|---|
| Ver diagnósticos disponíveis | 👁️ | ✅ | ✅ |
| Executar diagnóstico | — | ✅ | ✅ |
| Ver histórico de diagnósticos | 👁️ | ✅ | ✅ |

---

# 8. Reports

## Objetivo do menu
Concentrar tarefas, autorizações, importações e exportações de dados operacionais.

## Tabelas do banco
- `report_tasks`
- `report_exports`
- `onu_authorizations`
- `users`
- `report_import_jobs` *(recomendada)*

### Feature: Lista de tasks
**Endpoints**
- `GET /reports/tasks`
- `GET /reports/get_tasks_list`

**Tabelas**
- `report_tasks`

### Feature: Relatórios de autorizações
**Endpoints**
- `GET /reports/authorizations/list`
- `GET /reports/get_authorizations_list`

**Tabelas**
- `onu_authorizations`
- `users`
- `onus`

### Feature: Exportação genérica
**Endpoints**
- `GET /reports/export`
- `GET /api/export/list`

**Tabelas**
- `report_exports`
- `report_tasks`

### Feature: Importação
**Endpoint confirmado**
- `GET /reports/import`

**Endpoint provável de submit**
- `POST /reports/import`
- ou `POST /reports/import/store`

**Tabelas**
- `report_import_jobs` *(recomendada)*
- `report_tasks`

### Feature: Exportar autorizações filtradas
**Endpoint confirmado**
- `POST /api/onu/export_authorizations`

**Tabelas**
- `onu_authorizations`
- `users`
- `report_exports`

### Feature complementar: Seleção de usuários para relatórios
**Endpoint**
- `GET /api/system/fetch_users_for_reports`

**Tabelas**
- `users`

## RLS inicial — Reports
| Feature | Leitor | Técnico | Admin |
|---|---|---|---|
| Ver tasks | 👁️ | ✅ | ✅ |
| Ver relatórios de autorizações | 👁️ | ✅ | ✅ |
| Exportar relatórios | — | ✅ | ✅ |
| Importar dados | — | ✅ | ✅ |
| Exportar autorizações filtradas | — | ✅ | ✅ |

---

# 9. Settings

## Objetivo do menu
Centralizar catálogos e configurações que alimentam o provisionamento e a organização operacional.

## Tabelas do banco mais relevantes
- `speed_profiles`
- `onu_types`
- `zones`
- `locations`
- `odbs`
- `vlans`
- `tr069_profiles`
- `voip_profiles` *(recomendada)*

## Tela: Gerenciamento de Perfis de Velocidade

### Feature: Listar perfis
**Endpoint**
- `GET /speed_profiles`

**Tabelas**
- `speed_profiles`
- `onus` *(para contagem de uso)*

### Feature: Adicionar perfil
**Endpoint provável**
- `POST /speed_profiles/store`

### Feature: Editar perfil
**Endpoints prováveis**
- `GET /speed_profiles/view/{id}`
- `POST /speed_profiles/update/{id}`

### Feature: Excluir perfil
**Endpoint provável**
- `POST /speed_profiles/delete/{id}`

### Feature: Definir perfil padrão
**Endpoint provável**
- `POST /speed_profiles/set_default/{id}`

## Tela: Gerenciamento de Tipos de ONU

### Feature: Listar tipos
**Endpoints**
- `GET /onu_types`
- `GET /onu_types/listing`
- `GET /onu_types/get_list`

**Tabelas**
- `onu_types`
- `onus`

### Feature: Criar/editar/excluir tipo ONU
**Endpoints prováveis/recomendados**
- `POST /onu_types`
- `GET /onu_types/{id}`
- `PUT /onu_types/{id}`
- `DELETE /onu_types/{id}`
- `GET /onu_types/{id}/usage`
- `GET /onu_types/options`

**Tabelas**
- `onu_types`
- `onus`

## Tela: Gerenciamento de Zonas

### Feature: Listar zonas
**Endpoints**
- `GET /zones`
- `GET /api/onu/fetch_zones`

**Tabelas**
- `zones`
- `onus`

### Feature: Buscar, criar, editar, excluir zona
**Endpoints recomendados**
- `GET /zones?search={termo}`
- `POST /zones`
- `GET /zones/{id}`
- `PUT /zones/{id}`
- `DELETE /zones/{id}`
- `GET /zones/{id}/usage`
- `GET /zones/options`

**Tabelas**
- `zones`
- `onus`

## Tela: Locations
**Endpoints confirmados**
- `GET /locations/listing`

**Tabelas**
- `locations`
- `odbs`
- `olts`

## Tela: ODBs
**Endpoints confirmados**
- `GET /odbs/listing`
- `GET /odbs/get_odbs_list`
- `GET /api/onu/fetch_odbs_for_location/{id}`

**Tabelas**
- `odbs`
- `locations`
- `onus`

## Tela: General / Billing
**Endpoint confirmado**
- `GET /general/listing/billing`

**Tabelas**
- `billing_settings` *(recomendada)*

## RLS inicial — Settings
| Feature | Leitor | Técnico | Admin |
|---|---|---|---|
| Ver speed profiles | 👁️ | ✅ | ✅ |
| Criar/editar/excluir speed profile | — | ✅ | ✅ |
| Ver tipos de ONU | 👁️ | ✅ | ✅ |
| Criar/editar/excluir tipo ONU | — | ✅ | ✅ |
| Ver zonas | 👁️ | ✅ | ✅ |
| Criar/editar/excluir zona | — | ✅ | ✅ |
| Ver locations | 👁️ | ✅ | ✅ |
| Criar/editar/excluir locations | — | ✅ | ✅ |
| Ver ODBs | 👁️ | ✅ | ✅ |
| Criar/editar/excluir ODBs | — | ✅ | ✅ |
| Ver billing/general | 👁️ | ✅ | ✅ |
| Editar billing/general | — | ✅ | ✅ |

---

# 10. System

## Objetivo do menu
Agrupar utilitários administrativos usados por relatórios, contexto operacional e opções distintas carregadas em formulários.

## Tabelas do banco
- `users`
- `olts`
- `zones`

### Feature: Carregar usuários para relatórios
**Endpoint**
- `GET /api/system/fetch_users_for_reports`

### Feature: Carregar OLTs locais
**Endpoint**
- `GET /api/system/get_local_olts`

### Feature: Opções distintas por zona
**Endpoint**
- `POST /api/system/fetch_distinct_options/zone_id`

## RLS inicial — System
| Feature | Leitor | Técnico | Admin |
|---|---|---|---|
| Ver usuários usados em relatórios | 👁️ | ✅ | ✅ |
| Ver OLTs locais | 👁️ | ✅ | ✅ |
| Carregar opções distintas internas | 👁️ | ✅ | ✅ |

---

# Observações finais para o Agent Code

## O que este documento entrega
Este Menu Map já responde, por menu e por feature:
- para que a tela existe
- qual problema operacional ela resolve
- como a UI se comporta
- quais endpoints ela consome
- quais tabelas do banco estão diretamente envolvidas
- quais tabelas ainda faltam no schema atual
- quem pode visualizar e quem pode operar cada feature

## Como usar este documento na implementação
A ordem mais segura de implementação é:
1. **Read-only core**: Dashboard, ONUs Configuradas, Detalhe da ONU, Lista de OLTs
2. **Fluxo operacional central**: ONUs Não Configuradas + Authorization
3. **Infraestrutura OLT**: detalhes, boards, PON, uplink, VLANs
4. **Admin data**: speed profiles, onu types, zones, locations, ODBs
5. **Reports e Diagnostics**
6. **Módulos recomendados ainda não modelados no schema**

## Gap entre UI e schema atual
O schema atual cobre bem:
- ONUs
- OLTs
- PONs
- velocidade
- VLANs
- templates
- autorização
- sinal/tráfego

O schema ainda deve crescer para cobrir completamente:
- `audit_logs`
- `olt_boards`
- `uplink_ports`
- `onu_mgmt_ips`
- `remote_acls`
- `voip_profiles`
- `olt_advanced_settings`
- `olt_backups`
- `olt_history_events`
- `diagnostic_runs`
- `report_import_jobs`
- `billing_settings`
- `auto_authorization_rules`
- `auto_authorization_tasks`
