/**
 * TEMPLATE: Form View com ArchbaseFormTemplate
 *
 * Este template demonstra o padrão recomendado para criar formulários
 * de cadastro/edição com validação, binding automático e ações.
 *
 * Substitua:
 * - Entity -> Nome da sua entidade (ex: User, Product, Order)
 * - EntityDto -> DTO da entidade (ex: UserDto, ProductDto)
 * - entityId -> Parâmetro da rota (ex: userId, productId)
 * - EntityRemoteService -> Service da entidade
 * - API_TYPE.Entity -> Tipo IoC do service
 */

import { useEffect, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router'
import { StringParam, useQueryParams } from 'use-query-params'
import { Grid, LoadingOverlay, Paper, Stack, Group, Tabs, Box, ScrollArea } from '@mantine/core'
import { useForceUpdate } from '@mantine/hooks'
import { t } from 'i18next'
import {
  ArchbaseDialog,
  ArchbaseFormTemplate,
  ArchbaseNotifications,
  ArchbaseSelect,
  ArchbaseSelectItem,
  ArchbaseEdit,
  ArchbaseTextArea,
  ArchbaseNumberEdit,
  ArchbaseSwitch,
  ArchbaseMaskEdit,
  ArchbaseDatePickerEdit,
  useArchbaseNavigationListener,
  useArchbaseRemoteDataSource,
  useArchbaseRemoteServiceApi,
  useArchbaseSize,
  useArchbaseStore,
  useArchbaseValidator
} from 'archbase-react'

// TODO: Importar do seu projeto
// import { API_TYPE } from '@/ioc/IOCTypes'
// import { EntityDto, StatusEnum } from '@/domain/EntityDto'
// import { EntityRemoteService } from '@/services/EntityRemoteService'

// Placeholder - substitua pelos seus tipos
interface EntityDto {
  id: string
  name: string
  description?: string
  email?: string
  phone?: string
  status: string
  value?: number
  active: boolean
  birthDate?: string

  static newInstance(): EntityDto {
    return {
      id: '',
      name: '',
      description: '',
      email: '',
      phone: '',
      status: 'ACTIVE',
      value: 0,
      active: true,
      birthDate: ''
    }
  }
}

enum StatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING'
}

