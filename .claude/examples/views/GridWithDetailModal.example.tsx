/**
 * Exemplo: Grid com Modal de Detalhes + Operacoes em Lote
 *
 * Padrao validado contra gestor-rq-admin (producao) - VeiculoListView.
 *
 * PADROES DEMONSTRADOS:
 * - ArchbaseGridTemplate com colunas customizadas (badges, renders)
 * - Modal de detalhes com Tabs e DataSource local (readonly)
 * - Selecao de linhas (enableRowSelection) + operacoes em lote
 * - Cores por status (maps enum -> color)
 * - Custom renders: Badge, PlacaMercosul, formatacao de numeros
 * - useElementSize do Mantine para altura do container
 * - useDisclosure para controle de modais
 * - useArchbaseDataSourceV2 local para modal de detalhes
 * - userRowActions com ArchbaseGridRowActions
 * - Barra de acoes em lote com contagem de selecionados
 */

import { ReactNode, useMemo, useState, useRef, useEffect } from 'react'
import {
  Paper, Badge, Modal, Stack, Group, Text, Divider, Grid, Button,
  Tabs, ScrollArea, Select, Alert, LoadingOverlay,
} from '@mantine/core'
import { useDisclosure, useElementSize } from '@mantine/hooks'
import {
  IconX, IconCar, IconGauge, IconTruck, IconInfoCircle,
  IconCheckbox, IconSquare, IconRuler, IconClipboardList,
  IconSettings, IconCheck,
} from '@tabler/icons-react'

import { useArchbaseTranslation } from '@archbase/core'
import {
  useArchbaseRemoteServiceApi,
  useArchbaseRemoteDataSourceV2,
  useArchbaseDataSourceV2,
  useArchbaseStore,
} from '@archbase/data'
import {
  ArchbaseNotifications, ArchbaseDataGridColumn, Columns,
  ArchbaseGridRowActions, ArchbaseEdit, ArchbaseSelect,
  ArchbaseSwitch, ArchbaseTextArea,
} from '@archbase/components'
import {
  ArchbaseGridTemplate, ArchbaseGridTemplateRef, UserRowActionsOptions,
} from '@archbase/template'
import { useArchbaseNavigationListener } from '@archbase/admin'
import { ArchbaseViewSecurityProvider } from '@archbase/security'

// Ajuste os imports para o seu projeto:
// import { API_TYPE } from '../../ioc/RapidexIOCTypes'
// import { VeiculoService } from '../../services/VeiculoService'
// import { VeiculoDto, StatusVeiculo } from '../../domain/VeiculoDto'
// import { useSecureActions, FROTA_SECURITY_RESOURCES } from '../../hooks'

// ===========================================
// 1. ENUMS E OPCOES
// ===========================================

enum StatusOperacional {
  DISPONIVEL = 'DISPONIVEL',
  EM_ROTA = 'EM_ROTA',
  EM_MANUTENCAO = 'EM_MANUTENCAO',
  BLOQUEADO = 'BLOQUEADO',
  INATIVO = 'INATIVO',
}

const statusOperacionalOptions = [
  { value: StatusOperacional.DISPONIVEL, label: 'Disponivel' },
  { value: StatusOperacional.EM_ROTA, label: 'Em Rota' },
  { value: StatusOperacional.EM_MANUTENCAO, label: 'Em Manutencao' },
  { value: StatusOperacional.BLOQUEADO, label: 'Bloqueado' },
  { value: StatusOperacional.INATIVO, label: 'Inativo' },
]

const tipoVeiculoOptions = [
  { value: 'C', label: 'Caminhao' },
  { value: 'U', label: 'Utilitario' },
  { value: 'M', label: 'Moto' },
]

const tipoVeiculoLabels: Record<string, string> = {
  C: 'Caminhao',
  U: 'Utilitario',
  M: 'Moto',
}

const tipoVeiculoColors: Record<string, string> = {
  C: 'blue',
  U: 'teal',
  M: 'violet',
}

// Cores por status operacional
const getStatusColor = (status?: StatusOperacional): string => {
  switch (status) {
    case StatusOperacional.DISPONIVEL: return 'green'
    case StatusOperacional.EM_ROTA: return 'blue'
    case StatusOperacional.EM_MANUTENCAO: return 'yellow'
    case StatusOperacional.BLOQUEADO: return 'red'
    case StatusOperacional.INATIVO: return 'gray'
    default: return 'gray'
  }
}

