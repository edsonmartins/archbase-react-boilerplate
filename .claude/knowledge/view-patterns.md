# Archbase View Patterns - Guia Completo

## Padrão CRUD View

A estrutura padrão de CRUD no Archbase usa um componente gerenciador que controla qual tela exibir.

### Manager View (Controlador)

```typescript
import { useState } from 'react'

type ViewAction = 'LIST' | 'NEW' | 'EDIT' | 'VIEW'

export function UserManagerView() {
  const [action, setAction] = useState<ViewAction>('LIST')
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
    setSelectedId(null)
    setAction('LIST')
  }

  // Renderização condicional
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

### List View

```typescript
import { useState, useEffect, useRef } from 'react'
import { Paper, Group, ActionIcon, Badge } from '@mantine/core'
import { IconEye, IconEdit, IconTrash } from '@tabler/icons-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArchbaseDataSource } from '@archbase/data'
import { ArchbaseDataGrid, ArchbaseDataGridColumn, Columns } from '@archbase/components'
import { ArchbasePanelTemplate, useArchbaseSize } from '@archbase/template'
import { useArchbaseRemoteServiceApi } from '@archbase/data'
import { modals } from '@mantine/modals'

interface UserListViewProps {
  onNew: () => void
  onEdit: (id: string) => void
  onView: (id: string) => void
}

export function UserListView({ onNew, onEdit, onView }: UserListViewProps) {
  // CORRETO: useArchbaseSize retorna [width, height]
  const ref = useRef<HTMLDivElement>(null)
  const [width, height] = useArchbaseSize(ref)
  const safeHeight = height > 0 ? height - 200 : 400

  const queryClient = useQueryClient()
  const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)

  // DataSource para a lista - apenas nome no construtor
  const [dataSource] = useState(() =>
    new ArchbaseDataSource<UserDto, string>('dsUsers')
  )

  // Query para buscar dados
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.findAll()
  })

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  // Popular DataSource quando dados chegam - CORRETO: open() (não setData!)
  useEffect(() => {
    if (data) {
      dataSource.open({ records: data })
    }
  }, [data])

  // Handler de delete com confirmação
  const handleDelete = (record: UserDto) => {
    modals.openConfirmModal({
      title: 'Confirmar exclusão',
      children: `Deseja realmente excluir "${record.name}"?`,
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(record.id)
    })
  }

  // CORRETO: usar ArchbasePanelTemplate (não ArchbaseListTemplate!)
  return (
    <ArchbasePanelTemplate
      innerRef={ref}
      title="Usuários"
      dataSource={dataSource}
      isLoading={isLoading || deleteMutation.isPending}
      isError={isError}
      error={error}
      onNewRecord={onNew}
    >
      <Paper ref={ref} withBorder style={{ height: safeHeight }}>
        {/* CORRETO: ArchbaseDataGrid (não ArchbaseDataTable!) */}
        {/* CORRETO: usar children pattern com Columns */}
        <ArchbaseDataGrid
          dataSource={dataSource}
          height={safeHeight - 20}
          highlightOnHover
          onRowDoubleClick={(record) => onEdit(record.id)}
        >
          <Columns>
            {/* CORRETO: header (não caption), size (não width), dataType obrigatório */}
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
              render={(value: boolean) => (
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
              render={(_: string, record: UserDto) => (
                <Group gap={4} justify="center">
                  <ActionIcon
                    variant="subtle"
                    onClick={(e) => {
                      e.stopPropagation()
                      onView(record.id)
                    }}
                  >
                    <IconEye size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(record.id)
                    }}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(record)
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              )}
            />
          </Columns>
        </ArchbaseDataGrid>
      </Paper>
    </ArchbasePanelTemplate>
  )
}
```

## List View com Filtros

```typescript
import { TextInput, Select, Button, Collapse, Box } from '@mantine/core'
import { IconSearch, IconFilter } from '@tabler/icons-react'

