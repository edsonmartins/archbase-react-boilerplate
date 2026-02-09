/**
 * TEMPLATE: Manager View (CRUD Completo)
 *
 * Este template demonstra o padrão recomendado para criar uma view
 * completa de gerenciamento com:
 * - Lista (List View)
 * - Formulário (Form View)
 * - Controle de navegação entre telas
 *
 * Substitua:
 * - Entity -> Nome da sua entidade (ex: User, Product, Order)
 * - EntityDto -> DTO da entidade
 */

import { useState } from 'react'

// TODO: Importar seus componentes
// import { EntityListView } from './EntityListView'
// import { EntityForm } from './EntityForm'

// =============================================================================
// TIPOS
// =============================================================================

type ViewAction = 'LIST' | 'NEW' | 'EDIT' | 'VIEW'

interface EntityDto {
  id: string
  name: string
}

// =============================================================================
// MANAGER VIEW - CONTROLADOR PRINCIPAL
// =============================================================================

/**
 * Manager View que controla a navegação entre List e Form.
 *
 * Este padrão é útil quando você quer manter tudo em uma única rota
 * e controlar a exibição via estado interno.
 *
 * Para navegação via rotas separadas, use o padrão com useNavigate
 * demonstrado nos outros templates.
 */
export function EntityManagerView() {
  // ============================================
  // ESTADO DE NAVEGAÇÃO
  // ============================================

  const [action, setAction] = useState<ViewAction>('LIST')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // ============================================
  // HANDLERS DE NAVEGAÇÃO
  // ============================================

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

  // ============================================
  // RENDER CONDICIONAL
  // ============================================

  // Exibir List View
  if (action === 'LIST') {
    return (
      <EntityListViewInternal
        onNew={handleNew}
        onEdit={handleEdit}
        onView={handleView}
      />
    )
  }

  // Exibir Form View (NEW, EDIT ou VIEW)
  return (
    <EntityFormInternal
      id={selectedId}
      action={action}
      onClose={handleClose}
    />
  )
}

// =============================================================================
// LIST VIEW INTERNA (sem navegação por rota)
// =============================================================================

interface EntityListViewInternalProps {
  onNew: () => void
  onEdit: (id: string) => void
  onView: (id: string) => void
}

function EntityListViewInternal({ onNew, onEdit, onView }: EntityListViewInternalProps) {
  // Implementação similar ao ListViewTemplate.tsx
  // mas usando os callbacks ao invés de navigate()

  /*
  return (
    <ArchbaseGridTemplate
      // ... configurações ...
      userActions={{
        visible: true,
        onAddExecute: onNew,
        onEditExecute: () => {
          const entity = dataSource.getCurrentRecord()
          if (entity) onEdit(entity.id)
        },
        onViewExecute: () => {
          const entity = dataSource.getCurrentRecord()
          if (entity) onView(entity.id)
        }
      }}
    />
  )
  */

  return <div>List View - TODO: Implementar</div>
}

// =============================================================================
// FORM VIEW INTERNA (sem navegação por rota)
// =============================================================================

interface EntityFormInternalProps {
  id: string | null
  action: ViewAction
  onClose: () => void
}

function EntityFormInternal({ id, action, onClose }: EntityFormInternalProps) {
  // Implementação similar ao FormViewTemplate.tsx
  // mas usando action prop ao invés de query params

  /*
  const { dataSource } = useArchbaseRemoteDataSource<EntityDto, string>({
    name: `dsEntity${id}`,
    service: serviceApi,
    loadOnStart: action !== 'NEW',
    id: action === 'EDIT' || action === 'VIEW' ? id : undefined,
    onLoadComplete: (dataSource) => {
      if (action === 'EDIT') {
        dataSource.edit()
      } else if (action === 'NEW') {
        dataSource.insert(EntityDto.newInstance())
      }
    }
  })

  return (
    <ArchbaseFormTemplate
      title={action === 'NEW' ? 'Nova Entidade' : 'Editar Entidade'}
      dataSource={dataSource}
      onCancel={onClose}
      onAfterSave={onClose}
    >
      {/* Campos do formulário *}
    </ArchbaseFormTemplate>
  )
  */

  return <div>Form View - Action: {action} - ID: {id} - TODO: Implementar</div>
}

