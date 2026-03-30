# Pendências de Integração CLI/OLT

> **Para o gestor de rede:** Os itens abaixo exigem acesso direto ao OLT via SSH/SNMP/CLI ou agente de coleta instalado na rede do provedor. Eles não podem ser obtidos só pelo banco de dados.

---

## 1. Potência TX da ONU (ONU → OLT)

**O que é:** Sinal de transmissão da ONU em direção ao OLT (em dBm).
**Onde aparece:** Painel "Obter Status" → Estado óptico → "TX Power (ONU → OLT)"
**Por que não funciona:** O banco só armazena `rx_dbm` (sinal recebido pelo OLT). O TX é lido diretamente no OLT via CLI.

**Comando Huawei exemplo:**
```
display ont optical-info [frame]/[slot]/[port] [ont-id]
```
**Ação necessária:**
- Criar um agente de coleta (script Python/Go) que faça SSH no OLT periodicamente
- Gravar `tx_dbm` na tabela `onu_signal_history` (adicionar coluna `tx_dbm float8`)
- Ou adicionar coluna `last_tx_power` na tabela `onus`

---

## 2. Temperatura da ONU

**O que é:** Temperatura interna do módulo óptico da ONU (°C).
**Onde aparece:** Painel "Obter Status" → Estado óptico → "Temperatura"
**Comando Huawei exemplo:**
```
display ont optical-info [frame]/[slot]/[port] [ont-id]
```
**Ação necessária:** Mesmo agente acima. Armazenar em `onu_signal_history` como coluna `temperature_c float4`.

---

## 3. Distância ONU-OLT

**O que é:** Distância estimada entre a ONU e o OLT em km (calculada pelo OLT via tempo de propagação).
**Onde aparece:** Painel "Obter Status" → Estado óptico → "Distância"
**Comando Huawei exemplo:**
```
display ont info [frame]/[slot]/[port] [ont-id]
```
Campo: `ONU distance(m)`
**Ação necessária:** Armazenar em coluna `distance_m int` na tabela `onus`.

---

## 4. Interfaces LAN da ONU

**O que é:** Status das portas LAN/ETH da ONU em tempo real (velocidade negociada, estado físico, pacotes TX/RX).
**Onde aparece:** Seção "Portas Ethernet" no detalhe da ONU
**Observação:** Hoje o banco tem `onu_ethernet_ports` com dados estáticos (modo, VLAN). Os dados em tempo real precisam de CLI.

**Comando Huawei exemplo:**
```
display ont port state [frame]/[slot]/[port] [ont-id] eth-port all
```
**Ação necessária:** Polling periódico e atualização de `onu_ethernet_ports.link_state`, `.speed_mbps`.

---

## 5. Tabela de MACs

**O que é:** Endereços MAC aprendidos nas portas da ONU.
**Onde aparece:** Futuro painel "MACs" no detalhe da ONU (não implementado ainda na UI)
**Comando Huawei exemplo:**
```
display mac-address ont [frame]/[slot]/[port] [ont-id]
```
**Ação necessária:** Criar tabela `onu_mac_table (id, onu_id, mac_address, port, vlan_id, collected_at)` e popular via coleta.

---

## 6. Fabricante e Modelo da ONU

**O que é:** Vendor ID e modelo do equipamento (ex: ZTE F6600, Huawei EG8145V5).
**Onde aparece:** Modal "Informações SW" → Fabricante / Modelo
**Causa:** A tabela `onu_types` foi removida na migration 0018. Os campos `onu_vendor`/`onu_model` não existem mais na tabela `onus`.
**Ação necessária:** Recriar tabela `onu_types (id, vendor, model)` e popular via cadastro manual ou coleta CLI, ou adicionar colunas `vendor varchar` e `model varchar` direto na tabela `onus`.

---

## 7. Versão de Firmware / Software da ONU

**O que é:** Versão exata do firmware da ONU (ex: `V3R016C10S115`).
**Onde aparece:** Modal "Informações SW" → campo "Firmware"
**Atualmente retorna:** `null` com nota "Requer CLI OLT"
**Comando Huawei exemplo:**
```
display ont version [frame]/[slot]/[port] [ont-id]
```
Campos relevantes: `Vendor-ID`, `ONU Version`, `Software Version`, `Hardware Version`
**Ação necessária:** Armazenar em colunas `firmware_version varchar` e `hardware_version varchar` na tabela `onus`, atualizar via coleta.

---

## 8. Tráfego em Tempo Real (AO VIVO)

**O que é:** Gráfico Mbps upload/download em tempo real.
**Onde aparece:** Modal "AO VIVO"
**Atualmente:** A tabela `onu_traffic_samples` existe mas está vazia.

**Estrutura da tabela (já criada):**
```sql
onu_traffic_samples (id, onu_id, rx_bytes, tx_bytes, rx_mbps, tx_mbps, collected_at)
```

**Ação necessária:** Agente de coleta que execute periodicamente (ex: a cada 60s):
```
display statistics ont-line [frame]/[slot]/[port] [ont-id]
```
E insira uma linha em `onu_traffic_samples` com os deltas calculados em Mbps.

---

## 9. Contadores de erro (opcional/futuro)

**O que é:** BIP errors, FEC errors, LOSi, LOFi — indicadores de qualidade do link óptico.
**Ação necessária:** Coletar via CLI/SNMP e armazenar em `onu_signal_history` ou tabela dedicada.

---

## Arquitetura sugerida para o agente de coleta

```
[Agente Python/Go]
    │
    ├─ SSH para cada OLT (paramiko / golang.org/x/crypto/ssh)
    │   └─ Executa comandos CLI por ONU
    │
    └─ Grava no Supabase via REST API ou postgres direto
        ├─ onu_signal_history (rx_dbm, tx_dbm, temperature_c, distance_m)
        ├─ onu_traffic_samples (rx_mbps, tx_mbps)
        └─ onus (firmware_version, hardware_version, distance_m)
```

**Intervalo recomendado:**
- Sinal óptico: a cada 5 minutos
- Tráfego: a cada 1 minuto (ou on-demand quando AO VIVO ativo)
- Firmware/versão: a cada 24 horas

---

## Status atual no sistema

| Funcionalidade     | Status                | Bloqueio                    |
| ------------------ | --------------------- | --------------------------- |
| RX Power           | ✅ Funcionando (banco) | —                           |
| TX Power           | ⚠️ Placeholder `null` | CLI OLT                     |
| Temperatura        | ⚠️ Placeholder        | CLI OLT                     |
| Distância          | ⚠️ Placeholder        | CLI OLT                     |
| Fabricante/Modelo  | ⚠️ Placeholder `null` | Tabela `onu_types` removida |
| Firmware           | ⚠️ Placeholder `null` | CLI OLT                     |
| Tráfego AO VIVO    | ⚠️ Tabela vazia       | Agente coleta               |
| MACs               | ❌ Não implementado    | CLI OLT + tabela            |
| Status básico      | ✅ Funcionando (banco) | —                           |
| Config em execução | ✅ Funcionando (banco) | —                           |
| Portas Ethernet    | ✅ Funcionando (banco) | —                           |
