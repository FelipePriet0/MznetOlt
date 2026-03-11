# Feature_contracts   
  
# FEATURE CONTRACTS  
  
Este documento define os **contratos operacionais das features do sistema**.  
  
Cada feature conecta explicitamente:  
  
- domínio  
- menu da interface  
- endpoint da API  
- tabelas utilizadas  
- repository responsável  
- service responsável  
- driver de rede (quando necessário)  
  
Esse arquivo permite que:  
  
- desenvolvedores  
- arquitetos  
- agentes de IA  
  
entendam **como cada funcionalidade do sistema opera internamente**.  
  
Estrutura padrão de contrato:  
  
**Domain**  
**Feature**  
**Type**  
**Menu**  
**Endpoint**  
**Tables**  
**Repository**  
**Service**  
**Driver**  
  
---  
  
# DASHBOARD DOMAIN  
  
## Feature: get-network-kpis  
  
Domain    
Dashboard  
  
Type    
read  
  
Menu    
Dashboard  
  
Endpoint    
GET /api/dashboard/kpis  
  
Tables

**onus**
**olts**
**olt_health_samples**
*network_stats (VIEW agregada — não é tabela física, ver database_schema.md)*  
  
**Repository **  
  
**features/dashboard/get-network-kpis/repository.ts**  
  
Service    
  
**features/dashboard/get-network-kpis/service.ts**  
  
Driver    
  
None   
  
---  
  
## Feature: get-online-onus

Domain
Dashboard

Type
read

Menu
Dashboard

Endpoint
GET /api/dashboard/online-onus

Tables

**onus**

Repository

**features/dashboard/get-online-onus/repository.ts**

Service

**features/dashboard/get-online-onus/service.ts**

Driver

**olt-driver**  
  
---  
  
# ONU DOMAIN  
  
## Feature: list-configured-onus  
  
Domain    
ONU  
  
Type    
read  
  
Menu    
  
**ONUs → List**  
  
Endpoint    
  
**GET /api/onu/list**  
  
Tables

**onus**
**onu_signal_samples**

Repository

**features/onu/list-configured-onus/repository.ts**  
  
Service    
  
**features/onu/list-configured-onus/service.ts**  
  
Driver

olt-driver

---

## Feature: reboot-onu  
  
Domain    
ONU  
  
Type    
network-action  
  
Menu    
  
**ONUs → Actions**  
  
Endpoint    
  
**POST /api/onu/reboot**  
  
Tables

**onus**
**onu_authorizations**
**onu_events**

Repository

**features/onu/reboot-onu/repository.ts**  
  
Service    
  
**features/onu/reboot-onu/service.ts**  
  
**Driver**  
  
**olt-driver **  
  
---  
  
## Feature: factory-reset-onu  
  
Domain    
ONU  
  
Type    
network-action  
  
Menu

ONUs → Actions

Endpoint    
  
**POST /api/onu/factory-reset**  
  
Tables

**onus**
**onu_authorizations**
**onu_events**

Repository

**features/onu/factory-reset-onu/repository.ts**  
  
**Service**  
  
**features/onu/factory-reset-onu/service.ts**  
  
Driver    
  
olt-driver   
  
---  
  
# AUTHORIZATION DOMAIN  
  
## Feature: authorize-onu  
  
Domain    
Authorization  
  
Type    
network-action  
  
Menu    
  
**Authorization → New ONU**  
  
**Endpoint **  
  
**POST /api/authorization/authorize**  
  
Tables

**onus**
**onu_authorization_presets**
**pon_ports**  
  
**Repository **  
  
**features/authorization/authorize-onu/repository.ts**  
  
**Service **  
  
**features/authorization/authorize-onu/service.ts**  
  
Driver

olt-driver

---

## Feature: list-presets  
  
Domain    
Authorization  
  
Type    
read  
  
Menu    
  
**Authorization → Presets**  
  
**Endpoint **  
  
**GET /api/authorization/presets**  
  
Tables

**onu_authorization_presets**

Repository

**features/authorization/list-presets/repository.ts**  
  
**Service **  
  
**features/authorization/list-presets/service.ts**  
  
Driver    
  
None   
  
