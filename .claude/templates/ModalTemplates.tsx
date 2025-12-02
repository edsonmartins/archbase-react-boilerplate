/**
 * TEMPLATES: Modais com Archbase
 *
 * Este arquivo contém templates para diferentes tipos de modais:
 * 1. Modal simples de visualização
 * 2. Modal com formulário (ArchbaseFormModalTemplate)
 * 3. Modal com Tabs
 * 4. Modal com Grid interno
 */

import { ReactNode, useMemo, useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Stack,
  Group,
  Paper,
  Text,
  Badge,
  Tabs,
  ScrollArea,
  LoadingOverlay,
  ActionIcon,
  Tooltip,
  Space
} from '@mantine/core'
import { IconAddressBook, IconListCheck, IconEdit, IconCheck, IconX } from '@tabler/icons-react'
import { t } from 'i18next'
import {
  ArchbaseModalTemplate,
  ArchbaseFormModalTemplate,
  ArchbaseDataGrid,
  ArchbaseDataGridColumn,
  ArchbaseDataSource,
  ArchbaseSelect,
  ArchbaseSelectItem,
  ArchbaseEdit,
  ArchbaseNumberEdit,
  ArchbaseSwitch,
  useArchbaseDataSource,
  useArchbaseDataSourceListener,
  DataSourceEvent,
  DataSourceEventNames,
  DataSourceOptions,
  Columns
} from 'archbase-react'

// =============================================================================
// TEMPLATE 1: MODAL SIMPLES DE VISUALIZAÇÃO
// =============================================================================

interface EntityViewModalProps {
  opened: boolean
  handleClose: () => void
  entity?: EntityDto | null
}

interface EntityDto {
  id: string
  name: string
  email?: string
  status: string
  createdAt?: string
}

/**
 * Modal simples para visualizar detalhes de uma entidade.
 * Usa ArchbaseModalTemplate com apenas botão OK.
 */
export function EntityViewModal({ opened, handleClose, entity }: EntityViewModalProps) {
  if (!entity) return null

  return (
    <ArchbaseModalTemplate
      title={t('Detalhes da Entidade')}
      size="lg"
      height="400px"
      opened={opened}
      onClickOk={handleClose}
      onlyOkButton={true}
      onClose={handleClose}
    >
      <ScrollArea style={{ height: '300px' }}>
        <Paper withBorder p="md" mb="md">
          <Text size="lg" fw={600} mb="md">
            {t('Informações Gerais')}
          </Text>
          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Text size="sm" fw={500}>
                {t('Nome')}:
              </Text>
              <Text size="sm">{entity.name || '-'}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Text size="sm" fw={500}>
                {t('E-mail')}:
              </Text>
              <Text size="sm">{entity.email || '-'}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Text size="sm" fw={500}>
                {t('Status')}:
              </Text>
              <Badge color={entity.status === 'ACTIVE' ? 'green' : 'red'} variant="light">
                {entity.status}
              </Badge>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Text size="sm" fw={500}>
                {t('Criado em')}:
              </Text>
              <Text size="sm">
                {entity.createdAt
                  ? new Date(entity.createdAt).toLocaleString('pt-BR')
                  : '-'}
              </Text>
            </Grid.Col>
          </Grid>
        </Paper>
      </ScrollArea>
    </ArchbaseModalTemplate>
  )
}

// =============================================================================
// TEMPLATE 2: MODAL COM FORMULÁRIO (ArchbaseFormModalTemplate)
// =============================================================================

interface ItemDto {
  id: string
  type: string
  column: string
  value?: string
  priority: number
  active: boolean
}

enum ItemType {
  FIXED = 'FIXED',
  DYNAMIC = 'DYNAMIC',
  CALCULATED = 'CALCULATED'
}

interface ItemFormModalProps {
  opened: boolean
  dsItems: ArchbaseDataSource<ItemDto, string>
  handleClose: () => void
  handleSave: () => void
}

