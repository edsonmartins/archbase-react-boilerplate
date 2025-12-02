# Prompt Complementar - Extrair Exemplos de Projetos Existentes

## 📋 Contexto

Este é um **prompt complementar** ao prompt principal de criação do boilerplate. Use este prompt APÓS ter criado a estrutura base do projeto, especificamente para popular os exemplos (.claude/examples/) com código REAL dos projetos existentes da empresa.

---

## 🎯 Objetivo

Analisar projetos React existentes (PowerView Admin, VendaX.ai, Rio Quality, etc.) e extrair exemplos FUNCIONAIS de:
- Formulários (forms)
- Views/Listas (views)
- Services (services)
- Hooks customizados (hooks)
- Layouts (layouts)

Estes exemplos serão limpos, generalizados e comentados para servir como referência no boilerplate.

---

## 🚀 PREPARAÇÃO

### 1. Estrutura de Diretórios

```bash
# Criar diretório de trabalho
mkdir ~/archbase-examples-extraction
cd ~/archbase-examples-extraction

# Clonar/copiar projetos de referência
# Opção 1: Se estão no GitHub
git clone <url-powerview-admin> powerview-admin
git clone <url-vendax> vendax
git clone <url-rio-quality> rio-quality

# Opção 2: Se estão localmente
cp -r /path/to/powerview-admin ./powerview-admin
cp -r /path/to/vendax ./vendax
cp -r /path/to/rio-quality ./rio-quality

# Ter o boilerplate também disponível
cd ~/archbase-react-boilerplate
```

### 2. Identificar Componentes de Referência

Antes de executar o prompt, identifique os melhores exemplos em cada projeto:

```bash
# PowerView Admin
powerview-admin/
├── src/views/users/UserForm.tsx          # Form com tabs?
├── src/views/users/UserListView.tsx      # Lista com filtros?
├── src/views/drivers/DriverForm.tsx      # Form complexo?
├── src/services/UserService.ts           # Service exemplo
└── ...

# VendaX.ai  
vendax/
├── src/views/products/ProductForm.tsx
├── src/views/orders/OrderListView.tsx
└── ...

# Rio Quality
rio-quality/
├── src/views/vehicles/VehicleForm.tsx
└── ...
```

---

## 📝 PROMPT PARA CLAUDE CODE CLI

