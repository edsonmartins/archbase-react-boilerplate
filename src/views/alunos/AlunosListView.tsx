/**
 * AlunosListView - Lista de Alunos do BlueVix
 */
import { useState, useEffect } from 'react'
import {
  Badge,
  Group,
  Text,
  TextInput,
  Select,
  Avatar,
  ActionIcon,
  Tooltip,
  Stack,
  Paper,
  Table,
  Loader,
  Center,
  Title,
  Button,
  ScrollArea,
} from '@mantine/core'
import {
  IconSearch,
  IconEye,
  IconEdit,
  IconTrash,
  IconUserPlus,
} from '@tabler/icons-react'
import { ArchbaseNotifications, ArchbaseDialog } from '@archbase/components'
import { useInjection } from 'inversify-react'
import { useNavigate } from 'react-router-dom'

import { AlunoDto } from '../../domain/aluno/AlunoDto'
import { AlunoService } from '../../services/AlunoService'
import { API_TYPE } from '../../ioc/IOCTypes'
import { ALUNO_FICHA_ROUTE, ALUNO_EDITAR_ROUTE, ALUNO_NOVO_ROUTE } from '../../navigation/navigationDataConstants'

// ============================================
// MOCK DATA - Desativar após validação
// ============================================
const USE_MOCK_DATA = true

const mockAlunos: AlunoDto[] = [
  new AlunoDto({
    id: 'aluno-001',
    nome: 'Maria Silva Santos',
    email: 'maria.silva@email.com',
    telefone: '(11) 99999-1234',
    nivelTreino: 'INTERMEDIARIO',
    status: 'ATIVO',
    plano: 'ESSENCIAL',
    cidade: 'São Paulo',
    estado: 'SP',
    dataNascimento: '1990-05-15',
    genero: 'FEMININO',
    perfilEmocional: 'MOTIVADO',
    humorPredominante: 8,
    nivelEstresse: 4,
  }),
  new AlunoDto({
    id: 'aluno-002',
    nome: 'Ana Costa Lima',
    email: 'ana.costa@email.com',
    telefone: '(21) 98888-5678',
    nivelTreino: 'INICIANTE',
    status: 'TRIAL',
    plano: 'TRIAL',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    dataNascimento: '1995-08-22',
    genero: 'FEMININO',
    perfilEmocional: 'ANSIOSO',
    humorPredominante: 6,
    nivelEstresse: 7,
  }),
  new AlunoDto({
    id: 'aluno-003',
    nome: 'Juliana Oliveira',
    email: 'juliana.oliveira@email.com',
    telefone: '(31) 97777-9012',
    nivelTreino: 'AVANCADO',
    status: 'ATIVO',
    plano: 'PRESENCA',
    cidade: 'Belo Horizonte',
    estado: 'MG',
    dataNascimento: '1988-12-03',
    genero: 'FEMININO',
    perfilEmocional: 'EQUILIBRADO',
    humorPredominante: 9,
    nivelEstresse: 2,
  }),
  new AlunoDto({
    id: 'aluno-004',
    nome: 'Fernanda Lima Souza',
    email: 'fernanda.lima@email.com',
    telefone: '(41) 96666-3456',
    nivelTreino: 'INTERMEDIARIO',
    status: 'ATIVO',
    plano: 'SEMENTE',
    cidade: 'Curitiba',
    estado: 'PR',
    dataNascimento: '1992-03-18',
    genero: 'FEMININO',
    perfilEmocional: 'ESTRESSADO',
    humorPredominante: 5,
    nivelEstresse: 8,
  }),
  new AlunoDto({
    id: 'aluno-005',
    nome: 'Camila Rodrigues',
    email: 'camila.rodrigues@email.com',
    telefone: '(51) 95555-7890',
    nivelTreino: 'INICIANTE',
    status: 'PAUSADO',
    plano: 'ESSENCIAL',
    cidade: 'Porto Alegre',
    estado: 'RS',
    dataNascimento: '1998-07-10',
    genero: 'FEMININO',
    perfilEmocional: 'DEPRESSIVO',
    humorPredominante: 3,
    nivelEstresse: 6,
  }),
  new AlunoDto({
    id: 'aluno-006',
    nome: 'Patrícia Mendes',
    email: 'patricia.mendes@email.com',
    telefone: '(61) 94444-1122',
    nivelTreino: 'AVANCADO',
    status: 'ATIVO',
    plano: 'PRESENCA',
    cidade: 'Brasília',
    estado: 'DF',
    dataNascimento: '1985-11-25',
    genero: 'FEMININO',
    perfilEmocional: 'MOTIVADO',
    humorPredominante: 9,
    nivelEstresse: 3,
  }),
  new AlunoDto({
    id: 'aluno-007',
    nome: 'Larissa Ferreira',
    email: 'larissa.ferreira@email.com',
    telefone: '(71) 93333-3344',
    nivelTreino: 'INICIANTE',
    status: 'EXPIRADO',
    plano: 'SEMENTE',
    cidade: 'Salvador',
    estado: 'BA',
    dataNascimento: '2000-01-30',
    genero: 'FEMININO',
    perfilEmocional: 'RESISTENTE',
    humorPredominante: 7,
    nivelEstresse: 5,
  }),
  new AlunoDto({
    id: 'aluno-008',
    nome: 'Beatriz Almeida',
    email: 'beatriz.almeida@email.com',
    telefone: '(81) 92222-5566',
    nivelTreino: 'INTERMEDIARIO',
    status: 'ATIVO',
    plano: 'ESSENCIAL',
    cidade: 'Recife',
    estado: 'PE',
    dataNascimento: '1993-09-14',
    genero: 'FEMININO',
    perfilEmocional: 'EQUILIBRADO',
    humorPredominante: 8,
    nivelEstresse: 4,
  }),
]

