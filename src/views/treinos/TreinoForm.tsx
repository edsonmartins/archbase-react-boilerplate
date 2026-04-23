/**
 * TreinoForm - Formulario de Treino com Editor de 6 Fases BlueVix
 */
import { useEffect, useRef, useState } from 'react'
import {
  Stack,
  LoadingOverlay,
  Tabs,
  Grid,
  Group,
  Text,
  Paper,
  Box,
  Accordion,
  Badge,
  ActionIcon,
  Tooltip,
  Select,
  NumberInput,
  TextInput,
  ThemeIcon,
} from '@mantine/core'
import { useArchbaseRemoteDataSourceV2, useArchbaseRemoteServiceApi, useArchbaseStore } from '@archbase/data'
import { ArchbaseFormTemplate, ValidationErrorsProvider } from '@archbase/template'
import {
  ArchbaseDialog,
  ArchbaseNotifications,
  ArchbaseEdit,
  ArchbaseSelect,
  ArchbaseNumberEdit,
  ArchbaseSwitch,
  ArchbaseTextArea,
} from '@archbase/components'
import { useArchbaseValidator } from '@archbase/core'
import { useArchbaseNavigationListener } from '@archbase/admin'
import { useLocation, useParams } from 'react-router'
import { useSearchParams } from 'react-router-dom'
import { useInjection } from 'inversify-react'
import {
  IconFileText,
  IconSettings,
  IconList,
  IconPlus,
  IconTrash,
  IconGripVertical,
  IconCircle,
  IconMassage,
  IconActivity,
  IconFlame,
  IconHeart,
  IconMoon,
} from '@tabler/icons-react'

import { TreinoDto, FaseDto, ExercicioTreinoDto } from '../../domain/treino/TreinoDto'
import { TreinoService } from '../../services/TreinoService'
import { ExercicioService } from '../../services/ExercicioService'
import { ExercicioDto } from '../../domain/exercicio/ExercicioDto'
import { API_TYPE } from '../../ioc/IOCTypes'

// Opcoes de nivel
const nivelOptions = [
  { value: 'INICIANTE', label: 'Iniciante' },
  { value: 'INTERMEDIARIO', label: 'Intermediario' },
  { value: 'AVANCADO', label: 'Avancado' },
]

// Opcoes de tipo de treino
const tipoTreinoOptions = [
  { value: 'A', label: 'Treino A' },
  { value: 'B', label: 'Treino B' },
  { value: 'C', label: 'Treino C' },
  { value: 'DESCANSO', label: 'Descanso' },
]

// Icones das fases
const faseIcons: Record<string, React.ReactNode> = {
  LIBERACAO_MIOFASCIAL: <IconMassage size={18} />,
  MOBILIDADE_ARTICULAR: <IconActivity size={18} />,
  CORE_QUADRIL: <IconCircle size={18} />,
  FORCA_FUNCIONAL: <IconFlame size={18} />,
  CARDIO_CONSCIENTE: <IconHeart size={18} />,
  DESACELERACAO: <IconMoon size={18} />,
}

// Cores das fases
const faseCores: Record<string, string> = {
  LIBERACAO_MIOFASCIAL: 'teal',
  MOBILIDADE_ARTICULAR: 'blue',
  CORE_QUADRIL: 'violet',
  FORCA_FUNCIONAL: 'yellow',
  CARDIO_CONSCIENTE: 'orange',
  DESACELERACAO: 'teal',
}

interface FaseEditorProps {
  fase: FaseDto
  exerciciosDisponiveis: { value: string; label: string }[]
  onAddExercicio: () => void
  onRemoveExercicio: (index: number) => void
  onUpdateExercicio: (index: number, field: keyof ExercicioTreinoDto, value: unknown) => void
}

