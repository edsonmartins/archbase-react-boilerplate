# Estratégias para Otimizar Claude Code com Archbase React

## 📋 Documento de Análise e Proposta
**Data:** Dezembro 2024  
**Contexto:** Melhoria do workflow de desenvolvimento frontend com Claude Code  
**Equipe:** IntegrAllTech - VendaX.ai  

---

## 🎯 Contexto e Problema

### Situação Atual

**✅ O que está funcionando bem:**
- **Backend Java**: Claude Code consegue seguir padrões hexagonais após criar primeiros exemplos (ports, adapters, repositórios com QueryDSL)
- **Mobile Flutter**: Resultados ótimos usando apenas Dart e widgets nativos do Flutter

**❌ O que está complexo:**
- **Frontend React**: Dificuldade em manter padrões e qualidade de código com nossa biblioteca `archbase-react` baseada em Mantine v8

### Análise da Causa Raiz

**Por que funciona no Backend/Flutter:**
1. **Backend**: Arquitetura hexagonal é um padrão conhecido + após criar casos iniciais, Claude mantém consistência
2. **Flutter**: Widgets são padrão de mercado, sem abstrações extras que Claude precisa aprender

**Por que trava no Frontend:**
1. **Claude não conhece archbase-react**: Biblioteca customizada interna
2. **Padrões específicos**: `ArchbaseDatasource`, services remotos, componentes especializados
3. **CLAUDE.md genérico**: ~1096 linhas focadas em padrões do projeto, não na biblioteca em si
4. **Dependência de exemplos**: Resultados melhores quando fornecemos componentes/views de exemplo (mas não escalável)
5. **Volume de componentes**: Grande quantidade de componentes sem documentação estruturada (apenas comentários no código)

### Tentativas Anteriores

- ✅ **CLAUDE.md criado**: Boa base, mas genérico demais
- ⚠️ **CLI do Archbase iniciado**: Projeto ambicioso, mas incompleto e requer mais esforço
- ❌ **Exemplos no CLAUDE.md**: Ultrapassou limite de tokens do Claude

---

## 💡 Estratégias Propostas

### Matriz de Priorização

| Estratégia | Esforço | Impacto | Prazo | Prioridade |
|------------|---------|---------|-------|------------|
| 1. Skill Customizado | Baixo (2-3 dias) | Alto | Imediato | ⭐⭐⭐ ALTA |
| 2. Biblioteca de Referência | Médio (1 semana) | Alto | Curto | ⭐⭐⭐ ALTA |
| 3. CLAUDE.md Modular | Baixo (1-2 dias) | Médio | Imediato | ⭐⭐ MÉDIA |
| 4. Completar CLI | Alto (2-3 semanas) | Muito Alto | Médio/Longo | ⭐ BAIXA* |

*CLI tem alto potencial futuro, mas não resolve problema imediato

---

## 📚 ESTRATÉGIA 1: Skill Customizado do Archbase
**⭐ PRIORIDADE ALTA**

### Conceito
Criar um skill dedicado ao Archbase React, similar aos skills existentes (docx, pptx, xlsx) que Claude Code já usa com sucesso.

### Estrutura do Skill
```
/mnt/skills/private/archbase/SKILL.md
```

### Conteúdo Sugerido

```markdown
# Archbase React - Core Patterns

## 1. ArchbaseDataSource V2 (Fundação)
### Conceito
[Explicação concisa do DataSource]

### Criação e Configuração
```typescript
// Exemplo de criação
const dataSource = new ArchbaseDataSource<UserDto, string>({
  name: 'dsUser',
  initialData: [],
  validator: userValidator
})
```

### Estados do DataSource
- BROWSING: Navegação
- EDITING: Edição
- INSERTING: Inserção

### Binding com Componentes
```typescript
<ArchbaseEdit 
  dataSource={dataSource} 
  dataField="name" 
/>
```

## 2. Componentes Principais (Top 15-20)

### ArchbaseEdit
**Uso:** Input de texto com binding automático

**Props Essenciais:**
- `dataSource`: ArchbaseDataSource<T, ID>
- `dataField`: string
- `label`: string
- `placeholder`: string
- `required`: boolean

**Exemplo Completo:**
```typescript
<ArchbaseEdit
  dataSource={dsUser}
  dataField="email"
  label="E-mail"
  placeholder="usuario@exemplo.com"
  required
/>
```

**Dicas:**
- Sempre fornecer `dataSource` para binding automático
- `dataField` deve corresponder ao campo do DTO
- Label é opcional mas recomendado

### ArchbaseSelect
[...]

### ArchbaseDataTable
[...]

[Continuar para os 15-20 componentes mais usados]

## 3. Padrões de Services Remotos

### Service Básico
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
    return '/api/v1/users'
  }

  protected configureHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Tenant-ID': this.getTenantId()
    }
  }

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
}
```

### Padrões Obrigatórios:
1. Sempre usar `type` import para decorators
2. Chamar `configureHeaders()` em todos os métodos
3. Usar generics corretos: `client.method<RequestType, ResponseType>`
4. Endpoints sempre no plural: `/api/v1/users`, `/api/v1/drivers`

## 4. Form Templates

### Form Template Padrão (Simples)
```typescript
export function UserForm() {
  const { dataSource, isLoading, isError, error } = useUserDataSource()
  const { ref, height } = useArchbaseSize()
  const safeHeight = height > 0 ? height - 130 : 600

  return (
    <ArchbaseFormTemplate
      innerRef={ref}
      title="Cadastro de Usuário"
      dataSource={dataSource}
      isLoading={isLoading}
      isError={isError}
      error={error}
      withBorder={false}
    >
      <Paper withBorder style={{ height: safeHeight }}>
        <Box p="md">
          <Group grow>
            <ArchbaseEdit dataSource={dataSource} dataField="name" label="Nome" />
            <ArchbaseEdit dataSource={dataSource} dataField="email" label="E-mail" />
          </Group>
        </Box>
      </Paper>
    </ArchbaseFormTemplate>
  )
}
```

