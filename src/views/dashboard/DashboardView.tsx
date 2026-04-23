/**
 * DashboardView - Visão geral do BlueVix Admin
 *
 * Exibe KPIs, alertas ativos, tendências de humor, distribuições e top alunos.
 */
import { useEffect, useState } from 'react'
import {
  Card,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Badge,
  Progress,
  Avatar,
  ThemeIcon,
  Loader,
  Center,
  RingProgress,
  Divider,
} from '@mantine/core'
import {
  IconUsers,
  IconActivity,
  IconFlame,
  IconAlertTriangle,
  IconTrendingUp,
  IconMoodSmile,
  IconRun,
  IconTarget,
  IconHeart,
  IconChartDonut,
} from '@tabler/icons-react'
import { AppColors } from '../../theme/AppThemeLight'

interface DashboardStats {
  totalAlunos: number
  alunosAtivos: number
  alunosTrial: number
  sessoesHoje: number
  alertasPendentes: number
  mediaHumor: number
  streakMedio: number
  desafiosAtivos: number
}

interface DistribuicaoNivel {
  nivel: string
  quantidade: number
  percentual: number
  cor: string
}

interface DistribuicaoPerfil {
  perfil: string
  quantidade: number
  percentual: number
  cor: string
}

/**
 * Dashboard principal do BlueVix Admin
 */
