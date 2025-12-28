# Archbase React - Skill de Referência

Este documento contém a referência completa dos componentes e padrões do Archbase React v3.

**IMPORTANTE**: Documentação validada contra a biblioteca archbase-react-v3.

---

## Índice de Arquivos

| Arquivo | Conteúdo | Linhas |
|---------|----------|--------|
| **01-datasource.md** | DataSource V1/V2, Estados, Operações, Arrays | ~500 |
| **02-inputs.md** | Componentes de Input (Edit, Select, Lookup, AsyncSelect, etc.) | ~300 |
| **03-grid.md** | ArchbaseDataGrid, Colunas, dataType | ~200 |
| **04-templates.md** | FormTemplate, PanelTemplate, SpaceTemplate | ~150 |
| **05-services.md** | Services Remotos, ApiClient, CRUD | ~200 |
| **06-forms.md** | Form Pattern, Layout Vertical, Action handling | ~400 |
| **07-security.md** | Sistema de Segurança, Permissões, Providers | ~400 |
| **08-workspace.md** | Workspace, Kanban, Lookup Modals, Status Badges, Workflow | ~800 |
| **09-reference.md** | Checklists, DTOs, V1/V2, Performance | ~500 |

---

## Comandos Mais Usados

### DataSource
```typescript
// Carregar dados
dataSource.open({ records: [...] })           // V1
dataSource.setRecords([...])                   // V2

// Navegação
dataSource.first() | last() | next() | prior()
dataSource.locate({ id })                      // V1

// CRUD
dataSource.insert({...})                       // Inserir
dataSource.edit()                              // Editar
dataSource.save()                              // Salvar
dataSource.remove()                            // Remover
```

### Grid
```typescript
<ArchbaseDataGrid dataSource={dataSource} height={400}>
  <Columns>
    <ArchbaseDataGridColumn dataField="nome" header="Nome" size={200} dataType="text" />
  </Columns>
</ArchbaseDataGrid>
```

### Select
```typescript
<ArchbaseSelect
  options={options}
  getOptionLabel={(opt) => opt.name}
  getOptionValue={(opt) => opt.id}
/>
```

---

## Correções Críticas (ERRADO → CORRETO)

| Errado | Correto |
|--------|---------|
| `ArchbaseDataTable` | `ArchbaseDataGrid` |
| `caption` / `width` | `header` / `size` |
| `dataSource.setData()` | `dataSource.open({records})` |
| `dataSource.post()` | `dataSource.save()` |
| `service.findById()` | `service.findOne()` |
| `action === 'ADD'` | `action.toUpperCase() === 'ADD'` |
| `{ ref, height } = useArchbaseSize()` | `[width, height] = useArchbaseSize(ref)` |

---

## Como Usar

Para ver o conteúdo detalhado de cada área, consulte os arquivos numerados:

- **Precisa de DataSource?** → `01-datasource.md`
- **Precisa de um Input?** → `02-inputs.md`
- **Precisa de uma Grid?** → `03-grid.md`
- **Precisa de um Form?** → `06-forms.md`
- **Precisa de Segurança?** → `07-security.md`
- **Precisa de Workspace/Kanban?** → `08-workspace.md`
- **Precisa de Checklist?** → `09-reference.md`

---

Versão: 3.0.7+
Data: 2025-12-28