```
Olá Claude Code! Preciso da sua ajuda para extrair exemplos REAIS de projetos existentes e integrá-los no boilerplate Archbase React.

# CONTEXTO

Temos projetos React + Archbase funcionando em produção. Preciso que você:
1. Analise componentes específicos que vou indicar
2. Extraia o código relevante
3. Limpe/generalize (remova lógica específica de negócio)
4. Adicione comentários extensivos explicando padrões
5. Salve nos locais apropriados do boilerplate

# PROJETOS DISPONÍVEIS PARA ANÁLISE

Tenho os seguintes projetos disponíveis:

## Projeto 1: PowerView Admin
**Localização:** `~/archbase-examples-extraction/powerview-admin/`
**Descrição:** Sistema administrativo maduro com múltiplos CRUDs
**Stack:** React 19, Archbase React, Mantine v8, TypeScript

## Projeto 2: VendaX.ai
**Localização:** `~/archbase-examples-extraction/vendax/`
**Descrição:** Plataforma B2B de vendas com IA
**Stack:** React 19, Archbase React, Mantine v8, TypeScript

## Projeto 3: Rio Quality
**Localização:** `~/archbase-examples-extraction/rio-quality/`
**Descrição:** Sistema de gestão de frotas
**Stack:** React 19, Archbase React, Mantine v8, TypeScript

# BOILERPLATE DE DESTINO

**Localização:** `~/archbase-react-boilerplate/`
**Estrutura de exemplos:**
```
.claude/examples/
├── forms/
├── views/
├── services/
├── hooks/
└── layouts/
```

# TAREFAS DE EXTRAÇÃO

## TAREFA 1: Extrair Exemplos de Forms

### 1.1 Form Simples (sem tabs)

**Origem sugerida:** 
- PowerView Admin: `src/views/[entidade-simples]/[Entidade]Form.tsx`
- Ou você pode sugerir outro que seja melhor

**Ações:**
1. Leia o arquivo fonte completo
2. Identifique o padrão:
   - Como cria DataSource
   - Como usa useArchbaseSize
   - Como configura ArchbaseFormTemplate
   - Quais campos usa (Edit, Select, Switch, etc.)
   - Como faz validação
   - Como integra com React Query
   - Handlers de save/cancel
3. Crie versão generalizada:
   - Mude nomes específicos para genéricos (User, Product, etc.)
   - Remova lógica de negócio muito específica
   - Mantenha estrutura e padrões
4. Adicione comentários extensivos:
   ```typescript
   // PADRÃO: useArchbaseSize para forms que precisam preencher altura disponível
   const { ref, height } = useArchbaseSize()
   const safeHeight = height > 0 ? height - 130 : 600
   // 130px = offset padrão para header/footer do ArchbaseFormTemplate
   ```
5. Salve em: `~/archbase-react-boilerplate/.claude/examples/forms/BasicForm.example.tsx`

**Formato do arquivo:**
```typescript
/**
 * ARCHBASE REFERENCE: Basic Form (Simple - No Tabs)
 * 
 * Extracted from: PowerView Admin - [NomeOriginal]Form.tsx
 * Use case: Simple entity forms without tab organization
 * 
 * Key Patterns Demonstrated:
 * - useArchbaseSize hook for responsive height
 * - DataSource creation and configuration
 * - React Query integration (useQuery + useMutation)
 * - Field binding (ArchbaseEdit, ArchbaseSelect, etc.)
 * - Validation with Yup
 * - Loading and error states
 * - Save/Cancel handlers
 * 
 * Copy this pattern for any simple form. Adapt field types and validation as needed.
 */

import { useState, useEffect } from 'react'
import { Paper, Box, Group } from '@mantine/core'
// ... resto dos imports

// Interface/Types
interface ExampleFormProps {
  id?: string
  action: 'NEW' | 'EDIT' | 'VIEW'
  onClose: () => void
}

// DTO
interface ExampleDto {
  id: string
  name: string
  email: string
  // ...
}

// Component
export function BasicFormExample({ id, action, onClose }: ExampleFormProps) {
  // PADRÃO: useArchbaseSize para cálculo de altura
  // Este hook é ESSENCIAL para forms que precisam preencher altura disponível
  const { ref, height } = useArchbaseSize()
  const safeHeight = height > 0 ? height - 130 : 600
  // 130px = offset padrão (header + footer + padding do template)

  // PADRÃO: DataSource criado com useState para persistir entre renders
  const [dataSource] = useState(() => 
    new ArchbaseDataSource<ExampleDto, string>({
      name: 'dsExample',
      initialData: [],
      validator: exampleValidator  // Validador Yup
    })
  )

  // PADRÃO: React Query para carregar dados
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['example', id],
    queryFn: () => exampleService.findById(id!),
    enabled: !!id && action !== 'NEW'
  })

  // PADRÃO: Popular DataSource quando dados carregarem
  useEffect(() => {
    if (data) {
      dataSource.setData([data])
      if (action === 'EDIT') {
        dataSource.edit()  // Modo edição
      }
      // Se VIEW, fica em browsing (padrão)
    } else if (action === 'NEW') {
      // Novo registro: append com valores iniciais
      dataSource.append({ active: true } as ExampleDto)
    }
  }, [data, action])

  // PADRÃO: Mutation para salvar
  const saveMutation = useMutation({
    mutationFn: (data: ExampleDto) => exampleService.save(data),
    onSuccess: () => {
      dataSource.post()  // Commit no DataSource
      onClose()
    }
  })

  // PADRÃO: Handler de save com validação
  const handleSave = async () => {
    const isValid = await dataSource.validate()
    if (!isValid) {
      // Erros serão mostrados nos campos automaticamente
      return
    }
    const currentData = dataSource.getCurrentRecord()
    saveMutation.mutate(currentData)
  }

  const isViewOnly = action === 'VIEW'

  return (
    <ArchbaseFormTemplate
      innerRef={ref}  // CRÍTICO: ref para cálculo de tamanho
      title={action === 'NEW' ? 'New Record' : action === 'EDIT' ? 'Edit Record' : 'View Record'}
      dataSource={dataSource}
      isLoading={isLoading}
      isError={isError}
      error={error}
      withBorder={false}
      onCancel={onClose}
      onBeforeSave={handleSave}
    >
      {/* PADRÃO: Paper wrapper com altura calculada */}
      <Paper withBorder style={{ height: safeHeight }}>
        <Box p="md">
          {/* PADRÃO: Campos organizados em Groups */}
          <Group grow mb="md">
            <ArchbaseEdit 
              dataSource={dataSource}
              dataField="name"
              label="Name"
              placeholder="Enter name"
              required
              readOnly={isViewOnly}
            />
            <ArchbaseEdit 
              dataSource={dataSource}
              dataField="email"
              label="Email"
              placeholder="email@example.com"
              required
              readOnly={isViewOnly}
            />
          </Group>

          {/* Mais campos... */}
        </Box>
      </Paper>
    </ArchbaseFormTemplate>
  )
}

