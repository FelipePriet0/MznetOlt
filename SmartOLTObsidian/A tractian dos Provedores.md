
Com a OLT em nossa mãos: Banco, código, etc. Tenho a liberdade de criar a tractian dos ISPs. Onde o sistema entende clientes que vão parar, pelo sinal, e já geram tickets para o Suporte técnico premeditar o problema, antes mesmo de acontecer. 

Vamos pensar e desenvolver essa ideia juntos.

---

## O que o sistema consegue VER hoje

Antes de falar em previsão, precisa entender o que temos. O sistema coleta, para cada ONU (roteador do cliente):

- **Sinal RX** (`rx_dbm`) — a potência do sinal que a ONU *recebe* da fibra, em dBm
- **Sinal TX** (`tx_dbm`) — a potência do sinal que a ONU *envia* de volta para a OLT
- **Status** — se a ONU está online, offline, ou em estado de erro
- **Uptime** — há quanto tempo está ligada sem cair
- **Tráfego** — bytes recebidos e enviados ao longo do tempo
- **Eventos** — histórico de quando mudou de status (caiu, voltou, etc.)
- **Distância** — o quão longe fisicamente a ONU está da OLT
- **Saúde da OLT** — CPU, memória, temperatura e status dos fans da OLT central

Tudo isso é amostrado ao longo do tempo, ou seja, temos séries históricas. Isso é a base de tudo.

---

## ✅ O que PODE ser premeditado

### 1. Degradação de sinal gradual (ALTO VALOR)
**O que é:** O sinal RX da ONU cai devagar ao longo de dias ou semanas.
**Por que acontece:** Conector sujo ou oxidado, emenda de fibra mal feita, dobramento excessivo do cabo.
**Como detectar:** Sinal que era -20 dBm vai caindo para -25, -27, -29 dBm progressivamente.
**Quando abrir ticket:** Antes de atingir o limiar crítico (geralmente -27 a -30 dBm dependendo da OLT).
**Confiabilidade:** ⭐⭐⭐⭐⭐ — O sinal conta exatamente o que está acontecendo na fibra.

---

### 2. Laser da ONU morrendo (ALTO VALOR)

**O que é:** O sinal TX (transmissão) da ONU começa a cair, mesmo com o RX estável.
**Por que acontece:** O laser dentro da ONU tem vida útil. Vai degradando antes de morrer.
**Como detectar:** TX caindo enquanto RX permanece estável = o problema é no equipamento do cliente, não na fibra.
**Quando abrir ticket:** Trocar a ONU antes que o cliente caia.
**Confiabilidade:** ⭐⭐⭐⭐⭐ — Diagnóstico preciso, diferencia problema de fibra vs. equipamento.

---

### 3. ONU "flapping" — caindo e voltando repetidamente (ALTO VALOR)

**O que é:** A ONU fica alternando entre online e offline várias vezes ao dia ou na semana.
**Por que acontece:** Conector fraco, fibra com microfissura, problema de energia na casa do cliente (tomada fraca/extensão ruim).
**Como detectar:** Histórico de eventos mostrando muitas transições de status em curto período.
**Quando abrir ticket:** Ao detectar mais de N quedas em X horas.
**Confiabilidade:** ⭐⭐⭐⭐ — Alta, mas pode ser problema elétrico (fora do nosso controle de fibra).

---

### 4. Queda de tráfego anormal para cliente ativo (MÉDIO VALOR)

**O que é:** A ONU está online e com sinal bom, mas o tráfego zerou ou caiu muito.
**Por que acontece:** Roteador do cliente com problema, cabo LAN partido, alguém desligou o roteador.
**Como detectar:** ONU com status online + sinal bom + tráfego perto de zero por período prolongado.
**Quando abrir ticket:** Pode ser um cliente que nem sabe que está sem internet.
**Confiabilidade:** ⭐⭐⭐ — Médio, pois pode ser cliente que simplesmente não está usando.

---

### 5. Sobrecarga em uma porta PON (MÉDIO VALOR)
**O que é:** Muitas ONUs na mesma porta PON consumindo tráfego alto ao mesmo tempo.
**Por que acontece:** Compartilhamento de banda (é a natureza do PON — várias ONUs dividem a mesma porta).
**Como detectar:** Soma do tráfego de todas as ONUs de uma PON próxima ao limite da porta.
**Quando agir:** Rebalancear ONUs entre portas PON antes de clientes reclamarem de lentidão.
**Confiabilidade:** ⭐⭐⭐ — Médio, depende de saber o limite real de cada porta.

---

### 6. OLT sobrecarregada (MÉDIO VALOR)
**O que é:** CPU, memória ou temperatura da OLT subindo progressivamente.
**Por que acontece:** Crescimento da rede sem upgrade de hardware, ou processo travado.
**Como detectar:** Séries históricas de `cpu_usage`, `memory_usage` e `temperature` com tendência crescente.
**Quando agir:** Antes de chegar no limite que causa instabilidade para todos os clientes.
**Confiabilidade:** ⭐⭐⭐⭐ — Alta para hardware, mas requer entender os limites normais por modelo de OLT.