/**
 * Modal com formulário para edição de item.
 * Usa ArchbaseFormModalTemplate com DataSource.
 */
export function ItemFormModal({
  opened,
  dsItems,
  handleClose,
  handleSave
}: ItemFormModalProps) {
  const [selectedType, setSelectedType] = useState<ItemType>(ItemType.FIXED)

  // Sincronizar estado local com datasource
  useEffect(() => {
    const currentType = dsItems.getCurrentRecord()?.type as ItemType
    if (currentType) {
      setSelectedType(currentType)
    }
  }, [dsItems.getCurrentIndex(), opened])

  const isViewing = !dsItems.isInserting() && !dsItems.isEditing()

  const getTypeLabel = (type: ItemType): string => {
    const labels: Record<ItemType, string> = {
      [ItemType.FIXED]: t('Fixo'),
      [ItemType.DYNAMIC]: t('Dinâmico'),
      [ItemType.CALCULATED]: t('Calculado')
    }
    return labels[type] || type
  }

  return (
    <ArchbaseFormModalTemplate<ItemDto, string>
      dataSource={dsItems}
      title={t('Configuração do Item')}
      opened={opened}
      onClickOk={handleClose}
      onAfterSave={handleSave}
      onClickCancel={handleClose}
      size="lg"
      height="500px"
    >
      <Grid>
        <Grid.Col span={12}>
          <Stack>
            {/* Select com enum */}
            <ArchbaseSelect<ItemDto, ItemType, ItemType>
              label={t('Tipo')}
              dataSource={dsItems}
              dataField="type"
              disabled={isViewing}
              clearable={false}
              getOptionLabel={getTypeLabel}
              getOptionValue={(option: ItemType) => option}
              onSelectValue={(value) => {
                setSelectedType(value as ItemType)
                // Limpar campos baseado no tipo selecionado
                if (value === ItemType.FIXED) {
                  dsItems.setFieldValue('value', null)
                }
              }}
            >
              {Object.values(ItemType).map((type) => (
                <ArchbaseSelectItem key={type} label={getTypeLabel(type)} value={type} />
              ))}
            </ArchbaseSelect>

            {/* Campo obrigatório */}
            <ArchbaseEdit<ItemDto, string>
              label={t('Coluna')}
              dataSource={dsItems}
              dataField="column"
              placeholder={t('Digite o nome da coluna')}
              disabled={isViewing}
              required
            />

            {/* Campo condicional (aparece apenas para tipo FIXED) */}
            {selectedType === ItemType.FIXED && (
              <ArchbaseEdit<ItemDto, string>
                label={t('Valor')}
                dataSource={dsItems}
                dataField="value"
                placeholder={t('Digite o valor fixo')}
                disabled={isViewing}
                required
              />
            )}

            {/* Campo numérico */}
            <ArchbaseNumberEdit<ItemDto, number>
              label={t('Prioridade')}
              dataSource={dsItems}
              dataField="priority"
              placeholder={t('Ordem de prioridade')}
              disabled={isViewing}
              precision={0}
            />

            {/* Switch */}
            <ArchbaseSwitch<ItemDto, boolean>
              label={t('Ativo')}
              dataSource={dsItems}
              dataField="active"
              disabled={isViewing}
            />
          </Stack>
        </Grid.Col>
      </Grid>
    </ArchbaseFormModalTemplate>
  )
}

// =============================================================================
// TEMPLATE 3: MODAL COM TABS
// =============================================================================

interface DetailDto {
  id: string
  name: string
  email?: string
  status: string
  items: ItemDto[]
}

interface DetailModalWithTabsProps {
  opened: boolean
  handleClose: () => void
  detail?: DetailDto | null
  mode?: 'view' | 'edit'
  onUpdate?: () => void
}

/**
 * Modal com múltiplas abas para diferentes seções de conteúdo.
 * Combina visualização e edição condicional.
 */
