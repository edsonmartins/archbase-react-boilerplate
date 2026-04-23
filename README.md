# BlueVix Admin

<p align="center">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.3+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Mantine-8.3-339AF0?style=for-the-badge&logo=mantine&logoColor=white" alt="Mantine" />
  <img src="https://img.shields.io/badge/Archbase-3.0.21+-FF6B6B?style=for-the-badge" alt="Archbase" />
</p>

<p align="center">
  Painel administrativo do <strong>BlueVix</strong> - App de bem-estar integrado corpo e mente.
</p>

---

## Stack Tecnológica

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **React** | 19.x | UI Library |
| **TypeScript** | 5.3+ | Type Safety |
| **Vite** | 6.x | Build Tool |
| **Mantine** | 8.3 | UI Components |
| **Archbase React** | 3.0.21+ | Framework Admin |
| **Inversify** | 6.2 | IoC/DI Container |
| **React Query** | 5.x | Data Fetching |

---

## Pré-requisitos

- Node.js >= 16.0.0
- pnpm >= 9.0.0 (recomendado)
- API BlueVix rodando em http://localhost:8080

---

## Instalação

```bash
# Instalar pnpm (se não tiver)
npm install -g pnpm

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
```

---

## Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento (porta 4200)
pnpm dev

# Ou expor na rede local
pnpm dev:http
```

Acesse: http://localhost:4200

---

## Build

```bash
# Build de produção
pnpm build

# Preview do build
pnpm preview
```

---

## Estrutura do Projeto

```
src/
├── domain/           # DTOs e modelos
│   ├── aluno/        # AlunoDto
│   ├── treino/       # TreinoDto, SessaoDto
│   ├── exercicio/    # ExercicioDto
│   ├── alerta/       # AlertaDto
│   ├── gamificacao/  # GamificacaoResumoDto, BadgeDto, etc
│   └── ia/           # AgenteIADto, ProtocoloDto, etc
├── services/         # Services de API
│   ├── AlunoService.ts
│   ├── TreinoService.ts
│   ├── ExercicioService.ts
│   ├── AlertaService.ts
│   ├── DesafioService.ts
│   └── IAService.ts
├── views/            # Páginas/Views
│   ├── dashboard/    # DashboardView
│   ├── alunos/       # AlunosListView
│   ├── alertas/      # AlertasView
│   ├── treinos/      # TreinosView
│   ├── exercicios/   # ExerciciosView
│   ├── desafios/     # DesafiosView
│   ├── relatorios/   # RelatoriosView
│   ├── config/       # ConfigView
│   └── ia/           # IAAgentesView, IAConversasView
├── navigation/       # Rotas e navegação
├── ioc/              # Container IoC (Inversify)
├── theme/            # Temas Light/Dark (cores BlueVix)
├── locales/          # Traduções (pt-BR)
└── App.tsx           # Componente raiz
```

---

## Funcionalidades

### Dashboard
- KPIs principais (alunas, sessões, alertas, humor médio)
- Alertas recentes com ação rápida
- Métricas de engajamento
- Top alunas da semana

### Gestão de Alunas
- Lista paginada com filtros
- Busca por nome/email
- Filtros por nível e status
- Ações: Ver ficha, Editar, Remover

### Alertas (Sentinela)
- Visualização por prioridade
- Filtros por status
- Resolução inline
- Adição de notas

### Treinos & Exercícios
- CRUD de programas de treino
- Catálogo de exercícios
- Filtros por nível

### Gamificação
- Gestão de desafios mensais
- Toggle ativo/inativo

### IA Admin
- **Agentes**: Configuração dos 6 agentes IA
- **Conversas**: Auditoria de conversas com Vix
- **Protocolos**: Protocolos emocionais
- **Frases**: Biblioteca de frases motivacionais
- **Guardrails**: Regras de segurança
- **Base de Conhecimento**: Gestão RAG
- **Logs**: Histórico de execução IA

### Relatórios
- Analytics de engajamento
- Distribuição de alunas por status
- Exportação de dados

### Configurações
- Configurações gerais
- Notificações
- Integrações (Spotify, OpenWeatherMap)
- Configurações de IA

---

## Integração com API BlueVix

| Endpoint | Descrição |
|----------|-----------|
| `/api/v1/alunos` | CRUD de alunas |
| `/api/v1/alertas` | Sistema Sentinela |
| `/api/v1/admin/treinos` | Gestão de treinos |
| `/api/v1/exercicios` | Catálogo de exercícios |
| `/api/v1/desafios` | Desafios mensais |
| `/api/v1/ia/**` | Endpoints IA Admin |

---

## Variáveis de Ambiente

```env
# API Backend
VITE_API=http://localhost:8080

# Versão do App
VITE_REACT_APP_VERSION=1.0.0
```

---

## Scripts

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Servidor dev (porta 4200) |
| `pnpm dev:http` | Servidor dev na rede |
| `pnpm build` | Build de produção |
| `pnpm preview` | Preview do build |
| `pnpm lint` | Verificar ESLint |
| `pnpm lint:fix` | Corrigir ESLint |
| `pnpm format` | Formatar com Prettier |
| `pnpm type-check` | Verificar TypeScript |
| `pnpm test` | Rodar testes |

---

## Tema BlueVix

```
Cores principais:
├── Primary: #1A5DAA (Azul)
├── Accent: #14A085 (Teal)
├── Navbar: #0D2E5A (Azul escuro)
├── Success: #14A085
├── Warning: #F59E0B
└── Error: #DC2626
```

---

## Licença

Proprietário - BlueVix

---

<p align="center">
  Desenvolvido com Archbase React
</p>
