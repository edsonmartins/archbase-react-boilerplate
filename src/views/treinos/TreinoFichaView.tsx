/**
 * TreinoFichaView - Ficha completa do Treino
 * Layout: Sidebar (3 cols) + Main (9 cols) com 3 Tabs
 */
import { useState, useEffect } from 'react'
import {
  Grid,
  Stack,
  Group,
  Text,
  Paper,
  Badge,
  Button,
  Tabs,
  Progress,
  Timeline,
  ThemeIcon,
  Box,
  Divider,
  Loader,
  Center,
  Title,
  SimpleGrid,
  ScrollArea,
  Accordion,
  Table,
} from '@mantine/core'
import {
  IconEdit,
  IconClock,
  IconFlame,
  IconActivity,
  IconRun,
  IconCheck,
  IconArrowLeft,
  IconUsers,
  IconChartBar,
  IconList,
  IconPlayerPlay,
} from '@tabler/icons-react'
import { useParams, useNavigate } from 'react-router-dom'
import { useInjection } from 'inversify-react'
import { ArchbaseNotifications } from '@archbase/components'

import { TreinoDto } from '../../domain/treino/TreinoDto'
import { TreinoService } from '../../services/TreinoService'
import { API_TYPE } from '../../ioc/IOCTypes'
import { TREINO_EDITAR_ROUTE, TREINOS_ROUTE } from '../../navigation/navigationDataConstants'

// ============================================
// MOCK DATA - Desativar após validação
// ============================================
const USE_MOCK_DATA = true

const mockTreino = new TreinoDto({
  id: 'treino-001',
  nome: 'Treino A - Força Inferior',
  descricao: 'Foco em fortalecimento de membros inferiores e core. Ideal para iniciantes que desejam desenvolver base sólida de força.',
  nivel: 'INICIANTE',
  categoria: 'Força',
  semana: 1,
  tipoTreino: 'A',
  duracaoMinutos: 45,
  caloriasPrevistas: 280,
  ativo: true,
  exerciciosCount: 8,
  fases: [
    {
      tipo: 'LIBERACAO_MIOFASCIAL',
      nome: 'Liberação Miofascial',
      cor: 'teal',
      duracaoMinutos: 5,
      exercicios: [
        { id: '1', exercicioId: 'ex-001', exercicioNome: 'Foam Roller Quadríceps', ordem: 1, series: 1, repeticoes: '60s' },
        { id: '2', exercicioId: 'ex-002', exercicioNome: 'Foam Roller Glúteos', ordem: 2, series: 1, repeticoes: '60s' },
      ],
    },
    {
      tipo: 'MOBILIDADE_ARTICULAR',
      nome: 'Mobilidade Articular',
      cor: 'blue',
      duracaoMinutos: 5,
      exercicios: [
        { id: '3', exercicioId: 'ex-003', exercicioNome: 'Círculos de Quadril', ordem: 1, series: 2, repeticoes: '10' },
        { id: '4', exercicioId: 'ex-004', exercicioNome: 'Rotação Torácica', ordem: 2, series: 2, repeticoes: '8' },
      ],
    },
    {
      tipo: 'CORE_QUADRIL',
      nome: 'Core + Quadril',
      cor: 'violet',
      duracaoMinutos: 8,
      exercicios: [
        { id: '5', exercicioId: 'ex-005', exercicioNome: 'Dead Bug', ordem: 1, series: 3, repeticoes: '10' },
        { id: '6', exercicioId: 'ex-006', exercicioNome: 'Ponte de Glúteos', ordem: 2, series: 3, repeticoes: '12' },
      ],
    },
    {
      tipo: 'FORCA_FUNCIONAL',
      nome: 'Força Funcional',
      cor: 'yellow',
      duracaoMinutos: 20,
      exercicios: [
        { id: '7', exercicioId: 'ex-007', exercicioNome: 'Agachamento Livre', ordem: 1, series: 3, repeticoes: '12' },
        { id: '8', exercicioId: 'ex-008', exercicioNome: 'Afundo Estático', ordem: 2, series: 3, repeticoes: '10' },
        { id: '9', exercicioId: 'ex-009', exercicioNome: 'Elevação de Panturrilha', ordem: 3, series: 3, repeticoes: '15' },
      ],
    },
    {
      tipo: 'CARDIO_CONSCIENTE',
      nome: 'Cardio Consciente',
      cor: 'orange',
      duracaoMinutos: 5,
      exercicios: [
        { id: '10', exercicioId: 'ex-010', exercicioNome: 'Caminhada no Lugar', ordem: 1, series: 1, repeticoes: '3min' },
      ],
    },
    {
      tipo: 'DESACELERACAO',
      nome: 'Desaceleração',
      cor: 'teal',
      duracaoMinutos: 5,
      exercicios: [
        { id: '11', exercicioId: 'ex-011', exercicioNome: 'Alongamento Isquiotibiais', ordem: 1, series: 1, repeticoes: '30s' },
        { id: '12', exercicioId: 'ex-012', exercicioNome: 'Respiração Diafragmática', ordem: 2, series: 1, repeticoes: '2min' },
      ],
    },
  ],
})

