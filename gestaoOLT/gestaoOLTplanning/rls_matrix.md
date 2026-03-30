# RLS Matrix (Row Level Security)

Definição de permissões por role no SmartOLT.

## Roles

### 1. Admin (Administrador)
- Acesso total ao sistema
- Gerenciamento de usuários
- Configuração de OLTs
- Autorização manual e automática
- Todos os relatórios
- Acesso a diagnostics completo

### 2. Técnico (Technician)
- Visualizar OLTs e ONUs
- Autorizar novos dispositivos (conforme RLS)
- Diagnosticar problemas
- Ver relatórios técnicos
- Não pode: deletar OLTs, mudar configurações críticas

### 3. Leitor (Viewer/Read-Only)
- Visualizar dashboard
- Visualizar OLTs e ONUs (somente leitura)
- Ver relatórios (somente leitura)
- Não pode: fazer mudanças, diagnosticar, autorizar

## Matrix de Permissões

| Feature | Admin | Técnico | Leitor |
|---------|-------|---------|--------|
| **Dashboard** | ✅ | ✅ | ✅ |
| View Metrics | ✅ | ✅ | ✅ |
| View Alerts | ✅ | ✅ | ✅ |
| **OLTs** | ✅ | ✅ | ✅ |
| List OLTs | ✅ | ✅ | ✅ |
| View OLT Details | ✅ | ✅ | ✅ |
| Create OLT | ✅ | ❌ | ❌ |
| Edit OLT | ✅ | ❌ | ❌ |
| Delete OLT | ✅ | ❌ | ❌ |
| **ONUs** | ✅ | ✅ | ✅ |
| List ONUs | ✅ | ✅ | ✅ |
| View ONU Details | ✅ | ✅ | ✅ |
| Configure ONU | ✅ | ❌ | ❌ |
| **Authorization** | ✅ | ✅ | ❌ |
| View Requests | ✅ | ✅ | ❌ |
| Manual Approve | ✅ | ⚠️* | ❌ |
| Auto Rules | ✅ | ❌ | ❌ |
| **Settings** | ✅ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ |
| User Management | ✅ | ❌ | ❌ |
| **Reports** | ✅ | ✅ | ✅ |
| View Reports | ✅ | ✅ | ✅ |
| Generate Reports | ✅ | ✅ | ❌ |
| Export Data | ✅ | ⚠️* | ❌ |
| **Diagnostics** | ✅ | ✅ | ❌ |
| View Logs | ✅ | ✅ | ❌ |
| Run Tests | ✅ | ✅ | ❌ |

⚠️* = Permissão limitada (conforme RLS adicional)

## RLS Policies (PostgreSQL)

Estas policies serão implementadas no banco de dados:

### 1. Dashboard
- Admin: acesso total
- Técnico: visualizar apenas métricas
- Leitor: visualizar apenas métricas

### 2. OLTs
- Admin: criar, ler, editar, deletar
- Técnico: ler apenas
- Leitor: ler apenas

### 3. ONUs
- Admin: todos os acessos
- Técnico: ler, diagnosticar
- Leitor: ler apenas

### 4. Authorizations
- Admin: criar, ler, editar, deletar, aprovar
- Técnico: ler, aprovar com restrições
- Leitor: sem acesso

### 5. Settings
- Admin: todos os acessos
- Técnico: ler apenas (próprias configurações)
- Leitor: sem acesso

## Próximas Fases

1. **Fase 3**: Implementação de RLS em PostgreSQL
2. **Fase 4**: JWT com claims de role
3. **Fase 4**: Middleware de autorização no backend
4. **Fase 5**: Guards de permissão no frontend

## Notas de Implementação

- Usar `auth.uid()` em RLS policies
- Validar role em cada operação crítica
- Falha de permissão retorna 403 Forbidden
- Usar `features/<domínio>/permissions.ts` para lógica de autorização
