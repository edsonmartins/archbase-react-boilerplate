/**
 * IAGuardrailsView - Regras de Segurança da IA
 *
 * Gerenciamento de regras que a IA deve seguir para garantir
 * segurança e bem-estar das alunas.
 */
import { useState } from 'react'
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
  ScrollArea,
  Button,
  Modal,
  TextInput,
  Textarea,
  Select,
  ActionIcon,
  Tooltip,
  Divider,
  Switch,
  Tabs,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconShieldCheck,
  IconX,
  IconArrowUp,
  IconInfoCircle,
  IconPlus,
  IconEdit,
  IconTrash,
  IconAlertTriangle,
} from '@tabler/icons-react'
import { ArchbaseNotifications } from '@archbase/components'

// Interfaces
interface RegraNuncaFaz {
  id: string
  titulo: string
  descricao: string
  disparos: number
  ativo: boolean
}

interface RegraEscala {
  id: string
  titulo: string
  descricao: string
  contatoEscala: string
  disparos: number
  ativo: boolean
}

type TipoRegra = 'NUNCA' | 'ESCALA'

// Dados mock
const mockRegraNuncaFaz: RegraNuncaFaz[] = [
  {
    id: '1',
    titulo: 'Diagnóstico Médico',
    descricao: 'A IA NUNCA faz diagnósticos médicos ou sugere tratamentos de saúde',
    disparos: 12,
    ativo: true,
  },
  {
    id: '2',
    titulo: 'Prescrever Medicamentos',
    descricao: 'A IA NUNCA prescreve ou sugere medicamentos de qualquer tipo',
    disparos: 5,
    ativo: true,
  },
  {
    id: '3',
    titulo: 'Ideação Suicida',
    descricao: 'A IA NUNCA minimiza ou ignora sinais de ideação suicida',
    disparos: 2,
    ativo: true,
  },
  {
    id: '4',
    titulo: 'Exercícios Contraindicados',
    descricao: 'A IA NUNCA recomenda exercícios contraindicados para a condição da aluna',
    disparos: 8,
    ativo: true,
  },
  {
    id: '5',
    titulo: 'Informações Pessoais',
    descricao: 'A IA NUNCA solicita ou armazena dados sensíveis fora do escopo',
    disparos: 1,
    ativo: true,
  },
  {
    id: '6',
    titulo: 'Comentários sobre Peso/Corpo',
    descricao: 'A IA NUNCA faz comentários sobre perda de peso ou aparência física',
    disparos: 15,
    ativo: true,
  },
  {
    id: '7',
    titulo: 'Dietas Restritivas',
    descricao: 'A IA NUNCA sugere dietas restritivas ou comportamentos alimentares',
    disparos: 3,
    ativo: true,
  },
]

const mockRegraEscala: RegraEscala[] = [
  {
    id: '1',
    titulo: 'Sinais de Crise Emocional',
    descricao: 'Quando detecta sinais de depressão grave ou ansiedade severa',
    contatoEscala: 'Virgínia + Alerta para profissional',
    disparos: 15,
    ativo: true,
  },
  {
    id: '2',
    titulo: 'Dor Física Aguda',
    descricao: 'Quando a aluna reporta dor intensa durante ou após exercício',
    contatoEscala: 'Patrícia + Sugestão de pausa',
    disparos: 7,
    ativo: true,
  },
  {
    id: '3',
    titulo: 'Inatividade Prolongada',
    descricao: 'Quando a aluna fica mais de 7 dias sem interação',
    contatoEscala: 'Alerta automático + Mensagem da Vix',
    disparos: 23,
    ativo: true,
  },
  {
    id: '4',
    titulo: 'Feedback Negativo Recorrente',
    descricao: 'Quando a aluna dá notas baixas em 3+ treinos consecutivos',
    contatoEscala: 'Patrícia + Revisão do plano',
    disparos: 4,
    ativo: true,
  },
  {
    id: '5',
    titulo: 'Menção a Distúrbios Alimentares',
    descricao: 'Quando a aluna menciona comportamentos relacionados a transtornos alimentares',
    contatoEscala: 'Virgínia + Encaminhamento especializado',
    disparos: 6,
    ativo: true,
  },
  {
    id: '6',
    titulo: 'Lesão ou Acidente',
    descricao: 'Quando a aluna reporta ter se machucado durante atividade',
    contatoEscala: 'Patrícia + Pausa obrigatória',
    disparos: 9,
    ativo: true,
  },
]

