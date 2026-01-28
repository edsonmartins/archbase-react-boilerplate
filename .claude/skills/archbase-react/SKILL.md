# Archbase React - Skill de Referência

Este documento contém a referência completa dos componentes e padrões do Archbase React v3.

**IMPORTANTE**: Documentação validada contra a biblioteca archbase-react-v3 e projeto gestor-rq-admin.

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
  { value: StatusItem.ATIVO, label: 'Ativo' },
  { value: StatusItem.INATIVO, label: 'Inativo' }
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
  isNewRecord(entity: MinhaDto): boolean { return !entity.id || entity.id === '' }

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
| DTO sem `__isNew` | Adicionar `__isNew: true` no `newInstance()` |
| `isNewRecord` verificando `!entity.id` | Usar `entity.__isNew === true` |
| `import { ArchbaseRemoteApiClient }` | `import type { ArchbaseRemoteApiClient }` |

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

---

## Estrutura de Arquivos Recomendada

```
src/views/meu-modulo/
├── MeuModuloView.tsx           # View principal (lista)
├── MeuModuloForm.tsx           # View de formulário
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

Versão: 3.0.4+
Atualizado: 2026-01-27
