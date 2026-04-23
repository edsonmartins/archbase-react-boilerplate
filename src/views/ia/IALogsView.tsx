/**
 * IALogsView - Logs de Auditoria da IA
 */
import { useState, useMemo } from 'react'
import {
  Stack,
  Group,
  Text,
  Paper,
  Badge,
  TextInput,
  Select,
  Table,
  Title,
  ActionIcon,
  Tooltip,
  ScrollArea,
  Modal,
  Grid,
  Divider,
  Code,
  SimpleGrid,
  ThemeIcon,
  Box,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useDisclosure } from '@mantine/hooks'
import {
  IconSearch,
  IconEye,
  IconRobot,
  IconUser,
  IconMessage,
  IconAlertTriangle,
  IconClock,
  IconActivity,
  IconBrain,
  IconHeart,
  IconRoute,
  IconBell,
  IconCalendar,
  IconRefresh,
} from '@tabler/icons-react'

// ============================================
// TIPOS
// ============================================
interface LogEntry {
  id: string
  timestamp: string
  agente: string
  alunoId: string
  alunoNome: string
  evento: string
  mensagem: string
  latenciaMs: number
  detalhes?: {
    modeloUsado?: string
    tokensInput?: number
    tokensOutput?: number
    conversaId?: string
    toolsUsadas?: string[]
    contexto?: string
  }
}

