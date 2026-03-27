
# Como a Inteligência do Sistema Funciona

> Este documento explica a arquitetura da "inteligência" do MznetOLT — o que ela é, o que ela não é, e por que foi feita assim.

---

## O que NÃO é

Não é IA generativa. Não é um LLM (tipo ChatGPT) decidindo o que fazer.

Isso importa porque IA generativa:
- Pode "alucinar" — inventar diagnósticos com confiança
- É difícil de auditar ("por que ele abriu esse ticket?")
- É caro para rodar em escala (centenas de ONUs avaliadas a cada hora)
- Não é determinístico — a mesma entrada pode gerar saídas diferentes

Para um sistema que aciona técnicos de campo com base em dados, isso é inaceitável.

---

## O que É — Dois níveis separados

### Nível 1: O Job Determinístico (o cérebro)

Um **job** é um processo que roda automaticamente em intervalos regulares — no nosso caso, a cada hora.

Ele não "pensa". Ele **executa regras** sobre dados. Assim:

```
Para cada ONU ativa no banco:
  1. Busca as últimas N amostras de sinal (rx_dbm)
  2. Calcula a inclinação da tendência
  3. Verifica se a inclinação ultrapassa o limiar configurado
  4. Se sim → cria ticket (se não existir um aberto para essa ONU)
  5. Repete para flapping, TX, tráfego zerado
```

É o mesmo princípio de um semáforo: não há inteligência — há regras claras aplicadas consistentemente.

**Por que isso é uma força, não uma fraqueza:**
- Toda decisão é auditável: "o ticket foi aberto porque o sinal caiu 1.2 dBm/dia por 5 dias"
- Os thresholds são configuráveis pelo provedor
- Sem surpresas, sem comportamento inesperado
- Roda em milissegundos, custa centavos

---

### Nível 2: A IA Generativa (o redator)

O LLM entra **depois** que o job tomou a decisão. Ele não decide nada. Ele **escreve**.

```
Job detectou: sinal caindo 1.2 dBm/dia, ONU na Rua das Flores 123, PON 3/0/4
                    ↓
LLM recebe esses fatos estruturados
                    ↓
LLM escreve: "Sinal em queda progressiva há 5 dias. Provável causa: conector
              oxidado ou emenda degradada. Verificar caixa de emenda mais
              próxima ao endereço do cliente."
```

O técnico recebe uma mensagem em português claro, não uma tabela de números.

**O LLM nunca:**
- Decide se o ticket deve ser aberto
- Inventa dados que não existem
- Tem acesso direto ao banco

**O LLM sempre:**
- Recebe apenas os fatos já apurados pelo job
- Transforma números em linguagem humana
- Sugere ações baseadas no padrão detectado

---

## A Separação é Fundamental

```
┌──────────────────────────────────────────────────────────────┐
│                    DECISÃO (determinístico)                   │
│                                                              │
│  Dados do banco → Regras → Ticket aberto ou não              │
│                                                              │
│  "O sinal caiu X dBm/dia por Y dias → abrir ticket"         │
│  Auditável. Previsível. Configurável.                        │
└──────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────┐
│                  COMUNICAÇÃO (IA generativa)                  │
│                                                              │
│  Fatos estruturados → LLM → Texto em português               │
│                                                              │
│  "Provável conector oxidado. Verificar poste X."             │
│  Útil. Legível. Nunca responsável pela decisão.              │
└──────────────────────────────────────────────────────────────┘
```

---

## Os Detectores (regras do job)

### Detector 1 — Tendência de queda de sinal
**Dados:** `onu_signal_samples.rx_dbm`
**Lógica:** regressão linear sobre as últimas N amostras; inclinação negativa além do threshold indica tendência real.
**Parâmetros:** janela (dias), inclinação mínima (dBm/dia), mínimo de pontos.
**Distingue:** ruído térmico (oscila sem tendência) vs. queda consistente.
**Urgência:** medium (alta se inclinação > 2× threshold ou RX já próximo do crítico)

