# Archbase Componentes de Grid - Guia Completo

## ArchbaseDataGrid

Componente principal de grid baseado no MUI X DataGrid com integração ao DataSource.

**IMPORTANTE**: O componente é `ArchbaseDataGrid`, NÃO existe `ArchbaseDataTable`.

### Uso Básico com Children Pattern

```typescript
import { ArchbaseDataGrid, ArchbaseDataGridColumn, Columns } from '@archbase/components'

<ArchbaseDataGrid
  dataSource={dataSource}
  height={400}
>
  <Columns>
    <ArchbaseDataGridColumn
      dataField="name"
      header="Nome"
      size={200}
      dataType="text"
    />
    <ArchbaseDataGridColumn
      dataField="email"
      header="E-mail"
      size={250}
      dataType="text"
    />
    <ArchbaseDataGridColumn
      dataField="status"
      header="Status"
      size={100}
      dataType="text"
    />
  </Columns>
</ArchbaseDataGrid>
```

### Props do ArchbaseDataGrid

```typescript
interface ArchbaseDataGridProps<T, ID> {
  // Obrigatório
  dataSource: ArchbaseDataSource<T, ID>

  // Dimensões
  height?: string | number
  width?: string | number

  // Funcionalidades
  enableColumnResizing?: boolean      // Redimensionar colunas (default: true)
  enableRowNumbers?: boolean          // Mostrar números de linha (default: true)
  enableRowSelection?: boolean        // Seleção de linhas (default: true)
  enableRowActions?: boolean          // Coluna de ações (default: true)
  enableColumnFilterModes?: boolean   // Filtros de coluna (default: true)
  enableGlobalFilter?: boolean        // Filtro global (default: true)
  enableTopToolbar?: boolean          // Toolbar superior (default: true)
  enableTopToolbarActions?: boolean   // Ações na toolbar (default: true)
  showPagination?: boolean            // Mostrar paginação (default: true)

  // Paginação
  pageSize?: number      // Tamanho da página (default: 15)
  pageIndex?: number     // Índice da página inicial (default: 0)

  // Modo manual (paginação/filtro server-side)
  manualFiltering?: boolean   // Filtro manual (default: true)
  manualPagination?: boolean  // Paginação manual (default: true)
  manualSorting?: boolean     // Ordenação manual (default: true)

  // Estado
  isLoading?: boolean
  isError?: boolean
  error?: any

  // Callbacks
  onSelectedRowsChanged?: (rows: T[]) => void
  onCellDoubleClick?: (params: { id: any; columnName: string; rowData: T }) => void
  getRowId?: (row: T) => ID

  // Renderização customizada
  renderRowActions?: (row: T) => ReactNode
  renderToolbarActions?: () => ReactNode
  renderTopToolbar?: ReactNode

  // Detail Panel
  renderDetailPanel?: (props: { row: T }) => ReactNode
  allowMultipleDetailPanels?: boolean
  detailPanelMinHeight?: number
  detailPanelDisplayMode?: 'auto' | 'inline' | 'modal' | 'drawer'
  detailPanelTitle?: string
  detailPanelPosition?: 'right' | 'left' | 'bottom' | 'top'
  detailPanelSize?: string | number

  // Permissões
  allowColumnFilters?: boolean   // (default: true)
  allowExportData?: boolean      // (default: true)
  allowPrintData?: boolean       // (default: true)

  // Aparência
  withBorder?: boolean           // (default: true)
  withColumnBorders?: boolean    // (default: true)
  highlightOnHover?: boolean     // (default: true)
  striped?: boolean              // (default: false)
  variant?: 'filled' | 'outlined'
  rowHeight?: number             // (default: 52)

  // Exportação/Impressão
  printTitle?: string
  logoPrint?: string
  globalDateFormat?: string

  // Layout
  toolbarAlignment?: 'left' | 'right' | 'center'
  positionActionsColumn?: 'first' | 'last'
  toolbarLeftContent?: ReactNode

  // Labels
  paginationLabels?: {
    totalRecords?: string
    pageSize?: string
    currentPage?: string
    of?: string
  }

  // Referência
  gridRef?: RefObject<ArchbaseDataGridRef<T>>
}
```

## Definição de Colunas - ArchbaseDataGridColumn

**IMPORTANTE**: Use `header` (NÃO `caption`), `size` (NÃO `width`), e `dataType` é OBRIGATÓRIO.

### Props da Coluna

```typescript
interface ArchbaseDataGridColumnProps<T> {
  // Obrigatórios
  dataField: string           // Campo do DTO
  header: string              // Título da coluna (NÃO use 'caption')
  dataType: FieldDataType     // Tipo de dado (OBRIGATÓRIO)

  // Tamanho
  size: number                // Largura em pixels (NÃO use 'width')
  minSize?: number
  maxSize?: number

  // Alinhamento
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  footerAlign?: 'left' | 'center' | 'right'

  // Renderização
  render?: (data: any) => ReactNode
  dataFieldAcessorFn?: (originalRow: T) => any

  // Filtros e ordenação
  enableColumnFilter?: boolean   // (default: true)
  enableGlobalFilter?: boolean   // (default: true)
  enableSorting?: boolean        // (default: true)
  inputFilterType?: string

  // Visibilidade
  visible: boolean               // (default: true)

  // Funcionalidades
  enableClickToCopy: boolean     // (default: false)

  // Para tipo enum
  enumValues?: Array<{ label: string; value: string }>

  // Footer
  footer?: string
}
```

