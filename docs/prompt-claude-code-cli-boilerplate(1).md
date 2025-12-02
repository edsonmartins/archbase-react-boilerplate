# Prompt para Claude Code CLI - Criar Boilerplate Archbase React

## 📋 Instruções de Uso

**1. Preparação:**
```bash
# Criar diretório do projeto
mkdir archbase-react-boilerplate
cd archbase-react-boilerplate

# Inicializar git
git init

# Copiar os documentos de referência para o diretório
# - estrategias-claude-code-archbase.md
# - boilerplate-archbase-projeto.md
```

**2. Executar Claude Code CLI:**
```bash
claude-code
# Cole o prompt abaixo
```

**3. Após conclusão:**
```bash
# Testar o projeto
pnpm install
pnpm dev

# Commitar no GitHub
git add .
git commit -m "Initial commit: Archbase React Boilerplate v1.0"
git remote add origin https://github.com/your-org/archbase-react-boilerplate.git
git push -u origin main
```

---

## 🎯 PROMPT PARA CLAUDE CODE CLI

```
Olá Claude Code! Vou precisar da sua ajuda para construir um boilerplate completo de projeto React + TypeScript + Vite.js com Archbase React, totalmente documentado e preparado para uso com Claude Code.

# CONTEXTO E OBJETIVOS

Este boilerplate deve resolver um problema crítico: **Claude Code não conhece a biblioteca Archbase React**, o que causa baixa produtividade no desenvolvimento frontend. O boilerplate deve vir com TODA a infraestrutura de conhecimento embutida.

# DOCUMENTOS DE REFERÊNCIA

Tenho dois documentos que servem como base completa:

1. **estrategias-claude-code-archbase.md** - Contém:
   - Análise do problema
   - Estratégias de documentação
   - Exemplos de código
   - Padrões estabelecidos

2. **boilerplate-archbase-projeto.md** - Contém:
   - Estrutura completa de pastas
   - Conteúdo dos arquivos principais (CLAUDE.md, SKILL.md)
   - Exemplos funcionais
   - Scripts de geração
   - Documentação modular

**IMPORTANTE:** Leia e analise ambos os documentos ANTES de começar a construir o projeto. Eles contêm toda a especificação necessária.

# TAREFAS A EXECUTAR

## FASE 1: Setup Base do Projeto

### 1.1 Criar Estrutura React + Vite + TypeScript

```bash
# Criar projeto base
pnpm create vite@latest . --template react-ts

