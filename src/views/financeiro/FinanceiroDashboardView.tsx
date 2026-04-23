/**
 * FinanceiroDashboardView - Dashboard Financeiro do BlueVix
 */
import { useState, useEffect } from 'react'
import {
  Group,
  Text,
  Stack,
  Paper,
  Loader,
  Center,
  Title,
  SimpleGrid,
  ThemeIcon,
  Progress,
  NumberFormatter,
  Card,
  RingProgress,
} from '@mantine/core'
import {
  IconUsers,
  IconReceipt,
  IconCreditCard,
  IconTrendingUp,
  IconTrendingDown,
  IconCash,
  IconAlertTriangle,
  IconClock,
} from '@tabler/icons-react'
import { ArchbaseNotifications } from '@archbase/components'
import { useInjection } from 'inversify-react'

import { FinanceiroResumoDto } from '../../domain/financeiro/FinanceiroDto'
import { FinanceiroFacadeService } from '../../services/FinanceiroService'
import { API_TYPE } from '../../ioc/IOCTypes'

// ============================================
// MOCK DATA
// ============================================
const USE_MOCK_DATA = true

const mockResumo: FinanceiroResumoDto = new FinanceiroResumoDto({
  totalAssinaturasAtivas: 1250,
  totalAssinaturasTrials: 180,
  totalAssinaturasCanceladas: 45,
  totalFaturasPendentes: 89,
  totalFaturasVencidas: 12,
  receitaMesAtual: 98750.0,
  receitaMesAnterior: 87500.0,
  ticketMedio: 79.0,
  taxaConversaoTrial: 42.5,
  taxaChurn: 3.5,
})

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  description?: string
  trend?: number
}