export function DetailModalWithTabs({
  opened,
  handleClose,
  detail,
  mode = 'view',
  onUpdate
}: DetailModalWithTabsProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ItemDto | null>(null)

  const isEditMode = mode === 'edit'

  // DataSource local para grid de itens
  const { dataSource: dsItems } = useArchbaseDataSource<ItemDto, string>({
    initialData: [],
    name: 'dsItems'
  })

  // Popular DataSource quando modal abre
  useEffect(() => {
    if (detail?.items) {
      const dsOptions: DataSourceOptions<ItemDto> = {
        records: detail.items,
        grandTotalRecords: detail.items.length,
        totalPages: 1,
        currentPage: 0,
        pageSize: 100
      }
      dsItems.setData(dsOptions)
    }
  }, [detail, opened])

  // Listener para seleção no grid
  useArchbaseDataSourceListener<ItemDto, string>({
    dataSource: dsItems,
    listener: (event: DataSourceEvent<ItemDto>): void => {
      if (event.type === DataSourceEventNames.afterScroll) {
        setSelectedItem(dsItems.getCurrentRecord() || null)
      }
    }
  })

  const handleSave = async () => {
    try {
      setIsSaving(true)
      // TODO: Implementar lógica de salvamento
      onUpdate?.()
      handleClose()
    } catch (error) {
      // Tratar erro
    } finally {
      setIsSaving(false)
    }
  }

  const getModalTitle = () => {
    if (!isEditMode) return t('Detalhes')
    return t('Editar Detalhes')
  }

  const itemsColumns: ReactNode = useMemo(() => {
    return (
      <Columns>
        <ArchbaseDataGridColumn<ItemDto>
          dataField="column"
          dataType="text"
          header={t('Coluna')}
          size={150}
        />
        <ArchbaseDataGridColumn<ItemDto>
          dataField="type"
          dataType="text"
          header={t('Tipo')}
          size={100}
        />
        <ArchbaseDataGridColumn<ItemDto>
          dataField="value"
          dataType="text"
          header={t('Valor')}
          size={150}
        />
        <ArchbaseDataGridColumn<ItemDto>
          dataField="active"
          dataType="boolean"
          header={t('Ativo')}
          size={80}
          render={({ row }) => (
            <Badge color={row.active ? 'green' : 'red'} variant="light">
              {row.active ? t('Sim') : t('Não')}
            </Badge>
          )}
        />
      </Columns>
    )
  }, [])

  return (
    <ArchbaseModalTemplate
      title={getModalTitle()}
      size="90%"
      height="600px"
      onClickOk={isEditMode ? handleSave : handleClose}
      onClickCancel={isEditMode ? handleClose : undefined}
      opened={opened}
      onlyOkButton={!isEditMode}
      onClose={handleClose}
    >
      <Box pos="relative">
        <LoadingOverlay visible={isSaving} />

        <Tabs defaultValue="info" variant="pills">
          <Tabs.List>
            <Tabs.Tab value="info" leftSection={<IconAddressBook size="0.8rem" />}>
              {t('Informações Gerais')}
            </Tabs.Tab>
            <Tabs.Tab value="items" leftSection={<IconListCheck size="0.8rem" />}>
              {t('Itens')}
            </Tabs.Tab>
          </Tabs.List>

          <Space h="md" />

          {/* Aba de Informações */}
          <Tabs.Panel value="info">
            <ScrollArea style={{ height: '450px' }}>
              <Paper withBorder p="md" mb="md">
                <Text size="lg" fw={600} mb="md">
                  {t('Dados Básicos')}
                </Text>
                <Grid gutter="md">
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Text size="sm" fw={500}>
                      {t('Nome')}:
                    </Text>
                    <Text size="sm">{detail?.name || '-'}</Text>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Text size="sm" fw={500}>
                      {t('E-mail')}:
                    </Text>
                    <Text size="sm">{detail?.email || '-'}</Text>
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <Text size="sm" fw={500}>
                      {t('Status')}:
                    </Text>
                    <Badge
                      color={detail?.status === 'ACTIVE' ? 'green' : 'red'}
                      variant="light"
                    >
                      {detail?.status || '-'}
                    </Badge>
                  </Grid.Col>
                </Grid>
              </Paper>
            </ScrollArea>
          </Tabs.Panel>

          {/* Aba de Itens */}
          <Tabs.Panel value="items">
            <ArchbaseDataGrid<ItemDto, string>
              printTitle={t('Itens')}
              width="100%"
              withBorder={true}
              manualPagination={false}
              dataSource={dsItems}
              withColumnBorders={true}
              striped={true}
              enableTopToolbar={false}
              enableRowActions={isEditMode}
              enableGlobalFilter={false}
              enableRowSelection={true}
              getRowId={(row) => row.id}
              showPagination={false}
              children={itemsColumns}
            />

            {/* Mostrar detalhes do item selecionado */}
            {selectedItem && (
              <Box mt="md">
                <Text size="sm" fw={500} mb="xs">
                  {t('Item selecionado')}: {selectedItem.column}
                </Text>
              </Box>
            )}
          </Tabs.Panel>
        </Tabs>
      </Box>
    </ArchbaseModalTemplate>
  )
}

