# Integração WhatsApp Business + Agendamento de Visitas

## Objetivo

Quando o sistema de diagnóstico (Tractian dos Provedores) detecta uma anomalia em uma ONU, ele notifica o cliente automaticamente via WhatsApp — antes do cliente ligar — e coleta disponibilidade para visita técnica.

---

## Stack decidido

| Peça | Solução |
|---|---|
| ERP | MK-Auth |
| Bridge de dados do cliente | FastAPI (a construir internamente) |
| Mensageria | WhatsApp Business API — oficial Meta (Cloud API) |
| Agendamento atual | Google Sheets (migrar futuramente) |

---

## Fluxo completo

```
Job detecta anomalia na ONU
  └─ Busca número do cliente na FastAPI bridge
       GET /cliente/serial/{onu_serial}
       → { nome, telefone }
  └─ Abre ticket no banco (diagnostic_tickets)
  └─ LLM escreve diagnóstico em português
  └─ Envia template aprovado via Meta Cloud API
       "Olá {nome}, identificamos instabilidade na sua conexão.
        Nossa equipe já está verificando.
        Posso agendar uma visita técnica?"
  └─ Ticket atualizado com status "notificado"

Cliente responde no WPP
  └─ Meta envia webhook para o SmartOLT
  └─ Agente coleta data/hora disponível
  └─ Ticket atualizado com agendamento
  └─ Técnico notificado com rota do dia
```

---

## Restrição Meta (importante)

A **primeira mensagem** para um cliente sempre deve ser um **template pré-aprovado** pela Meta. Só após a resposta do cliente abre janela de conversa livre por 24h.

Template sugerido para aprovação:
> "Olá {{1}}, identificamos uma instabilidade na sua conexão de internet. Nossa equipe já está verificando. Posso agendar uma visita técnica para verificar no local?"

---

## O que precisa ser construído

### FastAPI bridge (equipe MK / infra)
- `GET /cliente/serial/{serial}` → `{ nome, telefone, contrato }`
- Autenticação via API key simples
- Pode ser um script Python mínimo consultando o banco do MK

### Backend SmartOLT — Fase 1
- [ ] Módulo `wpp-sender.ts` — chama Meta Cloud API com template
- [ ] Configurar env: `META_PHONE_NUMBER_ID`, `META_ACCESS_TOKEN`, `FASTAPI_BRIDGE_URL`
- [ ] Plugar no job: após abrir ticket → busca número → envia WPP
- [ ] Salvar status `notified_at` no ticket

### Backend SmartOLT — Fase 2
- [ ] Endpoint webhook `POST /webhook/wpp` — recebe respostas da Meta
- [ ] Agente de conversa: coleta data/hora → atualiza ticket com agendamento
- [ ] Notificação para técnico responsável

### Frontend
- [ ] Coluna "WPP" na tela de tickets (enviado / aguardando / agendado)
- [ ] Detalhe do ticket mostra histórico da conversa

---

## Fases

**Fase 1 — MVP de notificação (próximo)**
Job detecta → busca número → envia WPP → ticket marcado como notificado

**Fase 2 — Agente de agendamento**
Webhook recebe resposta → agente coleta horário → ticket com data de visita

**Fase 3 — Rota do técnico**
Integração com agenda (migrar de Sheets ou conectar via API)