export function DashboardView() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalAlunos: 0,
    alunosAtivos: 0,
    alunosTrial: 0,
    sessoesHoje: 0,
    alertasPendentes: 0,
    mediaHumor: 0,
    streakMedio: 0,
    desafiosAtivos: 0,
  })
  const [distribuicaoNivel, setDistribuicaoNivel] = useState<DistribuicaoNivel[]>([])
  const [distribuicaoPerfil, setDistribuicaoPerfil] = useState<DistribuicaoPerfil[]>([])

  useEffect(() => {
    // Simular carregamento de dados
    // TODO: Integrar com API real
    const timer = setTimeout(() => {
      setStats({
        totalAlunos: 47,
        alunosAtivos: 38,
        alunosTrial: 5,
        sessoesHoje: 24,
        alertasPendentes: 3,
        mediaHumor: 7.2,
        streakMedio: 12,
        desafiosAtivos: 2,
      })

      setDistribuicaoNivel([
        { nivel: 'Iniciante', quantidade: 18, percentual: 38, cor: 'green' },
        { nivel: 'Intermediário', quantidade: 20, percentual: 43, cor: 'blue' },
        { nivel: 'Avançado', quantidade: 9, percentual: 19, cor: 'violet' },
      ])

      setDistribuicaoPerfil([
        { perfil: 'Guerreira', quantidade: 12, percentual: 26, cor: 'red' },
        { perfil: 'Equilibrada', quantidade: 15, percentual: 32, cor: 'teal' },
        { perfil: 'Sensível', quantidade: 10, percentual: 21, cor: 'pink' },
        { perfil: 'Resiliente', quantidade: 6, percentual: 13, cor: 'orange' },
        { perfil: 'Cautelosa', quantidade: 4, percentual: 8, cor: 'gray' },
      ])

      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" color={AppColors.primary} />
      </Center>
    )
  }

  return (
    <Stack gap="lg" p="md">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Title order={2}>Dashboard</Title>
          <Text c="dimmed" size="sm">
            Visão geral do BlueVix
          </Text>
        </div>
        <Badge variant="light" color="blue" size="lg">
          {new Date().toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Badge>
      </Group>

      {/* KPIs */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <StatCard
          title="Total de Alunos"
          value={stats.totalAlunos}
          subtitle={`${stats.alunosAtivos} ativos`}
          icon={IconUsers}
          color={AppColors.primary}
        />
        <StatCard
          title="Sessões Hoje"
          value={stats.sessoesHoje}
          subtitle="treinos realizados"
          icon={IconRun}
          color={AppColors.accent}
        />
        <StatCard
          title="Alertas Pendentes"
          value={stats.alertasPendentes}
          subtitle="precisam atenção"
          icon={IconAlertTriangle}
          color={AppColors.warning}
        />
        <StatCard
          title="Humor Médio"
          value={stats.mediaHumor.toFixed(1)}
          subtitle="nos últimos 7 dias"
          icon={IconMoodSmile}
          color={AppColors.success}
        />
      </SimpleGrid>

      {/* Gráficos de Distribuição */}
      <Grid>
        {/* Distribuição por Nível */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" h="100%">
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <ThemeIcon size={32} radius="md" variant="light" color="blue">
                  <IconChartDonut size={18} />
                </ThemeIcon>
                <Title order={4}>Por Nível</Title>
              </Group>
            </Group>

            <Group justify="center" mb="md">
              <RingProgress
                size={180}
                thickness={20}
                roundCaps
                sections={distribuicaoNivel.map((item) => ({
                  value: item.percentual,
                  color: item.cor,
                  tooltip: `${item.nivel}: ${item.quantidade} (${item.percentual}%)`,
                }))}
                label={
                  <Stack align="center" gap={0}>
                    <Text ta="center" size="xl" fw={700}>
                      {stats.totalAlunos}
                    </Text>
                    <Text ta="center" size="xs" c="dimmed">
                      Alunos
                    </Text>
                  </Stack>
                }
              />
            </Group>

            <Stack gap="xs">
              {distribuicaoNivel.map((item) => (
                <Group key={item.nivel} justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon size={12} radius="xl" color={item.cor} />
                    <Text size="sm">{item.nivel}</Text>
                  </Group>
                  <Group gap="xs">
                    <Text size="sm" fw={500}>{item.quantidade}</Text>
                    <Text size="xs" c="dimmed">({item.percentual}%)</Text>
                  </Group>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Distribuição por Perfil Emocional */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" h="100%">
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <ThemeIcon size={32} radius="md" variant="light" color="pink">
                  <IconHeart size={18} />
                </ThemeIcon>
                <Title order={4}>Por Perfil Emocional</Title>
              </Group>
            </Group>

            <Group justify="center" mb="md">
              <RingProgress
                size={180}
                thickness={20}
                roundCaps
                sections={distribuicaoPerfil.map((item) => ({
                  value: item.percentual,
                  color: item.cor,
                  tooltip: `${item.perfil}: ${item.quantidade} (${item.percentual}%)`,
                }))}
                label={
                  <Stack align="center" gap={0}>
                    <Text ta="center" size="xl" fw={700}>
                      {stats.totalAlunos}
                    </Text>
                    <Text ta="center" size="xs" c="dimmed">
                      Alunos
                    </Text>
                  </Stack>
                }
              />
            </Group>

            <Stack gap="xs">
              {distribuicaoPerfil.map((item) => (
                <Group key={item.perfil} justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon size={12} radius="xl" color={item.cor} />
                    <Text size="sm">{item.perfil}</Text>
                  </Group>
                  <Group gap="xs">
                    <Text size="sm" fw={500}>{item.quantidade}</Text>
                    <Text size="xs" c="dimmed">({item.percentual}%)</Text>
                  </Group>
                </Group>
              ))}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Segunda linha */}
      <Grid>
        {/* Alertas Recentes */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" h="100%">
            <Group justify="space-between" mb="md">
              <Title order={4}>Alertas Recentes</Title>
              <Badge color="red" variant="light">
                {stats.alertasPendentes} pendentes
              </Badge>
            </Group>

            <Stack gap="sm">
              <AlertItem
                tipo="INATIVIDADE_3_DIAS"
                aluna="Maria Silva"
                tempo="2h atrás"
                prioridade="ALTA"
              />
              <AlertItem
                tipo="HUMOR_BAIXO"
                aluna="Ana Santos"
                tempo="4h atrás"
                prioridade="MEDIA"
              />
              <AlertItem
                tipo="STREAK_PERDIDO"
                aluna="Carla Oliveira"
                tempo="1d atrás"
                prioridade="BAIXA"
              />
            </Stack>
          </Card>
        </Grid.Col>

        {/* Métricas de Engajamento */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder radius="md" h="100%">
            <Title order={4} mb="md">
              Engajamento Semanal
            </Title>

            <Stack gap="md">
              <MetricRow
                label="Taxa de Conclusão de Treinos"
                value={78}
                color={AppColors.accent}
              />
              <MetricRow
                label="Check-ins Diários"
                value={65}
                color={AppColors.primary}
              />
              <MetricRow
                label="Interações com Vix"
                value={82}
                color={AppColors.accentLight}
              />
              <MetricRow
                label="Desafios em Progresso"
                value={45}
                color={AppColors.warning}
              />
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Top Alunos */}
      <Card withBorder radius="md">
        <Title order={4} mb="md">
          Top Alunos da Semana
        </Title>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <TopAlunaCard
            nome="Juliana Costa"
            avatar=""
            xp={2450}
            streak={28}
            posicao={1}
          />
          <TopAlunaCard
            nome="Fernanda Lima"
            avatar=""
            xp={2280}
            streak={21}
            posicao={2}
          />
          <TopAlunaCard
            nome="Patrícia Souza"
            avatar=""
            xp={2100}
            streak={18}
            posicao={3}
          />
          <TopAlunaCard
            nome="Camila Rodrigues"
            avatar=""
            xp={1980}
            streak={15}
            posicao={4}
          />
        </SimpleGrid>
      </Card>
    </Stack>
  )
}

// ========== Componentes Auxiliares ==========

interface StatCardProps {
  title: string
  value: number | string
  subtitle: string
  icon: React.ElementType
  color: string
}

function StatCard({ title, value, subtitle, icon: Icon, color }: StatCardProps) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group justify="space-between">
        <div>
          <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text fw={700} size="xl">
            {value}
          </Text>
          <Text c="dimmed" size="xs">
            {subtitle}
          </Text>
        </div>
        <ThemeIcon size={48} radius="md" variant="light" color={color}>
          <Icon size={24} />
        </ThemeIcon>
      </Group>
    </Paper>
  )
}

interface AlertItemProps {
  tipo: string
  aluna: string
  tempo: string
  prioridade: 'ALTA' | 'MEDIA' | 'BAIXA'
}

function AlertItem({ tipo, aluna, tempo, prioridade }: AlertItemProps) {
  const prioridadeColors = {
    ALTA: 'red',
    MEDIA: 'yellow',
    BAIXA: 'blue',
  }

  const tipoLabels: Record<string, string> = {
    INATIVIDADE_3_DIAS: 'Inatividade',
    HUMOR_BAIXO: 'Humor Baixo',
    STREAK_PERDIDO: 'Streak Perdido',
  }

  return (
    <Paper withBorder p="sm" radius="sm">
      <Group justify="space-between">
        <Group gap="sm">
          <Badge size="sm" color={prioridadeColors[prioridade]} variant="light">
            {tipoLabels[tipo] || tipo}
          </Badge>
          <Text size="sm" fw={500}>
            {aluna}
          </Text>
        </Group>
        <Text size="xs" c="dimmed">
          {tempo}
        </Text>
      </Group>
    </Paper>
  )
}

interface MetricRowProps {
  label: string
  value: number
  color: string
}

function MetricRow({ label, value, color }: MetricRowProps) {
  return (
    <div>
      <Group justify="space-between" mb={5}>
        <Text size="sm">{label}</Text>
        <Text size="sm" fw={500}>
          {value}%
        </Text>
      </Group>
      <Progress value={value} color={color} size="sm" radius="md" />
    </div>
  )
}

interface TopAlunaCardProps {
  nome: string
  avatar: string
  xp: number
  streak: number
  posicao: number
}

function TopAlunaCard({ nome, avatar, xp, streak, posicao }: TopAlunaCardProps) {
  const posicaoColors = ['gold', 'silver', '#cd7f32', AppColors.primary]

  return (
    <Paper withBorder p="md" radius="md">
      <Group>
        <Avatar src={avatar} size="lg" radius="xl" color="blue">
          {nome.charAt(0)}
        </Avatar>
        <div style={{ flex: 1 }}>
          <Group justify="space-between">
            <Text size="sm" fw={500}>
              {nome}
            </Text>
            <Badge
              size="sm"
              variant="filled"
              style={{ backgroundColor: posicaoColors[posicao - 1] }}
            >
              #{posicao}
            </Badge>
          </Group>
          <Group gap="xs" mt={4}>
            <Group gap={4}>
              <IconTrendingUp size={14} color={AppColors.accent} />
              <Text size="xs" c="dimmed">
                {xp.toLocaleString()} XP
              </Text>
            </Group>
            <Group gap={4}>
              <IconFlame size={14} color={AppColors.warning} />
              <Text size="xs" c="dimmed">
                {streak} dias
              </Text>
            </Group>
          </Group>
        </div>
      </Group>
    </Paper>
  )
}