/**
 * View de listagem de Alunos
 */
export function AlunosListView() {
  const navigate = useNavigate()
  const alunoService = useInjection<AlunoService>(API_TYPE.AlunoService)

  const [loading, setLoading] = useState(true)
  const [alunos, setAlunos] = useState<AlunoDto[]>([])
  const [search, setSearch] = useState('')
  const [nivelFilter, setNivelFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  useEffect(() => {
    loadAlunos()
  }, [])

  const loadAlunos = async () => {
    try {
      setLoading(true)
      if (USE_MOCK_DATA) {
        // Simula delay de rede
        await new Promise(resolve => setTimeout(resolve, 500))
        setAlunos(mockAlunos)
      } else {
        const response = await alunoService.findAll(0, 50)
        setAlunos(response.content || [])
      }
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível carregar os alunos')
    } finally {
      setLoading(false)
    }
  }

  const handleNew = () => {
    navigate(`${ALUNO_NOVO_ROUTE}?action=add`)
  }

  const handleView = (aluno: AlunoDto) => {
    navigate(ALUNO_FICHA_ROUTE.replace(':id', aluno.id))
  }

  const handleEdit = (aluno: AlunoDto) => {
    navigate(`${ALUNO_EDITAR_ROUTE.replace(':id', aluno.id)}?action=edit`)
  }

  const handleDelete = (aluno: AlunoDto) => {
    ArchbaseDialog.showConfirmDialogYesNo(
      'Confirme',
      `Deseja remover o aluno "${aluno.nome}"?`,
      async () => {
        try {
          await alunoService.delete(aluno.id)
          ArchbaseNotifications.showSuccess('Sucesso', 'Aluno removido com sucesso')
          loadAlunos()
        } catch (err) {
          ArchbaseNotifications.showError('Erro', 'Não foi possível remover o aluno')
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

  const statusOptions = [
    { value: 'TRIAL', label: 'Trial' },
    { value: 'ATIVO', label: 'Ativo' },
    { value: 'EXPIRADO', label: 'Expirado' },
    { value: 'PAUSADO', label: 'Pausado' },
    { value: 'CANCELADO', label: 'Cancelado' },
  ]

  const filteredAlunos = alunos.filter((aluno) => {
    const matchSearch = !search ||
      aluno.nome?.toLowerCase().includes(search.toLowerCase()) ||
      aluno.email?.toLowerCase().includes(search.toLowerCase())
    const matchNivel = !nivelFilter || aluno.nivelTreino === nivelFilter
    const matchStatus = !statusFilter || aluno.status === statusFilter
    return matchSearch && matchNivel && matchStatus
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
        <Title order={2}>Alunos</Title>
        <Button leftSection={<IconUserPlus size={16} />} onClick={handleNew}>
          Novo Aluno
        </Button>
      </Group>

      <Group>
        <TextInput
          placeholder="Buscar por nome ou email..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ width: 280 }}
        />
        <Select
          placeholder="Nivel"
          data={nivelOptions}
          value={nivelFilter}
          onChange={setNivelFilter}
          clearable
          style={{ width: 160 }}
        />
        <Select
          placeholder="Status"
          data={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
          style={{ width: 160 }}
        />
      </Group>

      <Paper withBorder>
        <ScrollArea h="calc(100vh - 220px)" offsetScrollbars>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Aluno</Table.Th>
                <Table.Th>Nivel</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Plano</Table.Th>
                <Table.Th>Acoes</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredAlunos.map((aluno) => (
                <Table.Tr key={aluno.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar src={aluno.avatarUrl} size="sm" radius="xl" color="blue">
                        {aluno.nome?.charAt(0)}
                      </Avatar>
                      <Stack gap={0}>
                        <Text size="sm" fw={500}>{aluno.nome}</Text>
                        <Text size="xs" c="dimmed">{aluno.email}</Text>
                      </Stack>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <NivelBadge nivel={aluno.nivelTreino} />
                  </Table.Td>
                  <Table.Td>
                    <StatusBadge status={aluno.status} />
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{aluno.plano}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Ver Ficha">
                        <ActionIcon variant="subtle" color="blue" onClick={() => handleView(aluno)}>
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Editar">
                        <ActionIcon variant="subtle" color="yellow" onClick={() => handleEdit(aluno)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Remover">
                        <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(aluno)}>
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
  const labels: Record<string, string> = {
    INICIANTE: 'Iniciante',
    INTERMEDIARIO: 'Intermediario',
    AVANCADO: 'Avancado',
  }
  return (
    <Badge color={colors[nivel || ''] || 'gray'} variant="light">
      {labels[nivel || ''] || nivel || '-'}
    </Badge>
  )
}

function StatusBadge({ status }: { status?: string }) {
  const colors: Record<string, string> = {
    TRIAL: 'yellow',
    ATIVO: 'green',
    EXPIRADO: 'red',
    PAUSADO: 'gray',
    CANCELADO: 'dark',
  }
  return (
    <Badge color={colors[status || ''] || 'gray'} variant="light">
      {status || '-'}
    </Badge>
  )
}
