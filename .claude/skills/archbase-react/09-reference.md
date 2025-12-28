# 09. Checklists e Referência Rápida

Resumos, checklists e tabelas de referência rápida.

---

## Resumo de Correções Críticas

| Errado | Correto |
|--------|---------|
| `ArchbaseDataTable` | `ArchbaseDataGrid` |
| `ArchbaseListTemplate` | `ArchbasePanelTemplate` |
| `columns={[...]}` (array) | `<Columns><ArchbaseDataGridColumn /></Columns>` |
| `caption` | `header` |
| `width` | `size` |
| `onRowDoubleClick` | `onCellDoubleClick` |
| `dataSource.setData([])` | `dataSource.open({ records: [] })` ou V2: `dataSource.setRecords([])` |
| `dataSource.post()` | `dataSource.save()` |
| `dataSource.append({})` | `dataSource.insert({})` |
| `dataSource.delete()` | `dataSource.remove()` |
| `dataSource.goToId(id)` | `dataSource.locate({ id })` |
| `dataSource.getData()` | `dataSource.browseRecords()` |
| `service.findById(id)` | `service.findOne(id)` |
| `<ArchbaseSelect data={[]}` | `<ArchbaseSelect options={[]} getOptionLabel getOptionValue` |
| `<ArchbaseLookupEdit lookupDataSource` | `<ArchbaseLookupEdit lookupValueDelegator` |
| `<ArchbaseAsyncSelect onSearch` | `<ArchbaseAsyncSelect getOptions` |
| `<ArchbaseNumberEdit min max decimalScale` | `minValue maxValue precision` |
| `{ ref, height } = useArchbaseSize()` | `[width, height] = useArchbaseSize(ref)` |
| Sem getId/isNewRecord | `getId()` e `isNewRecord()` são OBRIGATÓRIOS |
| `action === 'ADD'` (direta) | `action.toUpperCase() === 'ADD'` (case-insensitive) |
| `forceUpdate()` no onLoadComplete | **NÃO usar** - causa loop |
| DTO sem UUID no newInstance() | Sempre gerar `id: uuidv4()` |
| DTO sem `__isNew` | Adicionar `__isNew: true` |
| `isNewRecord` verificando id vazio | Usar `entity.__isNew === true` |
| `useElementSize` no form | **NÃO usar** - usar `ScrollArea` |
| Store com ID dinâmico | Usar nome fixo `'formStore'` |
| `useArchbaseRemoteDataSource` + cast | **Usar V2**: `useArchbaseRemoteDataSourceV2` |
| `const ds = dataSource as any` | V2: passar `dataSource` direto |

---

## DTOs - Padrões

### Campo `__isNew` e UUID (CRÍTICO!)

```typescript
import { v4 as uuidv4 } from 'uuid'

export class EntityDto {
  id?: string
  __isNew?: boolean  // OBRIGATÓRIO
  nome: string

  constructor(data: any = {}) {
    this.id = data.id
    this.__isNew = data.__isNew ?? false
    this.nome = data.nome || ''
  }

  static newInstance = () => {
    return new EntityDto({
      id: uuidv4(),      // Gerar UUID
      __isNew: true,     // Marcar como novo
      nome: ''
    })
  }
}
```

### NÃO usar forceUpdate()

```typescript
// ERRADO - Causa loop infinito!
onLoadComplete: (dataSource) => {
  if (isEditAction) {
    dataSource.edit()
  }
  forceUpdate()  // NÃO FAZER ISSO!
}

// CORRETO - O DataSource notifica automaticamente
onLoadComplete: (dataSource) => {
  if (isEditAction) {
    dataSource.edit()
  }
}
```

---

## Checklist de Desenvolvimento

### Forms (useArchbaseRemoteDataSourceV2)
- [ ] NÃO usar `useElementSize`
- [ ] Usar `useArchbaseRemoteDataSourceV2` sem cast
- [ ] Usar `useArchbaseStore('nomeFixo')`
- [ ] Usar `useRef(false)` + `useEffect` para carregar uma vez
- [ ] Comparar action com `toUpperCase()`
- [ ] `dataSource.setRecords([dto])` para registro existente
- [ ] `dataSource.insert(Dto.newInstance())` para novo
- [ ] `dataSource.edit()` para entrar em edição
- [ ] Sem cast nos componentes

### Views/Grids
- [ ] Usar `ArchbaseDataGrid`
- [ ] Usar `<Columns><ArchbaseDataGridColumn /></Columns>`
- [ ] Props: `header`, `size`, `dataType`
- [ ] Evento: `onCellDoubleClick`

### Services
- [ ] `type` import para `ArchbaseRemoteApiClient`
- [ ] Implementar `getEndpoint()` - obrigatório
- [ ] Implementar `configureHeaders()` - obrigatório
- [ ] Implementar `getId(entity)` - obrigatório
- [ ] Implementar `isNewRecord(entity)` usando `__isNew` - obrigatório
- [ ] Usar `findOne()`
- [ ] Endpoint no plural

