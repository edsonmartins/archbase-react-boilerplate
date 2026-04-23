/**
 * ExercicioFichaView - Visualização detalhada do Exercício
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Grid,
  Paper,
  Stack,
  Group,
  Text,
  Title,
  Badge,
  Button,
  Divider,
  Image,
  AspectRatio,
  Loader,
  Center,
  ThemeIcon,
  Progress,
  Timeline,
  Table,
  Box,
  Tabs,
  ScrollArea,
} from '@mantine/core'
import {
  IconArrowLeft,
  IconEdit,
  IconBarbell,
  IconClock,
  IconRepeat,
  IconVideo,
  IconTarget,
  IconTrendingUp,
  IconUsers,
  IconPlayerPlay,
  IconCheck,
  IconInfoCircle,
  IconActivity,
} from '@tabler/icons-react'
import { ArchbaseNotifications } from '@archbase/components'
import { useInjection } from 'inversify-react'

import { ExercicioDto } from '../../domain/exercicio/ExercicioDto'
import { ExercicioService } from '../../services/ExercicioService'
import { API_TYPE } from '../../ioc/IOCTypes'
import { EXERCICIOS_ROUTE, EXERCICIO_EDITAR_ROUTE } from '../../navigation/navigationDataConstants'

// ============================================
// MOCK DATA - Desativar após validação
// ============================================
const USE_MOCK_DATA = true

const mockExercicio = new ExercicioDto({
  id: 'ex-001',
  nome: 'Agachamento Livre',
  descricao: 'Agachamento com peso corporal, exercício fundamental para fortalecimento de membros inferiores.',
  instrucoes: `1. Posicione os pés na largura dos ombros
2. Mantenha o core ativado e coluna neutra
3. Inicie o movimento flexionando quadril e joelhos
4. Desça até as coxas ficarem paralelas ao chão
5. Empurre o chão para retornar à posição inicial
6. Mantenha os joelhos alinhados com os pés`,
  categoria: 'Força',
  nivel: 'INICIANTE',
  padraoMovimento: 'AGACHAMENTO',
  stepPadrao: 1,
  equipamento: 'NENHUM',
  duracaoSegundos: 45,
  repeticoes: 12,
  series: 3,
  videoUrl: 'https://example.com/video1',
  imagemUrl: '',
  ativo: true,
  gruposMusculares: ['Quadríceps', 'Glúteos', 'Core', 'Isquiotibiais'],
})

// Mock de estatísticas
const mockStats = {
  vezesUsado: 1247,
  treinosAtivos: 23,
  feedbackMedio: 4.6,
  completionRate: 94,
}

// Mock de treinos que usam este exercício
const mockTreinosUsando = [
  { id: 'treino-001', nome: 'Treino A - Força Inferior', fase: 'FORCA_FUNCIONAL', semana: 1 },
  { id: 'treino-002', nome: 'Treino Full Body Iniciante', fase: 'FORCA_FUNCIONAL', semana: 2 },
  { id: 'treino-003', nome: 'Pernas & Glúteos', fase: 'FORCA_FUNCIONAL', semana: 1 },
]

// Mock de progressão no padrão
const mockProgressao = [
  { step: 1, nome: 'Agachamento Livre', atual: true },
  { step: 2, nome: 'Agachamento com Pausa' },
  { step: 3, nome: 'Agachamento com Halteres' },
  { step: 4, nome: 'Goblet Squat' },
  { step: 5, nome: 'Agachamento Frontal' },
]

export function ExercicioFichaView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const exercicioService = useInjection<ExercicioService>(API_TYPE.ExercicioService)

  const [loading, setLoading] = useState(true)
  const [exercicio, setExercicio] = useState<ExercicioDto | null>(null)

  useEffect(() => {
    loadExercicio()
  }, [id])

  const loadExercicio = async () => {
    if (!id) return
    try {
      setLoading(true)
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setExercicio({ ...mockExercicio, id })
      } else {
        const data = await exercicioService.findOne(id)
        setExercicio(data)
      }
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível carregar o exercício')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate(EXERCICIOS_ROUTE)
  }

  const handleEdit = () => {
    if (exercicio) {
      navigate(`${EXERCICIO_EDITAR_ROUTE.replace(':id', exercicio.id)}?action=edit`)
    }
  }

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    )
  }

  if (!exercicio) {
    return (
      <Center h={400}>
        <Stack align="center" gap="md">
          <Text size="lg" c="dimmed">Exercício não encontrado</Text>
          <Button variant="light" onClick={handleBack}>Voltar</Button>
        </Stack>
      </Center>
    )
  }

  return (
    <Stack gap="lg" p="md">
      {/* Header */}
      <Group justify="space-between">
        <Group>
          <Button variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={handleBack}>
            Voltar
          </Button>
          <Title order={2}>{exercicio.nome}</Title>
          <NivelBadge nivel={exercicio.nivel} />
          {!exercicio.ativo && <Badge color="gray">Inativo</Badge>}
        </Group>
        <Button leftSection={<IconEdit size={16} />} onClick={handleEdit}>
          Editar
        </Button>
      </Group>

      <Grid gutter="lg">
        {/* Sidebar - Informações principais */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            {/* Imagem/Vídeo */}
            <Paper withBorder p="md" radius="md">
              <AspectRatio ratio={16 / 9}>
                {exercicio.imagemUrl ? (
                  <Image src={exercicio.imagemUrl} radius="md" fit="cover" />
                ) : (
                  <Center style={{ backgroundColor: '#f0f0f0', borderRadius: 8 }}>
                    <Stack align="center" gap="xs">
                      <IconBarbell size={48} color="#aaa" />
                      <Text size="sm" c="dimmed">Sem imagem</Text>
                    </Stack>
                  </Center>
                )}
              </AspectRatio>
              {exercicio.videoUrl && (
                <Button
                  variant="light"
                  leftSection={<IconPlayerPlay size={16} />}
                  fullWidth
                  mt="md"
                  component="a"
                  href={exercicio.videoUrl}
                  target="_blank"
                >
                  Ver Vídeo Demonstrativo
                </Button>
              )}
            </Paper>

            {/* Métricas rápidas */}
            <Paper withBorder p="md" radius="md">
              <Stack gap="sm">
                <Group gap="xs">
                  <ThemeIcon size="sm" variant="light" color="blue">
                    <IconClock size={14} />
                  </ThemeIcon>
                  <Text size="sm" fw={500}>Duração:</Text>
                  <Text size="sm">
                    {exercicio.duracaoSegundos
                      ? `${Math.floor(exercicio.duracaoSegundos / 60)}:${String(exercicio.duracaoSegundos % 60).padStart(2, '0')}`
                      : '-'}
                  </Text>
                </Group>

                <Group gap="xs">
                  <ThemeIcon size="sm" variant="light" color="green">
                    <IconRepeat size={14} />
                  </ThemeIcon>
                  <Text size="sm" fw={500}>Repetições:</Text>
                  <Text size="sm">
                    {exercicio.repeticoes ? `${exercicio.repeticoes}` : exercicio.repeticoesTexto || '-'}
                  </Text>
                </Group>

                <Group gap="xs">
                  <ThemeIcon size="sm" variant="light" color="violet">
                    <IconTarget size={14} />
                  </ThemeIcon>
                  <Text size="sm" fw={500}>Séries:</Text>
                  <Text size="sm">{exercicio.series || '-'}</Text>
                </Group>

                <Divider my="xs" />

                <Group gap="xs">
                  <ThemeIcon size="sm" variant="light" color="teal">
                    <IconBarbell size={14} />
                  </ThemeIcon>
                  <Text size="sm" fw={500}>Equipamento:</Text>
                  <Badge variant="outline" size="sm">
                    {formatEquipamento(exercicio.equipamento)}
                  </Badge>
                </Group>

                <Group gap="xs">
                  <ThemeIcon size="sm" variant="light" color="orange">
                    <IconActivity size={14} />
                  </ThemeIcon>
                  <Text size="sm" fw={500}>Padrão:</Text>
                  <Badge variant="light" color="orange" size="sm">
                    {formatPadrao(exercicio.padraoMovimento)}
                  </Badge>
                </Group>

                {exercicio.stepPadrao && (
                  <Group gap="xs">
                    <ThemeIcon size="sm" variant="light" color="cyan">
                      <IconTrendingUp size={14} />
                    </ThemeIcon>
                    <Text size="sm" fw={500}>Step:</Text>
                    <Text size="sm">{exercicio.stepPadrao} de 10</Text>
                  </Group>
                )}
              </Stack>
            </Paper>

            {/* Grupos Musculares */}
            {exercicio.gruposMusculares && exercicio.gruposMusculares.length > 0 && (
              <Paper withBorder p="md" radius="md">
                <Text size="sm" fw={600} mb="sm">Grupos Musculares</Text>
                <Group gap="xs">
                  {exercicio.gruposMusculares.map((grupo, index) => (
                    <Badge key={index} variant="dot" color="blue" size="sm">
                      {grupo}
                    </Badge>
                  ))}
                </Group>
              </Paper>
            )}
          </Stack>
        </Grid.Col>

        {/* Main - Detalhes e estatísticas */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder radius="md" style={{ height: '100%' }}>
            <Tabs defaultValue="detalhes" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Tabs.List px="md" pt="md">
                <Tabs.Tab value="detalhes" leftSection={<IconInfoCircle size={16} />}>
                  Detalhes
                </Tabs.Tab>
                <Tabs.Tab value="estatisticas" leftSection={<IconTrendingUp size={16} />}>
                  Estatísticas
                </Tabs.Tab>
                <Tabs.Tab value="progressao" leftSection={<IconActivity size={16} />}>
                  Progressão
                </Tabs.Tab>
              </Tabs.List>

              {/* Tab Detalhes */}
              <Tabs.Panel value="detalhes" p="md" style={{ flex: 1 }}>
                <ScrollArea h="calc(100vh - 280px)" offsetScrollbars>
                  <Stack gap="lg" pr="sm">
                    <Box>
                      <Text size="sm" fw={600} c="dimmed" mb="xs">Descrição</Text>
                      <Text size="sm">{exercicio.descricao || 'Sem descrição'}</Text>
                    </Box>

                    {exercicio.instrucoes && (
                      <Box>
                        <Text size="sm" fw={600} c="dimmed" mb="xs">Instruções de Execução</Text>
                        <Paper withBorder p="md" bg="gray.0" radius="sm">
                          <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
                            {exercicio.instrucoes}
                          </Text>
                        </Paper>
                      </Box>
                    )}

                    <Divider />

                    <Box>
                      <Text size="sm" fw={600} c="dimmed" mb="sm">Treinos que Usam Este Exercício</Text>
                      <Table striped highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Treino</Table.Th>
                            <Table.Th>Fase</Table.Th>
                            <Table.Th>Semana</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {mockTreinosUsando.map((treino) => (
                            <Table.Tr key={treino.id}>
                              <Table.Td>
                                <Text size="sm" fw={500}>{treino.nome}</Text>
                              </Table.Td>
                              <Table.Td>
                                <Badge variant="light" color="teal" size="sm">
                                  {formatFase(treino.fase)}
                                </Badge>
                              </Table.Td>
                              <Table.Td>
                                <Text size="sm">Semana {treino.semana}</Text>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                    </Box>
                  </Stack>
                </ScrollArea>
              </Tabs.Panel>

              {/* Tab Estatísticas */}
              <Tabs.Panel value="estatisticas" p="md" style={{ flex: 1 }}>
                <ScrollArea h="calc(100vh - 280px)" offsetScrollbars>
                  <Stack gap="lg" pr="sm">
                    <Grid>
                      <Grid.Col span={6}>
                        <Paper withBorder p="md" radius="md">
                          <Group gap="xs" mb="xs">
                            <ThemeIcon size="md" variant="light" color="blue">
                              <IconRepeat size={16} />
                            </ThemeIcon>
                            <Text size="xs" c="dimmed">Vezes Executado</Text>
                          </Group>
                          <Text size="xl" fw={700}>{mockStats.vezesUsado.toLocaleString()}</Text>
                        </Paper>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Paper withBorder p="md" radius="md">
                          <Group gap="xs" mb="xs">
                            <ThemeIcon size="md" variant="light" color="green">
                              <IconUsers size={16} />
                            </ThemeIcon>
                            <Text size="xs" c="dimmed">Treinos Ativos</Text>
                          </Group>
                          <Text size="xl" fw={700}>{mockStats.treinosAtivos}</Text>
                        </Paper>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Paper withBorder p="md" radius="md">
                          <Group gap="xs" mb="xs">
                            <ThemeIcon size="md" variant="light" color="yellow">
                              <IconTrendingUp size={16} />
                            </ThemeIcon>
                            <Text size="xs" c="dimmed">Feedback Médio</Text>
                          </Group>
                          <Text size="xl" fw={700}>{mockStats.feedbackMedio}/5</Text>
                        </Paper>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Paper withBorder p="md" radius="md">
                          <Group gap="xs" mb="xs">
                            <ThemeIcon size="md" variant="light" color="teal">
                              <IconCheck size={16} />
                            </ThemeIcon>
                            <Text size="xs" c="dimmed">Taxa de Conclusão</Text>
                          </Group>
                          <Text size="xl" fw={700}>{mockStats.completionRate}%</Text>
                        </Paper>
                      </Grid.Col>
                    </Grid>

                    <Box>
                      <Text size="sm" fw={600} c="dimmed" mb="sm">Desempenho por Nível de Aluna</Text>
                      <Stack gap="sm">
                        <Box>
                          <Group justify="space-between" mb={4}>
                            <Text size="sm">Iniciante</Text>
                            <Text size="sm" c="dimmed">92%</Text>
                          </Group>
                          <Progress value={92} color="green" size="sm" />
                        </Box>
                        <Box>
                          <Group justify="space-between" mb={4}>
                            <Text size="sm">Intermediário</Text>
                            <Text size="sm" c="dimmed">96%</Text>
                          </Group>
                          <Progress value={96} color="blue" size="sm" />
                        </Box>
                        <Box>
                          <Group justify="space-between" mb={4}>
                            <Text size="sm">Avançado</Text>
                            <Text size="sm" c="dimmed">98%</Text>
                          </Group>
                          <Progress value={98} color="violet" size="sm" />
                        </Box>
                      </Stack>
                    </Box>
                  </Stack>
                </ScrollArea>
              </Tabs.Panel>

              {/* Tab Progressão */}
              <Tabs.Panel value="progressao" p="md" style={{ flex: 1 }}>
                <ScrollArea h="calc(100vh - 280px)" offsetScrollbars>
                  <Stack gap="lg" pr="sm">
                    <Text size="sm" c="dimmed">
                      Este exercício faz parte do padrão <strong>{formatPadrao(exercicio.padraoMovimento)}</strong>.
                      Abaixo está a progressão completa deste padrão.
                    </Text>

                    <Timeline active={0} bulletSize={24} lineWidth={2}>
                      {mockProgressao.map((step, index) => (
                        <Timeline.Item
                          key={step.step}
                          bullet={
                            step.atual ? (
                              <ThemeIcon size={24} radius="xl" color="blue">
                                <IconCheck size={14} />
                              </ThemeIcon>
                            ) : undefined
                          }
                          title={
                            <Group gap="xs">
                              <Text fw={step.atual ? 700 : 400}>
                                Step {step.step}: {step.nome}
                              </Text>
                              {step.atual && (
                                <Badge size="xs" color="blue">Atual</Badge>
                              )}
                            </Group>
                          }
                        >
                          <Text size="xs" c="dimmed">
                            {step.atual
                              ? 'Este é o exercício atual na progressão'
                              : index < mockProgressao.findIndex(s => s.atual)
                                ? 'Nível anterior na progressão'
                                : 'Próximo nível na progressão'}
                          </Text>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </Stack>
                </ScrollArea>
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  )
}

// Componentes auxiliares
function NivelBadge({ nivel }: { nivel?: string }) {
  const colors: Record<string, string> = {
    INICIANTE: 'green',
    INTERMEDIARIO: 'yellow',
    AVANCADO: 'red',
    TODOS: 'blue',
  }
  const labels: Record<string, string> = {
    INICIANTE: 'Iniciante',
    INTERMEDIARIO: 'Intermediário',
    AVANCADO: 'Avançado',
    TODOS: 'Todos os Níveis',
  }
  return (
    <Badge color={colors[nivel || ''] || 'gray'} variant="filled">
      {labels[nivel || ''] || nivel || '-'}
    </Badge>
  )
}

function formatEquipamento(equipamento?: string): string {
  const map: Record<string, string> = {
    NENHUM: 'Nenhum',
    HALTERES: 'Halteres',
    BARRA: 'Barra',
    ELASTICO: 'Elástico',
    COLCHONETE: 'Colchonete',
    KETTLEBELL: 'Kettlebell',
    BOLA: 'Bola',
    BANCO: 'Banco',
  }
  return map[equipamento || ''] || equipamento || '-'
}

function formatPadrao(padrao?: string): string {
  const map: Record<string, string> = {
    AGACHAMENTO: 'Agachamento',
    HINGE: 'Hinge',
    EMPURRAR: 'Empurrar',
    PUXAR: 'Puxar',
    CORE: 'Core',
    MOBILIDADE: 'Mobilidade',
  }
  return map[padrao || ''] || padrao || '-'
}

function formatFase(fase?: string): string {
  const map: Record<string, string> = {
    LIBERACAO_MIOFASCIAL: 'Liberação Miofascial',
    MOBILIDADE_ARTICULAR: 'Mobilidade Articular',
    CORE_QUADRIL: 'Core + Quadril',
    FORCA_FUNCIONAL: 'Força Funcional',
    CARDIO_CONSCIENTE: 'Cardio Consciente',
    DESACELERACAO: 'Desaceleração',
  }
  return map[fase || ''] || fase || '-'
}