### Tipos de Dados (dataType)

```typescript
type FieldDataType =
  | 'text'      // Texto simples
  | 'integer'   // Número inteiro
  | 'float'     // Número decimal
  | 'currency'  // Moeda (formatação automática)
  | 'boolean'   // Verdadeiro/Falso
  | 'date'      // Data
  | 'datetime'  // Data e hora
  | 'time'      // Apenas hora
  | 'enum'      // Enumeração com valores fixos
  | 'image'     // URL de imagem
  | 'uuid'      // UUID
```

## Exemplos de Colunas

### Coluna de Texto

```typescript
<ArchbaseDataGridColumn
  dataField="name"
  header="Nome"
  size={200}
  dataType="text"
/>
```

### Coluna Numérica

```typescript
<ArchbaseDataGridColumn
  dataField="quantity"
  header="Quantidade"
  size={100}
  dataType="integer"
  align="right"
/>
```

### Coluna de Moeda

```typescript
<ArchbaseDataGridColumn
  dataField="price"
  header="Preço"
  size={120}
  dataType="currency"
  align="right"
/>
```

### Coluna de Data

```typescript
<ArchbaseDataGridColumn
  dataField="createdAt"
  header="Criado em"
  size={150}
  dataType="date"
/>
```

### Coluna de Data e Hora

```typescript
<ArchbaseDataGridColumn
  dataField="updatedAt"
  header="Atualizado em"
  size={180}
  dataType="datetime"
/>
```

### Coluna Boolean

```typescript
<ArchbaseDataGridColumn
  dataField="active"
  header="Ativo"
  size={80}
  dataType="boolean"
  align="center"
/>
```

### Coluna Enum

```typescript
<ArchbaseDataGridColumn
  dataField="status"
  header="Status"
  size={120}
  dataType="enum"
  enumValues={[
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'INACTIVE', label: 'Inativo' },
    { value: 'PENDING', label: 'Pendente' }
  ]}
/>
```

### Coluna com Render Customizado

```typescript
<ArchbaseDataGridColumn
  dataField="status"
  header="Status"
  size={120}
  dataType="text"
  render={(value) => (
    <Badge color={value === 'ACTIVE' ? 'green' : 'red'}>
      {value === 'ACTIVE' ? 'Ativo' : 'Inativo'}
    </Badge>
  )}
/>
```

### Coluna de Ações

```typescript
<ArchbaseDataGridColumn
  dataField="id"
  header="Ações"
  size={100}
  dataType="text"
  align="center"
  enableSorting={false}
  enableColumnFilter={false}
  render={(value) => (
    <Group gap={4} justify="center">
      <ActionIcon
        variant="subtle"
        onClick={() => handleEdit(value)}
      >
        <IconEdit size={16} />
      </ActionIcon>
      <ActionIcon
        variant="subtle"
        color="red"
        onClick={() => handleDelete(value)}
      >
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  )}
/>
```

### Coluna com Avatar

```typescript
<ArchbaseDataGridColumn
  dataField="name"
  header="Usuário"
  size={250}
  dataType="text"
  dataFieldAcessorFn={(row) => ({
    name: row.name,
    avatar: row.avatar
  })}
  render={(data) => (
    <Group gap="sm">
      <Avatar src={data.avatar} radius="xl" size="sm" />
      <Text size="sm">{data.name}</Text>
    </Group>
  )}
/>
```

## Exemplo Completo - ListView

