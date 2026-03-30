# 🚀 Storybook - Quick Start

## ⚡ Comando para Rodar Storybook Localmente

Abra o PowerShell/Terminal na pasta `frontend/`:

```powershell
npm install
npm run storybook
```

Depois acesse:
```
http://localhost:6006
```

---

## 📊 O Que Você Vai Ver

Uma página com sidebar à esquerda mostrando:

```
📁 Components
  📄 Button
    ☆ Primary
    ☆ Secondary
    ☆ Outline
    ☆ Destructive
    ☆ Small
    ☆ Large
    ☆ AllVariants
    ☆ AllSizes

  📄 Card
    ☆ Basic
    ☆ WithHeader
    ☆ WithFooter
    ☆ Complete
    ☆ Grid

📁 Layout
  📄 Sidebar
    ☆ Default
    ☆ Mobile
    ☆ Tablet
```

Clique em qualquer um para ver o componente **isolado e interativo**.

---

## 🎨 O Que é Possível Fazer

1. **Ver componentes isolados** - Sem precisar rodar o Next.js inteiro
2. **Alterar propriedades em tempo real** - Via aba "Controls"
3. **Testar em diferentes tamanhos** - Desktop, Tablet, Mobile
4. **Ver documentação** - Aba "Docs"
5. **Dark mode** - Clique no ícone de lua

---

## 📁 Arquivos Criados

```
frontend/
├─ .storybook/
│  ├─ main.ts                 # Config do Storybook
│  └─ preview.ts              # Temas e estilos globais
│
├─ components/
│  ├─ shared/
│  │  ├─ button.tsx           # Componente Button
│  │  ├─ button.stories.tsx   # Stories do Button
│  │  ├─ card.tsx             # Componente Card
│  │  └─ card.stories.tsx     # Stories do Card
│  └─ layout/
│     └─ sidebar.stories.tsx  # Stories da Sidebar
│
└─ STORYBOOK_GUIDE.md         # Guia completo
```

---

## 🎯 Diferença: Frontend vs Storybook

| | Frontend (Next.js) | Storybook |
|---|---|---|
| **Comando** | `npm run dev` | `npm run storybook` |
| **Porta** | http://localhost:3000 | http://localhost:6006 |
| **O que mostra** | Aplicação completa | Componentes isolados |
| **Uso** | Testar fluxo completo | Testar componentes |
| **Rápido** | Mais lento | Muito rápido |

---

## 🔄 Workflow Recomendado

```bash
# Terminal 1: Desenvolver componente
npm run storybook

# Terminal 2: Rodar aplicação (quando precisar)
npm run dev
```

Assim você testa componentes no Storybook e vê como ficam na aplicação real.

---

## 📝 Adicionar Novo Componente

1. Crie o componente: `components/shared/meu-componente.tsx`
2. Crie a story: `components/shared/meu-componente.stories.tsx`
3. Recarregue Storybook (F5)
4. Pronto! ✨

---

**Próximo:** Abra o terminal e rode `npm run storybook` 🎨