// ============================================
// MOCK DATA - Desativar após validação
// ============================================
const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2024-04-20 14:32:15',
    agente: 'Vix',
    alunoId: 'aluna-001',
    alunoNome: 'Maria Silva',
    evento: 'CONVERSA',
    mensagem: 'Respondeu dúvida sobre exercício de agachamento',
    latenciaMs: 1250,
    detalhes: {
      modeloUsado: 'claude-3-sonnet',
      tokensInput: 450,
      tokensOutput: 320,
      conversaId: 'conv-123',
      toolsUsadas: ['consultar_exercicio', 'buscar_historico'],
      contexto: 'Aluna questionou forma correta de execução do agachamento livre',
    },
  },
  {
    id: '2',
    timestamp: '2024-04-20 14:28:00',
    agente: 'Virginia',
    alunoId: 'aluna-002',
    alunoNome: 'Ana Costa',
    evento: 'EMOCIONAL',
    mensagem: 'Detectou humor baixo e acionou protocolo de acolhimento',
    latenciaMs: 890,
    detalhes: {
      modeloUsado: 'claude-3-sonnet',
      tokensInput: 280,
      tokensOutput: 450,
      conversaId: 'conv-124',
      toolsUsadas: ['avaliar_humor', 'acionar_protocolo'],
      contexto: 'Aluna reportou cansaço e desmotivação. Protocolo de acolhimento ativado.',
    },
  },
  {
    id: '3',
    timestamp: '2024-04-20 14:25:30',
    agente: 'Patricia',
    alunoId: 'aluna-001',
    alunoNome: 'Maria Silva',
    evento: 'PRESCRICAO',
    mensagem: 'Gerou treino personalizado para semana 8',
    latenciaMs: 2100,
    detalhes: {
      modeloUsado: 'claude-3-opus',
      tokensInput: 1200,
      tokensOutput: 2800,
      toolsUsadas: ['avaliar_progressao', 'gerar_treino', 'validar_periodizacao'],
      contexto: 'Progressão automática baseada em desempenho das últimas 2 semanas.',
    },
  },
  {
    id: '4',
    timestamp: '2024-04-20 14:20:00',
    agente: 'Orquestrador',
    alunoId: 'aluna-003',
    alunoNome: 'Julia Santos',
    evento: 'ROTEAMENTO',
    mensagem: 'Direcionou mensagem para Virgínia (contexto emocional)',
    latenciaMs: 320,
    detalhes: {
      modeloUsado: 'claude-3-haiku',
      tokensInput: 150,
      tokensOutput: 50,
      contexto: 'Classificação de intenção detectou tom emocional na mensagem.',
    },
  },
  {
    id: '5',
    timestamp: '2024-04-20 14:15:00',
    agente: 'Vix',
    alunoId: 'aluna-004',
    alunoNome: 'Carla Oliveira',
    evento: 'ALERTA',
    mensagem: 'Criou alerta de inatividade (5 dias sem treino)',
    latenciaMs: 450,
    detalhes: {
      toolsUsadas: ['verificar_atividade', 'criar_alerta'],
      contexto: 'Monitoramento automático detectou 5 dias consecutivos sem registro de treino.',
    },
  },
  {
    id: '6',
    timestamp: '2024-04-20 14:10:45',
    agente: 'Vix',
    alunoId: 'aluna-005',
    alunoNome: 'Fernanda Lima',
    evento: 'CONVERSA',
    mensagem: 'Celebrou conquista de 7 dias consecutivos de treino',
    latenciaMs: 680,
    detalhes: {
      modeloUsado: 'claude-3-sonnet',
      tokensInput: 200,
      tokensOutput: 280,
      conversaId: 'conv-125',
      contexto: 'Mensagem de celebração enviada automaticamente por atingir streak.',
    },
  },
  {
    id: '7',
    timestamp: '2024-04-20 14:05:20',
    agente: 'Patricia',
    alunoId: 'aluna-006',
    alunoNome: 'Beatriz Almeida',
    evento: 'PRESCRICAO',
    mensagem: 'Ajustou intensidade do treino após feedback de dor',
    latenciaMs: 1890,
    detalhes: {
      modeloUsado: 'claude-3-opus',
      tokensInput: 800,
      tokensOutput: 1500,
      toolsUsadas: ['avaliar_feedback', 'ajustar_carga', 'substituir_exercicio'],
      contexto: 'Aluna reportou dor no joelho. Exercícios de impacto substituídos.',
    },
  },
  {
    id: '8',
    timestamp: '2024-04-20 14:00:00',
    agente: 'Orquestrador',
    alunoId: 'aluna-001',
    alunoNome: 'Maria Silva',
    evento: 'ROTEAMENTO',
    mensagem: 'Direcionou mensagem para Patrícia (dúvida técnica)',
    latenciaMs: 280,
    detalhes: {
      modeloUsado: 'claude-3-haiku',
      tokensInput: 120,
      tokensOutput: 45,
      contexto: 'Classificação detectou dúvida sobre execução de exercício.',
    },
  },
  {
    id: '9',
    timestamp: '2024-04-20 13:55:30',
    agente: 'Virginia',
    alunoId: 'aluna-007',
    alunoNome: 'Larissa Ferreira',
    evento: 'EMOCIONAL',
    mensagem: 'Aplicou protocolo de ansiedade pré-treino',
    latenciaMs: 920,
    detalhes: {
      modeloUsado: 'claude-3-sonnet',
      tokensInput: 350,
      tokensOutput: 520,
      toolsUsadas: ['avaliar_humor', 'selecionar_protocolo', 'guiar_respiracao'],
      contexto: 'Aluna expressou ansiedade antes de iniciar treino.',
    },
  },
  {
    id: '10',
    timestamp: '2024-04-20 13:50:15',
    agente: 'Vix',
    alunoId: 'aluna-002',
    alunoNome: 'Ana Costa',
    evento: 'CONVERSA',
    mensagem: 'Enviou lembrete de hidratação',
    latenciaMs: 450,
    detalhes: {
      modeloUsado: 'claude-3-haiku',
      tokensInput: 80,
      tokensOutput: 120,
      contexto: 'Lembrete automático baseado em horário do treino.',
    },
  },
  {
    id: '11',
    timestamp: '2024-04-20 13:45:00',
    agente: 'Patricia',
    alunoId: 'aluna-003',
    alunoNome: 'Julia Santos',
    evento: 'PRESCRICAO',
    mensagem: 'Progrediu aluna para nível intermediário',
    latenciaMs: 2350,
    detalhes: {
      modeloUsado: 'claude-3-opus',
      tokensInput: 1500,
      tokensOutput: 2200,
      toolsUsadas: ['avaliar_criterios', 'aplicar_progressao', 'atualizar_plano'],
      contexto: 'Aluna atingiu todos os critérios de progressão para nível intermediário.',
    },
  },
  {
    id: '12',
    timestamp: '2024-04-20 13:40:45',
    agente: 'Vix',
    alunoId: 'aluna-008',
    alunoNome: 'Camila Rodrigues',
    evento: 'ALERTA',
    mensagem: 'Detectou padrão de humor baixo consecutivo',
    latenciaMs: 520,
    detalhes: {
      toolsUsadas: ['analisar_historico_humor', 'criar_alerta'],
      contexto: 'Últimos 3 check-ins apresentaram humor abaixo de 4.',
    },
  },
  {
    id: '13',
    timestamp: '2024-04-20 13:35:20',
    agente: 'Orquestrador',
    alunoId: 'aluna-005',
    alunoNome: 'Fernanda Lima',
    evento: 'ROTEAMENTO',
    mensagem: 'Direcionou mensagem para Vix (motivação)',
    latenciaMs: 310,
    detalhes: {
      modeloUsado: 'claude-3-haiku',
      tokensInput: 100,
      tokensOutput: 40,
      contexto: 'Mensagem classificada como pedido de motivação/celebração.',
    },
  },
  {
    id: '14',
    timestamp: '2024-04-20 13:30:00',
    agente: 'Virginia',
    alunoId: 'aluna-004',
    alunoNome: 'Carla Oliveira',
    evento: 'EMOCIONAL',
    mensagem: 'Conduziu sessão de respiração guiada',
    latenciaMs: 1100,
    detalhes: {
      modeloUsado: 'claude-3-sonnet',
      tokensInput: 400,
      tokensOutput: 650,
      toolsUsadas: ['guiar_respiracao', 'registrar_sessao'],
      contexto: 'Sessão de 5 minutos de respiração para redução de estresse.',
    },
  },
  {
    id: '15',
    timestamp: '2024-04-20 13:25:30',
    agente: 'Patricia',
    alunoId: 'aluna-006',
    alunoNome: 'Beatriz Almeida',
    evento: 'PRESCRICAO',
    mensagem: 'Substituiu exercício por alternativa sem impacto',
    latenciaMs: 1750,
    detalhes: {
      modeloUsado: 'claude-3-opus',
      tokensInput: 900,
      tokensOutput: 1200,
      toolsUsadas: ['buscar_alternativas', 'validar_substituicao'],
      contexto: 'Burpee substituído por mountain climber controlado.',
    },
  },
  {
    id: '16',
    timestamp: '2024-04-20 13:20:15',
    agente: 'Vix',
    alunoId: 'aluna-007',
    alunoNome: 'Larissa Ferreira',
    evento: 'CONVERSA',
    mensagem: 'Respondeu sobre diferença entre exercícios',
    latenciaMs: 890,
    detalhes: {
      modeloUsado: 'claude-3-sonnet',
      tokensInput: 320,
      tokensOutput: 480,
      conversaId: 'conv-126',
      toolsUsadas: ['consultar_exercicio'],
      contexto: 'Explicou diferença entre agachamento livre e hack.',
    },
  },
  {
    id: '17',
    timestamp: '2024-04-20 13:15:00',
    agente: 'Orquestrador',
    alunoId: 'aluna-008',
    alunoNome: 'Camila Rodrigues',
    evento: 'ROTEAMENTO',
    mensagem: 'Escalou conversa para revisão humana',
    latenciaMs: 180,
    detalhes: {
      modeloUsado: 'claude-3-haiku',
      tokensInput: 200,
      tokensOutput: 60,
      contexto: 'Mensagem continha menção a problema de saúde. Escalação automática.',
    },
  },
  {
    id: '18',
    timestamp: '2024-04-20 13:10:45',
    agente: 'Virginia',
    alunoId: 'aluna-001',
    alunoNome: 'Maria Silva',
    evento: 'EMOCIONAL',
    mensagem: 'Registrou melhora de humor após conversa',
    latenciaMs: 650,
    detalhes: {
      modeloUsado: 'claude-3-sonnet',
      tokensInput: 250,
      tokensOutput: 180,
      toolsUsadas: ['registrar_humor', 'avaliar_evolucao'],
      contexto: 'Humor subiu de 5 para 8 após sessão de acolhimento.',
    },
  },
  {
    id: '19',
    timestamp: '2024-04-20 13:05:20',
    agente: 'Vix',
    alunoId: 'aluna-003',
    alunoNome: 'Julia Santos',
    evento: 'ALERTA',
    mensagem: 'Notificou sobre plano expirando em 5 dias',
    latenciaMs: 380,
    detalhes: {
      toolsUsadas: ['verificar_plano', 'enviar_notificacao'],
      contexto: 'Lembrete automático de renovação de plano.',
    },
  },
  {
    id: '20',
    timestamp: '2024-04-20 13:00:00',
    agente: 'Patricia',
    alunoId: 'aluna-002',
    alunoNome: 'Ana Costa',
    evento: 'PRESCRICAO',
    mensagem: 'Criou plano de recuperação pós-lesão',
    latenciaMs: 2800,
    detalhes: {
      modeloUsado: 'claude-3-opus',
      tokensInput: 1800,
      tokensOutput: 3200,
      toolsUsadas: ['avaliar_lesao', 'gerar_plano_recuperacao', 'validar_restricoes'],
      contexto: 'Plano de 4 semanas focado em mobilidade e fortalecimento gradual.',
    },
  },
]

