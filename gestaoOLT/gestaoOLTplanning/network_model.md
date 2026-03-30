# Network Model

Descrição da hierarquia e componentes de rede no SmartOLT.

## Hierarquia de Equipamentos

```
┌─────────────────────────────────────────────┐
│          OLT                                │
│  (Optical Line Terminal)                    │
│  - Agregador de clientes                    │
│  - Gerencia múltiplos boards                │
│  - IP/Nome de identificação                 │
│  - Status e healthcheck                     │
└─────────────────────────────────────────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
    ┌────▼──────────┐                  ┌──────▼─────────┐
    │    Board 1    │                  │    Board 2     │
    │ (Módulo/Slot) │                  │ (Módulo/Slot)  │
    │ - Indice      │                  │ - Indice       │
    │ - Tipo        │                  │ - Tipo         │
    └────┬──────────┘                  └────┬───────────┘
         │                                  │
      ┌──┴──────────┐                    ┌──┴──────────┐
      │             │                    │             │
  ┌───▼──┐    ┌─────▼──┐            ┌───▼──┐    ┌─────▼──┐
  │PON P1│    │PON P 2 │            │PON P1│    │PON P 2 │
  │(Port)│    │(Port)  │            │(Port)│    │(Port)  │
  └───┬──┘    └──┬─────┘            └───┬──┘    └──┬─────┘
      │         │                       │         │
   ┌──┴──┐   ┌──┴──┐              ┌──┴──┐    ┌──┴──┐
   │ONU 1│   │ONU 2│              │ONU 3│    │ONU 4│
   │     │   │     │              │     │    │     │
   └─────┘   └─────┘              └─────┘    └─────┘
```

## Componentes

### OLT (Optical Line Terminal)
- **Função**: Terminal central da rede óptica
- **Responsável por**: Agregação de clientes, gerenciamento de tráfego
- **Atributos**: ID, IP, Modelo, Firmware, Status
- **Relacionamento**: Um para Muitos com Boards

### Board (Módulo/Placa)
- **Função**: Módulo ou placa dentro de um OLT
- **Responsável por**: Gerenciar portas PON
- **Atributos**: Índice, Tipo, Status, Firmware
- **Relacionamento**: Muitos para Um com OLT, Um para Muitos com PON Ports

### PON Port (Porta PON)
- **Função**: Porta de saída PON na placa
- **Responsável por**: Conectar múltiplas ONUs
- **Atributos**: Índice/Número, Status, Capacidade
- **Relacionamento**: Muitos para Um com Board, Um para Muitos com ONUs

### ONU (Optical Network Unit)
- **Função**: Unidade terminal do cliente
- **Responsável por**: Conectar cliente à rede
- **Atributos**: ID, Serial, Status, IP Cliente, Localização
- **Relacionamento**: Muitos para Um com PON Port

## Fluxo de Dados

1. Clientes conectam ao **ONU**
2. ONUs conectam a uma **PON Port**
3. PON Port reside em um **Board**
4. Board faz parte de um **OLT**
5. OLT agregador de tráfego para rede

## Características de Rede

- **Topologia**: Ponto a Multiponto (P2MP)
- **Protocolo**: GPON/XGPON/XGS-PON
- **Capacidade por PON**: Típicamente 32-128 ONUs
- **Distância**: Até 20km

## Próximas Definições

- Parâmetros de desempenho por componente
- Limites e alertas
- Métricas de monitoramento
