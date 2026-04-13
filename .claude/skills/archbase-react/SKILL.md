# Archbase React - Skill de Referência

Este documento contém a referência completa dos componentes e padrões do Archbase React v3.

**IMPORTANTE**: Documentação validada contra a biblioteca archbase-react-v3.

---

## Índice de Arquivos

| Arquivo | Conteúdo | Linhas |
|---------|----------|--------|
| **01-datasource.md** | DataSource V1/V2, Estados, Operações, Arrays | ~570 |
| **02-inputs.md** | Componentes de Input (Edit, Select, Lookup, AsyncSelect, etc.) | ~270 |
| **03-grid.md** | ArchbaseDataGrid, Colunas, dataType | ~160 |
| **04-templates.md** | FormTemplate, PanelTemplate, SpaceTemplate, ModalTemplate | ~200 |
| **05-services.md** | Services Remotos, ApiClient, CRUD, IoC | ~240 |
| **06-forms.md** | Form Pattern, Layout Vertical, Action handling | ~290 |
| **07-security.md** | Sistema de Segurança, Permissões, Providers | ~290 |
| **08-workspace.md** | Workspace, Kanban, Lookup Modals, Status Badges, Workflow | ~510 |
| **09-reference.md** | Checklists, DTOs, V1/V2, Performance | ~280 |
| **10-advanced-patterns.md** | Gráficos ECharts, KPI Cards, Wizards, WebSocket, Dashboard | ~500 |
| **11-view-patterns.md** | Padrões de Views CRUD | ~300 |
| **12-dashboard-patterns.md** | Padrões de Dashboard | ~350 |
| **13-atendimento-patterns.md** | Central de Atendimentos, Chat, WebSocket, Mock Data | ~400 |

---

## Comandos Mais Usados

### DataSource V1
```typescript
// Carregar dados
dataSource.open({ records: [...] })

// Navegação
dataSource.first() | last() | next() | prior()
dataSource.locate({ id })
dataSource.goToRecord(index)

// CRUD
dataSource.insert({...})                       // Inserir
dataSource.edit()                              // Entrar em edição
dataSource.save()                              // Salvar
dataSource.remove()                            // Remover
dataSource.cancel()                            // Cancelar

// Estado
dataSource.isBrowsing() | isEditing() | isInserting()
dataSource.getCurrentRecord()
dataSource.browseRecords()
```

### DataSource V2 (Recomendado)
```typescript
const { dataSource, isLoading, currentRecord, refreshData } = useArchbaseRemoteDataSourceV2<MyDto>({
  name: 'dsMinhaEntidade',
  label: 'Minha Entidade',
  service: serviceApi,
  pageSize: 50,
  defaultSortFields: ['-createdAt'],
  validator,
  onError: (error) => ArchbaseNotifications.showError('Atenção', error)
})

// Operações em Arrays (exclusivo V2)
dataSource.appendToFieldArray('itens', novoItem)
dataSource.updateFieldArrayItem('itens', index, (draft) => { draft.valor = 100 })
dataSource.removeFromFieldArray('itens', index)
dataSource.getFieldArray('itens')
```

### Grid
```typescript
<ArchbaseDataGrid dataSource={dataSource} height={400}>
  <Columns>
    <ArchbaseDataGridColumn dataField="nome" header="Nome" size={200} dataType="text" />
    <ArchbaseDataGridColumn dataField="status" header="Status" size={100} dataType="text"
      render={(data) => <StatusBadge status={data.getValue()} />} />
  </Columns>
</ArchbaseDataGrid>
```

### Select com Enum
```typescript
// Definir enum e values
export enum StatusItem {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO'
}

export const StatusItemValues = [
  { value: StatusItem.ATIVO, label: 'Ativo', color: 'green' },
  { value: StatusItem.INATIVO, label: 'Inativo', color: 'red' }
]

// Usar no Select
<ArchbaseSelect
  dataSource={dataSource}
  dataField="status"
  options={StatusItemValues}
  getOptionLabel={(opt) => opt.label}
  getOptionValue={(opt) => opt.value}
/>
```

### Service Completo
```typescript
@injectable()
export class MinhaService extends ArchbaseRemoteApiService<MinhaDto, string> {
  constructor(@inject(API_TYPE.ApiClient) client: ArchbaseRemoteApiClient) {
    super(client)
  }

  protected getEndpoint(): string { return '/api/v1/minha-entidade' }
  protected configureHeaders(): Record<string, string> { return {} }
  public getId(entity: MinhaDto): string { return entity.id || '' }
  protected transform(data: any): MinhaDto { return new MinhaDto(data) }
  isNewRecord(entity: MinhaDto): boolean { return entity.isNew === true }

  // Métodos customizados
  async ativar(id: string): Promise<MinhaDto> {
    const result = await this.client.post(`${this.getEndpoint()}/${id}/ativar`)
    return this.transform(result)
  }
}
```