---

## ❌ O que NÃO pode ser premeditado — mas pode ser detectado e agido imediatamente

Esses eventos não têm padrão de degradação prévia — acontecem instantaneamente. Não dá para prever. **Mas dá para abrir ticket automático no segundo em que acontecem, sem o cliente precisar ligar.**

Esse é o ponto chave: o valor não está só em prever. Está em **eliminar o cliente do fluxo de abertura do chamado**.

**Fluxo atual (ruim):**
```
ONU cai → cliente percebe → cliente liga → suporte abre ticket → técnico vai
                         (pode demorar horas)
```

**Fluxo com detecção reativa automática:**
```
ONU cai → sistema detecta → ticket aberto → técnico acionado
          (segundos depois)   (antes do cliente ligar)
```

---

### Inteligência por correlação de quedas simultâneas

O sistema não abre ticket cego. Ele cruza a queda com o contexto:

| O que caiu | Diagnóstico automático |
|---|---|
| 1 ONU isolada | Provável problema no cliente (energia, roteador) |
| 3+ ONUs da mesma PON ao mesmo tempo | Provável corte na fibra do tronco dessa PON |
| Todas as ONUs de uma OLT | OLT com problema ou queda de energia no site |

Isso já chega no ticket com o diagnóstico certo, não só "ONU offline".

---

### 1. Corte de fibra físico (acidente)
**Não prevê, mas detecta:** múltiplas ONUs da mesma PON caem juntas → ticket com "provável corte no tronco PON X".
**Ação sugerida no ticket:** verificar o trecho de cabo da PON afetada.

---

### 2. Queda de energia na casa do cliente
**Não prevê, mas detecta:** ONU isolada vai offline → ticket com "provável queda de energia ou desligamento no cliente".
**Detalhe:** se voltar sozinha em menos de 30 minutos, ticket é fechado automaticamente (foi energia).

---

### 3. Problema no roteador/CPE do cliente (atrás da ONU)
**Não prevê:** a ONU fica online, sinal perfeito — o roteador é invisível para nós.
**Limitação real:** esse cenário só é detectável quando o cliente liga. É o único caso onde o cliente ainda precisa reportar.

---

### 4. Problemas externos (peering, DNS, CDN)
**Não prevê, difícil de detectar:** a rede interna pode estar perfeita.
**Sinal indireto possível:** se muitas ONUs de OLTs diferentes caem o tráfego ao mesmo tempo → pode indicar problema de uplink/peering. Não é conclusivo, mas vale registrar.

---

### 5. Vandalismo ou furto de equipamento
**Não prevê, mas detecta:** ONU some do mapa permanentemente → ticket gerado. Técnico vai verificar.

---

### 6. Eventos climáticos severos (tempestades, enchentes)
**Não prevê, mas detecta em massa:** dezenas de ONUs caem ao mesmo tempo em região geográfica próxima → ticket de incidente em massa, não individual.
**Valor:** o suporte já sabe que é evento climático antes de receber 200 ligações.

---

## Conclusão: onde está o dinheiro

O maior valor preditivo está no **sinal RX ao longo do tempo**. É a métrica mais honesta da saúde da fibra. A maioria dos problemas de fibra (conector sujo, emenda ruim, cabo dobrado) se manifesta como queda gradual de sinal **dias ou semanas antes** da ONU cair de vez.

A lógica central do sistema seria:

> "Se o sinal desta ONU está em tendência de queda, abra um ticket antes que o cliente ligue reclamando."

O resto (flapping, TX caindo, tráfego zerado) são sinais complementares que enriquecem o diagnóstico.

---

## Como a detecção funcionaria na prática

### A lógica não é um alarme pontual — é uma tendência

O erro mais comum em sistemas de alerta é olhar para o valor atual e comparar com um limite fixo. Exemplo: "se sinal < -27 dBm, alerta". Isso é reativo — o cliente já pode estar quase caindo.

O certo é olhar para a **direção** do sinal ao longo do tempo. É isso que a Tractian faz com vibração de motores: não alarma porque a vibração está alta, alarma porque ela está *crescendo* de forma consistente.

> **Princípio:** não olhe para onde o sinal está. Olhe para onde ele está indo.

---

### Detector 1 — Tendência de queda de sinal (o principal)

**Como funciona:**
Pega as últimas N amostras de `rx_dbm` de uma ONU e calcula se a linha de tendência aponta para baixo de forma consistente.

**Exemplo concreto:**
```
Semana 1: -20 dBm
Semana 2: -21 dBm
Semana 3: -23 dBm
Semana 4: -25 dBm  ← ticket gerado aqui
Semana 5: -28 dBm  ← cliente cai aqui (tarde demais)
```

