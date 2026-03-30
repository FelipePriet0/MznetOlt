# 📖 Storybook Setup Guide

## O que é Storybook?

Storybook é uma ferramenta que permite você **visualizar componentes React isoladamente** sem precisar executar toda a aplicação.

Você pode:
- ✅ Ver componentes em diferentes estados
- ✅ Testar variações (sizes, colors, states)
- ✅ Documentar componentes
- ✅ Fazer testes visuais
- ✅ Compartilhar com o time

---

## 🚀 Como Rodar Storybook Localmente

### **Passo 1: Instalar Dependências (se não tiver feito)**

Na pasta `frontend/`:

```bash
npm install
```

### **Passo 2: Rodar Storybook**

Na pasta `frontend/`:

```bash
npm run storybook
```

Você verá algo como:

```
Storybook 7.6.0 started
👁  View your Storybook at http://localhost:6006
```

### **Passo 3: Abrir no Navegador**

Acesse: **http://localhost:6006**

---

## 📊 O Que Você Verá

Storybook mostrará uma interface com:

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar (Esquerda)          │    Preview (Direita)    │
├─────────────────────────────────────────────────────────┤
│                              │                          │
│  📁 Components                │  ┌────────────────────┐ │
│    📄 Button                  │  │                    │ │
│      ☆ Primary               │  │   Primary Button   │ │
│      ☆ Secondary             │  │                    │ │
│      ☆ Outline               │  └────────────────────┘ │
│      ☆ Destructive           │                          │
│      ☆ AllVariants           │  [Tabs: Canvas | Docs] │
│      ☆ AllSizes              │                          │
│                              │                          │
│    📄 Card                    │                          │
│      ☆ Basic                 │                          │
│      ☆ WithHeader            │                          │
│      ☆ WithFooter            │                          │
│      ☆ Complete              │                          │
│      ☆ Grid                  │                          │
│                              │                          │
│  📁 Layout                    │                          │
│    📄 Sidebar                 │                          │
│      ☆ Default               │                          │
│      ☆ Mobile                │                          │
│                              │                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Componentes Incluídos

### **Button** (components/shared/button.stories.tsx)

Variações disponíveis:
- **Primary** - Botão principal
- **Secondary** - Botão secundário
- **Outline** - Botão com borda
- **Destructive** - Botão de ação destrutiva
- **Small, Medium, Large** - Diferentes tamanhos
- **AllVariants** - Mostra todas as variações
- **AllSizes** - Mostra todos os tamanhos

### **Card** (components/shared/card.stories.tsx)

Variações disponíveis:
- **Basic** - Card simples
- **WithHeader** - Card com header
- **WithFooter** - Card com footer
- **Complete** - Card com header, content e footer
- **Grid** - 3 cards lado a lado

### **Sidebar** (components/layout/sidebar.stories.tsx)

Variações disponíveis:
- **Default** - Desktop view
- **Mobile** - Mobile view
- **Tablet** - Tablet view

---

## 🔧 Adicionar Novo Componente ao Storybook

### **Passo 1: Criar seu Componente**

Exemplo: `components/shared/badge.tsx`

```tsx
interface BadgeProps {
  children: string
  variant?: 'default' | 'success' | 'error'
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const colors = {
    default: 'bg-muted',
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[variant]}`}>
      {children}
    </span>
  )
}
```

### **Passo 2: Criar Story para o Componente**

Mesmo arquivo ou novo: `components/shared/badge.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './badge'

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Default',
  },
}

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
}

export const Error: Story = {
  args: {
    children: 'Error',
    variant: 'error',
  },
}
```

### **Passo 3: Recarregar Storybook**

Storybook **detecta automaticamente** novos componentes com `.stories.tsx`.

Simplesmente recarregue a página: **F5** ou **Ctrl+Shift+R**

---

## 💡 Dicas Úteis

### **Mudar Viewport para Mobile**

No canto superior direito do Storybook, clique no ícone de **device** para selecionar diferentes tamanhos de tela.

### **Dark Mode**

Clique no ícone de **lua** (theme) para alternar entre light/dark mode.

### **Documentação Automática**

Clique na aba **"Docs"** para ver documentação automática do componente.

### **Controls**

Na aba **"Controls"**, você pode alterar propriedades em tempo real:

```
Button Props:
├─ variant: [primary, secondary, outline, destructive]
├─ size: [sm, md, lg]
├─ children: "Type here..."
└─ disabled: [false, true]
```

---

## 🚫 Troubleshooting

### **Erro: "Storybook couldn't detect a supported framework"**

Certifique-se de que:
1. Está na pasta `frontend/`
2. Arquivo `.storybook/main.ts` existe
3. Dependências foram instaladas: `npm install`

### **Componentes não aparecem**

1. Verifique se o arquivo termina com `.stories.tsx`
2. Verifique se está em `components/`
3. Reinicie Storybook: `Ctrl+C` e `npm run storybook` novamente

### **Tailwind não funciona**

O arquivo `.storybook/preview.ts` carrega `globals.css` automaticamente.

Se não funcionar, verifique:
```ts
// .storybook/preview.ts
import '../app/globals.css'  // ✅ Esta linha deve estar
```

---

## 📚 Estrutura de Stories

```
components/
├─ shared/
│  ├─ button.tsx
│  ├─ button.stories.tsx      👈 Story do Button
│  ├─ card.tsx
│  └─ card.stories.tsx        👈 Story do Card
│
├─ layout/
│  ├─ sidebar.tsx
│  └─ sidebar.stories.tsx     👈 Story da Sidebar
│
└─ ui/                        👈 shadcn/ui components (future)
```

---

## 🎯 Próximos Passos

1. ✅ Storybook está configurado
2. ⏭️ Adicione mais componentes conforme necessário
3. ⏭️ Use Storybook para testar isoladamente
4. ⏭️ Documente componentes com comentários JSDoc

---

## 📖 Referências

- [Storybook Documentation](https://storybook.js.org/docs/react/get-started/introduction)
- [Stories Format](https://storybook.js.org/docs/react/api/csf)
- [Controls & Args](https://storybook.js.org/docs/react/essentials/controls)

---

**Happy Storybooking!** 🎨✨