const contatoOptions = [
  { value: 'Patrícia', label: 'Patrícia (Educadora Física)' },
  { value: 'Virgínia', label: 'Virgínia (Psicóloga)' },
  { value: 'Patrícia + Virgínia', label: 'Ambas' },
  { value: 'Alerta automático', label: 'Alerta Automático' },
  { value: 'Patrícia + Sugestão de pausa', label: 'Patrícia + Pausa' },
  { value: 'Virgínia + Alerta para profissional', label: 'Virgínia + Profissional' },
  { value: 'Virgínia + Encaminhamento especializado', label: 'Virgínia + Encaminhamento' },
  { value: 'Patrícia + Revisão do plano', label: 'Patrícia + Revisão' },
  { value: 'Patrícia + Pausa obrigatória', label: 'Patrícia + Pausa Obrigatória' },
  { value: 'Alerta automático + Mensagem da Vix', label: 'Automático + Vix' },
]

// Form states
const emptyRegraNunca: Omit<RegraNuncaFaz, 'id' | 'disparos'> = {
  titulo: '',
  descricao: '',
  ativo: true,
}

const emptyRegraEscala: Omit<RegraEscala, 'id' | 'disparos'> = {
  titulo: '',
  descricao: '',
  contatoEscala: 'Virgínia',
  ativo: true,
}

