/**
 * IAProgressaoView - Regras de Progressão da IA com Edição
 */
import { useState, useEffect, useCallback } from 'react'
import {
  Stack,
  Group,
  Text,
  Paper,
  Badge,
  Title,
  SimpleGrid,
  ThemeIcon,
  Box,
  Tabs,
  Timeline,
  Card,
  Table,
  Progress,
  ScrollArea,
  LoadingOverlay,
  Center,
  Alert,
  Button,
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  ActionIcon,
  Tooltip,
  Slider,
  ColorInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { ArchbaseNotifications } from '@archbase/components'
import {
  IconActivity,
  IconTarget,
  IconWaveSine,
  IconAlertCircle,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
} from '@tabler/icons-react'
import { IOCContainer } from '@archbase/core'
import { API_TYPE } from '../../ioc/IOCTypes'
import type { ProgressaoService } from '../../services/ProgressaoService'
import type {
  PadraoMovimentoDto,
  ProgressaoOndulatoriaDto,
  ProgressaoStepData,
  ProgressaoNivelData,
} from '../../domain/progressao/ProgressaoDto'

const NIVEIS = ['INICIANTE', 'INTERMEDIARIO', 'AVANCADO']
const TIPOS_PROGRESSAO = ['Adaptação', 'Base', 'Intensificação', 'Peak', 'Deload', 'Avaliação']
const FASES = ['Mês 1', 'Mês 2', 'Mês 3']
const FOCOS = ['Técnica', 'Volume', 'Intensidade', 'Performance', 'Recuperação', 'Reavaliação']

export function IAProgressaoView() {
  const [padroes, setPadroes] = useState<PadraoMovimentoDto[]>([])
  const [ondulatoria, setOndulatoria] = useState<ProgressaoOndulatoriaDto[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modals
  const [stepModalOpened, { open: openStepModal, close: closeStepModal }] = useDisclosure(false)
  const [ondulatoriaModalOpened, { open: openOndulatoriaModal, close: closeOndulatoriaModal }] = useDisclosure(false)
  const [padraoModalOpened, { open: openPadraoModal, close: closePadraoModal }] = useDisclosure(false)
  const [createOndulatoriaModalOpened, { open: openCreateOndulatoriaModal, close: closeCreateOndulatoriaModal }] = useDisclosure(false)

  // Editing states
  const [editingStep, setEditingStep] = useState<ProgressaoStepData | null>(null)
  const [editingPadraoId, setEditingPadraoId] = useState<string | null>(null)
  const [editingNivel, setEditingNivel] = useState<string>('INICIANTE')
  const [editingOndulatoria, setEditingOndulatoria] = useState<ProgressaoOndulatoriaDto | null>(null)
  const [editingPadrao, setEditingPadrao] = useState<PadraoMovimentoDto | null>(null)

  // Forms
  const stepForm = useForm({
    initialValues: {
      nome: '',
      descricao: '',
      criterioAvanco: '',
      numeroStep: 1,
    },
    validate: {
      nome: (value) => (value.length < 2 ? 'Nome deve ter pelo menos 2 caracteres' : null),
    },
  })

  const ondulatoriaForm = useForm({
    initialValues: {
      tipo: 'Adaptação',
      fase: 'Mês 1',
      intensidade: 50,
      volume: 50,
      foco: 'Técnica',
      descricao: '',
    },
  })

  const padraoForm = useForm({
    initialValues: {
      nome: '',
      descricao: '',
      cor: '#228be6',
      icone: 'target',
      ordem: 1,
    },
    validate: {
      nome: (value) => (value.length < 2 ? 'Nome deve ter pelo menos 2 caracteres' : null),
    },
  })

  const createOndulatoriaForm = useForm({
    initialValues: {
      semana: 1,
      tipo: 'Adaptação',
      fase: 'Mês 1',
      intensidade: 50,
      volume: 50,
      foco: 'Técnica',
      descricao: '',
    },
    validate: {
      semana: (value) => (value < 1 || value > 12 ? 'Semana deve ser entre 1 e 12' : null),
    },
  })

  const getService = useCallback(() => {
    return IOCContainer.getContainer().get<ProgressaoService>(API_TYPE.ProgressaoService)
  }, [])

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const progressaoService = getService()

      // Carrega padrões de movimento com steps
      const padroesData = await progressaoService.listPadroes()
      const padroesComSteps = await Promise.all(
        padroesData.map(async (p) => {
          try {
            return await progressaoService.getPadrao(p.id)
          } catch {
            return p
          }
        })
      )
      setPadroes(padroesComSteps)

      // Carrega progressão ondulatória
      const ondulatoriaData = await progressaoService.listProgressoes()
      setOndulatoria(ondulatoriaData)
    } catch (err) {
      console.error('Erro ao carregar dados de progressão:', err)
      setError('Não foi possível carregar os dados da API.')
    } finally {
      setLoading(false)
    }
  }, [getService])

  useEffect(() => {
    loadData()
  }, [loadData])

  const getCorPadrao = (nome: string): string => {
    const cores: Record<string, string> = {
      'Agachamento': 'blue',
      'Hinge': 'teal',
      'Empurrar': 'violet',
      'Puxar': 'orange',
      'Core': 'yellow',
      'Estabilidade': 'cyan',
    }
    return cores[nome] || 'gray'
  }

  // ========== STEP HANDLERS ==========

  const handleOpenAddStep = (padraoId: string, nivel: string, nextStep: number) => {
    setEditingStep(null)
    setEditingPadraoId(padraoId)
    setEditingNivel(nivel)
    stepForm.setValues({
      nome: '',
      descricao: '',
      criterioAvanco: '',
      numeroStep: nextStep,
    })
    openStepModal()
  }

  const handleOpenEditStep = (padraoId: string, nivel: string, step: ProgressaoStepData) => {
    setEditingStep(step)
    setEditingPadraoId(padraoId)
    setEditingNivel(nivel)
    stepForm.setValues({
      nome: step.nome,
      descricao: step.descricao || '',
      criterioAvanco: step.criterioAvanco || '',
      numeroStep: step.numeroStep,
    })
    openStepModal()
  }

  const handleSaveStep = async () => {
    if (!stepForm.isValid()) {
      stepForm.validate()
      return
    }

    try {
      setSaving(true)
      const service = getService()

      if (editingStep) {
        // Update
        await service.updateStep(editingStep.id, {
          nome: stepForm.values.nome,
          descricao: stepForm.values.descricao || undefined,
          criterioAvanco: stepForm.values.criterioAvanco || undefined,
          numeroStep: stepForm.values.numeroStep,
        })
        ArchbaseNotifications.showSuccess('Sucesso', 'Step atualizado com sucesso')
      } else if (editingPadraoId) {
        // Create
        await service.createStep({
          padraoMovimentoId: editingPadraoId,
          nivel: editingNivel,
          numeroStep: stepForm.values.numeroStep,
          nome: stepForm.values.nome,
          descricao: stepForm.values.descricao || undefined,
          criterioAvanco: stepForm.values.criterioAvanco || undefined,
        })
        ArchbaseNotifications.showSuccess('Sucesso', 'Step criado com sucesso')
      }

      closeStepModal()
      await loadData()
    } catch (err) {
      console.error('Erro ao salvar step:', err)
      ArchbaseNotifications.showError('Erro', 'Não foi possível salvar o step')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteStep = async (stepId: string) => {
    if (!confirm('Deseja realmente remover este step?')) return

    try {
      setSaving(true)
      const service = getService()
      await service.deleteStep(stepId)
      ArchbaseNotifications.showSuccess('Sucesso', 'Step removido com sucesso')
      await loadData()
    } catch (err) {
      console.error('Erro ao remover step:', err)
      ArchbaseNotifications.showError('Erro', 'Não foi possível remover o step')
    } finally {
      setSaving(false)
    }
  }

  // ========== ONDULATÓRIA HANDLERS ==========

  const handleOpenEditOndulatoria = (progressao: ProgressaoOndulatoriaDto) => {
    setEditingOndulatoria(progressao)
    ondulatoriaForm.setValues({
      tipo: progressao.tipo,
      fase: progressao.fase,
      intensidade: progressao.intensidade,
      volume: progressao.volume,
      foco: progressao.foco,
      descricao: progressao.descricao || '',
    })
    openOndulatoriaModal()
  }

  const handleSaveOndulatoria = async () => {
    if (!editingOndulatoria) return

    try {
      setSaving(true)
      const service = getService()

      await service.updateProgressao(editingOndulatoria.id, {
        tipo: ondulatoriaForm.values.tipo,
        fase: ondulatoriaForm.values.fase,
        intensidade: ondulatoriaForm.values.intensidade,
        volume: ondulatoriaForm.values.volume,
        foco: ondulatoriaForm.values.foco,
        descricao: ondulatoriaForm.values.descricao || undefined,
      })

      ArchbaseNotifications.showSuccess('Sucesso', 'Progressão atualizada com sucesso')
      closeOndulatoriaModal()
      await loadData()
    } catch (err) {
      console.error('Erro ao salvar progressão:', err)
      ArchbaseNotifications.showError('Erro', 'Não foi possível salvar a progressão')
    } finally {
      setSaving(false)
    }
  }

  // ========== PADRÃO HANDLERS ==========

  const handleOpenAddPadrao = () => {
    setEditingPadrao(null)
    padraoForm.setValues({
      nome: '',
      descricao: '',
      cor: '#228be6',
      icone: 'target',
      ordem: padroes.length + 1,
    })
    openPadraoModal()
  }

  const handleOpenEditPadrao = (padrao: PadraoMovimentoDto) => {
    setEditingPadrao(padrao)
    padraoForm.setValues({
      nome: padrao.nome,
      descricao: padrao.descricao || '',
      cor: padrao.cor || '#228be6',
      icone: padrao.icone || 'target',
      ordem: padrao.ordem || 1,
    })
    openPadraoModal()
  }

  const handleSavePadrao = async () => {
    if (!padraoForm.isValid()) {
      padraoForm.validate()
      return
    }

    try {
      setSaving(true)
      const service = getService()

      if (editingPadrao) {
        await service.updatePadrao(editingPadrao.id, {
          nome: padraoForm.values.nome,
          descricao: padraoForm.values.descricao || undefined,
          cor: padraoForm.values.cor,
          icone: padraoForm.values.icone,
          ordem: padraoForm.values.ordem,
        })
        ArchbaseNotifications.showSuccess('Sucesso', 'Padrão atualizado com sucesso')
      } else {
        await service.createPadrao({
          nome: padraoForm.values.nome,
          descricao: padraoForm.values.descricao || undefined,
          cor: padraoForm.values.cor,
          icone: padraoForm.values.icone,
          ordem: padraoForm.values.ordem,
        })
        ArchbaseNotifications.showSuccess('Sucesso', 'Padrão criado com sucesso')
      }

      closePadraoModal()
      await loadData()
    } catch (err) {
      console.error('Erro ao salvar padrão:', err)
      ArchbaseNotifications.showError('Erro', 'Não foi possível salvar o padrão')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePadrao = async (padraoId: string) => {
    if (!confirm('Deseja realmente remover este padrão e todos os seus steps?')) return

    try {
      setSaving(true)
      const service = getService()
      await service.deletePadrao(padraoId)
      ArchbaseNotifications.showSuccess('Sucesso', 'Padrão removido com sucesso')
      await loadData()
    } catch (err) {
      console.error('Erro ao remover padrão:', err)
      ArchbaseNotifications.showError('Erro', 'Não foi possível remover o padrão')
    } finally {
      setSaving(false)
    }
  }

  // ========== CREATE ONDULATÓRIA HANDLERS ==========

  const handleOpenCreateOndulatoria = () => {
    const nextSemana = ondulatoria.length > 0
      ? Math.max(...ondulatoria.map(o => o.semana)) + 1
      : 1
    createOndulatoriaForm.setValues({
      semana: Math.min(nextSemana, 12),
      tipo: 'Adaptação',
      fase: nextSemana <= 4 ? 'Mês 1' : nextSemana <= 8 ? 'Mês 2' : 'Mês 3',
      intensidade: 50,
      volume: 50,
      foco: 'Técnica',
      descricao: '',
    })
    openCreateOndulatoriaModal()
  }

  const handleCreateOndulatoria = async () => {
    if (!createOndulatoriaForm.isValid()) {
      createOndulatoriaForm.validate()
      return
    }

    try {
      setSaving(true)
      const service = getService()

      await service.createProgressao({
        semana: createOndulatoriaForm.values.semana,
        tipo: createOndulatoriaForm.values.tipo,
        fase: createOndulatoriaForm.values.fase,
        intensidade: createOndulatoriaForm.values.intensidade,
        volume: createOndulatoriaForm.values.volume,
        foco: createOndulatoriaForm.values.foco,
        descricao: createOndulatoriaForm.values.descricao || undefined,
      })

      ArchbaseNotifications.showSuccess('Sucesso', 'Semana criada com sucesso')
      closeCreateOndulatoriaModal()
      await loadData()
    } catch (err) {
      console.error('Erro ao criar progressão:', err)
      ArchbaseNotifications.showError('Erro', 'Não foi possível criar a semana')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteOndulatoria = async (id: string) => {
    if (!confirm('Deseja realmente remover esta semana?')) return

    try {
      setSaving(true)
      const service = getService()
      await service.deleteProgressao(id)
      ArchbaseNotifications.showSuccess('Sucesso', 'Semana removida com sucesso')
      await loadData()
    } catch (err) {
      console.error('Erro ao remover progressão:', err)
      ArchbaseNotifications.showError('Erro', 'Não foi possível remover a semana')
    } finally {
      setSaving(false)
    }
  }

  // ========== RENDER ==========

  const renderNivelSection = (padrao: PadraoMovimentoDto, nivelData: ProgressaoNivelData) => {
    const nextStep = nivelData.steps.length > 0
      ? Math.max(...nivelData.steps.map(s => s.numeroStep)) + 1
      : 1

    return (
      <Box key={nivelData.nivel}>
        <Group justify="space-between" mb="xs">
          <Text size="sm" fw={500}>{nivelData.nivel}</Text>
          <Tooltip label="Adicionar step">
            <ActionIcon
              size="xs"
              variant="light"
              color="blue"
              onClick={() => handleOpenAddStep(padrao.id, nivelData.nivel, nextStep)}
            >
              <IconPlus size={12} />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Timeline active={-1} bulletSize={12} lineWidth={1}>
          {nivelData.steps.map((step) => (
            <Timeline.Item key={step.id || step.numeroStep}>
              <Group justify="space-between" wrap="nowrap">
                <Box style={{ flex: 1 }}>
                  <Text size="xs">{step.nome}</Text>
                  {step.descricao && (
                    <Text size="xs" c="dimmed">{step.descricao}</Text>
                  )}
                </Box>
                <Group gap={4}>
                  <Tooltip label="Editar">
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      color="blue"
                      onClick={() => handleOpenEditStep(padrao.id, nivelData.nivel, step)}
                    >
                      <IconEdit size={12} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Remover">
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      color="red"
                      onClick={() => handleDeleteStep(step.id)}
                    >
                      <IconTrash size={12} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            </Timeline.Item>
          ))}
        </Timeline>
      </Box>
    )
  }

  return (
    <Stack gap="lg" p="md" pos="relative">
      <LoadingOverlay visible={loading || saving} />

      <Group justify="space-between">
        <Title order={2}>Regras de Progressão</Title>
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          {error}
        </Alert>
      )}

      <Tabs defaultValue="padroes" variant="pills">
        <Tabs.List>
          <Tabs.Tab value="padroes" leftSection={<IconActivity size={16} />}>
            Por Padrão de Movimento
          </Tabs.Tab>
          <Tabs.Tab value="ondulatoria" leftSection={<IconWaveSine size={16} />}>
            Periodização Ondulatória
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="padroes" pt="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Text c="dimmed">
                A progressão segue a metodologia BlueVix de steps por padrão de movimento,
                permitindo que a aluna avance de forma segura e consistente.
              </Text>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={handleOpenAddPadrao}
                size="sm"
              >
                Novo Padrão
              </Button>
            </Group>

            <ScrollArea h="calc(100vh - 300px)" offsetScrollbars>
              {padroes.length === 0 ? (
                <Center h={200}>
                  <Stack align="center" gap="md">
                    <Text c="dimmed">Nenhum padrão de movimento cadastrado</Text>
                    <Button
                      leftSection={<IconPlus size={16} />}
                      onClick={handleOpenAddPadrao}
                      variant="light"
                    >
                      Criar primeiro padrão
                    </Button>
                  </Stack>
                </Center>
              ) : (
                <SimpleGrid cols={{ base: 1, md: 2 }}>
                  {padroes.map((padrao) => (
                    <Card key={padrao.id || padrao.nome} withBorder>
                      <Card.Section withBorder inheritPadding py="xs" bg={`${padrao.cor || getCorPadrao(padrao.nome)}.0`}>
                        <Group justify="space-between">
                          <Group>
                            <ThemeIcon size={24} color={padrao.cor || getCorPadrao(padrao.nome)} variant="filled">
                              <IconTarget size={14} />
                            </ThemeIcon>
                            <Text fw={600}>{padrao.nome}</Text>
                          </Group>
                          <Group gap={4}>
                            <Tooltip label="Editar padrão">
                              <ActionIcon
                                size="xs"
                                variant="subtle"
                                color="blue"
                                onClick={() => handleOpenEditPadrao(padrao)}
                              >
                                <IconEdit size={14} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Remover padrão">
                              <ActionIcon
                                size="xs"
                                variant="subtle"
                                color="red"
                                onClick={() => handleDeletePadrao(padrao.id)}
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Group>
                      </Card.Section>

                      <Stack gap="md" mt="md">
                        {padrao.niveis && padrao.niveis.length > 0 ? (
                          padrao.niveis.map((nivel) => renderNivelSection(padrao, nivel))
                        ) : (
                          // Se não tem níveis, mostrar botões para criar
                          NIVEIS.map((nivel) => (
                            <Box key={nivel}>
                              <Group justify="space-between" mb="xs">
                                <Text size="sm" fw={500}>{nivel}</Text>
                                <Tooltip label="Adicionar step">
                                  <ActionIcon
                                    size="xs"
                                    variant="light"
                                    color="blue"
                                    onClick={() => handleOpenAddStep(padrao.id, nivel, 1)}
                                  >
                                    <IconPlus size={12} />
                                  </ActionIcon>
                                </Tooltip>
                              </Group>
                              <Text size="xs" c="dimmed">Nenhum step cadastrado</Text>
                            </Box>
                          ))
                        )}
                      </Stack>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </ScrollArea>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="ondulatoria" pt="md">
          <ScrollArea h="calc(100vh - 220px)" offsetScrollbars>
            <Stack gap="md">
              <Group justify="space-between">
                <Text c="dimmed">
                  Periodização ondulatória de 12 semanas.
                </Text>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={handleOpenCreateOndulatoria}
                  size="sm"
                  disabled={ondulatoria.length >= 12}
                >
                  Nova Semana
                </Button>
              </Group>

              <Paper withBorder p="md">
                <Title order={5} mb="md">Condições que a IA Monitora</Title>
                <SimpleGrid cols={{ base: 2, md: 4 }}>
                  <Box>
                    <Text size="xs" c="dimmed">Feedback de treino</Text>
                    <Text size="sm">Notas &lt; 3 = reduzir intensidade</Text>
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed">Qualidade do sono</Text>
                    <Text size="sm">Ruim = reduzir volume</Text>
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed">Humor</Text>
                    <Text size="sm">&lt; 4 = adaptar sessão</Text>
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed">Conclusão treinos</Text>
                    <Text size="sm">&lt; 80% = revisar plano</Text>
                  </Box>
                </SimpleGrid>
              </Paper>

              <SimpleGrid cols={{ base: 1, md: 3 }}>
                <Paper withBorder p="md" bg="blue.0">
                  <Title order={6} mb="sm">Mês 1: Adaptação</Title>
                  <Text size="sm">Semanas 1-4: Foco em técnica e construção de base</Text>
                </Paper>
                <Paper withBorder p="md" bg="orange.0">
                  <Title order={6} mb="sm">Mês 2: Desenvolvimento</Title>
                  <Text size="sm">Semanas 5-8: Alternância volume/intensidade</Text>
                </Paper>
                <Paper withBorder p="md" bg="green.0">
                  <Title order={6} mb="sm">Mês 3: Consolidação</Title>
                  <Text size="sm">Semanas 9-12: Peak e reavaliação</Text>
                </Paper>
              </SimpleGrid>

              {ondulatoria.length === 0 ? (
                <Center h={200}>
                  <Stack align="center" gap="md">
                    <Text c="dimmed">Nenhuma configuração de periodização cadastrada</Text>
                    <Button
                      leftSection={<IconPlus size={16} />}
                      onClick={handleOpenCreateOndulatoria}
                      variant="light"
                    >
                      Criar primeira semana
                    </Button>
                  </Stack>
                </Center>
              ) : (
                <Paper withBorder>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Semana</Table.Th>
                        <Table.Th>Tipo</Table.Th>
                        <Table.Th>Intensidade</Table.Th>
                        <Table.Th>Volume</Table.Th>
                        <Table.Th>Foco</Table.Th>
                        <Table.Th w={80}>Ações</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {ondulatoria.map((semana) => (
                        <Table.Tr key={semana.id || semana.semana}>
                          <Table.Td>
                            <Badge variant="light">Semana {semana.semana}</Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="sm">{semana.tipo}</Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <Progress value={semana.intensidade || 0} size="sm" w={60} />
                              <Text size="xs">{semana.intensidade || 0}%</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              <Progress value={semana.volume || 0} size="sm" w={60} color="teal" />
                              <Text size="xs">{semana.volume || 0}%</Text>
                            </Group>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="outline" size="sm">{semana.foco || '-'}</Badge>
                          </Table.Td>
                          <Table.Td>
                            <Group gap={4}>
                              <Tooltip label="Editar">
                                <ActionIcon
                                  size="sm"
                                  variant="subtle"
                                  color="blue"
                                  onClick={() => handleOpenEditOndulatoria(semana)}
                                >
                                  <IconEdit size={14} />
                                </ActionIcon>
                              </Tooltip>
                              <Tooltip label="Remover">
                                <ActionIcon
                                  size="sm"
                                  variant="subtle"
                                  color="red"
                                  onClick={() => handleDeleteOndulatoria(semana.id)}
                                >
                                  <IconTrash size={14} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Paper>
              )}
            </Stack>
          </ScrollArea>
        </Tabs.Panel>
      </Tabs>

      {/* Modal de Step */}
      <Modal
        opened={stepModalOpened}
        onClose={closeStepModal}
        title={editingStep ? 'Editar Step' : 'Novo Step'}
        size="lg"
      >
        <Stack gap="md">
          <Group>
            <Badge color="blue">{editingNivel}</Badge>
            <Badge color="gray" variant="outline">Step #{stepForm.values.numeroStep}</Badge>
          </Group>

          <TextInput
            label="Nome do Step"
            placeholder="Ex: Agachamento assistido"
            required
            {...stepForm.getInputProps('nome')}
          />

          <Textarea
            label="Descrição"
            placeholder="Descrição do exercício/movimento"
            autosize
            minRows={2}
            {...stepForm.getInputProps('descricao')}
          />

          <Textarea
            label="Critério de Avanço"
            placeholder="Quando a aluna pode avançar para o próximo step?"
            autosize
            minRows={2}
            {...stepForm.getInputProps('criterioAvanco')}
          />

          <NumberInput
            label="Número do Step"
            min={1}
            max={20}
            {...stepForm.getInputProps('numeroStep')}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={closeStepModal}>
              Cancelar
            </Button>
            <Button onClick={handleSaveStep} loading={saving} leftSection={<IconCheck size={16} />}>
              Salvar
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de Progressão Ondulatória */}
      <Modal
        opened={ondulatoriaModalOpened}
        onClose={closeOndulatoriaModal}
        title={`Editar Semana ${editingOndulatoria?.semana || ''}`}
        size="lg"
        styles={{ body: { overflow: 'hidden' } }}
      >
        <Stack gap="md">
          <Select
            label="Tipo"
            data={TIPOS_PROGRESSAO}
            {...ondulatoriaForm.getInputProps('tipo')}
          />

          <Select
            label="Fase"
            data={FASES}
            {...ondulatoriaForm.getInputProps('fase')}
          />

          <Box px="md" pb="lg">
            <Text size="sm" fw={500} mb="xs">Intensidade: {ondulatoriaForm.values.intensidade}%</Text>
            <Slider
              min={0}
              max={100}
              step={5}
              marks={[
                { value: 0, label: '0%' },
                { value: 50, label: '50%' },
                { value: 100, label: '100%' },
              ]}
              {...ondulatoriaForm.getInputProps('intensidade')}
            />
          </Box>

          <Box px="md" pb="lg">
            <Text size="sm" fw={500} mb="xs">Volume: {ondulatoriaForm.values.volume}%</Text>
            <Slider
              min={0}
              max={100}
              step={5}
              color="teal"
              marks={[
                { value: 0, label: '0%' },
                { value: 50, label: '50%' },
                { value: 100, label: '100%' },
              ]}
              {...ondulatoriaForm.getInputProps('volume')}
            />
          </Box>

          <Select
            label="Foco"
            data={FOCOS}
            {...ondulatoriaForm.getInputProps('foco')}
          />

          <Textarea
            label="Descrição"
            placeholder="Observações adicionais"
            autosize
            minRows={2}
            {...ondulatoriaForm.getInputProps('descricao')}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={closeOndulatoriaModal}>
              Cancelar
            </Button>
            <Button onClick={handleSaveOndulatoria} loading={saving} leftSection={<IconCheck size={16} />}>
              Salvar
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de Padrão de Movimento */}
      <Modal
        opened={padraoModalOpened}
        onClose={closePadraoModal}
        title={editingPadrao ? 'Editar Padrão' : 'Novo Padrão de Movimento'}
        size="lg"
      >
        <Stack gap="md">
          <TextInput
            label="Nome do Padrão"
            placeholder="Ex: Agachamento, Hinge, Empurrar..."
            required
            {...padraoForm.getInputProps('nome')}
          />

          <Textarea
            label="Descrição"
            placeholder="Descrição do padrão de movimento"
            autosize
            minRows={2}
            {...padraoForm.getInputProps('descricao')}
          />

          <ColorInput
            label="Cor"
            placeholder="Escolha uma cor"
            swatches={['#228be6', '#12b886', '#fab005', '#fa5252', '#7950f2', '#fd7e14']}
            {...padraoForm.getInputProps('cor')}
          />

          <NumberInput
            label="Ordem de exibição"
            min={1}
            max={20}
            {...padraoForm.getInputProps('ordem')}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={closePadraoModal}>
              Cancelar
            </Button>
            <Button onClick={handleSavePadrao} loading={saving} leftSection={<IconCheck size={16} />}>
              Salvar
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de Criar Progressão Ondulatória */}
      <Modal
        opened={createOndulatoriaModalOpened}
        onClose={closeCreateOndulatoriaModal}
        title="Nova Semana de Progressão"
        size="lg"
        styles={{ body: { overflow: 'hidden' } }}
      >
        <Stack gap="md">
          <NumberInput
            label="Número da Semana"
            min={1}
            max={12}
            required
            {...createOndulatoriaForm.getInputProps('semana')}
          />

          <Select
            label="Tipo"
            data={TIPOS_PROGRESSAO}
            {...createOndulatoriaForm.getInputProps('tipo')}
          />

          <Select
            label="Fase"
            data={FASES}
            {...createOndulatoriaForm.getInputProps('fase')}
          />

          <Box px="md" pb="lg">
            <Text size="sm" fw={500} mb="xs">Intensidade: {createOndulatoriaForm.values.intensidade}%</Text>
            <Slider
              min={0}
              max={100}
              step={5}
              marks={[
                { value: 0, label: '0%' },
                { value: 50, label: '50%' },
                { value: 100, label: '100%' },
              ]}
              {...createOndulatoriaForm.getInputProps('intensidade')}
            />
          </Box>

          <Box px="md" pb="lg">
            <Text size="sm" fw={500} mb="xs">Volume: {createOndulatoriaForm.values.volume}%</Text>
            <Slider
              min={0}
              max={100}
              step={5}
              color="teal"
              marks={[
                { value: 0, label: '0%' },
                { value: 50, label: '50%' },
                { value: 100, label: '100%' },
              ]}
              {...createOndulatoriaForm.getInputProps('volume')}
            />
          </Box>

          <Select
            label="Foco"
            data={FOCOS}
            {...createOndulatoriaForm.getInputProps('foco')}
          />

          <Textarea
            label="Descrição"
            placeholder="Observações adicionais"
            autosize
            minRows={2}
            {...createOndulatoriaForm.getInputProps('descricao')}
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={closeCreateOndulatoriaModal}>
              Cancelar
            </Button>
            <Button onClick={handleCreateOndulatoria} loading={saving} leftSection={<IconCheck size={16} />}>
              Criar
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
