/**
 * IAFrasesView - Banco de Frases BlueVix
 *
 * Gerenciamento de frases usadas pela IA nas conversas.
 */
import { useState } from 'react'
import {
  Stack,
  Group,
  Text,
  Paper,
  Badge,
  Button,
  TextInput,
  Select,
  Table,
  Title,
  ActionIcon,
  Tooltip,
  Modal,
  Textarea,
  SegmentedControl,
  SimpleGrid,
  ThemeIcon,
  Box,
  ScrollArea,
  Divider,
  Switch,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconSearch,
  IconPlus,
  IconEdit,
  IconTrash,
  IconMessageCircle,
  IconCheck,
  IconX,
  IconStar,
} from '@tabler/icons-react'
import { ArchbaseNotifications } from '@archbase/components'

// Interface da frase
interface Frase {
  id: string
  texto: string
  contexto: string
  status: 'APROVADA' | 'PENDENTE' | 'PROIBIDA'
  usos: number
  criadaPor: string
}

// Dados mock
const mockFrases: Frase[] = [
  {
    id: '1',
    texto: 'Você está indo muito bem! Continue assim!',
    contexto: 'MOTIVACAO',
    status: 'APROVADA',
    usos: 1250,
    criadaPor: 'Patrícia',
  },
  {
    id: '2',
    texto: 'Percebi que você está passando por um momento difícil. Estou aqui para te ouvir.',
    contexto: 'ACOLHIMENTO',
    status: 'APROVADA',
    usos: 890,
    criadaPor: 'Virgínia',
  },
  {
    id: '3',
    texto: 'Lembre-se: cada passo conta. Não precisa ser perfeito, precisa ser consistente.',
    contexto: 'MOTIVACAO',
    status: 'APROVADA',
    usos: 720,
    criadaPor: 'Patrícia',
  },
  {
    id: '4',
    texto: 'Você é muito forte por estar aqui. Isso já é uma vitória.',
    contexto: 'ACOLHIMENTO',
    status: 'PENDENTE',
    usos: 0,
    criadaPor: 'Virgínia',
  },
  {
    id: '5',
    texto: 'Vamos com calma hoje, ok? Seu corpo precisa de descanso também.',
    contexto: 'DESCANSO',
    status: 'APROVADA',
    usos: 450,
    criadaPor: 'Vix',
  },
  {
    id: '6',
    texto: 'Parabéns! Você completou mais um treino! Cada conquista merece ser celebrada!',
    contexto: 'CELEBRACAO',
    status: 'APROVADA',
    usos: 2100,
    criadaPor: 'Vix',
  },
  {
    id: '7',
    texto: 'Seu corpo é incrível! Veja o quanto você já evoluiu desde o início.',
    contexto: 'MOTIVACAO',
    status: 'APROVADA',
    usos: 680,
    criadaPor: 'Patrícia',
  },
  {
    id: '8',
    texto: 'Está tudo bem sentir o que você está sentindo. Seus sentimentos são válidos.',
    contexto: 'ACOLHIMENTO',
    status: 'APROVADA',
    usos: 920,
    criadaPor: 'Virgínia',
  },
  {
    id: '9',
    texto: 'Hoje é dia de descanso ativo. Que tal uma caminhada leve ou alongamento?',
    contexto: 'DESCANSO',
    status: 'APROVADA',
    usos: 340,
    criadaPor: 'Patrícia',
  },
  {
    id: '10',
    texto: 'Atenção à postura durante o exercício. Qualidade é mais importante que quantidade.',
    contexto: 'INSTRUCAO',
    status: 'APROVADA',
    usos: 1580,
    criadaPor: 'Patrícia',
  },
  {
    id: '11',
    texto: 'Você perdeu peso? Eu percebi que está diferente!',
    contexto: 'CELEBRACAO',
    status: 'PROIBIDA',
    usos: 0,
    criadaPor: 'Sistema',
  },
  {
    id: '12',
    texto: 'Você está radiante hoje! A energia está ótima!',
    contexto: 'CELEBRACAO',
    status: 'APROVADA',
    usos: 780,
    criadaPor: 'Vix',
  },
  {
    id: '13',
    texto: 'Respire fundo. Inspire pelo nariz, expire pela boca. Vamos juntas.',
    contexto: 'ACOLHIMENTO',
    status: 'APROVADA',
    usos: 1120,
    criadaPor: 'Virgínia',
  },
  {
    id: '14',
    texto: 'Notei que você está treinando menos esta semana. Está tudo bem?',
    contexto: 'ALERTA',
    status: 'APROVADA',
    usos: 420,
    criadaPor: 'Vix',
  },
  {
    id: '15',
    texto: 'Lembre-se de se hidratar! Beba água antes, durante e depois do treino.',
    contexto: 'INSTRUCAO',
    status: 'APROVADA',
    usos: 890,
    criadaPor: 'Patrícia',
  },
  {
    id: '16',
    texto: 'Você devia comer menos carboidrato para emagrecer.',
    contexto: 'INSTRUCAO',
    status: 'PROIBIDA',
    usos: 0,
    criadaPor: 'Sistema',
  },
  {
    id: '17',
    texto: 'Uau! Você bateu seu recorde pessoal! Isso é incrível!',
    contexto: 'CELEBRACAO',
    status: 'APROVADA',
    usos: 560,
    criadaPor: 'Vix',
  },
  {
    id: '18',
    texto: 'Descanse bem hoje. O descanso faz parte do treino.',
    contexto: 'DESCANSO',
    status: 'APROVADA',
    usos: 670,
    criadaPor: 'Patrícia',
  },
  {
    id: '19',
    texto: 'Você é capaz de muito mais do que imagina. Acredite em você!',
    contexto: 'MOTIVACAO',
    status: 'PENDENTE',
    usos: 0,
    criadaPor: 'Vix',
  },
  {
    id: '20',
    texto: 'Se precisar conversar, estou aqui. Não precisa enfrentar sozinha.',
    contexto: 'ACOLHIMENTO',
    status: 'APROVADA',
    usos: 1340,
    criadaPor: 'Virgínia',
  },
]

