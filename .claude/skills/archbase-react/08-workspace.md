# 08. Views Complexas - Workspace, Kanban e Mais

Padrões avançados para views complexas com múltiplos modos de visualização.

---

## ArchbaseSpaceTemplate

Template mais flexível para views complexas com header customizado.

### Estrutura Básica

```typescript
import { ArchbaseSpaceTemplate } from '@archbase/template'
import { useElementSize } from '@mantine/hooks'
import { useRef } from 'react'

export function WorkspaceView() {
  const containerRef = useRef(null)
  const { height: containerHeight } = useElementSize()
  const safeHeight = containerHeight > 0 ? containerHeight - 60 : 600

  return (
    <ArchbaseSpaceTemplate
      title="Título da View"
      withBorder
      innerRef={containerRef}
      headerLeft={
        <Group gap="sm">
          <Button leftSection={<IconPlus size={16} />}>Novo</Button>
        </Group>
      }
      headerRight={
        <Group gap="sm">
          <Select placeholder="Status" data={statusOptions} />
        </Group>
      }
    >
      <Paper p={2} style={{ height: safeHeight }}>
        {/* Conteúdo */}
      </Paper>
    </ArchbaseSpaceTemplate>
  )
}
```

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `title` | string | Título da view |
| `withBorder` | boolean | Mostrar borda |
| `innerRef` | RefObject | Ref para calcular dimensões |
| `headerLeft` | ReactNode | Componentes à esquerda |
| `headerRight` | ReactNode | Componentes à direita |
| `onClose` | function | Callback ao fechar |

---

## Workspace - Múltiplos Modos (Kanban + Grid)

Views que alternam entre Kanban e Grid são ideais para processos de workflow.

```typescript
type ViewMode = 'kanban' | 'lista'

export function WorkspaceWithKanbanAndGrid() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [items, setItems] = useState<ItemDto[]>([])

  const { dataSource, isLoading, refreshData } = useArchbaseRemoteDataSourceV2<ItemDto>({
    name: 'dsItems',
    service: serviceApi,
    pageSize: 50,
    defaultSortFields: ['-createdAt']
  })

  const handleRefresh = useCallback(() => {
    if (viewMode === 'lista') {
      refreshData()
    } else {
      loadItemsForKanban()
    }
  }, [viewMode, refreshData])

  return (
    <ArchbaseSpaceTemplate
      title="Workspace"
      headerLeft={<Button onClick={handleNew}>Novo</Button>}
      headerRight={
        <Tabs value={viewMode} onChange={(v) => setViewMode(v as ViewMode)} variant="outline">
          <Tabs.List>
            <Tabs.Tab value="kanban">Kanban</Tabs.Tab>
            <Tabs.Tab value="lista">Lista</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      }
    >
      <Paper p={2} style={{ height: safeHeight }}>
        {viewMode === 'kanban' ? (
          <KanbanBoard items={items} onItemClick={handleItemClick} />
        ) : (
          <ArchbaseDataGrid dataSource={dataSource} height={safeHeight - 40}>
            {/* Colunas */}
          </ArchbaseDataGrid>
        )}
      </Paper>
    </ArchbaseSpaceTemplate>
  )
}
```

---

## Kanban Boards

### Estrutura Completa

```typescript
import { Box, Group, Paper, Badge, ScrollArea, Stack, Text } from '@mantine/core'

interface KanbanColumn {
  id: string
  status: StatusEnum
  title: string
  color: MantineColor
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'aberta', status: StatusEnum.ABERTA, title: 'Abertas', color: 'blue' },
  { id: 'andamento', status: StatusEnum.EM_ANDAMENTO, title: 'Em Andamento', color: 'cyan' },
  { id: 'aguardando', status: StatusEnum.AGUARDANDO, title: 'Aguardando', color: 'yellow' },
  { id: 'concluida', status: StatusEnum.CONCLUIDA, title: 'Concluídas', color: 'green' }
]

export function KanbanBoard({ items, loading, onCardClick, height = '100%' }: KanbanBoardProps) {
  const getItemsByStatus = (status: StatusEnum): ItemDto[] => {
    return items.filter(item => item.status === status)
  }

  return (
    <ScrollArea type="auto" scrollbarSize={8} style={{ height, width: '100%' }}>
      <Group align="flex-start" gap="md" wrap="nowrap">
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            items={getItemsByStatus(column.status)}
            totalCount={items.filter(i => i.status === column.status).length}
            onCardClick={onCardClick}
          />
        ))}
      </Group>
    </ScrollArea>
  )
}

function KanbanColumn({ column, items, totalCount, onCardClick }: KanbanColumnProps) {
  return (
    <Paper withBorder radius="md" p="xs" style={{ width: 260, backgroundColor: 'var(--mantine-color-gray-0)' }}>
      <Group justify="space-between" mb="sm">
        <Group gap="xs">
          <Box style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: `var(--mantine-color-${column.color}-6)` }} />
          <Text fw={600} size="sm">{column.title}</Text>
        </Group>
        <Badge variant="light" color={column.color} size="sm">{totalCount}</Badge>
      </Group>

      <Stack gap="xs">
        {items.map((item) => (
          <KanbanCard key={item.id} item={item} onClick={() => onCardClick?.(item)} />
        ))}
      </Stack>
    </Paper>
  )
}
```

