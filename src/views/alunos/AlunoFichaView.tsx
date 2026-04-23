/**
 * AlunoFichaView - Ficha completa do Aluno
 * Layout: Sidebar (3 cols) + Main (9 cols) com 4 Tabs
 */
import { useState, useEffect } from 'react'
import {
  Grid,
  Stack,
  Group,
  Text,
  Paper,
  Avatar,
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
  Card,
  SimpleGrid,
  RingProgress,
  ScrollArea,
} from '@mantine/core'
import {
  IconUser,
  IconPhone,
  IconMail,
  IconMapPin,
  IconEdit,
  IconAlertTriangle,
  IconBrandWhatsapp,
  IconFlame,
  IconTrophy,
  IconTarget,
  IconActivity,
  IconHeart,
  IconCalendar,
  IconStar,
  IconChartLine,
  IconMoodSmile,
  IconMoon,
  IconRun,
  IconCheck,
} from '@tabler/icons-react'
import { LineChart, BarChart } from '@mantine/charts'
import { useParams, useNavigate } from 'react-router-dom'
import { useInjection } from 'inversify-react'
import { ArchbaseNotifications } from '@archbase/components'

import { AlunoDto } from '../../domain/aluno/AlunoDto'
import { AlunoService } from '../../services/AlunoService'
import { API_TYPE } from '../../ioc/IOCTypes'
import { ALUNO_EDITAR_ROUTE, ALERTAS_ROUTE } from '../../navigation/navigationDataConstants'

// ============================================
// MOCK DATA - Desativar após validação
// ============================================
const USE_MOCK_DATA = true

const mockAluno = new AlunoDto({
  id: 'aluno-001',
  nome: 'Maria Silva Santos',
  email: 'maria.silva@email.com',
  telefone: '(11) 99999-1234',
  nivelTreino: 'INTERMEDIARIO',
  status: 'ATIVO',
  plano: 'ESSENCIAL',
  cidade: 'São Paulo',
  estado: 'SP',
  dataNascimento: '1990-05-15',
  genero: 'FEMININO',
  perfilEmocional: 'MOTIVADO',
  humorPredominante: 8,
  nivelEstresse: 4,
  qualidadeSono: 'BOA',
  emTerapia: 'SIM',
  gatilhosEmocionais: 'Trabalho sob pressão, conflitos familiares',
  observacoesVirginia: 'Aluna muito dedicada, responde bem a desafios. Manter foco em exercícios de respiração quando estressada.',
})

// Dados mockados para demonstracao
const mockHumorData = [
  { date: '01/04', humor: 6 },
  { date: '05/04', humor: 7 },
  { date: '10/04', humor: 5 },
  { date: '15/04', humor: 8 },
  { date: '20/04', humor: 7 },
  { date: '25/04', humor: 9 },
  { date: '30/04', humor: 8 },
]

const mockFrequenciaData = [
  { semana: 'Sem 1', treinos: 3 },
  { semana: 'Sem 2', treinos: 4 },
  { semana: 'Sem 3', treinos: 2 },
  { semana: 'Sem 4', treinos: 5 },
]

const mockTreinosRecentes = [
  { id: '1', nome: 'Treino A - Forca', data: '2024-04-20', concluido: true, nota: 4.5 },
  { id: '2', nome: 'Treino B - Mobilidade', data: '2024-04-18', concluido: true, nota: 5 },
  { id: '3', nome: 'Treino A - Forca', data: '2024-04-16', concluido: true, nota: 4 },
  { id: '4', nome: 'Treino C - Cardio', data: '2024-04-14', concluido: false, nota: 0 },
]