---  
  
# OLT DOMAIN  
  
## Feature: list-olts  
  
Domain    
OLT  
  
Type    
read  
  
Menu    
  
**OLTs → List**  
  
Endpoint    
  
**GET /api/olt/list**  
  
Tables    
  
**olts**  
  
Repository    
  
**features/olt/list-olts/repository.ts**  
  
Service    
  
**features/olt/list-olts/service.ts**  
  
Driver    
  
None   
  
---  
  
## Feature: list-pon-ports  
  
Domain    
OLT  
  
Type    
read  
  
Menu    
  
OLT -> Ports   
  
Endpoint    
  
**GET /api/olt/{id}/pon**  
  
Tables

**pon_ports**

Repository

**features/olt/list-pon-ports/repository.ts**  
  
Service    
  
**features/olt/list-pon-ports/service.ts**  
  
Driver

olt-driver

---

# REPORTS DOMAIN  
  
## Feature: export-reports  
  
Domain    
Reports  
  
Type    
write  
  
Menu    
  
**Reports → Export**  
  
Endpoint    
  
**POST /api/reports/export**  
  
Tables

**report_tasks**
**report_exports**
**onus**
**olts**  
  
Repository    
  
**features/reports/export-reports/repository.ts**  
  
Service    
  
**features/reports/export-reports/service.ts**  
  
Driver    
  
None   
  
---  
  
# DIAGNOSTICS DOMAIN  
  
## Feature: run-diagnostic  
  
Domain    
Diagnostics  
  
Type    
network-action  
  
Menu    
  
**Diagnostics → Tools**  
  
Endpoint    
  
**POST /api/diagnostics/run**  
  
Tables

**diagnostic_runs**  
  
Repository    
  
**features/diagnostics/run-diagnostic/repository.ts**  
  
**Service **  
  
**features/diagnostics/run-diagnostic/service.ts**  
  
**Driver **  
  
**olt-driver**  
  
---  
  
# DASHBOARD DOMAIN (cont.)

## Feature: get-offline-onus

Domain
Dashboard

Type
read

Menu
Dashboard

Endpoint
GET /api/dashboard/offline-onus

Tables

**onus**

Repository

**features/dashboard/get-offline-onus/repository.ts**

Service

**features/dashboard/get-offline-onus/service.ts**

Driver

None

---

## Feature: get-weak-signal-onus

Domain
Dashboard

Type
read

Menu
Dashboard

Endpoint
GET /api/dashboard/weak-signal-onus

Tables

**onus**
**onu_signal_samples**

Repository

**features/dashboard/get-weak-signal-onus/repository.ts**

Service

**features/dashboard/get-weak-signal-onus/service.ts**

Driver

None

---

## Feature: get-authorization-stats

Domain
Dashboard

Type
read

Menu
Dashboard

Endpoint
GET /api/dashboard/authorization-stats

Tables

**onus**
**onu_authorizations**

Repository

**features/dashboard/get-authorization-stats/repository.ts**

Service

**features/dashboard/get-authorization-stats/service.ts**

Driver

None

---

# ONU DOMAIN (cont.)

## Feature: get-onu-details

Domain
ONU

Type
read

Menu
ONUs → Detail

Endpoint
GET /api/onu/{id}

Tables

**onus**
**onu_types**
**pon_ports**
**olts**

Repository

**features/onu/get-onu-details/repository.ts**

Service

**features/onu/get-onu-details/service.ts**

Driver

None

---

## Feature: get-onu-status

Domain
ONU

Type
read

Menu
ONUs → Detail

Endpoint
GET /api/onu/{id}/status

Tables

**onus**

Repository

**features/onu/get-onu-status/repository.ts**

Service

**features/onu/get-onu-status/service.ts**

Driver

olt-driver

---

## Feature: get-onu-signal-history

Domain
ONU

Type
read

Menu
ONUs → Signal

Endpoint
GET /api/onu/{id}/signal

Tables

**onus**
**onu_signal_samples**

Repository

**features/onu/get-onu-signal-history/repository.ts**

Service

**features/onu/get-onu-signal-history/service.ts**

Driver

None

---

## Feature: get-onu-traffic-history