### Form Template com Tabs
```typescript
export function DriverForm() {
  const { ref, height } = useArchbaseSize()
  const safeHeight = height > 0 ? height - 130 : 600

  return (
    <ArchbaseFormTemplate innerRef={ref} title="Motorista">
      <Paper withBorder style={{ height: safeHeight }}>
        <Tabs defaultValue="basic" style={{ height: '100%' }}>
          <Tabs.List>
            <Tabs.Tab value="basic">Dados Básicos</Tabs.Tab>
            <Tabs.Tab value="vehicle">Veículo</Tabs.Tab>
          </Tabs.List>
          
          <Tabs.Panel value="basic" style={{ height: 'calc(100% - 40px)' }}>
            <Box p="md" style={{ overflowY: 'auto' }}>
              {/* Conteúdo */}
            </Box>
          </Tabs.Panel>
          
          <Tabs.Panel value="vehicle" style={{ height: 'calc(100% - 40px)' }}>
            <Box p="md" style={{ overflowY: 'auto' }}>
              {/* Conteúdo */}
            </Box>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </ArchbaseFormTemplate>
  )
}
```

**Padrões Essenciais:**
1. Sempre usar `useArchbaseSize()` para forms complexos
2. Calcular `safeHeight = height - 130`
3. Passar `innerRef={ref}` para ArchbaseFormTemplate
4. Wrapper `Paper` com `height: safeHeight`
5. Tabs com `height: '100%'` e panels com `height: 'calc(100% - 40px)'`

## 5. View Templates (CRUD)

### Lista Básica com DataTable
```typescript
export function UserListView() {
  const { dataSource, isLoading, isError, error } = useUserList()

  return (
    <ArchbaseListTemplate
      title="Usuários"
      dataSource={dataSource}
      isLoading={isLoading}
      isError={isError}
      error={error}
    >
      <ArchbaseDataTable
        dataSource={dataSource}
        columns={[
          { dataField: 'name', caption: 'Nome', width: 200 },
          { dataField: 'email', caption: 'E-mail', width: 250 },
          { dataField: 'role', caption: 'Perfil', width: 150 }
        ]}
      />
    </ArchbaseListTemplate>
  )
}
```

### CRUD Completo
```typescript
export function UserManagerView() {
  const [action, setAction] = useState<'LIST' | 'EDIT' | 'VIEW' | 'NEW'>('LIST')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleNew = () => {
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
    return <UserListView onNew={handleNew} onEdit={handleEdit} onView={handleView} />
  }

  return <UserForm id={selectedId} action={action} onClose={handleClose} />
}
```

## 6. Integração com Mantine v8

### Uso de Componentes Mantine
Archbase é construído sobre Mantine v8. Você pode usar componentes Mantine diretamente:

```typescript
import { Paper, Group, Box, Tabs, Text, Button } from '@mantine/core'

// Componentes Mantine funcionam normalmente com Archbase
<Paper withBorder p="md">
  <Group>
    <ArchbaseEdit dataSource={ds} dataField="name" />
    <Button onClick={handleSave}>Salvar</Button>
  </Group>
</Paper>
```

### Padrões de Layout
- **Paper**: Containers com borda
- **Group**: Layout horizontal
- **Stack**: Layout vertical
- **Box**: Container genérico com padding
- **Tabs**: Abas para organização

## 7. Padrões de Validação

### Com Yup
```typescript
import * as yup from 'yup'

const userSchema = yup.object({
  name: yup.string().required('Nome obrigatório'),
  email: yup.string().email('E-mail inválido').required('E-mail obrigatório'),
  age: yup.number().min(18, 'Idade mínima 18 anos')
})

const validator = new ArchbaseYupValidator(userSchema)
```

## 8. Hooks Customizados

### useDataSource Pattern
```typescript
export function useUserDataSource(id?: string) {
  const [dataSource] = useState(() => 
    new ArchbaseDataSource<UserDto, string>({
      name: 'dsUser',
      initialData: []
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
      dataSource.edit()
    }
  }, [data])

  return { dataSource, isLoading, isError, error }
}
```

## 9. Checklist de Desenvolvimento

Ao criar novos componentes com Archbase:

### Forms
- [ ] Usar `useArchbaseSize()` para forms complexos
- [ ] Calcular `safeHeight = height - 130`
- [ ] Passar `innerRef={ref}` para ArchbaseFormTemplate
- [ ] Todos os campos com `dataSource` e `dataField`
- [ ] Validação configurada
- [ ] Loading states configurados
- [ ] Error handling implementado

### Views
- [ ] DataSource configurado corretamente
- [ ] Columns do DataTable mapeadas
- [ ] Actions (new, edit, view, delete) implementadas
- [ ] Loading e error states
- [ ] Confirmação de exclusão

### Services
- [ ] Extends `ArchbaseRemoteApiService<T, ID>`
- [ ] Type imports para decorators
- [ ] `configureHeaders()` implementado
- [ ] Endpoint no plural (`/api/v1/users`)
- [ ] Generics corretos em métodos HTTP

## 10. Erros Comuns e Soluções

### Erro: "width: 0px, height: 0px"
**Causa:** Falta `innerRef` ou uso incorreto do hook  
**Solução:**
```typescript
const { ref, height } = useArchbaseSize()
// Depois passar ref={ref} para ArchbaseFormTemplate
```

### Erro: "Property 'validator' does not exist"
**Causa:** validator não é prop do ArchbaseFormTemplate  
**Solução:** Usar validator direto no DataSource
```typescript
const dataSource = new ArchbaseDataSource({
  validator: myValidator
})
```

