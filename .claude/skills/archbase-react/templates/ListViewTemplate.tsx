/**
 * TEMPLATE: List View com ArchbaseGridTemplate
 *
 * Este template demonstra o padrão recomendado para criar views de listagem
 * com grid, filtros, paginação e ações CRUD.
 *
 * Substitua:
 * - Entity -> Nome da sua entidade (ex: User, Product, Order)
 * - EntityDto -> DTO da entidade (ex: UserDto, ProductDto)
 * - ENTITY_ROUTE -> Rota da entidade (ex: '/users', '/products')
 * - EntityRemoteService -> Service da entidade
 * - API_TYPE.Entity -> Tipo IoC do service
 */

import { ReactNode, useMemo, useState, useRef } from 'react'
import { Paper } from '@mantine/core'
import { uniqueId } from 'lodash'
import { t } from 'i18next'
import {
  useArchbaseRemoteServiceApi,
  useArchbaseRemoteDataSource,
  ArchbaseDialog,
  ArchbaseNotifications,
  DataSourceEvent,
  DataSourceEventNames,
  useArchbaseNavigationListener,
  useArchbaseDataSourceListener,
  useArchbaseNavigateParams,
  useArchbaseStore,
  useArchbaseElementSizeArea,
  ArchbaseDataGridColumn,
  Columns,
  ArchbaseGridTemplateRef,
  ArchbaseGridTemplate,
  ArchbaseGridRowActions,
  UserRowActionsOptions
} from 'archbase-react'

// TODO: Importar do seu projeto
// import { API_TYPE } from '@/ioc/IOCTypes'
// import { ENTITY_ROUTE, ADD_ACTION, EDIT_ACTION, VIEW_ACTION } from '@/navigation/navigationDataConstants'
// import { EntityDto } from '@/domain/EntityDto'
// import { EntityRemoteService } from '@/services/EntityRemoteService'

// Placeholder - substitua pelos seus tipos
interface EntityDto {
  id: string
  name: string
  description?: string
  status: string
  createdAt?: string
}

const ENTITY_ROUTE = '/entities'
const ADD_ACTION = 'ADD'
const EDIT_ACTION = 'EDIT'
const VIEW_ACTION = 'VIEW'

