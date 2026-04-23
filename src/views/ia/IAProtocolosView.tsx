/**
 * IAProtocolosView - Protocolos Emocionais da Virgínia
 *
 * Gerenciamento de protocolos que a IA utiliza para lidar com
 * diferentes estados emocionais das alunas.
 */
import { useState } from 'react'
import {
  Stack,
  Group,
  Text,
  Paper,
  Badge,
  Button,
  Title,
  SimpleGrid,
  ThemeIcon,
  Box,
  Modal,
  Timeline,
  Card,
  TextInput,
  Textarea,
  Select,
  ActionIcon,
  Divider,
  NumberInput,
  Switch,
  Tooltip,
  ColorSwatch,
  ScrollArea,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconPlus,
  IconHeart,
  IconCheck,
  IconAlertTriangle,
  IconMoodSmile,
  IconBrain,
  IconEdit,
  IconTrash,
  IconGripVertical,
  IconX,
  IconArrowUp,
  IconArrowDown,
} from '@tabler/icons-react'
import { ArchbaseNotifications } from '@archbase/components'

// Interface do protocolo
interface ProtocoloPasso {
  id: string
  ordem: number
  descricao: string
}

interface Protocolo {
  id: string
  nome: string
  gatilho: string
  cor: string
  passos: ProtocoloPasso[]
  criterioSucesso: string
  ativacoes: number
  ativo: boolean
}

// Dados mock
const mockProtocolos: Protocolo[] = [
  {
    id: '1',
    nome: 'Acolhimento Inicial',
    gatilho: 'Humor < 4 na entrada',
    cor: 'violet',
    passos: [
      { id: 'p1-1', ordem: 1, descricao: 'Validar o sentimento da aluna' },
      { id: 'p1-2', ordem: 2, descricao: 'Perguntar sobre o dia dela' },
      { id: 'p1-3', ordem: 3, descricao: 'Oferecer escuta ativa' },
      { id: 'p1-4', ordem: 4, descricao: 'Sugerir treino mais leve se necessário' },
    ],
    criterioSucesso: 'Humor aumenta em pelo menos 1 ponto',
    ativacoes: 45,
    ativo: true,
  },
  {
    id: '2',
    nome: 'Crise de Ansiedade',
    gatilho: 'Palavras-chave de ansiedade detectadas',
    cor: 'orange',
    passos: [
      { id: 'p2-1', ordem: 1, descricao: 'Respiração guiada (4-7-8)' },
      { id: 'p2-2', ordem: 2, descricao: 'Grounding: 5 coisas que vê, 4 que ouve...' },
      { id: 'p2-3', ordem: 3, descricao: 'Validação emocional' },
      { id: 'p2-4', ordem: 4, descricao: 'Se persistir, escalar para profissional' },
    ],
    criterioSucesso: 'Aluna reporta sentir-se mais calma',
    ativacoes: 23,
    ativo: true,
  },
  {
    id: '3',
    nome: 'Desmotivação',
    gatilho: '3+ dias sem treino + mensagens negativas',
    cor: 'blue',
    passos: [
      { id: 'p3-1', ordem: 1, descricao: 'Reconhecer a dificuldade' },
      { id: 'p3-2', ordem: 2, descricao: 'Relembrar conquistas anteriores' },
      { id: 'p3-3', ordem: 3, descricao: 'Propor meta pequena e alcançável' },
      { id: 'p3-4', ordem: 4, descricao: 'Celebrar qualquer avanço' },
    ],
    criterioSucesso: 'Aluna retoma treinos',
    ativacoes: 67,
    ativo: true,
  },
  {
    id: '4',
    nome: 'Celebração de Conquista',
    gatilho: 'Meta alcançada ou streak significativo',
    cor: 'green',
    passos: [
      { id: 'p4-1', ordem: 1, descricao: 'Reconhecer a conquista com entusiasmo' },
      { id: 'p4-2', ordem: 2, descricao: 'Destacar o esforço da jornada' },
      { id: 'p4-3', ordem: 3, descricao: 'Compartilhar badge/recompensa' },
      { id: 'p4-4', ordem: 4, descricao: 'Projetar próximos desafios' },
    ],
    criterioSucesso: 'Aluna expressa satisfação',
    ativacoes: 89,
    ativo: true,
  },
  {
    id: '5',
    nome: 'Preocupação com Saúde',
    gatilho: 'Menção a dores persistentes ou sintomas',
    cor: 'red',
    passos: [
      { id: 'p5-1', ordem: 1, descricao: 'Expressar preocupação genuína' },
      { id: 'p5-2', ordem: 2, descricao: 'Perguntar detalhes dos sintomas' },
      { id: 'p5-3', ordem: 3, descricao: 'Recomendar consulta médica' },
      { id: 'p5-4', ordem: 4, descricao: 'Adaptar treino se necessário' },
    ],
    criterioSucesso: 'Aluna agenda consulta ou sintomas melhoram',
    ativacoes: 12,
    ativo: true,
  },
  {
    id: '6',
    nome: 'Sobrecarga Emocional',
    gatilho: 'Múltiplos estressores mencionados',
    cor: 'pink',
    passos: [
      { id: 'p6-1', ordem: 1, descricao: 'Ouvir sem julgamento' },
      { id: 'p6-2', ordem: 2, descricao: 'Validar a dificuldade do momento' },
      { id: 'p6-3', ordem: 3, descricao: 'Oferecer pausa se necessário' },
      { id: 'p6-4', ordem: 4, descricao: 'Sugerir atividade de relaxamento' },
    ],
    criterioSucesso: 'Aluna se sente ouvida e acolhida',
    ativacoes: 34,
    ativo: true,
  },
]

