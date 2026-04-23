/**
 * AssinaturasView - Gestão de Assinaturas do BlueVix
 */
import { useState, useEffect } from 'react'
import {
  Badge,
  Group,
  Text,
  TextInput,
  Select,
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
  Modal,
  Textarea,
} from '@mantine/core'
import {
  IconSearch,
  IconEye,
  IconPlayerPlay,
  IconPlayerPause,
  IconX,
  IconRefresh,
  IconPlus,
} from '@tabler/icons-react'
import { ArchbaseNotifications, ArchbaseDialog } from '@archbase/components'
import { useInjection } from 'inversify-react'

import { AssinaturaDto, StatusAssinatura } from '../../domain/financeiro/FinanceiroDto'
import { AssinaturaService } from '../../services/FinanceiroService'
import { API_TYPE } from '../../ioc/IOCTypes'

// ============================================
// MOCK DATA
// ============================================
const USE_MOCK_DATA = true

const mockAssinaturas: AssinaturaDto[] = [
  new AssinaturaDto({
    id: 'assin-001',
    alunoId: 'aluno-001',
    alunoNome: 'Maria Silva Santos',
    planoId: 'plano-003',
    planoNome: 'Essencial',
    planoCodigo: 'ESSENCIAL',
    planoPrecoId: 'preco-003',
    precoCodigo: 'MENSAL',
    status: 'ATIVA',
    dataInicio: '2024-01-15',
    dataExpiracao: '2024-12-15',
    autoRenovacao: true,
    gateway: 'STRIPE',
  }),
  new AssinaturaDto({
    id: 'assin-002',
    alunoId: 'aluno-002',
    alunoNome: 'Ana Costa Lima',
    planoId: 'plano-001',
    planoNome: 'Trial',
    planoCodigo: 'TRIAL',
    status: 'TRIAL',
    dataInicio: '2024-03-01',
    dataExpiracao: '2024-03-08',
    autoRenovacao: false,
  }),
  new AssinaturaDto({
    id: 'assin-003',
    alunoId: 'aluno-003',
    alunoNome: 'Juliana Oliveira',
    planoId: 'plano-004',
    planoNome: 'Presença',
    planoCodigo: 'PRESENCA',
    planoPrecoId: 'preco-006',
    precoCodigo: 'MENSAL',
    status: 'ATIVA',
    dataInicio: '2024-02-01',
    dataExpiracao: '2024-12-01',
    autoRenovacao: true,
    gateway: 'MERCADO_PAGO',
  }),
  new AssinaturaDto({
    id: 'assin-004',
    alunoId: 'aluno-005',
    alunoNome: 'Camila Rodrigues',
    planoId: 'plano-003',
    planoNome: 'Essencial',
    planoCodigo: 'ESSENCIAL',
    planoPrecoId: 'preco-003',
    precoCodigo: 'MENSAL',
    status: 'PAUSADA',
    dataInicio: '2024-01-01',
    dataExpiracao: '2024-06-01',
    autoRenovacao: true,
    gateway: 'STRIPE',
  }),
  new AssinaturaDto({
    id: 'assin-005',
    alunoId: 'aluno-007',
    alunoNome: 'Larissa Ferreira',
    planoId: 'plano-002',
    planoNome: 'Semente',
    planoCodigo: 'SEMENTE',
    planoPrecoId: 'preco-001',
    precoCodigo: 'MENSAL',
    status: 'CANCELADA',
    dataInicio: '2023-10-01',
    dataExpiracao: '2024-01-01',
    autoRenovacao: false,
    motivoCancelamento: 'Problemas financeiros',
    dataCancelamento: '2024-01-01',
  }),
]

const statusColors: Record<StatusAssinatura, string> = {
  PENDENTE: 'yellow',
  TRIAL: 'blue',
  ATIVA: 'green',
  PAUSADA: 'orange',
  CANCELADA: 'red',
  EXPIRADA: 'gray',
}

const statusLabels: Record<StatusAssinatura, string> = {
  PENDENTE: 'Pendente',
  TRIAL: 'Trial',
  ATIVA: 'Ativa',
  PAUSADA: 'Pausada',
  CANCELADA: 'Cancelada',
  EXPIRADA: 'Expirada',
}

