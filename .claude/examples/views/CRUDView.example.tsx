/**
 * Exemplo: CRUD View Completa (List + Form)
 *
 * Padrão validado contra gestor-rq-admin (produção).
 *
 * Em produção, list view e form são componentes separados em arquivos diferentes.
 * Este exemplo mostra o padrão completo em um único arquivo para referência.
 *
 * Estrutura recomendada:
 * src/views/users/
 * ├── UserListView.tsx    # Lista com ArchbaseGridTemplate
 * └── UserForm.tsx        # Formulário com ArchbaseFormTemplate
 */

import { useRef, useMemo, useEffect, useState, type ReactNode } from 'react'
import { Paper, Badge, Stack, LoadingOverlay, Tabs } from '@mantine/core'
import { useElementSize, useDisclosure } from '@mantine/hooks'
import { IconFileText } from '@tabler/icons-react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router'

import {
  ArchbaseDataGridColumn,
  Columns,
  ArchbaseEdit,
  ArchbaseSwitch,
  ArchbaseSelect,
  ArchbaseNotifications,
  ArchbaseDialog,
} from '@archbase/components'
import {
  ArchbaseFormTemplate,
  ArchbaseGridTemplate,
  type ArchbaseGridTemplateRef,
} from '@archbase/template'
import {
  useArchbaseRemoteDataSourceV2,
  useArchbaseRemoteServiceApi,
  useArchbaseStore,
} from '@archbase/data'
import {
  useArchbaseValidator,
  useArchbaseTranslation,
  ValidationErrorsProvider,
} from '@archbase/core'
import {
  ArchbaseViewSecurityProvider,
  useArchbaseSecureForm,
} from '@archbase/security'
import { useArchbaseNavigationListener } from '@archbase/admin'

import { API_TYPE } from '../../ioc/RapidexIOCTypes'
import type { UserService } from '../../services/UserService'
import { UserDto, StatusUserValues } from '../../domain/user/UserDto'

// ===========================================
// CONSTANTES DE SEGURANÇA
// ===========================================
const APP_SECURITY_RESOURCES = {
  USER: { name: 'admin.user', description: 'Usuários' },
}

// ===========================================
// LIST VIEW
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