---

## Correções Críticas (ERRADO → CORRETO)

| Errado | Correto |
|--------|---------|
| `ArchbaseDataTable` | `ArchbaseDataGrid` |
| `ArchbaseListTemplate` | `ArchbasePanelTemplate` ou `ArchbaseGridTemplate` |
| `caption` / `width` | `header` / `size` |
| `dataSource.setData()` | `dataSource.open({records})` ou V2: `dataSource.setRecords()` |
| `dataSource.post()` | `dataSource.save()` |
| `dataSource.append()` | `dataSource.insert()` |
| `dataSource.delete()` | `dataSource.remove()` |
| `dataSource.goToId()` | `dataSource.locate({ id })` |
| `dataSource.getData()` | `dataSource.browseRecords()` |
| `service.findById()` | `service.findOne()` |
| `action === 'ADD'` | `action.toUpperCase() === 'ADD'` |
| `{ ref, height } = useArchbaseSize()` | `[width, height] = useArchbaseSize(ref)` |
| `useElementSize` em FormTemplate | Usar `ScrollArea` com `height: '100%'` |
| Store com ID dinâmico | Store com nome fixo `'formStore'` |
| `const ds = dataSource as any` | Usar V2: dataSource direto sem cast |
| DTO sem `isNew` | Adicionar `isNew: true` no `newInstance()` |
| `isNewRecord` verificando `!entity.id` | Usar `entity.isNew` |
| `import { ArchbaseRemoteApiClient }` | `import type { ArchbaseRemoteApiClient }` |

---

## Padrões Modernos (2026)

### 1. Security Provider Pattern
```typescript
export function MinhaView() {
  return (
    <ArchbaseViewSecurityProvider
      resourceName="MINHA_ENTIDADE"
      resourceDescription="Gerenciamento de Entidade"
    >
      <MinhaViewContent />
    </ArchbaseViewSecurityProvider>
  )
}

function MinhaViewContent() {
  const { canCreate, canEdit, canDelete, canView } = useSecureActions(
    'MINHA_ENTIDADE',
    'Gerenciamento de Entidade'
  )
  // ...
}
```

### 2. Debounced Search (500ms)
```typescript
import { useDebouncedCallback } from '@mantine/hooks'

const debouncedSetSearch = useDebouncedCallback((value: string) => {
  setFilter((prev) => {
    const newFilter = { ...prev, searchText: value }
    templateStore.setValue('filter', newFilter)
    return newFilter
  })
}, 500)
```

### 3. RSQL Filter Builder
```typescript
const buildRsqlFilter = useCallback((): string => {
  const conditions: string[] = []

  if (filter.searchText?.trim()) {
    conditions.push(`name==*${filter.searchText.trim()}*`)
  }
  if (filter.status) {
    conditions.push(`status==${filter.status}`)
  }
  if (filter.dateRange?.start && filter.dateRange?.end) {
    conditions.push(`createdAt=bt=(${start},${end})`)
  }

  return conditions.length > 0 ? conditions.join(';') : ''
}, [filter])
```

### 4. SectionHeader Component
```typescript
const SectionHeader = ({ icon, title, color = 'blue' }) => (
  <Group gap="xs" mb="md">
    <ThemeIcon size="sm" variant="light" color={color} radius="xl">
      {icon}
    </ThemeIcon>
    <Text fw={600} size="sm" c="dimmed">
      {title}
    </Text>
  </Group>
)
```

### 5. LookupField Component
```typescript
const LookupField = ({ label, value, onSearch, onClear, disabled }) => (
  <ArchbaseEdit
    label={label}
    value={value}
    readOnly
    disabled={disabled}
    rightSection={
      <Group gap={4}>
        {onClear && value && (
          <ActionIcon size="sm" onClick={onClear}>x</ActionIcon>
        )}
        <ActionIcon size="sm" onClick={onSearch}>
          <IconSearch size={14} />
        </ActionIcon>
      </Group>
    }
  />
)
```