// =============================================================================
// TEMPLATE 4: MODAL DE CONFIRMAÇÃO CUSTOMIZADA
// =============================================================================

interface ConfirmModalProps {
  opened: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Modal de confirmação customizada.
 * Alternativa ao ArchbaseDialog.showConfirmDialogYesNo para casos mais complexos.
 */
export function ConfirmModal({
  opened,
  title,
  message,
  confirmLabel = t('Confirmar'),
  cancelLabel = t('Cancelar'),
  confirmColor = 'blue',
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  return (
    <ArchbaseModalTemplate
      title={title}
      size="sm"
      height="auto"
      opened={opened}
      onClickOk={onConfirm}
      onClickCancel={onCancel}
      onClose={onCancel}
      okButtonLabel={confirmLabel}
      cancelButtonLabel={cancelLabel}
    >
      <Text size="sm">{message}</Text>
    </ArchbaseModalTemplate>
  )
}

// =============================================================================
// USO DOS TEMPLATES
// =============================================================================

/**
 * Exemplo de uso dos templates de modal em um componente pai:
 *
 * function ParentComponent() {
 *   const [viewModalOpened, setViewModalOpened] = useState(false)
 *   const [formModalOpened, setFormModalOpened] = useState(false)
 *   const [selectedEntity, setSelectedEntity] = useState<EntityDto | null>(null)
 *
 *   // DataSource para o modal de formulário
 *   const { dataSource: dsItems } = useArchbaseDataSource<ItemDto, string>({
 *     initialData: [],
 *     name: 'dsItems'
 *   })
 *
 *   const handleViewEntity = (entity: EntityDto) => {
 *     setSelectedEntity(entity)
 *     setViewModalOpened(true)
 *   }
 *
 *   const handleEditItem = (item: ItemDto) => {
 *     dsItems.open({ records: [item] })
 *     dsItems.edit()
 *     setFormModalOpened(true)
 *   }
 *
 *   const handleAddItem = () => {
 *     dsItems.insert({ id: '', type: 'FIXED', column: '', active: true })
 *     setFormModalOpened(true)
 *   }
 *
 *   return (
 *     <>
 *       {/* ... seu conteúdo ... *}
 *
 *       <EntityViewModal
 *         opened={viewModalOpened}
 *         handleClose={() => setViewModalOpened(false)}
 *         entity={selectedEntity}
 *       />
 *
 *       <ItemFormModal
 *         opened={formModalOpened}
 *         dsItems={dsItems}
 *         handleClose={() => setFormModalOpened(false)}
 *         handleSave={() => {
 *           // Refresh data
 *           setFormModalOpened(false)
 *         }}
 *       />
 *     </>
 *   )
 * }
 */