export function UserListView({ onNew, onEdit, onView }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, height] = useArchbaseSize(ref)
  const safeHeight = height > 0 ? height - 200 : 400

  const [filters, setFilters] = useState({
    name: '',
    status: '',
    role: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.findAll(filters)
  })

  // CORRETO: open() (não setData!)
  useEffect(() => {
    if (data) {
      dataSource.open({ records: data })
    }
  }, [data])

  const handleFilter = () => {
    refetch()
  }

  const handleClearFilters = () => {
    setFilters({ name: '', status: '', role: '' })
  }

  // CORRETO: ArchbasePanelTemplate (não ArchbaseListTemplate!)
  return (
    <ArchbasePanelTemplate
      innerRef={ref}
      title="Usuários"
      dataSource={dataSource}
      isLoading={isLoading}
      onNewRecord={onNew}
      headerActions={
        <ActionIcon onClick={() => setShowFilters(!showFilters)}>
          <IconFilter size={20} />
        </ActionIcon>
      }
    >
      <Paper ref={ref} withBorder style={{ height: safeHeight }}>
        <Collapse in={showFilters}>
          <Box p="md" style={{ borderBottom: '1px solid #eee' }}>
            <Group grow mb="sm">
              <TextInput
                placeholder="Buscar por nome"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                leftSection={<IconSearch size={16} />}
              />
              <Select
                placeholder="Status"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value || '' })}
                data={[
                  { value: '', label: 'Todos' },
                  { value: 'ACTIVE', label: 'Ativo' },
                  { value: 'INACTIVE', label: 'Inativo' }
                ]}
                clearable
              />
            </Group>
            <Group justify="flex-end">
              <Button variant="subtle" onClick={handleClearFilters}>
                Limpar
              </Button>
              <Button onClick={handleFilter}>
                Filtrar
              </Button>
            </Group>
          </Box>
        </Collapse>

        {/* CORRETO: ArchbaseDataGrid com children pattern */}
        <ArchbaseDataGrid
          dataSource={dataSource}
          height={showFilters ? safeHeight - 120 : safeHeight - 20}
          highlightOnHover
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
          </Columns>
        </ArchbaseDataGrid>
      </Paper>
    </ArchbasePanelTemplate>
  )
}
```

## List View com Paginação Server-Side

```typescript
export function UserListView(props: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, height] = useArchbaseSize(ref)
  const safeHeight = height > 0 ? height - 200 : 400

  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, pageSize],
    queryFn: () => userService.findAllWithPage({
      page: page - 1,  // API usa 0-based
      size: pageSize
    })
  })

  // CORRETO: open() (não setData!)
  useEffect(() => {
    if (data?.content) {
      dataSource.open({ records: data.content })
    }
  }, [data])

  // CORRETO: ArchbasePanelTemplate (não ArchbaseListTemplate!)
  return (
    <ArchbasePanelTemplate innerRef={ref} {...props}>
      <Paper ref={ref} withBorder style={{ height: safeHeight }}>
        {/* CORRETO: ArchbaseDataGrid (não ArchbaseDataTable!) */}
        <ArchbaseDataGrid
          dataSource={dataSource}
          height={safeHeight - 60}
          // Paginação
          recordsPerPage={pageSize}
          page={page}
          onPageChange={setPage}
          totalRecords={data?.totalElements || 0}
          fetching={isLoading}
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
          </Columns>
        </ArchbaseDataGrid>
      </Paper>
    </ArchbasePanelTemplate>
  )
}
```

## List View com Seleção Múltipla

```typescript
export function UserListView(props: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, height] = useArchbaseSize(ref)
  const safeHeight = height > 0 ? height - 200 : 400

  const [selectedRecords, setSelectedRecords] = useState<UserDto[]>([])

  const handleBulkDelete = () => {
    const ids = selectedRecords.map(r => r.id)
    modals.openConfirmModal({
      title: 'Confirmar exclusão',
      children: `Deseja excluir ${ids.length} registros?`,
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await userService.bulkDelete(ids)
        queryClient.invalidateQueries({ queryKey: ['users'] })
        setSelectedRecords([])
      }
    })
  }

  // CORRETO: ArchbasePanelTemplate (não ArchbaseListTemplate!)
  return (
    <ArchbasePanelTemplate
      innerRef={ref}
      headerActions={
        selectedRecords.length > 0 && (
          <Button color="red" onClick={handleBulkDelete}>
            Excluir {selectedRecords.length} selecionados
          </Button>
        )
      }
      {...props}
    >
      <Paper ref={ref} withBorder style={{ height: safeHeight }}>
        {/* CORRETO: ArchbaseDataGrid (não ArchbaseDataTable!) */}
        <ArchbaseDataGrid
          dataSource={dataSource}
          height={safeHeight - 20}
          showSelection
          selectedRecords={selectedRecords}
          onSelectedRecordsChange={setSelectedRecords}
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
          </Columns>
        </ArchbaseDataGrid>
      </Paper>
    </ArchbasePanelTemplate>
  )
}
```

## View com Tabs de Navegação

```typescript
import { Tabs, Box } from '@mantine/core'

export function ConfigManagerView() {
  const [activeTab, setActiveTab] = useState<string | null>('users')

  return (
    <Box style={{ height: '100%' }}>
      <Tabs value={activeTab} onChange={setActiveTab} style={{ height: '100%' }}>
        <Tabs.List>
          <Tabs.Tab value="users">Usuários</Tabs.Tab>
          <Tabs.Tab value="roles">Perfis</Tabs.Tab>
          <Tabs.Tab value="permissions">Permissões</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="users" style={{ height: 'calc(100% - 40px)' }}>
          <UserManagerView />
        </Tabs.Panel>

        <Tabs.Panel value="roles" style={{ height: 'calc(100% - 40px)' }}>
          <RoleManagerView />
        </Tabs.Panel>

        <Tabs.Panel value="permissions" style={{ height: 'calc(100% - 40px)' }}>
          <PermissionManagerView />
        </Tabs.Panel>
      </Tabs>
    </Box>
  )
}
```

## Dashboard View

```typescript
import { Grid, Paper, Title, Text, Group, RingProgress, Box } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'

