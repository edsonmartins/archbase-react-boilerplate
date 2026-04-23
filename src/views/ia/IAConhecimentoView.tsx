/**
 * IAConhecimentoView - Base de Conhecimento (RAG) da IA BlueVix
 * Layout: 4 Camadas de conhecimento + Status ChromaDB
 */
import { useState } from 'react'
import {
  Stack,
  Group,
  Text,
  Paper,
  Badge,
  Button,
  Tabs,
  ThemeIcon,
  Box,
  Title,
  SimpleGrid,
  Table,
  Progress,
  Alert,
} from '@mantine/core'
import {
  IconDatabase,
  IconRefresh,
  IconBrain,
  IconHeart,
  IconRoad,
  IconShieldCheck,
  IconCheck,
  IconAlertCircle,
} from '@tabler/icons-react'
import { ArchbaseNotifications } from '@archbase/components'

// Dados mockados das 4 camadas
const camadasConhecimento = [
  {
    id: 'fisica',
    nome: 'Camada Física',
    descricao: 'Exercícios, fases, progressão, tom de voz',
    cor: 'blue',
    icon: IconBrain,
    documentos: 245,
    chunks: 1280,
    ultimaAtualizacao: '2024-04-20',
    itens: [
      { tipo: 'Exercícios', quantidade: 156 },
      { tipo: 'Fases de treino', quantidade: 6 },
      { tipo: 'Regras progressão', quantidade: 45 },
      { tipo: 'Tom de voz Patrícia', quantidade: 38 },
    ],
  },
  {
    id: 'emocional',
    nome: 'Camada Emocional',
    descricao: 'Perfis, prescrição emocional, protocolos, frases',
    cor: 'violet',
    icon: IconHeart,
    documentos: 180,
    chunks: 920,
    ultimaAtualizacao: '2024-04-19',
    itens: [
      { tipo: 'Perfis emocionais', quantidade: 6 },
      { tipo: 'Protocolos Virgínia', quantidade: 24 },
      { tipo: 'Frases BlueVix', quantidade: 120 },
      { tipo: 'Regras prescrição', quantidade: 30 },
    ],
  },
  {
    id: 'jornada',
    nome: 'Camada Jornada',
    descricao: 'Etapas da aluna, regras de transição',
    cor: 'teal',
    icon: IconRoad,
    documentos: 85,
    chunks: 410,
    ultimaAtualizacao: '2024-04-18',
    itens: [
      { tipo: 'Etapas jornada', quantidade: 12 },
      { tipo: 'Regras transição', quantidade: 35 },
      { tipo: 'Marcos importantes', quantidade: 20 },
      { tipo: 'Celebrações', quantidade: 18 },
    ],
  },
  {
    id: 'seguranca',
    nome: 'Camada Segurança',
    descricao: 'Contraindicações, regras de segurança',
    cor: 'red',
    icon: IconShieldCheck,
    documentos: 65,
    chunks: 320,
    ultimaAtualizacao: '2024-04-20',
    itens: [
      { tipo: 'Contraindicacoes', quantidade: 28 },
      { tipo: 'Regras NUNCA', quantidade: 15 },
      { tipo: 'Regras ESCALA', quantidade: 12 },
      { tipo: 'Alertas automaticos', quantidade: 10 },
    ],
  },
]

const chromaDBStatus = {
  status: 'online',
  colecao: 'bluevix-knowledge',
  totalChunks: 2930,
  embeddingModel: 'text-embedding-3-small',
  ultimoSync: '2024-04-20 14:32:00',
}

interface CamadaCardProps {
  camada: typeof camadasConhecimento[0]
}

function CamadaCard({ camada }: CamadaCardProps) {
  const Icon = camada.icon

  return (
    <Paper withBorder p="lg">
      <Group justify="space-between" mb="md">
        <Group>
          <ThemeIcon size={40} variant="light" color={camada.cor} radius="md">
            <Icon size={24} />
          </ThemeIcon>
          <Box>
            <Text fw={600}>{camada.nome}</Text>
            <Text size="xs" c="dimmed">{camada.descricao}</Text>
          </Box>
        </Group>
        <Badge color={camada.cor}>{camada.documentos} docs</Badge>
      </Group>

      <SimpleGrid cols={2} spacing="xs">
        {camada.itens.map((item) => (
          <Group key={item.tipo} justify="space-between">
            <Text size="sm">{item.tipo}</Text>
            <Badge variant="light" size="sm">{item.quantidade}</Badge>
          </Group>
        ))}
      </SimpleGrid>

      <Group justify="space-between" mt="md">
        <Text size="xs" c="dimmed">
          {camada.chunks} chunks indexados
        </Text>
        <Text size="xs" c="dimmed">
          Atualizado: {camada.ultimaAtualizacao}
        </Text>
      </Group>
    </Paper>
  )
}

