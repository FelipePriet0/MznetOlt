# Architecture TODO

Lista de melhorias arquiteturais planejadas para execução futura.

---

## 1. Reorganizar features achatadas

Mover features que estão diretamente em `features/` para domínios corretos.

Exemplos atuais:

- dashboard-onu-auth-per-day
- dashboard-onu-signal-stats
- dashboard-recent-events
- dashboard-summary
- dashboard-sync-status
- get-onu-details
- list-configured-onus
- list-unconfigured-onus
- search-onu-by-serial

Objetivo:

Padronizar estrutura:

features/
  dashboard/
  onu/
  olt/
  auth/

---

## 2. Padronizar naming das services

Hoje existem services que não seguem o padrão:

executeSomething()

Padronizar todos os services para:

executeLogin
executeListUsers
executeAuthorizeOnu
executeListOnus

---

## 3. Padronizar tratamento de erro em repositories

Alguns repositories não seguem o padrão:

if (error) throw error

Revisar todos os repositories e garantir consistência.

---

## 4. Revisar auditoria de arquitetura

Após refatorações estruturais:

- rodar novamente `audit_architecture.py`
- garantir zero erros estruturais