### 6. Mock Data Pattern
```typescript
// mockData.ts
export const USAR_MOCK_DATA = true

// service.ts
async listar(): Promise<Dto[]> {
  if (USAR_MOCK_DATA) {
    await this.simulateDelay()
    return [...MOCK_DATA]
  }
  return this.client.get(this.endpoint)
}
```

### 7. Sidebar Collapse Pattern
```typescript
const adminLayoutContext = useContext(ArchbaseAdminLayoutContext)
const previousCollapsedState = useRef<boolean | undefined>()

useEffect(() => {
  previousCollapsedState.current = adminLayoutContext.collapsed
  if (!adminLayoutContext.collapsed) {
    adminLayoutContext.setCollapsed?.(true)
  }
  return () => {
    if (previousCollapsedState.current === false) {
      adminLayoutContext.setCollapsed?.(false)
    }
  }
}, [])
```

### 8. HoverCard para Textos Longos
```typescript
<HoverCard width={600} position="bottom" openDelay={1500}>
  <HoverCard.Target>
    <Text truncate>{longText}</Text>
  </HoverCard.Target>
  <HoverCard.Dropdown>
    <ScrollArea style={{ maxHeight: 300 }}>
      <Text size="sm">{longText}</Text>
    </ScrollArea>
  </HoverCard.Dropdown>
</HoverCard>
```

---

## Padrões de View

| Tipo de View | Template | DataSource |
|--------------|----------|------------|
| Lista CRUD | `ArchbaseGridTemplate` | `useArchbaseRemoteDataSourceV2` |
| Formulário | `ArchbaseFormTemplate` | `useArchbaseRemoteDataSourceV2` |
| Workspace (Kanban + Lista) | `ArchbaseSpaceTemplate` | Local + Remoto |
| Dashboard | `ArchbaseSpaceTemplate` | `useDashboardData` hook |
| Modal com Form | `ArchbaseModalTemplate` | `useArchbaseDataSourceV2` local |
| Wizard/Stepper | `Paper` + `Stepper` | Estados locais |
| Central Atendimentos | CSS Modules customizado | Hooks compostos |

---

## Templates Disponíveis

Os templates atualizados estão em `.claude/skills/archbase-react/templates/`:

| Template | Descrição |
|----------|-----------|
| **FormViewTemplate.tsx** | Form com SectionHeader, LookupField, validação, security |
| **ListViewTemplate.tsx** | Lista com debounce, filtros RSQL, security, HoverCard |
| **ManagerViewTemplate.tsx** | CRUD completo com variações (Modal, Tabs, Dashboard) |
| **ServiceTemplate.ts** | Service com mock data pattern |
| **ModalTemplates.tsx** | Modais de formulário e lookup |

---

## Como Usar

Para ver o conteúdo detalhado de cada área, consulte os arquivos numerados:

- **Precisa de DataSource?** → `01-datasource.md`
- **Precisa de um Input?** → `02-inputs.md`
- **Precisa de uma Grid?** → `03-grid.md`
- **Precisa de Templates?** → `04-templates.md`
- **Precisa de um Service?** → `05-services.md`
- **Precisa de um Form?** → `06-forms.md`
- **Precisa de Segurança?** → `07-security.md`
- **Precisa de Workspace/Kanban?** → `08-workspace.md`
- **Precisa de Checklist de Correções?** → `09-reference.md`
- **Precisa de Gráficos/Dashboards/WebSocket?** → `10-advanced-patterns.md`
- **Precisa de Views CRUD completas?** → `11-view-patterns.md`
- **Precisa de Dashboard?** → `12-dashboard-patterns.md`
- **Precisa de Central de Atendimentos/Chat?** → `13-atendimento-patterns.md`

---

## Estrutura de Arquivos Recomendada

```
src/views/meu-modulo/
├── MeuModuloView.tsx           # View principal (lista)
├── MeuModuloForm.tsx           # View de formulário
├── MeuModulo.module.css        # Estilos CSS modules (opcional)
├── mockData.ts                 # Dados mock para testes (temporário)
├── components/
│   ├── MeuComponenteCard.tsx
│   ├── MeuComponenteStatus.tsx
│   └── modals/
│       └── MeuComponenteModal.tsx
├── charts/
│   └── MeuGrafico.tsx
└── hooks/
    └── useMeuHookCustomizado.ts

src/services/
├── MeuModuloService.ts

src/domain/meu-modulo/
├── MeuModuloDto.ts
├── MeuModuloAnaliseDto.ts
└── index.ts
```

---

Versão: 3.0.23+
Atualizado: 2026-04-13. Inclui padrões modernos do projeto GestorRQ e boilerplate.
