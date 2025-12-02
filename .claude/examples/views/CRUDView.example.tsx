/**
 * Exemplo: CRUD View Completa
 *
 * Este exemplo demonstra o padrão completo de CRUD
 * com Manager View controlando List e Form.
 *
 * IMPORTANTE: Este exemplo usa as APIs corretas da biblioteca archbase-react-v3
 */

import { useState, useRef, useEffect } from 'react'
import { Paper, Group, ActionIcon, Badge, Box } from '@mantine/core'
import { IconEye, IconEdit, IconTrash } from '@tabler/icons-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { modals } from '@mantine/modals'

// CORRETO: importar ArchbaseDataGrid, não ArchbaseDataTable
import {
  ArchbaseDataSource,
  ArchbaseDataGrid,
  ArchbaseDataGridColumn,
  Columns,
  ArchbaseValidator,
  ArchbaseEdit,
  ArchbaseSwitch
} from '@archbase/components'
// CORRETO: usar ArchbasePanelTemplate (não ArchbaseListTemplate)
import { ArchbaseFormTemplate, ArchbasePanelTemplate, useArchbaseSize } from '@archbase/template'
import { useArchbaseRemoteServiceApi } from '@archbase/data'

import { API_TYPE } from '@ioc/IOCTypes'
import type { UserService } from '@services/UserService'
import type { UserDto } from '@domain/UserDto'

// ===========================================
// TIPOS
// ===========================================
type ViewAction = 'LIST' | 'NEW' | 'EDIT' | 'VIEW'

// ===========================================
// MANAGER VIEW (CONTROLADOR)
// ===========================================
export function UserManagerView() {
  // Estado do controlador
  const [action, setAction] = useState<ViewAction>('LIST')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Handlers de navegação
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
      id={selectedId || undefined}
      action={action as 'NEW' | 'EDIT' | 'VIEW'}
      onClose={handleClose}
    />
  )
}

// ===========================================
// LIST VIEW
// ===========================================
interface UserListViewProps {
  onNew: () => void
  onEdit: (id: string) => void
  onView: (id: string) => void
}

function UserListView({ onNew, onEdit, onView }: UserListViewProps) {
  // CORRETO: useArchbaseSize retorna [width, height]
  const ref = useRef<HTMLDivElement>(null)
  const [width, height] = useArchbaseSize(ref)
  const safeHeight = height > 0 ? height - 200 : 400

  const queryClient = useQueryClient()
  const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)

  // CORRETO: construtor simples
  const [dataSource] = useState(() =>
    new ArchbaseDataSource<UserDto, string>('dsUsers')
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.findAll(0, 100)
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })

  useEffect(() => {
    // CORRETO: usar open(), não setData()
    if (data?.content) {
      dataSource.open({ records: data.content })
    }
  }, [data])

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
    // CORRETO: usar ArchbasePanelTemplate (não ArchbaseListTemplate)
    <ArchbasePanelTemplate
      innerRef={ref}
      title="Usuários"
      isLoading={isLoading || deleteMutation.isPending}
      isError={isError}
      error={error}
      onNewRecord={onNew}
    >
      <Paper ref={ref} withBorder style={{ height: safeHeight }}>
        {/* CORRETO: ArchbaseDataGrid com children pattern */}
        <ArchbaseDataGrid
          dataSource={dataSource}
          height={safeHeight - 20}
          highlightOnHover
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
              dataField="active"
              header="Status"
              size={100}
              dataType="boolean"
              align="center"
              render={(value: boolean) => (
                <Badge color={value ? 'green' : 'red'}>{value ? 'Ativo' : 'Inativo'}</Badge>
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
              render={(id: string) => {
                const record = dataSource.locateByFilter(r => r.id === id)
                return (
                  <Group gap={4} justify="center">
                    <ActionIcon variant="subtle" onClick={() => onView(id)}>
                      <IconEye size={16} />
                    </ActionIcon>
                    <ActionIcon variant="subtle" onClick={() => onEdit(id)}>
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

// ===========================================
// FORM
// ===========================================
interface UserFormProps {
  id?: string
  action: 'NEW' | 'EDIT' | 'VIEW'
  onClose: () => void
}

function UserForm({ id, action, onClose }: UserFormProps) {
  // CORRETO: useArchbaseSize retorna [width, height]
  const ref = useRef<HTMLDivElement>(null)
  const [width, height] = useArchbaseSize(ref)
  const safeHeight = height > 0 ? height - 130 : 600

  // CORRETO: construtor simples + setValidator
  const [dataSource] = useState(() => {
    const ds = new ArchbaseDataSource<UserDto, string>('dsUser')
    ds.setValidator(new ArchbaseValidator())
    return ds
  })

  const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)
  const queryClient = useQueryClient()

  // CORRETO: usar findOne, não findById
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.findOne(id!),
    enabled: !!id && action !== 'NEW'
  })

  const saveMutation = useMutation({
    mutationFn: (user: UserDto) => userService.save(user),
    onSuccess: () => {
      // CORRETO: usar save(), não post()
      dataSource.save()
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onClose()
    }
  })

  useEffect(() => {
    if (data) {
      // CORRETO: usar open(), não setData()
      dataSource.open({ records: [data] })
      if (action === 'EDIT') dataSource.edit()
    } else if (action === 'NEW') {
      // CORRETO: usar insert(), não append()
      dataSource.insert({ active: true } as UserDto)
    }
  }, [data, action])

  const handleSave = async () => {
    const errors = dataSource.validate()
    if (errors && errors.length > 0) return
    const current = dataSource.getCurrentRecord()
    if (current) {
      saveMutation.mutate(current)
    }
  }

  const isViewOnly = action === 'VIEW'

  return (
    <ArchbaseFormTemplate
      innerRef={ref}
      title={action === 'NEW' ? 'Novo Usuário' : 'Editar Usuário'}
      dataSource={dataSource}
      isLoading={isLoading || saveMutation.isPending}
      isError={isError}
      error={error}
      onCancel={onClose}
      onBeforeSave={handleSave}
    >
      <Paper ref={ref} withBorder style={{ height: safeHeight }}>
        <Box p="md">
          <Group grow mb="md">
            <ArchbaseEdit dataSource={dataSource} dataField="name" label="Nome" required readOnly={isViewOnly} />
            <ArchbaseEdit dataSource={dataSource} dataField="email" label="E-mail" required readOnly={isViewOnly} />
          </Group>
          <ArchbaseSwitch dataSource={dataSource} dataField="active" label="Ativo" readOnly={isViewOnly} />
        </Box>
      </Paper>
    </ArchbaseFormTemplate>
  )
}

// ===========================================
// EXPORTAÇÃO
// ===========================================
export default UserManagerView