# Ou se preferir, criar manualmente os arquivos de configuração
```

Configurações necessárias:
- React 19
- TypeScript 5
- Vite 5
- ESLint
- Prettier

### 1.2 Instalar Dependências Principais

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@archbase/components": "latest",
    "@archbase/data": "latest",
    "@archbase/admin": "latest",
    "@mantine/core": "^8.1.2",
    "@mantine/hooks": "^8.1.2",
    "@mantine/form": "^8.1.2",
    "@mantine/notifications": "^8.1.2",
    "@tanstack/react-query": "^5.0.0",
    "inversify": "^6.0.0",
    "reflect-metadata": "^0.2.0",
    "react-router-dom": "^6.20.0",
    "i18next": "^23.7.0",
    "react-i18next": "^13.5.0",
    "yup": "^1.3.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### 1.3 Configurar package.json com Scripts

Adicionar scripts de desenvolvimento, build, lint, format, test, e os scripts customizados de geração.

## FASE 2: Criar Estrutura de Pastas Completa

Criar TODA a estrutura de pastas conforme especificado no documento **boilerplate-archbase-projeto.md**, incluindo:

```
├── .claude/                    # CRÍTICO - Infraestrutura de conhecimento
│   ├── SKILL.md
│   ├── knowledge/
│   ├── examples/
│   └── templates/
├── src/
│   ├── auth/
│   ├── components/
│   ├── domain/
│   ├── hooks/
│   ├── ioc/
│   ├── locales/
│   ├── navigation/
│   ├── services/
│   ├── theme/
│   ├── utils/
│   └── views/
├── scripts/
├── docs/
└── public/
```

## FASE 3: Documentação para Claude Code (MAIS IMPORTANTE!)

### 3.1 Criar CLAUDE.md (Raiz do Projeto)

Usar como base o conteúdo COMPLETO fornecido no documento **boilerplate-archbase-projeto.md**, seção "1. CLAUDE.md (Raiz do Projeto)".

O arquivo deve conter:
- Visão geral do projeto
- Referências para arquivos de conhecimento
- Comandos de desenvolvimento
- Padrões de código
- Armadilhas comuns (common pitfalls)
- Quick start guides
- Troubleshooting

**IMPORTANTE:** Não abrevie este arquivo. Ele precisa ter TODAS as instruções detalhadas.

### 3.2 Criar .claude/SKILL.md (CRÍTICO!)

Usar como base o conteúdo COMPLETO fornecido no documento **boilerplate-archbase-projeto.md**, seção "2. .claude/SKILL.md".

Este é o arquivo MAIS IMPORTANTE. Deve conter:
- Core Concepts (conceitos fundamentais)
- ArchbaseDataSource (completo com exemplos)
- Components Reference (mínimo 20 componentes documentados)
- Form Patterns (3-4 padrões diferentes)
- View Patterns (3-4 padrões diferentes)
- Service Patterns (padrão base + exemplos)
- Validation (Yup + custom)
- State Management (React Query + hooks)
- Common Issues (10+ problemas com soluções)

**IMPORTANTE:** Este arquivo deve ser EXTREMAMENTE detalhado com exemplos de código funcionais.

### 3.3 Criar Documentação Modular (.claude/knowledge/)

Criar arquivos modulares conforme especificado:

#### archbase-core.md
Conceitos fundamentais do Archbase:
- Filosofia DataSource-centric
- Binding declarativo
- Separação de responsabilidades
- Overview dos principais conceitos

#### archbase-datasource.md
Documentação completa do DataSource:
- Estados (browsing, editing, inserting)
- Operações (setData, edit, append, post, cancel, delete)
- Navegação (first, last, next, prior)
- Binding com componentes
- Eventos e listeners
- Padrões com React Query
- Exemplos completos

#### archbase-services.md
Padrões de services:
- Estrutura base (extends ArchbaseRemoteApiService)
- Configuração de headers
- Endpoints (plural)
- Métodos HTTP com generics corretos
- Type imports para decorators
- Transformação de resultados
- Exemplos de métodos customizados

#### archbase-components.md
Lista de componentes principais (20+):
- ArchbaseEdit (text input)
- ArchbaseSelect (dropdown)
- ArchbaseDatePicker
- ArchbaseNumberInput
- ArchbaseSwitch
- ArchbaseTextArea
- ArchbaseDataTable
- ArchbaseFormTemplate
- ArchbaseListTemplate
- Etc.

Para cada componente:
- Descrição
- Props principais
- Exemplo de uso
- Dicas importantes

#### form-patterns.md
Padrões de formulários:
- Form simples (sem tabs)
- Form com tabs
- Form com validação complexa
- Form wizard/stepper
- Padrão useArchbaseSize
- Padrão innerRef
- Cálculo de altura

#### view-patterns.md
Padrões de views:
- Lista simples
- CRUD completo
- Dashboard
- Master-detail
- Filtros e paginação

#### validation-patterns.md
Padrões de validação:
- Yup validator
- Custom validator
- Validação assíncrona
- Mensagens de erro
- Display de erros

#### state-management.md
Gerenciamento de estado:
- React Query patterns
- Custom hooks
- DataSource integration
- Cache strategies
- Optimistic updates

#### troubleshooting.md
Problemas comuns e soluções:
- "Cannot modify in browsing state"
- "width: 0px, height: 0px"
- "Property 'validator' does not exist"
- "Property 'readOnly' does not exist"
- Campos não atualizam
- Validação não funciona
- Service methods failing
- Etc. (10+ problemas)

## FASE 4: Exemplos Funcionais (.claude/examples/)

### 4.1 Forms Examples

Criar exemplos COMPLETOS e FUNCIONAIS:

#### BasicForm.example.tsx
Form simples sem tabs, com:
- useArchbaseSize
- DataSource setup
- React Query integration
- Campos básicos (Edit, Select, Switch)
- Comentários extensivos explicando cada parte
- Padrão de save/cancel

#### TabsForm.example.tsx
Form com múltiplas tabs, com:
- Tabs component do Mantine
- Altura calculada corretamente
- Overflow handling
- Múltiplas seções organizadas

#### ValidationForm.example.tsx
Form com validação complexa, com:
- Yup schema
- Validação de múltiplos campos
- Regras de negócio
- Display de erros

#### WizardForm.example.tsx
Form estilo wizard/stepper, com:
- Stepper do Mantine
- Navegação entre steps
- Validação por step
- Salvamento final

### 4.2 Views Examples

#### ListView.example.tsx
Lista simples com DataTable

#### CRUDView.example.tsx
CRUD completo com:
- Lista + Form integrados
- Estados (LIST, EDIT, VIEW, NEW)
- Handlers de navegação
- Delete com confirmação

#### DashboardView.example.tsx
Dashboard com:
- Cards de métricas
- Gráficos (se possível)
- Layout responsivo

#### MasterDetailView.example.tsx
View master-detail

### 4.3 Services Examples

#### RemoteService.example.ts
Service completo com:
- Extends ArchbaseRemoteApiService
- Type imports
- configureHeaders
- getEndpoint
- Métodos customizados
- Comentários explicativos

#### AuthService.example.ts
Service de autenticação

### 4.4 Hooks Examples

#### useDataSource.example.tsx
Custom hook para DataSource

#### useQuery.example.tsx
Padrão de query com React Query

#### useMutation.example.tsx
Padrão de mutation

### 4.5 Layouts Examples

#### AdminLayout.example.tsx
Layout administrativo

#### PublicLayout.example.tsx
Layout público

## FASE 5: Código Base do Projeto (src/)

### 5.1 Configurações Base

#### src/main.tsx
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'
import '@mantine/core/styles.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <App />
      </MantineProvider>
    </QueryClientProvider>
  </React.StrictMode>
)
```

