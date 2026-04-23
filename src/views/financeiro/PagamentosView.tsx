/**
 * PagamentosView - Gestão de Pagamentos do BlueVix
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
  Textarea,
  Button,
} from '@mantine/core'
import {
  IconSearch,
  IconReceiptRefund,
  IconCreditCard,
  IconQrcode,
} from '@tabler/icons-react'
import { ArchbaseNotifications } from '@archbase/components'
import { useInjection } from 'inversify-react'

import { PagamentoDto, StatusPagamento, MetodoPagamento, GatewayPagamento } from '../../domain/financeiro/FinanceiroDto'
import { PagamentoService } from '../../services/FinanceiroService'
import { API_TYPE } from '../../ioc/IOCTypes'

// ============================================
// MOCK DATA
// ============================================
const USE_MOCK_DATA = true

const mockPagamentos: PagamentoDto[] = [
  new PagamentoDto({
    id: 'pag-001',
    faturaId: 'fat-001',
    faturaCodigo: 'FAT-2024-0001',
    alunoId: 'aluno-001',
    gateway: 'STRIPE',
    metodo: 'CARTAO_CREDITO',
    valor: 79.90,
    status: 'APROVADO',
    cartaoUltimos4: '4242',
    cartaoBandeira: 'Visa',
    createdAt: '2024-02-10T10:30:00',
  }),
  new PagamentoDto({
    id: 'pag-002',
    faturaId: 'fat-002',
    faturaCodigo: 'FAT-2024-0002',
    alunoId: 'aluno-003',
    gateway: 'MERCADO_PAGO',
    metodo: 'PIX',
    valor: 179.90,
    status: 'PENDENTE',
    pixCopiaECola: '00020126580014br.gov.bcb.pix0136...',
    pixExpiracao: '2024-03-15T23:59:59',
    createdAt: '2024-03-10T14:00:00',
  }),
  new PagamentoDto({
    id: 'pag-003',
    faturaId: 'fat-003',
    faturaCodigo: 'FAT-2024-0003',
    alunoId: 'aluno-005',
    gateway: 'STRIPE',
    metodo: 'CARTAO_CREDITO',
    valor: 79.90,
    status: 'REJEITADO',
    erroMensagem: 'Cartão recusado pela operadora',
    createdAt: '2024-02-25T09:15:00',
  }),
  new PagamentoDto({
    id: 'pag-004',
    faturaId: 'fat-001',
    faturaCodigo: 'FAT-2024-0001',
    alunoId: 'aluno-001',
    gateway: 'STRIPE',
    metodo: 'CARTAO_CREDITO',
    valor: 79.90,
    status: 'REEMBOLSADO',
    valorReembolsado: 79.90,
    dataReembolso: '2024-02-20',
    motivoReembolso: 'Solicitação do cliente',
    cartaoUltimos4: '4242',
    cartaoBandeira: 'Visa',
    createdAt: '2024-02-10T10:30:00',
  }),
]

const statusColors: Record<StatusPagamento, string> = {
  PENDENTE: 'yellow',
  PROCESSANDO: 'blue',
  APROVADO: 'green',
  REJEITADO: 'red',
  REEMBOLSADO: 'gray',
}

const statusLabels: Record<StatusPagamento, string> = {
  PENDENTE: 'Pendente',
  PROCESSANDO: 'Processando',
  APROVADO: 'Aprovado',
  REJEITADO: 'Rejeitado',
  REEMBOLSADO: 'Reembolsado',
}

const metodoIcons: Record<MetodoPagamento, React.ReactNode> = {
  PIX: <IconQrcode size={16} />,
  CARTAO_CREDITO: <IconCreditCard size={16} />,
}

export function PagamentosView() {
  const [pagamentos, setPagamentos] = useState<PagamentoDto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterGateway, setFilterGateway] = useState<string | null>(null)
  const [reembolsoModalOpened, setReembolsoModalOpened] = useState(false)
  const [selectedPagamento, setSelectedPagamento] = useState<PagamentoDto | null>(null)
  const [valorReembolso, setValorReembolso] = useState<number>(0)
  const [motivoReembolso, setMotivoReembolso] = useState('')

  const pagamentoService = useInjection<PagamentoService>(API_TYPE.PagamentoService)

  useEffect(() => {
    loadPagamentos()
  }, [])

  const loadPagamentos = async () => {
    setLoading(true)
    try {
      if (USE_MOCK_DATA) {
        await new Promise((r) => setTimeout(r, 500))
        setPagamentos(mockPagamentos)
      } else {
        const page = await pagamentoService.findAll(0, 100)
        setPagamentos(page.content.map((p: unknown) => new PagamentoDto(p as Partial<PagamentoDto>)))
      }
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao carregar pagamentos')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenReembolsoModal = (pagamento: PagamentoDto) => {
    setSelectedPagamento(pagamento)
    setValorReembolso(pagamento.valor)
    setMotivoReembolso('')
    setReembolsoModalOpened(true)
  }

  const handleReembolsar = async () => {
    if (!selectedPagamento) return
    try {
      await pagamentoService.reembolsar(selectedPagamento.id, valorReembolso, motivoReembolso)
      setReembolsoModalOpened(false)
      await loadPagamentos()
      ArchbaseNotifications.showSuccess('Sucesso', 'Reembolso processado')
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao processar reembolso')
    }
  }

  const formatDateTime = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('pt-BR')
  }

  const filteredPagamentos = pagamentos.filter((pagamento) => {
    const matchesSearch = pagamento.faturaCodigo?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !filterStatus || pagamento.status === filterStatus
    const matchesGateway = !filterGateway || pagamento.gateway === filterGateway
    return matchesSearch && matchesStatus && matchesGateway
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
        <Title order={2}>Pagamentos</Title>
      </Group>

      <Paper shadow="xs" p="md">
        <Group gap="md" mb="md">
          <TextInput
            placeholder="Buscar por fatura..."
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
          <Select
            placeholder="Gateway"
            clearable
            data={[
              { value: 'STRIPE', label: 'Stripe' },
              { value: 'MERCADO_PAGO', label: 'Mercado Pago' },
              { value: 'PAGSEGURO', label: 'PagSeguro' },
            ]}
            value={filterGateway}
            onChange={setFilterGateway}
            w={150}
          />
        </Group>

        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Fatura</Table.Th>
                <Table.Th>Método</Table.Th>
                <Table.Th>Gateway</Table.Th>
                <Table.Th>Valor</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Detalhes</Table.Th>
                <Table.Th>Data</Table.Th>
                <Table.Th w={80}>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredPagamentos.map((pagamento) => (
                <Table.Tr key={pagamento.id}>
                  <Table.Td>
                    <Text fw={500} size="sm">{pagamento.faturaCodigo}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      {metodoIcons[pagamento.metodo]}
                      <Text size="sm">{pagamento.metodo === 'PIX' ? 'PIX' : 'Cartão'}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="outline">{pagamento.gateway}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={500}>
                      <NumberFormatter value={pagamento.valor} prefix="R$ " decimalScale={2} />
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={statusColors[pagamento.status]}>
                      {statusLabels[pagamento.status]}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {pagamento.metodo === 'CARTAO_CREDITO' && pagamento.cartaoUltimos4 && (
                      <Text size="sm">
                        {pagamento.cartaoBandeira} **** {pagamento.cartaoUltimos4}
                      </Text>
                    )}
                    {pagamento.status === 'REJEITADO' && pagamento.erroMensagem && (
                      <Text size="sm" c="red">{pagamento.erroMensagem}</Text>
                    )}
                    {pagamento.status === 'REEMBOLSADO' && (
                      <Text size="sm" c="dimmed">
                        Reembolso: <NumberFormatter value={pagamento.valorReembolsado || 0} prefix="R$ " decimalScale={2} />
                      </Text>
                    )}
                    {pagamento.metodo === 'PIX' && pagamento.status === 'PENDENTE' && (
                      <Text size="sm" c="dimmed">Aguardando pagamento</Text>
                    )}
                  </Table.Td>
                  <Table.Td>{formatDateTime(pagamento.createdAt)}</Table.Td>
                  <Table.Td>
                    {pagamento.status === 'APROVADO' && (
                      <Tooltip label="Reembolsar">
                        <ActionIcon
                          variant="light"
                          color="orange"
                          onClick={() => handleOpenReembolsoModal(pagamento)}
                        >
                          <IconReceiptRefund size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>

        {filteredPagamentos.length === 0 && (
          <Center py="xl">
            <Text c="dimmed">Nenhum pagamento encontrado</Text>
          </Center>
        )}
      </Paper>

      <Modal
        opened={reembolsoModalOpened}
        onClose={() => setReembolsoModalOpened(false)}
        title="Processar Reembolso"
      >
        <Stack gap="md">
          <Text>
            Reembolsar pagamento da fatura <strong>{selectedPagamento?.faturaCodigo}</strong>
          </Text>
          <Text size="sm" c="dimmed">
            Valor pago: <NumberFormatter value={selectedPagamento?.valor || 0} prefix="R$ " decimalScale={2} />
          </Text>
          <NumberInput
            label="Valor do Reembolso"
            prefix="R$ "
            decimalScale={2}
            value={valorReembolso}
            onChange={(val) => setValorReembolso(Number(val) || 0)}
            min={0}
            max={selectedPagamento?.valor || 0}
          />
          <Textarea
            label="Motivo do Reembolso"
            placeholder="Informe o motivo..."
            value={motivoReembolso}
            onChange={(e) => setMotivoReembolso(e.target.value)}
            rows={3}
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setReembolsoModalOpened(false)}>
              Cancelar
            </Button>
            <Button color="orange" onClick={handleReembolsar}>
              Processar Reembolso
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
