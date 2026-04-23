/**
 * IAChecklistView - Checklist do Prescritor (Patrícia)
 */
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
  Alert,
  Card,
  Timeline,
  List,
  Checkbox,
} from '@mantine/core'
import {
  IconChecklist,
  IconCheck,
  IconArrowUp,
  IconArrowDown,
  IconMinus,
  IconQuote,
  IconAlertCircle,
} from '@tabler/icons-react'

const checklistItems = [
  {
    categoria: 'Condicao Fisica',
    perguntas: [
      'A aluna reportou dor ou desconforto recentemente?',
      'Ha alguma contraindicacao medica ativa?',
      'O nivel de energia esta adequado para o treino planejado?',
      'A qualidade do sono esta impactando a recuperacao?',
    ],
  },
  {
    categoria: 'Progressao',
    perguntas: [
      'A aluna concluiu os ultimos 3 treinos sem dificuldade?',
      'O feedback dos treinos esta positivo (nota >= 4)?',
      'Ha sinais de estagnacao ou platô?',
      'Esta na hora de aumentar a intensidade?',
    ],
  },
  {
    categoria: 'Contexto Emocional',
    perguntas: [
      'O humor da aluna esta estavel?',
      'Ha eventos de vida que podem impactar o treino?',
      'A motivacao esta em nivel adequado?',
      'Precisa de adaptacao por questoes emocionais?',
    ],
  },
  {
    categoria: 'Historico Recente',
    perguntas: [
      'Quantos treinos foram completados na ultima semana?',
      'Houve faltas ou cancelamentos?',
      'O streak atual esta ativo?',
      'Ha padroes de comportamento a considerar?',
    ],
  },
]

const fluxoDecisao = [
  { label: 'Coletar dados da aluna', descricao: 'Anamnese, histórico, contexto atual' },
  { label: 'Avaliar condição física', descricao: 'Dores, limitações, energia' },
  { label: 'Checar progressão', descricao: 'Feedbacks, conclusões, dificuldades' },
  { label: 'Considerar emocional', descricao: 'Humor, motivação, eventos' },
  { label: 'Decidir prescrição', descricao: 'Progredir, manter ou regredir' },
  { label: 'Gerar treino', descricao: 'Montar sessão personalizada' },
]

export function IAChecklistView() {
  return (
    <Stack gap="lg" p="md">
      <Group justify="space-between">
        <Title order={2}>Checklist do Prescritor (Patrícia)</Title>
      </Group>

      <Alert icon={<IconQuote size={16} />} color="teal" variant="light">
        <Text size="sm" fs="italic" fw={500}>
          "Cada aluna é única. A prescrição deve considerar não apenas o corpo,
          mas também a mente e o momento de vida."
        </Text>
        <Text size="xs" c="dimmed" mt="xs">- Patrícia, Educadora Física BlueVix</Text>
      </Alert>

      <Alert icon={<IconAlertCircle size={16} />} color="yellow" variant="light">
        <Text size="sm">
          Este checklist é executado automaticamente pela IA antes de cada prescrição de treino.
          Todas as respostas são baseadas nos dados coletados da aluna.
        </Text>
      </Alert>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        {checklistItems.map((item) => (
          <Card key={item.categoria} withBorder>
            <Card.Section withBorder inheritPadding py="xs" bg="gray.0">
              <Text fw={600}>{item.categoria}</Text>
            </Card.Section>
            <Stack gap="xs" mt="md">
              {item.perguntas.map((pergunta, idx) => (
                <Checkbox key={idx} label={pergunta} size="sm" />
              ))}
            </Stack>
          </Card>
        ))}
      </SimpleGrid>

      <Paper withBorder p="lg">
        <Title order={4} mb="md">Fluxo de Decisao</Title>
        <Timeline active={-1} bulletSize={24} lineWidth={2}>
          {fluxoDecisao.map((passo, idx) => (
            <Timeline.Item
              key={idx}
              bullet={<Text size="xs" fw={700}>{idx + 1}</Text>}
              title={passo.label}
            >
              <Text size="sm" c="dimmed">{passo.descricao}</Text>
            </Timeline.Item>
          ))}
        </Timeline>
      </Paper>

      <SimpleGrid cols={{ base: 1, md: 3 }}>
        <Paper withBorder p="md">
          <Group>
            <ThemeIcon size={40} variant="light" color="green">
              <IconArrowUp size={20} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700}>234</Text>
              <Text size="xs" c="dimmed">Progressoes</Text>
            </Box>
          </Group>
        </Paper>
        <Paper withBorder p="md">
          <Group>
            <ThemeIcon size={40} variant="light" color="blue">
              <IconMinus size={20} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700}>156</Text>
              <Text size="xs" c="dimmed">Manter Nivel</Text>
            </Box>
          </Group>
        </Paper>
        <Paper withBorder p="md">
          <Group>
            <ThemeIcon size={40} variant="light" color="orange">
              <IconArrowDown size={20} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700}>45</Text>
              <Text size="xs" c="dimmed">Regressoes</Text>
            </Box>
          </Group>
        </Paper>
      </SimpleGrid>
    </Stack>
  )
}
