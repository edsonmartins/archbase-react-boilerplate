/**
 * TreinosView - Gestao de Treinos
 */
import { useState, useEffect } from 'react'
import {
  Badge,
  Group,
  Text,
  Select,
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
import { IconEdit, IconTrash, IconPlus, IconEye } from '@tabler/icons-react'
import { ArchbaseNotifications, ArchbaseDialog } from '@archbase/components'
import { useInjection } from 'inversify-react'
import { useNavigate } from 'react-router-dom'

import { TreinoDto } from '../../domain/treino/TreinoDto'
import { TreinoService } from '../../services/TreinoService'
import { API_TYPE } from '../../ioc/IOCTypes'
import { TREINO_NOVO_ROUTE, TREINO_EDITAR_ROUTE, TREINO_FICHA_ROUTE } from '../../navigation/navigationDataConstants'

// ============================================
// MOCK DATA - Desativar após validação
// ============================================
const USE_MOCK_DATA = true

const mockTreinos: TreinoDto[] = [
  new TreinoDto({
    id: 'treino-001',
    nome: 'Treino A - Força Inferior',
    descricao: 'Foco em fortalecimento de membros inferiores e core',
    nivel: 'INICIANTE',
    categoria: 'Força',
    semana: 1,
    tipoTreino: 'A',
    duracaoMinutos: 45,
    ativo: true,
    exerciciosCount: 8,
  }),
  new TreinoDto({
    id: 'treino-002',
    nome: 'Treino B - Força Superior',
    descricao: 'Foco em fortalecimento de membros superiores',
    nivel: 'INICIANTE',
    categoria: 'Força',
    semana: 1,
    tipoTreino: 'B',
    duracaoMinutos: 40,
    ativo: true,
    exerciciosCount: 7,
  }),
  new TreinoDto({
    id: 'treino-003',
    nome: 'Treino C - Mobilidade',
    descricao: 'Sessão de mobilidade articular e alongamento',
    nivel: 'INICIANTE',
    categoria: 'Mobilidade',
    semana: 1,
    tipoTreino: 'C',
    duracaoMinutos: 30,
    ativo: true,
    exerciciosCount: 10,
  }),
  new TreinoDto({
    id: 'treino-004',
    nome: 'Treino A - Força Intermediário',
    descricao: 'Progressão de força com cargas moderadas',
    nivel: 'INTERMEDIARIO',
    categoria: 'Força',
    semana: 4,
    tipoTreino: 'A',
    duracaoMinutos: 50,
    ativo: true,
    exerciciosCount: 10,
  }),
  new TreinoDto({
    id: 'treino-005',
    nome: 'Treino Cardio Consciente',
    descricao: 'Treino cardiovascular com foco em respiração',
    nivel: 'INTERMEDIARIO',
    categoria: 'Cardio',
    semana: 4,
    duracaoMinutos: 35,
    ativo: true,
    exerciciosCount: 6,
  }),
  new TreinoDto({
    id: 'treino-006',
    nome: 'Treino Avançado - Full Body',
    descricao: 'Treino completo para alunas avançadas',
    nivel: 'AVANCADO',
    categoria: 'Full Body',
    semana: 8,
    tipoTreino: 'A',
    duracaoMinutos: 60,
    ativo: true,
    exerciciosCount: 12,
  }),
  new TreinoDto({
    id: 'treino-007',
    nome: 'Descanso Ativo',
    descricao: 'Sessão leve de recuperação',
    nivel: 'INICIANTE',
    categoria: 'Recuperação',
    tipoTreino: 'DESCANSO',
    duracaoMinutos: 20,
    ativo: false,
    exerciciosCount: 4,
  }),
]

export function TreinosView() {
  const navigate = useNavigate()
  const treinoService = useInjection<TreinoService>(API_TYPE.TreinoService)

  const [loading, setLoading] = useState(true)
  const [treinos, setTreinos] = useState<TreinoDto[]>([])
  const [nivelFilter, setNivelFilter] = useState<string | null>(null)

  useEffect(() => {
    loadTreinos()
  }, [])

  const loadTreinos = async () => {
    try {
      setLoading(true)
      if (USE_MOCK_DATA) {
        // Simula delay de rede
        await new Promise(resolve => setTimeout(resolve, 500))
        setTreinos(mockTreinos)
      } else {
        const response = await treinoService.findAll(0, 50)
        setTreinos(response.content || [])
      }
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível carregar os treinos')
    } finally {
      setLoading(false)
    }
  }

  const handleNew = () => {
    navigate(`${TREINO_NOVO_ROUTE}?action=add`)
  }

  const handleView = (treino: TreinoDto) => {
    navigate(TREINO_FICHA_ROUTE.replace(':id', treino.id))
  }

  const handleEdit = (treino: TreinoDto) => {
    navigate(`${TREINO_EDITAR_ROUTE.replace(':id', treino.id)}?action=edit`)
  }

  const handleDelete = (treino: TreinoDto) => {
    ArchbaseDialog.showConfirmDialogYesNo(
      'Confirme',
      `Deseja remover o treino "${treino.nome}"?`,
      async () => {
        try {
          await treinoService.delete(treino.id)
          ArchbaseNotifications.showSuccess('Sucesso', 'Treino removido')
          loadTreinos()
        } catch (err) {
          ArchbaseNotifications.showError('Erro', 'Não foi possível remover o treino')
        }
      },
      () => {}
    )
  }

  const nivelOptions = [
    { value: 'INICIANTE', label: 'Iniciante' },
    { value: 'INTERMEDIARIO', label: 'Intermediario' },
    { value: 'AVANCADO', label: 'Avancado' },
  ]

  const filteredTreinos = treinos.filter((treino) => {
    return !nivelFilter || treino.nivel === nivelFilter
  })

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
        <Title order={2}>Treinos</Title>
        <Group>
          <Select
            placeholder="Filtrar por nivel"
            data={nivelOptions}
            value={nivelFilter}
            onChange={setNivelFilter}
            clearable
            style={{ width: 180 }}
          />
          <Button leftSection={<IconPlus size={16} />} onClick={handleNew}>
            Novo Treino
          </Button>
        </Group>
      </Group>

      <Paper withBorder>
        <ScrollArea h="calc(100vh - 220px)" offsetScrollbars>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Treino</Table.Th>
                <Table.Th>Nivel</Table.Th>
                <Table.Th>Categoria</Table.Th>
                <Table.Th>Duracao</Table.Th>
                <Table.Th>Ativo</Table.Th>
                <Table.Th>Acoes</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredTreinos.map((treino) => (
                <Table.Tr key={treino.id}>
                  <Table.Td>
                    <Stack gap={0}>
                      <Text size="sm" fw={500}>{treino.nome}</Text>
                      <Text size="xs" c="dimmed" lineClamp={1}>{treino.descricao}</Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <NivelBadge nivel={treino.nivel} />
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{treino.categoria}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{treino.duracaoMinutos} min</Text>
                  </Table.Td>
                  <Table.Td>
                    <Switch checked={treino.ativo} readOnly size="sm" />
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Visualizar">
                        <ActionIcon variant="subtle" color="blue" onClick={() => handleView(treino)}>
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Editar">
                        <ActionIcon variant="subtle" color="yellow" onClick={() => handleEdit(treino)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Remover">
                        <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(treino)}>
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

function NivelBadge({ nivel }: { nivel?: string }) {
  const colors: Record<string, string> = {
    INICIANTE: 'green',
    INTERMEDIARIO: 'yellow',
    AVANCADO: 'red',
  }
  return (
    <Badge color={colors[nivel || ''] || 'gray'} variant="light">
      {nivel || '-'}
    </Badge>
  )
}
