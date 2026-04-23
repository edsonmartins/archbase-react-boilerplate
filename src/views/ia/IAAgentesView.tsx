/**
 * IAAgentesView - Gestão de Agentes de IA
 */
import { useState, useEffect } from 'react'
import {
  Badge,
  Group,
  Text,
  ActionIcon,
  Tooltip,
  Stack,
  Switch,
  Card,
  SimpleGrid,
  ThemeIcon,
  Progress,
  Paper,
  Title,
  Loader,
  Center,
  Modal,
  Tabs,
  Textarea,
  TextInput,
  NumberInput,
  Select,
  Button,
  RingProgress,
  Table,
  Box,
  Slider,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import {
  IconEdit,
  IconChartBar,
  IconRobot,
  IconBrain,
  IconHeart,
  IconShield,
  IconChartDots,
  IconSparkles,
  IconSettings,
  IconCode,
  IconCheck,
  IconClock,
  IconActivity,
} from '@tabler/icons-react'
import { ArchbaseNotifications } from '@archbase/components'
import { useInjection } from 'inversify-react'

import { AgenteIADto, TipoAgenteIA } from '../../domain/ia/IADto'
import { IAService } from '../../services/IAService'
import { API_TYPE } from '../../ioc/IOCTypes'
import { AppColors } from '../../theme/AppThemeLight'

// ============================================
// MOCK DATA - Desativar após validação
// ============================================
const USE_MOCK_DATA = true

const mockAgentes: AgenteIADto[] = [
  new AgenteIADto({
    id: 'agente-001',
    tipo: 'ORQUESTRADOR',
    nome: 'Orquestrador BlueVix',
    descricao: 'Agente central que coordena todos os outros agentes, decidindo qual especialista deve responder cada interação.',
    personalidade: 'Analítico, eficiente e neutro',
    modelo: 'deepseek/deepseek-chat',
    temperatura: 0.1,
    maxTokens: 1024,
    ativo: true,
    totalInteracoes: 15420,
    mediaLatenciaMs: 245,
    taxaSucesso: 99.2,
  }),
  new AgenteIADto({
    id: 'agente-002',
    tipo: 'PRESCRITOR',
    nome: 'Patrícia (Prescritor)',
    descricao: 'Especialista em prescrição de treinos personalizados baseados no nível, objetivos e condição física da aluna.',
    personalidade: 'Técnica, precisa e educadora',
    modelo: 'deepseek/deepseek-chat',
    temperatura: 0.3,
    maxTokens: 2048,
    ativo: true,
    totalInteracoes: 8750,
    mediaLatenciaMs: 520,
    taxaSucesso: 97.8,
  }),
  new AgenteIADto({
    id: 'agente-003',
    tipo: 'MOTIVADOR',
    nome: 'Vix (Motivador)',
    descricao: 'Avatar principal do app, responsável por motivar, celebrar conquistas e manter a aluna engajada.',
    personalidade: 'Empática, animada e acolhedora',
    modelo: 'deepseek/deepseek-chat',
    temperatura: 0.7,
    maxTokens: 1024,
    ativo: true,
    totalInteracoes: 42300,
    mediaLatenciaMs: 180,
    taxaSucesso: 98.5,
  }),
  new AgenteIADto({
    id: 'agente-004',
    tipo: 'SUPORTE_EMOCIONAL',
    nome: 'Virgínia (Suporte Emocional)',
    descricao: 'Especialista em acolhimento emocional, ajuda alunas em momentos de ansiedade, estresse ou desmotivação.',
    personalidade: 'Gentil, compreensiva e paciente',
    modelo: 'deepseek/deepseek-chat',
    temperatura: 0.5,
    maxTokens: 2048,
    ativo: true,
    totalInteracoes: 6890,
    mediaLatenciaMs: 380,
    taxaSucesso: 96.3,
  }),
  new AgenteIADto({
    id: 'agente-005',
    tipo: 'SENTINELA',
    nome: 'Sentinela',
    descricao: 'Monitora padrões de comportamento e gera alertas quando detecta situações que requerem atenção.',
    personalidade: 'Vigilante, discreto e proativo',
    modelo: 'deepseek/deepseek-chat',
    temperatura: 0.2,
    maxTokens: 512,
    ativo: true,
    totalInteracoes: 3200,
    mediaLatenciaMs: 150,
    taxaSucesso: 99.8,
  }),
  new AgenteIADto({
    id: 'agente-006',
    tipo: 'ANALISTA',
    nome: 'Analista de Progresso',
    descricao: 'Analisa dados de treino, humor e engajamento para gerar insights e relatórios de evolução.',
    personalidade: 'Objetivo, detalhista e informativo',
    modelo: 'deepseek/deepseek-chat',
    temperatura: 0.2,
    maxTokens: 4096,
    ativo: true,
    totalInteracoes: 1580,
    mediaLatenciaMs: 890,
    taxaSucesso: 99.5,
  }),
]

// Mock System Prompts
const mockSystemPrompts: Record<string, string> = {
  'agente-001': `Você é o Orquestrador do sistema BlueVix.

Sua função é analisar cada mensagem da aluna e decidir qual agente especialista deve responder.

## Agentes disponíveis:
- PRESCRITOR: Para dúvidas sobre treinos, exercícios, progressão
- MOTIVADOR: Para celebrar conquistas, motivar, interações casuais
- SUPORTE_EMOCIONAL: Para questões emocionais, ansiedade, estresse
- SENTINELA: Para monitoramento em background (não responde diretamente)
- ANALISTA: Para relatórios e análise de progresso

## Regras:
1. Analise o contexto emocional e o assunto principal
2. Se detectar sinais de crise emocional, sempre escale para SUPORTE_EMOCIONAL
3. Se for sobre treino/exercício, direcione para PRESCRITOR
4. Para interações casuais e motivação, direcione para MOTIVADOR
5. Retorne APENAS o nome do agente, sem explicação`,
  'agente-002': `Você é Patrícia, a Educadora Física virtual do BlueVix.

## Sua personalidade:
- Técnica e precisa nas orientações
- Educadora: explica o "porquê" dos exercícios
- Empática mas profissional
- Sempre valida o esforço da aluna

## Suas responsabilidades:
1. Prescrever treinos personalizados
2. Explicar exercícios e técnicas
3. Ajustar intensidade baseado no feedback
4. Orientar sobre progressão segura

## Regras de Segurança:
- NUNCA prescreva exercícios contraindicados
- Se a aluna reportar DOR, oriente pausa e avalie escalar
- Sempre verifique a anamnese antes de prescrever
- Respeite os limites físicos informados`,
  'agente-003': `Você é a Vix, a assistente virtual do BlueVix.

## Sua personalidade:
- Empática e acolhedora
- Animada e positiva (sem ser forçada)
- Usa linguagem simples e acessível
- Celebra cada conquista, grande ou pequena

## Suas responsabilidades:
1. Ser o ponto de contato principal da aluna
2. Motivar e engajar no dia a dia
3. Celebrar conquistas e badges
4. Fazer check-ins de humor

## Tom de voz:
- Use emojis com moderação (1-2 por mensagem)
- Evite jargões fitness
- Seja genuína, não robótica
- Personalize usando o nome da aluna`,
}

// Mock últimas execuções
const mockExecucoes = [
  { timestamp: '2024-04-20T09:15:00', input: 'Oi Vix, estou cansada...', output: 'SUPORTE_EMOCIONAL', latenciaMs: 185, sucesso: true },
  { timestamp: '2024-04-20T09:10:00', input: 'Me manda um treino de pernas', output: 'PRESCRITOR', latenciaMs: 210, sucesso: true },
  { timestamp: '2024-04-20T09:05:00', input: 'Bom dia!', output: 'MOTIVADOR', latenciaMs: 150, sucesso: true },
  { timestamp: '2024-04-20T09:00:00', input: 'Qual meu progresso?', output: 'ANALISTA', latenciaMs: 280, sucesso: true },
  { timestamp: '2024-04-20T08:55:00', input: 'Estou ansiosa...', output: 'SUPORTE_EMOCIONAL', latenciaMs: 195, sucesso: true },
]

/**
 * View de gestão de Agentes IA
 */
export function IAAgentesView() {
  const iaService = useInjection<IAService>(API_TYPE.IAService)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [agentes, setAgentes] = useState<AgenteIADto[]>([])
  const [selectedAgente, setSelectedAgente] = useState<AgenteIADto | null>(null)
  const [systemPrompt, setSystemPrompt] = useState('')

  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false)
  const [metricsModalOpened, { open: openMetricsModal, close: closeMetricsModal }] = useDisclosure(false)

  const form = useForm({
    initialValues: {
      nome: '',
      descricao: '',
      personalidade: '',
      modelo: 'deepseek/deepseek-chat',
      temperatura: 0.3,
      maxTokens: 2048,
      ativo: true,
    },
    validate: {
      nome: (value) => (value.length < 2 ? 'Nome deve ter pelo menos 2 caracteres' : null),
    },
  })

  useEffect(() => {
    loadAgentes()
  }, [])

  const loadAgentes = async () => {
    try {
      setLoading(true)
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500))
        setAgentes(mockAgentes)
      } else {
        const data = await iaService.listAgentes()
        setAgentes(data)
      }
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível carregar os agentes')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (agente: AgenteIADto) => {
    setSelectedAgente(agente)
    form.setValues({
      nome: agente.nome,
      descricao: agente.descricao || '',
      personalidade: agente.personalidade || '',
      modelo: agente.modelo,
      temperatura: agente.temperatura,
      maxTokens: agente.maxTokens,
      ativo: agente.ativo,
    })
    setSystemPrompt(mockSystemPrompts[agente.id] || '')
    openEditModal()
  }

  const handleViewMetrics = (agente: AgenteIADto) => {
    setSelectedAgente(agente)
    openMetricsModal()
  }

  const handleSave = async () => {
    if (!form.isValid() || !selectedAgente) {
      form.validate()
      return
    }

    try {
      setSaving(true)
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 500))
        ArchbaseNotifications.showSuccess('Sucesso', 'Agente atualizado com sucesso')
        closeEditModal()
        loadAgentes()
      } else {
        await iaService.updateAgente(selectedAgente.id, {
          nome: form.values.nome,
          descricao: form.values.descricao,
          personalidade: form.values.personalidade,
          modelo: form.values.modelo,
          temperatura: form.values.temperatura,
          maxTokens: form.values.maxTokens,
          ativo: form.values.ativo,
        })
        ArchbaseNotifications.showSuccess('Sucesso', 'Agente atualizado com sucesso')
        closeEditModal()
        loadAgentes()
      }
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível salvar o agente')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" color={AppColors.primary} />
      </Center>
    )
  }

  return (
    <Stack gap="lg" p="md">
      <Group justify="space-between">
        <div>
          <Title order={2}>Agentes IA</Title>
          <Text c="dimmed" size="sm">
            Configuração e monitoramento dos agentes de inteligência artificial
          </Text>
        </div>
        <Badge variant="light" color="blue" size="lg">
          {agentes.length} agentes
        </Badge>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        {agentes.map((agente) => (
          <AgenteCard
            key={agente.id}
            agente={agente}
            onEdit={() => handleEdit(agente)}
            onMetrics={() => handleViewMetrics(agente)}
          />
        ))}
      </SimpleGrid>

      {/* Modal de Edição */}
      <Modal
        opened={editModalOpened}
        onClose={closeEditModal}
        title={`Editar Agente: ${selectedAgente?.nome}`}
        size="xl"
      >
        <Tabs defaultValue="prompt" variant="pills">
          <Tabs.List mb="md">
            <Tabs.Tab value="prompt" leftSection={<IconCode size={16} />}>
              System Prompt
            </Tabs.Tab>
            <Tabs.Tab value="config" leftSection={<IconSettings size={16} />}>
              Configuração
            </Tabs.Tab>
            <Tabs.Tab value="metrics" leftSection={<IconChartBar size={16} />}>
              Métricas
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="prompt">
            <Stack gap="md">
              <Text size="sm" c="dimmed">
                O System Prompt define o comportamento, personalidade e regras do agente.
              </Text>
              <Textarea
                label="System Prompt"
                placeholder="Defina as instruções do agente..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.currentTarget.value)}
                minRows={15}
                maxRows={25}
                autosize
                styles={{
                  input: {
                    fontFamily: 'monospace',
                    fontSize: '13px',
                  },
                }}
              />
              <Group justify="flex-end">
                <Button variant="default" onClick={closeEditModal}>Cancelar</Button>
                <Button onClick={handleSave} loading={saving} leftSection={<IconCheck size={16} />}>
                  Salvar
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="config">
            <Stack gap="md">
              <TextInput
                label="Nome do Agente"
                {...form.getInputProps('nome')}
              />

              <Textarea
                label="Descrição"
                {...form.getInputProps('descricao')}
                minRows={2}
              />

              <TextInput
                label="Personalidade"
                placeholder="Ex: Empática, animada e acolhedora"
                {...form.getInputProps('personalidade')}
              />

              <Select
                label="Modelo LLM"
                data={[
                  { value: 'deepseek/deepseek-chat', label: 'DeepSeek Chat' },
                  { value: 'anthropic/claude-3-sonnet', label: 'Claude 3 Sonnet' },
                  { value: 'openai/gpt-4o', label: 'GPT-4o' },
                  { value: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
                  { value: 'meta-llama/llama-3.1-70b', label: 'Llama 3.1 70B' },
                ]}
                {...form.getInputProps('modelo')}
              />

              <Box px="md">
                <Text size="sm" fw={500} mb="xs">
                  Temperatura: {form.values.temperatura}
                </Text>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 0.5, label: '0.5' },
                    { value: 1, label: '1' },
                  ]}
                  {...form.getInputProps('temperatura')}
                />
                <Text size="xs" c="dimmed" mt="xs">
                  Valores baixos = mais determinístico. Valores altos = mais criativo.
                </Text>
              </Box>

              <NumberInput
                label="Max Tokens"
                min={256}
                max={8192}
                step={256}
                {...form.getInputProps('maxTokens')}
              />

              <Switch
                label="Agente Ativo"
                description="Desativar impede que o agente seja usado"
                {...form.getInputProps('ativo', { type: 'checkbox' })}
              />

              <Group justify="flex-end">
                <Button variant="default" onClick={closeEditModal}>Cancelar</Button>
                <Button onClick={handleSave} loading={saving} leftSection={<IconCheck size={16} />}>
                  Salvar
                </Button>
              </Group>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="metrics">
            <Stack gap="md">
              {selectedAgente && (
                <>
                  <SimpleGrid cols={3}>
                    <Paper withBorder p="md">
                      <Group justify="center">
                        <RingProgress
                          size={100}
                          thickness={10}
                          sections={[
                            { value: selectedAgente.taxaSucesso || 0, color: 'green' },
                          ]}
                          label={
                            <Text ta="center" size="sm" fw={700}>
                              {selectedAgente.taxaSucesso}%
                            </Text>
                          }
                        />
                      </Group>
                      <Text ta="center" size="sm" c="dimmed" mt="xs">Taxa de Sucesso</Text>
                    </Paper>
                    <Paper withBorder p="md">
                      <Text ta="center" size="xl" fw={700}>
                        {selectedAgente.totalInteracoes?.toLocaleString()}
                      </Text>
                      <Text ta="center" size="sm" c="dimmed">Total de Interações</Text>
                    </Paper>
                    <Paper withBorder p="md">
                      <Text ta="center" size="xl" fw={700}>
                        {selectedAgente.mediaLatenciaMs}ms
                      </Text>
                      <Text ta="center" size="sm" c="dimmed">Latência Média</Text>
                    </Paper>
                  </SimpleGrid>

                  <Paper withBorder p="md">
                    <Title order={5} mb="md">Últimas Execuções</Title>
                    <Table striped highlightOnHover>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>Horário</Table.Th>
                          <Table.Th>Input</Table.Th>
                          <Table.Th>Output</Table.Th>
                          <Table.Th>Latência</Table.Th>
                          <Table.Th>Status</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {mockExecucoes.map((exec, idx) => (
                          <Table.Tr key={idx}>
                            <Table.Td>
                              <Text size="xs">
                                {new Date(exec.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text size="xs" lineClamp={1} maw={200}>{exec.input}</Text>
                            </Table.Td>
                            <Table.Td>
                              <Badge size="xs" variant="outline">{exec.output}</Badge>
                            </Table.Td>
                            <Table.Td>
                              <Text size="xs">{exec.latenciaMs}ms</Text>
                            </Table.Td>
                            <Table.Td>
                              <Badge size="xs" color={exec.sucesso ? 'green' : 'red'}>
                                {exec.sucesso ? 'OK' : 'Erro'}
                              </Badge>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Paper>
                </>
              )}
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Modal>

      {/* Modal de Métricas (view rápida) */}
      <Modal
        opened={metricsModalOpened}
        onClose={closeMetricsModal}
        title={`Métricas: ${selectedAgente?.nome}`}
        size="lg"
      >
        {selectedAgente && (
          <Stack gap="md">
            <SimpleGrid cols={3}>
              <Paper withBorder p="md">
                <Group justify="center">
                  <RingProgress
                    size={80}
                    thickness={8}
                    sections={[
                      { value: selectedAgente.taxaSucesso || 0, color: 'green' },
                    ]}
                    label={
                      <Text ta="center" size="xs" fw={700}>
                        {selectedAgente.taxaSucesso}%
                      </Text>
                    }
                  />
                </Group>
                <Text ta="center" size="xs" c="dimmed" mt="xs">Taxa de Sucesso</Text>
              </Paper>
              <Paper withBorder p="md">
                <Group gap={4} justify="center">
                  <IconActivity size={24} color={AppColors.primary} />
                </Group>
                <Text ta="center" size="lg" fw={700}>
                  {selectedAgente.totalInteracoes?.toLocaleString()}
                </Text>
                <Text ta="center" size="xs" c="dimmed">Interações</Text>
              </Paper>
              <Paper withBorder p="md">
                <Group gap={4} justify="center">
                  <IconClock size={24} color={AppColors.accent} />
                </Group>
                <Text ta="center" size="lg" fw={700}>
                  {selectedAgente.mediaLatenciaMs}ms
                </Text>
                <Text ta="center" size="xs" c="dimmed">Latência</Text>
              </Paper>
            </SimpleGrid>

            <Paper withBorder p="md">
              <Title order={6} mb="sm">Configuração Atual</Title>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Modelo</Text>
                  <Text size="sm" fw={500}>{selectedAgente.modelo}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Temperatura</Text>
                  <Text size="sm" fw={500}>{selectedAgente.temperatura}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Max Tokens</Text>
                  <Text size="sm" fw={500}>{selectedAgente.maxTokens}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Status</Text>
                  <Badge color={selectedAgente.ativo ? 'green' : 'red'} size="sm">
                    {selectedAgente.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </Group>
              </Stack>
            </Paper>

            <Group justify="flex-end">
              <Button variant="default" onClick={closeMetricsModal}>Fechar</Button>
              <Button onClick={() => { closeMetricsModal(); handleEdit(selectedAgente) }}>
                Editar Agente
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Stack>
  )
}

// ========== Componentes Auxiliares ==========

interface AgenteCardProps {
  agente: AgenteIADto
  onEdit: () => void
  onMetrics: () => void
}

function AgenteCard({ agente, onEdit, onMetrics }: AgenteCardProps) {
  const iconMap: Record<TipoAgenteIA, React.ElementType> = {
    ORQUESTRADOR: IconBrain,
    PRESCRITOR: IconRobot,
    MOTIVADOR: IconSparkles,
    SUPORTE_EMOCIONAL: IconHeart,
    SENTINELA: IconShield,
    ANALISTA: IconChartDots,
  }

  const colorMap: Record<TipoAgenteIA, string> = {
    ORQUESTRADOR: 'blue',
    PRESCRITOR: 'green',
    MOTIVADOR: 'yellow',
    SUPORTE_EMOCIONAL: 'pink',
    SENTINELA: 'red',
    ANALISTA: 'violet',
  }

  const Icon = iconMap[agente.tipo] || IconRobot
  const color = colorMap[agente.tipo] || 'blue'

  return (
    <Card withBorder radius="md" p="lg">
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <ThemeIcon size={48} radius="md" variant="light" color={color}>
            <Icon size={24} />
          </ThemeIcon>
          <div>
            <Text size="lg" fw={600}>
              {agente.nome}
            </Text>
            <Badge size="sm" variant="outline" color={color}>
              {agente.tipo}
            </Badge>
          </div>
        </Group>
        <Switch checked={agente.ativo} readOnly size="sm" />
      </Group>

      <Text size="sm" c="dimmed" mb="md" lineClamp={2}>
        {agente.descricao || 'Sem descrição'}
      </Text>

      <Stack gap="xs" mb="md">
        <Group justify="space-between">
          <Text size="xs" c="dimmed">Modelo</Text>
          <Text size="xs" fw={500}>{agente.modelo}</Text>
        </Group>
        <Group justify="space-between">
          <Text size="xs" c="dimmed">Temperatura</Text>
          <Text size="xs" fw={500}>{agente.temperatura}</Text>
        </Group>
        <Group justify="space-between">
          <Text size="xs" c="dimmed">Max Tokens</Text>
          <Text size="xs" fw={500}>{agente.maxTokens}</Text>
        </Group>
      </Stack>

      {agente.taxaSucesso !== undefined && (
        <div>
          <Group justify="space-between" mb={4}>
            <Text size="xs" c="dimmed">Taxa de Sucesso</Text>
            <Text size="xs" fw={500}>{agente.taxaSucesso}%</Text>
          </Group>
          <Progress value={agente.taxaSucesso} size="sm" color={color} />
        </div>
      )}

      <Group justify="flex-end" mt="md" gap="xs">
        <Tooltip label="Ver Métricas">
          <ActionIcon variant="subtle" color={color} onClick={onMetrics}>
            <IconChartBar size={18} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Editar">
          <ActionIcon variant="subtle" color="yellow" onClick={onEdit}>
            <IconEdit size={18} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Card>
  )
}