// DTO simplificado para o exemplo
interface VeiculoDto {
  id: string
  placa: string
  nome: string
  marcaModelo: string
  tipoVeiculo: string
  statusOperacional: StatusOperacional
  kmAtual: number
  capacidadeCargaKg: number
  capacidadeCargaM3: number
  ufPlaca: string
  propriedade: string
  observacoes: string
  ativo: boolean
  isNew: boolean
}

// ===========================================
// 2. VIEW WRAPPER COM SEGURANCA
// ===========================================

export function VeiculoListView() {
  return (
    <ArchbaseViewSecurityProvider resourceName="frota.veiculo" resourceDescription="Veiculos">
      <VeiculoListViewContent />
    </ArchbaseViewSecurityProvider>
  )
}

// ===========================================
// 3. VIEW PRINCIPAL
// ===========================================

function VeiculoListViewContent() {
  const { t } = useArchbaseTranslation()

  // Seguranca (ajuste para o seu hook)
  // const { canView, canEdit, canDelete } = useSecureActions(...)
  const canView = true

  // Store e navegacao
  const templateStore = useArchbaseStore('veiculosStore')
  // const { closeAllowed } = useArchbaseNavigationListener('/veiculos', () => {
  //   templateStore.clearAllValues()
  //   closeAllowed()
  // })

  // Service
  // const serviceApi = useArchbaseRemoteServiceApi<VeiculoService>(API_TYPE.Veiculo)

  // Refs e tamanho
  const { ref: containerRef, width: containerWidth, height: containerHeight } = useElementSize()
  const templateRef = useRef<ArchbaseGridTemplateRef | null>(null)
  const [lastError, setLastError] = useState<string>('')

  // ===========================================
  // 4. MODAL DE DETALHES
  // ===========================================

  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false)
  const [selectedVeiculo, setSelectedVeiculo] = useState<VeiculoDto | null>(null)

  // DataSource LOCAL para a modal (readonly, dados ja carregados)
  const { dataSource: detailDataSource } = useArchbaseDataSourceV2<VeiculoDto>({
    name: 'dsVeiculoDetail',
    records: selectedVeiculo ? [selectedVeiculo] : [],
  })

  // ===========================================
  // 5. SELECAO EM LOTE
  // ===========================================

  const [selectedRows, setSelectedRows] = useState<VeiculoDto[]>([])
  const [batchModalOpened, { open: openBatchModal, close: closeBatchModal }] = useDisclosure(false)
  const [batchValue, setBatchValue] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleRowSelectionChange = (rows: VeiculoDto[]) => {
    setSelectedRows(rows)
  }

  const handleBatchUpdate = async () => {
    if (selectedRows.length === 0) {
      ArchbaseNotifications.showWarning('Atencao', 'Selecione pelo menos um veiculo')
      return
    }
    setIsUpdating(true)
    try {
      // Chamada real: await serviceApi.batchUpdate(ids, { campo: batchValue })
      ArchbaseNotifications.showSuccess('Sucesso', `${selectedRows.length} veiculo(s) atualizado(s)`)
      closeBatchModal()
      setBatchValue(null)
      setSelectedRows([])
      // refreshData()
    } catch (err: any) {
      ArchbaseNotifications.showError('Erro', err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  // ===========================================
  // 6. DATASOURCE REMOTO V2
  // ===========================================

  // Substitua pelo seu service real:
  // const { dataSource, isLoading, error, refreshData } =
  //   useArchbaseRemoteDataSourceV2<VeiculoDto>({
  //     name: 'dsVeiculos',
  //     label: 'Veiculos',
  //     service: serviceApi,
  //     pageSize: 25,
  //     defaultSortFields: ['placa'],
  //   })

  // Dados mock para o exemplo:
  const { dataSource, isLoading } = useArchbaseDataSourceV2<VeiculoDto>({
    name: 'dsVeiculos',
    records: [
      {
        id: '1', placa: 'ABC1D23', nome: 'Truck 01', marcaModelo: 'Volvo FH 540',
        tipoVeiculo: 'C', statusOperacional: StatusOperacional.DISPONIVEL,
        kmAtual: 150000, capacidadeCargaKg: 23000, capacidadeCargaM3: 90,
        ufPlaca: 'SP', propriedade: 'P', observacoes: '', ativo: true, isNew: false,
      },
      {
        id: '2', placa: 'XYZ9A87', nome: 'Utilitario 01', marcaModelo: 'Fiat Ducato',
        tipoVeiculo: 'U', statusOperacional: StatusOperacional.EM_ROTA,
        kmAtual: 85000, capacidadeCargaKg: 1500, capacidadeCargaM3: 12,
        ufPlaca: 'RJ', propriedade: 'T', observacoes: 'Terceirizado', ativo: true, isNew: false,
      },
      {
        id: '3', placa: 'QWE5F67', nome: 'Moto 01', marcaModelo: 'Honda CG 160',
        tipoVeiculo: 'M', statusOperacional: StatusOperacional.EM_MANUTENCAO,
        kmAtual: 42000, capacidadeCargaKg: 20, capacidadeCargaM3: 0.5,
        ufPlaca: 'MG', propriedade: 'P', observacoes: 'Troca de oleo', ativo: true, isNew: false,
      },
    ],
  })

  // Atualizar DataSource de detalhes quando veiculo selecionado
  useEffect(() => {
    if (selectedVeiculo && detailsOpened) {
      (detailDataSource as any).open({ records: [selectedVeiculo] });
      (detailDataSource as any).first()
    }
  }, [selectedVeiculo, detailsOpened])

  // Handlers
  const handleViewVeiculo = (row?: VeiculoDto) => {
    const veiculo = row || (dataSource as any).getCurrentRecord()
    if (veiculo) {
      setSelectedVeiculo(veiculo)
      openDetails()
    }
  }

  const getRowId = (row: VeiculoDto): string => row.id
  const handleClearError = () => setLastError('')

  // ===========================================
  // 7. COLUNAS COM RENDERS CUSTOMIZADOS
  // ===========================================

  const columns: ReactNode = useMemo(
    () => (
      <Columns>
        {/* Placa com componente customizado */}
        <ArchbaseDataGridColumn<VeiculoDto>
          dataField="placa"
          dataType="text"
          header="Placa"
          inputFilterType="text"
          size={140}
          render={(data): ReactNode => {
            const placa = data.getValue() as string
            // No projeto real: return <PlacaMercosul placa={placa} />
            return (
              <Badge variant="outline" color="dark" size="lg" radius="sm" tt="uppercase"
                styles={{ root: { fontFamily: 'monospace', letterSpacing: 2 } }}>
                {placa}
              </Badge>
            )
          }}
        />

        {/* Nome simples */}
        <ArchbaseDataGridColumn<VeiculoDto>
          dataField="nome"
          dataType="text"
          header="Nome"
          inputFilterType="text"
          size={200}
        />

        {/* Marca/Modelo */}
        <ArchbaseDataGridColumn<VeiculoDto>
          dataField="marcaModelo"
          dataType="text"
          header="Marca/Modelo"
          inputFilterType="text"
          size={230}
        />

        {/* Tipo com Badge colorida */}
        <ArchbaseDataGridColumn<VeiculoDto>
          dataField="tipoVeiculo"
          dataType="text"
          header="Tipo"
          size={120}
          align="center"
          render={(data): ReactNode => {
            const tipo = data.getValue() as string
            const label = tipoVeiculoLabels[tipo] || tipo || '-'
            const color = tipoVeiculoColors[tipo] || 'gray'
            return (
              <Badge color={color} variant="filled" size="md" tt="uppercase" style={{ fontSize: 12 }}>
                {label}
              </Badge>
            )
          }}
        />

        {/* Status operacional com cores */}
        <ArchbaseDataGridColumn<VeiculoDto>
          dataField="statusOperacional"
          dataType="text"
          header="Status"
          size={140}
          align="center"
          render={(data): ReactNode => {
            const status = data.getValue() as StatusOperacional
            const option = statusOperacionalOptions.find((o) => o.value === status)
            return (
              <Badge color={getStatusColor(status)} variant="filled" size="md" tt="uppercase" style={{ fontSize: '0.75rem' }}>
                {option?.label || status}
              </Badge>
            )
          }}
        />

        {/* Km formatada */}
        <ArchbaseDataGridColumn<VeiculoDto>
          dataField="kmAtual"
          dataType="text"
          header="Km Atual"
          size={100}
          align="right"
          render={(data): ReactNode => {
            const km = data.getValue()
            return km ? `${Number(km).toLocaleString('pt-BR')} km` : '-'
          }}
        />

        {/* Capacidade formatada */}
        <ArchbaseDataGridColumn<VeiculoDto>
          dataField="capacidadeCargaKg"
          dataType="text"
          header="Capacidade (kg)"
          size={130}
          align="right"
          render={(data): ReactNode => {
            const cap = data.getValue()
            return cap ? `${Number(cap).toLocaleString('pt-BR')} kg` : '-'
          }}
        />
      </Columns>
    ),
    [t],
  )

  // Row actions
  const userRowActions: UserRowActionsOptions<VeiculoDto> = {
    actions: ArchbaseGridRowActions,
    onViewRow: canView ? handleViewVeiculo : undefined,
  }

  // ===========================================
  // 8. RENDER
  // ===========================================

  return (
    <>
      <Paper p="md" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Barra de acoes em lote */}
        <Group justify="space-between" mb="sm">
          <Group gap="xs">
            <Button
              size="sm"
              variant={selectedRows.length > 0 ? 'filled' : 'light'}
              leftSection={<IconSettings size={16} />}
              onClick={openBatchModal}
              disabled={selectedRows.length === 0}
            >
              Configurar em Lote
            </Button>
            {selectedRows.length > 0 ? (
              <Badge size="lg" color="blue" variant="filled">
                {selectedRows.length} selecionado(s)
              </Badge>
            ) : (
              <Text size="sm" c="dimmed">
                Selecione veiculos para operacoes em lote
              </Text>
            )}
          </Group>
        </Group>

        {/* Grid Template */}
        <Paper ref={containerRef} withBorder style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <ArchbaseGridTemplate<VeiculoDto, string>
            ref={templateRef}
            title=""
            height={containerHeight}
            width={'100%'}
            dataSource={dataSource as any}
            pageSize={25}
            isLoading={isLoading}
            error={lastError || undefined}
            isError={Boolean(lastError)}
            clearError={handleClearError}
            withBorder={false}
            withToolbarBorder={true}
            withPaginationBorder={true}
            userActions={{
              visible: true,
              allowRemove: false,
              onViewExecute: canView ? handleViewVeiculo : undefined,
            }}
            userRowActions={userRowActions}
            getRowId={getRowId}
            enableRowSelection={true}
            enableRowActions={true}
            columns={columns}
            filterType={'normal'}
            positionActionsColumn={'first'}
            rowHeight={52}
            onSelectedRowsChanged={handleRowSelectionChange}
          />
        </Paper>
      </Paper>

      {/* ===========================================
          9. MODAL DE DETALHES COM TABS
          =========================================== */}
      <Modal
        opened={detailsOpened}
        onClose={closeDetails}
        title={
          <Group gap="xs">
            <IconCar size={24} />
            <Text fw={600}>Detalhes do Veiculo</Text>
          </Group>
        }
        size="70%"
        centered
      >
        {selectedVeiculo && (
          <Stack gap="md">
            <Tabs defaultValue="identificacao" variant="outline">
              <Tabs.List>
                <Tabs.Tab value="identificacao" leftSection={<IconInfoCircle size={16} />}>
                  Identificacao
                </Tabs.Tab>
                <Tabs.Tab value="capacidades" leftSection={<IconTruck size={16} />}>
                  Capacidades
                </Tabs.Tab>
                <Tabs.Tab value="operacional" leftSection={<IconClipboardList size={16} />}>
                  Operacional
                </Tabs.Tab>
              </Tabs.List>

              <ScrollArea h={450} mt="md">
                {/* Tab Identificacao */}
                <Tabs.Panel value="identificacao">
                  <Stack gap="md">
                    <Paper withBorder p="md">
                      <Group gap="xs" mb="md">
                        <IconCar size={18} />
                        <Text fw={600} size="sm">Dados do Veiculo</Text>
                      </Group>
                      <Grid>
                        <Grid.Col span={3}>
                          <ArchbaseEdit
                            dataSource={detailDataSource as any}
                            dataField="placa"
                            label="Placa"
                            readOnly
                          />
                        </Grid.Col>
                        <Grid.Col span={2}>
                          <ArchbaseEdit
                            dataSource={detailDataSource as any}
                            dataField="ufPlaca"
                            label="UF"
                            readOnly
                          />
                        </Grid.Col>
                        <Grid.Col span={7}>
                          <ArchbaseEdit
                            dataSource={detailDataSource as any}
                            dataField="marcaModelo"
                            label="Marca/Modelo"
                            readOnly
                          />
                        </Grid.Col>
                        <Grid.Col span={4}>
                          <ArchbaseSelect
                            dataSource={detailDataSource as any}
                            dataField="tipoVeiculo"
                            label="Tipo"
                            options={tipoVeiculoOptions}
                            getOptionLabel={(opt: any) => opt.label}
                            getOptionValue={(opt: any) => opt.value}
                            readOnly
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>
                  </Stack>
                </Tabs.Panel>

                {/* Tab Capacidades */}
                <Tabs.Panel value="capacidades">
                  <Stack gap="md">
                    <Paper withBorder p="md">
                      <Group gap="xs" mb="md">
                        <IconTruck size={18} />
                        <Text fw={600} size="sm">Capacidade de Carga</Text>
                      </Group>
                      <Grid>
                        <Grid.Col span={4}>
                          <ArchbaseEdit
                            dataSource={detailDataSource as any}
                            dataField="capacidadeCargaKg"
                            label="Carga (kg)"
                            readOnly
                          />
                        </Grid.Col>
                        <Grid.Col span={4}>
                          <ArchbaseEdit
                            dataSource={detailDataSource as any}
                            dataField="capacidadeCargaM3"
                            label="Carga (m3)"
                            readOnly
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>

                    <Paper withBorder p="md">
                      <Group gap="xs" mb="md">
                        <IconRuler size={18} />
                        <Text fw={600} size="sm">Dimensoes</Text>
                      </Group>
                      <Text size="sm" c="dimmed">Dimensoes da carroceria...</Text>
                    </Paper>
                  </Stack>
                </Tabs.Panel>

                {/* Tab Operacional */}
                <Tabs.Panel value="operacional">
                  <Stack gap="md">
                    <Paper withBorder p="md">
                      <Group gap="xs" mb="md">
                        <IconGauge size={18} />
                        <Text fw={600} size="sm">Status Operacional</Text>
                      </Group>
                      <Grid>
                        <Grid.Col span={4}>
                          <ArchbaseSelect
                            dataSource={detailDataSource as any}
                            dataField="statusOperacional"
                            label="Status"
                            options={statusOperacionalOptions}
                            getOptionLabel={(opt: any) => opt.label}
                            getOptionValue={(opt: any) => opt.value}
                            readOnly
                          />
                        </Grid.Col>
                        <Grid.Col span={4}>
                          <ArchbaseEdit
                            dataSource={detailDataSource as any}
                            dataField="kmAtual"
                            label="Km Atual"
                            readOnly
                          />
                        </Grid.Col>
                        <Grid.Col span={4}>
                          <ArchbaseSwitch
                            dataSource={detailDataSource as any}
                            dataField="ativo"
                            label="Ativo"
                            readOnly
                          />
                        </Grid.Col>
                        <Grid.Col span={12}>
                          <ArchbaseTextArea
                            dataSource={detailDataSource as any}
                            dataField="observacoes"
                            label="Observacoes"
                            minRows={3}
                            readOnly
                          />
                        </Grid.Col>
                      </Grid>
                    </Paper>
                  </Stack>
                </Tabs.Panel>
              </ScrollArea>
            </Tabs>

            <Divider />

            <Group justify="flex-end">
              <Button variant="default" onClick={closeDetails} leftSection={<IconX size={16} />}>
                Fechar
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* ===========================================
          10. MODAL DE OPERACAO EM LOTE
          =========================================== */}
      <Modal
        opened={batchModalOpened}
        onClose={closeBatchModal}
        title={
          <Group gap="xs">
            <IconSettings size={24} />
            <Text fw={600}>Operacao em Lote</Text>
          </Group>
        }
        size="md"
        centered
      >
        <Stack gap="md">
          <Alert color="blue" variant="light">
            <Text size="sm">
              Voce esta prestes a atualizar{' '}
              <Text component="span" fw={700}>
                {selectedRows.length} veiculo(s)
              </Text>{' '}
              selecionado(s).
            </Text>
          </Alert>

          <Select
            label="Novo Status"
            placeholder="Selecione o status"
            data={statusOperacionalOptions}
            value={batchValue}
            onChange={setBatchValue}
            clearable
          />

          <Divider />

          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={closeBatchModal} leftSection={<IconX size={16} />}>
              Cancelar
            </Button>
            <Button
              color="blue"
              onClick={handleBatchUpdate}
              loading={isUpdating}
              leftSection={<IconCheck size={16} />}
            >
              Aplicar ({selectedRows.length})
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}

export default VeiculoListView