### Erro: "Property 'readOnly' does not exist"
**Causa:** readOnly não existe em ArchbaseFormTemplate  
**Solução:** Aplicar readOnly nos campos individuais
```typescript
<ArchbaseEdit dataSource={ds} dataField="name" readOnly={isViewOnly} />
```

## 11. Quando Usar Mantine vs Archbase

### Usar Archbase quando:
- Precisa de binding automático com DataSource
- Formulários com validação
- Tabelas com dados remotos
- Padrões CRUD estabelecidos

### Usar Mantine quando:
- Componentes de layout (Paper, Group, Box)
- Elementos visuais (Badge, Avatar, Indicator)
- Navegação (Tabs, Menu)
- Feedback (Notifications, Modal)
- Componentes que não precisam de binding

## 12. Padrões de Nomenclatura

### DTOs
- Sempre sufixo `Dto`: `UserDto`, `DriverDto`, `OrderDto`
- Propriedades em camelCase: `firstName`, `lastName`, `createdAt`

### Services
- Sempre sufixo `Service`: `UserService`, `OrderService`
- Métodos CRUD padrão: `findAll`, `findById`, `save`, `delete`
- Métodos customizados verbos claros: `updateStatus`, `assignDriver`

### DataSources
- Prefixo `ds`: `dsUser`, `dsDriver`, `dsOrders`
- Nome descritivo do domínio

### Components
- Form: sufixo `Form` - `UserForm`, `DriverForm`
- View: sufixo `View` - `UserListView`, `DashboardView`
- Manager: sufixo `Manager` - `UserManager`, `OrderManager`
```

### Estrutura de Pastas no Projeto
```
/mnt/skills/private/archbase/
├── SKILL.md                    (documento principal)
├── examples/
│   ├── forms/                  (exemplos de forms)
│   ├── views/                  (exemplos de views)
│   └── services/               (exemplos de services)
└── components/
    ├── inputs.md               (componentes de input)
    ├── tables.md               (componentes de tabela)
    └── layouts.md              (componentes de layout)
```

### Vantagens
✅ Contexto sempre disponível para Claude Code  
✅ Não consome limite de tokens (fica como conhecimento base)  
✅ Pode atualizar incrementalmente  
✅ Similar ao padrão de docx/pptx/xlsx que já funciona  
✅ Claude lê automaticamente quando necessário  

### Desvantagens
⚠️ Requer esforço inicial de documentação  
⚠️ Precisa ser mantido atualizado  

### Próximos Passos
1. **Levantar os 15-20 componentes mais usados** do archbase
2. **Extrair exemplos funcionais** de projetos existentes (PowerView Admin, VendaX.ai)
3. **Documentar os 2-3 padrões principais** de service/datasource
4. **Testar com Claude Code** em casos reais
5. **Refinar baseado no feedback** da equipe

---

## 🗂️ ESTRATÉGIA 2: Biblioteca de Componentes de Referência
**⭐ PRIORIDADE ALTA**

### Conceito
Criar um repositório interno de componentes prontos e funcionais que Claude pode ler e copiar.

### Estrutura Proposta

```
/archbase-examples/
├── README.md                    (índice e guia de uso)
├── forms/
│   ├── BasicUserForm.tsx        (form simples - 1 tab)
│   ├── ComplexDriverForm.tsx    (form com múltiplas tabs)
│   ├── ValidationForm.tsx       (form com validações complexas)
│   ├── NestedDataForm.tsx       (form com dados aninhados)
│   └── WizardForm.tsx           (form estilo wizard)
├── views/
│   ├── BasicListView.tsx        (lista simples)
│   ├── CRUDView.tsx            (crud completo)
│   ├── DashboardView.tsx        (dashboard com cards)
│   ├── MasterDetailView.tsx     (master-detail)
│   └── FilteredListView.tsx     (lista com filtros)
├── services/
│   ├── RemoteService.example.ts (service completo)
│   ├── AuthService.example.ts   (service com auth)
│   └── ServicePatterns.md       (padrões documentados)
├── datasource/
│   ├── DataSourcePatterns.tsx   (padrões de uso)
│   ├── DataSourceHooks.tsx      (hooks customizados)
│   └── DataSourceValidation.tsx (com validação)
├── hooks/
│   ├── useQuery.example.tsx     (integração React Query)
│   ├── useMutation.example.tsx  (mutations)
│   └── useDataSource.example.tsx (custom hooks)
└── layouts/
    ├── AdminLayout.tsx          (layout admin)
    ├── PublicLayout.tsx         (layout público)
    └── DashboardLayout.tsx      (layout dashboard)
```

### Exemplo de Arquivo de Referência

**forms/BasicUserForm.tsx:**
```typescript
/**
 * ARCHBASE REFERENCE: Basic User Form
 * 
 * Use este exemplo como base para forms simples (sem tabs)
 * 
 * Padrões demonstrados:
 * - useArchbaseSize para dimensionamento
 * - ArchbaseFormTemplate configuração
 * - Paper wrapper com height calculado
 * - Binding de campos com dataSource
 * - Loading e error states
 * - Validação com Yup
 */

import { useState, useEffect } from 'react'
import { Paper, Box, Group } from '@mantine/core'
import { 
  ArchbaseFormTemplate, 
  ArchbaseEdit, 
  ArchbaseSelect,
  ArchbaseDataSource,
  useArchbaseSize 
} from '@archbase/components'
import { useQuery } from '@tanstack/react-query'
import * as yup from 'yup'

// DTO
interface UserDto {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER' | 'GUEST'
  active: boolean
}

// Validação
const userSchema = yup.object({
  name: yup.string().required('Nome obrigatório'),
  email: yup.string().email('E-mail inválido').required('E-mail obrigatório'),
  role: yup.string().required('Perfil obrigatório')
})

