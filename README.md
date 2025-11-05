# 🍽️ CodCoz React

Sistema completo de gestão empresarial para estabelecimentos de alimentação e gastronomia, desenvolvido com React e Vite.

## 🌐 Acesse o site web

[CodCoz](https://meusite.onrender.com)



## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [APIs Integradas](#apis-integradas)
- [Autenticação e Segurança](#autenticação-e-segurança)
- [Desenvolvimento](#desenvolvimento)
- [Deploy](#deploy)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## 🎯 Sobre o Projeto

O **CodCoz** é uma plataforma web moderna desenvolvida para facilitar a gestão completa de estabelecimentos do setor alimentício. Oferece uma solução integrada para controle de estoque, gestão de funcionários, tarefas, importação de notas fiscais, receitas gastronômicas e muito mais.

### Principais Características

- 🎨 Interface moderna e responsiva com Tailwind CSS
- 🔐 Autenticação segura via Firebase Authentication
- 📊 Dashboard com estatísticas em tempo real
- 📱 Design responsivo para desktop e mobile
- ⚡ Performance otimizada com Vite
- 🤖 Chatbot integrado para suporte

## ✨ Funcionalidades

### 🏠 Dashboard (Home)
- Visão geral das estatísticas da empresa
- Cards informativos de estoque, entradas e saídas
- Próximas tarefas agendadas
- Atividades recentes

### 👥 Gestão de Colaboradores
- Listagem completa de funcionários
- Cadastro e edição de colaboradores
- Gerenciamento de demissões
- Integração com Firebase Authentication

### 📦 Gestão de Produtos/Alimentos
- Controle completo de estoque
- Alertas de produtos próximos ao vencimento
- Notificações de estoque baixo
- Busca por código EAN
- Registro de entradas e saídas de produtos

### 📝 Gestão de Tarefas
- Criação e atribuição de tarefas
- Filtros por data, período e tipo
- Status de conclusão
- Histórico de tarefas completadas

### 🍳 Módulo Gastronômico
- **Ingredientes**: Cadastro e gestão de ingredientes
- **Receitas**: Criação e edição de receitas com ingredientes
- **Cardápios**: Gestão de cardápios e menus
- Categorização de ingredientes

### 📄 Importação de XML
- Importação de notas fiscais em formato XML
- Processamento automático de dados
- Visualização prévia antes da importação
- Integração com APIs externas

### 📊 Relatórios
- Relatórios de movimentações
- Histórico de entradas e saídas
- Análises por período
- Exportação de dados

### 💬 Chatbot
- Assistente virtual integrado
- Suporte contextual
- Histórico de conversas

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19.1.1** - Biblioteca JavaScript para construção de interfaces
- **Vite 7.1.7** - Build tool e dev server extremamente rápido
- **Tailwind CSS 4.1.16** - Framework CSS utility-first
- **Lucide React 0.487.0** - Biblioteca de ícones moderna

### Autenticação e Banco de Dados
- **Firebase 12.5.0** - Autenticação e Firestore
  - Firebase Authentication
  - Cloud Firestore

### APIs Externas
- **API PostgreSQL** - Backend principal (gestão de funcionários, produtos, tarefas)
- **API MongoDB** - Backend para dados gastronômicos (receitas, ingredientes, cardápios)
- **API Redis** - Cache e histórico de operações

### Outras Bibliotecas
- **Sonner 2.0.3** - Sistema de notificações toast elegante

### Ferramentas de Desenvolvimento
- **ESLint 9.36.0** - Linter para qualidade de código
- **PostCSS** - Processamento de CSS
- **Autoprefixer** - Adição automática de vendor prefixes

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn** ou **pnpm**
- Conta no Firebase (para autenticação)
- Acesso às APIs backend do projeto

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/codcoz-react.git
cd codcoz-react
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id

# API URLs (opcional - usa valores padrão se não configurado)
VITE_POSTGRES_API_URL=https://codcoz-api-postgres.koyeb.app
VITE_MONGO_API_URL=https://codcoz-api-mongo-eemr.onrender.com
VITE_REDIS_API_URL=https://codcoz-api-redis.onrender.com
```

### Configuração do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. Ative a **Authentication** (Email/Password)
4. Crie uma coleção no **Firestore** chamada `usuarios`
5. Copie as credenciais e adicione ao arquivo `.env`

## 📜 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev
```
Inicia o servidor de desenvolvimento com hot-reload na porta padrão (geralmente `http://localhost:5173`)

### Build para Produção
```bash
npm run build
```
Gera os arquivos otimizados para produção na pasta `dist/`

### Preview da Build
```bash
npm run preview
```
Visualiza a build de produção localmente antes do deploy

### Linter
```bash
npm run lint
```
Executa o ESLint para verificar qualidade do código

## 📁 Estrutura do Projeto

```
codcoz-react/
├── public/
│   └── images/          # Imagens e ícones estáticos
├── src/
│   ├── components/      # Componentes reutilizáveis
│   │   ├── ui/          # Componentes de UI (Button, Card, Dialog, etc.)
│   │   ├── Header.jsx   # Cabeçalho da aplicação
│   │   ├── Sidebar.jsx  # Barra lateral de navegação
│   │   └── ChatbotFloat.jsx  # Componente do chatbot
│   ├── pages/           # Páginas da aplicação
│   │   ├── Home.jsx              # Dashboard principal
│   │   ├── Login.jsx             # Página de login
│   │   ├── FuncionariosPage.jsx  # Gestão de colaboradores
│   │   ├── ProdutosPage.jsx      # Gestão de produtos
│   │   ├── TarefasPage.jsx       # Gestão de tarefas
│   │   ├── GastronomiaPage.jsx   # Módulo gastronômico
│   │   ├── PedidosPage.jsx       # Importação de XML
│   │   └── RelatoriosPage.jsx    # Relatórios
│   ├── lib/
│   │   └── api.js       # Cliente HTTP e funções de API
│   ├── firebase.js      # Configuração do Firebase
│   ├── App.jsx          # Componente principal
│   ├── App.css          # Estilos globais
│   ├── index.css        # Estilos Tailwind
│   └── main.jsx         # Ponto de entrada
├── .github/
│   └── workflows/       # GitHub Actions (CI/CD)
├── eslint.config.js     # Configuração do ESLint
├── tailwind.config.js   # Configuração do Tailwind
├── vite.config.js       # Configuração do Vite
├── package.json         # Dependências e scripts
└── README.md            # Este arquivo
```

## 🔌 APIs Integradas

### API PostgreSQL
**URL de Produção**: `https://codcoz-api-postgres.koyeb.app`

Endpoints principais:
- `/funcionario/*` - Gestão de funcionários
- `/produto/*` - Gestão de produtos e estoque
- `/movimentacao/*` - Controle de movimentações
- `/tarefa/*` - Gestão de tarefas
- `/categoria-ingrediente/*` - Categorias de ingredientes
- `/ingrediente/*` - Gestão de ingredientes
- `/pedido/*` - Gestão de pedidos

### API MongoDB
**URL de Produção**: `https://codcoz-api-mongo-eemr.onrender.com`

Endpoints principais:
- `/api/v1/empresa/{empresaId}/ingrediente` - Ingredientes
- `/api/v1/empresa/{empresaId}/receita` - Receitas
- `/api/v1/empresa/{empresaId}/cardapio` - Cardápios
- `/api/v1/historico-chat` - Histórico de chat

### API Redis
**URL de Produção**: `https://codcoz-api-redis.onrender.com`

Endpoints principais:
- `/api/v1/empresa/{empresaId}/historico_baixas` - Histórico de baixas

### API de Importação XML
**URL de Produção**: `https://codcoz-xml-import.onrender.com`

Endpoints:
- `/read_xml` - Leitura e processamento de XML
- `/insert_xml` - Inserção de dados do XML

## 🔐 Autenticação e Segurança

- Autenticação via **Firebase Authentication** com email/senha
- Verificação de permissões baseada em `funcaoId` (apenas gestores - `funcaoId = 2`)
- Dados de usuário sincronizados entre Firebase Firestore e PostgreSQL
- Sessões gerenciadas via `sessionStorage`
- Logout automático em caso de falha de autenticação

### Regras de Acesso

- Apenas usuários com `funcaoId = 2` (gestores) podem acessar o sistema
- Dados são filtrados por `empresaId` do usuário logado
- Todas as requisições incluem validação de autenticação

## 💻 Desenvolvimento

### Estrutura de Componentes

O projeto segue uma arquitetura baseada em componentes:

- **Componentes de UI**: Reutilizáveis e estilizados com Tailwind
- **Páginas**: Componentes principais que representam rotas
- **Hooks customizados**: Para lógica reutilizável (futuro)
- **Serviços**: Funções de API centralizadas em `lib/api.js`

### Padrões de Código

- **Nomenclatura**: camelCase para variáveis e funções, PascalCase para componentes
- **Formatação**: ESLint configurado para manter consistência
- **Estilos**: Tailwind CSS com classes utilitárias
- **Estados**: React Hooks (`useState`, `useEffect`)

### Melhores Práticas

- Sempre usar componentes funcionais
- Evitar prop drilling (considerar Context API se necessário)
- Tratar erros de API adequadamente
- Implementar loading states
- Usar feedback visual (toasts) para ações do usuário

## 🚢 Deploy

### Build de Produção

```bash
npm run build
```

O comando gera uma pasta `dist/` com os arquivos otimizados e estáticos.

### Deploy no Render/Vercel/Netlify

1. Configure as variáveis de ambiente na plataforma
2. Configure o build command: `npm run build`
3. Configure o publish directory: `dist`
4. Deploy automático via GitHub (se configurado CI/CD)

### GitHub Actions

O projeto inclui workflow CI/CD (`.github/workflows/cicd.yaml`) que:
- Dispara automaticamente em push para `main`
- Pode ser executado manualmente via `workflow_dispatch`
- Aciona deploy hook no Render

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Commit

Use mensagens de commit claras e descritivas:
- `feat:` para novas funcionalidades
- `fix:` para correções de bugs
- `docs:` para documentação
- `style:` para formatação
- `refactor:` para refatoração
- `test:` para testes

## 📝 Licença

Este projeto é proprietário e privado. Todos os direitos reservados.

## 👥 Equipe

Desenvolvido com ❤️ pela equipe CodCoz

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com React + Vite ⚡**