**Parâmetros que o provedor precisa configurar:**
- Janela de análise (ex: últimos 7 dias)
- Inclinação mínima para considerar "tendência real" (evita alertar por variações normais do dia a dia)
- Limiar de urgência (ex: se sinal já está abaixo de -25 dBm E caindo, ticket é urgente)

**Falso positivo típico:** variação de temperatura ambiente (sinal cai levemente à noite no frio). Precisa de um filtro de sazonalidade ou janela mínima de 2-3 dias.

---

### Detector 2 — Flapping (quedas repetidas)

**Como funciona:**
Conta quantas vezes uma ONU mudou de status online→offline nas últimas X horas.

**Parâmetros:**
- Janela de tempo (ex: últimas 24h)
- Limiar de quedas (ex: 3+ quedas = ticket)
- Cooldown (não gerar segundo ticket se já existe um aberto para essa ONU)

**Diagnóstico no ticket:** separar automaticamente se outras ONUs da mesma PON também caíram no mesmo período → se sim, problema é na fibra do tronco, não na ONU específica.

---

### Detector 3 — Laser TX morrendo

**Como funciona:**
Monitora `tx_dbm` com a mesma lógica de tendência, mas cruza com `rx_dbm` estável para confirmar que o problema é na ONU, não na fibra.

**Regra:** TX caindo + RX estável = ONU com problema. TX caindo + RX caindo = problema na fibra.

---

### Detector 4 — ONU fantasma (online mas sem tráfego)

**Como funciona:**
ONU com status `online` + sinal dentro do normal + tráfego abaixo de X bytes nas últimas Y horas.

**Cuidado:** horário comercial vs. madrugada é diferente. Um cliente sem tráfego às 3h da manhã é normal. Às 14h, é suspeito.

**Parâmetros:** threshold de tráfego mínimo, janela horária de verificação.

---

## O sistema de tickets

### Onde os tickets vivem?

Três opções, em ordem de complexidade:

| Opção | Como funciona | Prós | Contras |
|---|---|---|---|
| **Interno (MznetOLT)** | Tabela `diagnostic_tickets` no próprio banco | Integrado, sem dependência externa | Precisa construir a UI |
| **WhatsApp/Telegram** | Bot manda mensagem para grupo do suporte | Zero UI, adoção imediata | Sem controle de status, fácil de perder |
| **Integração externa** | Zendesk, Freshdesk, etc. via webhook | Fluxo profissional já pronto | Custo, dependência de terceiro |

**Recomendação para começar:** interno no MznetOLT, com notificação por webhook para WhatsApp. Simples de construir e fácil de adotar.

---

### O que um ticket precisa ter

```
[ALERTA PREVENTIVO] ONU degradando — João Silva
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cliente:     João Silva
Endereço:    Rua das Flores, 123
ONU Serial:  ABCD1234EFGH
OLT / PON:  OLT-Centro / PON 3/0/4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Diagnóstico: Sinal RX em queda consistente há 5 dias
  Há 5 dias:  -21 dBm  (normal)
  Há 3 dias:  -23 dBm
  Hoje:       -26 dBm  ⚠️
  Tendência:  -1,0 dBm/dia → estimativa de queda em ~2 dias
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Provável causa: conector sujo ou emenda degradada
Ação sugerida:  verificar caixa de emenda mais próxima
```

---

### Fluxo de vida de um ticket

```
GERADO (automático)
    ↓
ABERTO → técnico visualiza e confirma que vai atender
    ↓
EM CAMPO → técnico está no local
    ↓
RESOLVIDO → técnico registra o que encontrou (campo de observação)
    ↓
FECHADO → sistema monitora por 48h para garantir que não voltou
```

O campo "o que foi encontrado" é ouro: ao longo do tempo, o sistema aprende quais padrões de sinal levam a quais causas reais, e pode melhorar o diagnóstico automático.

---

## O que precisamos construir (visão geral)

### No banco de dados
- Tabela `diagnostic_rules` — regras configuráveis por provedor (thresholds, janelas)
- Tabela `diagnostic_tickets` — tickets gerados, com status e histórico
- Tabela `ticket_events` — log de ações (gerado, aberto, resolvido, etc.)

### No backend
- Job recorrente (roda a cada hora) que avalia todas as ONUs ativas contra as regras
- Lógica de tendência sobre `onu_signal_samples`
- Lógica de contagem de flapping sobre `network_events`
- Criação automática de ticket quando regra é violada
- Deduplicação (não abrir novo ticket se já existe um aberto para a mesma ONU)

### No frontend
- Tela de tickets (lista, filtros por status/urgência/OLT)
- Detalhe do ticket com gráfico de sinal embutido
- Ação do técnico (confirmar, resolver, registrar observação)
- Dashboard com contadores (tickets abertos, resolvidos hoje, tempo médio de resolução)

