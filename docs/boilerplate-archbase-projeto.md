# Boilerplate de Projeto Archbase React - Documentado para Claude Code

## 🎯 Conceito

**Ideia Central:** Criar um boilerplate de projeto React/TypeScript/Vite.js que já vem **completamente documentado e preparado** para trabalhar com Claude Code, incluindo toda a infraestrutura de conhecimento sobre Archbase.

### Problema que Resolve

❌ **Antes:** Cada projeto novo precisa:
- Configurar estrutura do zero
- Criar CLAUDE.md manualmente
- Documentar padrões novamente
- Claude Code não conhece o contexto

✅ **Depois:** Clone o boilerplate e:
- Projeto já tem estrutura completa
- CLAUDE.md pronto com todos os padrões
- Skill do Archbase embutido
- Biblioteca de exemplos funcionais
- Claude Code produtivo desde o primeiro dia

---

## 📁 Estrutura Completa do Boilerplate

```
archbase-react-boilerplate/
├── 📄 CLAUDE.md                              # Documento principal para Claude Code
├── 📄 README.md                              # Documentação geral do projeto
├── 📄 package.json
├── 📄 tsconfig.json
├── 📄 vite.config.ts
├── 📄 .env.example
├── 📄 .gitignore
│
├── 📁 .claude/                               # Infraestrutura de conhecimento
│   ├── 📄 SKILL.md                          # Skill principal do Archbase
│   ├── 📁 knowledge/                        # Base de conhecimento modular
│   │   ├── 📄 archbase-core.md             # Conceitos fundamentais
│   │   ├── 📄 archbase-datasource.md       # DataSource patterns
│   │   ├── 📄 archbase-services.md         # Services patterns
│   │   ├── 📄 archbase-components.md       # Componentes principais
│   │   ├── 📄 form-patterns.md             # Padrões de forms
│   │   ├── 📄 view-patterns.md             # Padrões de views
│   │   ├── 📄 validation-patterns.md       # Validação
│   │   ├── 📄 state-management.md          # Estado e hooks
│   │   └── 📄 troubleshooting.md           # Problemas comuns
│   │
│   ├── 📁 examples/                         # Exemplos funcionais
│   │   ├── 📁 forms/
│   │   │   ├── 📄 BasicForm.example.tsx
│   │   │   ├── 📄 TabsForm.example.tsx
│   │   │   ├── 📄 ValidationForm.example.tsx
│   │   │   └── 📄 WizardForm.example.tsx
│   │   │
│   │   ├── 📁 views/
│   │   │   ├── 📄 ListView.example.tsx
│   │   │   ├── 📄 CRUDView.example.tsx
│   │   │   ├── 📄 DashboardView.example.tsx
│   │   │   └── 📄 MasterDetailView.example.tsx
│   │   │
│   │   ├── 📁 services/
│   │   │   ├── 📄 RemoteService.example.ts
│   │   │   ├── 📄 AuthService.example.ts
│   │   │   └── 📄 ServicePatterns.md
│   │   │
│   │   ├── 📁 hooks/
│   │   │   ├── 📄 useDataSource.example.tsx
│   │   │   ├── 📄 useQuery.example.tsx
│   │   │   └── 📄 useMutation.example.tsx
│   │   │
│   │   └── 📁 layouts/
│   │       ├── 📄 AdminLayout.example.tsx
│   │       ├── 📄 PublicLayout.example.tsx
│   │       └── 📄 DashboardLayout.example.tsx
│   │
│   └── 📁 templates/                        # Templates para geração
│       ├── 📄 form.template.tsx
│       ├── 📄 view.template.tsx
│       ├── 📄 service.template.ts
│       └── 📄 dto.template.ts
│
├── 📁 src/
│   ├── 📁 auth/                            # Autenticação
│   │   ├── 📄 AuthContext.tsx
│   │   ├── 📄 AuthProvider.tsx
│   │   ├── 📄 useAuth.ts
│   │   └── 📄 ProtectedRoute.tsx
│   │
│   ├── 📁 components/                      # Componentes reutilizáveis
│   │   ├── 📁 common/
│   │   │   ├── 📄 ErrorBoundary.tsx
│   │   │   ├── 📄 LoadingSpinner.tsx
│   │   │   └── 📄 PageHeader.tsx
│   │   │
│   │   └── 📁 layout/
│   │       ├── 📄 AdminLayout.tsx
│   │       ├── 📄 PublicLayout.tsx
│   │       └── 📄 Sidebar.tsx
│   │
│   ├── 📁 domain/                          # DTOs e modelos
│   │   ├── 📄 BaseDto.ts
│   │   ├── 📄 UserDto.ts                  # Exemplo
│   │   └── 📄 enums.ts
│   │
│   ├── 📁 hooks/                           # Hooks customizados
│   │   ├── 📄 useDataSource.ts
│   │   ├── 📄 useAuth.ts
│   │   └── 📄 useNotification.ts
│   │
│   ├── 📁 ioc/                            # Inversify IoC Container
│   │   ├── 📄 container.ts
│   │   ├── 📄 types.ts
│   │   └── 📄 bindings.ts
│   │
│   ├── 📁 locales/                        # Internacionalização
│   │   ├── 📁 en/
│   │   │   └── 📄 translation.json
│   │   └── 📁 pt-BR/
│   │       └── 📄 translation.json
│   │
│   ├── 📁 navigation/                     # Configuração de rotas
│   │   ├── 📄 routes.tsx
│   │   ├── 📄 navigationData.ts
│   │   └── 📄 AppRouter.tsx
│   │
│   ├── 📁 services/                       # Services da aplicação
│   │   ├── 📄 BaseService.ts
│   │   ├── 📄 UserService.ts             # Exemplo
│   │   └── 📄 ApiClient.ts
│   │
│   ├── 📁 theme/                          # Configuração de tema
│   │   ├── 📄 lightTheme.ts
│   │   ├── 📄 darkTheme.ts
│   │   └── 📄 ThemeProvider.tsx
│   │
│   ├── 📁 utils/                          # Utilitários
│   │   ├── 📄 validators.ts
│   │   ├── 📄 formatters.ts
│   │   └── 📄 constants.ts
│   │
│   ├── 📁 views/                          # Views da aplicação
│   │   ├── 📁 auth/
│   │   │   ├── 📄 LoginView.tsx
│   │   │   └── 📄 RegisterView.tsx
│   │   │
│   │   ├── 📁 dashboard/
│   │   │   └── 📄 DashboardView.tsx
│   │   │
│   │   └── 📁 example/                   # Exemplo completo de CRUD
│   │       ├── 📄 UserListView.tsx
│   │       ├── 📄 UserForm.tsx
│   │       └── 📄 UserManagerView.tsx
│   │
│   ├── 📄 App.tsx
│   ├── 📄 main.tsx
│   └── 📄 vite-env.d.ts
│
├── 📁 public/
│   ├── 📁 locales/
│   └── 📄 favicon.ico
│
├── 📁 scripts/                            # Scripts utilitários
│   ├── 📄 generate-component.js           # CLI local para gerar componentes
│   ├── 📄 generate-dto.js                 # Gerar DTOs do Java
│   └── 📄 update-examples.js              # Atualizar exemplos
│
└── 📁 docs/                               # Documentação adicional
    ├── 📄 ARCHITECTURE.md                 # Arquitetura do projeto
    ├── 📄 CONTRIBUTING.md                 # Como contribuir
    ├── 📄 DEPLOYMENT.md                   # Deploy
    └── 📄 DEVELOPMENT.md                  # Guia de desenvolvimento
```