function FaseEditor({
  fase,
  exerciciosDisponiveis,
  onAddExercicio,
  onRemoveExercicio,
  onUpdateExercicio,
}: FaseEditorProps) {
  return (
    <Stack gap="sm">
      {fase.exercicios.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="md">
          Nenhum exercício adicionado nesta fase
        </Text>
      ) : (
        fase.exercicios.map((exercicio, index) => (
          <Paper key={exercicio.id || index} withBorder p="sm" bg="gray.0">
            <Group gap="sm" align="flex-start">
              <ActionIcon variant="subtle" color="gray" style={{ cursor: 'grab' }}>
                <IconGripVertical size={16} />
              </ActionIcon>

              <Box style={{ flex: 1 }}>
                <Grid>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Select
                      label="Exercício"
                      placeholder="Selecione..."
                      data={exerciciosDisponiveis}
                      value={exercicio.exercicioId}
                      onChange={(value) => onUpdateExercicio(index, 'exercicioId', value)}
                      searchable
                      size="xs"
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 2 }}>
                    <NumberInput
                      label="Séries"
                      value={exercicio.series}
                      onChange={(value) => onUpdateExercicio(index, 'series', value)}
                      min={1}
                      max={10}
                      size="xs"
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 6, sm: 2 }}>
                    <TextInput
                      label="Reps"
                      value={exercicio.repeticoes}
                      onChange={(e) => onUpdateExercicio(index, 'repeticoes', e.currentTarget.value)}
                      placeholder="8-12"
                      size="xs"
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, sm: 2 }}>
                    <Box pt={24}>
                      <Tooltip label="Remover exercício">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => onRemoveExercicio(index)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Box>
                  </Grid.Col>
                </Grid>
              </Box>
            </Group>
          </Paper>
        ))
      )}

      <Group justify="center">
        <ActionIcon variant="light" color="blue" size="lg" onClick={onAddExercicio}>
          <IconPlus size={18} />
        </ActionIcon>
      </Group>
    </Stack>
  )
}