### Kanban Card

```typescript
export function KanbanCard({ item, onClick }: KanbanCardProps) {
  return (
    <Paper withBorder p="xs" radius="sm" onClick={onClick} style={{ cursor: 'pointer' }}>
      <Stack gap={4}>
        <Group justify="space-between">
          <Text fw={500} size="sm">{item.numero}</Text>
          <StatusBadge status={item.status} size="xs" />
        </Group>
        <Text size="xs" c="dimmed" lineClamp={2}>{item.descricao}</Text>
      </Stack>
    </Paper>
  )
}
```

---

## Lookup Modals

Modais de busca para selecionar registros relacionados.

```typescript
export function VeiculoLookupModal({ opened, onClose, onSelect }: LookupModalProps<VeiculoDto>) {
  const [searchTerm, setSearchTerm] = useState('')

  const { dataSource, currentRecord, refreshData } = useArchbaseRemoteDataSourceV2<VeiculoDto>({
    name: 'dsVeiculoLookup',
    service: veiculoService,
    pageSize: 20
  })

  const handleSelect = useCallback(() => {
    if (currentRecord) {
      onSelect(currentRecord)
      onClose()
    }
  }, [currentRecord, onSelect, onClose])

  return (
    <Modal opened={opened} onClose={onClose} title="Selecionar Veículo" size="lg">
      <Stack>
        <Group>
          <TextInput
            placeholder="Digite a placa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button onClick={handleSearch}>Buscar</Button>
        </Group>

        <ArchbaseDataGrid
          dataSource={dataSource}
          height={300}
          onCellDoubleClick={handleSelect}
        >
          <Columns>
            <ArchbaseDataGridColumn<VeiculoDto> dataField="placa" header="Placa" size={100} dataType="text" />
            <ArchbaseDataGridColumn<VeiculoDto> dataField="marca" header="Marca" size={150} dataType="text" />
          </Columns>
        </ArchbaseDataGrid>

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSelect} disabled={!currentRecord}>Selecionar</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
```

---

## Status Badges

Componente reutilizável para exibir status coloridos.

```typescript
import { Badge, MantineColor } from '@mantine/core'

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const getStatusColor = (status: string): MantineColor => {
    switch (status) {
      case 'ABERTA':
      case 'PENDENTE':
        return 'blue'
      case 'EM_ANDAMENTO':
      case 'PROCESSANDO':
        return 'cyan'
      case 'AGUARDANDO':
      case 'PAUSADA':
        return 'yellow'
      case 'CONCLUIDA':
      case 'APROVADA':
        return 'green'
      case 'CANCELADA':
      case 'REPROVADA':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      'ABERTA': 'Aberta',
      'EM_ANDAMENTO': 'Em Andamento',
      'AGUARDANDO': 'Aguardando',
      'CONCLUIDA': 'Concluída',
      'CANCELADA': 'Cancelada'
    }
    return labels[status] || status
  }

  return (
    <Badge color={getStatusColor(status)} variant="light" size={size}>
      {getStatusLabel(status)}
    </Badge>
  )
}
```

### Uso no Grid

```typescript
<ArchbaseDataGridColumn<OrdemServicoDto>
  dataField="status"
  header="Status"
  size={130}
  dataType="text"
  render={(data) => <StatusBadge status={data.getValue()} size="xs" />}
/>
```

---

## Workflow Actions

Ações de fluxo de trabalho (Iniciar, Pausar, Concluir, Cancelar).

### Service Methods

```typescript
class OrdemServicoService extends ArchbaseRemoteApiService<OrdemServicoDto, string> {
  async iniciarExecucao(id: string): Promise<OrdemServicoDto> {
    const response = await this.client.post(`${this.getEndpoint()}/${id}/iniciar`)
    return new OrdemServicoDto(response.data)
  }

  async aguardarPecas(id: string): Promise<OrdemServicoDto> {
    const response = await this.client.post(`${this.getEndpoint()}/${id}/aguardar-pecas`)
    return new OrdemServicoDto(response.data)
  }

  async concluir(id: string): Promise<OrdemServicoDto> {
    const response = await this.client.post(`${this.getEndpoint()}/${id}/concluir`)
    return new OrdemServicoDto(response.data)
  }

  async cancelar(id: string, motivo: string): Promise<OrdemServicoDto> {
    const response = await this.client.post(`${this.getEndpoint()}/${id}/cancelar`, { motivo })
    return new OrdemServicoDto(response.data)
  }
}
```

### Componente de Workflow Actions