function UserListViewContent() {
  const { t } = useArchbaseTranslation()
  const navigate = useNavigate()

  // Segurança
  const { canCreate, canEdit, canDelete, canView } = useArchbaseSecureForm(
    APP_SECURITY_RESOURCES.USER.name,
    APP_SECURITY_RESOURCES.USER.description,
  )

  // Container height via Mantine useElementSize
  const templateRef = useRef<ArchbaseGridTemplateRef | null>(null)
  const { ref: containerRef, height: containerHeight } = useElementSize()

  // Service e DataSource V2
  const serviceApi = useArchbaseRemoteServiceApi<UserService>(API_TYPE.User)
  const { dataSource, isLoading, error, refreshData } =
    useArchbaseRemoteDataSourceV2<UserDto>({
      name: 'dsUsers',
      label: String(t('my-app:Usuários')),
      service: serviceApi,
      pageSize: 25,
      defaultSortFields: ['name'],
    })

  // Colunas com useMemo
  const columns: ReactNode = useMemo(
    () => (
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
          size={250}
        />
        <ArchbaseDataGridColumn<UserDto>
          dataField="status"
          dataType="text"
          header={String(t('my-app:Status'))}
          size={120}
          align="center"
          render={(data) => (
            <Badge color={data.getValue() === 'ATIVO' ? 'green' : 'gray'}>
              {data.getValue()}
            </Badge>
          )}
        />
      </Columns>
    ),
    [t],
  )

  // Handlers
  const handleAdd = () => navigate('/users/new?action=add')
  const handleEdit = () => {
    const record = dataSource.getCurrentRecord()
    if (record) navigate(`/users/${record.id}?action=edit`)
  }
  const handleView = () => {
    const record = dataSource.getCurrentRecord()
    if (record) navigate(`/users/${record.id}?action=view`)
  }
  const handleRemove = () => {
    // Implementar confirmação e remoção
  }
  const getRowId = (row: UserDto) => row.id

  return (
    <Paper p="md" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper ref={containerRef} withBorder style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <ArchbaseGridTemplate<UserDto, string>
          ref={templateRef}
          title=""
          height={containerHeight}
          width={'100%'}
          dataSource={dataSource}
          pageSize={25}
          isLoading={isLoading}
          error={error}
          isError={Boolean(error)}
          withBorder={false}
          userActions={{
            visible: true,
            allowRemove: canDelete,
            onAddExecute: canCreate ? handleAdd : undefined,
            onEditExecute: canEdit ? handleEdit : undefined,
            onRemoveExecute: canDelete ? handleRemove : undefined,
            onViewExecute: canView ? handleView : undefined,
          }}
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

// ===========================================
// FORM VIEW
// ===========================================
export function UserForm() {
  return (
    <ArchbaseViewSecurityProvider
      resourceName={APP_SECURITY_RESOURCES.USER.name}
      resourceDescription={APP_SECURITY_RESOURCES.USER.description}
    >
      <UserFormContent />
    </ArchbaseViewSecurityProvider>
  )
}

function UserFormContent() {
  const { t } = useArchbaseTranslation()
  const location = useLocation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const action = searchParams.get('action') || ''
  const validator = useArchbaseValidator()

  const templateStore = useArchbaseStore('userFormStore')
  const { closeAllowed } = useArchbaseNavigationListener(location.pathname, () => {
    templateStore.clearAllValues()
    closeAllowed()
  })

  const { canCreate, canEdit } = useArchbaseSecureForm(
    APP_SECURITY_RESOURCES.USER.name,
    APP_SECURITY_RESOURCES.USER.description,
  )

  // Comparação case-insensitive!
  const isAddAction = action.toUpperCase() === 'ADD'
  const isEditAction = action.toUpperCase() === 'EDIT'
  const isViewAction = action.toUpperCase() === 'VIEW'

  const serviceApi = useArchbaseRemoteServiceApi<UserService>(API_TYPE.User)
  const { dataSource, isLoading } = useArchbaseRemoteDataSourceV2<UserDto>({
    name: 'dsUser',
    label: String(t('my-app:Usuário')),
    service: serviceApi,
    pageSize: 50,
    validator,
  })

  // Controle de carregamento por ID
  const loadedIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (loadedIdRef.current === (id || 'new')) return
    loadedIdRef.current = id || 'new'

    const loadRecord = async () => {
      if (isAddAction) {
        dataSource.setRecords([])
        dataSource.insert(UserDto.newInstance())
      } else if ((isEditAction || isViewAction) && id) {
        try {
          const record = await serviceApi.findOne(id)
          dataSource.setRecords([new UserDto(record)])
          if (isEditAction) dataSource.edit()
        } catch (error: any) {
          ArchbaseNotifications.showError(
            String(t('my-app:Atenção')),
            String(error),
          )
        }
      }
    }
    loadRecord()
  }, [id])

  const handleAfterSave = () => {
    templateStore.clearAllValues()
    closeAllowed()
  }

  const handleCancel = () => {
    if (!isViewAction) {
      ArchbaseDialog.showConfirmDialogYesNo(
        String(t('my-app:Confirme')),
        String(t('my-app:Deseja cancelar?')),
        () => {
          if (!dataSource.isBrowsing()) dataSource.cancel()
          templateStore.clearAllValues()
          closeAllowed()
        },
        () => {},
      )
    } else {
      templateStore.clearAllValues()
      closeAllowed()
    }
  }

  return (
    <ValidationErrorsProvider>
      <ArchbaseFormTemplate
        title={isAddAction ? String(t('my-app:Novo Usuário')) : String(t('my-app:Editar Usuário'))}
        dataSource={dataSource}
        onCancel={handleCancel}
        onAfterSave={handleAfterSave}
        withBorder={false}
      >
        <LoadingOverlay visible={isLoading} />
        <Tabs
          variant="pills"
          defaultValue="dados"
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <Tabs.List style={{ flexShrink: 0 }}>
            <Tabs.Tab value="dados" leftSection={<IconFileText size={16} />}>
              {String(t('my-app:Dados Gerais'))}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="dados" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <Stack gap="md" p="md">
              <ArchbaseEdit<UserDto, string>
                label={String(t('my-app:Nome'))}
                dataSource={dataSource}
                dataField="name"
                required
              />
              <ArchbaseEdit<UserDto, string>
                label={String(t('my-app:E-mail'))}
                dataSource={dataSource}
                dataField="email"
                width={350}
              />
              <ArchbaseSelect<UserDto, string>
                label={String(t('my-app:Status'))}
                dataSource={dataSource}
                dataField="status"
                options={StatusUserValues}
                getOptionLabel={(opt) => opt.label}
                getOptionValue={(opt) => opt.value}
                width={250}
              />
              <ArchbaseSwitch<UserDto, boolean>
                label={String(t('my-app:Ativo'))}
                dataSource={dataSource}
                dataField="active"
              />
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </ArchbaseFormTemplate>
    </ValidationErrorsProvider>
  )
}

export default UserListView
