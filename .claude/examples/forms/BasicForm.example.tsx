/**
 * Exemplo: Formulário com Archbase (Padrão V2)
 *
 * Padrão validado contra gestor-rq-admin (produção).
 *
 * IMPORTANTE:
 * - useArchbaseRemoteDataSourceV2 (não V1 + React Query)
 * - loadedIdRef para controle de carregamento por ID
 * - ValidationErrorsProvider envolvendo o form
 * - Tabs com flex layout para height management
 * - action.toUpperCase() para comparação case-insensitive
 * - ArchbaseViewSecurityProvider + useArchbaseSecureForm
 */

import { useEffect, useRef } from 'react'
import { Stack, LoadingOverlay, Tabs } from '@mantine/core'
import { IconFileText } from '@tabler/icons-react'
import { useParams } from 'react-router'
import { useSearchParams } from 'react-router-dom'

import {
  ArchbaseEdit,
  ArchbaseSwitch,
  ArchbaseSelect,
  ArchbaseNotifications,
  ArchbaseDialog,
} from '@archbase/components'
import { ArchbaseFormTemplate } from '@archbase/template'
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
import { useLocation } from 'react-router'

import { API_TYPE } from '../../ioc/RapidexIOCTypes'
import type { UserService } from '../../services/UserService'
import { UserDto, StatusUserValues } from '../../domain/user/UserDto'
import { APP_SECURITY_RESOURCES } from '../../hooks/useAppSecurity'

const SECURITY_RESOURCE_NAME = APP_SECURITY_RESOURCES.USER.name
const SECURITY_RESOURCE_DESCRIPTION = APP_SECURITY_RESOURCES.USER.description

// ===========================================
// 1. VIEW EXTERNA: Wrapper de Segurança
// ===========================================
export function UserForm() {
  return (
    <ArchbaseViewSecurityProvider
      resourceName={SECURITY_RESOURCE_NAME}
      resourceDescription={SECURITY_RESOURCE_DESCRIPTION}
    >
      <UserFormContent />
    </ArchbaseViewSecurityProvider>
  )
}

// ===========================================
// 2. VIEW INTERNA: Lógica e UI
// ===========================================
function UserFormContent() {
  const { t } = useArchbaseTranslation()
  const location = useLocation()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const action = searchParams.get('action') || ''
  const validator = useArchbaseValidator()

  // Store com nome fixo (NÃO usar ID dinâmico!)
  const templateStore = useArchbaseStore('userFormStore')
  const { closeAllowed } = useArchbaseNavigationListener(location.pathname, () => {
    templateStore.clearAllValues()
    closeAllowed()
  })

  // Segurança
  const { canCreate, canEdit } = useArchbaseSecureForm(
    SECURITY_RESOURCE_NAME,
    SECURITY_RESOURCE_DESCRIPTION,
  )

  // Comparação case-insensitive (CRÍTICO!)
  const isAddAction = action.toUpperCase() === 'ADD'
  const isEditAction = action.toUpperCase() === 'EDIT'
  const isViewAction = action.toUpperCase() === 'VIEW'
  const canSave = isAddAction ? canCreate : isEditAction ? canEdit : false

  // Service API via IoC
  const serviceApi = useArchbaseRemoteServiceApi<UserService>(API_TYPE.User)

  // DataSource V2 (RECOMENDADO - sem cast!)
  const { dataSource, isLoading } = useArchbaseRemoteDataSourceV2<UserDto>({
    name: 'dsUser',
    label: String(t('my-app:Usuário')),
    service: serviceApi,
    pageSize: 50,
    defaultSortFields: ['name'],
    validator,
    onError: (error) => {
      ArchbaseNotifications.showError(String(t('my-app:Atenção')), error)
    },
  })

  // Flag para garantir que loadRecord só execute uma vez por ID
  const loadedIdRef = useRef<string | null>(null)

  // Carrega o registro (protegido contra re-execução)
  useEffect(() => {
    if (loadedIdRef.current === (id || 'new')) return
    loadedIdRef.current = id || 'new'

    const loadRecord = async () => {
      if (isAddAction) {
        dataSource.setRecords([])
        const newRecord = UserDto.newInstance()
        dataSource.insert(newRecord)
      } else if ((isEditAction || isViewAction) && id) {
        try {
          const record = await serviceApi.findOne(id)
          const dto = new UserDto(record)
          dataSource.setRecords([dto])
          if (isEditAction) {
            dataSource.edit()
          }
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

  // Handlers
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
          if (!dataSource.isBrowsing()) {
            dataSource.cancel()
          }
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

  // Render
  return (
    <ValidationErrorsProvider>
      <ArchbaseFormTemplate
        title={
          isAddAction
            ? String(t('my-app:Novo Usuário'))
            : isEditAction
              ? String(t('my-app:Editar Usuário'))
              : String(t('my-app:Visualizar Usuário'))
        }
        dataSource={dataSource}
        onCancel={handleCancel}
        onAfterSave={handleAfterSave}
        withBorder={false}
      >
        <LoadingOverlay visible={isLoading} />
        <Tabs
          variant="pills"
          defaultValue="dados"
          style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Tabs.List style={{ flexShrink: 0 }}>
            <Tabs.Tab value="dados" leftSection={<IconFileText size={16} />}>
              {String(t('my-app:Dados Gerais'))}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel
            value="dados"
            style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
          >
            <Stack gap="md" p="md">
              <ArchbaseEdit<UserDto, string>
                label={String(t('my-app:Nome'))}
                dataSource={dataSource}
                dataField="name"
                placeholder={String(t('my-app:Digite o nome'))}
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

export default UserForm