---

## 📄 Conteúdo dos Arquivos Principais

### 1. CLAUDE.md (Raiz do Projeto)

```markdown
# CLAUDE.md

This file provides guidance to Claude Code when working with this Archbase React project.

## 🎯 Project Overview

This is a React 19 + TypeScript + Vite application built on the Archbase React component library.

**Key Technologies:**
- React 19 + TypeScript 5
- Vite 5 (build tool)
- Archbase React (UI framework)
- Mantine v8 (component library)
- React Query (data fetching)
- Inversify (IoC/DI)
- i18next (internationalization)

## 📚 Knowledge Base

### Essential Reading (Always Read First)
When working with Archbase components, ALWAYS read this first:
- **file:///.claude/SKILL.md** - Complete Archbase patterns and components reference

### By Task Type

#### Creating Forms
1. Read: **file:///.claude/knowledge/form-patterns.md**
2. Reference: **file:///.claude/examples/forms/** (pick closest example)
3. Consult: **file:///.claude/knowledge/archbase-datasource.md**

#### Creating Views/Lists
1. Read: **file:///.claude/knowledge/view-patterns.md**
2. Reference: **file:///.claude/examples/views/** (pick closest example)
3. Consult: **file:///.claude/knowledge/archbase-components.md**

#### Creating Services
1. Read: **file:///.claude/knowledge/archbase-services.md**
2. Reference: **file:///.claude/examples/services/RemoteService.example.ts**

#### DataSource Issues
1. Consult: **file:///.claude/knowledge/archbase-datasource.md**
2. Check: **file:///.claude/knowledge/troubleshooting.md**

#### Validation
1. Read: **file:///.claude/knowledge/validation-patterns.md**
2. Reference: **file:///.claude/examples/forms/ValidationForm.example.tsx**

## 🏗️ Architecture Patterns

### Dependency Injection
Uses Inversify container configured in `src/ioc/container.ts`.

### Authentication
Custom authenticator in `src/auth/` extends Archbase security framework.

### Theme System
Dual theme support (Dark/Light) in `src/theme/`.

### Navigation
Tab-based admin interface using Archbase Admin components.

## 📋 Development Commands

### Core Development
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build

### Code Quality
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Auto-fix issues
- `pnpm format` - Format with Prettier
- `pnpm type-check` - TypeScript check

### Testing
- `pnpm test` - Run tests
- `pnpm test:coverage` - Generate coverage

### Generation Scripts
- `pnpm generate:component <name>` - Generate new component
- `pnpm generate:form <name>` - Generate new form
- `pnpm generate:view <name>` - Generate new view
- `pnpm generate:dto <JavaFile>` - Generate DTO from Java

## 🎨 Code Standards

### File Naming
- Components: PascalCase (UserForm.tsx, DashboardView.tsx)
- Services: PascalCase with Service suffix (UserService.ts)
- DTOs: PascalCase with Dto suffix (UserDto.ts)
- Hooks: camelCase with use prefix (useDataSource.ts)
- Utils: camelCase (validators.ts, formatters.ts)

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react'
import { Paper, Group } from '@mantine/core'
import { ArchbaseEdit, ArchbaseDataSource } from '@archbase/components'

// 2. Types/Interfaces
interface UserFormProps {
  id?: string
  onClose: () => void
}

// 3. Component
export function UserForm({ id, onClose }: UserFormProps) {
  // 3.1 Hooks
  const [dataSource] = useState(...)
  
  // 3.2 Queries/Mutations
  const { data, isLoading } = useQuery(...)
  
  // 3.3 Effects
  useEffect(() => { ... }, [])
  
  // 3.4 Handlers
  const handleSave = () => { ... }
  
  // 3.5 Render
  return (...)
}
```

### DataSource Pattern (CRITICAL)
Always use this pattern for forms and data manipulation:

```typescript
// 1. Create DataSource
const [dataSource] = useState(() => 
  new ArchbaseDataSource<UserDto, string>({
    name: 'dsUser',
    initialData: []
  })
)

// 2. Load data
const { data } = useQuery({
  queryKey: ['user', id],
  queryFn: () => userService.findById(id!)
})

// 3. Populate on data load
useEffect(() => {
  if (data) {
    dataSource.setData([data])
    dataSource.edit()
  }
}, [data])

// 4. Bind to components
<ArchbaseEdit dataSource={dataSource} dataField="name" />
```

## ⚠️ Common Pitfalls (AVOID THESE)

### ❌ DON'T: Modify DataSource without edit/append
```typescript
// Wrong
dataSource.setFieldValue('name', 'John')  // Error: not in edit mode

// Correct
dataSource.edit()
dataSource.setFieldValue('name', 'John')
```

### ❌ DON'T: Forget innerRef on complex forms
```typescript
// Wrong
<ArchbaseFormTemplate title="User">
  {/* Content */}
</ArchbaseFormTemplate>

// Correct
const { ref, height } = useArchbaseSize()
<ArchbaseFormTemplate innerRef={ref} title="User">
  <Paper style={{ height: height - 130 }}>
    {/* Content */}
  </Paper>
</ArchbaseFormTemplate>
```