interface BasicUserFormProps {
  id?: string
  action: 'NEW' | 'EDIT' | 'VIEW'
  onClose: () => void
}

export function BasicUserForm({ id, action, onClose }: BasicUserFormProps) {
  // Hook de dimensionamento (PADRÃO OBRIGATÓRIO para forms complexos)
  const { ref, height } = useArchbaseSize()
  const safeHeight = height > 0 ? height - 130 : 600

  // DataSource (PADRÃO OBRIGATÓRIO)
  const [dataSource] = useState(() => 
    new ArchbaseDataSource<UserDto, string>({
      name: 'dsUser',
      initialData: [],
      validator: new ArchbaseYupValidator(userSchema)
    })
  )

  // Loading de dados (quando em edição/visualização)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.findById(id!),
    enabled: !!id && action !== 'NEW'
  })

  // Popular DataSource quando dados carregarem
  useEffect(() => {
    if (data) {
      dataSource.setData([data])
      if (action === 'EDIT') {
        dataSource.edit()
      }
    } else if (action === 'NEW') {
      dataSource.append({ active: true } as UserDto)
      dataSource.edit()
    }
  }, [data, action])

  const isViewOnly = action === 'VIEW'

  return (
    <ArchbaseFormTemplate
      innerRef={ref}  // ESSENCIAL para cálculo de tamanho
      title={action === 'NEW' ? 'Novo Usuário' : action === 'EDIT' ? 'Editar Usuário' : 'Visualizar Usuário'}
      dataSource={dataSource}
      isLoading={isLoading}
      isError={isError}
      error={error}
      withBorder={false}
      onCancel={onClose}
      onAfterSave={onClose}
    >
      {/* Paper wrapper com altura calculada (PADRÃO OBRIGATÓRIO) */}
      <Paper withBorder style={{ height: safeHeight }}>
        <Box p="md">
          {/* Campos do form */}
          <Group grow mb="md">
            <ArchbaseEdit 
              dataSource={dataSource} 
              dataField="name" 
              label="Nome"
              placeholder="Nome completo"
              required
              readOnly={isViewOnly}
            />
            <ArchbaseEdit 
              dataSource={dataSource} 
              dataField="email" 
              label="E-mail"
              placeholder="usuario@exemplo.com"
              required
              readOnly={isViewOnly}
            />
          </Group>

          <Group grow>
            <ArchbaseSelect
              dataSource={dataSource}
              dataField="role"
              label="Perfil"
              data={[
                { value: 'ADMIN', label: 'Administrador' },
                { value: 'USER', label: 'Usuário' },
                { value: 'GUEST', label: 'Convidado' }
              ]}
              required
              readOnly={isViewOnly}
            />
            <ArchbaseSwitch
              dataSource={dataSource}
              dataField="active"
              label="Ativo"
              readOnly={isViewOnly}
            />
          </Group>
        </Box>
      </Paper>
    </ArchbaseFormTemplate>
  )
}

/**
 * DICAS DE USO:
 * 
 * 1. SEMPRE usar useArchbaseSize() para forms que precisam preencher a tela
 * 2. SEMPRE passar innerRef={ref} para ArchbaseFormTemplate
 * 3. SEMPRE calcular safeHeight = height - 130 (offset padrão)
 * 4. SEMPRE usar Paper com style={{ height: safeHeight }}
 * 5. Todos os campos DEVEM ter dataSource e dataField
 * 6. Para campos read-only, use a prop readOnly nos componentes individuais
 * 7. Validação é configurada no DataSource, não no ArchbaseFormTemplate
 * 
 * COPIE ESTE PADRÃO e adapte para suas necessidades!
 */
```

### Como Integrar no CLAUDE.md

```markdown
## Archbase Reference Examples

When creating forms/views with Archbase, ALWAYS read these reference files first:

### Forms
- **Simple form**: Read `file:///path/to/archbase-examples/forms/BasicUserForm.tsx`
- **Complex form with tabs**: Read `file:///path/to/archbase-examples/forms/ComplexDriverForm.tsx`
- **Form with validation**: Read `file:///path/to/archbase-examples/forms/ValidationForm.tsx`

### Views
- **Simple list**: Read `file:///path/to/archbase-examples/views/BasicListView.tsx`
- **CRUD view**: Read `file:///path/to/archbase-examples/views/CRUDView.tsx`
- **Dashboard**: Read `file:///path/to/archbase-examples/views/DashboardView.tsx`

### Services
- **Remote service pattern**: Read `file:///path/to/archbase-examples/services/RemoteService.example.ts`

These are WORKING examples from production. Copy the patterns, adapt to your needs.