```typescript
import { useState, useEffect, useRef, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Paper, Group, ActionIcon, Badge } from '@mantine/core'
import { IconEye, IconEdit, IconTrash } from '@tabler/icons-react'
import { modals } from '@mantine/modals'

import {
  ArchbaseDataGrid,
  ArchbaseDataGridColumn,
  Columns,
  ArchbaseDataSource
} from '@archbase/components'
import { ArchbasePanelTemplate, useArchbaseSize } from '@archbase/template'
import { useArchbaseRemoteServiceApi } from '@archbase/data'

import { API_TYPE } from '@ioc/IOCTypes'
import type { UserService } from '@services/UserService'
import type { UserDto } from '@domain/UserDto'

interface UserListViewProps {
  onNew: () => void
  onEdit: (id: string) => void
  onView: (id: string) => void
}

export function UserListView({ onNew, onEdit, onView }: UserListViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, height] = useArchbaseSize(ref)
  const safeHeight = height > 0 ? height - 200 : 400

  const queryClient = useQueryClient()
  const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)

  // DataSource
  const [dataSource] = useState(() =>
    new ArchbaseDataSource<UserDto, string>('dsUsers')
  )

  // Query para carregar dados
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.findAll(0, 100)
  })

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  // Carregar dados no DataSource
  useEffect(() => {
    if (data?.content) {
      dataSource.open({ records: data.content })
    }
  }, [data])

  // Handler de exclusão
  const handleDelete = (record: UserDto) => {
    modals.openConfirmModal({
      title: 'Confirmar exclusão',
      children: `Deseja excluir "${record.name}"?`,
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(record.id)
    })
  }

  return (
    <ArchbasePanelTemplate
      innerRef={ref}
      title="Usuários"
      isLoading={isLoading || deleteMutation.isPending}
      isError={isError}
      error={error}
      onNewRecord={onNew}
    >
      <Paper ref={ref} withBorder style={{ height: safeHeight }}>
        <ArchbaseDataGrid
          dataSource={dataSource}
          height={safeHeight - 20}
          isLoading={isLoading}
          highlightOnHover
          onCellDoubleClick={(params) => onEdit(params.id)}
        >
          <Columns>
            <ArchbaseDataGridColumn
              dataField="name"
              header="Nome"
              size={200}
              dataType="text"
            />
            <ArchbaseDataGridColumn
              dataField="email"
              header="E-mail"
              size={250}
              dataType="text"
            />
            <ArchbaseDataGridColumn
              dataField="active"
              header="Status"
              size={100}
              dataType="boolean"
              align="center"
              render={(value) => (
                <Badge color={value ? 'green' : 'red'}>
                  {value ? 'Ativo' : 'Inativo'}
                </Badge>
              )}
            />
            <ArchbaseDataGridColumn
              dataField="id"
              header="Ações"
              size={120}
              dataType="text"
              align="center"
              enableSorting={false}
              enableColumnFilter={false}
              render={(value) => {
                const record = dataSource.locateByFilter(r => r.id === value)
                return (
                  <Group gap={4} justify="center">
                    <ActionIcon variant="subtle" onClick={() => onView(value)}>
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" onClick={() => onEdit(value)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => record && handleDelete(record)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                )
              }}
            />
          </Columns>
        </ArchbaseDataGrid>
      </Paper>
    </ArchbasePanelTemplate>
  )
}
```

## Detail Panel

```typescript
<ArchbaseDataGrid
  dataSource={dataSource}
  height={500}
  renderDetailPanel={({ row }) => (
    <Box p="md">
      <Title order={5}>Detalhes de {row.name}</Title>
      <Text>Email: {row.email}</Text>
      <Text>Telefone: {row.phone}</Text>
    </Box>
  )}
  detailPanelDisplayMode="inline"  // 'auto' | 'inline' | 'modal' | 'drawer'
  detailPanelMinHeight={200}
  allowMultipleDetailPanels={false}
>
  <Columns>
    {/* colunas */}
  </Columns>
</ArchbaseDataGrid>
```

## Seleção de Linhas

```typescript
function UserGrid() {
  const [selectedRows, setSelectedRows] = useState<UserDto[]>([])

  return (
    <ArchbaseDataGrid
      dataSource={dataSource}
      height={400}
      enableRowSelection
      onSelectedRowsChanged={setSelectedRows}
    >
      <Columns>
        {/* colunas */}
      </Columns>
    </ArchbaseDataGrid>
  )
}
```

## Ações na Toolbar

```typescript
import { GridToolBarActions } from '@archbase/components'

<ArchbaseDataGrid
  dataSource={dataSource}
  height={400}
>
  <GridToolBarActions>
    <Button onClick={handleExport}>Exportar</Button>
    <Button onClick={handlePrint}>Imprimir</Button>
  </GridToolBarActions>
  <Columns>
    {/* colunas */}
  </Columns>
</ArchbaseDataGrid>
```

## Referência da Grid

```typescript
const gridRef = useRef<ArchbaseDataGridRef<UserDto>>(null)

// Usar métodos da grid
const handleExport = () => {
  gridRef.current?.exportData()
}

const handlePrint = () => {
  gridRef.current?.printData()
}

const getSelected = () => {
  const selected = gridRef.current?.getSelectedRows()
  console.log(selected)
}

<ArchbaseDataGrid
  dataSource={dataSource}
  height={400}
  gridRef={gridRef}
>
  {/* ... */}
</ArchbaseDataGrid>
```

## Resumo de Diferenças da Documentação Anterior

| Documentação Anterior (ERRADO) | Correto |
|-------------------------------|---------|
| `ArchbaseDataTable` | `ArchbaseDataGrid` |
| `caption` | `header` |
| `width` | `size` |
| `columns={[...]}` (array) | `<Columns><ArchbaseDataGridColumn /></Columns>` (children) |
| Sem `dataType` | `dataType` é OBRIGATÓRIO |
| `onRowDoubleClick` | `onCellDoubleClick` |
| `ArchbaseListTemplate` | `ArchbasePanelTemplate` ou `ArchbaseGridTemplate` |

## Dicas de Performance

1. **Altura Fixa**: Sempre defina `height` para virtualização
2. **Colunas com Size**: Defina tamanho para evitar recálculos
3. **Paginação Server-Side**: Use `manualPagination={true}` para grandes volumes
4. **Memoização**: Use `useMemo` para renderizadores complexos
