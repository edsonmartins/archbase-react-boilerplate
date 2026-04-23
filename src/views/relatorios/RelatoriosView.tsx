/**
 * RelatoriosView - Relatórios e Analytics
 */
import { useState } from 'react'
import {
  Card,
  Stack,
  Title,
  Text,
  Group,
  Select,
  Button,
  SimpleGrid,
  Paper,
  ThemeIcon,
  Progress,
  Table,
} from '@mantine/core'
import {
  IconDownload,
  IconUsers,
  IconActivity,
  IconFlame,
  IconMoodSmile,
  IconTrendingUp,
} from '@tabler/icons-react'
import { ArchbaseNotifications } from '@archbase/components'
import { AppColors } from '../../theme/AppThemeLight'

/**
 * View de Relatórios e Analytics
 */
export function RelatoriosView() {
  const [periodo, setPeriodo] = useState<string | null>('7d')
  const [exportando, setExportando] = useState(false)

  const handleExport = () => {
    setExportando(true)
    setTimeout(() => {
      setExportando(false)
      ArchbaseNotifications.showSuccess('Sucesso', 'Relatório exportado com sucesso')
    }, 1500)
  }

  // Dados mock
  const kpis = [
    { label: 'Total Alunos', value: '47', change: '+3', icon: IconUsers, color: AppColors.primary },
    { label: 'Sessões/Semana', value: '156', change: '+12%', icon: IconActivity, color: AppColors.accent },
    { label: 'Streak Médio', value: '12 dias', change: '+2', icon: IconFlame, color: AppColors.warning },
    { label: 'Humor Médio', value: '7.2', change: '+0.3', icon: IconMoodSmile, color: AppColors.success },
  ]

  const topAlunos = [
    { nome: 'Juliana Costa', xp: 2450, sessoes: 28, streak: 28 },
    { nome: 'Fernanda Lima', xp: 2280, sessoes: 25, streak: 21 },
    { nome: 'Patrícia Souza', xp: 2100, sessoes: 22, streak: 18 },
    { nome: 'Camila Rodrigues', xp: 1980, sessoes: 20, streak: 15 },
    { nome: 'Ana Santos', xp: 1850, sessoes: 18, streak: 12 },
  ]

  const engajamento = [
    { label: 'Taxa Conclusão Treinos', value: 78 },
    { label: 'Check-ins Diários', value: 65 },
    { label: 'Interações Vix', value: 82 },
    { label: 'Desafios Completados', value: 45 },
  ]

  return (
    <Stack gap="lg" p="md">
      <Group justify="space-between">
        <div>
          <Title order={2}>Relatórios</Title>
          <Text c="dimmed" size="sm">
            Analytics e métricas do BlueVix
          </Text>
        </div>
        <Group>
          <Select
            value={periodo}
            onChange={setPeriodo}
            data={[
              { value: '7d', label: 'Últimos 7 dias' },
              { value: '30d', label: 'Últimos 30 dias' },
              { value: '90d', label: 'Últimos 90 dias' },
              { value: 'ano', label: 'Este ano' },
            ]}
            style={{ width: 180 }}
          />
          <Button
            leftSection={<IconDownload size={16} />}
            onClick={handleExport}
            loading={exportando}
          >
            Exportar
          </Button>
        </Group>
      </Group>

      {/* KPIs */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {kpis.map((kpi) => (
          <Paper key={kpi.label} withBorder p="md" radius="md">
            <Group justify="space-between">
              <div>
                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                  {kpi.label}
                </Text>
                <Text fw={700} size="xl">
                  {kpi.value}
                </Text>
                <Group gap={4}>
                  <IconTrendingUp size={14} color={AppColors.success} />
                  <Text size="xs" c="green">
                    {kpi.change}
                  </Text>
                </Group>
              </div>
              <ThemeIcon size={48} radius="md" variant="light" color={kpi.color}>
                <kpi.icon size={24} />
              </ThemeIcon>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Engajamento e Top Alunos */}
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        {/* Engajamento */}
        <Card withBorder shadow="0">
          <Title order={4} mb="md">Engajamento</Title>
          <Stack gap="md">
            {engajamento.map((item) => (
              <div key={item.label}>
                <Group justify="space-between" mb={5}>
                  <Text size="sm">{item.label}</Text>
                  <Text size="sm" fw={500}>{item.value}%</Text>
                </Group>
                <Progress value={item.value} size="md" radius="md" color={AppColors.primary} />
              </div>
            ))}
          </Stack>
        </Card>

        {/* Top Alunos */}
        <Card withBorder shadow="0">
          <Title order={4} mb="md">Top Alunos</Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Aluno</Table.Th>
                <Table.Th>XP</Table.Th>
                <Table.Th>Sessões</Table.Th>
                <Table.Th>Streak</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {topAlunos.map((aluno, index) => (
                <Table.Tr key={aluno.nome}>
                  <Table.Td>
                    <Group gap="xs">
                      <Text size="sm" fw={500} c={index < 3 ? AppColors.primary : undefined}>
                        #{index + 1}
                      </Text>
                      <Text size="sm">{aluno.nome}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{aluno.xp.toLocaleString()}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{aluno.sessoes}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <IconFlame size={14} color={AppColors.warning} />
                      <Text size="sm">{aluno.streak}</Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      </SimpleGrid>

      {/* Distribuição de Status */}
      <Card withBorder shadow="0">
        <Title order={4} mb="md">Distribuição de Alunos por Status</Title>
        <SimpleGrid cols={{ base: 2, sm: 5 }}>
          <StatusCard label="Ativas" value={38} total={47} color={AppColors.success} />
          <StatusCard label="Trial" value={5} total={47} color={AppColors.warning} />
          <StatusCard label="Expiradas" value={2} total={47} color={AppColors.error} />
          <StatusCard label="Pausadas" value={1} total={47} color="#6B7280" />
          <StatusCard label="Canceladas" value={1} total={47} color="#1F2937" />
        </SimpleGrid>
      </Card>
    </Stack>
  )
}

interface StatusCardProps {
  label: string
  value: number
  total: number
  color: string
}

function StatusCard({ label, value, total, color }: StatusCardProps) {
  const percentage = Math.round((value / total) * 100)
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap="xs" align="center">
        <Text size="xl" fw={700} style={{ color }}>
          {value}
        </Text>
        <Text size="xs" c="dimmed" tt="uppercase">
          {label}
        </Text>
        <Text size="xs" c="dimmed">
          ({percentage}%)
        </Text>
      </Stack>
    </Paper>
  )
}