### ❌ DON'T: Use validator prop on ArchbaseFormTemplate
```typescript
// Wrong - validator prop doesn't exist
<ArchbaseFormTemplate validator={myValidator} />

// Correct - set on DataSource
const dataSource = new ArchbaseDataSource({
  validator: myValidator
})
```

### ❌ DON'T: Use readOnly on ArchbaseFormTemplate
```typescript
// Wrong - readOnly prop doesn't exist on template
<ArchbaseFormTemplate readOnly={true} />

// Correct - apply to individual fields
<ArchbaseEdit dataSource={ds} dataField="name" readOnly={true} />
```

## 🚀 Quick Start for New Features

### New CRUD Feature (Complete Workflow)
1. **Create DTO**: `src/domain/EntityDto.ts`
2. **Create Service**: `src/services/EntityService.ts`
3. **Read Example**: file:///.claude/examples/views/CRUDView.example.tsx
4. **Create Views**:
   - EntityListView.tsx (list)
   - EntityForm.tsx (form)
   - EntityManagerView.tsx (manager)
5. **Register Route**: `src/navigation/routes.tsx`

### New Form
1. **Read Pattern**: file:///.claude/knowledge/form-patterns.md
2. **Pick Example**: file:///.claude/examples/forms/[closest-match].tsx
3. **Copy Structure**: Maintain useArchbaseSize + innerRef pattern
4. **Bind Fields**: All fields need dataSource + dataField

### New Service
1. **Read Pattern**: file:///.claude/knowledge/archbase-services.md
2. **Copy Template**: file:///.claude/examples/services/RemoteService.example.ts
3. **Extend BaseService**: From src/services/BaseService.ts
4. **Register in IoC**: src/ioc/bindings.ts

## 📦 Project Structure Rules

### Where Things Go
- **DTOs**: `src/domain/` (never in views or services)
- **Services**: `src/services/` (API integration layer)
- **Views**: `src/views/[feature]/` (organize by feature)
- **Components**: `src/components/common/` (reusable) or `src/components/layout/` (layouts)
- **Hooks**: `src/hooks/` (custom hooks)
- **Utils**: `src/utils/` (pure functions)

### Imports Pattern
```typescript
// 1. External libraries
import { useState } from 'react'
import { Paper } from '@mantine/core'

// 2. Archbase
import { ArchbaseEdit, ArchbaseDataSource } from '@archbase/components'

// 3. Internal - absolute paths (configured in tsconfig)
import { UserDto } from '@/domain/UserDto'
import { UserService } from '@/services/UserService'
import { useAuth } from '@/hooks/useAuth'
```

## 🔧 Environment Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_NAME=My Archbase App
VITE_ENABLE_DEVTOOLS=true
```

### API Client Configuration
Configure in `src/services/ApiClient.ts` and register in IoC container.

## 🧪 Testing Guidelines

### Test Structure
```typescript
describe('UserForm', () => {
  it('should render correctly', () => {
    // Arrange
    const onClose = vi.fn()
    
    // Act
    render(<UserForm onClose={onClose} />)
    
    // Assert
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
  })
})
```

### What to Test
- ✅ Component rendering
- ✅ User interactions
- ✅ Form validation
- ✅ DataSource state changes
- ✅ Service calls (mocked)

## 🐛 Troubleshooting

For common issues, ALWAYS check:
**file:///.claude/knowledge/troubleshooting.md**

Quick fixes:
- DataSource errors → Check if edit() or append() was called
- Size issues → Check if innerRef is set and useArchbaseSize is used
- Validation not working → Check if validator is on DataSource, not template
- Props not found → Check component documentation in SKILL.md

## 📝 Before Committing

Run these checks:
```bash
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

## 🎓 Learning Resources

### For New Developers
1. Read: **file:///docs/ARCHITECTURE.md**
2. Read: **file:///docs/DEVELOPMENT.md**
3. Study: **file:///.claude/examples/** (all examples)
4. Read: **file:///.claude/SKILL.md** (complete reference)

### For Experienced Developers
- Reference: **file:///.claude/SKILL.md** (quick lookup)
- Examples: **file:///.claude/examples/** (patterns)
- Troubleshooting: **file:///.claude/knowledge/troubleshooting.md**

---

**Remember:** The .claude/ directory contains ALL the knowledge about Archbase patterns.
Always reference it when creating new components.

**Last Updated:** [Date]  
**Archbase Version:** [Version]  
**Project Version:** [Version]
```

### 2. .claude/SKILL.md

```markdown
# Archbase React - Complete Reference Guide

This is the authoritative reference for Archbase React patterns, components, and best practices.

