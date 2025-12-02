/**
 * Exemplo: List View com Archbase
 *
 * Este exemplo demonstra como criar uma view de listagem
 * com ArchbaseDataGrid, filtros e ações.
 *
 * IMPORTANTE: Este exemplo usa as APIs corretas da biblioteca archbase-react-v3
 * - ArchbaseDataGrid (não ArchbaseDataTable)
 * - Colunas com children pattern (não array)
 * - header (não caption), size (não width), dataType obrigatório
 */

import { useState, useEffect, useRef } from 'react'
import { Paper, Group, ActionIcon, Badge, TextInput, Select, Button, Box, Collapse } from '@mantine/core'
import { IconEye, IconEdit, IconTrash, IconSearch, IconFilter } from '@tabler/icons-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { modals } from '@mantine/modals'

// CORRETO: importar ArchbaseDataGrid, não ArchbaseDataTable
import {
  ArchbaseDataSource,
  ArchbaseDataGrid,
  ArchbaseDataGridColumn,
  Columns
} from '@archbase/components'
import { ArchbasePanelTemplate, useArchbaseSize } from '@archbase/template'
import { useArchbaseRemoteServiceApi } from '@archbase/data'

import { API_TYPE } from '@ioc/IOCTypes'
import type { UserService } from '@services/UserService'
import type { UserDto } from '@domain/UserDto'

// ===========================================
// TIPOS
// ===========================================
interface UserListViewProps {
  onNew: () => void
  onEdit: (id: string) => void
  onView: (id: string) => void
}

// ===========================================
// COMPONENTE
// ===========================================
export function UserListView({ onNew, onEdit, onView }: UserListViewProps) {
  // ------------------------------------------
  // Hooks - CORRETO: useArchbaseSize retorna [width, height]
  // ------------------------------------------
  const ref = useRef<HTMLDivElement>(null)
  const [width, height] = useArchbaseSize(ref)
  const safeHeight = height > 0 ? height - 200 : 400

  const queryClient = useQueryClient()
  const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)

  // ------------------------------------------
  // Estado local
  // ------------------------------------------
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    name: '',
    status: ''
  })

  // ------------------------------------------
  // DataSource - CORRETO: construtor simples
  // ------------------------------------------
  const [dataSource] = useState(() =>
    new ArchbaseDataSource<UserDto, string>('dsUsers')
  )

  // ------------------------------------------
  // Query para buscar dados
  // ------------------------------------------
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.findAll(0, 100)
  })

  // ------------------------------------------
  // Mutation para deletar
  // ------------------------------------------
  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  // ------------------------------------------
  // Effect para popular DataSource
  // CORRETO: usar open(), não setData()
  // ------------------------------------------
  useEffect(() => {
    if (data?.content) {
      dataSource.open({ records: data.content })
    }
  }, [data])

  // ------------------------------------------
  // Handlers
  // ------------------------------------------
  const handleDelete = (record: UserDto) => {
    modals.openConfirmModal({
      title: 'Confirmar exclusão',
      children: `Deseja realmente excluir o usuário "${record.name}"?`,
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(record.id)
    })
  }

  const handleClearFilters = () => {
    setFilters({ name: '', status: '' })
  }

  // ------------------------------------------
  // Altura ajustada com filtros
  // ------------------------------------------
  const gridHeight = showFilters ? safeHeight - 100 : safeHeight - 20

  // ------------------------------------------
  // Render
  // CORRETO: usar ArchbasePanelTemplate (não ArchbaseListTemplate)
  // ------------------------------------------
  return (
    <ArchbasePanelTemplate
      innerRef={ref}
      title="Usuários"
      isLoading={isLoading || deleteMutation.isPending}
      isError={isError}
      error={error}
      onNewRecord={onNew}
      headerActions={
        <Group gap="sm">
          <ActionIcon
            variant={showFilters ? 'filled' : 'subtle'}
            onClick={() => setShowFilters(!showFilters)}
            title="Filtros"
          >
            <IconFilter size={20} />
          </ActionIcon>
        </Group>
      }
    >
      <Paper ref={ref} withBorder style={{ height: safeHeight }}>
        {/* Área de Filtros */}
        <Collapse in={showFilters}>
          <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
            <Group grow mb="sm">
              <TextInput
                placeholder="Buscar por nome..."
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
                  { value: 'true', label: 'Ativos' },
                  { value: 'false', label: 'Inativos' }
                ]}
                clearable
              />
            </Group>
            <Group justify="flex-end">
              <Button variant="subtle" onClick={handleClearFilters}>
                Limpar Filtros
              </Button>
              <Button onClick={() => refetch()}>
                Aplicar Filtros
              </Button>
            </Group>
          </Box>
        </Collapse>

        {/* Grid de Dados */}
        {/* CORRETO: ArchbaseDataGrid com children pattern */}
        <ArchbaseDataGrid
          dataSource={dataSource}
          height={gridHeight}
          highlightOnHover
          striped
          onCellDoubleClick={(params) => onEdit(params.id)}
        >
          <Columns>
            {/* CORRETO: usar header (não caption), size (não width), dataType obrigatório */}
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
              dataField="phone"
              header="Telefone"
              size={150}
              dataType="text"
            />
            <ArchbaseDataGridColumn
              dataField="active"
              header="Status"
              size={100}
              dataType="boolean"
              align="center"
              render={(value: boolean) => (
                <Badge color={value ? 'green' : 'red'} size="sm">
                  {value ? 'Ativo' : 'Inativo'}
                </Badge>
              )}
            />
            <ArchbaseDataGridColumn
              dataField="createdAt"
              header="Criado em"
              size={150}
              dataType="date"
            />
            <ArchbaseDataGridColumn
              dataField="id"
              header="Ações"
              size={120}
              dataType="text"
              align="center"
              enableSorting={false}
              enableColumnFilter={false}
              render={(id: string) => {
                const record = dataSource.locateByFilter(r => r.id === id)
                return (
                  <Group gap={4} justify="center">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => onView(id)}
                      title="Visualizar"
                    >
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="yellow"
                      onClick={() => onEdit(id)}
                      title="Editar"
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => record && handleDelete(record)}
                      title="Excluir"
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

export default UserListView