#### src/App.tsx
Estrutura básica com routing

#### vite.config.ts
Configuração do Vite com:
- Path aliases (@/)
- React plugin
- Build options

#### tsconfig.json
TypeScript config com:
- Path mapping
- Strict mode
- React JSX

### 5.2 IoC Container (src/ioc/)

#### container.ts
Setup do Inversify

#### types.ts
Constantes de tipos para injeção

#### bindings.ts
Configuração de bindings

### 5.3 Domain (src/domain/)

Criar DTOs de exemplo:

#### BaseDto.ts
DTO base

#### UserDto.ts
Exemplo de DTO completo

#### enums.ts
Enums comuns

### 5.4 Services (src/services/)

#### BaseService.ts
Service base que outros extendem

#### UserService.ts
Service de exemplo completo

#### ApiClient.ts
Configuração do cliente HTTP

### 5.5 Auth (src/auth/)

Setup básico de autenticação:
- AuthContext.tsx
- AuthProvider.tsx
- useAuth.ts
- ProtectedRoute.tsx

### 5.6 Theme (src/theme/)

#### lightTheme.ts
Tema claro do Mantine

#### darkTheme.ts
Tema escuro do Mantine

#### ThemeProvider.tsx
Provider de tema

### 5.7 Navigation (src/navigation/)

#### routes.tsx
Definição de rotas

#### navigationData.ts
Dados de navegação (menu)

#### AppRouter.tsx
Router principal

