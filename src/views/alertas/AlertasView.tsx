/**
 * AlertasView - Gestao de Alertas do Sistema Sentinela
 */
import { useState, useEffect } from 'react'
import {
  Badge,
  Group,
  Text,
  SegmentedControl,
  ActionIcon,
  Tooltip,
  Stack,
  Textarea,
  Button,
  Modal,
  Avatar,
  Paper,
  Table,
  Title,
  Loader,
  Center,
} from '@mantine/core'
import {
  IconCheck,
  IconMessage,
} from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { ArchbaseNotifications } from '@archbase/components'
import { useInjection } from 'inversify-react'

import { AlertaDto } from '../../domain/alerta/AlertaDto'
import { AlertaService } from '../../services/AlertaService'
import { API_TYPE } from '../../ioc/IOCTypes'

// ============================================
// MOCK DATA - Desativar após validação
// ============================================
const USE_MOCK_DATA = true

const mockAlertas: AlertaDto[] = [
  new AlertaDto({
    id: 'alerta-001',
    alunoId: 'aluno-001',
    alunoNome: 'Maria Silva Santos',
    alunoEmail: 'maria.silva@email.com',
    tipo: 'INATIVIDADE_3_DIAS',
    titulo: 'Inatividade de 3 dias',
    prioridade: 'ALTA',
    status: 'PENDENTE',
    descricao: 'Aluna não treinou nos últimos 3 dias',
    dataGeracao: '2024-04-20T10:30:00',
  }),
  new AlertaDto({
    id: 'alerta-002',
    alunoId: 'aluno-002',
    alunoNome: 'Ana Costa Lima',
    alunoEmail: 'ana.costa@email.com',
    tipo: 'HUMOR_BAIXO_CONSECUTIVO',
    titulo: 'Humor baixo consecutivo',
    prioridade: 'CRITICA',
    status: 'PENDENTE',
    descricao: 'Humor reportado abaixo de 4 por 3 dias consecutivos',
    dataGeracao: '2024-04-20T08:15:00',
  }),
  new AlertaDto({
    id: 'alerta-003',
    alunoId: 'aluno-003',
    alunoNome: 'Juliana Oliveira',
    alunoEmail: 'juliana.oliveira@email.com',
    tipo: 'STREAK_PERDIDO',
    titulo: 'Streak perdido',
    prioridade: 'MEDIA',
    status: 'EM_ANALISE',
    descricao: 'Streak de 15 dias perdido',
    dataGeracao: '2024-04-19T14:00:00',
    notas: 'Entrei em contato, aluna estava doente.',
  }),
  new AlertaDto({
    id: 'alerta-004',
    alunoId: 'aluno-004',
    alunoNome: 'Fernanda Lima Souza',
    alunoEmail: 'fernanda.lima@email.com',
    tipo: 'PLANO_EXPIRANDO',
    titulo: 'Plano expirando',
    prioridade: 'BAIXA',
    status: 'RESOLVIDO',
    descricao: 'Plano expira em 5 dias',
    dataGeracao: '2024-04-18T09:00:00',
    notas: 'Aluna renovou o plano.',
  }),
  new AlertaDto({
    id: 'alerta-005',
    alunoId: 'aluno-005',
    alunoNome: 'Camila Rodrigues',
    alunoEmail: 'camila.rodrigues@email.com',
    tipo: 'PADRAO_PREOCUPANTE',
    titulo: 'Padrão preocupante',
    prioridade: 'MEDIA',
    status: 'PENDENTE',
    descricao: 'Reportou dificuldade com exercícios de agachamento',
    dataGeracao: '2024-04-20T11:45:00',
  }),
  new AlertaDto({
    id: 'alerta-006',
    alunoId: 'aluno-006',
    alunoNome: 'Patrícia Mendes',
    alunoEmail: 'patricia.mendes@email.com',
    tipo: 'OBJETIVO_NAO_ATINGIDO',
    titulo: 'Objetivo não atingido',
    prioridade: 'ALTA',
    status: 'PENDENTE',
    descricao: 'Avaliou treino com nota 2/5',
    dataGeracao: '2024-04-19T18:30:00',
  }),
]