// Opções de cores disponíveis
const corOptions = [
  { value: 'violet', label: 'Violeta', color: '#7c3aed' },
  { value: 'blue', label: 'Azul', color: '#2563eb' },
  { value: 'green', label: 'Verde', color: '#16a34a' },
  { value: 'orange', label: 'Laranja', color: '#ea580c' },
  { value: 'red', label: 'Vermelho', color: '#dc2626' },
  { value: 'pink', label: 'Rosa', color: '#db2777' },
  { value: 'teal', label: 'Teal', color: '#0d9488' },
  { value: 'yellow', label: 'Amarelo', color: '#ca8a04' },
]

// Estado inicial do formulário
const emptyProtocolo: Omit<Protocolo, 'id' | 'ativacoes'> = {
  nome: '',
  gatilho: '',
  cor: 'blue',
  passos: [],
  criterioSucesso: '',
  ativo: true,
}

export function IAProtocolosView() {
  const [protocolos, setProtocolos] = useState<Protocolo[]>(mockProtocolos)
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false)
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)
  const [editingProtocolo, setEditingProtocolo] = useState<Protocolo | null>(null)
  const [protocoloToDelete, setProtocoloToDelete] = useState<Protocolo | null>(null)

  // Form state
  const [formData, setFormData] = useState<Omit<Protocolo, 'id' | 'ativacoes'>>(emptyProtocolo)
  const [newPasso, setNewPasso] = useState('')

  const totalAtivacoes = protocolos.reduce((acc, p) => acc + p.ativacoes, 0)
  const protocolosAtivos = protocolos.filter((p) => p.ativo).length

  // Abrir modal para novo protocolo
  const handleNewProtocolo = () => {
    setEditingProtocolo(null)
    setFormData(emptyProtocolo)
    openModal()
  }

  // Abrir modal para editar protocolo
  const handleEditProtocolo = (protocolo: Protocolo) => {
    setEditingProtocolo(protocolo)
    setFormData({
      nome: protocolo.nome,
      gatilho: protocolo.gatilho,
      cor: protocolo.cor,
      passos: [...protocolo.passos],
      criterioSucesso: protocolo.criterioSucesso,
      ativo: protocolo.ativo,
    })
    openModal()
  }

  // Confirmar exclusão
  const handleConfirmDelete = (protocolo: Protocolo) => {
    setProtocoloToDelete(protocolo)
    openDeleteModal()
  }

  // Excluir protocolo
  const handleDeleteProtocolo = () => {
    if (!protocoloToDelete) return
    setProtocolos((prev) => prev.filter((p) => p.id !== protocoloToDelete.id))
    ArchbaseNotifications.showSuccess('Protocolo excluído', `"${protocoloToDelete.nome}" foi removido`)
    closeDeleteModal()
    setProtocoloToDelete(null)
  }

  // Adicionar passo
  const handleAddPasso = () => {
    if (!newPasso.trim()) return
    const novoPasso: ProtocoloPasso = {
      id: `passo-${Date.now()}`,
      ordem: formData.passos.length + 1,
      descricao: newPasso.trim(),
    }
    setFormData((prev) => ({
      ...prev,
      passos: [...prev.passos, novoPasso],
    }))
    setNewPasso('')
  }

  // Remover passo
  const handleRemovePasso = (passoId: string) => {
    setFormData((prev) => ({
      ...prev,
      passos: prev.passos
        .filter((p) => p.id !== passoId)
        .map((p, idx) => ({ ...p, ordem: idx + 1 })),
    }))
  }

  // Mover passo para cima
  const handleMovePassoUp = (index: number) => {
    if (index === 0) return
    const newPassos = [...formData.passos]
    const temp = newPassos[index]
    newPassos[index] = newPassos[index - 1]
    newPassos[index - 1] = temp
    newPassos.forEach((p, idx) => (p.ordem = idx + 1))
    setFormData((prev) => ({ ...prev, passos: newPassos }))
  }

  // Mover passo para baixo
  const handleMovePassoDown = (index: number) => {
    if (index === formData.passos.length - 1) return
    const newPassos = [...formData.passos]
    const temp = newPassos[index]
    newPassos[index] = newPassos[index + 1]
    newPassos[index + 1] = temp
    newPassos.forEach((p, idx) => (p.ordem = idx + 1))
    setFormData((prev) => ({ ...prev, passos: newPassos }))
  }

  // Salvar protocolo
  const handleSaveProtocolo = () => {
    // Validações
    if (!formData.nome.trim()) {
      ArchbaseNotifications.showError('Erro', 'Nome é obrigatório')
      return
    }
    if (!formData.gatilho.trim()) {
      ArchbaseNotifications.showError('Erro', 'Gatilho é obrigatório')
      return
    }
    if (formData.passos.length === 0) {
      ArchbaseNotifications.showError('Erro', 'Adicione pelo menos um passo')
      return
    }
    if (!formData.criterioSucesso.trim()) {
      ArchbaseNotifications.showError('Erro', 'Critério de sucesso é obrigatório')
      return
    }

    if (editingProtocolo) {
      // Atualizar existente
      setProtocolos((prev) =>
        prev.map((p) =>
          p.id === editingProtocolo.id
            ? { ...p, ...formData }
            : p
        )
      )
      ArchbaseNotifications.showSuccess('Protocolo atualizado', `"${formData.nome}" foi salvo`)
    } else {
      // Criar novo
      const novoProtocolo: Protocolo = {
        id: `protocolo-${Date.now()}`,
        ...formData,
        ativacoes: 0,
      }
      setProtocolos((prev) => [...prev, novoProtocolo])
      ArchbaseNotifications.showSuccess('Protocolo criado', `"${formData.nome}" foi adicionado`)
    }

    closeModal()
    setFormData(emptyProtocolo)
    setEditingProtocolo(null)
  }

  // Toggle ativo/inativo
  const handleToggleAtivo = (protocolo: Protocolo) => {
    setProtocolos((prev) =>
      prev.map((p) =>
        p.id === protocolo.id ? { ...p, ativo: !p.ativo } : p
      )
    )
    ArchbaseNotifications.showSuccess(
      protocolo.ativo ? 'Protocolo desativado' : 'Protocolo ativado',
      `"${protocolo.nome}" foi ${protocolo.ativo ? 'desativado' : 'ativado'}`
    )
  }

  return (
    <Stack gap="lg" p="md" h="calc(100vh - 80px)" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <Group justify="space-between" style={{ flexShrink: 0 }}>
        <div>
          <Title order={2}>Protocolos Emocionais</Title>
          <Text c="dimmed" size="sm">
            Fluxos de atendimento emocional da Virgínia
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={handleNewProtocolo}>
          Novo Protocolo
        </Button>
      </Group>

      {/* Métricas */}
      <SimpleGrid cols={{ base: 2, md: 4 }} style={{ flexShrink: 0 }}>
        <Paper withBorder p="md" shadow="0">
          <Group>
            <ThemeIcon size={40} variant="light" color="violet">
              <IconHeart size={20} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700}>{protocolosAtivos}</Text>
              <Text size="xs" c="dimmed">Protocolos Ativos</Text>
            </Box>
          </Group>
        </Paper>
        <Paper withBorder p="md" shadow="0">
          <Group>
            <ThemeIcon size={40} variant="light" color="blue">
              <IconBrain size={20} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700}>{totalAtivacoes}</Text>
              <Text size="xs" c="dimmed">Total Ativações</Text>
            </Box>
          </Group>
        </Paper>
        <Paper withBorder p="md" shadow="0">
          <Group>
            <ThemeIcon size={40} variant="light" color="green">
              <IconCheck size={20} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700}>87%</Text>
              <Text size="xs" c="dimmed">Taxa de Sucesso</Text>
            </Box>
          </Group>
        </Paper>
        <Paper withBorder p="md" shadow="0">
          <Group>
            <ThemeIcon size={40} variant="light" color="orange">
              <IconMoodSmile size={20} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700}>+2.3</Text>
              <Text size="xs" c="dimmed">Humor Médio Pós</Text>
            </Box>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Lista de Protocolos com Scroll */}
      <ScrollArea style={{ flex: 1 }} offsetScrollbars>
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {protocolos.map((protocolo) => (
            <Card
              key={protocolo.id}
              withBorder
              radius="md"
              shadow="0"
              opacity={protocolo.ativo ? 1 : 0.6}
            >
            <Card.Section withBorder inheritPadding py="xs">
              <Group justify="space-between">
                <Group>
                  <ThemeIcon size={24} variant="light" color={protocolo.cor}>
                    <IconHeart size={14} />
                  </ThemeIcon>
                  <Text fw={600}>{protocolo.nome}</Text>
                  {!protocolo.ativo && (
                    <Badge color="gray" variant="light" size="xs">Inativo</Badge>
                  )}
                </Group>
                <Group gap="xs">
                  <Badge color={protocolo.cor} variant="light">
                    {protocolo.ativacoes} ativações
                  </Badge>
                  <Tooltip label="Editar">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={() => handleEditProtocolo(protocolo)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Excluir">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => handleConfirmDelete(protocolo)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            </Card.Section>

            <Stack gap="md" mt="md">
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Gatilho</Text>
                <Text size="sm">{protocolo.gatilho}</Text>
              </Box>

              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb="xs">Passos</Text>
                <Timeline active={-1} bulletSize={16} lineWidth={2}>
                  {protocolo.passos.map((passo) => (
                    <Timeline.Item key={passo.id} bullet={<IconCheck size={10} />}>
                      <Text size="sm">{passo.descricao}</Text>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Box>

              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Critério de Sucesso</Text>
                <Text size="sm" c="green">{protocolo.criterioSucesso}</Text>
              </Box>

              <Divider />

              <Group justify="space-between">
                <Switch
                  label="Ativo"
                  checked={protocolo.ativo}
                  onChange={() => handleToggleAtivo(protocolo)}
                  size="sm"
                />
              </Group>
            </Stack>
          </Card>
          ))}
        </SimpleGrid>
      </ScrollArea>

      {/* Modal de Edição/Criação */}
      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={editingProtocolo ? 'Editar Protocolo' : 'Novo Protocolo'}
        size="xl"
        styles={{
          body: { padding: 0 },
          content: { display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 100px)' },
        }}
      >
        {/* Corpo com Scroll */}
        <ScrollArea h="calc(100vh - 250px)" p="md" offsetScrollbars>
          <Stack gap="md">
            {/* Nome */}
            <TextInput
              label="Nome do Protocolo"
              placeholder="Ex: Acolhimento Inicial"
              value={formData.nome}
              onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.currentTarget.value }))}
              required
            />

            {/* Cor */}
            <Select
              label="Cor do Protocolo"
              placeholder="Selecione uma cor"
              value={formData.cor}
              onChange={(value) => setFormData((prev) => ({ ...prev, cor: value || 'blue' }))}
              data={corOptions.map((c) => ({
                value: c.value,
                label: c.label,
              }))}
              leftSection={
                <ColorSwatch
                  color={corOptions.find((c) => c.value === formData.cor)?.color || '#2563eb'}
                  size={16}
                />
              }
            />

            {/* Gatilho */}
            <Textarea
              label="Gatilho"
              placeholder="Ex: Humor < 4 na entrada"
              description="Condição que ativa este protocolo"
              value={formData.gatilho}
              onChange={(e) => setFormData((prev) => ({ ...prev, gatilho: e.currentTarget.value }))}
              required
              minRows={2}
            />

            {/* Passos */}
            <Box>
              <Text size="sm" fw={500} mb="xs">
                Passos do Protocolo <Text span c="red">*</Text>
              </Text>
              <Text size="xs" c="dimmed" mb="sm">
                Sequência de ações que a IA deve seguir
              </Text>

              {/* Lista de passos existentes */}
              {formData.passos.length > 0 && (
                <Stack gap="xs" mb="sm">
                  {formData.passos.map((passo, index) => (
                    <Paper key={passo.id} withBorder p="xs" radius="sm" shadow="0">
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="xs" wrap="nowrap" style={{ flex: 1 }}>
                          <ThemeIcon size="sm" variant="light" color="gray">
                            <Text size="xs" fw={600}>{passo.ordem}</Text>
                          </ThemeIcon>
                          <Text size="sm" style={{ flex: 1 }}>{passo.descricao}</Text>
                        </Group>
                        <Group gap={4}>
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="gray"
                            onClick={() => handleMovePassoUp(index)}
                            disabled={index === 0}
                          >
                            <IconArrowUp size={14} />
                          </ActionIcon>
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="gray"
                            onClick={() => handleMovePassoDown(index)}
                            disabled={index === formData.passos.length - 1}
                          >
                            <IconArrowDown size={14} />
                          </ActionIcon>
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="red"
                            onClick={() => handleRemovePasso(passo.id)}
                          >
                            <IconX size={14} />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              )}

              {/* Adicionar novo passo */}
              <Group gap="xs">
                <TextInput
                  placeholder="Digite um novo passo..."
                  value={newPasso}
                  onChange={(e) => setNewPasso(e.currentTarget.value)}
                  style={{ flex: 1 }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddPasso()
                    }
                  }}
                />
                <Button
                  variant="light"
                  leftSection={<IconPlus size={14} />}
                  onClick={handleAddPasso}
                  disabled={!newPasso.trim()}
                >
                  Adicionar
                </Button>
              </Group>
            </Box>

            {/* Critério de Sucesso */}
            <Textarea
              label="Critério de Sucesso"
              placeholder="Ex: Aluna reporta sentir-se mais calma"
              description="Como saber se o protocolo foi bem-sucedido"
              value={formData.criterioSucesso}
              onChange={(e) => setFormData((prev) => ({ ...prev, criterioSucesso: e.currentTarget.value }))}
              required
              minRows={2}
            />

            {/* Ativo */}
            <Switch
              label="Protocolo ativo"
              description="Protocolos inativos não serão utilizados pela IA"
              checked={formData.ativo}
              onChange={(e) => setFormData((prev) => ({ ...prev, ativo: e.currentTarget.checked }))}
            />
          </Stack>
        </ScrollArea>

        {/* Footer Fixo com Botões */}
        <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-3)', flexShrink: 0 }}>
          <Group justify="flex-end">
            <Button variant="default" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProtocolo}>
              {editingProtocolo ? 'Salvar Alterações' : 'Criar Protocolo'}
            </Button>
          </Group>
        </Box>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Confirmar Exclusão"
        size="sm"
      >
        <Stack gap="md">
          <Text>
            Tem certeza que deseja excluir o protocolo{' '}
            <Text span fw={600}>"{protocoloToDelete?.nome}"</Text>?
          </Text>
          <Text size="sm" c="dimmed">
            Esta ação não pode ser desfeita. O protocolo tem{' '}
            {protocoloToDelete?.ativacoes || 0} ativações registradas.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={closeDeleteModal}>
              Cancelar
            </Button>
            <Button color="red" onClick={handleDeleteProtocolo}>
              Excluir
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