### 5.8 Components (src/components/)

Componentes reutilizáveis:
- common/ErrorBoundary.tsx
- common/LoadingSpinner.tsx
- common/PageHeader.tsx
- layout/AdminLayout.tsx
- layout/PublicLayout.tsx
- layout/Sidebar.tsx

### 5.9 Views (src/views/)

Views de exemplo:
- auth/LoginView.tsx
- auth/RegisterView.tsx
- dashboard/DashboardView.tsx
- example/UserListView.tsx (exemplo CRUD completo)
- example/UserForm.tsx
- example/UserManagerView.tsx

### 5.10 Hooks (src/hooks/)

Hooks customizados:
- useDataSource.ts
- useAuth.ts
- useNotification.ts

### 5.11 Utils (src/utils/)

Utilitários:
- validators.ts
- formatters.ts
- constants.ts

### 5.12 Locales (src/locales/)

Estrutura i18n:
- en/translation.json
- pt-BR/translation.json

## FASE 6: Scripts Utilitários (scripts/)

### generate-component.js
Script Node.js para gerar componentes:
```javascript
#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const [,, componentName, type = 'functional'] = process.argv

if (!componentName) {
  console.error('Usage: node generate-component.js <ComponentName> [type]')
  process.exit(1)
}

// Lê template apropriado
// Substitui variáveis
// Cria arquivo em local apropriado
// Exemplo: src/components/common/ComponentName.tsx

console.log(`✅ Generated ${componentName}.tsx`)
```

### generate-form.js
Script para gerar formulário

### generate-view.js
Script para gerar view

### generate-dto.js
Script para gerar DTO do Java:
```javascript
#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const [,, javaFilePath] = process.argv

if (!javaFilePath) {
  console.error('Usage: node generate-dto.js <path-to-java-file>')
  process.exit(1)
}

// 1. Lê arquivo Java
// 2. Parseia campos e tipos
// 3. Converte tipos Java → TypeScript
// 4. Gera DTO TypeScript em src/domain/
// 5. Gera enums se necessário

console.log(`✅ Generated TypeScript DTO from ${javaFilePath}`)
```

### update-examples.js
Script para atualizar exemplos

## FASE 7: Documentação Adicional (docs/)

### ARCHITECTURE.md
Documentação de arquitetura:
- Visão geral
- Decisões arquiteturais
- Padrões estabelecidos
- Diagramas (se possível)

### DEVELOPMENT.md
Guia de desenvolvimento:
- Setup do ambiente
- Workflow de desenvolvimento
- Debugging
- Melhores práticas

### DEPLOYMENT.md
Guia de deploy:
- Build de produção
- Configuração de ambiente
- Deploy em diferentes plataformas
- CI/CD

### CONTRIBUTING.md
Como contribuir:
- Padrões de código
- Pull requests
- Code review
- Atualização de documentação

## FASE 8: Arquivos de Configuração

### .env.example
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_API_TIMEOUT=30000

# Application
VITE_APP_NAME=Archbase React Boilerplate
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_DEVTOOLS=true
VITE_ENABLE_MOCK_API=false

# Authentication
VITE_AUTH_TOKEN_KEY=auth_token
VITE_AUTH_REFRESH_TOKEN_KEY=refresh_token
```

### .gitignore
```
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/

# Production
dist/
build/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
```

### .prettierrc
```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100,
  "arrowParens": "always"
}
```

### .eslintrc.json
Configuração ESLint

### README.md
README principal do boilerplate com:
- Descrição
- Features
- Quick start
- Estrutura do projeto
- Documentação
- Como usar com Claude Code
- Contribuindo
- License

## FASE 9: Validação e Testes

### 9.1 Verificar Estrutura
- Todas as pastas criadas
- Todos os arquivos principais existem
- CLAUDE.md completo
- SKILL.md completo
- Exemplos funcionais

### 9.2 Validar Compilação
```bash
pnpm install
pnpm type-check
pnpm lint
pnpm build
```

### 9.3 Validar Desenvolvimento
```bash
pnpm dev
# Verificar se sobe sem erros
```

## FASE 10: Documentação Final

### 10.1 Criar README.md Completo

Incluir:
- Badge de versão
- Descrição do projeto
- Por que usar este boilerplate
- Features principais
- Quick start detalhado
- Estrutura do projeto explicada
- Como funciona com Claude Code
- Scripts disponíveis
- Exemplos de uso
- Troubleshooting
- Contributing
- License
- Contato/Support

### 10.2 Criar CHANGELOG.md

```markdown
# Changelog