/**
 * CHECKLIST DE USO:
 * 
 * Ao usar este exemplo como base:
 * [ ] Copiar estrutura completa
 * [ ] Adaptar DTO (ExampleDto → SeuDto)
 * [ ] Adaptar service (exampleService → seuService)
 * [ ] Adicionar/remover campos conforme necessário
 * [ ] Ajustar validação (exampleValidator)
 * [ ] Manter padrões: useArchbaseSize, innerRef, height calculation
 * [ ] Manter padrão de save/cancel
 * [ ] Adicionar testes se necessário
 */
```

### 1.2 Form Complexo (com tabs)

**Origem sugerida:**
- PowerView Admin: `src/views/drivers/DriverForm.tsx` (ou similar com tabs)

**Ações:** Similar ao 1.1, mas focando em:
- Estrutura de Tabs do Mantine
- Cálculo de altura para tabs e panels
- Organização de campos em múltiplas abas
- Overflow handling

**Salvar em:** `.claude/examples/forms/TabsForm.example.tsx`

### 1.3 Form com Validação Complexa

**Origem sugerida:**
- Qualquer form que tenha validação cross-field ou regras de negócio

**Ações:**
- Extrair schema Yup completo
- Mostrar validações customizadas
- Display de erros

**Salvar em:** `.claude/examples/forms/ValidationForm.example.tsx`

### 1.4 Form Wizard/Stepper (se existir)

**Origem sugerida:**
- Qualquer form com múltiplos passos

**Salvar em:** `.claude/examples/forms/WizardForm.example.tsx`

---

## TAREFA 2: Extrair Exemplos de Views

### 2.1 Lista Simples

**Origem sugerida:**
- PowerView Admin: Qualquer view de lista básica

**Ações:**
1. Extrair padrão de:
   - DataSource para lista
   - React Query (useQuery com findAll)
   - ArchbaseDataTable configuração
   - Colunas (columns)
   - Paginação (se tiver)
   - Handlers básicos
2. Generalizar
3. Comentar extensivamente

**Salvar em:** `.claude/examples/views/ListView.example.tsx`

### 2.2 CRUD Completo

**Origem sugerida:**
- PowerView Admin: View que integra lista + form + manager

**Ações:**
1. Extrair padrão completo:
   - Estados (LIST, EDIT, VIEW, NEW)
   - Manager component que controla navegação
   - Integração ListView + Form
   - Handlers (new, edit, view, delete)
   - Confirmação de delete
2. Criar 3 arquivos interligados:
   - ExampleListView.tsx
   - ExampleForm.tsx
   - ExampleManagerView.tsx

**Salvar em:** 
- `.claude/examples/views/CRUDView.example.tsx` (ou dividir em 3 arquivos)

### 2.3 Dashboard/Analytics

**Origem sugerida:**
- Qualquer dashboard com cards, métricas, gráficos

**Salvar em:** `.claude/examples/views/DashboardView.example.tsx`

### 2.4 Master-Detail (se existir)

**Origem sugerida:**
- View com relacionamento master-detail

**Salvar em:** `.claude/examples/views/MasterDetailView.example.tsx`

---

## TAREFA 3: Extrair Exemplos de Services

### 3.1 Service Base/Padrão

**Origem sugerida:**
- PowerView Admin: `src/services/UserService.ts` ou similar

**Ações:**
1. Extrair serviço COMPLETO
2. Mostrar:
   - extends ArchbaseRemoteApiService
   - Type imports para decorators
   - getEndpoint() - sempre plural
   - configureHeaders() - completo
   - Métodos CRUD padrão (se sobrescritos)
   - Métodos customizados (updateStatus, etc.)
   - Uso correto de generics
3. Comentar cada padrão

**Salvar em:** `.claude/examples/services/RemoteService.example.ts`

### 3.2 Service com Autenticação (se diferente)

**Origem sugerida:**
- Service que lida com auth/tokens

**Salvar em:** `.claude/examples/services/AuthService.example.ts`

---

## TAREFA 4: Extrair Exemplos de Hooks

### 4.1 Custom DataSource Hook

**Origem sugerida:**
- Qualquer hook customizado tipo `useUserDataSource`

**Ações:**
Extrair padrão de hook que:
- Cria DataSource
- Integra com React Query
- Popula dados
- Retorna tudo pronto

**Salvar em:** `.claude/examples/hooks/useDataSource.example.tsx`

### 4.2 Hook de Query Pattern

**Origem sugerida:**
- Hook que encapsula useQuery

**Salvar em:** `.claude/examples/hooks/useQuery.example.tsx`

### 4.3 Hook de Mutation Pattern

**Origem sugerida:**
- Hook que encapsula useMutation

**Salvar em:** `.claude/examples/hooks/useMutation.example.tsx`

---

## TAREFA 5: Extrair Exemplos de Layouts

### 5.1 Admin Layout

**Origem sugerida:**
- PowerView Admin: Layout principal

**Ações:**
- Extrair estrutura de layout admin
- Sidebar
- Header
- Content area
- Integração com Archbase Admin components

**Salvar em:** `.claude/examples/layouts/AdminLayout.example.tsx`

### 5.2 Public Layout

**Origem sugerida:**
- Layout público (login, registro, etc.)

**Salvar em:** `.claude/examples/layouts/PublicLayout.example.tsx`

---

## PADRÕES DE GENERALIZAÇÃO

Ao extrair exemplos, siga estas regras:

### 1. Renomear para Genérico
```typescript
// ❌ Específico
interface DriverDto { ... }
class DriverService { ... }
function DriverForm() { ... }