const contextoOptions = [
  { value: 'MOTIVACAO', label: 'Motivação' },
  { value: 'ACOLHIMENTO', label: 'Acolhimento' },
  { value: 'DESCANSO', label: 'Descanso' },
  { value: 'CELEBRACAO', label: 'Celebração' },
  { value: 'ALERTA', label: 'Alerta' },
  { value: 'INSTRUCAO', label: 'Instrução' },
]

const statusOptions = [
  { value: 'APROVADA', label: 'Aprovada' },
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'PROIBIDA', label: 'Proibida' },
]

const autorOptions = [
  { value: 'Patrícia', label: 'Patrícia' },
  { value: 'Virgínia', label: 'Virgínia' },
  { value: 'Vix', label: 'Vix' },
]

const statusColors: Record<string, string> = {
  APROVADA: 'green',
  PENDENTE: 'yellow',
  PROIBIDA: 'red',
}

// Estado inicial do formulário
const emptyFrase: Omit<Frase, 'id' | 'usos'> = {
  texto: '',
  contexto: 'MOTIVACAO',
  status: 'PENDENTE',
  criadaPor: 'Vix',
}

export function IAFrasesView() {
  const [frases, setFrases] = useState<Frase[]>(mockFrases)
  const [busca, setBusca] = useState('')
  const [statusFilter, setStatusFilter] = useState('APROVADA')
  const [contextoFilter, setContextoFilter] = useState<string | null>(null)

  // Modals
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false)
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)

  // Form state
  const [editingFrase, setEditingFrase] = useState<Frase | null>(null)
  const [fraseToDelete, setFraseToDelete] = useState<Frase | null>(null)
  const [formData, setFormData] = useState<Omit<Frase, 'id' | 'usos'>>(emptyFrase)

  // Filtrar frases
  const filteredFrases = frases.filter((frase) => {
    const matchBusca = !busca || frase.texto.toLowerCase().includes(busca.toLowerCase())
    const matchStatus = !statusFilter || frase.status === statusFilter
    const matchContexto = !contextoFilter || frase.contexto === contextoFilter
    return matchBusca && matchStatus && matchContexto
  })

  // Métricas
  const aprovadas = frases.filter((f) => f.status === 'APROVADA').length
  const proibidas = frases.filter((f) => f.status === 'PROIBIDA').length
  const totalUsos = frases.reduce((acc, f) => acc + f.usos, 0)
  const topFrase = frases.length > 0 ? frases.reduce((a, b) => (a.usos > b.usos ? a : b)) : null

  // Abrir modal para nova frase
  const handleNewFrase = () => {
    setEditingFrase(null)
    setFormData(emptyFrase)
    openModal()
  }

  // Abrir modal para editar frase
  const handleEditFrase = (frase: Frase) => {
    setEditingFrase(frase)
    setFormData({
      texto: frase.texto,
      contexto: frase.contexto,
      status: frase.status,
      criadaPor: frase.criadaPor,
    })
    openModal()
  }

  // Confirmar exclusão
  const handleConfirmDelete = (frase: Frase) => {
    setFraseToDelete(frase)
    openDeleteModal()
  }

  // Excluir frase
  const handleDeleteFrase = () => {
    if (!fraseToDelete) return
    setFrases((prev) => prev.filter((f) => f.id !== fraseToDelete.id))
    ArchbaseNotifications.showSuccess('Frase excluída', 'A frase foi removida do banco')
    closeDeleteModal()
    setFraseToDelete(null)
  }

  // Salvar frase
  const handleSaveFrase = () => {
    // Validações
    if (!formData.texto.trim()) {
      ArchbaseNotifications.showError('Erro', 'Texto da frase é obrigatório')
      return
    }
    if (formData.texto.length < 10) {
      ArchbaseNotifications.showError('Erro', 'A frase deve ter pelo menos 10 caracteres')
      return
    }

    if (editingFrase) {
      // Atualizar existente
      setFrases((prev) =>
        prev.map((f) =>
          f.id === editingFrase.id
            ? { ...f, ...formData }
            : f
        )
      )
      ArchbaseNotifications.showSuccess('Frase atualizada', 'As alterações foram salvas')
    } else {
      // Criar nova
      const novaFrase: Frase = {
        id: `frase-${Date.now()}`,
        ...formData,
        usos: 0,
      }
      setFrases((prev) => [novaFrase, ...prev])
      ArchbaseNotifications.showSuccess('Frase criada', 'A nova frase foi adicionada ao banco')
    }

    closeModal()
    setFormData(emptyFrase)
    setEditingFrase(null)
  }

  // Aprovar frase rapidamente
  const handleQuickApprove = (frase: Frase) => {
    setFrases((prev) =>
      prev.map((f) =>
        f.id === frase.id ? { ...f, status: 'APROVADA' as const } : f
      )
    )
    ArchbaseNotifications.showSuccess('Frase aprovada', `"${frase.texto.substring(0, 30)}..." foi aprovada`)
  }

  // Proibir frase rapidamente
  const handleQuickProhibit = (frase: Frase) => {
    setFrases((prev) =>
      prev.map((f) =>
        f.id === frase.id ? { ...f, status: 'PROIBIDA' as const } : f
      )
    )
    ArchbaseNotifications.showWarning('Frase proibida', `"${frase.texto.substring(0, 30)}..." foi marcada como proibida`)
  }

  return (
    <Stack gap="lg" p="md" h="calc(100vh - 80px)" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <Group justify="space-between" style={{ flexShrink: 0 }}>
        <div>
          <Title order={2}>Frases BlueVix</Title>
          <Text c="dimmed" size="sm">
            Banco de frases usadas pela Vix nas conversas
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleNewFrase}>
          Nova Frase
        </Button>
      </Group>

      {/* Métricas */}
      <SimpleGrid cols={{ base: 2, md: 4 }} style={{ flexShrink: 0 }}>
        <Paper withBorder p="md" shadow="0">
          <Group>
            <ThemeIcon size={40} variant="light" color="green">
              <IconCheck size={20} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700}>{aprovadas}</Text>
              <Text size="xs" c="dimmed">Aprovadas</Text>
            </Box>
          </Group>
        </Paper>
        <Paper withBorder p="md" shadow="0">
          <Group>
            <ThemeIcon size={40} variant="light" color="red">
              <IconX size={20} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700}>{proibidas}</Text>
              <Text size="xs" c="dimmed">Proibidas</Text>
            </Box>
          </Group>
        </Paper>
        <Paper withBorder p="md" shadow="0">
          <Group>
            <ThemeIcon size={40} variant="light" color="blue">
              <IconMessageCircle size={20} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700}>{totalUsos.toLocaleString()}</Text>
              <Text size="xs" c="dimmed">Total de Usos</Text>
            </Box>
          </Group>
        </Paper>
        <Paper withBorder p="md" shadow="0">
          <Group>
            <ThemeIcon size={40} variant="light" color="yellow">
              <IconStar size={20} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700}>{topFrase?.usos.toLocaleString() || 0}</Text>
              <Text size="xs" c="dimmed">Top Frase</Text>
            </Box>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Filtros */}
      <Paper withBorder p="md" shadow="0" style={{ flexShrink: 0 }}>
        <Group>
          <SegmentedControl
            value={statusFilter}
            onChange={setStatusFilter}
            data={[
              { value: 'APROVADA', label: 'Aprovadas' },
              { value: 'PENDENTE', label: 'Pendentes' },
              { value: 'PROIBIDA', label: 'Proibidas' },
            ]}
          />
          <TextInput
            placeholder="Buscar frase..."
            leftSection={<IconSearch size={16} />}
            value={busca}
            onChange={(e) => setBusca(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Contexto"
            data={contextoOptions}
            value={contextoFilter}
            onChange={setContextoFilter}
            clearable
            style={{ width: 160 }}
          />
        </Group>
      </Paper>

      {/* Tabela */}
      <Paper withBorder shadow="0" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <ScrollArea style={{ flex: 1 }} offsetScrollbars>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Frase</Table.Th>
                <Table.Th>Contexto</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Usos</Table.Th>
                <Table.Th>Criada por</Table.Th>
                <Table.Th style={{ width: 120 }}>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredFrases.map((frase) => (
                <Table.Tr key={frase.id}>
                  <Table.Td>
                    <Text size="sm" lineClamp={2} maw={400}>{frase.texto}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="outline">{frase.contexto}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={statusColors[frase.status]}>{frase.status}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{frase.usos.toLocaleString()}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{frase.criadaPor}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {frase.status === 'PENDENTE' && (
                        <>
                          <Tooltip label="Aprovar">
                            <ActionIcon
                              variant="subtle"
                              color="green"
                              onClick={() => handleQuickApprove(frase)}
                            >
                              <IconCheck size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Proibir">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => handleQuickProhibit(frase)}
                            >
                              <IconX size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </>
                      )}
                      <Tooltip label="Editar">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleEditFrase(frase)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Excluir">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleConfirmDelete(frase)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
              {filteredFrases.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Text c="dimmed" ta="center" py="xl">
                      Nenhuma frase encontrada
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {/* Modal de Edição/Criação */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={editingFrase ? 'Editar Frase' : 'Nova Frase'}
        size="lg"
      >
        <Stack gap="md">
          {/* Texto */}
          <Textarea
            label="Texto da Frase"
            placeholder="Digite a frase que a Vix pode usar..."
            description={`${formData.texto.length} caracteres`}
            value={formData.texto}
            onChange={(e) => setFormData((prev) => ({ ...prev, texto: e.currentTarget.value }))}
            minRows={3}
            maxRows={6}
            autosize
            required
          />

          {/* Contexto */}
          <Select
            label="Contexto"
            description="Em que situação essa frase deve ser usada"
            placeholder="Selecione o contexto"
            data={contextoOptions}
            value={formData.contexto}
            onChange={(value) => setFormData((prev) => ({ ...prev, contexto: value || 'MOTIVACAO' }))}
            required
          />

          {/* Status */}
          <Select
            label="Status"
            description="Define se a frase pode ser usada pela IA"
            placeholder="Selecione o status"
            data={statusOptions}
            value={formData.status}
            onChange={(value) => setFormData((prev) => ({ ...prev, status: (value as Frase['status']) || 'PENDENTE' }))}
            required
          />

          {/* Criada por */}
          <Select
            label="Criada por"
            placeholder="Selecione o autor"
            data={autorOptions}
            value={formData.criadaPor}
            onChange={(value) => setFormData((prev) => ({ ...prev, criadaPor: value || 'Vix' }))}
            required
          />

          {/* Info de usos (só na edição) */}
          {editingFrase && (
            <Paper p="sm" bg="gray.0" radius="sm">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Total de usos:</Text>
                <Text size="sm" fw={500}>{editingFrase.usos.toLocaleString()}</Text>
              </Group>
            </Paper>
          )}

          <Divider />

          {/* Botões */}
          <Group justify="flex-end">
            <Button variant="default" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={handleSaveFrase}>
              {editingFrase ? 'Salvar Alterações' : 'Criar Frase'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Confirmar Exclusão"
        size="md"
      >
        <Stack gap="md">
          <Text>
            Tem certeza que deseja excluir esta frase?
          </Text>
          <Paper p="sm" bg="gray.0" radius="sm">
            <Text size="sm" fs="italic">"{fraseToDelete?.texto}"</Text>
          </Paper>
          {fraseToDelete && fraseToDelete.usos > 0 && (
            <Text size="sm" c="orange">
              Esta frase já foi usada {fraseToDelete.usos.toLocaleString()} vezes.
            </Text>
          )}
          <Group justify="flex-end">
            <Button variant="default" onClick={closeDeleteModal}>
              Cancelar
            </Button>
            <Button color="red" onClick={handleDeleteFrase}>
              Excluir
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
