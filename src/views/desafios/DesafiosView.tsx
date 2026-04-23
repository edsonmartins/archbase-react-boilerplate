/**
 * DesafiosView - Gestão de Desafios Mensais
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
  Paper,
  Table,
  Title,
  Loader,
  Center,
  Button,
  ScrollArea,
} from '@mantine/core'
import { IconEdit, IconTrash, IconPlus, IconTarget } from '@tabler/icons-react'
import { ArchbaseNotifications, ArchbaseDialog } from '@archbase/components'
import { useInjection } from 'inversify-react'
import { useNavigate } from 'react-router-dom'

import { DesafioMensalDto } from '../../domain/gamificacao/GamificacaoDto'
import { DesafioService } from '../../services/DesafioService'
import { API_TYPE } from '../../ioc/IOCTypes'
import { DESAFIO_NOVO_ROUTE, DESAFIO_EDITAR_ROUTE } from '../../navigation/navigationDataConstants'

// ============================================
// MOCK DATA - Desativar após validação
// ============================================
const USE_MOCK_DATA = true

const mockDesafios: DesafioMensalDto[] = [
  new DesafioMensalDto({
    id: 'desafio-001',
    titulo: '30 Dias de Treino',
    descricao: 'Complete 30 treinos em 30 dias',
    descricaoAluno: 'Treine todos os dias por 30 dias consecutivos!',
    tipo: 'STREAK',
    categoria: 'TREINOS_CONSECUTIVOS',
    tipoMedicao: 'APP',
    nivel: 'TODOS',
    meta: 30,
    unidadeMeta: 'treinos',
    xpRecompensa: 500,
    badgeEmoji: '🏆',
    badgeNome: 'Guerreira 30 Dias',
    mensagemVixSortear: 'Você aceita o desafio de treinar 30 dias seguidos? Eu acredito em você!',
    mensagemVixConcluir: 'Incrível! Você completou 30 dias de treino! Você é uma guerreira!',
    dataInicio: '2024-04-01',
    dataFim: '2024-04-30',
    ativo: true,
  }),
  new DesafioMensalDto({
    id: 'desafio-002',
    titulo: 'Hidratação Consciente',
    descricao: 'Beba 8 copos de água por dia',
    descricaoAluno: 'Mantenha-se hidratada todos os dias!',
    tipo: 'DIARIO',
    categoria: 'HIDRATACAO',
    tipoMedicao: 'EXTERNO',
    nivel: 'TODOS',
    meta: 8,
    unidadeMeta: 'copos',
    xpRecompensa: 200,
    badgeEmoji: '💧',
    badgeNome: 'Hidratada',
    mensagemVixSortear: 'Vamos cuidar da hidratação? 8 copos por dia fazem milagres!',
    mensagemVixConcluir: 'Parabéns! Você manteve a hidratação em dia!',
    dataInicio: '2024-04-01',
    dataFim: '2024-04-30',
    ativo: true,
  }),
  new DesafioMensalDto({
    id: 'desafio-003',
    titulo: 'Minutos de Exercício',
    descricao: 'Acumule 600 minutos de exercício',
    descricaoAluno: 'Complete 600 minutos de treino este mês!',
    tipo: 'ACUMULATIVO',
    categoria: 'MINUTOS_EXERCICIO',
    tipoMedicao: 'APP',
    nivel: 'INTERMEDIARIO',
    meta: 600,
    unidadeMeta: 'minutos',
    xpRecompensa: 350,
    badgeEmoji: '⏱️',
    badgeNome: 'Maratonista',
    mensagemVixSortear: '600 minutos de treino este mês. Vamos juntas?',
    mensagemVixConcluir: 'Você acumulou 600 minutos! Que dedicação!',
    dataInicio: '2024-04-01',
    dataFim: '2024-04-30',
    ativo: true,
  }),
  new DesafioMensalDto({
    id: 'desafio-004',
    titulo: 'Diário de Humor',
    descricao: 'Registre seu humor por 20 dias',
    descricaoAluno: 'Registre como você está se sentindo!',
    tipo: 'ACUMULATIVO',
    categoria: 'DIARIO_HUMOR',
    tipoMedicao: 'APP',
    nivel: 'TODOS',
    meta: 20,
    unidadeMeta: 'dias',
    xpRecompensa: 150,
    badgeEmoji: '📝',
    badgeNome: 'Autoconhecimento',
    dataInicio: '2024-04-01',
    dataFim: '2024-04-30',
    ativo: false,
  }),
  new DesafioMensalDto({
    id: 'desafio-005',
    titulo: 'Desafio da Vix',
    descricao: 'Complete os desafios especiais da Vix',
    descricaoAluno: 'Desafios surpresa da Vix!',
    tipo: 'ESPECIAL',
    categoria: 'DESAFIO_VIX',
    tipoMedicao: 'MISTO',
    nivel: 'TODOS',
    meta: 5,
    unidadeMeta: 'desafios',
    xpRecompensa: 400,
    badgeEmoji: '🌟',
    badgeNome: 'Estrela Vix',
    dataInicio: '2024-05-01',
    dataFim: '2024-05-31',
    ativo: false,
  }),
]

// Opções de categoria
const categoriaOptions = [
  { value: 'TREINOS_CONSECUTIVOS', label: 'Treinos Consecutivos' },
  { value: 'MINUTOS_EXERCICIO', label: 'Minutos de Exercício' },
  { value: 'NIVEL_EMOCIONAL', label: 'Nível Emocional' },
  { value: 'HIDRATACAO', label: 'Hidratação' },
  { value: 'SONO_QUALIDADE', label: 'Qualidade do Sono' },
  { value: 'PASSOS_DIARIOS', label: 'Passos Diários' },
  { value: 'MEDITACAO', label: 'Meditação' },
  { value: 'DIARIO_HUMOR', label: 'Diário de Humor' },
  { value: 'SOCIAL_COMPARTILHAR', label: 'Compartilhar nas Redes' },
  { value: 'DESAFIO_VIX', label: 'Desafio da Vix' },
  { value: 'PERSONALIZADO', label: 'Personalizado' },
]

export function DesafiosView() {
  const navigate = useNavigate()
  const desafioService = useInjection<DesafioService>(API_TYPE.DesafioService)

  const [loading, setLoading] = useState(true)
  const [desafios, setDesafios] = useState<DesafioMensalDto[]>([])

  useEffect(() => {
    loadDesafios()
  }, [])

  const loadDesafios = async () => {
    try {
      setLoading(true)
      if (USE_MOCK_DATA) {
        // Simula delay de rede
        await new Promise(resolve => setTimeout(resolve, 500))
        setDesafios(mockDesafios)
      } else {
        const response = await desafioService.findAll(0, 50)
        setDesafios(response.content || [])
      }
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível carregar os desafios')
    } finally {
      setLoading(false)
    }
  }

  const handleNew = () => {
    navigate(`${DESAFIO_NOVO_ROUTE}?action=add`)
  }

  const handleEdit = (desafio: DesafioMensalDto) => {
    navigate(`${DESAFIO_EDITAR_ROUTE.replace(':id', desafio.id)}?action=edit`)
  }

  const handleToggle = async (desafio: DesafioMensalDto) => {
    try {
      await desafioService.toggle(desafio.id)
      ArchbaseNotifications.showSuccess('Sucesso', 'Status alterado')
      loadDesafios()
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível alterar o status')
    }
  }

  const handleDelete = (desafio: DesafioMensalDto) => {
    ArchbaseDialog.showConfirmDialogYesNo(
      'Confirme',
      `Deseja remover o desafio "${desafio.titulo}"?`,
      async () => {
        try {
          await desafioService.delete(desafio.id)
          ArchbaseNotifications.showSuccess('Sucesso', 'Desafio removido')
          loadDesafios()
        } catch (err) {
          ArchbaseNotifications.showError('Erro', 'Não foi possível remover o desafio')
        }
      },
      () => {}
    )
  }

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    )
  }

  return (
    <Stack gap="lg" p="md">
      <Group justify="space-between">
        <Title order={2}>Desafios Mensais</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={handleNew}>
          Novo Desafio
        </Button>
      </Group>

      <Paper withBorder>
        <ScrollArea h="calc(100vh - 220px)" offsetScrollbars>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Desafio</Table.Th>
                <Table.Th>Categoria</Table.Th>
                <Table.Th>Meta</Table.Th>
                <Table.Th>XP</Table.Th>
                <Table.Th>Período</Table.Th>
                <Table.Th>Ativo</Table.Th>
                <Table.Th>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {desafios.map((desafio) => (
                <Table.Tr key={desafio.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <Text size="lg">{desafio.badgeEmoji || <IconTarget size={20} color="#14A085" />}</Text>
                      <Stack gap={0}>
                        <Text size="sm" fw={500}>
                          {desafio.titulo}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {desafio.descricaoAluno || desafio.descricao}
                        </Text>
                      </Stack>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="outline" color="blue">
                      {categoriaOptions.find((c) => c.value === desafio.categoria)?.label ||
                        desafio.tipo}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {desafio.meta} {desafio.unidadeMeta || ''}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="yellow" variant="light">
                      +{desafio.xpRecompensa} XP
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={0}>
                      <Text size="sm">
                        {desafio.dataInicio
                          ? new Date(desafio.dataInicio).toLocaleDateString('pt-BR')
                          : '-'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        até{' '}
                        {desafio.dataFim
                          ? new Date(desafio.dataFim).toLocaleDateString('pt-BR')
                          : '-'}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Switch checked={desafio.ativo} size="sm" onChange={() => handleToggle(desafio)} />
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Editar">
                        <ActionIcon variant="subtle" color="yellow" onClick={() => handleEdit(desafio)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Remover">
                        <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(desafio)}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>
    </Stack>
  )
}