export function EntityForm() {
  // ============================================
  // 1. HOOKS DE ROTA E PARÂMETROS
  // ============================================

  const location = useLocation()
  const { entityId } = useParams() // TODO: Ajustar nome do parâmetro

  // Query params para determinar ação (ADD, EDIT, VIEW)
  const [searchParams] = useQueryParams({
    action: StringParam
  })
  const action = searchParams.action || ''

  // ============================================
  // 2. REFS E TAMANHO
  // ============================================

  const target = useRef(null)
  const [, height] = useArchbaseSize(target)
  const safeHeight = height > 0 ? height - 130 : 600

  // ============================================
  // 3. COMPARAÇÃO CASE-INSENSITIVE PARA ACTION (CRÍTICO!)
  // As constantes de navegação podem ser minúsculas ('add', 'edit', 'view')
  // Sempre comparar com toUpperCase() para evitar bugs
  // ============================================

  const isAddAction = action.toUpperCase() === 'ADD'
  const isEditAction = action.toUpperCase() === 'EDIT'
  const isViewAction = action.toUpperCase() === 'VIEW'

  // ============================================
  // 4. HOOKS ARCHBASE
  // ============================================

  const validator = useArchbaseValidator()
  const templateStore = useArchbaseStore(`entityForm${entityId}Store`)
  const forceUpdate = useForceUpdate()

  // Listener de navegação - limpa store ao sair
  const { closeAllowed } = useArchbaseNavigationListener(location.pathname, () => {
    templateStore.clearAllValues()
    closeAllowed()
  })

  // ============================================
  // 5. SERVICE API (IoC)
  // ============================================

  // TODO: Descomentar e ajustar para seu service
  // const serviceApi = useArchbaseRemoteServiceApi<EntityRemoteService>(API_TYPE.Entity)
  const serviceApi = null as any // Placeholder

  // ============================================
  // 6. ESTADOS LOCAIS
  // ============================================

  // Estado para campos condicionais
  const [selectedStatus, setSelectedStatus] = useState<StatusEnum | undefined>()

  // ============================================
  // 7. DATASOURCE REMOTO
  // ============================================

  const { dataSource, isLoading } = useArchbaseRemoteDataSource<EntityDto, string>({
    name: `dsEntity${entityId}`,
    label: t('Entidade'),
    service: serviceApi,
    store: templateStore,
    pageSize: 50,
    loadOnStart: !isAddAction,  // CORRETO: usar variável case-insensitive
    validator,
    id: isEditAction || isViewAction ? entityId : undefined,  // CORRETO: usar variáveis case-insensitive
    onLoadComplete: (dataSource) => {
      // Configurar modo baseado na ação
      if (!dataSource.isEmpty()) {
        if (isEditAction) {  // CORRETO: usar variável case-insensitive
          dataSource.edit()
        }
        forceUpdate()
      } else if (isAddAction) {  // CORRETO: usar variável case-insensitive
        dataSource.insert(EntityDto.newInstance())
      }
    },
    onDestroy: (_dataSource) => {
      // Cleanup se necessário
    },
    onError: (error, origin) => {
      ArchbaseNotifications.showError(t('WARNING'), error, origin)
    }
  })

  // ============================================
  // 8. EFFECTS
  // ============================================

  // Sincronizar estado local com datasource
  useEffect(() => {
    if (dataSource && !dataSource.isEmpty()) {
      const currentRecord = dataSource.getCurrentRecord()
      if (currentRecord) {
        setSelectedStatus(currentRecord.status as StatusEnum)
      }
    }
  }, [dataSource, dataSource?.getCurrentRecord()?.status])

  // ============================================
  // 9. HANDLERS
  // ============================================

  const handleAfterSave = () => {
    templateStore.clearAllValues()
    closeAllowed()
  }

  const handleCancel = () => {
    if (!isViewAction) {  // CORRETO: usar variável case-insensitive
      ArchbaseDialog.showConfirmDialogYesNo(
        t('Confirme'),
        t('Deseja cancelar a edição?'),
        () => {
          if (!dataSource.isBrowsing()) {
            dataSource.cancel()
          }
          templateStore.clearAllValues()
          closeAllowed()
        },
        () => {}
      )
    } else {
      templateStore.clearAllValues()
      closeAllowed()
    }
  }

  // ============================================
  // 10. HELPERS
  // ============================================

  // Usar isViewAction diretamente - já é case-insensitive

  const getStatusLabel = (status: StatusEnum): string => {
    const labels: Record<StatusEnum, string> = {
      [StatusEnum.ACTIVE]: t('Ativo'),
      [StatusEnum.INACTIVE]: t('Inativo'),
      [StatusEnum.PENDING]: t('Pendente')
    }
    return labels[status] || status
  }

  const statusOptions = Object.values(StatusEnum)

  // ============================================
  // 11. RENDER
  // ============================================

  return (
    <ArchbaseFormTemplate
      innerRef={target}
      title={isAddAction ? t('Nova Entidade') : t('Editar Entidade')}  // CORRETO: usar variável case-insensitive
      dataSource={dataSource}
      onCancel={handleCancel}
      onAfterSave={handleAfterSave}
      withBorder={false}
    >
      <Paper withBorder style={{ height: safeHeight, padding: '10px' }}>
        <LoadingOverlay visible={isLoading} opacity={0.8} />
        <ScrollArea h={safeHeight - 40}>
          <Grid>
            {/* ============================================ */}
            {/* SEÇÃO: DADOS BÁSICOS */}
            {/* ============================================ */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack>
                {/* Campo de texto simples */}
                <ArchbaseEdit<EntityDto, string>
                  label={t('Nome')}
                  dataSource={dataSource}
                  dataField="name"
                  placeholder={t('Digite o nome')}
                  required
                  disabled={isViewAction}  // CORRETO: usar variável case-insensitive
                />

                {/* Campo de email */}
                <ArchbaseEdit<EntityDto, string>
                  label={t('E-mail')}
                  dataSource={dataSource}
                  dataField="email"
                  placeholder={t('Digite o e-mail')}
                  disabled={isViewAction}  // CORRETO: usar variável case-insensitive
                />

                {/* Campo com máscara (telefone) */}
                <ArchbaseMaskEdit<EntityDto, string>
                  label={t('Telefone')}
                  dataSource={dataSource}
                  dataField="phone"
                  mask="(00) 00000-0000"
                  placeholder={t('Digite o telefone')}
                  disabled={isViewAction}  // CORRETO: usar variável case-insensitive
                />

                {/* Select com enum */}
                <ArchbaseSelect<EntityDto, StatusEnum, StatusEnum>
                  label={t('Status')}
                  dataSource={dataSource}
                  dataField="status"
                  getOptionLabel={getStatusLabel}
                  getOptionValue={(option: StatusEnum) => option}
                  onSelectValue={(value) => setSelectedStatus(value as StatusEnum)}
                  required
                  disabled={isViewAction}  // CORRETO: usar variável case-insensitive
                >
                  {statusOptions.map((status) => (
                    <ArchbaseSelectItem
                      key={status}
                      label={getStatusLabel(status)}
                      value={status}
                    />
                  ))}
                </ArchbaseSelect>
              </Stack>
            </Grid.Col>

            {/* ============================================ */}
            {/* SEÇÃO: DADOS ADICIONAIS */}
            {/* ============================================ */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack>
                {/* Campo numérico */}
                <ArchbaseNumberEdit<EntityDto, number>
                  label={t('Valor')}
                  dataSource={dataSource}
                  dataField="value"
                  placeholder={t('Digite o valor')}
                  precision={2}
                  prefix="R$ "
                  disabled={isViewAction}  // CORRETO: usar variável case-insensitive
                />

                {/* Campo de data */}
                <ArchbaseDatePickerEdit<EntityDto, string>
                  label={t('Data de Nascimento')}
                  dataSource={dataSource}
                  dataField="birthDate"
                  placeholder={t('Selecione a data')}
                  disabled={isViewAction}  // CORRETO: usar variável case-insensitive
                />

                {/* Switch */}
                <ArchbaseSwitch<EntityDto, boolean>
                  label={t('Ativo')}
                  dataSource={dataSource}
                  dataField="active"
                  disabled={isViewAction}  // CORRETO: usar variável case-insensitive
                />
              </Stack>
            </Grid.Col>

            {/* ============================================ */}
            {/* SEÇÃO: DESCRIÇÃO (LARGURA TOTAL) */}
            {/* ============================================ */}
            <Grid.Col span={12}>
              <ArchbaseTextArea<EntityDto, string>
                label={t('Descrição')}
                dataSource={dataSource}
                dataField="description"
                placeholder={t('Digite a descrição')}
                minRows={3}
                maxRows={6}
                disabled={isViewAction}  // CORRETO: usar variável case-insensitive
              />
            </Grid.Col>

            {/* ============================================ */}
            {/* SEÇÃO CONDICIONAL (baseada no status) */}
            {/* ============================================ */}
            {selectedStatus === StatusEnum.PENDING && (
              <Grid.Col span={12}>
                <Paper withBorder p="md" bg="yellow.0">
                  {/* Campos específicos para status PENDING */}
                </Paper>
              </Grid.Col>
            )}
          </Grid>
        </ScrollArea>
      </Paper>
    </ArchbaseFormTemplate>
  )
}

/**
 * VARIAÇÃO: Form com Tabs
 *
 * Use esta variação para formulários complexos com múltiplas seções.
 */
export function EntityFormWithTabs() {
  // ... mesmos hooks acima ...

  const target = useRef(null)
  const [, height] = useArchbaseSize(target)
  const safeHeight = height > 0 ? height - 130 : 600
  const dataSource = null as any // Placeholder

  return (
    <ArchbaseFormTemplate
      innerRef={target}
      title={t('Entidade')}
      dataSource={dataSource}
      onCancel={() => {}}
      onAfterSave={() => {}}
      withBorder={false}
    >
      <Paper withBorder style={{ height: safeHeight }}>
        <Tabs defaultValue="basic" style={{ height: '100%' }}>
          <Tabs.List>
            <Tabs.Tab value="basic">{t('Dados Básicos')}</Tabs.Tab>
            <Tabs.Tab value="address">{t('Endereço')}</Tabs.Tab>
            <Tabs.Tab value="settings">{t('Configurações')}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="basic" style={{ height: 'calc(100% - 40px)' }}>
            <Box p="md" style={{ overflowY: 'auto', height: '100%' }}>
              <Stack gap="md">
                {/* Campos da aba Dados Básicos */}
                <ArchbaseEdit dataSource={dataSource} dataField="name" label={t('Nome')} />
                <ArchbaseEdit dataSource={dataSource} dataField="email" label={t('E-mail')} />
              </Stack>
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="address" style={{ height: 'calc(100% - 40px)' }}>
            <Box p="md" style={{ overflowY: 'auto', height: '100%' }}>
              <Grid>
                <Grid.Col span={{ base: 12, md: 3 }}>
                  <ArchbaseMaskEdit
                    dataSource={dataSource}
                    dataField="zipCode"
                    label={t('CEP')}
                    mask="00000-000"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 9 }}>
                  <ArchbaseEdit dataSource={dataSource} dataField="street" label={t('Rua')} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <ArchbaseEdit dataSource={dataSource} dataField="number" label={t('Número')} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <ArchbaseEdit dataSource={dataSource} dataField="city" label={t('Cidade')} />
                </Grid.Col>
              </Grid>
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="settings" style={{ height: 'calc(100% - 40px)' }}>
            <Box p="md" style={{ overflowY: 'auto', height: '100%' }}>
              <Stack gap="md">
                <ArchbaseSwitch dataSource={dataSource} dataField="active" label={t('Ativo')} />
                <ArchbaseSwitch
                  dataSource={dataSource}
                  dataField="notifications"
                  label={t('Receber notificações')}
                />
              </Stack>
            </Box>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </ArchbaseFormTemplate>
  )
}
