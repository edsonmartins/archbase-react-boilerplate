# Templates Archbase React

Este diretório contém templates de referência para criar views, forms, modais e services seguindo os padrões do Archbase React.

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `ListViewTemplate.tsx` | Template para criar List Views com ArchbaseGridTemplate |
| `FormViewTemplate.tsx` | Template para criar Form Views com ArchbaseFormTemplate |
| `ModalTemplates.tsx` | Templates para diferentes tipos de modais |
| `ServiceTemplate.ts` | Template para criar Remote Services |
| `ManagerViewTemplate.tsx` | Template para Manager Views (CRUD completo) |

## Como Usar

### 1. Criar uma List View

```bash
# Copiar o template
cp .claude/templates/ListViewTemplate.tsx src/views/myentity/MyEntityListView.tsx
```

Substituições necessárias:
- `Entity` → Nome da sua entidade (ex: `User`, `Product`)
- `EntityDto` → Nome do seu DTO
- `ENTITY_ROUTE` → Rota da entidade (ex: `/users`)
- `EntityRemoteService` → Nome do seu service
- `API_TYPE.Entity` → Símbolo IoC do service

### 2. Criar um Form View

```bash
cp .claude/templates/FormViewTemplate.tsx src/views/myentity/MyEntityForm.tsx
```

Substituições:
- Mesmas do List View
- `entityId` → Nome do parâmetro de rota (ex: `userId`)

### 3. Criar um Modal

Use os templates em `ModalTemplates.tsx` como referência:
- `EntityViewModal` - Modal simples de visualização
- `ItemFormModal` - Modal com formulário
- `DetailModalWithTabs` - Modal com abas

### 4. Criar um Service

```bash
cp .claude/templates/ServiceTemplate.ts src/services/MyEntityRemoteService.ts
```

**IMPORTANTE**: Implementar os métodos obrigatórios:
- `getEndpoint()` - Retornar o endpoint da API
- `getId(entity)` - Retornar o ID da entidade
- `isNewRecord(entity)` - Verificar se é registro novo
- `configureHeaders()` - Headers padrão

### 5. Criar um Manager View (CRUD Completo)

```bash
cp .claude/templates/ManagerViewTemplate.tsx src/views/myentity/MyEntityManagerView.tsx
```

## Padrões Importantes

### DataSource

```typescript
// Remoto (carrega da API)
const { dataSource } = useArchbaseRemoteDataSource<EntityDto, string>({
  name: 'dsEntity',
  service: serviceApi,
  pageSize: 25,
  loadOnStart: true
})

// Local (dados em memória)
const { dataSource } = useArchbaseDataSource<EntityDto, string>({
  name: 'dsEntity',
  initialData: []
})
```

### Operações do DataSource

| Método | Uso |
|--------|-----|
| `dataSource.open({ records })` | Carregar dados |
| `dataSource.insert(entity)` | Inserir novo registro |
| `dataSource.edit()` | Entrar em modo edição |
| `dataSource.save()` | Salvar alterações |
| `dataSource.cancel()` | Cancelar edição |
| `dataSource.remove()` | Remover registro atual |
| `dataSource.getCurrentRecord()` | Obter registro atual |
| `dataSource.setFieldValue(field, value)` | Alterar campo |

### Hooks Essenciais

| Hook | Uso |
|------|-----|
| `useArchbaseRemoteServiceApi` | Injetar service do IoC |
| `useArchbaseRemoteDataSource` | DataSource remoto |
| `useArchbaseDataSource` | DataSource local |
| `useArchbaseStore` | Persistir estado entre navegações |
| `useArchbaseNavigationListener` | Limpar estado ao sair da rota |
| `useArchbaseSize` | Obter tamanho do container |
| `useArchbaseValidator` | Validação de formulários |
| `useArchbaseNavigateParams` | Navegação com parâmetros |

### Componentes Principais

| Componente | Uso |
|------------|-----|
| `ArchbaseGridTemplate` | Grid com CRUD automático |
| `ArchbaseDataGrid` | Grid customizável |
| `ArchbaseFormTemplate` | Formulário com save/cancel |
| `ArchbaseFormModalTemplate` | Modal com formulário |
| `ArchbaseModalTemplate` | Modal genérica |
| `ArchbaseEdit` | Input de texto |
| `ArchbaseSelect` | Select com opções |
| `ArchbaseNumberEdit` | Input numérico |
| `ArchbaseSwitch` | Toggle |
| `ArchbaseMaskEdit` | Input com máscara |
| `ArchbaseDatePickerEdit` | Seletor de data |
| `ArchbaseTextArea` | Textarea |

## Estrutura de Pastas Recomendada

```
src/views/
├── users/
│   ├── UserManagerView.tsx    # Manager (controla List e Form)
│   ├── UserListView.tsx       # Lista
│   ├── UserForm.tsx           # Formulário
│   └── UserModal.tsx          # Modal (se necessário)
├── products/
│   ├── ProductManagerView.tsx
│   ├── ProductListView.tsx
│   └── ProductForm.tsx
└── ...
```

## Validação

Usar `useArchbaseValidator()` ou criar schema Yup:

```typescript
const validator = useArchbaseValidator()

// ou

import * as yup from 'yup'

const schema = yup.object({
  name: yup.string().required('Nome obrigatório'),
  email: yup.string().email('E-mail inválido').required()
})

// Configurar no DataSource
useEffect(() => {
  dataSource.setValidator(new ArchbaseValidator(schema))
}, [])
```

## Erros Comuns

| Erro | Solução |
|------|---------|
| "Cannot modify in browsing state" | Chamar `dataSource.edit()` antes de modificar |
| "Metadata not found" | Usar `import type { ArchbaseRemoteApiClient }` |
| "Abstract method not implemented" | Implementar `getId()` e `isNewRecord()` no service |
| "width: 0px, height: 0px" | Usar `useArchbaseSize(ref)` com ref no container |

## Referências

- Documentação principal: `CLAUDE.md`
- Skill completa: `.claude/SKILL.md`
- Documentação modular: `.claude/knowledge/`
- Exemplos funcionais: `.claude/examples/`
