# NETWORK MODEL

Este documento define o **modelo de rede e operação** inferido a partir dos HARs do SmartOLT, do mapeamento de features e dos menus observados.

O objetivo é servir como referência arquitetural para backend, workers, drivers de OLT e features do sistema.

---

# 1. VISÃO GERAL DA TOPOLOGIA

A rede segue uma hierarquia GPON clássica.

```text
OLT
 └── Board
      └── PON Port
           └── ONU
```

## OLT

A OLT é o equipamento central da rede óptica.

Responsável por:

- autenticar ONUs
- manter boards e portas PON
- expor uplinks
- armazenar configuração de VLAN
- permitir coleta de telemetria
- executar comandos operacionais

## Board

Board é a placa física da OLT.

Cada board contém múltiplas portas PON e compõe a capacidade física do equipamento.

## PON Port

A porta PON conecta o equipamento central às ONUs da rede.

Ela é a unidade operacional onde a maior parte da ativação, sinal, queda e telemetria acontece.

## ONU

A ONU é o equipamento instalado no cliente.

Ela pode estar:

- unconfigured
- authorized
- online
- offline
- los
- power-fail
- weak-signal

---

# 2. DOMÍNIO OPERACIONAL DO SISTEMA

O SmartOLT-like atua em três camadas ao mesmo tempo:

- **Network Management System**
- **Provisioning System**
- **Monitoring System**

Isso significa que o sistema precisa modelar:

1. a topologia lógica da rede
2. o estado operacional atual
3. o histórico e a telemetria
4. as ações executáveis sobre equipamentos

---

# 3. MODELO DE DADOS DA REDE

## 3.1 Entidades principais

### OLT
Campos típicos esperados:

- id
- name
- ip_address
- vendor
- model
- hardware_version
- software_version
- tcp_port
- udp_port
- zone_id
- location_id

Tabela sugerida:

```text
olts
```

### OLT Board
Campos típicos esperados:

- id
- olt_id
- slot
- board_type
- real_type
- status
- role

Tabela sugerida:

```text
olt_boards
```

### PON Port
Campos típicos esperados:

- id
- olt_id
- board_id
- board
- port
- pon_type
- description
- admin_state
- oper_state
- online_onus
- total_onus
- avg_signal_dbm

Tabela sugerida:

```text
pon_ports
```

### Uplink Port
Campos típicos esperados:

- id
- olt_id
- port_name
- description
- port_type
- admin_state
- oper_state
- negotiation_mode
- mtu
- wavelength
- module_temp
- native_vlan
- vlan_mode
- allowed_vlans

Tabela sugerida:

```text
uplink_ports
```

### ONU
Campos típicos esperados:

- id
- serial_number
- external_id
- olt_id
- pon_port_id
- board
- port
- onu_position
- onu_type_id
- custom_template_id
- odb_id
- zone_id
- gpon_channel
- name
- address
- contact
- status
- operation_mode
- tr069_enabled
- mgmt_ip_enabled
- supports_catv
- authorized_at

Tabela sugerida:

```text
onus
```

---

# 4. ENTIDADES DE CONFIGURAÇÃO

Essas entidades não representam telemetria, mas sustentam provisionamento e operação.

## VLAN

Relacionada à OLT e usada em:

- autorização de ONU
- uplinks
- management IP
- VoIP
- WAN mode

Tabela sugerida:

```text
vlans
```

## Speed Profile

Usada para:

- perfis de download/upload
- aplicação em autorização
- alteração em lote de ONUs

Tabela sugerida:

```text
speed_profiles
```

## ONU Type

Define capacidades do modelo da ONU:

- portas Ethernet
- Wi-Fi
- VoIP
- CATV
- suporte Bridge / Router
- tecnologia PON

Tabela sugerida:

```text
onu_types
```

## Zone

Agrupamento lógico e operacional.

Tabela sugerida:

```text
zones
```

## Location

Local físico ou organizacional.

Tabela sugerida:

```text
locations
```

## ODB

Distribuição óptica relacionada à ONU e à localização.

Tabela sugerida:

```text
odbs
```

## Authorization Preset

Template de provisionamento com:

- VLAN
- speed profile
- TR-069
- VoIP
- modo de operação

Tabela sugerida:

```text
onu_authorization_presets
```

## TR-069 Profile

Perfis de gerenciamento remoto.

Tabela sugerida:

```text
tr069_profiles
```

## VoIP Profile

Perfis SIP usados no provisionamento.

Tabela sugerida:

```text
voip_profiles
```

## Remote ACL

Regras de acesso remoto aplicadas à OLT e/ou ONUs.

Tabela sugerida:

```text
remote_acls
```

## Advanced OLT Settings

Parâmetros avançados da OLT, como:

- DHCP option 82
- PPPoE-plus
- MAC limits
- thresholds de sinal
- source guard
- CVLAN / SVLAN

Tabela sugerida:

```text
olt_advanced_settings
```

---

# 5. TELEMETRIA DA REDE

A rede precisa de coleta contínua feita por workers.

## Coletas necessárias

### ONU Signal
- rx_dbm
- tx_dbm
- distance_meters
- collected_at

Tabela sugerida:

```text
onu_signal_samples
```

### ONU Traffic
- rx_bytes
- tx_bytes
- collected_at