// ✅ Genérico
interface ExampleDto { ... }
class ExampleService { ... }
function ExampleForm() { ... }

// Ou use nomes comuns:
UserDto, ProductDto, OrderDto
```

### 2. Remover Lógica de Negócio Muito Específica
```typescript
// ❌ Muito específico
if (driver.vehicleType === 'TRUCK' && driver.capacity > 10000) {
  // lógica complexa específica de caminhões
}

// ✅ Generalizado ou comentado
// [REMOVED] Complex business logic specific to domain
// Add your business rules here
```

### 3. Manter Estrutura e Padrões
```typescript
// ✅ Manter estes padrões sempre:
- useArchbaseSize pattern
- DataSource creation pattern
- React Query integration pattern
- Field binding pattern
- Save/Cancel handlers pattern
- Validation pattern
```

### 4. Adicionar Comentários Explicativos
```typescript
// ✅ Comentar o PORQUÊ, não só o QUE
// PADRÃO: useArchbaseSize é necessário para forms que precisam calcular altura
// dinamicamente baseada no espaço disponível. Sem isso, o form pode não 
// aparecer ou ter altura incorreta.
const { ref, height } = useArchbaseSize()

// PADRÃO: Offset de 130px é calculado com base em:
// - Header do template: ~60px
// - Footer com botões: ~50px  
// - Padding: ~20px
// Total: ~130px
const safeHeight = height > 0 ? height - 130 : 600
```

### 5. Incluir Seção de Uso
```typescript
/**
 * HOW TO USE THIS EXAMPLE:
 * 
 * 1. Copy the entire structure
 * 2. Rename ExampleDto to YourDto
 * 3. Rename exampleService to yourService
 * 4. Add/remove fields as needed
 * 5. Adjust validation schema
 * 6. Maintain the core patterns:
 *    - useArchbaseSize + innerRef
 *    - DataSource creation
 *    - React Query integration
 *    - Field binding
 *    - Save/cancel handlers
 * 
 * DO NOT change these patterns unless you know what you're doing!
 */