function StatCard({ title, value, icon, color, description, trend }: StatCardProps) {
  return (
    <Card shadow="0" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <ThemeIcon size="lg" radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
        {trend !== undefined && (
          <Group gap={4}>
            {trend >= 0 ? (
              <IconTrendingUp size={16} color="green" />
            ) : (
              <IconTrendingDown size={16} color="red" />
            )}
            <Text size="sm" c={trend >= 0 ? 'green' : 'red'} fw={500}>
              {trend >= 0 ? '+' : ''}
              {trend.toFixed(1)}%
            </Text>
          </Group>
        )}
      </Group>
      <Text size="xl" fw={700}>
        {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
      </Text>
      <Text size="sm" c="dimmed">
        {title}
      </Text>
      {description && (
        <Text size="xs" c="dimmed" mt={4}>
          {description}
        </Text>
      )}
    </Card>
  )
}

export function FinanceiroDashboardView() {
  const [resumo, setResumo] = useState<FinanceiroResumoDto | null>(null)
  const [loading, setLoading] = useState(true)

  const financeiroService = useInjection<FinanceiroFacadeService>(API_TYPE.FinanceiroFacadeService)

  useEffect(() => {
    loadResumo()
  }, [])

  const loadResumo = async () => {
    setLoading(true)
    try {
      if (USE_MOCK_DATA) {
        await new Promise((r) => setTimeout(r, 500))
        setResumo(mockResumo)
      } else {
        const data = await financeiroService.getResumo()
        setResumo(data)
      }
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao carregar resumo financeiro')
    } finally {
      setLoading(false)
    }
  }

  const calcularVariacao = (atual: number, anterior: number): number => {
    if (anterior === 0) return atual > 0 ? 100 : 0
    return ((atual - anterior) / anterior) * 100
  }

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    )
  }

  if (!resumo) {
    return (
      <Center h={400}>
        <Text c="dimmed">Nenhum dado disponível</Text>
      </Center>
    )
  }

  const variacaoReceita = calcularVariacao(resumo.receitaMesAtual, resumo.receitaMesAnterior)

  return (
    <Stack gap="md" p="md">
      <Title order={2}>Dashboard Financeiro</Title>

      {/* Cards de Resumo */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <StatCard
          title="Receita do Mês"
          value={`R$ ${resumo.receitaMesAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<IconCash size={20} />}
          color="green"
          trend={variacaoReceita}
        />
        <StatCard
          title="Assinaturas Ativas"
          value={resumo.totalAssinaturasAtivas}
          icon={<IconUsers size={20} />}
          color="blue"
          description={`${resumo.totalAssinaturasTrials} em trial`}
        />
        <StatCard
          title="Ticket Médio"
          value={`R$ ${resumo.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<IconCreditCard size={20} />}
          color="cyan"
        />
        <StatCard
          title="Faturas Pendentes"
          value={resumo.totalFaturasPendentes}
          icon={<IconReceipt size={20} />}
          color="yellow"
          description={`${resumo.totalFaturasVencidas} vencidas`}
        />
      </SimpleGrid>

      {/* Métricas de Conversão */}
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Paper shadow="0" p="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <div>
              <Text fw={500}>Taxa de Conversão Trial</Text>
              <Text size="xs" c="dimmed">
                Trials convertidos em assinaturas pagas
              </Text>
            </div>
            <RingProgress
              size={80}
              thickness={8}
              sections={[{ value: resumo.taxaConversaoTrial, color: 'blue' }]}
              label={
                <Text size="xs" ta="center" fw={700}>
                  {resumo.taxaConversaoTrial.toFixed(1)}%
                </Text>
              }
            />
          </Group>
          <Progress value={resumo.taxaConversaoTrial} color="blue" size="lg" radius="xl" />
          <Group justify="space-between" mt="xs">
            <Text size="xs" c="dimmed">0%</Text>
            <Text size="xs" c="dimmed">Meta: 50%</Text>
            <Text size="xs" c="dimmed">100%</Text>
          </Group>
        </Paper>

        <Paper shadow="0" p="lg" radius="md" withBorder>
          <Group justify="space-between" mb="md">
            <div>
              <Text fw={500}>Taxa de Churn</Text>
              <Text size="xs" c="dimmed">
                Cancelamentos em relação ao total
              </Text>
            </div>
            <RingProgress
              size={80}
              thickness={8}
              sections={[{ value: resumo.taxaChurn, color: 'red' }]}
              label={
                <Text size="xs" ta="center" fw={700}>
                  {resumo.taxaChurn.toFixed(1)}%
                </Text>
              }
            />
          </Group>
          <Progress value={resumo.taxaChurn} color="red" size="lg" radius="xl" />
          <Group justify="space-between" mt="xs">
            <Text size="xs" c="dimmed">0%</Text>
            <Text size="xs" c="dimmed">Meta: &lt;5%</Text>
            <Text size="xs" c="dimmed">100%</Text>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Comparativo de Receita */}
      <Paper shadow="0" p="lg" radius="md" withBorder>
        <Text fw={500} mb="md">
          Comparativo de Receita
        </Text>
        <SimpleGrid cols={2}>
          <Stack gap="xs">
            <Text size="sm" c="dimmed">Mês Atual</Text>
            <Text size="xl" fw={700} c="green">
              <NumberFormatter value={resumo.receitaMesAtual} prefix="R$ " decimalScale={2} thousandSeparator="." decimalSeparator="," />
            </Text>
          </Stack>
          <Stack gap="xs">
            <Text size="sm" c="dimmed">Mês Anterior</Text>
            <Text size="xl" fw={500}>
              <NumberFormatter value={resumo.receitaMesAnterior} prefix="R$ " decimalScale={2} thousandSeparator="." decimalSeparator="," />
            </Text>
          </Stack>
        </SimpleGrid>
        <Group mt="md" gap="xs">
          {variacaoReceita >= 0 ? (
            <IconTrendingUp size={20} color="green" />
          ) : (
            <IconTrendingDown size={20} color="red" />
          )}
          <Text c={variacaoReceita >= 0 ? 'green' : 'red'} fw={500}>
            {variacaoReceita >= 0 ? '+' : ''}{variacaoReceita.toFixed(1)}% em relação ao mês anterior
          </Text>
        </Group>
      </Paper>

      {/* Alertas */}
      {(resumo.totalFaturasVencidas > 0 || resumo.taxaChurn > 5) && (
        <Paper shadow="0" p="lg" radius="md" withBorder bg="red.0">
          <Group>
            <ThemeIcon color="red" variant="light" size="lg">
              <IconAlertTriangle size={20} />
            </ThemeIcon>
            <div>
              <Text fw={500}>Atenção Necessária</Text>
              <Stack gap={4} mt={4}>
                {resumo.totalFaturasVencidas > 0 && (
                  <Text size="sm" c="red">
                    {resumo.totalFaturasVencidas} fatura(s) vencida(s) aguardando ação
                  </Text>
                )}
                {resumo.taxaChurn > 5 && (
                  <Text size="sm" c="red">
                    Taxa de churn acima da meta (atual: {resumo.taxaChurn.toFixed(1)}%)
                  </Text>
                )}
              </Stack>
            </div>
          </Group>
        </Paper>
      )}
    </Stack>
  )
}
