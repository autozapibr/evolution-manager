# Evolution Manager

<p align="center">
  <img src="public/evolution-logo.png" alt="Evolution Manager Logo" width="120" height="120">
</p>

<p align="center">
  <strong>Interface moderna para gerenciamento da Evolution API WhatsApp</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-blue?style=flat-square&logo=react" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5.5.3-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.4.1-646CFF?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/TailwindCSS-3.4.11-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</p>

## 📋 Sobre o Projeto

O **Evolution Manager** é uma interface web moderna e intuitiva para gerenciamento da Evolution API WhatsApp. Desenvolvido com React, TypeScript e Tailwind CSS, oferece uma experiência completa para gerenciar instâncias de WhatsApp, integrar chatbots e automatizar comunicações.

### ✨ Principais Funcionalidades

- 🔐 **Sistema de Autenticação** - Login seguro com tokens de API
- 📱 **Gerenciamento de Instâncias** - Controle múltiplas instâncias WhatsApp
- 🤖 **Integração Typebot** - Conecte e configure chatbots facilmente
- 🔗 **Webhooks Personalizados** - Integre com sistemas externos
- 🧠 **IA Avançada** - Integração com OpenAI para chatbots inteligentes
- 📤 **Disparador em Massa** - Envio de mensagens em lote
- ⚙️ **Configurações Avançadas** - Controle comportamento das instâncias

## 🚀 Tecnologias

### Frontend

- **React 18.3.1** - Biblioteca para interfaces de usuário
- **TypeScript 5.5.3** - Superset tipado do JavaScript
- **Vite 5.4.1** - Build tool moderna e rápida
- **Tailwind CSS 3.4.11** - Framework CSS utilitário
- **shadcn/ui** - Componentes de UI modernos
- **React Router DOM 6.26.2** - Roteamento client-side
- **React Query 5.56.2** - Gerenciamento de estado e cache
- **React Hook Form 7.53.0** - Gerenciamento de formulários
- **Zod 3.23.8** - Validação de esquemas
- **Axios 1.8.3** - Cliente HTTP

### Backend Integration

- **Evolution API** - API principal para WhatsApp
- **Typebot** - Plataforma de chatbots
- **OpenAI API** - Integração com IA

## 📁 Estrutura do Projeto

```
Evolution Manager/
├── 📁 public/                    # Assets estáticos
│   ├── evolution-logo.png        # Logo da aplicação
│   ├── favicon.ico               # Ícone do site
│   ├── og-image.png              # Imagem para redes sociais
│   └── ...
│
├── 📁 src/
│   ├── 📁 components/            # Componentes React
│   │   ├── 📁 ui/                # Componentes base (shadcn/ui)
│   │   ├── 📁 ui-custom/         # Componentes customizados
│   │   ├── ApiKeyForm.tsx        # Formulário de API Key
│   │   ├── ChatbotForm.tsx       # Formulário de chatbot
│   │   ├── CreateInstanceForm.tsx # Criação de instâncias
│   │   ├── InstanceCard.tsx      # Card de instância
│   │   ├── TypebotForm.tsx       # Formulário Typebot
│   │   ├── WebhookForm.tsx       # Formulário webhook
│   │   └── ...
│   │
│   ├── 📁 contexts/              # Contextos React
│   │   └── AuthContext.tsx       # Contexto de autenticação
│   │
│   ├── 📁 hooks/                 # Hooks customizados
│   │   ├── use-mobile.tsx        # Hook para detectar mobile
│   │   └── use-toast.ts          # Hook para toasts
│   │
│   ├── 📁 lib/                   # Utilitários
│   │   ├── api.ts                # Configurações de API
│   │   ├── types.ts              # Tipos TypeScript
│   │   └── utils.ts              # Funções utilitárias
│   │
│   ├── 📁 pages/                 # Páginas da aplicação
│   │   ├── Index.tsx             # Dashboard principal
│   │   ├── Login.tsx             # Página de login
│   │   └── NotFound.tsx          # Página 404
│   │
│   ├── App.tsx                   # Componente raiz
│   ├── router.tsx                # Configuração de rotas
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Estilos globais
│
├── docker-compose.yml            # Configuração Docker
├── Dockerfile                    # Imagem Docker
├── nginx.conf                    # Configuração Nginx
└── ...
```

## 🛠️ Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Evolution API configurada

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/evolution-manager.git
cd evolution-manager
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Abra o arquivo src/lib/api.ts:

```bash
Configure a linha 44: export const DEFAULT_API_URL = "https://sua-evolution-api.com";
```

### 4. Execute em desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:8080`

### 5. Build para produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`

## 📱 Rotas da Aplicação

| Rota         | Componente | Descrição              | Proteção  |
| ------------ | ---------- | ---------------------- | --------- |
| `/`          | Login      | Página de autenticação | Pública   |
| `/dashboard` | Index      | Dashboard principal    | Protegida |
| `*`          | NotFound   | Página 404             | Pública   |

## 🔑 Autenticação

O sistema utiliza tokens de API para autenticação. Existem dois tipos de acesso:

- **Admin (Global API Key)**: Acesso completo a todas as funcionalidades
- **Instância Específica**: Acesso limitado a uma instância

### Fluxo de Autenticação

1. Usuário insere o token na página de login
2. Sistema valida o token com a Evolution API
3. Define o tipo de usuário (admin ou instância)
4. Redireciona para o dashboard apropriado

## 🎨 Componentes Principais

### Dashboard (Index.tsx)

- **Instâncias**: Lista e gerencia instâncias WhatsApp
- **Criar Instância**: Formulário para novas instâncias (apenas admin)
- **Typebot**: Configuração de chatbots
- **Webhooks**: Configuração de integrações
- **Disparador**: Envio de mensagens em massa
- **IA**: Configuração OpenAI
- **Comportamento**: Configurações avançadas
- **Configurações**: Configurações de acesso (apenas admin)

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Build para produção

# Linting
npm run lint         # Executa ESLint

# Preview
npm run preview      # Preview do build de produção
```

## 📦 Build de Produção

O build gera arquivos otimizados:

- **HTML**: ~1KB (comprimido)
- **CSS**: ~102KB (~16KB gzipped)
- **JavaScript**: ~858KB (~246KB gzipped)

### Otimizações Aplicadas

- ✅ Minificação de código
- ✅ Tree shaking
- ✅ Code splitting automático
- ✅ Compressão de assets
- ✅ Sourcemaps desabilitados em produção

## 🔒 Segurança

- **Validação de tokens** em todas as requisições
- **Sanitização de inputs** com Zod
- **Headers de segurança** configurados
- **CORS** adequadamente configurado
- **Rate limiting** no servidor

## 🌐 Deploy

```bash
npm run build
# Copie os arquivos da pasta dist/ para seu servidor web
```

## 👥 Autor

- **Club do Software**

## 🙏 Agradecimentos

- [Evolution API](https://github.com/EvolutionAPI/evolution-api) - API base para WhatsApp
- [shadcn/ui](https://ui.shadcn.com/) - Componentes de UI
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Lucide React](https://lucide.dev/) - Ícones

---

<p align="center">
  Feito com ❤️ para a comunidade Club do Software
</p>