```

---

## VALIDAÇÃO DOS EXEMPLOS EXTRAÍDOS

Após extrair cada exemplo, validar:

### Checklist de Qualidade

- [ ] **Código compila**: TypeScript sem erros
- [ ] **Imports corretos**: Todos os imports estão presentes
- [ ] **Comentários extensivos**: Cada padrão importante está comentado
- [ ] **Generalizado**: Nomes genéricos, sem lógica específica demais
- [ ] **Completo**: Não é stub, é código funcional
- [ ] **Estruturado**: Tem seção de uso/documentação no topo
- [ ] **Consistente**: Segue padrões do boilerplate

### Teste de Compilação

Para cada exemplo extraído:
```bash
cd ~/archbase-react-boilerplate
pnpm type-check  # Verificar se compila
```

---

## FORMATO DE EXECUÇÃO

Execute este prompt por partes, por exemplo:

### Sessão 1: Forms
```
Claude Code, por favor execute TAREFA 1 completa (1.1 a 1.4).
Analise os projetos disponíveis, extraia os forms conforme especificado,
generalize, comente e salve nos locais indicados.
```

### Sessão 2: Views
```
Claude Code, por favor execute TAREFA 2 completa (2.1 a 2.4).
```

### Sessão 3: Services + Hooks
```
Claude Code, por favor execute TAREFAS 3 e 4 completas.
```

### Sessão 4: Layouts
```
Claude Code, por favor execute TAREFA 5 completa.
```

---

## REPORT FINAL

Após concluir todas as tarefas, gere um report:

```markdown
# Exemplos Extraídos - Report

## Origem dos Exemplos

### PowerView Admin
- BasicForm.example.tsx ← src/views/users/UserForm.tsx
- TabsForm.example.tsx ← src/views/drivers/DriverForm.tsx
- ListView.example.tsx ← src/views/users/UserListView.tsx
- RemoteService.example.ts ← src/services/UserService.ts

### VendaX.ai
- DashboardView.example.tsx ← src/views/dashboard/Dashboard.tsx
- ValidationForm.example.tsx ← src/views/products/ProductForm.tsx

### Rio Quality
- (nenhum usado) ou [listar]

## Exemplos Criados

### Forms (4 exemplos)
- [x] BasicForm.example.tsx - 250 linhas
- [x] TabsForm.example.tsx - 380 linhas
- [x] ValidationForm.example.tsx - 200 linhas
- [ ] WizardForm.example.tsx - não encontrado no código base

### Views (4 exemplos)
- [x] ListView.example.tsx - 180 linhas
- [x] CRUDView.example.tsx - 450 linhas
- [x] DashboardView.example.tsx - 320 linhas
- [ ] MasterDetailView.example.tsx - não encontrado no código base

