/**
 * Exemplo: List View com ArchbaseGridTemplate
 *
 * Padrão validado contra gestor-rq-admin (produção).
 *
 * IMPORTANTE:
 * - ArchbaseGridTemplate (não ArchbasePanelTemplate) para list views CRUD
 * - useArchbaseRemoteDataSourceV2 (não V1 + React Query)
 * - useElementSize do Mantine para altura do container
 * - Segurança com ArchbaseViewSecurityProvider + useSecureActions
 * - Colunas com <Columns> + useMemo
 */

import { useRef, useMemo, useState, type ReactNode } from 'react'
import { Paper, Badge } from '@mantine/core'
import { useElementSize, useDisclosure } from '@mantine/hooks'
import { IconCheckbox, IconSquare } from '@tabler/icons-react'

import {
  ArchbaseDataGrid,
  ArchbaseDataGridColumn,
  Columns,
  ArchbaseNotifications,
} from '@archbase/components'
import {
  ArchbaseGridTemplate,
  type ArchbaseGridTemplateRef,
} from '@archbase/template'
import {
  useArchbaseRemoteDataSourceV2,
  useArchbaseRemoteServiceApi,
} from '@archbase/data'
import {
  ArchbaseViewSecurityProvider,
  useArchbaseSecureForm,
} from '@archbase/security'
import { useArchbaseTranslation } from '@archbase/core'

import { API_TYPE } from '../../ioc/RapidexIOCTypes'
import type { UserService } from '../../services/UserService'
import type { UserDto } from '../../domain/user/UserDto'
import { APP_SECURITY_RESOURCES } from '../../hooks/useAppSecurity'

// ===========================================
// 1. VIEW EXTERNA: Wrapper de Segurança
// ===========================================
export function UserListView() {
  return (
    <ArchbaseViewSecurityProvider
      resourceName={APP_SECURITY_RESOURCES.USER.name}
      resourceDescription={APP_SECURITY_RESOURCES.USER.description}
    >
      <UserListViewContent />
    </ArchbaseViewSecurityProvider>
  )
}

// ===========================================
// 2. RENDER FUNCTIONS (fora do useMemo)
// ===========================================
const renderBoolean = (value?: boolean): ReactNode => {
  return value ? (
    <IconCheckbox size={24} color="green" stroke={2} />
  ) : (
    <IconSquare size={24} color="gray" stroke={2} />
  )
}

const statusColors: Record<string, string> = {
  ATIVO: 'green',
  INATIVO: 'gray',
  PENDENTE: 'yellow',
}

// ===========================================
// 3. VIEW INTERNA: Lógica e UI
// ===========================================
function UserListViewContent() {
  const { t } = useArchbaseTranslation()

  // Segurança
  const { canCreate, canEdit, canDelete, canView } = useArchbaseSecureForm(
    APP_SECURITY_RESOURCES.USER.name,
    APP_SECURITY_RESOURCES.USER.description,
  )

  // Refs e tamanho
  const templateRef = useRef<ArchbaseGridTemplateRef | null>(null)
  const { ref: containerRef, height: containerHeight } = useElementSize()

  // Modal de detalhes (opcional)
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false)
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null)

  // Service API via IoC
  const serviceApi = useArchbaseRemoteServiceApi<UserService>(API_TYPE.User)

  // DataSource V2 Remoto com paginação
  const {
    dataSource,
    isLoading,
    error,
    refreshData,
    remove,
  } = useArchbaseRemoteDataSourceV2<UserDto>({
    name: 'dsUsers',
    label: String(t('my-app:Usuários')),
    service: serviceApi,
    pageSize: 25,
    defaultSortFields: ['name'],
    onError: (err) => {
      ArchbaseNotifications.showError(
        String(t('my-app:Atenção')),
        String(err),
      )
    },
  })

  // Estado de erro local
  const [lastError, setLastError] = useState<string | null>(null)
  const handleClearError = () => setLastError(null)

  // Colunas com useMemo
  const columns: ReactNode = useMemo(() => {
    return (
      <Columns>
        <ArchbaseDataGridColumn<UserDto>
          dataField="name"
          dataType="text"
          header={String(t('my-app:Nome'))}
          inputFilterType="text"
          size={300}
        />
        <ArchbaseDataGridColumn<UserDto>
          dataField="email"
          dataType="text"
          header={String(t('my-app:E-mail'))}
          inputFilterType="text"
          size={250}
        />
        <ArchbaseDataGridColumn<UserDto>
          dataField="status"
          dataType="text"
          header={String(t('my-app:Status'))}
          size={120}
          align="center"
          render={(data) => (
            <Badge
              color={statusColors[data.getValue()] || 'gray'}
              variant="filled"
              size="md"
            >
              {data.getValue()}
            </Badge>
          )}
        />
        <ArchbaseDataGridColumn<UserDto>
          dataField="active"
          dataType="boolean"
          header={String(t('my-app:Ativo'))}
          size={80}
          align="center"
          render={(data) => renderBoolean(data.getValue())}
        />
      </Columns>
    )
  }, [t])

  // Handlers de navegação
  const handleAdd = () => {
    // navigate(`/users/new?action=add`)
  }

  const handleEdit = (row: UserDto) => {
    // navigate(`/users/${row.id}?action=edit`)
  }

  const handleView = (row: UserDto) => {
    // navigate(`/users/${row.id}?action=view`)
  }

  const handleRemove = async (row: UserDto) => {
    // Confirmação e remoção
  }

  const getRowId = (row: UserDto) => row.id

  // Row actions
  const userRowActions = {
    // Configurar ações por linha
  }

  return (
    <Paper
      p="md"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Paper
        ref={containerRef}
        withBorder
        style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
      >
        <ArchbaseGridTemplate<UserDto, string>
          ref={templateRef}
          title=""
          height={containerHeight}
          width={'100%'}
          dataSource={dataSource}
          pageSize={25}
          isLoading={isLoading}
          error={error || lastError}
          isError={Boolean(error || lastError)}
          clearError={handleClearError}
          withBorder={false}
          withToolbarBorder={true}
          withPaginationBorder={true}
          userActions={{
            visible: true,
            allowRemove: canDelete,
            onAddExecute: canCreate ? handleAdd : undefined,
            onEditExecute: canEdit ? () => handleEdit(dataSource.getCurrentRecord()!) : undefined,
            onRemoveExecute: canDelete ? () => handleRemove(dataSource.getCurrentRecord()!) : undefined,
            onViewExecute: canView ? () => handleView(dataSource.getCurrentRecord()!) : undefined,
          }}
          userRowActions={userRowActions}
          getRowId={getRowId}
          enableRowSelection={true}
          enableRowActions={true}
          columns={columns}
          filterType={'normal'}
          positionActionsColumn={'first'}
        />
      </Paper>
    </Paper>
  )
}

export default UserListView