## [1.0.0] - 2024-12-XX

### Added
- Initial release
- Complete React + TypeScript + Vite setup
- Archbase React integration
- CLAUDE.md documentation
- SKILL.md with 20+ components
- 15+ working examples
- IoC container with Inversify
- React Query integration
- i18n support
- Theme system (light/dark)
- Generation scripts
- Complete documentation
```

## CHECKLIST FINAL

Antes de considerar completo, verificar:

**Estrutura:**
- [ ] Todas as pastas criadas conforme especificação
- [ ] Arquivos de configuração (vite, ts, eslint, prettier)
- [ ] package.json com todas as dependências

**Documentação para Claude Code:**
- [ ] CLAUDE.md completo e detalhado (raiz)
- [ ] .claude/SKILL.md com 20+ componentes documentados
- [ ] .claude/knowledge/ com 8+ arquivos modulares
- [ ] Cada arquivo de knowledge tem conteúdo substancial

**Exemplos:**
- [ ] .claude/examples/forms/ com 4+ exemplos
- [ ] .claude/examples/views/ com 4+ exemplos
- [ ] .claude/examples/services/ com 2+ exemplos
- [ ] .claude/examples/hooks/ com 3+ exemplos
- [ ] .claude/examples/layouts/ com 2+ exemplos
- [ ] Todos os exemplos têm comentários extensivos

**Templates:**
- [ ] .claude/templates/ com templates básicos

**Código Base:**
- [ ] src/main.tsx e App.tsx funcionais
- [ ] src/ioc/ com container configurado
- [ ] src/domain/ com DTOs de exemplo
- [ ] src/services/ com service de exemplo
- [ ] src/auth/ com setup básico
- [ ] src/theme/ com temas light/dark
- [ ] src/navigation/ com routing
- [ ] src/components/ com componentes comuns
- [ ] src/views/ com exemplo de CRUD completo
- [ ] src/hooks/ com hooks customizados
- [ ] src/utils/ com utilitários

**Scripts:**
- [ ] scripts/generate-component.js
- [ ] scripts/generate-form.js
- [ ] scripts/generate-view.js
- [ ] scripts/generate-dto.js
- [ ] Scripts têm shebang e são executáveis

**Documentação Adicional:**
- [ ] docs/ARCHITECTURE.md
- [ ] docs/DEVELOPMENT.md
- [ ] docs/DEPLOYMENT.md
- [ ] docs/CONTRIBUTING.md

**Arquivos Root:**
- [ ] README.md completo e bem formatado
- [ ] CHANGELOG.md
- [ ] LICENSE (MIT ou outra)
- [ ] .env.example
- [ ] .gitignore completo
- [ ] .prettierrc
- [ ] .eslintrc.json

**Validação Técnica:**
- [ ] `pnpm install` funciona sem erros
- [ ] `pnpm type-check` passa sem erros
- [ ] `pnpm lint` passa sem erros críticos
- [ ] `pnpm build` gera dist/ com sucesso
- [ ] `pnpm dev` sobe aplicação sem erros

**Qualidade do Conteúdo:**
- [ ] CLAUDE.md tem instruções claras de quando ler cada arquivo
- [ ] SKILL.md é extremamente detalhado (não superficial)
- [ ] Exemplos são completos (não stubs vazios)
- [ ] Comentários nos exemplos explicam o "porquê"
- [ ] Troubleshooting tem problemas reais e soluções práticas

# IMPORTANTE - NOTAS FINAIS

1. **NÃO ABREVIE A DOCUMENTAÇÃO**: CLAUDE.md e SKILL.md devem ser MUITO detalhados. É melhor ter 3000 linhas úteis do que 500 linhas superficiais.

2. **EXEMPLOS DEVEM SER FUNCIONAIS**: Não crie stubs vazios. Cada exemplo deve ser código real que poderia ser copiado e usado.

3. **COMENTÁRIOS EXTENSIVOS**: Nos exemplos, adicione comentários explicando CADA padrão importante. Pense em alguém que nunca viu Archbase.

4. **CONSISTÊNCIA**: Mantenha padrões de naming, estrutura e organização consistentes em todo o projeto.

5. **PRIORIDADE DOS ARQUIVOS**:
   - Máxima: CLAUDE.md, SKILL.md, exemplos
   - Alta: Knowledge files, código base funcional
   - Média: Scripts de geração, docs adicionais
   - Baixa: Configurações e arquivos auxiliares

6. **USE OS DOCUMENTOS DE REFERÊNCIA**: Os arquivos estrategias-claude-code-archbase.md e boilerplate-archbase-projeto.md têm TODO o conteúdo necessário. Use-os como fonte de verdade.

7. **TESTE AO FINAL**: Depois de tudo criado, execute os comandos de validação para garantir que funciona.

# COMEÇAR AGORA

Claude Code, por favor:

1. **LEIA primeiro** os dois documentos de referência (estrategias-claude-code-archbase.md e boilerplate-archbase-projeto.md)

2. **ANALISE** a estrutura completa e o conteúdo esperado

3. **COMECE** pela FASE 1 e vá seguindo sequencialmente até a FASE 10

4. **SEJA DETALHISTA**: Não pule etapas, não abrevie documentação, não crie stubs vazios

5. **COMUNIQUE**: Me avise quando completar cada fase principal

6. **VALIDE**: Ao final, execute os comandos de validação

Estou pronto. Pode começar! 🚀
```