// =============================================================================
// VARIAÇÃO: CRUD COM MODAL INLINE
// =============================================================================

/**
 * Variação onde o formulário é exibido em um Modal ao invés de substituir a lista.
 * Útil para edições rápidas sem sair da lista.
 */
export function EntityManagerViewWithModal() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState<ViewAction>('NEW')
  const [selectedEntity, setSelectedEntity] = useState<EntityDto | null>(null)

  const handleNew = () => {
    setSelectedEntity(null)
    setModalAction('NEW')
    setIsModalOpen(true)
  }

  const handleEdit = (entity: EntityDto) => {
    setSelectedEntity(entity)
    setModalAction('EDIT')
    setIsModalOpen(true)
  }

  const handleView = (entity: EntityDto) => {
    setSelectedEntity(entity)
    setModalAction('VIEW')
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEntity(null)
  }

  const handleSaveSuccess = () => {
    handleCloseModal()
    // Refresh da lista se necessário
  }

  /*
  return (
    <>
      <EntityListViewInternal
        onNew={handleNew}
        onEdit={(id) => {
          // Buscar entidade e chamar handleEdit
        }}
        onView={(id) => {
          // Buscar entidade e chamar handleView
        }}
      />

      <ArchbaseFormModalTemplate
        opened={isModalOpen}
        title={modalAction === 'NEW' ? 'Nova Entidade' : 'Editar Entidade'}
        dataSource={dataSource}
        onClickOk={handleCloseModal}
        onClickCancel={handleCloseModal}
        onAfterSave={handleSaveSuccess}
      >
        {/* Campos do formulário *}
      </ArchbaseFormModalTemplate>
    </>
  )
  */

  return <div>Manager com Modal - TODO: Implementar</div>
}

// =============================================================================
// VARIAÇÃO: CRUD COM TABS MÚLTIPLAS
// =============================================================================

import { Tabs, Box } from '@mantine/core'

/**
 * Variação com múltiplas entidades organizadas em Tabs.
 * Útil para configurações ou módulos relacionados.
 */
export function ConfigManagerView() {
  const [activeTab, setActiveTab] = useState<string | null>('users')

  return (
    <Box style={{ height: '100%' }}>
      <Tabs value={activeTab} onChange={setActiveTab} style={{ height: '100%' }}>
        <Tabs.List>
          <Tabs.Tab value="users">Usuários</Tabs.Tab>
          <Tabs.Tab value="roles">Perfis</Tabs.Tab>
          <Tabs.Tab value="permissions">Permissões</Tabs.Tab>
          <Tabs.Tab value="settings">Configurações</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="users" style={{ height: 'calc(100% - 40px)' }}>
          {/* <UserManagerView /> */}
          <div>Users Manager</div>
        </Tabs.Panel>

        <Tabs.Panel value="roles" style={{ height: 'calc(100% - 40px)' }}>
          {/* <RoleManagerView /> */}
          <div>Roles Manager</div>
        </Tabs.Panel>

        <Tabs.Panel value="permissions" style={{ height: 'calc(100% - 40px)' }}>
          {/* <PermissionManagerView /> */}
          <div>Permissions Manager</div>
        </Tabs.Panel>

        <Tabs.Panel value="settings" style={{ height: 'calc(100% - 40px)' }}>
          {/* <SettingsView /> */}
          <div>Settings</div>
        </Tabs.Panel>
      </Tabs>
    </Box>
  )
}

// =============================================================================
// VARIAÇÃO: DASHBOARD + CRUD
// =============================================================================

import { Stack, Group, Text, Button, SimpleGrid, Card, ThemeIcon } from '@mantine/core'
import { IconPlus, IconUsers, IconShield, IconActivity } from '@tabler/icons-react'

interface DashboardStats {
  totalEntities: number
  activeEntities: number
  pendingEntities: number
  recentActivity: number
}