Tabela sugerida:

```text
onu_traffic_samples
```

### PON Traffic
- rx_bytes
- tx_bytes
- collected_at

Tabela sugerida:

```text
pon_traffic_samples
```

### Uplink Samples
- octets
- errors
- collected_at

Tabela sugerida:

```text
uplink_samples
```

### OLT Health
- env_temp
- cpu_pct
- mem_pct
- uptime_seconds
- collected_at

Tabela sugerida:

```text
olt_health_samples
```

---

# 6. ESTADO REAL vs ESTADO ARMAZENADO

O sistema opera com dois tipos de estado:

## Estado real
O estado real vive nos equipamentos de rede:

- OLT
- ONU
- uplink
- PON

## Estado armazenado
O estado armazenado vive no banco e representa a **visão conhecida da rede pelo sistema**.

Exemplo de divergência possível:

```text
OLT: ONU offline
Database: ONU online
```

Isso pode ocorrer quando há:

- atraso na coleta
- perda de comunicação
- falha temporária de worker
- reboot de equipamento

Workers são responsáveis por reduzir essa divergência.

---

# 7. FLUXOS PRINCIPAIS DE REDE

## 7.1 Descoberta de ONU

```text
ONU conecta na fibra
↓
OLT detecta novo serial
↓
Sistema lista ONU como unconfigured
↓
Operador abre tela de ONUs não configuradas
↓
Operador ou automação inicia autorização
```

## 7.2 Autorização de ONU

```text
ONU unconfigured
↓
preset selecionado
↓
VLAN / profile / mode definidos
↓
driver envia comandos para OLT
↓
OLT registra ONU
↓
sistema grava autorização
↓
ONU passa a operar
```

## 7.3 Sincronização de rede

```text
OLT
↓
driver executa leitura
↓
worker coleta dados
↓
database atualiza estado
↓
API expõe informação
↓
frontend apresenta rede
```

---

# 8. DRIVERS DE OLT

O sistema depende de **drivers** para encapsular diferenças entre fabricantes.

Fabricantes identificados/relevantes no contexto do projeto:

- Huawei
- ZTE
- Fiberhome
- VSOL

Os drivers devem oferecer uma interface comum para operações como:

- listar ONUs
- listar portas PON
- listar uplinks
- coletar sinal
- coletar tráfego
- autorizar ONU
- reboot ONU
- resync ONU
- disable ONU
- listar VLANs
- listar boards
- consultar hardware e software da OLT

---

# 9. MAPEAMENTO FUNCIONAL DA REDE PARA O PRODUTO

## Dashboard
Consome:

- status de ONUs
- weak signal
- waiting authorization
- outages PON
- estatísticas por OLT

## ONUs
Consome:

- listagem configurada
- listagem unconfigured
- detalhe da ONU
- status
- sinal
- tráfego
- ações administrativas

## Authorization
Consome:

- ONU detectada
- presets
- VLAN
- profiles
- configuração do driver

## OLTs
Consome:

- cadastro de OLT
- detalhe de OLT
- boards
- PON ports
- uplinks
- VLANs
- management IPs
- ACLs
- VoIP profiles
- advanced settings

## Reports
Consome:

- histórico
- tasks
- exportações
- importações
- autorizações

## Diagnostics
Consome:

- ferramentas operacionais
- execuções
- resultados

---

# 10. OBSERVAÇÕES IMPORTANTES DE IMPLEMENTAÇÃO

1. O banco representa a **topologia e o estado lógico**, não substitui a OLT como fonte de verdade física.
2. Toda ação crítica de rede deve passar por **driver**.
3. Toda persistência deve passar por **repository**.
4. Toda automação de sincronização deve ser executada por **workers**.
5. Toda feature deve respeitar a arquitetura:

```text
features/<domain>/<feature>
```

---

# 11. MENUS E CAPACIDADES OBSERVADAS NOS HARs

Os HARs e telas observadas mostram um produto organizado em torno de:

- Unconfigured
- Configured
- Graphs
- Diagnostics
- Tasks
- Reports
- Settings

Dentro de Settings e OLTs, foram observadas capacidades relacionadas a:

- Zones
- ODBs
- ONU types
- Speed profiles
- OLTs
- VPN & TR-069
- Authorization presets
- General
- Billing
- Mgmt IP
- TR-069
- VoIP
- CATV

Além disso, a UI e os HARs indicam suporte operacional a:

- batch actions em ONUs
- mudança de VLAN principal
- SVLAN / CVLAN / tag transform
- atualização de speed profile
- alteração de ONU type
- alteração de custom profile
- mudança de WAN mode
- mudança de management IP mode
- alteração de perfil TR-069
- reboot em lote
- enable/disable em lote
- save configuration de OLT
- export e import
- relatórios de autorizações
- listagem filtrada por OLT, board, port e zone

---

# 12. CONCLUSÃO

O modelo de rede do sistema precisa suportar ao mesmo tempo:

- topologia GPON
- provisionamento
- operação em tempo real
- telemetria histórica
- configuração administrativa
- automação operacional

Esse documento deve ser lido em conjunto com:

- `system_overview.md`
- `feature_map.md`
- `feature_contracts.md`
- `menu_map.md`
- `database_schema.md`
- `coding_rules.md`