### Services (2 exemplos)
- [x] RemoteService.example.ts - 150 linhas
- [x] AuthService.example.ts - 120 linhas

### Hooks (3 exemplos)
- [x] useDataSource.example.tsx - 80 linhas
- [x] useQuery.example.tsx - 60 linhas
- [x] useMutation.example.tsx - 70 linhas

### Layouts (2 exemplos)
- [x] AdminLayout.example.tsx - 200 linhas
- [x] PublicLayout.example.tsx - 120 linhas

## Validação

- [x] Todos os exemplos compilam sem erros
- [x] Imports completos e corretos
- [x] Comentários extensivos adicionados
- [x] Código generalizado (sem lógica específica demais)
- [x] Seções de "HOW TO USE" incluídas

## Próximos Passos

1. Review manual dos exemplos
2. Testar uso de cada exemplo criando novo componente
3. Ajustar comentários se necessário
4. Commit e push para o boilerplate
```

---

# COMEÇAR EXTRAÇÃO

Claude Code, estou pronto para começar. Aqui estão os caminhos específicos:

## Projetos de Referência

**PowerView Admin:**
- Localização: `[VOCÊ VAI PREENCHER O CAMINHO AQUI]`
- Exemplos prioritários:
  - Form simples: `[caminho/para/form/simples]`
  - Form com tabs: `[caminho/para/form/tabs]`
  - Lista: `[caminho/para/lista]`
  - Service: `[caminho/para/service]`

**VendaX.ai:**
- Localização: `[VOCÊ VAI PREENCHER O CAMINHO AQUI]`
- Exemplos prioritários:
  - Dashboard: `[caminho/para/dashboard]`
  - Form com validação: `[caminho/para/form]`

**Rio Quality:**
- Localização: `[VOCÊ VAI PREENCHER O CAMINHO AQUI]`
- Exemplos prioritários:
  - [Você lista os melhores componentes]

**Boilerplate de Destino:**
- Localização: `[CAMINHO DO BOILERPLATE]`

Por favor, comece pela **TAREFA 1: Forms**. Analise os arquivos que indiquei,
extraia, generalize, comente extensivamente e salve nos locais apropriados.

Aguardo sua confirmação para continuar! 🚀
```

---

## 📝 INSTRUÇÕES DE USO DESTE DOCUMENTO

### Antes de Executar

1. **Identificar melhores exemplos** nos projetos existentes
2. **Anotar caminhos completos** dos arquivos
3. **Ter projetos acessíveis** (clonados ou copiados)
4. **Ter boilerplate base** já criado (estrutura de pastas)

### Durante Execução

1. **Execute por partes** (Tarefa por tarefa)
2. **Valide cada tarefa** antes de continuar
3. **Ajuste se necessário** (feedback ao Claude)
4. **Salve progresso** (commits incrementais)

### Após Execução

1. **Review manual** de cada exemplo
2. **Testar compilação** (`pnpm type-check`)
3. **Testar uso real** (criar componente novo baseado no exemplo)
4. **Refinar comentários** se algo ficou confuso
5. **Commit final** e push para o repositório

---

## 🎯 RESULTADO ESPERADO

Ao final, você terá:
- ✅ 15-20 exemplos REAIS extraídos de código de produção
- ✅ Todos os exemplos generalizados e comentados
- ✅ Código 100% funcional (não stubs)
- ✅ Padrões do PowerView Admin/VendaX/Rio Quality preservados
- ✅ Boilerplate com exemplos de ALTA QUALIDADE
- ✅ Documentação viva baseada em código real

**Pronto para:** Equipe usar como referência confiável! 🎉

---

**Documento criado em:** Dezembro 2024  
**Para uso com:** Claude Code CLI (complementar ao prompt principal)  
**Tempo estimado:** 2-3 horas (dividido em sessões)

---