// Mock estatísticas
const mockEstatisticas = {
  totalExecucoes: 156,
  mediaAvaliacao: 4.7,
  taxaConclusao: 92,
  ultimaExecucao: '2024-04-20',
  alunosAtivos: 28,
}

// Mock últimas execuções
const mockExecucoes = [
  { id: '1', alunoNome: 'Maria Silva', data: '2024-04-20', nota: 5, concluido: true },
  { id: '2', alunoNome: 'Ana Costa', data: '2024-04-19', nota: 4, concluido: true },
  { id: '3', alunoNome: 'Juliana Oliveira', data: '2024-04-19', nota: 5, concluido: true },
  { id: '4', alunoNome: 'Fernanda Lima', data: '2024-04-18', nota: 4, concluido: false },
  { id: '5', alunoNome: 'Camila Rodrigues', data: '2024-04-18', nota: 5, concluido: true },
]

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color?: string
}

function MetricCard({ title, value, icon, color = 'blue' }: MetricCardProps) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between">
        <Box>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text size="xl" fw={700}>
            {value}
          </Text>
        </Box>
        <ThemeIcon color={color} variant="light" size={48} radius="md">
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  )
}

function NivelBadge({ nivel }: { nivel?: string }) {
  const colors: Record<string, string> = {
    INICIANTE: 'green',
    INTERMEDIARIO: 'yellow',
    AVANCADO: 'red',
  }
  const labels: Record<string, string> = {
    INICIANTE: 'Iniciante',
    INTERMEDIARIO: 'Intermediário',
    AVANCADO: 'Avançado',
  }
  return (
    <Badge color={colors[nivel || ''] || 'gray'} variant="light" size="lg">
      {labels[nivel || ''] || nivel || '-'}
    </Badge>
  )
}