const mockProgressaoPadroes = [
  { padrao: 'Agachamento', step: 4, total: 10, cor: 'blue' },
  { padrao: 'Hinge', step: 3, total: 10, cor: 'teal' },
  { padrao: 'Empurrar', step: 5, total: 10, cor: 'violet' },
  { padrao: 'Puxar', step: 2, total: 10, cor: 'orange' },
  { padrao: 'Core', step: 6, total: 10, cor: 'yellow' },
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

export function AlunoFichaView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const alunoService = useInjection<AlunoService>(API_TYPE.AlunoService)

  const [loading, setLoading] = useState(true)
  const [aluno, setAluno] = useState<AlunoDto | null>(null)

  useEffect(() => {
    loadAluno()
  }, [id])

  const loadAluno = async () => {
    if (!id) return

    try {
      setLoading(true)
      if (USE_MOCK_DATA) {
        // Simula delay de rede
        await new Promise(resolve => setTimeout(resolve, 500))
        setAluno(mockAluno)
      } else {
        const record = await alunoService.findOne(id)
        setAluno(new AlunoDto(record))
      }
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível carregar os dados do aluno')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    if (aluno) {
      navigate(`${ALUNO_EDITAR_ROUTE.replace(':id', aluno.id)}?action=edit`)
    }
  }

  const handleWhatsApp = () => {
    if (aluno?.telefone) {
      const phone = aluno.telefone.replace(/\D/g, '')
      window.open(`https://wa.me/55${phone}`, '_blank')
    }
  }

  const handleCreateAlert = () => {
    navigate(ALERTAS_ROUTE)
  }

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    )
  }

  if (!aluno) {
    return (
      <Center h={400}>
        <Text>Aluno não encontrado</Text>
      </Center>
    )
  }

  // Mock data para gamificacao
  const gamificacao = {
    streakAtual: 12,
    nivel: 5,
    xpTotal: 2450,
    xpProximoNivel: 3000,
    treinosConcluidos: 45,
    diasAtivos: 30,
  }

  return (
    <Box p="md">
      <Grid>
        {/* ============================================ */}
        {/* SIDEBAR (3 cols) */}
        {/* ============================================ */}
        <Grid.Col span={{ base: 12, md: 3 }}>
          <Paper withBorder p="lg" radius="md">
            <Stack align="center" gap="md">
              <Avatar src={aluno.avatarUrl} size={80} radius="xl" color="blue">
                {aluno.nome?.charAt(0)}
              </Avatar>

              <Box ta="center">
                <Text size="lg" fw={600}>
                  {aluno.nome}
                </Text>
                <Group gap="xs" justify="center" mt="xs">
                  <Badge color={aluno.nivelTreino === 'INICIANTE' ? 'green' : aluno.nivelTreino === 'INTERMEDIARIO' ? 'yellow' : 'red'}>
                    {aluno.nivelTreino}
                  </Badge>
                  <Badge color={aluno.status === 'ATIVO' ? 'green' : aluno.status === 'TRIAL' ? 'yellow' : 'gray'}>
                    {aluno.status}
                  </Badge>
                </Group>
              </Box>

              <Group gap="xs">
                <ThemeIcon variant="light" color="orange" size="lg">
                  <IconFlame size={18} />
                </ThemeIcon>
                <Text size="lg" fw={700}>
                  {gamificacao.streakAtual} dias
                </Text>
              </Group>

              <Box w="100%">
                <Group justify="space-between" mb="xs">
                  <Text size="sm">Nível {gamificacao.nivel}</Text>
                  <Text size="xs" c="dimmed">
                    {gamificacao.xpTotal} / {gamificacao.xpProximoNivel} XP
                  </Text>
                </Group>
                <Progress
                  value={(gamificacao.xpTotal / gamificacao.xpProximoNivel) * 100}
                  color="violet"
                  size="sm"
                />
              </Box>

              <Divider w="100%" />

              <Stack gap="xs" w="100%">
                {aluno.cidade && (
                  <Group gap="xs">
                    <IconMapPin size={16} color="gray" />
                    <Text size="sm">
                      {aluno.cidade}{aluno.estado ? `, ${aluno.estado}` : ''}
                    </Text>
                  </Group>
                )}
                {aluno.telefone && (
                  <Group gap="xs">
                    <IconPhone size={16} color="gray" />
                    <Text size="sm">{aluno.telefone}</Text>
                  </Group>
                )}
                <Group gap="xs">
                  <IconMail size={16} color="gray" />
                  <Text size="sm" style={{ wordBreak: 'break-all' }}>
                    {aluno.email}
                  </Text>
                </Group>
              </Stack>

              <Divider w="100%" />

              <Stack gap="xs" w="100%">
                <Button
                  fullWidth
                  variant="light"
                  color="green"
                  leftSection={<IconBrandWhatsapp size={16} />}
                  onClick={handleWhatsApp}
                  disabled={!aluno.telefone}
                >
                  WhatsApp
                </Button>
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
                  color="red"
                  leftSection={<IconAlertTriangle size={16} />}
                  onClick={handleCreateAlert}
                >
                  Criar Alerta
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid.Col>

        {/* ============================================ */}
        {/* MAIN (9 cols) - 4 Tabs */}
        {/* ============================================ */}
        <Grid.Col span={{ base: 12, md: 9 }}>
          <Tabs defaultValue="visao-geral" variant="pills">
            <Tabs.List mb="md">
              <Tabs.Tab value="visao-geral" leftSection={<IconChartLine size={16} />}>
                Visão Geral
              </Tabs.Tab>
              <Tabs.Tab value="treinos" leftSection={<IconRun size={16} />}>
                Treinos
              </Tabs.Tab>
              <Tabs.Tab value="emocional" leftSection={<IconMoodSmile size={16} />}>
                Emocional
              </Tabs.Tab>
              <Tabs.Tab value="alertas" leftSection={<IconAlertTriangle size={16} />}>
                Alertas
              </Tabs.Tab>
            </Tabs.List>

            {/* TAB: Visao Geral */}
            <Tabs.Panel value="visao-geral">
              <ScrollArea h="calc(100vh - 160px)" offsetScrollbars>
                <Stack gap="lg" pr="sm">
                  <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }}>
                    <MetricCard
                      title="Treinos"
                      value={gamificacao.treinosConcluidos}
                      icon={<IconCheck size={24} />}
                      color="green"
                    />
                    <MetricCard
                      title="Dias Ativos"
                      value={gamificacao.diasAtivos}
                      icon={<IconCalendar size={24} />}
                      color="blue"
                    />
                    <MetricCard
                      title="Streak"
                      value={`${gamificacao.streakAtual} dias`}
                      icon={<IconFlame size={24} />}
                      color="orange"
                    />
                    <MetricCard
                      title="XP Total"
                      value={gamificacao.xpTotal}
                      icon={<IconStar size={24} />}
                      color="yellow"
                    />
                    <MetricCard
                      title="Nível"
                      value={gamificacao.nivel}
                      icon={<IconTrophy size={24} />}
                      color="violet"
                    />
                  </SimpleGrid>

                  <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Paper withBorder p="md">
                        <Title order={5} mb="md">Humor - Últimos 30 dias</Title>
                        <LineChart
                          h={200}
                          data={mockHumorData}
                          dataKey="date"
                          series={[{ name: 'humor', color: 'violet' }]}
                          curveType="natural"
                        />
                      </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Paper withBorder p="md">
                        <Title order={5} mb="md">Frequência Semanal</Title>
                        <BarChart
                          h={200}
                          data={mockFrequenciaData}
                          dataKey="semana"
                          series={[{ name: 'treinos', color: 'teal' }]}
                        />
                      </Paper>
                    </Grid.Col>
                  </Grid>

                  <Paper withBorder p="md">
                    <Title order={5} mb="md">Progressão por Padrão de Movimento</Title>
                    <Stack gap="sm">
                      {mockProgressaoPadroes.map((p) => (
                        <Box key={p.padrao}>
                          <Group justify="space-between" mb="xs">
                            <Text size="sm">{p.padrao}</Text>
                            <Text size="xs" c="dimmed">Step {p.step}/{p.total}</Text>
                          </Group>
                          <Progress value={(p.step / p.total) * 100} color={p.cor} size="sm" />
                        </Box>
                      ))}
                    </Stack>
                  </Paper>

                  <Paper withBorder p="md">
                    <Title order={5} mb="md">Desafio Mensal Atual</Title>
                    <Group>
                      <ThemeIcon size={48} variant="light" color="yellow" radius="xl">
                        <IconTarget size={24} />
                      </ThemeIcon>
                      <Box>
                        <Text fw={500}>30 Dias de Treino</Text>
                        <Text size="sm" c="dimmed">15/30 dias completos</Text>
                      </Box>
                      <RingProgress
                        size={80}
                        thickness={8}
                        roundCaps
                        sections={[{ value: 50, color: 'yellow' }]}
                        label={<Text ta="center" size="xs" fw={700}>50%</Text>}
                      />
                    </Group>
                  </Paper>
                </Stack>
              </ScrollArea>
            </Tabs.Panel>

            {/* TAB: Treinos */}
            <Tabs.Panel value="treinos">
              <ScrollArea h="calc(100vh - 160px)" offsetScrollbars>
                <Stack gap="lg" pr="sm">
                  <SimpleGrid cols={{ base: 1, sm: 3 }}>
                    <MetricCard
                      title="Treinos Concluídos"
                      value={45}
                      icon={<IconCheck size={24} />}
                      color="green"
                    />
                    <MetricCard
                      title="Plano Atual"
                      value="Semana 8"
                      icon={<IconCalendar size={24} />}
                      color="blue"
                    />
                    <MetricCard
                      title="Feedback Médio"
                      value="4.5/5"
                      icon={<IconStar size={24} />}
                      color="yellow"
                    />
                  </SimpleGrid>

                  <Paper withBorder p="md">
                    <Title order={5} mb="md">Últimos Treinos</Title>
                    <Timeline active={0} bulletSize={24} lineWidth={2}>
                      {mockTreinosRecentes.map((treino) => (
                        <Timeline.Item
                          key={treino.id}
                          bullet={
                            treino.concluido ? (
                              <IconCheck size={12} />
                            ) : (
                              <IconActivity size={12} />
                            )
                          }
                          title={treino.nome}
                          color={treino.concluido ? 'green' : 'gray'}
                        >
                          <Text size="xs" c="dimmed">
                            {new Date(treino.data).toLocaleDateString('pt-BR')}
                          </Text>
                          {treino.concluido && treino.nota > 0 && (
                            <Group gap="xs" mt="xs">
                              <IconStar size={12} color="orange" />
                              <Text size="xs">{treino.nota}/5</Text>
                            </Group>
                          )}
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </Paper>
                </Stack>
              </ScrollArea>
            </Tabs.Panel>

            {/* TAB: Emocional */}
            <Tabs.Panel value="emocional">
              <ScrollArea h="calc(100vh - 160px)" offsetScrollbars>
                <Stack gap="lg" pr="sm">
                  <SimpleGrid cols={{ base: 1, sm: 3 }}>
                    <MetricCard
                      title="Perfil Emocional"
                      value={aluno.perfilEmocional || 'Não definido'}
                      icon={<IconHeart size={24} />}
                      color="violet"
                    />
                    <MetricCard
                      title="Humor (entrada)"
                      value={`${aluno.humorPredominante || 5}/10`}
                      icon={<IconMoodSmile size={24} />}
                      color="blue"
                    />
                    <MetricCard
                      title="Estresse"
                      value={`${aluno.nivelEstresse || 5}/10`}
                      icon={<IconActivity size={24} />}
                      color="orange"
                    />
                  </SimpleGrid>

                  <Paper withBorder p="md">
                    <Title order={5} mb="md">Humor - Últimos 30 dias</Title>
                    <LineChart
                      h={220}
                      data={mockHumorData}
                      dataKey="date"
                      series={[{ name: 'humor', color: 'violet' }]}
                      curveType="natural"
                    />
                  </Paper>

                  <Grid>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      <Paper withBorder p="md">
                        <Title order={5} mb="md">Anamnese Emocional</Title>
                        <Stack gap="sm">
                          <Group justify="space-between">
                            <Text size="sm">Qualidade do Sono</Text>
                            <Badge color={aluno.qualidadeSono === 'BOA' || aluno.qualidadeSono === 'OTIMA' ? 'green' : 'yellow'}>
                              {aluno.qualidadeSono || 'Não informado'}
                            </Badge>
                          </Group>
                          <Group justify="space-between">
                            <Text size="sm">Em Terapia</Text>
                            <Badge color={aluno.emTerapia === 'SIM' ? 'green' : 'gray'}>
                              {aluno.emTerapia || 'Não informado'}
                            </Badge>
                          </Group>
                          {aluno.gatilhosEmocionais && (
                            <Box>
                              <Text size="sm" fw={500}>Gatilhos Emocionais</Text>
                              <Text size="sm" c="dimmed">{aluno.gatilhosEmocionais}</Text>
                            </Box>
                          )}
                        </Stack>
                      </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 6 }}>
                      {aluno.observacoesVirginia && (
                        <Paper withBorder p="md" bg="violet.0">
                          <Title order={5} mb="md" c="violet">Observações da Virgínia</Title>
                          <Text size="sm">{aluno.observacoesVirginia}</Text>
                        </Paper>
                      )}
                    </Grid.Col>
                  </Grid>
                </Stack>
              </ScrollArea>
            </Tabs.Panel>

            {/* TAB: Alertas */}
            <Tabs.Panel value="alertas">
              <ScrollArea h="calc(100vh - 160px)" offsetScrollbars>
                <Stack gap="lg" pr="sm">
                  <Paper withBorder p="xl" ta="center">
                    <ThemeIcon size={48} variant="light" color="gray" radius="xl" mx="auto" mb="md">
                      <IconAlertTriangle size={24} />
                    </ThemeIcon>
                    <Text size="lg" fw={500} mb="xs">Nenhum alerta ativo</Text>
                    <Text size="sm" c="dimmed" mb="md">
                      Quando houver alertas para esta aluna, eles aparecerão aqui
                    </Text>
                    <Button variant="light" onClick={handleCreateAlert}>
                      Criar Alerta Manual
                    </Button>
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