## Table of Contents
1. [Core Concepts](#core-concepts)
2. [ArchbaseDataSource](#archbasedatasource)
3. [Components Reference](#components-reference)
4. [Form Patterns](#form-patterns)
5. [View Patterns](#view-patterns)
6. [Service Patterns](#service-patterns)
7. [Validation](#validation)
8. [State Management](#state-management)
9. [Common Issues](#common-issues)

---

## Core Concepts

### The Archbase Philosophy

Archbase React is built on three core principles:
1. **DataSource-Centric**: All data flows through ArchbaseDataSource
2. **Declarative Binding**: Components bind to DataSource fields automatically
3. **Separation of Concerns**: Services, DTOs, Views, and State are clearly separated

### Key Technologies
- **React 19**: Latest React with concurrent features
- **TypeScript 5**: Full type safety
- **Mantine v8**: UI components base
- **Archbase Components**: Enhanced Mantine with DataSource integration

---

## ArchbaseDataSource

### What is ArchbaseDataSource?

ArchbaseDataSource is the **heart** of data management in Archbase. It manages:
- Data state (browsing, editing, inserting)
- Field binding
- Validation
- Change events

### Creating a DataSource

```typescript
import { ArchbaseDataSource } from '@archbase/components'

const dataSource = new ArchbaseDataSource<UserDto, string>({
  name: 'dsUser',           // Unique identifier
  initialData: [],          // Initial data array
  validator: myValidator    // Optional validator
})
```

### DataSource States

**1. BROWSING (Default State)**
- User is navigating/viewing data
- No modifications allowed
- Use: `dataSource.isBrowsing()`

**2. EDITING**
- User is editing existing record
- Modifications tracked
- Enter: `dataSource.edit()`
- Check: `dataSource.isEditing()`

**3. INSERTING**
- User is creating new record
- New record being built
- Enter: `dataSource.append(newRecord)`
- Check: `dataSource.isInserting()`

### Essential Operations

```typescript
// Load data
dataSource.setData([user1, user2, user3])

// Navigate
dataSource.first()      // Go to first record
dataSource.last()       // Go to last record
dataSource.next()       // Next record
dataSource.prior()      // Previous record
dataSource.goToId(id)   // Jump to specific ID

// Edit existing
dataSource.edit()
dataSource.setFieldValue('name', 'John Doe')
dataSource.post()       // Commit changes

// Insert new
dataSource.append({ name: '', email: '' } as UserDto)
// Fields modified through UI binding
dataSource.post()       // Commit new record

// Cancel changes
dataSource.cancel()

// Delete
dataSource.delete()     // Delete current record
```

### Binding to Components

```typescript
// Automatic bidirectional binding
<ArchbaseEdit 
  dataSource={dataSource}   // DataSource instance
  dataField="name"          // Field to bind
  label="Name"
  required
/>

// When user types in ArchbaseEdit:
// 1. Value updates in DataSource automatically
// 2. Validation runs (if configured)
// 3. UI reflects validation state

// When DataSource changes programmatically:
// 1. ArchbaseEdit updates automatically
// 2. No manual setState needed
```

### Complete DataSource Example

```typescript
export function UserForm({ id }: { id?: string }) {
  // 1. Create DataSource
  const [dataSource] = useState(() => 
    new ArchbaseDataSource<UserDto, string>({
      name: 'dsUser',
      initialData: [],
      validator: userValidator
    })
  )

  // 2. Load data from API
  const { data, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.findById(id!),
    enabled: !!id
  })

  // 3. Populate DataSource when data loads
  useEffect(() => {
    if (data) {
      dataSource.setData([data])
      dataSource.edit()  // Enter edit mode
    } else {
      // New record
      dataSource.append({ active: true } as UserDto)
    }
  }, [data])

  // 4. Save mutation
  const saveMutation = useMutation({
    mutationFn: (user: UserDto) => userService.save(user),
    onSuccess: (savedUser) => {
      dataSource.setFieldValue('id', savedUser.id)
      dataSource.post()
      // Navigate away or show success
    }
  })

  // 5. Save handler
  const handleSave = async () => {
    const isValid = await dataSource.validate()
    if (!isValid) return

    const currentData = dataSource.getCurrentRecord()
    saveMutation.mutate(currentData)
  }

  // 6. Render with bound components
  return (
    <Box>
      <ArchbaseEdit dataSource={dataSource} dataField="name" label="Name" />
      <ArchbaseEdit dataSource={dataSource} dataField="email" label="Email" />
      <Button onClick={handleSave}>Save</Button>
    </Box>
  )
}
```

---

## Components Reference

### Input Components

#### ArchbaseEdit
Text input with DataSource binding.

**Props:**
```typescript
interface ArchbaseEditProps {
  dataSource: ArchbaseDataSource<T, ID>  // Required
  dataField: string                      // Required
  label?: string
  placeholder?: string
  required?: boolean
  readOnly?: boolean
  maxLength?: number
  disabled?: boolean
}
```

**Example:**
```typescript
<ArchbaseEdit 
  dataSource={dataSource}
  dataField="name"
  label="Full Name"
  placeholder="Enter your name"
  required
  maxLength={100}
/>
```

#### ArchbaseSelect
Dropdown select with DataSource binding.

**Props:**
```typescript
interface ArchbaseSelectProps {
  dataSource: ArchbaseDataSource<T, ID>
  dataField: string
  data: Array<{ value: string, label: string }>
  label?: string
  placeholder?: string
  searchable?: boolean
  clearable?: boolean
  required?: boolean
}
```

**Example:**
```typescript
<ArchbaseSelect
  dataSource={dataSource}
  dataField="role"
  label="User Role"
  data={[
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'USER', label: 'User' },
    { value: 'GUEST', label: 'Guest' }
  ]}
  searchable
  clearable
  required
/>
```

#### ArchbaseDatePicker
Date picker with DataSource binding.

**Example:**
```typescript
<ArchbaseDatePicker
  dataSource={dataSource}
  dataField="birthDate"
  label="Birth Date"
  required
/>
```

#### ArchbaseNumberInput
Number input with DataSource binding.

**Example:**
```typescript
<ArchbaseNumberInput
  dataSource={dataSource}
  dataField="age"
  label="Age"
  min={0}
  max={150}
  required
/>
```

#### ArchbaseSwitch
Toggle switch with DataSource binding.

**Example:**
```typescript
<ArchbaseSwitch
  dataSource={dataSource}
  dataField="active"
  label="Active"
/>
```

#### ArchbaseTextArea
Multi-line text input with DataSource binding.

**Example:**
```typescript
<ArchbaseTextArea
  dataSource={dataSource}
  dataField="description"
  label="Description"
  rows={4}
  maxLength={500}
/>
```

### Table Components

#### ArchbaseDataTable
Data table with DataSource integration.

**Example:**
```typescript
<ArchbaseDataTable
  dataSource={dataSource}
  columns={[
    { dataField: 'id', caption: 'ID', width: 80 },
    { dataField: 'name', caption: 'Name', width: 200 },
    { dataField: 'email', caption: 'Email', width: 250 },
    { dataField: 'role', caption: 'Role', width: 120 },
    { dataField: 'active', caption: 'Active', width: 100, type: 'boolean' }
  ]}
  onRowDoubleClick={(record) => handleEdit(record.id)}
  allowColumnResizing
  allowColumnReordering
  showRowLines
  showBorders
/>
```

### Layout Components

#### ArchbaseFormTemplate
Standard form wrapper with actions.

**Props:**
```typescript
interface ArchbaseFormTemplateProps {
  innerRef?: React.Ref<HTMLDivElement>  // For size calculation
  title: string
  dataSource: ArchbaseDataSource<T, ID>
  isLoading?: boolean
  isError?: boolean
  error?: Error | string
  withBorder?: boolean
  onBeforeSave?: () => void
  onAfterSave?: () => void
  onCancel?: () => void
  onError?: (error: Error) => void
  children: React.ReactNode
}
```

**Example:**
```typescript
const { ref, height } = useArchbaseSize()
const safeHeight = height > 0 ? height - 130 : 600

<ArchbaseFormTemplate
  innerRef={ref}
  title="User Registration"
  dataSource={dataSource}
  isLoading={isLoading}
  isError={isError}
  error={error}
  withBorder={false}
  onCancel={handleCancel}
  onAfterSave={handleAfterSave}
>
  <Paper withBorder style={{ height: safeHeight }}>
    {/* Form content */}
  </Paper>
</ArchbaseFormTemplate>
```

#### ArchbaseListTemplate
Standard list wrapper with actions.

**Example:**
```typescript
<ArchbaseListTemplate
  title="Users"
  dataSource={dataSource}
  isLoading={isLoading}
  onNew={handleNew}
  onRefresh={handleRefresh}
>
  <ArchbaseDataTable dataSource={dataSource} columns={columns} />
</ArchbaseListTemplate>
```

---

## Form Patterns

### Pattern 1: Simple Form (No Tabs)

```typescript
export function SimpleUserForm({ id, onClose }: FormProps) {
  const { ref, height } = useArchbaseSize()
  const safeHeight = height > 0 ? height - 130 : 600

  const [dataSource] = useState(() => 
    new ArchbaseDataSource<UserDto, string>({
      name: 'dsUser',
      initialData: []
    })
  )

  // Load data, mutations, etc...

  return (
    <ArchbaseFormTemplate
      innerRef={ref}
      title="User Form"
      dataSource={dataSource}
      onCancel={onClose}
    >
      <Paper withBorder style={{ height: safeHeight }}>
        <Box p="md">
          <Group grow mb="md">
            <ArchbaseEdit dataSource={dataSource} dataField="name" label="Name" />
            <ArchbaseEdit dataSource={dataSource} dataField="email" label="Email" />
          </Group>
          
          <Group grow>
            <ArchbaseSelect dataSource={dataSource} dataField="role" label="Role" data={roles} />
            <ArchbaseSwitch dataSource={dataSource} dataField="active" label="Active" />
          </Group>
        </Box>
      </Paper>
    </ArchbaseFormTemplate>
  )
}
```

### Pattern 2: Form with Tabs

```typescript
export function ComplexUserForm({ id, onClose }: FormProps) {
  const { ref, height } = useArchbaseSize()
  const safeHeight = height > 0 ? height - 130 : 600

  return (
    <ArchbaseFormTemplate innerRef={ref} title="User Details" dataSource={dataSource}>
      <Paper withBorder style={{ height: safeHeight }}>
        <Tabs defaultValue="basic" style={{ height: '100%' }}>
          <Tabs.List>
            <Tabs.Tab value="basic">Basic Info</Tabs.Tab>
            <Tabs.Tab value="contact">Contact</Tabs.Tab>
            <Tabs.Tab value="preferences">Preferences</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" style={{ height: 'calc(100% - 40px)' }}>
            <Box p="md" style={{ overflowY: 'auto', height: '100%' }}>
              <Group grow mb="md">
                <ArchbaseEdit dataSource={dataSource} dataField="firstName" label="First Name" />
                <ArchbaseEdit dataSource={dataSource} dataField="lastName" label="Last Name" />
              </Group>
              {/* More fields... */}
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="contact" style={{ height: 'calc(100% - 40px)' }}>
            <Box p="md" style={{ overflowY: 'auto', height: '100%' }}>
              {/* Contact fields... */}
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="preferences" style={{ height: 'calc(100% - 40px)' }}>
            <Box p="md" style={{ overflowY: 'auto', height: '100%' }}>
              {/* Preference fields... */}
            </Box>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </ArchbaseFormTemplate>
  )
}
```

**Critical Tab Patterns:**
- Tabs container: `style={{ height: '100%' }}`
- Tab panels: `style={{ height: 'calc(100% - 40px)' }}` (40px = tab header height)
- Content box: `style={{ overflowY: 'auto', height: '100%' }}`

---

## View Patterns

### Pattern 1: Simple List View

```typescript
export function UserListView({ onEdit, onView }: ListViewProps) {
  const [dataSource] = useState(() => 
    new ArchbaseDataSource<UserDto, string>({
      name: 'dsUserList',
      initialData: []
    })
  )

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.findAll()
  })

  useEffect(() => {
    if (data) {
      dataSource.setData(data)
    }
  }, [data])

  const columns = [
    { dataField: 'id', caption: 'ID', width: 80 },
    { dataField: 'name', caption: 'Name', width: 200 },
    { dataField: 'email', caption: 'Email', width: 250 },
    { dataField: 'role', caption: 'Role', width: 120 }
  ]

  return (
    <ArchbaseListTemplate
      title="Users"
      dataSource={dataSource}
      isLoading={isLoading}
    >
      <ArchbaseDataTable
        dataSource={dataSource}
        columns={columns}
        onRowDoubleClick={(record) => onEdit(record.id)}
      />
    </ArchbaseListTemplate>
  )
}
```

### Pattern 2: Complete CRUD Manager

```typescript
export function UserManagerView() {
  const [action, setAction] = useState<'LIST' | 'EDIT' | 'VIEW' | 'NEW'>('LIST')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleNew = () => {
    setSelectedId(null)
    setAction('NEW')
  }

  const handleEdit = (id: string) => {
    setSelectedId(id)
    setAction('EDIT')
  }

  const handleView = (id: string) => {
    setSelectedId(id)
    setAction('VIEW')
  }

  const handleClose = () => {
    setAction('LIST')
    setSelectedId(null)
  }

  if (action === 'LIST') {
    return (
      <UserListView
        onNew={handleNew}
        onEdit={handleEdit}
        onView={handleView}
      />
    )
  }

  return (
    <UserForm
      id={selectedId}
      action={action}
      onClose={handleClose}
    />
  )
}
```

---

## Service Patterns

### Base Service Pattern

```typescript
import { injectable, inject } from 'inversify'
import { ArchbaseRemoteApiService } from '@archbase/data'
import type { ArchbaseRemoteApiClient } from '@archbase/data'

@injectable()
export class UserService extends ArchbaseRemoteApiService<UserDto, string> {
  constructor(
    @inject('ApiClient') client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  protected getEndpoint(): string {
    return '/api/v1/users'  // Always plural
  }

  protected configureHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Tenant-ID': this.getTenantId()
    }
  }

  // Custom methods
  async updateStatus(id: string, status: string): Promise<UserDto> {
    const headers = this.configureHeaders()
    const result = await this.client.put<{ status: string }, UserDto>(
      `${this.getEndpoint()}/${id}/status`,
      { status },
      headers,
      false
    )
    return this.transform(result)
  }

  async findByEmail(email: string): Promise<UserDto | null> {
    const headers = this.configureHeaders()
    const result = await this.client.get<UserDto>(
      `${this.getEndpoint()}/email/${email}`,
      headers,
      false
    )
    return this.transform(result)
  }
}
```

**Service Rules:**
1. Always use `type` imports for decorators
2. Always call `configureHeaders()` in methods
3. Use proper generics: `client.method<RequestType, ResponseType>`
4. Endpoints in plural: `/users`, `/drivers`, `/orders`
5. Always `transform()` results before returning

---

## Validation

### Yup Validation

```typescript
import * as yup from 'yup'
import { ArchbaseYupValidator } from '@archbase/components'

const userSchema = yup.object({
  name: yup
    .string()
    .required('Name is required')
    .min(3, 'Name must be at least 3 characters'),
  
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format'),
  
  age: yup
    .number()
    .required('Age is required')
    .min(18, 'Must be at least 18 years old')
    .max(120, 'Invalid age'),
  
  role: yup
    .string()
    .required('Role is required')
    .oneOf(['ADMIN', 'USER', 'GUEST'], 'Invalid role')
})

const validator = new ArchbaseYupValidator(userSchema)

// Use in DataSource
const dataSource = new ArchbaseDataSource({
  name: 'dsUser',
  validator: validator  // Validation runs automatically on field changes
})
```

### Custom Validation

```typescript
class CustomUserValidator implements ArchbaseValidator {
  async validate(data: UserDto): Promise<ValidationResult> {
    const errors: Record<string, string> = {}

    if (!data.name) {
      errors.name = 'Name is required'
    }

    if (!data.email || !data.email.includes('@')) {
      errors.email = 'Invalid email'
    }

    // Custom business rule
    if (data.role === 'ADMIN' && data.age < 21) {
      errors.role = 'Admins must be at least 21 years old'
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    }
  }
}
```

---

## State Management

### React Query Integration

```typescript
// Query for fetching
export function useUser(id?: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.findById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,  // 5 minutes
    cacheTime: 10 * 60 * 1000   // 10 minutes
  })
}

// Mutation for saving
export function useUserSave() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (user: UserDto) => userService.save(user),
    onSuccess: (savedUser) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.setQueryData(['user', savedUser.id], savedUser)
    }
  })
}

// Usage in component
function UserForm({ id }: { id?: string }) {
  const { data, isLoading, isError, error } = useUser(id)
  const saveMutation = useUserSave()

  const handleSave = () => {
    const userData = dataSource.getCurrentRecord()
    saveMutation.mutate(userData)
  }

  // ...
}
```

### Custom DataSource Hook

```typescript
export function useUserDataSource(id?: string) {
  const [dataSource] = useState(() => 
    new ArchbaseDataSource<UserDto, string>({
      name: 'dsUser',
      initialData: [],
      validator: userValidator
    })
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.findById(id!),
    enabled: !!id
  })

  useEffect(() => {
    if (data) {
      dataSource.setData([data])
      if (id) {
        dataSource.edit()  // Existing record
      } else {
        dataSource.append({ active: true } as UserDto)  // New record
      }
    }
  }, [data])

  return {
    dataSource,
    isLoading,
    isError,
    error
  }
}

// Usage
function UserForm({ id }: { id?: string }) {
  const { dataSource, isLoading, isError, error } = useUserDataSource(id)
  
  // dataSource is ready to use!
  return (
    <ArchbaseFormTemplate dataSource={dataSource} isLoading={isLoading}>
      {/* ... */}
    </ArchbaseFormTemplate>
  )
}
```

---

## Common Issues

### Issue 1: "Cannot modify in browsing state"
**Symptom:** Error when trying to set field values  
**Cause:** DataSource not in edit/insert mode  
**Solution:**
```typescript
// Before modifying
dataSource.edit()  // For existing record
// OR
dataSource.append(newRecord)  // For new record

// Then modify
dataSource.setFieldValue('name', 'John')
```

### Issue 2: "width: 0px, height: 0px"
**Symptom:** Form not visible or incorrectly sized  
**Cause:** Missing `innerRef` or incorrect `useArchbaseSize` usage  
**Solution:**
```typescript
const { ref, height } = useArchbaseSize()  // Note: object destructuring
const safeHeight = height > 0 ? height - 130 : 600

<ArchbaseFormTemplate innerRef={ref}>
  <Paper withBorder style={{ height: safeHeight }}>
    {/* content */}
  </Paper>
</ArchbaseFormTemplate>
```

### Issue 3: "Property 'validator' does not exist"
**Symptom:** TypeScript error on ArchbaseFormTemplate  
**Cause:** `validator` is not a prop of ArchbaseFormTemplate  
**Solution:**
```typescript
// ❌ Wrong
<ArchbaseFormTemplate validator={myValidator} />

// ✅ Correct - set on DataSource
const dataSource = new ArchbaseDataSource({
  validator: myValidator
})
```

### Issue 4: "Property 'readOnly' does not exist"
**Symptom:** TypeScript error on ArchbaseFormTemplate  
**Cause:** `readOnly` is not a prop of ArchbaseFormTemplate  
**Solution:**
```typescript
// ❌ Wrong
<ArchbaseFormTemplate readOnly={isViewOnly} />

// ✅ Correct - apply to fields
<ArchbaseEdit dataSource={ds} dataField="name" readOnly={isViewOnly} />
```

### Issue 5: Fields not updating in UI
**Symptom:** Changing DataSource doesn't update components  
**Cause:** Missing or incorrect binding  
**Solution:**
```typescript
// Ensure all fields have proper binding
<ArchbaseEdit 
  dataSource={dataSource}  // ✓ Must reference DataSource
  dataField="name"         // ✓ Must specify field
/>
```

### Issue 6: Validation not showing errors
**Symptom:** Form allows invalid data  
**Cause:** Validator not configured or not being called  
**Solution:**
```typescript
// 1. Create validator
const validator = new ArchbaseYupValidator(schema)

// 2. Set on DataSource
const dataSource = new ArchbaseDataSource({
  validator: validator  // ← Here
})

// 3. Validate before save
const handleSave = async () => {
  const isValid = await dataSource.validate()
  if (!isValid) {
    const errors = dataSource.getValidationErrors()
    console.log('Validation errors:', errors)
    return
  }
  // Proceed with save...
}
```

### Issue 7: Service methods failing
**Symptom:** 401/403 errors or missing headers  
**Cause:** Not calling `configureHeaders()` or missing implementation  
**Solution:**
```typescript
export class UserService extends ArchbaseRemoteApiService<UserDto, string> {
  // ✓ Always implement
  protected configureHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Tenant-ID': this.getTenantId(),
      // Add other headers as needed
    }
  }

  // ✓ Always call in custom methods
  async customMethod(id: string): Promise<UserDto> {
    const headers = this.configureHeaders()  // ← Call it
    const result = await this.client.get<UserDto>(
      `${this.getEndpoint()}/${id}`,
      headers,
      false
    )
    return this.transform(result)
  }
}
```

---

## Quick Reference Checklist

### Creating a New Form
- [ ] Create DataSource with validator
- [ ] Use `useArchbaseSize()` for complex forms
- [ ] Pass `innerRef={ref}` to ArchbaseFormTemplate
- [ ] Calculate `safeHeight = height - 130`
- [ ] Wrap content in Paper with `style={{ height: safeHeight }}`
- [ ] All fields have `dataSource` and `dataField`
- [ ] Call `edit()` or `append()` before modifications
- [ ] Validate before save: `await dataSource.validate()`
- [ ] Call `post()` after successful save

### Creating a New View
- [ ] Create DataSource for list data
- [ ] Load data with React Query
- [ ] Populate DataSource in useEffect
- [ ] Define columns for ArchbaseDataTable
- [ ] Implement handlers (new, edit, view, delete)
- [ ] Handle loading and error states

### Creating a New Service
- [ ] Extend `ArchbaseRemoteApiService<T, ID>`
- [ ] Use `type` imports for decorators
- [ ] Implement `getEndpoint()` - endpoints always plural
- [ ] Implement `configureHeaders()`
- [ ] Call `configureHeaders()` in all custom methods
- [ ] Use proper generics in HTTP methods
- [ ] Always `transform()` results
- [ ] Register in IoC container

---

**Last Updated:** [Date]  
**Version:** 1.0.0  
**Archbase React Version:** [Version]

This is the complete reference for working with Archbase React.
Always refer to this document when creating new components.
```

---

## 🎬 Como Usar o Boilerplate

### 1. Criar Novo Projeto

```bash
# Opção 1: Clone direto do boilerplate
git clone https://github.com/your-org/archbase-react-boilerplate.git my-new-project
cd my-new-project
rm -rf .git
git init

# Opção 2: Usando degit (recomendado)
npx degit your-org/archbase-react-boilerplate my-new-project
cd my-new-project
git init

# Opção 3: Com CLI do Archbase (futuro)
archbase create project my-new-project --boilerplate=react-archbase
```

### 2. Setup Inicial

```bash
# Instalar dependências
pnpm install

# Copiar e configurar env
cp .env.example .env
# Editar .env com suas configurações

# Iniciar desenvolvimento
pnpm dev
```

### 3. Claude Code está Pronto!

```bash
# Abrir com Claude Code
code .

# Claude já tem acesso a:
# ✅ CLAUDE.md - Instruções principais
# ✅ .claude/SKILL.md - Conhecimento completo do Archbase
# ✅ .claude/examples/ - Exemplos funcionais
# ✅ .claude/knowledge/ - Documentação modular
```

### 4. Desenvolvimento com Claude Code

```
Você: "Create a new CRUD for Product entity"

Claude Code:
1. Lê CLAUDE.md
2. Lê .claude/knowledge/view-patterns.md
3. Lê .claude/examples/views/CRUDView.example.tsx
4. Cria ProductDto.ts
5. Cria ProductService.ts
6. Cria ProductListView.tsx
7. Cria ProductForm.tsx
8. Cria ProductManagerView.tsx
9. Atualiza routes.tsx

Resultado: CRUD completo, funcional, seguindo todos os padrões!
```

---

## 📦 Scripts de Geração Incluídos

### generate-component.js

```javascript
// scripts/generate-component.js
// Gera novo componente baseado em template

const args = process.argv.slice(2)
const componentName = args[0]
const type = args[1] || 'functional'  // functional, form, view

// Lê template apropriado de .claude/templates/
// Substitui variáveis
// Cria arquivo em src/components/ ou src/views/

console.log(`Generated ${componentName}`)
```

Uso:
```bash
pnpm generate:component UserCard
pnpm generate:form ProductForm
pnpm generate:view ProductList
```

### generate-dto.js

```javascript
// scripts/generate-dto.js
// Gera DTO TypeScript a partir de classe Java

const javaFile = process.argv[2]

// 1. Lê arquivo Java
// 2. Extrai campos, tipos, annotations
// 3. Converte para TypeScript
// 4. Gera DTO em src/domain/
// 5. Gera enum helper se necessário

console.log(`Generated TypeScript DTO from ${javaFile}`)
```

Uso:
```bash
pnpm generate:dto ../backend/src/main/java/com/company/dto/UserDto.java
# Gera: src/domain/UserDto.ts
```

---

## 🔄 Manutenção do Boilerplate

### Atualizar Exemplos

```bash
# Script para atualizar exemplos com código real
pnpm run update-examples

# Este script:
# 1. Pega views/forms de produção
# 2. Remove código específico do projeto
# 3. Generaliza para exemplo
# 4. Adiciona comentários extensivos
# 5. Salva em .claude/examples/
```

### Atualizar Documentação

```bash
# Quando Archbase atualiza:
# 1. Atualizar .claude/SKILL.md com novos componentes
# 2. Atualizar .claude/knowledge/ com novos padrões
# 3. Adicionar novos exemplos se necessário
# 4. Atualizar CLAUDE.md se estrutura mudou
# 5. Commit e tag: v1.1.0
```

### Versioning

```bash
# Versionar o boilerplate
git tag v1.0.0
git push origin v1.0.0

# Changelog
## v1.0.0 - Initial Release
- Complete Archbase React setup
- CLAUDE.md with full documentation
- SKILL.md with 35+ components
- 20+ working examples
- React Query integration
- Inversify IoC setup
- Mantine v8 theme system
```

---

## ✅ Vantagens do Boilerplate

### Para Desenvolvedores
✅ **Setup instantâneo** - Clone e comece a desenvolver  
✅ **Claude Code produtivo desde dia 1** - Toda documentação embutida  
✅ **Padrões consistentes** - Todos os projetos seguem mesma estrutura  
✅ **Exemplos sempre disponíveis** - Copy-paste de código funcional  
✅ **Sem configuração** - Tudo já está pronto  

### Para Equipe
✅ **Onboarding rápido** - Novos devs produtivos em horas, não dias  
✅ **Code review fácil** - Todos usam mesmos padrões  
✅ **Manutenção centralizada** - Atualiza boilerplate, todos os projetos se beneficiam  
✅ **Conhecimento codificado** - Best practices embutidas na estrutura  

### Para Claude Code
✅ **Contexto completo** - Toda informação necessária disponível  
✅ **Exemplos funcionais** - Pode copiar padrões que funcionam  
✅ **Documentação clara** - Sabe exatamente o que fazer  
✅ **Troubleshooting** - Soluções para problemas comuns  

---

## 📊 Métricas Esperadas

### Tempo de Setup
- **Antes:** 2-3 dias configurando projeto novo
- **Depois:** 30 minutos (clone + env config)

### Produtividade com Claude Code
- **Antes:** 30-40% de código utilizável
- **Depois:** 80-90% de código utilizável

### Tempo de Desenvolvimento
- **Form novo:** 30-60 minutos (vs. 2-4 horas)
- **View nova:** 1-2 horas (vs. 3-5 horas)
- **CRUD completo:** 2-3 horas (vs. 1-2 dias)

### Qualidade
- **Padrões seguidos:** 95%+ (vs. 50%)
- **Bugs de integração:** -70%
- **Code review feedback:** -60%

---

## 🚀 Roadmap do Boilerplate

### v1.0 - MVP (Inicial)
- ✅ Estrutura completa do projeto
- ✅ CLAUDE.md documentação
- ✅ SKILL.md com 20+ componentes
- ✅ 10+ exemplos funcionais
- ✅ Scripts de geração básicos

### v1.1 - Expansão
- 📋 SKILL.md com 40+ componentes
- 📋 20+ exemplos em todas categorias
- 📋 Templates avançados (wizard, stepper)
- 📋 Scripts de migração Java → TS automatizados

### v1.2 - Features Avançadas
- 📋 Autenticação OAuth pré-configurada
- 📋 Multi-tenancy setup
- 📋 Websocket integration
- 📋 Background jobs setup

### v2.0 - Enterprise
- 📋 Múltiplos flavors (admin, saas, marketplace)
- 📋 CLI integrado para scaffolding
- 📋 Testes automatizados incluídos
- 📋 CI/CD pipelines pré-configurados

---

## 🎯 Próximos Passos para Implementação

### Fase 1: Criar Boilerplate (Semana 1-2)

**Dia 1-2: Estrutura Base**
- [ ] Criar projeto React + Vite + TypeScript
- [ ] Configurar Archbase + Mantine
- [ ] Setup básico (IoC, routing, i18n)
- [ ] Estrutura de pastas completa

**Dia 3-4: Documentação**
- [ ] Criar CLAUDE.md (documento principal)
- [ ] Criar .claude/SKILL.md (componentes)
- [ ] Criar documentação modular (.claude/knowledge/)
- [ ] Adicionar troubleshooting guide

**Dia 5-7: Exemplos**
- [ ] Extrair 5 forms de referência de projetos existentes
- [ ] Extrair 5 views de referência
- [ ] Criar 3 service examples
- [ ] Criar hook examples
- [ ] Adicionar comentários extensivos

**Dia 8-10: Scripts e Finalização**
- [ ] Criar scripts de geração (component, dto)
- [ ] Criar script de update-examples
- [ ] README.md completo
- [ ] docs/ com guias adicionais
- [ ] Testar boilerplate criando projeto exemplo

### Fase 2: Validação (Semana 3)

**Teste Interno**
- [ ] 2-3 devs criam projetos do zero com boilerplate
- [ ] Usar Claude Code extensivamente
- [ ] Coletar feedback e problemas
- [ ] Refinar documentação

**Ajustes**
- [ ] Corrigir issues encontrados
- [ ] Adicionar exemplos faltantes
- [ ] Melhorar CLAUDE.md/SKILL.md
- [ ] Otimizar estrutura

### Fase 3: Deploy (Semana 4)

**Publicação**
- [ ] Repository privado no GitHub/GitLab
- [ ] Documentação de uso (README)
- [ ] Vídeo/tutorial de setup
- [ ] Apresentação para equipe

**Adoção**
- [ ] Todos os projetos novos usam boilerplate
- [ ] Migração gradual de projetos existentes
- [ ] Treinamento da equipe
- [ ] Processo de atualização definido

---

## 💬 Discussão com Equipe

### Perguntas Chave

1. **Projetos de Referência**
   - Qual projeto está mais maduro/estável para extrair exemplos?
   - PowerView Admin pode ser a base?
   - VendaX.ai tem padrões bons?

2. **Estrutura**
   - A estrutura proposta faz sentido para vocês?
   - Falta alguma pasta/organização?
   - Preferências de naming/organização?

3. **Documentação**
   - Nível de detalhe está bom?
   - Falta documentar algum padrão importante?
   - Exemplos são suficientes?

4. **Implementação**
   - Quem pode liderar a criação do boilerplate?
   - Quanto tempo podemos dedicar?
   - Fazer em paralelo com desenvolvimento normal?

5. **Manutenção**
   - Quem vai ser owner do boilerplate?
   - Como vamos manter atualizado?
   - Como versionamos?

### Decisões a Tomar

- [ ] Aprovação da estrutura proposta
- [ ] Definir responsáveis
- [ ] Definir timeline
- [ ] Definir projetos de referência para extrair exemplos
- [ ] Definir processo de atualização
- [ ] Definir processo de adoção em projetos novos

---

**Documento criado em:** Dezembro 2024  
**Status:** 📋 Proposta para Discussão  
**Próxima revisão:** Após decisão da equipe

---

## 📝 Anotações da Reunião

**Data:** _______________

**Participantes:** _______________

**Decisões:**
- Estrutura aprovada? [ ] Sim [ ] Não
- Responsáveis: _______________
- Timeline: _______________
- Projetos de referência: _______________

**Próximos Passos:**
1. _______________
2. _______________
3. _______________

**Dúvidas/Bloqueios:**
- _______________
- _______________

---

*Fim do Documento*