export function DashboardView() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats()
  })

  return (
    <Box p="md">
      <Title order={2} mb="lg">Dashboard</Title>

      <Grid>
        {/* Cards de estatísticas */}
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper withBorder p="md">
            <Text size="sm" c="dimmed">Total de Usuários</Text>
            <Text size="xl" fw={700}>{stats?.totalUsers || 0}</Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper withBorder p="md">
            <Text size="sm" c="dimmed">Usuários Ativos</Text>
            <Text size="xl" fw={700} c="green">{stats?.activeUsers || 0}</Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper withBorder p="md">
            <Text size="sm" c="dimmed">Pedidos Hoje</Text>
            <Text size="xl" fw={700}>{stats?.ordersToday || 0}</Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Paper withBorder p="md">
            <Text size="sm" c="dimmed">Receita Mensal</Text>
            <Text size="xl" fw={700}>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(stats?.monthlyRevenue || 0)}
            </Text>
          </Paper>
        </Grid.Col>

        {/* Gráficos */}
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Paper withBorder p="md" h={400}>
            <Title order={4} mb="md">Vendas por Mês</Title>
            {/* Componente de gráfico */}
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper withBorder p="md" h={400}>
            <Title order={4} mb="md">Status dos Pedidos</Title>
            <Group justify="center">
              <RingProgress
                sections={[
                  { value: 40, color: 'green' },
                  { value: 30, color: 'yellow' },
                  { value: 30, color: 'red' }
                ]}
                label={
                  <Text ta="center" size="lg" fw={700}>
                    {stats?.totalOrders || 0}
                  </Text>
                }
              />
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  )
}
```

## List View com ArchbaseGridTemplate (Padrão Avançado)

O `ArchbaseGridTemplate` é o template mais completo para views de listagem, com filtros, ações e paginação integrados.

```typescript
import { useRef, useMemo, useCallback, useState } from 'react'
import { Paper } from '@mantine/core'
import { useElementSize } from '@mantine/hooks'
import { ArchbaseGridTemplate, ArchbaseDataGridColumn, Columns, ArchbaseGridRowActions } from '@archbase/components'
import { useArchbaseRemoteDataSourceV2, useArchbaseRemoteServiceApi } from '@archbase/data'
import { ArchbaseViewSecurityProvider, useArchbaseSecureForm } from '@archbase/security'

const SECURITY_RESOURCE_NAME = 'modulo.entidade'
const SECURITY_RESOURCE_DESCRIPTION = 'Minha Entidade'

export function MinhaEntidadeView() {
  return (
    <ArchbaseViewSecurityProvider
      resourceName={SECURITY_RESOURCE_NAME}
      resourceDescription={SECURITY_RESOURCE_DESCRIPTION}
    >
      <MinhaEntidadeViewContent />
    </ArchbaseViewSecurityProvider>
  )
}