export function TreinoForm() {
  const location = useLocation()
  const { id } = useParams()
  const validator = useArchbaseValidator()
  const [searchParams] = useSearchParams()
  const action = searchParams.get('action') || ''

  const treinoService = useInjection<TreinoService>(API_TYPE.TreinoService)
  const exercicioService = useInjection<ExercicioService>(API_TYPE.ExercicioService)

  // Lista de exercicios disponiveis para selecao
  const [exerciciosDisponiveis, setExerciciosDisponiveis] = useState<{ value: string; label: string }[]>([])

  // Fases do treino (estado local para edicao)
  const [fases, setFases] = useState<FaseDto[]>(TreinoDto.defaultFases())

  // Store com nome fixo
  const templateStore = useArchbaseStore('treinoFormStore')
  const { closeAllowed } = useArchbaseNavigationListener(location.pathname, () => {
    templateStore.clearAllValues()
    closeAllowed()
  })
  const serviceApi = useArchbaseRemoteServiceApi<TreinoService>(API_TYPE.TreinoService)

  // Comparacao case-insensitive para action
  const isAddAction = action.toUpperCase() === 'ADD'
  const isEditAction = action.toUpperCase() === 'EDIT'
  const isViewAction = action.toUpperCase() === 'VIEW'

  // useArchbaseRemoteDataSourceV2
  const { dataSource, isLoading } = useArchbaseRemoteDataSourceV2<TreinoDto>({
    name: 'dsTreino',
    label: 'Treino',
    service: serviceApi,
    pageSize: 50,
    defaultSortFields: ['nome'],
    validator,
    onError: (error) => {
      ArchbaseNotifications.showError('Atenção', error)
    },
  })

  // Flag para garantir que loadRecord so execute uma vez
  const loadedIdRef = useRef<string | null>(null)

  // Carrega exercicios disponiveis
  useEffect(() => {
    const loadExercicios = async () => {
      try {
        const response = await exercicioService.findAll(0, 100)
        const options = (response.content || []).map((ex: ExercicioDto) => ({
          value: ex.id,
          label: ex.nome,
        }))
        setExerciciosDisponiveis(options)
      } catch (err) {
        console.error('Erro ao carregar exercicios:', err)
      }
    }
    loadExercicios()
  }, [])

  // Carrega o registro
  useEffect(() => {
    if (loadedIdRef.current === (id || 'new')) return
    loadedIdRef.current = id || 'new'

    const loadRecord = async () => {
      if (isAddAction) {
        dataSource.setRecords([])
        const newRecord = TreinoDto.newInstance()
        dataSource.insert(newRecord)
        setFases(newRecord.fases || TreinoDto.defaultFases())
      } else if ((isEditAction || isViewAction) && id) {
        try {
          const record = await treinoService.findOne(id)
          const dto = new TreinoDto(record)
          dataSource.setRecords([dto])
          setFases(dto.fases || TreinoDto.defaultFases())
          if (isEditAction) {
            dataSource.edit()
          }
        } catch (error: unknown) {
          ArchbaseNotifications.showError('Atenção', String(error))
        }
      }
    }

    loadRecord()
  }, [id])

  // Handlers para edicao de fases
  const handleAddExercicio = (faseIndex: number) => {
    const newFases = [...fases]
    const novoExercicio: ExercicioTreinoDto = {
      id: `temp-${Date.now()}`,
      exercicioId: '',
      ordem: newFases[faseIndex].exercicios.length + 1,
      series: 3,
      repeticoes: '12',
    }
    newFases[faseIndex].exercicios.push(novoExercicio)
    setFases(newFases)
  }

  const handleRemoveExercicio = (faseIndex: number, exercicioIndex: number) => {
    const newFases = [...fases]
    newFases[faseIndex].exercicios.splice(exercicioIndex, 1)
    setFases(newFases)
  }

  const handleUpdateExercicio = (
    faseIndex: number,
    exercicioIndex: number,
    field: keyof ExercicioTreinoDto,
    value: unknown
  ) => {
    const newFases = [...fases]
    const exercicio = newFases[faseIndex].exercicios[exercicioIndex]
    newFases[faseIndex].exercicios[exercicioIndex] = { ...exercicio, [field]: value }
    setFases(newFases)
  }

  const handleAfterSave = () => {
    templateStore.clearAllValues()
    closeAllowed()
  }

  const handleCancel = () => {
    if (!isViewAction) {
      ArchbaseDialog.showConfirmDialogYesNo(
        'Confirme',
        'Deseja cancelar as alterações?',
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

  const currentRecord = dataSource.getCurrentRecord()

  // Conta total de exercicios
  const totalExercicios = fases.reduce((acc, fase) => acc + fase.exercicios.length, 0)

  return (
    <ValidationErrorsProvider>
      <ArchbaseFormTemplate
        title={isAddAction ? 'Novo Treino' : `Editar Treino`}
        dataSource={dataSource}
        onCancel={handleCancel}
        onAfterSave={handleAfterSave}
        withBorder={false}
        buttonsPosition="header"
        saveLabel="Salvar"
        cancelLabel={isViewAction ? 'Fechar' : 'Cancelar'}
      >
        <LoadingOverlay visible={isLoading} />
        <Tabs
          variant="pills"
          defaultValue="dados"
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <Tabs.List style={{ flexShrink: 0 }}>
            <Tabs.Tab value="dados" leftSection={<IconFileText size={16} />}>
              Dados Gerais
            </Tabs.Tab>
            <Tabs.Tab value="fases" leftSection={<IconList size={16} />}>
              6 Fases ({totalExercicios} exercícios)
            </Tabs.Tab>
            <Tabs.Tab value="config" leftSection={<IconSettings size={16} />}>
              Configurações
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="dados" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <Stack gap="md" p="md">
              <ArchbaseEdit<TreinoDto, string>
                label="Nome do Treino"
                dataSource={dataSource}
                dataField="nome"
                placeholder="Digite o nome do treino"
                required
              />

              <Grid>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <ArchbaseSelect
                    label="Nível"
                    dataSource={dataSource}
                    dataField="nivel"
                    options={nivelOptions}
                    getOptionLabel={(opt: { value: string; label: string }) => opt.label}
                    getOptionValue={(opt: { value: string; label: string }) => opt.value}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <ArchbaseSelect
                    label="Tipo de Treino"
                    dataSource={dataSource}
                    dataField="tipoTreino"
                    options={tipoTreinoOptions}
                    getOptionLabel={(opt: { value: string; label: string }) => opt.label}
                    getOptionValue={(opt: { value: string; label: string }) => opt.value}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <ArchbaseNumberEdit<TreinoDto, number>
                    label="Semana do Programa"
                    dataSource={dataSource}
                    dataField="semana"
                    min={1}
                    max={12}
                    placeholder="1 a 12"
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseNumberEdit<TreinoDto, number>
                    label="Duração (minutos)"
                    dataSource={dataSource}
                    dataField="duracaoMinutos"
                    min={5}
                    max={120}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseNumberEdit<TreinoDto, number>
                    label="Calorias Previstas"
                    dataSource={dataSource}
                    dataField="caloriasPrevistas"
                    min={0}
                  />
                </Grid.Col>
              </Grid>

              <ArchbaseTextArea<TreinoDto, string>
                label="Descrição"
                dataSource={dataSource}
                dataField="descricao"
                placeholder="Descrição do treino"
                minRows={3}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="fases" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <Box p="md">
              <Text size="sm" c="dimmed" mb="md">
                Configure os exercícios de cada uma das 6 fases do treino BlueVix
              </Text>

              <Accordion variant="separated" multiple defaultValue={['LIBERACAO_MIOFASCIAL']}>
                {fases.map((fase, faseIndex) => (
                  <Accordion.Item key={fase.tipo} value={fase.tipo}>
                    <Accordion.Control>
                      <Group>
                        <ThemeIcon
                          variant="light"
                          color={faseCores[fase.tipo]}
                          size="lg"
                          radius="xl"
                        >
                          {faseIcons[fase.tipo]}
                        </ThemeIcon>
                        <Box>
                          <Text fw={500}>{fase.nome}</Text>
                          <Text size="xs" c="dimmed">
                            {fase.exercicios.length} exercício(s)
                          </Text>
                        </Box>
                        <Badge color={faseCores[fase.tipo]} variant="light" ml="auto">
                          Fase {faseIndex + 1}
                        </Badge>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <FaseEditor
                        fase={fase}
                        exerciciosDisponiveis={exerciciosDisponiveis}
                        onAddExercicio={() => handleAddExercicio(faseIndex)}
                        onRemoveExercicio={(idx) => handleRemoveExercicio(faseIndex, idx)}
                        onUpdateExercicio={(idx, field, value) =>
                          handleUpdateExercicio(faseIndex, idx, field, value)
                        }
                      />
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="config" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <Stack gap="md" p="md">
              <ArchbaseSwitch<TreinoDto, boolean>
                label="Treino Ativo"
                dataSource={dataSource}
                dataField="ativo"
              />

              <ArchbaseNumberEdit<TreinoDto, number>
                label="Ordenacao"
                dataSource={dataSource}
                dataField="ordenacao"
                min={0}
                width={150}
                placeholder="Ex: 1"
              />

              <ArchbaseEdit<TreinoDto, string>
                label="URL da Imagem"
                dataSource={dataSource}
                dataField="imagemUrl"
                placeholder="https://..."
              />

              <Paper withBorder p="md" bg="gray.0">
                <Text size="sm" fw={500} mb="xs">
                  Informacoes do Sistema
                </Text>
                <Group gap="xl">
                  <Box>
                    <Text size="xs" c="dimmed">ID</Text>
                    <Text size="sm">{currentRecord?.id || '-'}</Text>
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed">Criado em</Text>
                    <Text size="sm">
                      {currentRecord?.createEntityDate
                        ? new Date(currentRecord.createEntityDate).toLocaleDateString('pt-BR')
                        : '-'}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed">Atualizado em</Text>
                    <Text size="sm">
                      {currentRecord?.updateEntityDate
                        ? new Date(currentRecord.updateEntityDate).toLocaleDateString('pt-BR')
                        : '-'}
                    </Text>
                  </Box>
                </Group>
              </Paper>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </ArchbaseFormTemplate>
    </ValidationErrorsProvider>
  )
}
