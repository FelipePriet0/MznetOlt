# Artifact Registry: repositório próprio para produção

Contexto
- Hoje estamos usando o repo automático do Cloud Run: `cloud-run-source-deploy` (região `southamerica-east1`).
- Funciona, mas não é ideal para produção: pouco controle, organização limitada e acoplado ao fluxo de deploy por código-fonte.

Objetivo
- Criar e adotar um repositório Docker próprio (sugestão: `containers`) no Artifact Registry em `southamerica-east1` para versionar imagens, controlar releases e facilitar rollback.

Passo a passo (Console)
1) Criar repositório
- Ir em Artifact Registry → Repositories
- “+ Create Repository”
- Format: Docker
- Location: southamerica-east1
- Name: `containers`
- Criar

2) Permissões (mínimas)
- Identificar a service account que roda no Cloud Run (ex.: `PROJECT_NUMBER-compute@developer.gserviceaccount.com` ou SA própria do serviço)
- Conceder à SA do Cloud Run o papel: `Artifact Registry Reader` (`roles/artifactregistry.reader`)
- Para CI/CD (quem faz build/push), conceder: `Artifact Registry Writer` (`roles/artifactregistry.writer`)

3) Padrão da imagem
- `southamerica-east1-docker.pkg.dev/mznetolt/containers/smartolt-backend:<tag>`

Passo a passo (CLI)
- Criar repo (se necessário):
```
gcloud artifacts repositories create containers \
  --repository-format=docker \
  --location=southamerica-east1 \
  --project=mznetolt
```
- Autenticar Docker para o host da região:
```
gcloud auth configure-docker southamerica-east1-docker.pkg.dev
```
- Build e push:
```
# na raiz do repo local
docker build -t southamerica-east1-docker.pkg.dev/mznetolt/containers/smartolt-backend:v1 smartolt/backend

docker push southamerica-east1-docker.pkg.dev/mznetolt/containers/smartolt-backend:v1
```

Convenções recomendadas
- Nome da imagem: `smartolt-backend`
- Tag: `semver` (ex.: `1.0.0`) ou `data+sha` (ex.: `2026-03-27_abcdef1`)
- Manter `latest` apenas como ponteiro, nunca como única referência de release

Deploy no Cloud Run usando o repo próprio
```
gcloud run deploy smartolt-backend \
  --project=mznetolt \
  --region=southamerica-east1 \
  --platform=managed \
  --allow-unauthenticated \
  --image=southamerica-east1-docker.pkg.dev/mznetolt/containers/smartolt-backend:v1 \
  --port=3001 \
  --set-env-vars SUPABASE_URL=https://<ref>.supabase.co,SUPABASE_ANON_KEY=<anon> \
  --set-secrets SUPABASE_SERVICE_ROLE_KEY=supabase-service-role-key:latest,JWT_SECRET=jwt-secret:latest \
  --health-check-path=/health
```

Migração segura (se já existe serviço rodando)
- Fazer o primeiro deploy apontando para a nova imagem (sem deletar nada)
- Validar `/health` e alguns endpoints críticos
- Manter a imagem anterior como fallback (rollback imediato com `gcloud run deploy --image=<antiga>`)

Governança e limpeza
- Ativar política de retenção/cleanup de imagens antigas (ou rotina manual mensal)
- Separar permissões: leitura para runtime, escrita apenas para CI/CD

Checklist rápido
- [ ] Repositório `containers` criado em `southamerica-east1`
- [ ] SA do Cloud Run com `roles/artifactregistry.reader`
- [ ] Pipeline/usuário de build com `roles/artifactregistry.writer`
- [ ] Tagging definido (semver ou data+sha)
- [ ] Comando de deploy atualizado para o novo path da imagem

Notas
- `PORT` é injetado pelo Cloud Run; o app já usa `env.PORT` e expõe `3001` no Dockerfile (ok)
- Healthcheck em `/health` já existe
- Secrets ideais no Secret Manager: `supabase-service-role-key`, `jwt-secret` (e opcional `openai_api_key`)