function MinhaEntidadeViewContent() {
  const containerRef = useRef(null)
  const templateRef = useRef(null)
  const { height: containerHeight } = useElementSize()
  const [lastError, setLastError] = useState<string | null>(null)

  const { canCreate, canEdit, canDelete, canView } = useArchbaseSecureForm(
    SECURITY_RESOURCE_NAME,
    SECURITY_RESOURCE_DESCRIPTION
  )

  const serviceApi = useArchbaseRemoteServiceApi<MinhaService>(API_TYPE.MinhaEntidade)

  const {
    dataSource,
    isLoading,
    error,
    refreshData,
    remove,
    currentRecord
  } = useArchbaseRemoteDataSourceV2<MinhaDto>({
    name: 'dsMinhaEntidade',
    label: 'Minha Entidade',
    service: serviceApi,
    pageSize: 25,
    defaultSortFields: ['-createdAt'],
    onError: (err) => {
      ArchbaseNotifications.showError('Atenção', err)
      setLastError(err)
    }
  })

  const handleClearError = useCallback(() => setLastError(null), [])

  const getRowId = useCallback((row: MinhaDto) => row.id || '', [])

  // Handlers de ação
  const handleAdd = useCallback(() => {
    navigate(`${MINHA_ENTIDADE_ROUTE}/${uniqueId()}`, {}, { action: 'ADD' })
  }, [navigate])

  const handleEdit = useCallback(() => {
    if (currentRecord) {
      navigate(`${MINHA_ENTIDADE_ROUTE}/${currentRecord.id}`, {}, { action: 'EDIT' })
    }
  }, [currentRecord, navigate])

  const handleView = useCallback(() => {
    if (currentRecord) {
      navigate(`${MINHA_ENTIDADE_ROUTE}/${currentRecord.id}`, {}, { action: 'VIEW' })
    }
  }, [currentRecord, navigate])

  const handleRemove = useCallback(() => {
    if (currentRecord) {
      ArchbaseDialog.showConfirmDialogYesNo(
        'Confirme',
        `Deseja remover "${currentRecord.nome}"?`,
        () => remove(),
        () => {}
      )
    }
  }, [currentRecord, remove])

  // Row actions
  const userRowActions: UserRowActionsOptions<MinhaDto> = {
    actions: ArchbaseGridRowActions,
    onAddRow: canCreate ? handleAdd : undefined,
    onEditRow: canEdit ? handleEdit : undefined,
    onRemoveRow: canDelete ? handleRemove : undefined,
    onViewRow: canView ? handleView : undefined
  }

  // Colunas memoizadas
  const columns = useMemo(() => (
    <Columns>
      <ArchbaseDataGridColumn<MinhaDto>
        dataField="codigo"
        header="Código"
        size={120}
        dataType="text"
      />
      <ArchbaseDataGridColumn<MinhaDto>
        dataField="nome"
        header="Nome"
        size={300}
        dataType="text"
      />
      <ArchbaseDataGridColumn<MinhaDto>
        dataField="status"
        header="Status"
        size={120}
        dataType="text"
        render={(data) => <StatusBadge status={data.getValue()} />}
      />
    </Columns>
  ), [])

  return (
    <Paper p="md" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper ref={containerRef} withBorder style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <ArchbaseGridTemplate<MinhaDto, string>
          ref={templateRef}
          title=""
          height={containerHeight}
          width="100%"
          dataSource={dataSource}
          pageSize={25}
          isLoading={isLoading}
          error={error || lastError}
          isError={Boolean(error || lastError)}
          clearError={handleClearError}
          withBorder={false}
          filterOptions={{
            activeFilterIndex: 0,
            enabledAdvancedFilter: false,
            apiVersion: '1.00',
            componentName: 'minhaEntidadeFilter',
            viewName: 'MinhaEntidadeView'
          }}
          userActions={{
            visible: true,
            allowRemove: canDelete,
            onAddExecute: canCreate ? handleAdd : undefined,
            onEditExecute: canEdit ? handleEdit : undefined,
            onRemoveExecute: canDelete ? handleRemove : undefined,
            onViewExecute: canView ? handleView : undefined
          }}
          userRowActions={userRowActions}
          getRowId={getRowId}
          enableRowSelection={true}
          enableRowActions={true}
          columns={columns}
          filterType="normal"
          positionActionsColumn="first"
        />
      </Paper>
    </Paper>
  )
}
```

## Registro na Navegação

```typescript
// src/navigation/navigationData.tsx
import { UserManagerView } from '@views/users/UserManagerView'
import { IconUsers } from '@tabler/icons-react'

export const navigationData: ArchbaseNavigationItem[] = [
  {
    id: 'users',
    label: 'Usuários',
    link: '/users',
    icon: <IconUsers size={20} />,
    component: <UserManagerView />
  }
]
```

## Resumo de Correções Críticas

| Errado | Correto |
|--------|---------|
| `ArchbaseListTemplate` | `ArchbasePanelTemplate` |
| `ArchbaseDataTable` | `ArchbaseDataGrid` |
| `{ ref, height } = useArchbaseSize()` | `[width, height] = useArchbaseSize(ref)` com `ref = useRef()` |
| `dataSource.setData(data)` | `dataSource.open({ records: data })` |
| `columns={[...]}` prop | `<Columns><ArchbaseDataGridColumn /></Columns>` children |
| `caption` | `header` |
| `width` | `size` |
| (sem dataType) | `dataType` obrigatório |

## Checklist de View

- [ ] Manager View controlando action e selectedId
- [ ] List View com DataSource próprio (apenas nome no construtor)
- [ ] Usar `useRef()` e `useArchbaseSize(ref)` que retorna `[width, height]`
- [ ] Usar `ArchbasePanelTemplate` (não ArchbaseListTemplate)
- [ ] Usar `ArchbaseDataGrid` com children pattern (não ArchbaseDataTable)
- [ ] Colunas com `header`, `size` e `dataType` obrigatórios
- [ ] Query para buscar dados
- [ ] Effect para popular DataSource com `open({ records })` (não `setData`)
- [ ] Mutation para delete com confirmação
- [ ] Colunas com ações (view, edit, delete)
- [ ] Duplo clique para editar
- [ ] Loading states
- [ ] Error handling
- [ ] Registro na navegação
