/**
 * FaturasView - Gestão de Faturas do BlueVix
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
  ScrollArea,
  NumberFormatter,
  Modal,
  NumberInput,
  Button,
} from '@mantine/core'
import {
  IconSearch,
  IconCheck,
  IconX,
  IconDiscount,
  IconReceipt,
} from '@tabler/icons-react'
import { ArchbaseNotifications } from '@archbase/components'
import { useInjection } from 'inversify-react'

import { FaturaDto, StatusFatura } from '../../domain/financeiro/FinanceiroDto'
import { FaturaService } from '../../services/FinanceiroService'
import { API_TYPE } from '../../ioc/IOCTypes'

// ============================================
// MOCK DATA
// ============================================
const USE_MOCK_DATA = true

const mockFaturas: FaturaDto[] = [
  new FaturaDto({
    id: 'fat-001',
    codigo: 'FAT-2024-0001',
    assinaturaId: 'assin-001',
    alunoId: 'aluno-001',
    alunoNome: 'Maria Silva Santos',
    planoNome: 'Essencial',
    valorOriginal: 79.90,
    desconto: 0,
    valorFinal: 79.90,
    status: 'PAGA',
    dataVencimento: '2024-02-15',
    dataPagamento: '2024-02-10',
    descricao: 'Assinatura Mensal - Essencial',
  }),
  new FaturaDto({
    id: 'fat-002',
    codigo: 'FAT-2024-0002',
    assinaturaId: 'assin-003',
    alunoId: 'aluno-003',
    alunoNome: 'Juliana Oliveira',
    planoNome: 'Presença',
    valorOriginal: 199.90,
    desconto: 20,
    valorFinal: 179.90,
    status: 'PENDENTE',
    dataVencimento: '2024-03-15',
    descricao: 'Assinatura Mensal - Presença',
  }),
  new FaturaDto({
    id: 'fat-003',
    codigo: 'FAT-2024-0003',
    assinaturaId: 'assin-004',
    alunoId: 'aluno-005',
    alunoNome: 'Camila Rodrigues',
    planoNome: 'Essencial',
    valorOriginal: 79.90,
    desconto: 0,
    valorFinal: 79.90,
    status: 'VENCIDA',
    dataVencimento: '2024-02-28',
    descricao: 'Assinatura Mensal - Essencial',
  }),
  new FaturaDto({
    id: 'fat-004',
    codigo: 'FAT-2024-0004',
    assinaturaId: 'assin-005',
    alunoId: 'aluno-007',
    alunoNome: 'Larissa Ferreira',
    planoNome: 'Semente',
    valorOriginal: 49.90,
    desconto: 0,
    valorFinal: 49.90,
    status: 'CANCELADA',
    dataVencimento: '2024-01-15',
    descricao: 'Assinatura Mensal - Semente',
  }),
]

const statusColors: Record<StatusFatura, string> = {
  PENDENTE: 'yellow',
  PAGA: 'green',
  CANCELADA: 'gray',
  VENCIDA: 'red',
}

const statusLabels: Record<StatusFatura, string> = {
  PENDENTE: 'Pendente',
  PAGA: 'Paga',
  CANCELADA: 'Cancelada',
  VENCIDA: 'Vencida',
}

export function FaturasView() {
  const [faturas, setFaturas] = useState<FaturaDto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [descontoModalOpened, setDescontoModalOpened] = useState(false)
  const [selectedFatura, setSelectedFatura] = useState<FaturaDto | null>(null)
  const [valorDesconto, setValorDesconto] = useState<number>(0)

  const faturaService = useInjection<FaturaService>(API_TYPE.FaturaService)

  useEffect(() => {
    loadFaturas()
  }, [])

  const loadFaturas = async () => {
    setLoading(true)
    try {
      if (USE_MOCK_DATA) {
        await new Promise((r) => setTimeout(r, 500))
        setFaturas(mockFaturas)
      } else {
        const page = await faturaService.findAll(0, 100)
        setFaturas(page.content.map((f: unknown) => new FaturaDto(f as Partial<FaturaDto>)))
      }
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao carregar faturas')
    } finally {
      setLoading(false)
    }
  }

  const handleMarcarComoPaga = async (fatura: FaturaDto) => {
    try {
      await faturaService.marcarComoPaga(fatura.id)
      await loadFaturas()
      ArchbaseNotifications.showSuccess('Sucesso', 'Fatura marcada como paga')
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao marcar fatura como paga')
    }
  }

  const handleCancelar = async (fatura: FaturaDto) => {
    try {
      await faturaService.cancelar(fatura.id)
      await loadFaturas()
      ArchbaseNotifications.showSuccess('Sucesso', 'Fatura cancelada')
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao cancelar fatura')
    }
  }

  const handleOpenDescontoModal = (fatura: FaturaDto) => {
    setSelectedFatura(fatura)
    setValorDesconto(0)
    setDescontoModalOpened(true)
  }

  const handleAplicarDesconto = async () => {
    if (!selectedFatura || valorDesconto <= 0) return
    try {
      await faturaService.aplicarDesconto(selectedFatura.id, valorDesconto)
      setDescontoModalOpened(false)
      await loadFaturas()
      ArchbaseNotifications.showSuccess('Sucesso', 'Desconto aplicado')
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao aplicar desconto')
    }
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const filteredFaturas = faturas.filter((fatura) => {
    const matchesSearch =
      fatura.codigo.toLowerCase().includes(search.toLowerCase()) ||
      fatura.alunoNome?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !filterStatus || fatura.status === filterStatus
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
        <Title order={2}>Faturas</Title>
      </Group>

      <Paper shadow="xs" p="md">
        <Group gap="md" mb="md">
          <TextInput
            placeholder="Buscar por código ou aluno..."
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
                <Table.Th>Código</Table.Th>
                <Table.Th>Aluno</Table.Th>
                <Table.Th>Plano</Table.Th>
                <Table.Th>Valor Original</Table.Th>
                <Table.Th>Desconto</Table.Th>
                <Table.Th>Valor Final</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Vencimento</Table.Th>
                <Table.Th>Pagamento</Table.Th>
                <Table.Th w={120}>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredFaturas.map((fatura) => (
                <Table.Tr key={fatura.id}>
                  <Table.Td>
                    <Group gap={4}>
                      <IconReceipt size={16} />
                      <Text fw={500} size="sm">{fatura.codigo}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{fatura.alunoNome}</Table.Td>
                  <Table.Td>
                    <Badge variant="light">{fatura.planoNome}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <NumberFormatter value={fatura.valorOriginal} prefix="R$ " decimalScale={2} />
                  </Table.Td>
                  <Table.Td>
                    {fatura.desconto ? (
                      <Text c="green" size="sm">
                        -<NumberFormatter value={fatura.desconto} prefix="R$ " decimalScale={2} />
                      </Text>
                    ) : (
                      <Text size="sm" c="dimmed">-</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text fw={500}>
                      <NumberFormatter value={fatura.valorFinal} prefix="R$ " decimalScale={2} />
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={statusColors[fatura.status]}>
                      {statusLabels[fatura.status]}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{formatDate(fatura.dataVencimento)}</Table.Td>
                  <Table.Td>{formatDate(fatura.dataPagamento)}</Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      {fatura.status === 'PENDENTE' && (
                        <>
                          <Tooltip label="Marcar como Paga">
                            <ActionIcon
                              variant="light"
                              color="green"
                              onClick={() => handleMarcarComoPaga(fatura)}
                            >
                              <IconCheck size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Aplicar Desconto">
                            <ActionIcon
                              variant="light"
                              color="blue"
                              onClick={() => handleOpenDescontoModal(fatura)}
                            >
                              <IconDiscount size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Cancelar">
                            <ActionIcon
                              variant="light"
                              color="red"
                              onClick={() => handleCancelar(fatura)}
                            >
                              <IconX size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </>
                      )}
                      {fatura.status === 'VENCIDA' && (
                        <>
                          <Tooltip label="Marcar como Paga">
                            <ActionIcon
                              variant="light"
                              color="green"
                              onClick={() => handleMarcarComoPaga(fatura)}
                            >
                              <IconCheck size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Cancelar">
                            <ActionIcon
                              variant="light"
                              color="red"
                              onClick={() => handleCancelar(fatura)}
                            >
                              <IconX size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {filteredFaturas.length === 0 && (
          <Center py="xl">
            <Text c="dimmed">Nenhuma fatura encontrada</Text>
          </Center>
        )}
      </Paper>

      <Modal
        opened={descontoModalOpened}
        onClose={() => setDescontoModalOpened(false)}
        title="Aplicar Desconto"
      >
        <Stack gap="md">
          <Text>
            Aplicar desconto na fatura <strong>{selectedFatura?.codigo}</strong>
          </Text>
          <Text size="sm" c="dimmed">
            Valor atual: <NumberFormatter value={selectedFatura?.valorFinal || 0} prefix="R$ " decimalScale={2} />
          </Text>
          <NumberInput
            label="Valor do Desconto"
            prefix="R$ "
            decimalScale={2}
            value={valorDesconto}
            onChange={(val) => setValorDesconto(Number(val) || 0)}
            min={0}
            max={selectedFatura?.valorFinal || 0}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setDescontoModalOpened(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAplicarDesconto}>Aplicar Desconto</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