### Example Usage Pattern
1. Identify what type of component you need to create
2. Read the corresponding reference file
3. Copy the structure and patterns
4. Adapt to your specific DTO and requirements
5. Maintain the essential patterns (useArchbaseSize, dataSource binding, etc.)
```

### Vantagens
✅ Exemplos reais que funcionam (código de produção)  
✅ Claude pode ler sob demanda (não sobrecarrega contexto inicial)  
✅ Fácil de manter/atualizar  
✅ Pode crescer organicamente conforme necessidade  
✅ Serve como documentação viva do projeto  
✅ Novos desenvolvedores também se beneficiam  

### Desvantagens
⚠️ Requer criação inicial dos exemplos  
⚠️ Precisa ser mantido sincronizado com mudanças da lib  

### Próximos Passos
1. **Identificar componentes** de referência nos projetos existentes (PowerView Admin)
2. **Extrair e limpar** código para ser usado como exemplo
3. **Adicionar comentários** extensivos explicando cada padrão
4. **Criar README** com índice e guia de uso
5. **Referenciar no CLAUDE.md** com instruções claras

---

## 📑 ESTRATÉGIA 3: CLAUDE.md Modular com Imports
**⭐ PRIORIDADE MÉDIA**

### Conceito
Dividir o CLAUDE.md gigante em módulos temáticos que Claude lê conforme necessário.

### Estrutura Proposta

```
/docs/claude/
├── CLAUDE.md                         (índice + instruções gerais + quando ler cada módulo)
├── archbase-core.md                  (conceitos fundamentais: DataSource, binding)
├── archbase-components-inputs.md     (componentes de input)
├── archbase-components-tables.md     (componentes de tabela/grid)
├── archbase-components-layouts.md    (componentes de layout)
├── archbase-datasource.md            (padrões detalhados de DataSource)
├── archbase-services.md              (padrões de services remotos)
├── form-patterns.md                  (padrões de forms: simples, tabs, wizard)
├── view-patterns.md                  (padrões de views: list, crud, dashboard)
├── validation-patterns.md            (padrões de validação)
├── state-management.md               (hooks, React Query, estados)
└── troubleshooting.md                (erros comuns e soluções)
```

### Exemplo de CLAUDE.md Principal

```markdown
# CLAUDE.md - Índice e Guia

## Como Usar Esta Documentação

Este projeto usa documentação modular. Leia os arquivos conforme a necessidade:

### 🚀 Leitura Obrigatória (sempre ler primeiro)
- **file:///docs/claude/archbase-core.md** - Conceitos fundamentais do Archbase

### 📝 Por Tipo de Tarefa

#### Criando Forms
1. Ler: **file:///docs/claude/form-patterns.md**
2. Ler: **file:///docs/claude/archbase-datasource.md**
3. Consultar: **file:///docs/claude/archbase-components-inputs.md**
4. Se necessário: **file:///docs/claude/validation-patterns.md**

#### Criando Views/Listas
1. Ler: **file:///docs/claude/view-patterns.md**
2. Ler: **file:///docs/claude/archbase-components-tables.md**
3. Consultar: **file:///docs/claude/archbase-services.md**

#### Criando Services
1. Ler: **file:///docs/claude/archbase-services.md**
2. Verificar endpoints e DTOs no backend

#### Trabalhando com DataSource
1. Ler: **file:///docs/claude/archbase-datasource.md**
2. Consultar: **file:///docs/claude/state-management.md**

#### Resolvendo Problemas
1. Consultar: **file:///docs/claude/troubleshooting.md**
2. Verificar logs e mensagens de erro

### 📚 Referência por Componente
Consulte quando precisar usar componente específico:
- **Inputs**: file:///docs/claude/archbase-components-inputs.md
- **Tables**: file:///docs/claude/archbase-components-tables.md
- **Layouts**: file:///docs/claude/archbase-components-layouts.md

### 🎯 Workflow Sugerido

**Ao criar novo feature:**
1. Identificar tipo (form, view, service, etc.)
2. Ler documento principal do tipo
3. Consultar documentos de suporte conforme necessário
4. Verificar troubleshooting se houver problemas

**Ao debugar:**
1. Verificar troubleshooting.md primeiro
2. Consultar documento específico do componente/padrão
3. Verificar exemplos de referência (se disponíveis)

---

## Development Commands
[Manter comandos do projeto aqui]

## Architecture Overview
[Manter visão geral da arquitetura aqui]

[Resto do conteúdo genérico do CLAUDE.md]
```

### Exemplo de Módulo: archbase-datasource.md

```markdown
# ArchbaseDataSource - Guia Completo

## Conceito Central
ArchbaseDataSource é o coração da integração de dados no Archbase. Ele gerencia:
- Estado dos dados (browsing, editing, inserting)
- Binding bidirecional com componentes
- Validação
- Eventos de mudança

## Criação Básica

```typescript
import { ArchbaseDataSource } from '@archbase/components'

const dataSource = new ArchbaseDataSource<UserDto, string>({
  name: 'dsUser',           // Nome único do datasource
  initialData: [],          // Dados iniciais
  validator: myValidator    // Validador (opcional)
})
```

## Estados do DataSource

### BROWSING (Navegação)
Estado padrão. Usuário está navegando pelos dados.
```typescript
dataSource.isBrowsing() // true
```

### EDITING (Edição)
Usuário está editando registro existente.
```typescript
dataSource.edit()       // Entrar em modo edição
dataSource.isEditing()  // true
```

### INSERTING (Inserção)
Usuário está criando novo registro.
```typescript
dataSource.append({ /* dados iniciais */ } as UserDto)
dataSource.isInserting() // true
```

## Operações Principais

### Carregar Dados
```typescript
// Setar array de dados
dataSource.setData([user1, user2, user3])

// Adicionar ao final
dataSource.append(newUser)

// Inserir em posição específica
dataSource.insert(newUser, 0)
```

### Navegação
```typescript
dataSource.first()    // Primeiro registro
dataSource.last()     // Último registro
dataSource.next()     // Próximo
dataSource.prior()    // Anterior
dataSource.goToId(id) // Ir para ID específico
```

### Modificação
```typescript
// Entrar em edição
dataSource.edit()

// Modificar campos (automático via binding de componentes)
// Ou diretamente:
dataSource.setFieldValue('name', 'Novo Nome')

// Salvar alterações
dataSource.post()

// Cancelar alterações
dataSource.cancel()
```

### Exclusão
```typescript
dataSource.delete()      // Excluir registro atual
dataSource.deleteAll()   // Limpar todos os dados
```

## Binding com Componentes

Todos os componentes Archbase aceitam `dataSource` e `dataField`:

```typescript
<ArchbaseEdit 
  dataSource={dataSource}   // Referência ao DataSource
  dataField="name"          // Campo do DTO para bind
/>
```