export function AlertasView() {
  const alertaService = useInjection<AlertaService>(API_TYPE.AlertaService)

  const [loading, setLoading] = useState(true)
  const [alertas, setAlertas] = useState<AlertaDto[]>([])
  const [filtro, setFiltro] = useState('todos')
  const [notaOpened, { open: openNota, close: closeNota }] = useDisclosure(false)
  const [selectedAlerta, setSelectedAlerta] = useState<AlertaDto | null>(null)
  const [nota, setNota] = useState('')

  useEffect(() => {
    loadAlertas()
  }, [])

  const loadAlertas = async () => {
    try {
      setLoading(true)
      if (USE_MOCK_DATA) {
        // Simula delay de rede
        await new Promise(resolve => setTimeout(resolve, 500))
        setAlertas(mockAlertas)
      } else {
        const response = await alertaService.findAll(0, 50)
        setAlertas(response.content || [])
      }
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível carregar os alertas')
    } finally {
      setLoading(false)
    }
  }

  const handleResolver = async (alerta: AlertaDto) => {
    try {
      await alertaService.resolver(alerta.id)
      ArchbaseNotifications.showSuccess('Sucesso', 'Alerta resolvido')
      loadAlertas()
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível resolver o alerta')
    }
  }

  const handleAddNota = (alerta: AlertaDto) => {
    setSelectedAlerta(alerta)
    setNota(alerta.notas || '')
    openNota()
  }

  const handleSaveNota = async () => {
    if (!selectedAlerta) return
    try {
      await alertaService.addNota(selectedAlerta.id, nota)
      ArchbaseNotifications.showSuccess('Sucesso', 'Nota adicionada')
      closeNota()
      loadAlertas()
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível adicionar a nota')
    }
  }

  const filteredAlertas = alertas.filter((alerta) => {
    if (filtro === 'todos') return true
    if (filtro === 'criticos') return alerta.prioridade === 'CRITICA'
    if (filtro === 'pendentes') return alerta.status === 'PENDENTE'
    if (filtro === 'resolvidos') return alerta.status === 'RESOLVIDO'
    return true
  })

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    )
  }

  return (
    <>
      <Stack gap="lg" p="md">
        <Group justify="space-between">
          <Title order={2}>Alertas</Title>
          <SegmentedControl
            value={filtro}
            onChange={setFiltro}
            data={[
              { value: 'todos', label: 'Todos' },
              { value: 'criticos', label: 'Criticos' },
              { value: 'pendentes', label: 'Pendentes' },
              { value: 'resolvidos', label: 'Resolvidos' },
            ]}
          />
        </Group>

        <Paper withBorder>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Aluno</Table.Th>
                <Table.Th>Tipo</Table.Th>
                <Table.Th>Prioridade</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Data</Table.Th>
                <Table.Th>Acoes</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredAlertas.map((alerta) => (
                <Table.Tr key={alerta.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar size="sm" radius="xl" color="blue">
                        {alerta.alunoNome?.charAt(0) || '?'}
                      </Avatar>
                      <Stack gap={0}>
                        <Text size="sm" fw={500}>{alerta.alunoNome || 'Desconhecido'}</Text>
                        <Text size="xs" c="dimmed">{alerta.alunoEmail}</Text>
                      </Stack>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="outline" color="blue">{alerta.tipo}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <PrioridadeBadge prioridade={alerta.prioridade} />
                  </Table.Td>
                  <Table.Td>
                    <StatusBadge status={alerta.status} />
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {alerta.dataGeracao ? new Date(alerta.dataGeracao).toLocaleDateString('pt-BR') : '-'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {alerta.status !== 'RESOLVIDO' && (
                        <Tooltip label="Resolver">
                          <ActionIcon variant="subtle" color="green" onClick={() => handleResolver(alerta)}>
                            <IconCheck size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      <Tooltip label="Adicionar Nota">
                        <ActionIcon variant="subtle" color="blue" onClick={() => handleAddNota(alerta)}>
                          <IconMessage size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </Stack>

      <Modal opened={notaOpened} onClose={closeNota} title="Adicionar Nota" size="md">
        <Stack>
          <Textarea
            label="Nota"
            placeholder="Digite sua observacao..."
            value={nota}
            onChange={(e) => setNota(e.currentTarget.value)}
            minRows={4}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={closeNota}>Cancelar</Button>
            <Button onClick={handleSaveNota}>Salvar</Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}

function PrioridadeBadge({ prioridade }: { prioridade?: string }) {
  const colors: Record<string, string> = {
    CRITICA: 'red',
    ALTA: 'orange',
    MEDIA: 'yellow',
    BAIXA: 'blue',
  }
  return (
    <Badge color={colors[prioridade || ''] || 'gray'} variant="light">
      {prioridade || '-'}
    </Badge>
  )
}

function StatusBadge({ status }: { status?: string }) {
  const colors: Record<string, string> = {
    PENDENTE: 'yellow',
    EM_ANALISE: 'blue',
    RESOLVIDO: 'green',
    IGNORADO: 'gray',
  }
  return (
    <Badge color={colors[status || ''] || 'gray'} variant="filled">
      {status || '-'}
    </Badge>
  )
}