/**
 * Variação com Dashboard de métricas + Lista.
 * Padrão moderno para visão geral + gestão.
 */
export function EntityDashboardView() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [showList, setShowList] = useState(false)

  // TODO: Carregar stats do service

  if (showList) {
    return (
      <Stack gap="md">
        <Group justify="space-between">
          <Button variant="subtle" onClick={() => setShowList(false)}>
            Voltar ao Dashboard
          </Button>
        </Group>
        {/* <EntityManagerView /> */}
        <div>Entity Manager View</div>
      </Stack>
    )
  }

  return (
    <Stack gap="md" p="md">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Text size="xl" fw={700}>Dashboard de Entidades</Text>
          <Text c="dimmed">Visão geral e gestão</Text>
        </div>
        <Group>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setShowList(true)}>
            Ver Todas
          </Button>
        </Group>
      </Group>

      {/* Stats Cards */}
      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <Card withBorder radius="md" padding="lg">
          <Group justify="apart">
            <div>
              <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
                Total
              </Text>
              <Text fw={700} size="xl">
                {stats?.totalEntities || 0}
              </Text>
            </div>
            <ThemeIcon color="blue" variant="light" size={50} radius="md">
              <IconUsers size={24} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card withBorder radius="md" padding="lg">
          <Group justify="apart">
            <div>
              <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
                Ativos
              </Text>
              <Text fw={700} size="xl" c="green">
                {stats?.activeEntities || 0}
              </Text>
            </div>
            <ThemeIcon color="green" variant="light" size={50} radius="md">
              <IconShield size={24} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card withBorder radius="md" padding="lg">
          <Group justify="apart">
            <div>
              <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
                Pendentes
              </Text>
              <Text fw={700} size="xl" c="orange">
                {stats?.pendingEntities || 0}
              </Text>
            </div>
            <ThemeIcon color="orange" variant="light" size={50} radius="md">
              <IconActivity size={24} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card withBorder radius="md" padding="lg">
          <Group justify="apart">
            <div>
              <Text c="dimmed" size="sm" tt="uppercase" fw={700}>
                Atividade
              </Text>
              <Text fw={700} size="xl">
                {stats?.recentActivity || 0}
              </Text>
            </div>
            <ThemeIcon color="purple" variant="light" size={50} radius="md">
              <IconActivity size={24} />
            </ThemeIcon>
          </Group>
          <Text size="xs" c="dimmed" mt="xs">
            Últimas 24 horas
          </Text>
        </Card>
      </SimpleGrid>

      {/* Quick Actions ou Recent Items */}
      <Card withBorder>
        <Text fw={500} mb="md">Ações Rápidas</Text>
        <Group>
          <Button variant="light" onClick={() => setShowList(true)}>
            Gerenciar Entidades
          </Button>
          <Button variant="light">
            Exportar Relatório
          </Button>
          <Button variant="light">
            Configurações
          </Button>
        </Group>
      </Card>
    </Stack>
  )
}

// =============================================================================
// REGISTRO NA NAVEGAÇÃO
// =============================================================================

/**
 * Para registrar a view na navegação do sistema:
 *
 * // src/navigation/navigationData.tsx
 * import { EntityManagerView } from '@views/entity/EntityManagerView'
 * import { IconPackage } from '@tabler/icons-react'
 *
 * export const navigationData: ArchbaseNavigationItem[] = [
 *   {
 *     id: 'entities',
 *     label: 'Entidades',
 *     link: '/entities',
 *     icon: <IconPackage size={20} />,
 *     component: <EntityManagerView />
 *   },
 *   // Para views com rotas separadas (List + Form):
 *   {
 *     id: 'entities',
 *     label: 'Entidades',
 *     link: '/entities',
 *     icon: <IconPackage size={20} />,
 *     component: <EntityListView />
 *   },
 *   {
 *     id: 'entity-form',
 *     label: 'Formulário de Entidade',
 *     link: '/entities/:entityId',
 *     icon: <IconPackage size={20} />,
 *     component: <EntityForm />,
 *     hidden: true // Não exibir no menu
 *   }
 * ]
 */