---

## 📝 Notas Adicionais

### Dicas para Execução

1. **Sessão Longa**: Este prompt criará MUITOS arquivos. Esteja preparado para uma sessão longa.

2. **Validação Incremental**: Após algumas fases, valide se está correto antes de continuar.

3. **Ajustes**: Se Claude perguntar algo ou precisar de clarificação, forneça com base nos documentos.

4. **Salvamento**: Salve o trabalho regularmente fazendo commits parciais:
   ```bash
   git add .
   git commit -m "WIP: Fase 3 completa"
   ```

### Alternativa: Execução em Partes

Se o prompt for muito grande para uma única sessão, divida em 3 partes:

**PARTE 1: Infraestrutura e Documentação**
- FASE 1-3: Setup + Documentação completa

**PARTE 2: Código Base**
- FASE 4-6: Exemplos + Código fonte + Scripts

**PARTE 3: Finalização**
- FASE 7-10: Docs adicionais + Validação + README

### Troubleshooting

**Se Claude parar no meio:**
```
"Continue de onde parou na FASE X"
```

**Se algo ficou incompleto:**
```
"A documentação do SKILL.md precisa ser mais detalhada. 
Por favor, expanda a seção de [X] com mais exemplos e explicações."
```

**Se exemplos ficaram vazios:**
```
"Os exemplos em .claude/examples/forms/ estão como stubs.
Por favor, crie exemplos COMPLETOS e FUNCIONAIS com base nos padrões
descritos no documento boilerplate-archbase-projeto.md"
```

---

**Arquivo criado em:** Dezembro 2024  
**Para uso com:** Claude Code CLI  
**Resultado esperado:** Boilerplate completo pronto para GitHub  
**Tempo estimado:** 2-4 horas de execução

---