const agenteColors: Record<string, string> = {
  Vix: 'blue',
  Virginia: 'violet',
  Patricia: 'teal',
  Orquestrador: 'orange',
}

const agenteIcons: Record<string, typeof IconRobot> = {
  Vix: IconRobot,
  Virginia: IconHeart,
  Patricia: IconBrain,
  Orquestrador: IconRoute,
}

const eventoColors: Record<string, string> = {
  CONVERSA: 'blue',
  EMOCIONAL: 'violet',
  PRESCRICAO: 'teal',
  ROTEAMENTO: 'orange',
  ALERTA: 'red',
}

const eventoIcons: Record<string, typeof IconMessage> = {
  CONVERSA: IconMessage,
  EMOCIONAL: IconHeart,
  PRESCRICAO: IconBrain,
  ROTEAMENTO: IconRoute,
  ALERTA: IconBell,
}

export function IALogsView() {
  const [busca, setBusca] = useState('')
  const [agenteFilter, setAgenteFilter] = useState<string | null>(null)
  const [eventoFilter, setEventoFilter] = useState<string | null>(null)
  const [dataInicio, setDataInicio] = useState<Date | null>(null)
  const [dataFim, setDataFim] = useState<Date | null>(null)

  const [detailModalOpened, { open: openDetailModal, close: closeDetailModal }] = useDisclosure(false)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)

  const filteredLogs = useMemo(() => {
    return mockLogs.filter((log) => {
      const matchBusca = !busca ||
        log.alunoNome.toLowerCase().includes(busca.toLowerCase()) ||
        log.mensagem.toLowerCase().includes(busca.toLowerCase())
      const matchAgente = !agenteFilter || log.agente === agenteFilter
      const matchEvento = !eventoFilter || log.evento === eventoFilter
      return matchBusca && matchAgente && matchEvento
    })
  }, [busca, agenteFilter, eventoFilter])

  // Métricas calculadas
  const metrics = useMemo(() => {
    const totalLogs = filteredLogs.length
    const avgLatencia = filteredLogs.length > 0
      ? Math.round(filteredLogs.reduce((acc, log) => acc + log.latenciaMs, 0) / filteredLogs.length)
      : 0
    const alertas = filteredLogs.filter(l => l.evento === 'ALERTA').length
    const conversas = filteredLogs.filter(l => l.evento === 'CONVERSA').length

    const porAgente = filteredLogs.reduce((acc, log) => {
      acc[log.agente] = (acc[log.agente] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { totalLogs, avgLatencia, alertas, conversas, porAgente }
  }, [filteredLogs])

  const handleViewDetails = (log: LogEntry) => {
    setSelectedLog(log)
    openDetailModal()
  }

  const handleRefresh = () => {
    // TODO: Implementar refresh real da API
    console.log('Refreshing logs...')
  }

  return (
    <Stack gap="lg" p="md">
      <Group justify="space-between">
        <Title order={2}>Logs de Auditoria</Title>
        <Tooltip label="Atualizar">
          <ActionIcon variant="light" size="lg" onClick={handleRefresh}>
            <IconRefresh size={20} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {/* Métricas */}
      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <Paper shadow="0" withBorder p="md">
          <Group>
            <ThemeIcon size="lg" variant="light" color="blue">
              <IconActivity size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Total de Logs</Text>
              <Text size="xl" fw={700}>{metrics.totalLogs}</Text>
            </div>
          </Group>
        </Paper>
        <Paper shadow="0" withBorder p="md">
          <Group>
            <ThemeIcon size="lg" variant="light" color="orange">
              <IconClock size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Latência Média</Text>
              <Text size="xl" fw={700}>{metrics.avgLatencia}ms</Text>
            </div>
          </Group>
        </Paper>
        <Paper shadow="0" withBorder p="md">
          <Group>
            <ThemeIcon size="lg" variant="light" color="teal">
              <IconMessage size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Conversas</Text>
              <Text size="xl" fw={700}>{metrics.conversas}</Text>
            </div>
          </Group>
        </Paper>
        <Paper shadow="0" withBorder p="md">
          <Group>
            <ThemeIcon size="lg" variant="light" color="red">
              <IconAlertTriangle size={20} />
            </ThemeIcon>
            <div>
              <Text size="xs" c="dimmed">Alertas</Text>
              <Text size="xl" fw={700}>{metrics.alertas}</Text>
            </div>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Filtros */}
      <Paper shadow="0" withBorder p="md">
        <Group>
          <TextInput
            placeholder="Buscar por aluno ou mensagem..."
            leftSection={<IconSearch size={16} />}
            value={busca}
            onChange={(e) => setBusca(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Agente"
            data={[
              { value: 'Vix', label: 'Vix' },
              { value: 'Virginia', label: 'Virgínia' },
              { value: 'Patricia', label: 'Patrícia' },
              { value: 'Orquestrador', label: 'Orquestrador' },
            ]}
            value={agenteFilter}
            onChange={setAgenteFilter}
            clearable
            style={{ width: 160 }}
          />
          <Select
            placeholder="Evento"
            data={[
              { value: 'CONVERSA', label: 'Conversa' },
              { value: 'EMOCIONAL', label: 'Emocional' },
              { value: 'PRESCRICAO', label: 'Prescrição' },
              { value: 'ROTEAMENTO', label: 'Roteamento' },
              { value: 'ALERTA', label: 'Alerta' },
            ]}
            value={eventoFilter}
            onChange={setEventoFilter}
            clearable
            style={{ width: 160 }}
          />
          <DatePickerInput
            placeholder="Data início"
            value={dataInicio}
            onChange={(value) => setDataInicio(value as unknown as Date | null)}
            clearable
            leftSection={<IconCalendar size={16} />}
            style={{ width: 160 }}
          />
          <DatePickerInput
            placeholder="Data fim"
            value={dataFim}
            onChange={(value) => setDataFim(value as unknown as Date | null)}
            clearable
            leftSection={<IconCalendar size={16} />}
            style={{ width: 160 }}
          />
        </Group>
      </Paper>

      {/* Tabela de Logs */}
      <Paper shadow="0" withBorder>
        <ScrollArea h="calc(100vh - 380px)" offsetScrollbars>
          <Table striped highlightOnHover>
            <Table.Thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--mantine-color-body)', zIndex: 1 }}>
              <Table.Tr>
                <Table.Th>Timestamp</Table.Th>
                <Table.Th>Agente</Table.Th>
                <Table.Th>Aluno</Table.Th>
                <Table.Th>Evento</Table.Th>
                <Table.Th>Mensagem</Table.Th>
                <Table.Th>Latência</Table.Th>
                <Table.Th>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredLogs.map((log) => (
                <Table.Tr key={log.id}>
                  <Table.Td>
                    <Text size="sm" ff="monospace">{log.timestamp}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={agenteColors[log.agente] || 'gray'}
                      variant="light"
                      leftSection={
                        (() => {
                          const Icon = agenteIcons[log.agente] || IconRobot
                          return <Icon size={12} />
                        })()
                      }
                    >
                      {log.agente}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{log.alunoNome}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={eventoColors[log.evento] || 'gray'}
                      variant="outline"
                      leftSection={
                        (() => {
                          const Icon = eventoIcons[log.evento] || IconMessage
                          return <Icon size={12} />
                        })()
                      }
                    >
                      {log.evento}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" lineClamp={1} maw={300}>{log.mensagem}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={log.latenciaMs > 2000 ? 'red' : log.latenciaMs > 1000 ? 'yellow' : 'green'}
                      variant="light"
                    >
                      {log.latenciaMs}ms
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label="Ver detalhes">
                      <ActionIcon variant="subtle" color="blue" onClick={() => handleViewDetails(log)}>
                        <IconEye size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {/* Modal de Detalhes */}
      <Modal
        opened={detailModalOpened}
        onClose={closeDetailModal}
        title={
          <Group>
            <ThemeIcon color={agenteColors[selectedLog?.agente || ''] || 'gray'} variant="light">
              {(() => {
                const Icon = agenteIcons[selectedLog?.agente || ''] || IconRobot
                return <Icon size={18} />
              })()}
            </ThemeIcon>
            <Text fw={600}>Detalhes do Log</Text>
          </Group>
        }
        size="lg"
      >
        {selectedLog && (
          <Stack gap="md">
            {/* Info básica */}
            <Grid>
              <Grid.Col span={6}>
                <Text size="xs" c="dimmed">Timestamp</Text>
                <Text size="sm" ff="monospace">{selectedLog.timestamp}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="xs" c="dimmed">Latência</Text>
                <Badge
                  color={selectedLog.latenciaMs > 2000 ? 'red' : selectedLog.latenciaMs > 1000 ? 'yellow' : 'green'}
                  variant="light"
                >
                  {selectedLog.latenciaMs}ms
                </Badge>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="xs" c="dimmed">Agente</Text>
                <Badge color={agenteColors[selectedLog.agente] || 'gray'} variant="light">
                  {selectedLog.agente}
                </Badge>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="xs" c="dimmed">Evento</Text>
                <Badge color={eventoColors[selectedLog.evento] || 'gray'} variant="outline">
                  {selectedLog.evento}
                </Badge>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="xs" c="dimmed">Aluno</Text>
                <Text size="sm">{selectedLog.alunoNome}</Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="xs" c="dimmed">ID Aluno</Text>
                <Code>{selectedLog.alunoId}</Code>
              </Grid.Col>
            </Grid>

            <Divider />

            {/* Mensagem */}
            <Box>
              <Text size="xs" c="dimmed" mb={4}>Mensagem</Text>
              <Paper shadow="0" withBorder p="sm" bg="gray.0">
                <Text size="sm">{selectedLog.mensagem}</Text>
              </Paper>
            </Box>

            {/* Detalhes extras */}
            {selectedLog.detalhes && (
              <>
                <Divider label="Detalhes Técnicos" labelPosition="center" />

                <Grid>
                  {selectedLog.detalhes.modeloUsado && (
                    <Grid.Col span={6}>
                      <Text size="xs" c="dimmed">Modelo</Text>
                      <Code>{selectedLog.detalhes.modeloUsado}</Code>
                    </Grid.Col>
                  )}
                  {selectedLog.detalhes.conversaId && (
                    <Grid.Col span={6}>
                      <Text size="xs" c="dimmed">ID Conversa</Text>
                      <Code>{selectedLog.detalhes.conversaId}</Code>
                    </Grid.Col>
                  )}
                  {selectedLog.detalhes.tokensInput !== undefined && (
                    <Grid.Col span={6}>
                      <Text size="xs" c="dimmed">Tokens Input</Text>
                      <Text size="sm" fw={500}>{selectedLog.detalhes.tokensInput.toLocaleString()}</Text>
                    </Grid.Col>
                  )}
                  {selectedLog.detalhes.tokensOutput !== undefined && (
                    <Grid.Col span={6}>
                      <Text size="xs" c="dimmed">Tokens Output</Text>
                      <Text size="sm" fw={500}>{selectedLog.detalhes.tokensOutput.toLocaleString()}</Text>
                    </Grid.Col>
                  )}
                </Grid>

                {selectedLog.detalhes.toolsUsadas && selectedLog.detalhes.toolsUsadas.length > 0 && (
                  <Box>
                    <Text size="xs" c="dimmed" mb={4}>Tools Utilizadas</Text>
                    <Group gap="xs">
                      {selectedLog.detalhes.toolsUsadas.map((tool, idx) => (
                        <Badge key={idx} variant="outline" color="cyan" size="sm">
                          {tool}
                        </Badge>
                      ))}
                    </Group>
                  </Box>
                )}

                {selectedLog.detalhes.contexto && (
                  <Box>
                    <Text size="xs" c="dimmed" mb={4}>Contexto</Text>
                    <Paper shadow="0" withBorder p="sm" bg="blue.0">
                      <Text size="sm">{selectedLog.detalhes.contexto}</Text>
                    </Paper>
                  </Box>
                )}
              </>
            )}
          </Stack>
        )}
      </Modal>
    </Stack>
  )
}