export function EntityListView() {
  // ============================================
  // 1. HOOKS DE NAVEGAÇÃO E STORE
  // ============================================

  // Store para persistir estado (filtros, paginação) entre navegações
  const templateStore = useArchbaseStore('entityStore')

  // Listener de navegação - limpa store ao sair da rota
  const { closeAllowed } = useArchbaseNavigationListener(ENTITY_ROUTE, () => {
    templateStore.clearAllValues()
    closeAllowed()
  })

  // Navegação com parâmetros
  const navigate = useArchbaseNavigateParams()

  // ============================================
  // 2. SERVICE API (IoC)
  // ============================================

  // TODO: Descomentar e ajustar para seu service
  // const serviceApi = useArchbaseRemoteServiceApi<EntityRemoteService>(API_TYPE.Entity)
  const serviceApi = null as any // Placeholder

  // ============================================
  // 3. ESTADOS LOCAIS
  // ============================================

  const [lastError, setLastError] = useState<string>('')
  const [containerRef, { width: containerWidth, height: containerHeight }] = useArchbaseElementSizeArea()
  const templateRef = useRef<ArchbaseGridTemplateRef | null>(null)

  // ============================================
  // 4. DATASOURCE REMOTO
  // ============================================

  const { dataSource, isLoading, error, isError, clearError } = useArchbaseRemoteDataSource<
    EntityDto,
    string
  >({
    name: 'dsEntity',
    service: serviceApi,
    store: templateStore,
    pageSize: 25,
    loadOnStart: true,
    sort: ['name'], // Campo padrão de ordenação
    onLoadComplete: (dataSource) => {
      // Callback após carregar dados
    },
    onDestroy: (dataSource) => {
      // Callback ao destruir datasource
    },
    onError: (error, origin) => {
      ArchbaseNotifications.showError(t('WARNING'), error, origin)
    }
  })

  // ============================================
  // 5. LISTENER DE EVENTOS DO DATASOURCE
  // ============================================

  useArchbaseDataSourceListener<EntityDto, string>({
    dataSource,
    listener: (event: DataSourceEvent<EntityDto>): void => {
      if (event.type === DataSourceEventNames.onError) {
        setLastError(event.error)
      }
    }
  })

  // ============================================
  // 6. HANDLERS DE NAVEGAÇÃO CRUD
  // ============================================

  const handleAdd = () => {
    navigate(
      `${ENTITY_ROUTE}/${t('Novo')}->${uniqueId()}`,
      {},
      { action: ADD_ACTION, redirectUrl: ENTITY_ROUTE }
    )
  }

  const handleEdit = () => {
    const entity = dataSource.getCurrentRecord()
    if (entity) {
      navigate(
        `${ENTITY_ROUTE}/${entity.id}`,
        {},
        { action: EDIT_ACTION, redirectUrl: ENTITY_ROUTE }
      )
    }
  }

  const handleView = () => {
    const entity = dataSource.getCurrentRecord()
    if (entity) {
      navigate(
        `${ENTITY_ROUTE}/${entity.id}`,
        {},
        { action: VIEW_ACTION, redirectUrl: ENTITY_ROUTE }
      )
    }
  }

  const handleRemove = () => {
    if (!dataSource.isEmpty()) {
      const entity = dataSource.getCurrentRecord()
      if (entity) {
        ArchbaseDialog.showConfirmDialogYesNo(
          t('Confirme'),
          `${t('Deseja remover')} "${entity.name}"?`,
          () => {
            dataSource.remove()
          },
          () => {}
        )
      }
    }
  }

  // ============================================
  // 7. HELPERS
  // ============================================

  const getRowId = (row: EntityDto): string => {
    return row.id
  }

  // TODO: Implementar verificação de permissão
  const isAdministrator = (): boolean => {
    return true
  }

  const handleClearError = () => {
    setLastError('')
    clearError()
  }

  // ============================================
  // 8. DEFINIÇÃO DAS COLUNAS
  // ============================================

  const columns: ReactNode = useMemo(() => {
    return (
      <Columns>
        {/* Coluna de texto simples */}
        <ArchbaseDataGridColumn<EntityDto>
          dataField="name"
          dataType="text"
          header={t('Nome')}
          inputFilterType="text"
          size={200}
        />

        {/* Coluna de texto com tamanho maior */}
        <ArchbaseDataGridColumn<EntityDto>
          dataField="description"
          dataType="text"
          header={t('Descrição')}
          inputFilterType="text"
          size={400}
        />

        {/* Coluna com render customizado */}
        <ArchbaseDataGridColumn<EntityDto>
          dataField="status"
          dataType="text"
          header={t('Status')}
          inputFilterType="select"
          size={120}
          render={(data): ReactNode => {
            const value = data.getValue()
            // TODO: Implementar Badge ou componente de status
            return value
          }}
        />

        {/* Coluna de data */}
        <ArchbaseDataGridColumn<EntityDto>
          dataField="createdAt"
          dataType="datetime"
          header={t('Criado em')}
          enableColumnFilter={false}
          size={150}
        />
      </Columns>
    )
  }, [])

  // ============================================
  // 9. CONFIGURAÇÃO DE AÇÕES POR LINHA
  // ============================================

  const userRowActions: UserRowActionsOptions<EntityDto> = {
    actions: ArchbaseGridRowActions,
    onAddRow: isAdministrator() ? handleAdd : undefined,
    onEditRow: isAdministrator() ? handleEdit : undefined,
    onRemoveRow: isAdministrator() ? handleRemove : undefined,
    onViewRow: handleView
  }

  // ============================================
  // 10. RENDER
  // ============================================

  return (
    <Paper ref={containerRef} style={{ overflow: 'none', height: '100%', width: '100%' }}>
      <ArchbaseGridTemplate<EntityDto, string>
        ref={templateRef}
        title={t('Entidades')}
        height={containerHeight}
        width={'100%'}
        dataSource={dataSource}
        pageSize={25}
        isLoading={isLoading}
        error={error || lastError}
        isError={isError || lastError !== ''}
        clearError={handleClearError}
        withBorder={false}
        filterOptions={{
          activeFilterIndex: 0,
          enabledAdvancedFilter: false,
          apiVersion: '1.00',
          componentName: 'entityFilter',
          viewName: 'EntityListView'
        }}
        userActions={{
          visible: true,
          allowRemove: true,
          onAddExecute: isAdministrator() ? handleAdd : undefined,
          onEditExecute: isAdministrator() ? handleEdit : undefined,
          onRemoveExecute: isAdministrator() ? handleRemove : undefined,
          onViewExecute: handleView
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
  )
}

/**
 * VARIAÇÃO: List View com ArchbaseDataGrid (sem template)
 *
 * Use esta variação quando precisar de mais controle sobre o layout,
 * como adicionar cards de estatísticas, filtros customizados, etc.
 */
export function EntityListViewCustom() {
  // ... mesmos hooks acima ...

  // Exemplo de estrutura customizada:
  /*
  return (
    <ArchbaseNavigationProvider>
      <Stack gap="md">
        {/* Header com título e botões *}
        <Group justify="space-between">
          <div>
            <Text size="xl" fw={700}>Título</Text>
            <Text c="dimmed">Descrição</Text>
          </div>
          <Group>
            <Button leftSection={<IconPlus size={16} />} onClick={handleAdd}>
              Novo
            </Button>
          </Group>
        </Group>

        {/* Cards de estatísticas (opcional) *}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
          <Card withBorder>...</Card>
        </SimpleGrid>

        {/* Filtros customizados (opcional) *}
        <Group>
          <TextInput placeholder="Buscar..." leftSection={<IconSearch size={16} />} />
        </Group>

        {/* Grid *}
        <ArchbaseDataGrid<EntityDto, string>
          dataSource={dataSource}
          withBorder={false}
          enableTopToolbar={true}
          enableRowActions={true}
          renderRowActions={buildRowActions}
          children={columns}
        />
      </Stack>
    </ArchbaseNavigationProvider>
  )
  */

  return null
}