### DTOs
- [ ] Importar `uuid`
- [ ] Adicionar `__isNew?: boolean`
- [ ] No construtor: `this.__isNew = data.__isNew ?? false`
- [ ] No `newInstance()`: `id: uuidv4()` e `__isNew: true`

---

## Larguras de Campos (Formulário)

| Tipo | Width |
|------|-------|
| ID/UUID | 320 |
| Código curto | 120-150 |
| CPF | 180 |
| CNPJ | 200 |
| Telefone | 180 |
| Valor monetário | 180 |
| Número inteiro | 120-150 |
| Data | 180 |
| Email | 350 |
| Select curto | 250 |
| Nome/Descrição | (sem width) |

---

## Tabs - Padrão do Projeto

**IMPORTANTE**: SEMPRE usar `variant="outline"`

```typescript
<Tabs value={activeTab} onChange={setActiveTab} variant="outline">
  <Tabs.List>
    <Tabs.Tab value="dados" leftSection={<IconClipboardList size={16} />}>
      Dados
    </Tabs.Tab>
    <Tabs.Tab value="servicos" leftSection={<IconTool size={16} />}>
      Serviços
      {count > 0 && <Badge size="xs" ml={4}>{count}</Badge>}
    </Tabs.Tab>
  </Tabs.List>

  <Tabs.Panel value="dados" pt="md">
    {/* Conteúdo */}
  </Tabs.Panel>
</Tabs>
```

---

## useArchbaseNavigationListener

**OBRIGATÓRIO** em views abertas em abas.

```typescript
const { closeAllowed } = useArchbaseNavigationListener(ROUTE, () => {
  templateStore.clearAllValues()
  closeAllowed()
})
```

---

## Segurança - Checklist

- [ ] `ArchbaseSecurityProvider` no `App.tsx`
- [ ] Constantes em `useGestorRQSecurity.ts`
- [ ] `ArchbaseViewSecurityProvider` na view
- [ ] Função `*Content` interna
- [ ] `useArchbaseSecureForm` para permissões
- [ ] Aplicar `canCreate`, `canEdit`, `canDelete`, `canView`

---

## Workspace - Checklist

### Múltiplos Modos
- [ ] `ArchbaseSpaceTemplate`
- [ ] Alternância Kanban/Grid
- [ ] Sincronizar dados entre modos
- [ ] `headerLeft` para ações principais
- [ ] `headerRight` para filtros

### Kanban
- [ ] `KANBAN_COLUMNS` com status e cores
- [ ] `ScrollArea` horizontal
- [ ] Cards clicáveis
- [ ] Badges de contagem
- [ ] Indicador de cor (dot)

### Lookup Modals
- [ ] `Modal` do Mantine
- [ ] DataSource V2
- [ ] Campo de busca
- [ ] Grid com duplo clique
- [ ] Callback `onSelect`

### Modais com Arrays
- [ ] `useArchbaseDataSourceV2` local
- [ ] Interface para arrays
- [ ] `appendToFieldArray`
- [ ] `updateFieldArrayItem` com draft
- [ ] `removeFromFieldArray`
- [ ] Indicador de alterações pendentes

### Workflow
- [ ] Verificar status para habilitar ações
- [ ] Cores: Cyan=iniciar, Yellow=pausar, Green=concluir, Red=cancelar
- [ ] Métodos no Service
- [ ] Notificações sucesso/erro

---

## Performance com DataSource V2

```typescript
// Item memoizado
const ItemContatoMemo = memo(({ contato, index, onUpdate, onRemove }) => {
  return (
    <Group>
      <Select value={contato.tipo} onChange={(v) => onUpdate(index, 'tipo', v)} />
      <ActionIcon onClick={() => onRemove(index)}><IconTrash size={16} /></ActionIcon>
    </Group>
  )
})

// Callbacks estáveis
const handleUpdate = useCallback((index, field, value) => {
  dataSource.updateFieldArrayItem('contatos', index, (draft) => {
    (draft as any)[field] = value
  })
}, [dataSource])
```

---

## Master-Detail com V2

```typescript
const { dataSource: dsClientes, currentRecord: clienteAtual } = useArchbaseDataSourceV2<Cliente>({
  name: 'clientes',
  records: clientesList
})

// Detail: Pedidos do cliente via getFieldArray
const pedidos = dsClientes.getFieldArray('pedidos')

// Adicionar pedido
dsClientes.appendToFieldArray('pedidos', {
  id: uuidv4(),
  valor: 0,
  status: 'PENDENTE'
})

// Atualizar status
dsClientes.updateFieldArrayItem('pedidos', index, (draft) => {
  draft.status = 'NOVO_STATUS'
})

// Remover pedido
dsClientes.removeFromFieldArray('pedidos', index)
```