O binding é **bidirecional**:
- Mudanças no componente atualizam o DataSource
- Mudanças no DataSource atualizam o componente

## Validação

### Configurar Validador
```typescript
import * as yup from 'yup'
import { ArchbaseYupValidator } from '@archbase/components'

const schema = yup.object({
  name: yup.string().required('Nome obrigatório'),
  email: yup.string().email('E-mail inválido')
})

const dataSource = new ArchbaseDataSource({
  name: 'dsUser',
  validator: new ArchbaseYupValidator(schema)
})
```

### Validar Manualmente
```typescript
const isValid = await dataSource.validate()
if (!isValid) {
  const errors = dataSource.getValidationErrors()
  console.log(errors)
}
```

## Eventos

```typescript
// Listener para mudanças
dataSource.addListener((event) => {
  console.log('DataSource changed:', event)
})

// Evento de erro
dataSource.onError((error) => {
  console.error('DataSource error:', error)
})
```

## Padrões com React Query

### Carregar Dados
```typescript
function useUserDataSource(id?: string) {
  const [dataSource] = useState(() => 
    new ArchbaseDataSource<UserDto, string>({
      name: 'dsUser',
      initialData: []
    })
  )

  const { data, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.findById(id!),
    enabled: !!id
  })

  useEffect(() => {
    if (data) {
      dataSource.setData([data])
      dataSource.edit()
    }
  }, [data])

  return { dataSource, isLoading }
}
```

### Salvar Dados
```typescript
function useUserSave(dataSource: ArchbaseDataSource<UserDto, string>) {
  const mutation = useMutation({
    mutationFn: (user: UserDto) => userService.save(user),
    onSuccess: (savedUser) => {
      dataSource.setFieldValue('id', savedUser.id)
      dataSource.post()
    }
  })

  return mutation
}
```

## Checklist de Uso

Ao usar DataSource, sempre:
- [ ] Definir nome único
- [ ] Configurar validator se houver validação
- [ ] Setar dados iniciais ou carregar de API
- [ ] Chamar `edit()` ou `append()` antes de modificar
- [ ] Chamar `post()` após modificações bem-sucedidas
- [ ] Chamar `cancel()` se usuário desistir
- [ ] Fazer cleanup no unmount (se necessário)

## Erros Comuns

### "Cannot modify in browsing state"
**Causa:** Tentou modificar sem chamar `edit()` ou `append()`  
**Solução:**
```typescript
dataSource.edit()
dataSource.setFieldValue('name', 'Novo Nome')
```

### "Validator errors not showing"
**Causa:** Validator não configurado no DataSource  
**Solução:**
```typescript
const dataSource = new ArchbaseDataSource({
  name: 'dsUser',
  validator: myValidator  // ← Configurar aqui
})
```