export function IAConhecimentoView() {
  const [reindexando, setReindexando] = useState(false)

  const handleReindex = async () => {
    setReindexando(true)
    // Simular reindexacao
    setTimeout(() => {
      setReindexando(false)
      ArchbaseNotifications.showSuccess('Sucesso', 'Base de conhecimento reindexada com sucesso')
    }, 3000)
  }

  const totalDocs = camadasConhecimento.reduce((acc, c) => acc + c.documentos, 0)
  const totalChunks = camadasConhecimento.reduce((acc, c) => acc + c.chunks, 0)

  return (
    <Stack gap="lg" p="md">
      <Group justify="space-between">
        <Title order={2}>Base de Conhecimento (RAG)</Title>
        <Button
          leftSection={<IconRefresh size={16} />}
          onClick={handleReindex}
          loading={reindexando}
        >
          Re-indexar ChromaDB
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 2, md: 4 }}>
        <Paper withBorder p="md">
          <Group>
            <ThemeIcon size={40} variant="light" color="blue">
              <IconDatabase size={20} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700}>{totalDocs}</Text>
              <Text size="xs" c="dimmed">Documentos</Text>
            </Box>
          </Group>
        </Paper>
        <Paper withBorder p="md">
          <Group>
            <ThemeIcon size={40} variant="light" color="teal">
              <IconBrain size={20} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700}>{totalChunks}</Text>
              <Text size="xs" c="dimmed">Chunks</Text>
            </Box>
          </Group>
        </Paper>
        <Paper withBorder p="md">
          <Group>
            <ThemeIcon size={40} variant="light" color="green">
              <IconCheck size={20} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700}>4</Text>
              <Text size="xs" c="dimmed">Camadas</Text>
            </Box>
          </Group>
        </Paper>
        <Paper withBorder p="md">
          <Group>
            <ThemeIcon
              size={40}
              variant="light"
              color={chromaDBStatus.status === 'online' ? 'green' : 'red'}
            >
              <IconDatabase size={20} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700} tt="capitalize">{chromaDBStatus.status}</Text>
              <Text size="xs" c="dimmed">ChromaDB</Text>
            </Box>
          </Group>
        </Paper>
      </SimpleGrid>

      <Paper withBorder p="md">
        <Group justify="space-between" mb="md">
          <Text fw={500}>Status ChromaDB</Text>
          <Badge color={chromaDBStatus.status === 'online' ? 'green' : 'red'}>
            {chromaDBStatus.status}
          </Badge>
        </Group>
        <SimpleGrid cols={{ base: 2, md: 4 }}>
          <Box>
            <Text size="xs" c="dimmed">Colecao</Text>
            <Text size="sm">{chromaDBStatus.colecao}</Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed">Total Chunks</Text>
            <Text size="sm">{chromaDBStatus.totalChunks}</Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed">Modelo Embedding</Text>
            <Text size="sm">{chromaDBStatus.embeddingModel}</Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed">Ultimo Sync</Text>
            <Text size="sm">{chromaDBStatus.ultimoSync}</Text>
          </Box>
        </SimpleGrid>
      </Paper>

      <Tabs defaultValue="fisica" variant="pills">
        <Tabs.List>
          {camadasConhecimento.map((camada) => (
            <Tabs.Tab key={camada.id} value={camada.id} leftSection={<camada.icon size={16} />}>
              {camada.nome}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {camadasConhecimento.map((camada) => (
          <Tabs.Panel key={camada.id} value={camada.id} pt="md">
            <CamadaCard camada={camada} />
          </Tabs.Panel>
        ))}
      </Tabs>
    </Stack>
  )
}
