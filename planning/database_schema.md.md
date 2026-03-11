# Schema Provável do SmartOLT
Inferido a partir de 67 endpoints da API capturados via HAR.

Objetivo deste documento:
Mapear as entidades principais do sistema para reconstrução do banco de dados.

---

# 1. Núcleo da Rede

## Tabela: olts
Representa os equipamentos OLT.

Campos:

id (PK)  
name  
vendor  
mgmt_ip  
location_id (FK → locations.id)  
zone_id (FK → zones.id)  
created_at  
updated_at  

---

## Tabela: pon_ports
Representa portas PON dentro de cada OLT.

Campos:

id (PK)  
olt_id (FK → olts.id)  
board  
port  
pon_type  
description  
created_at  
updated_at  

Relacionamento:

olts 1 → N pon_ports

---

# 2. ONUs

## Tabela: onus
Representa cada ONU conectada na rede.

Campos:

id (PK)  
serial_number  
olt_id (FK → olts.id)  
pon_port_id (FK → pon_ports.id)  
board  
port  
onu_type_id (FK → onu_types.id)  
custom_template_id (FK → onu_custom_templates.id)  
odb_id (FK → odbs.id)  
zone_id (FK → zones.id)  
status (online / offline / unconfigured / configured)  
created_at  
updated_at  

Relacionamentos:

olts 1 → N onus  
pon_ports 1 → N onus  
onu_types 1 → N onus  

---

# 3. Catálogos e Configurações

## Tabela: onu_types
Tipos de ONUs suportadas.

Campos:

id (PK)  
name  
vendor  
model  
created_at  
updated_at  

---

## Tabela: locations
Localizações físicas.

Campos:

id (PK)  
name  
city  
state  
created_at  
updated_at  

---

## Tabela: zones
Zonas ou regiões da rede.

Campos:

id (PK)  
name  
created_at  
updated_at  

---

## Tabela: odbs
Distribuidores ópticos / caixas de emenda.

Campos:

id (PK)  
location_id (FK → locations.id)  
name  
address  
reference  
created_at  
updated_at  

Relacionamento:

locations 1 → N odbs

---

# 4. Profiles de Provisionamento

## Tabela: speed_profiles
Perfis de velocidade.

Campos:

id (PK)  
name  
down_mbps  
up_mbps  
vlan_id (FK → vlans.id)  
created_at  
updated_at  

---

## Tabela: tr069_profiles
Perfis TR069 utilizados na configuração das ONUs.

Campos:

id (PK)  
olt_id (FK → olts.id)  
name  
params_json  
created_at  
updated_at  

Relacionamento:

olts 1 → N tr069_profiles

---

# 5. VLANs

## Tabela: vlans

Campos:

id (PK)  
olt_id (FK → olts.id)  
vlan_tag  
purpose (mgmt / extra / service)  
description  

Relacionamento:

olts 1 → N vlans

---

# 6. Templates de Configuração

## Tabela: onu_custom_templates

Campos:

id (PK)  
olt_id (FK → olts.id)  
name  
template_json  
created_at  
updated_at  

Relacionamento:

olts 1 → N onu_custom_templates

---

# 7. Autorização de ONU

## Tabela: onu_authorization_presets
Templates usados no processo de autorização.

Campos:

id (PK)  
name  
is_default  
speed_profile_id (FK → speed_profiles.id)  
vlan_id (FK → vlans.id)  
tr069_profile_id (FK → tr069_profiles.id)  
created_at  
updated_at  

---

## Tabela: onu_authorizations
Registro de autorizações executadas.

Campos:

id (PK)  
onu_id (FK → onus.id)  
preset_id (FK → onu_authorization_presets.id)  
authorized_by_user_id (FK → users.id)  
status (success / failed / pending)  
message  
created_at  

Relacionamentos:

onus 1 → N onu_authorizations  
users 1 → N onu_authorizations  

---

# 8. Telemetria de Rede

## Tabela: onu_signal_samples

Campos:

id (PK)  
onu_id (FK → onus.id)  
rx_dbm  
tx_dbm  
collected_at  

Relacionamento:

onus 1 → N onu_signal_samples

---

## Tabela: onu_traffic_samples

Campos:

id (PK)  
onu_id (FK → onus.id)  
rx_bytes  
tx_bytes  
collected_at  

Relacionamento:

onus 1 → N onu_traffic_samples

---

## Tabela: pon_traffic_samples

Campos:

id (PK)  
pon_port_id (FK → pon_ports.id)  
rx_bytes  
tx_bytes  
collected_at  

Relacionamento:

pon_ports 1 → N pon_traffic_samples

---

## Tabela: uplink_samples

Campos:

id (PK)  
olt_id (FK → olts.id)  
errors  
octets  
collected_at  

Relacionamento:

olts 1 → N uplink_samples

---

# 9. Métricas da OLT

## Tabela: olt_health_samples

Campos:

id (PK)  
olt_id (FK → olts.id)  
env_temp  
cpu_pct  
mem_pct  
uptime_seconds  
collected_at  

Relacionamento:

olts 1 → N olt_health_samples

---

# 10. Relatórios

## Tabela: report_tasks

Campos:

id (PK)  
type  
requested_by_user_id (FK → users.id)  
status (queued / running / done / failed)  
params_json  
created_at  
updated_at  

---

## Tabela: report_exports

Campos:

id (PK)  
task_id (FK → report_tasks.id)  
file_url  
created_at  

Relacionamento:

report_tasks 1 → N report_exports

---

# 11. Usuários

## Tabela: users

Campos:

id (PK)  
name  
email  
role  
is_active  
created_at  
updated_at  

---

# 12. Eventos de ONU

## Tabela: onu_events
Registra eventos operacionais executados em ONUs (reboot, factory-reset, disable, resync).

Campos:

id (PK)
onu_id (FK → onus.id)
event_type (reboot / factory_reset / disable / resync / authorize)
triggered_by_user_id (FK → users.id)
status (pending / success / failed)
details_json
created_at

Relacionamento:

onus 1 → N onu_events

---

# 13. Diagnósticos

## Tabela: diagnostic_runs
Registra execuções de ferramentas de diagnóstico na rede.

Campos:

id (PK)
tool_name
target_type (onu / olt / port)
target_id
triggered_by_user_id (FK → users.id)
status (running / done / failed)
result_json
created_at

Relacionamento:

Polimórfico via target_type + target_id

---

# 14. Views Agregadas (não são tabelas físicas)

## View: network_stats
Agregação em tempo real calculada a partir de onus, olts e olt_health_samples.

Campos computados:

total_olts
total_onus
online_onus
offline_onus
onus_with_weak_signal
avg_signal_dbm

Nota: Esta é uma VIEW ou query agregada no repositório, não uma tabela física.
Não deve ser criada como tabela no banco.

---

# Estrutura geral do sistema

OLT
└── PON_PORT
    └── ONU
        ├── SIGNAL_SAMPLES
        ├── TRAFFIC_SAMPLES
        ├── AUTHORIZATIONS
        └── ONU_EVENTS

OLT
├── UPLINK_SAMPLES
└── OLT_HEALTH_SAMPLES

DIAGNOSTIC_RUNS (polimórfico)
REPORT_TASKS → REPORT_EXPORTS

---

# Observação

Este schema foi inferido a partir dos endpoints da API e pode sofrer ajustes durante o desenvolvimento do sistema próprio.