Domain
ONU

Type
read

Menu
ONUs → Traffic

Endpoint
GET /api/onu/{id}/traffic

Tables

**onus**
**onu_traffic_samples**

Repository

**features/onu/get-onu-traffic-history/repository.ts**

Service

**features/onu/get-onu-traffic-history/service.ts**

Driver

None

---

## Feature: resync-onu

Domain
ONU

Type
network-action

Menu
ONUs → Actions

Endpoint
POST /api/onu/resync

Tables

**onus**
**onu_events**

Repository

**features/onu/resync-onu/repository.ts**

Service

**features/onu/resync-onu/service.ts**

Driver

olt-driver

---

## Feature: disable-onu

Domain
ONU

Type
network-action

Menu
ONUs → Actions

Endpoint
POST /api/onu/disable

Tables

**onus**
**onu_events**

Repository

**features/onu/disable-onu/repository.ts**

Service

**features/onu/disable-onu/service.ts**

Driver

olt-driver

---

# AUTHORIZATION DOMAIN (cont.)

## Feature: list-unconfigured-onus

Domain
Authorization

Type
read

Menu
Authorization → New ONU

Endpoint
GET /api/authorization/unconfigured

Tables

**onus**
**pon_ports**
**olts**

Repository

**features/authorization/list-unconfigured-onus/repository.ts**

Service

**features/authorization/list-unconfigured-onus/service.ts**

Driver

olt-driver

---

## Feature: create-preset

Domain
Authorization

Type
write

Menu
Authorization → Presets

Endpoint
POST /api/authorization/presets

Tables

**onu_authorization_presets**

Repository

**features/authorization/create-preset/repository.ts**

Service

**features/authorization/create-preset/service.ts**

Driver

None

---

## Feature: update-preset

Domain
Authorization

Type
write

Menu
Authorization → Presets

Endpoint
PUT /api/authorization/presets/{id}

Tables

**onu_authorization_presets**

Repository

**features/authorization/update-preset/repository.ts**

Service

**features/authorization/update-preset/service.ts**

Driver

None

---

## Feature: delete-preset

Domain
Authorization

Type
write

Menu
Authorization → Presets

Endpoint
DELETE /api/authorization/presets/{id}

Tables

**onu_authorization_presets**

Repository

**features/authorization/delete-preset/repository.ts**

Service

**features/authorization/delete-preset/service.ts**

Driver

None

---

# OLT DOMAIN (cont.)

## Feature: create-olt

Domain
OLT

Type
write

Menu
OLTs → List

Endpoint
POST /api/olt

Tables

**olts**
**locations**
**zones**

Repository

**features/olt/create-olt/repository.ts**

Service

**features/olt/create-olt/service.ts**

Driver

None

---

## Feature: update-olt

Domain
OLT

Type
write

Menu
OLTs → Detail

Endpoint
PUT /api/olt/{id}

Tables

**olts**

Repository

**features/olt/update-olt/repository.ts**

Service

**features/olt/update-olt/service.ts**

Driver

None

---

## Feature: get-olt-details

Domain
OLT

Type
read

Menu
OLTs → Detail

Endpoint
GET /api/olt/{id}

Tables

**olts**
**pon_ports**
**locations**
**zones**

Repository

**features/olt/get-olt-details/repository.ts**

Service

**features/olt/get-olt-details/service.ts**

Driver

None

---

## Feature: list-uplink-ports

Domain
OLT

Type
read

Menu
OLTs → Ports

Endpoint
GET /api/olt/{id}/uplink

Tables

**olts**
**uplink_samples**

Repository

**features/olt/list-uplink-ports/repository.ts**

Service

**features/olt/list-uplink-ports/service.ts**

Driver

olt-driver

---

## Feature: list-vlans

Domain
OLT

Type
read

Menu
OLTs → VLANs

Endpoint
GET /api/olt/{id}/vlans

Tables

**vlans**
**olts**

Repository

**features/olt/list-vlans/repository.ts**

Service

**features/olt/list-vlans/service.ts**

Driver

olt-driver

---

## Feature: configure-pon-port

Domain
OLT

Type
write

Menu
OLTs → Ports