export function IAGuardrailsView() {
  // State
  const [regrasNunca, setRegrasNunca] = useState<RegraNuncaFaz[]>(mockRegraNuncaFaz)
  const [regrasEscala, setRegrasEscala] = useState<RegraEscala[]>(mockRegraEscala)

  // Modal states
  const [modalNuncaOpened, { open: openModalNunca, close: closeModalNunca }] = useDisclosure(false)
  const [modalEscalaOpened, { open: openModalEscala, close: closeModalEscala }] = useDisclosure(false)
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)

  // Edit states
  const [editingNunca, setEditingNunca] = useState<RegraNuncaFaz | null>(null)
  const [editingEscala, setEditingEscala] = useState<RegraEscala | null>(null)
  const [formNunca, setFormNunca] = useState<Omit<RegraNuncaFaz, 'id' | 'disparos'>>(emptyRegraNunca)
  const [formEscala, setFormEscala] = useState<Omit<RegraEscala, 'id' | 'disparos'>>(emptyRegraEscala)

  // Delete state
  const [regraToDelete, setRegraToDelete] = useState<{ tipo: TipoRegra; regra: RegraNuncaFaz | RegraEscala } | null>(null)

  // Métricas
  const totalNuncaDisparos = regrasNunca.reduce((acc, r) => acc + r.disparos, 0)
  const totalEscalaDisparos = regrasEscala.reduce((acc, r) => acc + r.disparos, 0)
  const regrasNuncaAtivas = regrasNunca.filter((r) => r.ativo).length
  const regrasEscalaAtivas = regrasEscala.filter((r) => r.ativo).length

  // === Handlers NUNCA FAZ ===
  const handleNewNunca = () => {
    setEditingNunca(null)
    setFormNunca(emptyRegraNunca)
    openModalNunca()
  }

  const handleEditNunca = (regra: RegraNuncaFaz) => {
    setEditingNunca(regra)
    setFormNunca({
      titulo: regra.titulo,
      descricao: regra.descricao,
      ativo: regra.ativo,
    })
    openModalNunca()
  }

  const handleSaveNunca = () => {
    if (!formNunca.titulo.trim()) {
      ArchbaseNotifications.showError('Erro', 'Título é obrigatório')
      return
    }
    if (!formNunca.descricao.trim()) {
      ArchbaseNotifications.showError('Erro', 'Descrição é obrigatória')
      return
    }

    if (editingNunca) {
      setRegrasNunca((prev) =>
        prev.map((r) => (r.id === editingNunca.id ? { ...r, ...formNunca } : r))
      )
      ArchbaseNotifications.showSuccess('Regra atualizada', `"${formNunca.titulo}" foi salva`)
    } else {
      const nova: RegraNuncaFaz = {
        id: `nunca-${Date.now()}`,
        ...formNunca,
        disparos: 0,
      }
      setRegrasNunca((prev) => [...prev, nova])
      ArchbaseNotifications.showSuccess('Regra criada', `"${formNunca.titulo}" foi adicionada`)
    }

    closeModalNunca()
    setFormNunca(emptyRegraNunca)
    setEditingNunca(null)
  }

  // === Handlers ESCALA ===
  const handleNewEscala = () => {
    setEditingEscala(null)
    setFormEscala(emptyRegraEscala)
    openModalEscala()
  }

  const handleEditEscala = (regra: RegraEscala) => {
    setEditingEscala(regra)
    setFormEscala({
      titulo: regra.titulo,
      descricao: regra.descricao,
      contatoEscala: regra.contatoEscala,
      ativo: regra.ativo,
    })
    openModalEscala()
  }

  const handleSaveEscala = () => {
    if (!formEscala.titulo.trim()) {
      ArchbaseNotifications.showError('Erro', 'Título é obrigatório')
      return
    }
    if (!formEscala.descricao.trim()) {
      ArchbaseNotifications.showError('Erro', 'Descrição é obrigatória')
      return
    }

    if (editingEscala) {
      setRegrasEscala((prev) =>
        prev.map((r) => (r.id === editingEscala.id ? { ...r, ...formEscala } : r))
      )
      ArchbaseNotifications.showSuccess('Regra atualizada', `"${formEscala.titulo}" foi salva`)
    } else {
      const nova: RegraEscala = {
        id: `escala-${Date.now()}`,
        ...formEscala,
        disparos: 0,
      }
      setRegrasEscala((prev) => [...prev, nova])
      ArchbaseNotifications.showSuccess('Regra criada', `"${formEscala.titulo}" foi adicionada`)
    }

    closeModalEscala()
    setFormEscala(emptyRegraEscala)
    setEditingEscala(null)
  }

  // === Handler Delete ===
  const handleConfirmDelete = (tipo: TipoRegra, regra: RegraNuncaFaz | RegraEscala) => {
    setRegraToDelete({ tipo, regra })
    openDeleteModal()
  }

  const handleDelete = () => {
    if (!regraToDelete) return

    if (regraToDelete.tipo === 'NUNCA') {
      setRegrasNunca((prev) => prev.filter((r) => r.id !== regraToDelete.regra.id))
    } else {
      setRegrasEscala((prev) => prev.filter((r) => r.id !== regraToDelete.regra.id))
    }

    ArchbaseNotifications.showSuccess('Regra excluída', `"${regraToDelete.regra.titulo}" foi removida`)
    closeDeleteModal()
    setRegraToDelete(null)
  }

  // === Toggle Ativo ===
  const handleToggleNunca = (regra: RegraNuncaFaz) => {
    setRegrasNunca((prev) =>
      prev.map((r) => (r.id === regra.id ? { ...r, ativo: !r.ativo } : r))
    )
  }

  const handleToggleEscala = (regra: RegraEscala) => {
    setRegrasEscala((prev) =>
      prev.map((r) => (r.id === regra.id ? { ...r, ativo: !r.ativo } : r))
    )
  }

  return (
    <Stack gap="lg" p="md" h="calc(100vh - 80px)" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <Group justify="space-between" style={{ flexShrink: 0 }}>
        <div>
          <Title order={2}>Guardrails - Regras de Segurança</Title>
          <Text c="dimmed" size="sm">
            Regras que garantem a segurança e bem-estar das alunas
          </Text>
        </div>
      </Group>

      {/* Métricas */}
      <SimpleGrid cols={{ base: 2, md: 4 }} style={{ flexShrink: 0 }}>
        <Paper withBorder p="md" shadow="0">
          <Group>
            <ThemeIcon size={40} variant="light" color="red">
              <IconX size={20} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700}>{regrasNuncaAtivas}</Text>
              <Text size="xs" c="dimmed">Regras NUNCA FAZ</Text>
            </Box>
          </Group>
        </Paper>
        <Paper withBorder p="md" shadow="0">
          <Group>
            <ThemeIcon size={40} variant="light" color="orange">
              <IconArrowUp size={20} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700}>{regrasEscalaAtivas}</Text>
              <Text size="xs" c="dimmed">Regras ESCALA</Text>
            </Box>
          </Group>
        </Paper>
        <Paper withBorder p="md" shadow="0">
          <Group>
            <ThemeIcon size={40} variant="light" color="blue">
              <IconShieldCheck size={20} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700}>{totalNuncaDisparos + totalEscalaDisparos}</Text>
              <Text size="xs" c="dimmed">Total Disparos</Text>
            </Box>
          </Group>
        </Paper>
        <Paper withBorder p="md" shadow="0">
          <Group>
            <ThemeIcon size={40} variant="light" color="green">
              <IconShieldCheck size={20} />
            </ThemeIcon>
            <Box>
              <Text size="xl" fw={700}>100%</Text>
              <Text size="xs" c="dimmed">Taxa Conformidade</Text>
            </Box>
          </Group>
        </Paper>
      </SimpleGrid>

      {/* Conteúdo com Scroll */}
      <ScrollArea style={{ flex: 1 }} offsetScrollbars>
        <Stack gap="lg">
          {/* Seção NUNCA FAZ */}
          <Paper withBorder p="lg" bg="red.0" shadow="0">
            <Group justify="space-between" mb="md">
              <Group>
                <ThemeIcon size={32} color="red" variant="filled">
                  <IconX size={18} />
                </ThemeIcon>
                <Title order={4} c="red">A IA NUNCA faz</Title>
              </Group>
              <Button
                size="xs"
                color="red"
                variant="light"
                leftSection={<IconPlus size={14} />}
                onClick={handleNewNunca}
              >
                Nova Regra
              </Button>
            </Group>
            <SimpleGrid cols={{ base: 1, md: 2 }}>
              {regrasNunca.map((regra) => (
                <Paper
                  key={regra.id}
                  withBorder
                  p="md"
                  bg="white"
                  shadow="0"
                  opacity={regra.ativo ? 1 : 0.6}
                >
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <Text fw={500}>{regra.titulo}</Text>
                      {!regra.ativo && (
                        <Badge color="gray" size="xs">Inativo</Badge>
                      )}
                    </Group>
                    <Group gap="xs">
                      <Badge color="red" variant="light">{regra.disparos} disparos</Badge>
                      <Tooltip label="Editar">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="blue"
                          onClick={() => handleEditNunca(regra)}
                        >
                          <IconEdit size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Excluir">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="red"
                          onClick={() => handleConfirmDelete('NUNCA', regra)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                  <Text size="sm" c="dimmed" mb="sm">{regra.descricao}</Text>
                  <Switch
                    size="xs"
                    label="Ativo"
                    checked={regra.ativo}
                    onChange={() => handleToggleNunca(regra)}
                  />
                </Paper>
              ))}
            </SimpleGrid>
          </Paper>

          {/* Seção SEMPRE ESCALA */}
          <Paper withBorder p="lg" bg="orange.0" shadow="0">
            <Group justify="space-between" mb="md">
              <Group>
                <ThemeIcon size={32} color="orange" variant="filled">
                  <IconArrowUp size={18} />
                </ThemeIcon>
                <Title order={4} c="orange">SEMPRE escala para humano</Title>
              </Group>
              <Button
                size="xs"
                color="orange"
                variant="light"
                leftSection={<IconPlus size={14} />}
                onClick={handleNewEscala}
              >
                Nova Regra
              </Button>
            </Group>
            <SimpleGrid cols={{ base: 1, md: 2 }}>
              {regrasEscala.map((regra) => (
                <Paper
                  key={regra.id}
                  withBorder
                  p="md"
                  bg="white"
                  shadow="0"
                  opacity={regra.ativo ? 1 : 0.6}
                >
                  <Group justify="space-between" mb="xs">
                    <Group gap="xs">
                      <Text fw={500}>{regra.titulo}</Text>
                      {!regra.ativo && (
                        <Badge color="gray" size="xs">Inativo</Badge>
                      )}
                    </Group>
                    <Group gap="xs">
                      <Badge color="orange" variant="light">{regra.disparos} disparos</Badge>
                      <Tooltip label="Editar">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="blue"
                          onClick={() => handleEditEscala(regra)}
                        >
                          <IconEdit size={14} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Excluir">
                        <ActionIcon
                          size="sm"
                          variant="subtle"
                          color="red"
                          onClick={() => handleConfirmDelete('ESCALA', regra)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Group>
                  <Text size="sm" c="dimmed" mb="xs">{regra.descricao}</Text>
                  <Text size="xs" c="blue" mb="sm">Escala para: {regra.contatoEscala}</Text>
                  <Switch
                    size="xs"
                    label="Ativo"
                    checked={regra.ativo}
                    onChange={() => handleToggleEscala(regra)}
                  />
                </Paper>
              ))}
            </SimpleGrid>
          </Paper>

          {/* Princípio BlueVix */}
          <Paper withBorder p="lg" bg="violet.0" shadow="0">
            <Group mb="md">
              <ThemeIcon size={32} color="violet" variant="filled">
                <IconInfoCircle size={18} />
              </ThemeIcon>
              <Title order={4} c="violet">Princípio BlueVix</Title>
            </Group>
            <Alert color="violet" variant="light">
              <Text size="sm" fw={500} mb="sm">
                "A IA existe para AUXILIAR, nunca para SUBSTITUIR o cuidado humano.
                Em caso de dúvida, SEMPRE escalar para profissional."
              </Text>
              <Text size="xs" c="dimmed">
                - Filosofia BlueVix de IA Responsável
              </Text>
            </Alert>
          </Paper>
        </Stack>
      </ScrollArea>

      {/* Modal NUNCA FAZ */}
      <Modal
        opened={modalNuncaOpened}
        onClose={closeModalNunca}
        title={editingNunca ? 'Editar Regra "NUNCA FAZ"' : 'Nova Regra "NUNCA FAZ"'}
        size="lg"
      >
        <Stack gap="md">
          <Alert color="red" variant="light" icon={<IconAlertTriangle size={16} />}>
            Regras "NUNCA FAZ" definem comportamentos que a IA deve evitar em qualquer circunstância.
          </Alert>

          <TextInput
            label="Título da Regra"
            placeholder="Ex: Diagnóstico Médico"
            value={formNunca.titulo}
            onChange={(e) => setFormNunca((prev) => ({ ...prev, titulo: e.currentTarget.value }))}
            required
          />

          <Textarea
            label="Descrição"
            placeholder="Descreva detalhadamente o que a IA não deve fazer..."
            description="Seja específico para que a IA entenda claramente a restrição"
            value={formNunca.descricao}
            onChange={(e) => setFormNunca((prev) => ({ ...prev, descricao: e.currentTarget.value }))}
            minRows={3}
            required
          />

          <Switch
            label="Regra ativa"
            description="Regras inativas não serão aplicadas pela IA"
            checked={formNunca.ativo}
            onChange={(e) => setFormNunca((prev) => ({ ...prev, ativo: e.currentTarget.checked }))}
          />

          {editingNunca && (
            <Paper p="sm" bg="gray.0" radius="sm">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Total de disparos:</Text>
                <Text size="sm" fw={500}>{editingNunca.disparos}</Text>
              </Group>
            </Paper>
          )}

          <Divider />

          <Group justify="flex-end">
            <Button variant="default" onClick={closeModalNunca}>
              Cancelar
            </Button>
            <Button color="red" onClick={handleSaveNunca}>
              {editingNunca ? 'Salvar Alterações' : 'Criar Regra'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal ESCALA */}
      <Modal
        opened={modalEscalaOpened}
        onClose={closeModalEscala}
        title={editingEscala ? 'Editar Regra "SEMPRE ESCALA"' : 'Nova Regra "SEMPRE ESCALA"'}
        size="lg"
      >
        <Stack gap="md">
          <Alert color="orange" variant="light" icon={<IconArrowUp size={16} />}>
            Regras "SEMPRE ESCALA" definem situações que requerem intervenção humana imediata.
          </Alert>

          <TextInput
            label="Título da Regra"
            placeholder="Ex: Sinais de Crise Emocional"
            value={formEscala.titulo}
            onChange={(e) => setFormEscala((prev) => ({ ...prev, titulo: e.currentTarget.value }))}
            required
          />

          <Textarea
            label="Descrição"
            placeholder="Descreva a situação que deve acionar a escalação..."
            description="Seja específico sobre os gatilhos que ativam esta regra"
            value={formEscala.descricao}
            onChange={(e) => setFormEscala((prev) => ({ ...prev, descricao: e.currentTarget.value }))}
            minRows={3}
            required
          />

          <Select
            label="Escalar para"
            description="Quem deve ser notificado quando esta regra for acionada"
            placeholder="Selecione o contato"
            data={contatoOptions}
            value={formEscala.contatoEscala}
            onChange={(value) => setFormEscala((prev) => ({ ...prev, contatoEscala: value || 'Virgínia' }))}
            searchable
            required
          />

          <Switch
            label="Regra ativa"
            description="Regras inativas não serão aplicadas pela IA"
            checked={formEscala.ativo}
            onChange={(e) => setFormEscala((prev) => ({ ...prev, ativo: e.currentTarget.checked }))}
          />

          {editingEscala && (
            <Paper p="sm" bg="gray.0" radius="sm">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">Total de disparos:</Text>
                <Text size="sm" fw={500}>{editingEscala.disparos}</Text>
              </Group>
            </Paper>
          )}

          <Divider />

          <Group justify="flex-end">
            <Button variant="default" onClick={closeModalEscala}>
              Cancelar
            </Button>
            <Button color="orange" onClick={handleSaveEscala}>
              {editingEscala ? 'Salvar Alterações' : 'Criar Regra'}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal Confirmação de Exclusão */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Confirmar Exclusão"
        size="md"
      >
        <Stack gap="md">
          <Text>
            Tem certeza que deseja excluir a regra{' '}
            <Text span fw={600}>"{regraToDelete?.regra.titulo}"</Text>?
          </Text>

          {regraToDelete && regraToDelete.regra.disparos > 0 && (
            <Alert color="orange" variant="light" icon={<IconAlertTriangle size={16} />}>
              Esta regra já foi acionada {regraToDelete.regra.disparos} vezes.
              Excluí-la pode afetar a segurança do sistema.
            </Alert>
          )}

          <Group justify="flex-end">
            <Button variant="default" onClick={closeDeleteModal}>
              Cancelar
            </Button>
            <Button color="red" onClick={handleDelete}>
              Excluir
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