export function TreinoFichaView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const treinoService = useInjection<TreinoService>(API_TYPE.TreinoService)

  const [loading, setLoading] = useState(true)
  const [treino, setTreino] = useState<TreinoDto | null>(null)

  useEffect(() => {
    loadTreino()
  }, [id])

  const loadTreino = async () => {
    if (!id) return

    try {
      setLoading(true)
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setTreino(mockTreino)
      } else {
        const record = await treinoService.findOne(id)
        setTreino(new TreinoDto(record))
      }
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível carregar os dados do treino')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(TREINOS_ROUTE)
  }

  const handleEdit = () => {
    if (treino) {
      navigate(`${TREINO_EDITAR_ROUTE.replace(':id', treino.id)}?action=edit`)
    }
  }

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    )
  }

  if (!treino) {
    return (
      <Center h={400}>
        <Text>Treino não encontrado</Text>
      </Center>
    )
  }

  const totalExercicios = treino.fases?.reduce((acc, fase) => acc + (fase.exercicios?.length || 0), 0) || 0

  return (
    <Box p="md">
      <Grid>
        {/* ============================================ */}
        {/* SIDEBAR (3 cols) */}
        {/* ============================================ */}
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Paper withBorder p="lg" radius="md">
            <Stack gap="md">
              <Group>
                <Button
                  variant="subtle"
                  leftSection={<IconArrowLeft size={16} />}
                  onClick={handleBack}
                  size="xs"
                >
                  Voltar
                </Button>
              </Group>

              <Box ta="center">
                <ThemeIcon size={60} variant="light" color="teal" radius="xl" mx="auto" mb="md">
                  <IconRun size={30} />
                </ThemeIcon>
                <Text size="lg" fw={600}>
                  {treino.nome}
                </Text>
                <Group gap="xs" justify="center" mt="xs">
                  <NivelBadge nivel={treino.nivel} />
                  <Badge color={treino.ativo ? 'green' : 'gray'} variant="light">
                    {treino.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </Group>
              </Box>

              <Divider />

              <Stack gap="xs">
                <Group gap="xs">
                  <IconClock size={16} color="gray" />
                  <Text size="sm">{treino.duracaoMinutos} minutos</Text>
                </Group>
                <Group gap="xs">
                  <IconFlame size={16} color="gray" />
                  <Text size="sm">{treino.caloriasPrevistas || '~280'} calorias</Text>
                </Group>
                <Group gap="xs">
                  <IconList size={16} color="gray" />
                  <Text size="sm">{totalExercicios} exercícios</Text>
                </Group>
                <Group gap="xs">
                  <IconActivity size={16} color="gray" />
                  <Text size="sm">{treino.categoria}</Text>
                </Group>
                {treino.semana && (
                  <Group gap="xs">
                    <IconChartBar size={16} color="gray" />
                    <Text size="sm">Semana {treino.semana}</Text>
                  </Group>
                )}
              </Stack>

              <Divider />

              <Stack gap="xs">
                <Button
                  fullWidth
                  variant="light"
                  color="yellow"
                  leftSection={<IconEdit size={16} />}
                  onClick={handleEdit}
                >
                  Editar
                </Button>
                <Button
                  fullWidth
                  variant="light"
                  color="teal"
                  leftSection={<IconPlayerPlay size={16} />}
                  disabled
                >
                  Prévia do Treino
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid.Col>

        {/* ============================================ */}
        {/* MAIN (9 cols) - 3 Tabs */}
        {/* ============================================ */}
        <Grid.Col span={{ base: 12, md: 9 }}>
          <Tabs defaultValue="fases" variant="pills">
            <Tabs.List mb="md">
              <Tabs.Tab value="fases" leftSection={<IconList size={16} />}>
                6 Fases
              </Tabs.Tab>
              <Tabs.Tab value="estatisticas" leftSection={<IconChartBar size={16} />}>
                Estatísticas
              </Tabs.Tab>
              <Tabs.Tab value="execucoes" leftSection={<IconUsers size={16} />}>
                Execuções
              </Tabs.Tab>
            </Tabs.List>

            {/* TAB: 6 Fases */}
            <Tabs.Panel value="fases">
              <ScrollArea h="calc(100vh - 160px)" offsetScrollbars>
                <Stack gap="md" pr="sm">
                  {treino.descricao && (
                    <Paper withBorder p="md">
                      <Text size="sm" c="dimmed">{treino.descricao}</Text>
                    </Paper>
                  )}

                  <Accordion variant="separated" multiple defaultValue={['LIBERACAO_MIOFASCIAL', 'FORCA_FUNCIONAL']}>
                    {treino.fases?.map((fase) => (
                      <Accordion.Item key={fase.tipo} value={fase.tipo}>
                        <Accordion.Control>
                          <Group>
                            <ThemeIcon color={fase.cor} variant="light" size="sm">
                              <IconActivity size={14} />
                            </ThemeIcon>
                            <Text fw={500}>{fase.nome}</Text>
                            <Badge size="sm" variant="light">
                              {fase.exercicios?.length || 0} exercícios
                            </Badge>
                            {fase.duracaoMinutos && (
                              <Badge size="sm" variant="outline" color="gray">
                                {fase.duracaoMinutos} min
                              </Badge>
                            )}
                          </Group>
                        </Accordion.Control>
                        <Accordion.Panel>
                          {fase.exercicios && fase.exercicios.length > 0 ? (
                            <Table>
                              <Table.Thead>
                                <Table.Tr>
                                  <Table.Th>#</Table.Th>
                                  <Table.Th>Exercício</Table.Th>
                                  <Table.Th>Séries</Table.Th>
                                  <Table.Th>Repetições</Table.Th>
                                </Table.Tr>
                              </Table.Thead>
                              <Table.Tbody>
                                {fase.exercicios.map((ex) => (
                                  <Table.Tr key={ex.id}>
                                    <Table.Td>
                                      <Badge size="sm" variant="light" color={fase.cor}>
                                        {ex.ordem}
                                      </Badge>
                                    </Table.Td>
                                    <Table.Td>
                                      <Text size="sm">{ex.exercicioNome}</Text>
                                    </Table.Td>
                                    <Table.Td>
                                      <Text size="sm">{ex.series}x</Text>
                                    </Table.Td>
                                    <Table.Td>
                                      <Text size="sm">{ex.repeticoes}</Text>
                                    </Table.Td>
                                  </Table.Tr>
                                ))}
                              </Table.Tbody>
                            </Table>
                          ) : (
                            <Text size="sm" c="dimmed" ta="center" py="md">
                              Nenhum exercício cadastrado nesta fase
                            </Text>
                          )}
                        </Accordion.Panel>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </Stack>
              </ScrollArea>
            </Tabs.Panel>

            {/* TAB: Estatísticas */}
            <Tabs.Panel value="estatisticas">
              <ScrollArea h="calc(100vh - 160px)" offsetScrollbars>
                <Stack gap="lg" pr="sm">
                  <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }}>
                    <MetricCard
                      title="Execuções"
                      value={mockEstatisticas.totalExecucoes}
                      icon={<IconPlayerPlay size={24} />}
                      color="blue"
                    />
                    <MetricCard
                      title="Avaliação Média"
                      value={`${mockEstatisticas.mediaAvaliacao}/5`}
                      icon={<IconActivity size={24} />}
                      color="yellow"
                    />
                    <MetricCard
                      title="Taxa Conclusão"
                      value={`${mockEstatisticas.taxaConclusao}%`}
                      icon={<IconCheck size={24} />}
                      color="green"
                    />
                    <MetricCard
                      title="Alunas Ativas"
                      value={mockEstatisticas.alunosAtivos}
                      icon={<IconUsers size={24} />}
                      color="violet"
                    />
                    <MetricCard
                      title="Última Execução"
                      value={new Date(mockEstatisticas.ultimaExecucao).toLocaleDateString('pt-BR')}
                      icon={<IconClock size={24} />}
                      color="teal"
                    />
                  </SimpleGrid>

                  <Paper withBorder p="md">
                    <Title order={5} mb="md">Distribuição por Fase</Title>
                    <Stack gap="sm">
                      {treino.fases?.map((fase) => {
                        const porcentagem = fase.duracaoMinutos
                          ? Math.round((fase.duracaoMinutos / treino.duracaoMinutos) * 100)
                          : 0
                        return (
                          <Box key={fase.tipo}>
                            <Group justify="space-between" mb="xs">
                              <Text size="sm">{fase.nome}</Text>
                              <Text size="xs" c="dimmed">
                                {fase.duracaoMinutos} min ({porcentagem}%)
                              </Text>
                            </Group>
                            <Progress value={porcentagem} color={fase.cor} size="sm" />
                          </Box>
                        )
                      })}
                    </Stack>
                  </Paper>

                  <Paper withBorder p="md">
                    <Title order={5} mb="md">Exercícios por Padrão de Movimento</Title>
                    <SimpleGrid cols={{ base: 2, md: 3 }}>
                      <Paper withBorder p="sm" ta="center">
                        <Text size="xl" fw={700} c="blue">3</Text>
                        <Text size="xs" c="dimmed">Agachamento</Text>
                      </Paper>
                      <Paper withBorder p="sm" ta="center">
                        <Text size="xl" fw={700} c="teal">2</Text>
                        <Text size="xs" c="dimmed">Hinge</Text>
                      </Paper>
                      <Paper withBorder p="sm" ta="center">
                        <Text size="xl" fw={700} c="violet">3</Text>
                        <Text size="xs" c="dimmed">Core</Text>
                      </Paper>
                      <Paper withBorder p="sm" ta="center">
                        <Text size="xl" fw={700} c="orange">2</Text>
                        <Text size="xs" c="dimmed">Mobilidade</Text>
                      </Paper>
                      <Paper withBorder p="sm" ta="center">
                        <Text size="xl" fw={700} c="yellow">1</Text>
                        <Text size="xs" c="dimmed">Cardio</Text>
                      </Paper>
                      <Paper withBorder p="sm" ta="center">
                        <Text size="xl" fw={700} c="gray">1</Text>
                        <Text size="xs" c="dimmed">Respiração</Text>
                      </Paper>
                    </SimpleGrid>
                  </Paper>
                </Stack>
              </ScrollArea>
            </Tabs.Panel>

            {/* TAB: Execuções */}
            <Tabs.Panel value="execucoes">
              <ScrollArea h="calc(100vh - 160px)" offsetScrollbars>
                <Stack gap="lg" pr="sm">
                  <Paper withBorder p="md">
                    <Title order={5} mb="md">Últimas Execuções</Title>
                    <Timeline active={0} bulletSize={24} lineWidth={2}>
                      {mockExecucoes.map((exec) => (
                        <Timeline.Item
                          key={exec.id}
                          bullet={
                            exec.concluido ? (
                              <IconCheck size={12} />
                            ) : (
                              <IconActivity size={12} />
                            )
                          }
                          title={exec.alunoNome}
                          color={exec.concluido ? 'green' : 'gray'}
                        >
                          <Text size="xs" c="dimmed">
                            {new Date(exec.data).toLocaleDateString('pt-BR')}
                          </Text>
                          {exec.nota > 0 && (
                            <Group gap="xs" mt="xs">
                              <Badge size="sm" color="yellow" variant="light">
                                {exec.nota}/5
                              </Badge>
                              {!exec.concluido && (
                                <Badge size="sm" color="gray" variant="light">
                                  Não concluído
                                </Badge>
                              )}
                            </Group>
                          )}
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </Paper>

                  <Paper withBorder p="md">
                    <Title order={5} mb="md">Alunas que Executaram Este Treino</Title>
                    <Table>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Aluna</Table.Th>
                          <Table.Th>Última Execução</Table.Th>
                          <Table.Th>Total</Table.Th>
                          <Table.Th>Avaliação Média</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        <Table.Tr>
                          <Table.Td>Maria Silva</Table.Td>
                          <Table.Td>20/04/2024</Table.Td>
                          <Table.Td>8</Table.Td>
                          <Table.Td>
                            <Badge color="yellow" variant="light">4.8</Badge>
                          </Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                          <Table.Td>Ana Costa</Table.Td>
                          <Table.Td>19/04/2024</Table.Td>
                          <Table.Td>6</Table.Td>
                          <Table.Td>
                            <Badge color="yellow" variant="light">4.5</Badge>
                          </Table.Td>
                        </Table.Tr>
                        <Table.Tr>
                          <Table.Td>Juliana Oliveira</Table.Td>
                          <Table.Td>19/04/2024</Table.Td>
                          <Table.Td>10</Table.Td>
                          <Table.Td>
                            <Badge color="yellow" variant="light">5.0</Badge>
                          </Table.Td>
                        </Table.Tr>
                      </Table.Tbody>
                    </Table>
                  </Paper>
                </Stack>
              </ScrollArea>
            </Tabs.Panel>
          </Tabs>
        </Grid.Col>
      </Grid>
    </Box>
  )
}