### "Fields not updating in UI"
**Causa:** Componentes sem binding correto  
**Solução:**
```typescript
// Garantir que todos os campos têm dataSource e dataField
<ArchbaseEdit dataSource={dataSource} dataField="name" />
```
```

### Vantagens
✅ Não ultrapassa limite de tokens (Claude lê sob demanda)  
✅ Contexto focado (só carrega o que precisa)  
✅ Organização modular e manutenível  
✅ Fácil de expandir incrementalmente  
✅ Documentação fica mais organizada  

### Desvantagens
⚠️ Claude precisa saber qual arquivo ler  
⚠️ Requer instruções claras no CLAUDE.md principal  
⚠️ Mais arquivos para manter  

### Próximos Passos
1. **Identificar módulos** principais (5-10 arquivos)
2. **Dividir CLAUDE.md** existente por tema
3. **Criar índice** com instruções claras de quando ler cada módulo
4. **Testar** com Claude Code para validar se ele entende o fluxo
5. **Refinar** baseado no uso real

---

## 🔧 ESTRATÉGIA 4: Completar CLI do Archbase
**⭐ PRIORIDADE BAIXA (alto potencial futuro)**

### Análise do CLI Atual

**✅ O que já existe (segundo documentação):**
- Estrutura básica de comandos
- Sistema de templates Handlebars
- Base de conhecimento híbrida (35+ componentes)
- Geradores principais (form, view, page, component, navigation, domain)
- Boilerplate admin-dashboard
- Sistema de cache para templates remotos
- Integração AI-friendly (saídas JSON)

**❌ O que falta/precisa melhorar:**
- Completar implementação de todos os geradores
- Expandir base de conhecimento (35 → 70+ componentes)
- Criar mais boilerplates (marketplace, SaaS)
- Testes automatizados
- Documentação de uso interno
- CI/CD para distribuição

### Por que deixar para depois?

**Motivos práticos:**
1. **Esforço x Resultado Imediato**: 2-3 semanas de trabalho vs. resultado só no médio prazo
2. **Estratégias 1-3 resolvem agora**: Skill + Biblioteca de Exemplos dão resultado em 1-2 semanas
3. **Validação primeiro**: Melhor validar abordagens mais simples antes de investir pesado no CLI
4. **Curva de aprendizado**: Time precisa aprender a usar o CLI efetivamente

### Quando investir no CLI?

**Cenários que justificam:**
1. **Após validação**: Estratégias 1-3 funcionaram e time dominou padrões
2. **Escala**: Múltiplos projetos/times precisando de scaffolding
3. **Padronização crítica**: Necessidade de impor padrões rígidos
4. **Onboarding**: Muitos desenvolvedores novos entrando
5. **Automação completa**: Workflow Java → DTO → Forms → Views precisa ser 100% automático

### Roadmap Sugerido para o CLI (futuro)

**Fase 1: Fundação (2 semanas)**
- Completar implementação dos 7 geradores
- Criar suite de testes automatizados
- Documentação interna detalhada
- Scripts de build e distribuição

**Fase 2: Expansão (2 semanas)**
- Expandir base de conhecimento (35 → 70+ componentes)
- Criar boilerplate marketplace completo
- Criar boilerplate SaaS completo
- Sistema de plugins inicial

**Fase 3: Refinamento (1 semana)**
- Feedback do time e ajustes
- Performance e otimizações
- Documentação de usuário final
- Vídeos/tutoriais de uso

**Fase 4: Distribuição (1 semana)**
- Publicar no npm
- CI/CD para releases
- Site de documentação
- Anúncio interno e externo

### Vantagens do CLI (quando completo)
✅ Automação completa de scaffolding  
✅ Padronização forçada em todos os projetos  
✅ Onboarding rápido de novos devs  
✅ Workflow Java → TypeScript → UI automatizado  
✅ Redução de 70-90% no tempo de setup  
✅ Conhecimento codificado em ferramenta  

### Desvantagens
⚠️ Alto esforço inicial (4-6 semanas completo)  
⚠️ Manutenção contínua necessária  
⚠️ Curva de aprendizado para o time  
⚠️ Pode ficar defasado se lib mudar muito  

### Recomendação
**Investir no CLI APENAS se:**
1. Estratégias 1-3 validadas e funcionando
2. Time está confortável com padrões estabelecidos
3. Há demanda clara por automação (múltiplos projetos)
4. Recursos disponíveis (1 dev dedicado por 1-2 meses)

---

## 📅 Plano de Ação Recomendado

### ⚡ SEMANA 1: Quick Wins (Resultados Rápidos)

**Dia 1-2: Criar Skill do Archbase**
- [ ] Levantar 15-20 componentes mais usados
- [ ] Documentar DataSource V2 (padrões core)
- [ ] Documentar padrões de services remotos
- [ ] Criar exemplos de código inline
- [ ] Estruturar SKILL.md em `/mnt/skills/private/archbase/`
- **Responsável:** Dev senior com conhecimento profundo do Archbase
- **Output:** SKILL.md funcional

**Dia 3-4: Criar Biblioteca de Exemplos**
- [ ] Extrair 3 forms de referência (simples, tabs, wizard)
- [ ] Extrair 3 views de referência (list, crud, dashboard)
- [ ] Extrair 2 services de referência
- [ ] Adicionar comentários extensivos
- [ ] Criar README com índice
- **Responsável:** Pode ser distribuído entre 2-3 devs
- **Output:** Diretório `/archbase-examples/` pronto

**Dia 5: Integração e Testes**
- [ ] Adicionar referências no CLAUDE.md
- [ ] Testar com Claude Code em 3-5 casos reais
- [ ] Documentar resultados e ajustes necessários
- [ ] Demo para equipe
- **Responsável:** Lead técnico
- **Output:** Validação inicial + feedback

### 🔄 SEMANA 2: Consolidação e Refinamento

**Dia 1-2: Refinamento do Skill**
- [ ] Ajustar baseado em testes da Semana 1
- [ ] Adicionar componentes faltantes
- [ ] Melhorar exemplos com casos reais encontrados
- [ ] Adicionar seção de troubleshooting

**Dia 3-4: Expansão da Biblioteca**
- [ ] Adicionar mais 5-10 exemplos conforme necessidade
- [ ] Criar templates para casos específicos do projeto
- [ ] Documentar padrões que surgirem

**Dia 5: Documentação e Treinamento**
- [ ] Documentar workflow completo para o time
- [ ] Criar guia de "como pedir para Claude Code"
- [ ] Sessão de treinamento com equipe
- [ ] Coletar feedback inicial

### 📈 SEMANA 3+: Evolução Contínua

**Manutenção e Expansão:**
- [ ] Atualizar Skill/Exemplos conforme surgem novos padrões
- [ ] Adicionar novos componentes na base de conhecimento
- [ ] Refinar baseado no uso contínuo
- [ ] Medir melhorias (tempo, qualidade, satisfação)

**Avaliação do CLI:**
- [ ] Avaliar se vale retomar projeto do CLI
- [ ] Se sim: alocar recursos e criar roadmap detalhado
- [ ] Se não: continuar com abordagem Skill + Exemplos

---

## 📊 Métricas de Sucesso

### KPIs para Avaliar Efetividade

**Tempo:**
- ⏱️ Tempo médio para criar um form novo
  - **Baseline atual:** ~2-4 horas (com ajustes)
  - **Meta:** ~30-60 minutos (geração + review)
  
- ⏱️ Tempo médio para criar uma view/lista
  - **Baseline atual:** ~3-5 horas (com ajustes)
  - **Meta:** ~1-2 horas (geração + review)

**Qualidade:**
- ✅ % de código gerado que funciona sem modificações
  - **Baseline atual:** ~30-40%
  - **Meta:** ~80-90%
  
- ✅ % de padrões Archbase seguidos corretamente
  - **Baseline atual:** ~50%
  - **Meta:** ~95%

**Satisfação:**
- 😊 Satisfação do time com Claude Code
  - **Baseline atual:** Média (funciona backend/flutter, trava frontend)
  - **Meta:** Alta (funciona bem em todos os contextos)

- 😊 Confiança na ferramenta
  - **Baseline atual:** Baixa (precisa verificar tudo)
  - **Meta:** Alta (confiar no output)

### Como Medir

**Semana 1:**
- Registrar tempo gasto em 5 tarefas teste
- % de código gerado correto
- Feedback qualitativo do time

**Semana 2:**
- Comparar com baseline da Semana 1
- Identificar padrões de erro restantes
- Ajustar estratégias conforme necessário

**Mensal:**
- Review de métricas acumuladas
- Decisão: continuar, ajustar ou escalar

---

## ❓ Perguntas para Discussão em Equipe

### Priorização

1. **Qual a dor mais crítica agora?**
   - [ ] Tempo gasto criando componentes novos
   - [ ] Inconsistência nos padrões
   - [ ] Dificuldade de manutenção
   - [ ] Onboarding de novos devs

2. **Quanto tempo/recursos podemos dedicar?**
   - [ ] 1 dev, 1 semana (Estratégia 1 ou 2)
   - [ ] 2-3 devs, 2 semanas (Estratégias 1 + 2 + 3)
   - [ ] 1 dev dedicado, 1-2 meses (incluir CLI)

3. **O que é mais urgente?**
   - [ ] Resolver problema imediato (próximos sprints)
   - [ ] Investir em solução de longo prazo (CLI)
   - [ ] Híbrido (quick wins + roadmap CLI)

### Técnicas

4. **Quais componentes são realmente essenciais?**
   - Listar top 15-20 componentes mais usados
   - Identificar padrões que se repetem
   - Priorizar documentação

5. **Temos projetos de referência bons?**
   - PowerView Admin pode servir de base?
   - VendaX.ai tem exemplos bons?
   - Outros projetos internos?

6. **Como queremos escalar isso?**
   - Só para este time?
   - Para outros times da IntegrAllTech?
   - Para clientes/parceiros?

### Organizacionais

7. **Quem vai ser responsável por manter?**
   - Skill e exemplos precisam de owner
   - Definir processo de atualização
   - Como o time contribui?

8. **Como medimos sucesso?**
   - Quais métricas importam mais?
   - Como coletamos feedback?
   - Quando revisamos e ajustamos?

---

## 🎯 Recomendação Final

### Ordem Sugerida de Implementação

**1º PASSO (IMEDIATO):**
✅ **Estratégia 1: Skill Customizado**
- Menor esforço, maior impacto imediato
- Não depende de outros recursos
- Pode ser feito por 1 dev senior em 2-3 dias
- **COMEÇAR POR AQUI**

**2º PASSO (PARALELO):**
✅ **Estratégia 2: Biblioteca de Exemplos**
- Pode ser feito em paralelo com Skill
- Trabalho pode ser distribuído
- Complementa perfeitamente o Skill
- **FAZER JUNTO OU LOGO APÓS**

**3º PASSO (OPCIONAL):**
⚠️ **Estratégia 3: CLAUDE.md Modular**
- Só se CLAUDE.md crescer muito (>2000 linhas)
- Ou se time preferir organização modular
- **AVALIAR NECESSIDADE APÓS 1 E 2**

**4º PASSO (FUTURO):**
📋 **Estratégia 4: Completar CLI**
- Só após validar Estratégias 1-2
- Quando houver recursos dedicados
- Se houver demanda por automação completa
- **REAVALIAR EM 2-3 MESES**

### Por que esta ordem?

**Pragmatismo:**
- Resultados rápidos em 1-2 semanas
- Valida abordagem antes de investir pesado
- Time aprende padrões no processo

**Risco Mitigado:**
- Investimento baixo inicial
- Pode abandonar sem prejuízo se não funcionar
- Feedback rápido para ajustes

**Escalabilidade:**
- Base sólida para evoluir
- CLI fica mais fácil depois (conhecimento codificado)
- Time domina padrões antes de automatizar

---

## 📝 Próximos Passos Práticos

### Para Começar Segunda-Feira

**1. Reunião de Alinhamento (30min)**
- Apresentar este documento
- Decidir: fazer Estratégia 1, 1+2, ou 1+2+3
- Alocar responsáveis
- Definir prazos

**2. Setup Inicial (1h)**
- Criar estrutura de pastas
- Definir 15-20 componentes prioritários
- Listar projetos de referência para extrair exemplos

**3. Kickoff da Implementação**
- Dev(s) alocado(s) começam trabalho
- Daily check-ins para acompanhar progresso
- Ajustar conforme necessário

**4. Primeira Validação (Fim da Semana 1)**
- Testar com 3-5 casos reais
- Coletar feedback do time
- Ajustar estratégia se necessário

---

## 📚 Anexos e Referências

### Recursos Existentes
- CLAUDE.md atual: ~1096 linhas
- CLI do Archbase: Documentação completa disponível
- Projeto PowerView Admin: Referência de padrões
- Projeto VendaX.ai: Casos de uso reais

### Ferramentas Necessárias
- Editor de texto (para criar SKILL.md e exemplos)
- Git (para versionamento)
- Tempo do time (2-3 dias concentrados)

### Links Úteis
- Documentação Mantine v8: https://mantine.dev/
- Archbase React: Documentação interna
- Claude Code: https://claude.ai/code

---

## 🤝 Contribuições da Equipe

**Este documento é vivo e deve ser atualizado pela equipe:**

### Como Contribuir
1. Adicionar componentes na lista de prioridades
2. Sugerir exemplos importantes
3. Reportar padrões que funcionam/não funcionam
4. Atualizar métricas de sucesso

### Ownership
- **Responsável pelo documento:** [Definir]
- **Responsável pela implementação:** [Definir]
- **Review e aprovação:** [Definir]

---

**Documento criado em:** Dezembro 2024  
**Última atualização:** Dezembro 2024  
**Status:** 📋 Proposta para Discussão  
**Próxima revisão:** Após implementação da Semana 1

---

## 💬 Discussão e Feedback

Use este espaço para anotar decisões da reunião de discussão:

**Decisões Tomadas:**
- [ ] Estratégia escolhida: _______________
- [ ] Responsáveis alocados: _______________
- [ ] Prazo definido: _______________
- [ ] Métricas priorizadas: _______________

**Próximos Passos Acordados:**
1. _______________
2. _______________
3. _______________

**Dúvidas/Riscos Identificados:**
- _______________
- _______________

---

*Fim do Documento*