Endpoint
PUT /api/olt/{id}/pon/{portId}

Tables

**pon_ports**

Repository

**features/olt/configure-pon-port/repository.ts**

Service

**features/olt/configure-pon-port/service.ts**

Driver

olt-driver

---

# REPORTS DOMAIN (cont.)

## Feature: list-reports

Domain
Reports

Type
read

Menu
Reports → List

Endpoint
GET /api/reports

Tables

**report_tasks**
**report_exports**

Repository

**features/reports/list-reports/repository.ts**

Service

**features/reports/list-reports/service.ts**

Driver

None

---

## Feature: import-reports

Domain
Reports

Type
write

Menu
Reports → Import

Endpoint
POST /api/reports/import

Tables

**report_tasks**

Repository

**features/reports/import-reports/repository.ts**

Service

**features/reports/import-reports/service.ts**

Driver

None

---

# DIAGNOSTICS DOMAIN (cont.)

## Feature: list-tools

Domain
Diagnostics

Type
read

Menu
Diagnostics → Tools

Endpoint
GET /api/diagnostics/tools

Tables

None

Repository

**features/diagnostics/list-tools/repository.ts**

Service

**features/diagnostics/list-tools/service.ts**

Driver

None

---

## Feature: view-history

Domain
Diagnostics

Type
read

Menu
Diagnostics → History

Endpoint
GET /api/diagnostics/history

Tables

**diagnostic_runs**

Repository

**features/diagnostics/view-history/repository.ts**

Service

**features/diagnostics/view-history/service.ts**

Driver

None

---

# SETTINGS DOMAIN

## Feature: list-speed-profiles

Domain
Settings

Type
read

Menu
Settings → Speed Profiles

Endpoint
GET /api/settings/speed-profiles

Tables

**speed_profiles**

Repository

**features/settings/list-speed-profiles/repository.ts**

Service

**features/settings/list-speed-profiles/service.ts**

Driver

None

---

## Feature: create-speed-profile

Domain
Settings

Type
write

Menu
Settings → Speed Profiles

Endpoint
POST /api/settings/speed-profiles

Tables

**speed_profiles**

Repository

**features/settings/create-speed-profile/repository.ts**

Service

**features/settings/create-speed-profile/service.ts**

Driver

None

---

## Feature: list-onu-types

Domain
Settings

Type
read

Menu
Settings → ONU Types

Endpoint
GET /api/settings/onu-types

Tables

**onu_types**

Repository

**features/settings/list-onu-types/repository.ts**

Service

**features/settings/list-onu-types/service.ts**

Driver

None

---

## Feature: list-zones

Domain
Settings

Type
read

Menu
Settings → Zones

Endpoint
GET /api/settings/zones

Tables

**zones**

Repository

**features/settings/list-zones/repository.ts**

Service

**features/settings/list-zones/service.ts**

Driver

None

---

## Feature: list-locations

Domain
Settings

Type
read

Menu
Settings → Locations

Endpoint
GET /api/settings/locations

Tables

**locations**

Repository

**features/settings/list-locations/repository.ts**

Service

**features/settings/list-locations/service.ts**

Driver

None

---

## Feature: get-general-settings

Domain
Settings

Type
read

Menu
Settings → General

Endpoint
GET /api/settings/general

Tables

None

Repository

**features/settings/get-general-settings/repository.ts**

Service

**features/settings/get-general-settings/service.ts**

Driver

None

---

## Feature: update-general-settings

Domain
Settings

Type
write

Menu
Settings → General

Endpoint
PUT /api/settings/general

Tables

None

Repository

**features/settings/update-general-settings/repository.ts**

Service

**features/settings/update-general-settings/service.ts**

Driver

None

---

# OBJETIVO DO FEATURE CONTRACT  
  
Este documento conecta:  
  
**feature_map**  
**↓**  
**menu_map**  
**↓**  
**database_schema**  
**↓**  
**services**  
**↓**  
**drivers**  
  
Ele garante que **cada funcionalidade do sistema possua um contrato explícito**.  
  
Isso reduz:  
  
- inconsistências arquiteturais  
- invenção de endpoints  
- invenção de tabelas  
- implementação fora do padrão  