```typescript
export function WorkflowActions({ item, ...handlers }: WorkflowActionsProps) {
  const canIniciar = item.status === StatusOS.ABERTA
  const canAguardarPecas = item.status === StatusOS.EM_ANDAMENTO
  const canConcluir = item.status === StatusOS.EM_ANDAMENTO || item.status === StatusOS.AGUARDANDO_PECAS
  const canCancelar = item.status === StatusOS.ABERTA || item.status === StatusOS.AGUARDANDO_PECAS

  return (
    <Paper withBorder p="sm" radius="md">
      <Group justify="space-between">
        <Text fw={600} size="sm">Ações</Text>
        <Group gap="xs">
          {canIniciar && handlers.onIniciar && (
            <Button size="xs" leftSection={<IconPlayerPlay size={14} />} color="cyan"
              onClick={() => handlers.onIniciar!(item)}>Iniciar</Button>
          )}
          {canAguardarPecas && handlers.onAguardarPecas && (
            <Button size="xs" leftSection={<IconPlayerPause size={14} />} color="yellow"
              onClick={() => handlers.onAguardarPecas!(item)}>Aguardar</Button>
          )}
          {canConcluir && handlers.onConcluir && (
            <Button size="xs" leftSection={<IconCheck size={14} />} color="green"
              onClick={() => handlers.onConcluir!(item)}>Concluir</Button>
          )}
          {canCancelar && handlers.onCancelar && (
            <Button size="xs" leftSection={<IconX size={14} />} color="red" variant="light"
              onClick={() => handlers.onCancelar!(item)}>Cancelar</Button>
          )}
        </Group>
      </Group>
    </Paper>
  )
}
```

---

## Modais Complexos com DataSource V2

Modais que gerenciam entidades com arrays (apontamentos, itens).

```typescript
export function ModalComplexo({ entity, opened, onClose, onSave }: ModalComplexoProps) {
  const [hasChanges, setHasChanges] = useState(false)

  const {
    dataSource,
    currentRecord,
    appendToFieldArray,
    updateFieldArrayItem,
    removeFromFieldArray,
    getFieldArray
  } = useArchbaseDataSourceV2<EntityComArrays>({
    name: 'dsModalComplexo',
    records: []
  })

  useEffect(() => {
    if (entity && opened && dataSource) {
      const entityCopy: EntityComArrays = { ...entity, itens: entity.itens || [] }
      dataSource.setRecords([entityCopy])
      dataSource.first()
      if (dataSource.isBrowsing()) dataSource.edit()
      setHasChanges(false)
    }
  }, [entity, opened, dataSource])

  const handleSaveChanges = useCallback(() => {
    if (currentRecord && onSave) {
      onSave(new EntityDto(currentRecord))
      setHasChanges(false)
    }
  }, [currentRecord, onSave])

  const handleAdicionarItem = useCallback((novoItem: Partial<ItemDto>) => {
    appendToFieldArray('itens', new ItemDto({ id: uuidv4(), __isNew: true, ...novoItem }))
    setHasChanges(true)
  }, [appendToFieldArray])

  const itens = getFieldArray('itens') || []
  const total = useMemo(() => itens.reduce((acc, item) => acc + (item.valor || 0), 0), [itens])

  return (
    <ArchbaseModalTemplate
      title="Detalhes"
      size="80%"
      opened={opened}
      onClickOk={() => { if (hasChanges) handleSaveChanges(); onClose() }}
      onClickCancel={onClose}
      okButtonLabel={hasChanges ? 'Salvar e Fechar' : 'Fechar'}
    >
      <Stack gap="md">
        {hasChanges && (
          <Paper withBorder p="xs" bg="yellow.0">
            <Badge color="yellow">Alterações Pendentes</Badge>
          </Paper>
        )}

        <Tabs variant="outline">
          <Tabs.List>
            <Tabs.Tab value="dados">Dados</Tabs.Tab>
            <Tabs.Tab value="itens">Itens {itens.length > 0 && <Badge size="xs">{itens.length}</Badge>}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="dados" pt="md">
            <TextInput label="Nome" value={currentRecord?.nome || ''}
              onChange={(e) => { dataSource.setFieldValue('nome', e.target.value); setHasChanges(true) }}
            />
          </Tabs.Panel>

          <Tabs.Panel value="itens" pt="md">
            {itens.map((item, index) => (
              <Group key={item.id || index}>
                <Text>{item.descricao}</Text>
                <ActionIcon size="xs" onClick={() => { removeFromFieldArray('itens', index); setHasChanges(true) }}>
                  <IconTrash size={14} />
                </ActionIcon>
              </Group>
            ))}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </ArchbaseModalTemplate>
  )
}
```

---

## useArchbaseNavigationListener

**OBRIGATÓRIO** em views abertas em abas para permitir fechamento.

```typescript
import { useArchbaseNavigationListener } from '@archbase/admin'
import { useArchbaseStore } from '@archbase/data'
import { MINHA_VIEW_ROUTE } from '../../../navigation/navigationDataConstants'

export function MinhaView() {
  const templateStore = useArchbaseStore('minhaViewStore')

  // OBRIGATÓRIO para fechar aba
  const { closeAllowed } = useArchbaseNavigationListener(MINHA_VIEW_ROUTE, () => {
    templateStore.clearAllValues()
    closeAllowed()
  })

  return (
    <ArchbaseSpaceTemplate title="Minha View">
      {/* Conteúdo */}
    </ArchbaseSpaceTemplate>
  )
}
```