export function AssinaturasView() {
  const [assinaturas, setAssinaturas] = useState<AssinaturaDto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [cancelModalOpened, setCancelModalOpened] = useState(false)
  const [selectedAssinatura, setSelectedAssinatura] = useState<AssinaturaDto | null>(null)
  const [motivoCancelamento, setMotivoCancelamento] = useState('')

  const assinaturaService = useInjection<AssinaturaService>(API_TYPE.AssinaturaService)

  useEffect(() => {
    loadAssinaturas()
  }, [])

  const loadAssinaturas = async () => {
    setLoading(true)
    try {
      if (USE_MOCK_DATA) {
        await new Promise((r) => setTimeout(r, 500))
        setAssinaturas(mockAssinaturas)
      } else {
        const page = await assinaturaService.findAll(0, 100)
        setAssinaturas(page.content.map((a: unknown) => new AssinaturaDto(a as Partial<AssinaturaDto>)))
      }
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao carregar assinaturas')
    } finally {
      setLoading(false)
    }
  }

  const handleAtivar = async (assinatura: AssinaturaDto) => {
    try {
      await assinaturaService.ativar(assinatura.id)
      await loadAssinaturas()
      ArchbaseNotifications.showSuccess('Sucesso', 'Assinatura ativada')
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao ativar assinatura')
    }
  }

  const handlePausar = async (assinatura: AssinaturaDto) => {
    try {
      await assinaturaService.pausar(assinatura.id)
      await loadAssinaturas()
      ArchbaseNotifications.showSuccess('Sucesso', 'Assinatura pausada')
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao pausar assinatura')
    }
  }

  const handleRetomar = async (assinatura: AssinaturaDto) => {
    try {
      await assinaturaService.retomar(assinatura.id)
      await loadAssinaturas()
      ArchbaseNotifications.showSuccess('Sucesso', 'Assinatura retomada')
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao retomar assinatura')
    }
  }

  const handleOpenCancelModal = (assinatura: AssinaturaDto) => {
    setSelectedAssinatura(assinatura)
    setMotivoCancelamento('')
    setCancelModalOpened(true)
  }

  const handleCancelar = async () => {
    if (!selectedAssinatura) return
    try {
      await assinaturaService.cancelar(selectedAssinatura.id, motivoCancelamento)
      setCancelModalOpened(false)
      await loadAssinaturas()
      ArchbaseNotifications.showSuccess('Sucesso', 'Assinatura cancelada')
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao cancelar assinatura')
    }
  }

  const handleRenovar = async (assinatura: AssinaturaDto) => {
    try {
      await assinaturaService.renovar(assinatura.id)
      await loadAssinaturas()
      ArchbaseNotifications.showSuccess('Sucesso', 'Assinatura renovada')
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao renovar assinatura')
    }
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const filteredAssinaturas = assinaturas.filter((assinatura) => {
    const matchesSearch =
      assinatura.alunoNome?.toLowerCase().includes(search.toLowerCase()) ||
      assinatura.planoNome?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !filterStatus || assinatura.status === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    )
  }

  return (
    <Stack gap="md" p="md">
      <Group justify="space-between">
        <Title order={2}>Assinaturas</Title>
      </Group>

      <Paper shadow="xs" p="md">
        <Group gap="md" mb="md">
          <TextInput
            placeholder="Buscar por aluno ou plano..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Status"
            clearable
            data={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
            value={filterStatus}
            onChange={setFilterStatus}
            w={150}
          />
        </Group>

        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Aluno</Table.Th>
                <Table.Th>Plano</Table.Th>
                <Table.Th>Preço</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Início</Table.Th>
                <Table.Th>Expiração</Table.Th>
                <Table.Th>Gateway</Table.Th>
                <Table.Th w={150}>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredAssinaturas.map((assinatura) => (
                <Table.Tr key={assinatura.id}>
                  <Table.Td>
                    <Text fw={500}>{assinatura.alunoNome}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light">{assinatura.planoNome}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{assinatura.precoCodigo || '-'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={statusColors[assinatura.status]}>
                      {statusLabels[assinatura.status]}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{formatDate(assinatura.dataInicio)}</Table.Td>
                  <Table.Td>{formatDate(assinatura.dataExpiracao)}</Table.Td>
                  <Table.Td>
                    <Text size="sm">{assinatura.gateway || '-'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      {assinatura.status === 'PENDENTE' && (
                        <Tooltip label="Ativar">
                          <ActionIcon
                            variant="light"
                            color="green"
                            onClick={() => handleAtivar(assinatura)}
                          >
                            <IconPlayerPlay size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {assinatura.status === 'ATIVA' && (
                        <Tooltip label="Pausar">
                          <ActionIcon
                            variant="light"
                            color="orange"
                            onClick={() => handlePausar(assinatura)}
                          >
                            <IconPlayerPause size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {assinatura.status === 'PAUSADA' && (
                        <Tooltip label="Retomar">
                          <ActionIcon
                            variant="light"
                            color="green"
                            onClick={() => handleRetomar(assinatura)}
                          >
                            <IconPlayerPlay size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {(assinatura.status === 'ATIVA' || assinatura.status === 'PAUSADA') && (
                        <Tooltip label="Cancelar">
                          <ActionIcon
                            variant="light"
                            color="red"
                            onClick={() => handleOpenCancelModal(assinatura)}
                          >
                            <IconX size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      {assinatura.status === 'ATIVA' && (
                        <Tooltip label="Renovar">
                          <ActionIcon
                            variant="light"
                            color="blue"
                            onClick={() => handleRenovar(assinatura)}
                          >
                            <IconRefresh size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {filteredAssinaturas.length === 0 && (
          <Center py="xl">
            <Text c="dimmed">Nenhuma assinatura encontrada</Text>
          </Center>
        )}
      </Paper>

      <Modal
        opened={cancelModalOpened}
        onClose={() => setCancelModalOpened(false)}
        title="Cancelar Assinatura"
      >
        <Stack gap="md">
          <Text>
            Tem certeza que deseja cancelar a assinatura de{' '}
            <strong>{selectedAssinatura?.alunoNome}</strong>?
          </Text>
          <Textarea
            label="Motivo do Cancelamento"
            placeholder="Informe o motivo..."
            value={motivoCancelamento}
            onChange={(e) => setMotivoCancelamento(e.target.value)}
            rows={3}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setCancelModalOpened(false)}>
              Voltar
            </Button>
            <Button color="red" onClick={handleCancelar}>
              Cancelar Assinatura
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
