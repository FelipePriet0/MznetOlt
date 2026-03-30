# Mermaid Diagrams

Diagramas em formato Mermaid para referência visual.

## Component Diagram

```mermaid
graph TB
    Client["🖥️ Client<br/>(Browser/Mobile)"]
    Frontend["⚛️ Frontend<br/>(Next.js)"]
    API["🔌 API<br/>(Node.js)"]
    DB["🗄️ PostgreSQL<br/>(Database)"]
    OLT["🔌 OLT Hardware"]
    Workers["⚙️ Workers<br/>(Job Queue)"]

    Client -->|HTTP/WS| Frontend
    Frontend -->|REST API| API
    API -->|SQL| DB
    API -->|TCP/Serial| OLT
    API -->|Queue| Workers
    Workers -->|SQL| DB
    Workers -->|TCP/Serial| OLT
```

## Feature Architecture

```mermaid
graph TB
    Features["🎯 Features"]

    Features -->|Domain| Dashboard["📊 dashboard/"]
    Features -->|Domain| OLT["🔌 olt/"]
    Features -->|Domain| ONU["📱 onu/"]
    Features -->|Domain| Auth["🔐 authorization/"]
    Features -->|Domain| Settings["⚙️ settings/"]
    Features -->|Domain| Reports["📈 reports/"]
    Features -->|Domain| Diag["🔍 diagnostics/"]

    OLT -->|Feature| ListOLT["list-olts"]
    OLT -->|Feature| DetailsOLT["olt-details"]

    ONU -->|Feature| ListONU["list-onus"]
    ONU -->|Feature| DetailsONU["onu-details"]
```

## Data Flow (Simple Feature)

```mermaid
sequenceDiagram
    Client->>Frontend: Click "List OLTs"
    Frontend->>API: GET /api/olts
    API->>API: Validate JWT
    API->>API: Check RLS
    API->>DB: SELECT * FROM olts
    DB-->>API: Return rows
    API-->>Frontend: Return JSON
    Frontend-->>Client: Render UI
```

## OLT Hierarchy

```mermaid
graph TD
    OLT["🔌 OLT<br/>(Optical Line Terminal)"]

    OLT --> Board1["📦 Board 1"]
    OLT --> Board2["📦 Board 2"]

    Board1 --> Port1["🔗 PON Port 1"]
    Board1 --> Port2["🔗 PON Port 2"]

    Board2 --> Port3["🔗 PON Port 3"]
    Board2 --> Port4["🔗 PON Port 4"]

    Port1 --> ONU1["📱 ONU 1"]
    Port1 --> ONU2["📱 ONU 2"]
    Port2 --> ONU3["📱 ONU 3"]
    Port3 --> ONU4["📱 ONU 4"]
```

## Role-Based Access Control

```mermaid
graph LR
    User["👤 User"]

    User -->|has| AdminRole["👨‍💼 Admin"]
    User -->|has| TechRole["🔧 Technician"]
    User -->|has| ViewerRole["👁️ Viewer"]

    AdminRole -->|can| AdminAction["✅ Full Access"]
    TechRole -->|can| TechAction["⚠️ Limited Access"]
    ViewerRole -->|can| ViewerAction["🔒 Read-Only"]

    AdminAction --> OLTs["View/Edit/Delete OLTs"]
    TechAction --> OLTsView["View/Diagnose OLTs"]
    ViewerAction --> OLTsRO["View OLTs"]
```

## Worker Jobs

```mermaid
graph TB
    Queue["📋 Job Queue"]

    Queue --> Telemetry["📊 Telemetry Job"]
    Queue --> AutoAuth["🔐 Auto Authorization Job"]
    Queue --> StatusRefresh["🔄 Status Refresh Job"]

    Telemetry -->|collects| Metrics["Metrics Data"]
    AutoAuth -->|authorizes| NewDevices["New Devices"]
    StatusRefresh -->|updates| Status["Device Status"]

    Metrics --> DB["PostgreSQL"]
    NewDevices --> DB
    Status --> DB
```

## Feature Structure Example

```mermaid
graph TD
    Feature["🎯 Feature: list-olts"]

    Feature -->|exports| Index["index.ts"]
    Feature -->|defines| Types["types.ts"]
    Feature -->|validates| Schema["schema.ts"]
    Feature -->|accesses| Repo["repository.ts"]
    Feature -->|implements| Service["service.ts"]
    Feature -->|controls| Perms["permissions.ts"]

    Index -->|public api|_["Public Interface"]
    Types -->|data structures|_
    Schema -->|Zod validation|_
    Repo -->|data access|_
    Service -->|business logic|_
    Perms -->|RLS checks|_
```

## Frontend Structure

```mermaid
graph TB
    App["📱 App"]

    App -->|render| Layout["Layout Component"]
    App -->|serve| Pages["Pages"]
    App -->|provide| Hooks["Custom Hooks"]
    App -->|define| Types["Types"]
    App -->|display| Components["Components"]

    Layout --> Sidebar["Sidebar Nav"]
    Layout --> Main["Main Content"]

    Pages -->|organize| Features["Features"]
    Features --> OLT["olt/"]
    Features --> ONU["onu/"]

    Components --> UI["UI Components"]
    Components --> Shared["Shared Components"]

    Hooks --> Custom["useOLTs, useONUs..."]
    Types --> Domain["Domain Types"]
```

## Próximas Adições

- Diagramas de autenticação (OAuth, JWT)
- Diagramas de deployment
- Diagramas de escalabilidade
- Diagramas de disaster recovery