---

### Detector 2 — Laser TX morrendo
**Dados:** `onu_signal_samples.tx_dbm` + `rx_dbm`
**Lógica:** TX em queda com RX estável → provável falha no transmissor da ONU; TX em queda com RX em queda → provável atenuação na fibra.
**Parâmetros:** janela (dias), queda mínima de TX, correlação com RX.
**Distingue:** falha no equipamento vs. problema de enlace.
**Urgência:** high (critical se TX abaixo de limite operacional)

---

### Detector 3 — Flapping (quedas repetidas)
**Dados:** `network_events` (transições de status)
**Lógica:** conta online→offline em janela móvel; se > N no período, sinaliza.
**Parâmetros:** janela (horas), N quedas, mínimo de estabilidade entre eventos.
**Distingue:** reboot/atualização isolada vs. instabilidade crônica.
**Urgência:** high (critical se múltiplas ONUs da mesma PON afetadas)

---

### Detector 4 — ONU fantasma (online sem tráfego)
**Dados:** `onu_traffic_samples`, status atual, horário.
**Lógica:** online + RX ok + tráfego < threshold por X horas em horário comercial.
**Parâmetros:** janela, threshold de tráfego, faixa horária útil.
**Distingue:** uso noturno/ocioso vs. anomalia operacional.
**Urgência:** low (medium se persistente > 24–48h)

---

### Detector 5 — Queda reativa (evento instantâneo)
**Dados:** `network_events`, correlação PON/OLT.
**Lógica:** transição online→offline dispara evento; correlaciona simultaneidade por PON/OLT.
**Parâmetros:** janela de correlação (min), limiar de ONUs afetadas.
**Distingue:** queda isolada vs. incidente coletivo (PON/OLT).
**Urgência:**
- 1 ONU isolada: medium
- ≥3 ONUs na mesma PON: high
- Muitas ONUs/OLT inteira: critical

---

## Fluxo completo de uma detecção

```
1. Job roda (a cada 1 hora)
       ↓
2. Busca todas as ONUs ativas
       ↓
3. Para cada ONU, roda os 5 detectores
       ↓
4. Algum detector disparou?
   ├── NÃO → nada acontece
   └── SIM → já existe ticket aberto para essa ONU?
              ├── SIM → ignora (deduplicação)
              └── NÃO → cria ticket com fatos estruturados
                              ↓
                         LLM recebe os fatos
                              ↓
                         LLM escreve diagnóstico em português
                              ↓
                         Ticket salvo no banco
                              ↓
                         Notificação enviada (WhatsApp/email)
```

---

## Por que não usar IA desde o início?

A tentação é colocar um LLM para "analisar" o sinal diretamente. Isso seria um erro por três razões:

1. **Custo de escala:** um provedor com 5.000 ONUs, rodando a cada hora, são 5.000 chamadas de API por hora. Caro e lento.
2. **Auditabilidade zero:** "por que esse ticket foi aberto?" — o LLM não sabe explicar de forma determinística.
3. **Deriva de comportamento:** o mesmo sinal em dias diferentes pode gerar diagnósticos diferentes. Técnicos perdem a confiança no sistema.

A IA generativa é poderosa para linguagem. Péssima para ser o árbitro de decisões baseadas em dados.

---

## Evolução futura

Com o tempo, o campo "o que o técnico encontrou" em cada ticket resolvido vira um dataset de treinamento:

```
Padrão de sinal X → técnico encontrou "conector oxidado" (200 casos)
Padrão de sinal Y → técnico encontrou "emenda mal feita" (87 casos)
```

Isso permite afinar o diagnóstico automático do LLM com exemplos reais do próprio provedor. O sistema fica mais inteligente quanto mais é usado — sem precisar retreinar nada, só melhorando o prompt com exemplos históricos.
