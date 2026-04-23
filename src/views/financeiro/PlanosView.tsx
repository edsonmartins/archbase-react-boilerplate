/**
 * PlanosView - Gestão de Planos do BlueVix
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
  NumberFormatter,
  Modal,
  Textarea,
  NumberInput,
  Switch,
  Divider,
} from '@mantine/core'
import {
  IconSearch,
  IconEye,
  IconEdit,
  IconTrash,
  IconPlus,
  IconCurrencyDollar,
  IconCheck,
  IconX,
} from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { ArchbaseNotifications } from '@archbase/components'
import { useInjection } from 'inversify-react'

import { PlanoDto, PlanoPrecoDto } from '../../domain/financeiro/FinanceiroDto'
import { PlanoService } from '../../services/FinanceiroService'
import { API_TYPE } from '../../ioc/IOCTypes'

// ============================================
// MOCK DATA
// ============================================
const USE_MOCK_DATA = true

const mockPlanos: PlanoDto[] = [
  new PlanoDto({
    id: 'plano-001',
    codigo: 'TRIAL',
    nome: 'Trial',
    descricao: 'Período de teste gratuito',
    beneficios: ['7 dias de acesso', 'Suporte via chat', 'Treinos básicos'],
    diasDuracao: 7,
    diasTrial: 7,
    ativo: true,
    ordem: 0,
    precos: [],
  }),
  new PlanoDto({
    id: 'plano-002',
    codigo: 'SEMENTE',
    nome: 'Semente',
    descricao: 'Plano inicial para começar sua jornada',
    beneficios: ['Acesso ao app', 'Treinos personalizados', 'Suporte via chat'],
    diasDuracao: 30,
    diasTrial: 7,
    ativo: true,
    ordem: 1,
    precos: [
      new PlanoPrecoDto({ id: 'preco-001', planoId: 'plano-002', codigo: 'MENSAL', valor: 49.90, quantidadeMeses: 1, ativo: true }),
      new PlanoPrecoDto({ id: 'preco-002', planoId: 'plano-002', codigo: 'TRIMESTRAL', valor: 129.90, quantidadeMeses: 3, descontoPercentual: 15, ativo: true }),
    ],
  }),
  new PlanoDto({
    id: 'plano-003',
    codigo: 'ESSENCIAL',
    nome: 'Essencial',
    descricao: 'Plano completo para resultados consistentes',
    beneficios: ['Tudo do Semente', 'Acompanhamento mensal', 'Acesso a desafios'],
    diasDuracao: 30,
    diasTrial: 7,
    ativo: true,
    ordem: 2,
    precos: [
      new PlanoPrecoDto({ id: 'preco-003', planoId: 'plano-003', codigo: 'MENSAL', valor: 79.90, quantidadeMeses: 1, ativo: true }),
      new PlanoPrecoDto({ id: 'preco-004', planoId: 'plano-003', codigo: 'TRIMESTRAL', valor: 209.90, quantidadeMeses: 3, descontoPercentual: 15, ativo: true }),
      new PlanoPrecoDto({ id: 'preco-005', planoId: 'plano-003', codigo: 'ANUAL', valor: 719.90, quantidadeMeses: 12, descontoPercentual: 25, ativo: true }),
    ],
  }),
  new PlanoDto({
    id: 'plano-004',
    codigo: 'PRESENCA',
    nome: 'Presença',
    descricao: 'Plano premium com atendimento presencial',
    beneficios: ['Tudo do Essencial', 'Sessões presenciais', 'Avaliação física', 'Suporte prioritário'],
    diasDuracao: 30,
    diasTrial: 7,
    ativo: true,
    ordem: 3,
    precos: [
      new PlanoPrecoDto({ id: 'preco-006', planoId: 'plano-004', codigo: 'MENSAL', valor: 199.90, quantidadeMeses: 1, ativo: true }),
      new PlanoPrecoDto({ id: 'preco-007', planoId: 'plano-004', codigo: 'TRIMESTRAL', valor: 529.90, quantidadeMeses: 3, descontoPercentual: 15, ativo: true }),
    ],
  }),
]

export function PlanosView() {
  const [planos, setPlanos] = useState<PlanoDto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterAtivo, setFilterAtivo] = useState<string | null>(null)
  const [modalOpened, setModalOpened] = useState(false)
  const [editingPlano, setEditingPlano] = useState<PlanoDto | null>(null)
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)
  const [planoToDelete, setPlanoToDelete] = useState<PlanoDto | null>(null)

  const planoService = useInjection<PlanoService>(API_TYPE.PlanoService)

  useEffect(() => {
    loadPlanos()
  }, [])

  const loadPlanos = async () => {
    setLoading(true)
    try {
      if (USE_MOCK_DATA) {
        await new Promise((r) => setTimeout(r, 500))
        setPlanos(mockPlanos)
      } else {
        const page = await planoService.findAll(0, 100)
        setPlanos(page.content.map((p: unknown) => new PlanoDto(p as Partial<PlanoDto>)))
      }
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao carregar planos')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAtivo = async (plano: PlanoDto) => {
    try {
      if (plano.ativo) {
        await planoService.desativar(plano.id)
      } else {
        await planoService.ativar(plano.id)
      }
      await loadPlanos()
      ArchbaseNotifications.showSuccess('Sucesso', `Plano ${plano.ativo ? 'desativado' : 'ativado'} com sucesso`)
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao alterar status do plano')
    }
  }

  const handleOpenModal = (plano?: PlanoDto) => {
    setEditingPlano(plano || PlanoDto.newInstance())
    setModalOpened(true)
  }

  const handleSave = async () => {
    if (!editingPlano) return

    try {
      if (editingPlano.isNew) {
        await planoService.save(editingPlano)
        ArchbaseNotifications.showSuccess('Sucesso', 'Plano criado com sucesso')
      } else {
        await planoService.save(editingPlano)
        ArchbaseNotifications.showSuccess('Sucesso', 'Plano atualizado com sucesso')
      }
      setModalOpened(false)
      await loadPlanos()
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao salvar plano')
    }
  }

  const handleConfirmDelete = (plano: PlanoDto) => {
    setPlanoToDelete(plano)
    openDeleteModal()
  }

  const handleDelete = async () => {
    if (!planoToDelete) return

    try {
      if (!USE_MOCK_DATA) {
        await planoService.delete(planoToDelete.id)
      } else {
        setPlanos((prev) => prev.filter((p) => p.id !== planoToDelete.id))
      }
      ArchbaseNotifications.showSuccess('Sucesso', `Plano "${planoToDelete.nome}" excluído com sucesso`)
      closeDeleteModal()
      setPlanoToDelete(null)
      if (!USE_MOCK_DATA) {
        await loadPlanos()
      }
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao excluir plano')
    }
  }

  const filteredPlanos = planos.filter((plano) => {
    const matchesSearch =
      plano.nome.toLowerCase().includes(search.toLowerCase()) ||
      plano.codigo.toLowerCase().includes(search.toLowerCase())
    const matchesAtivo =
      filterAtivo === null || plano.ativo === (filterAtivo === 'true')
    return matchesSearch && matchesAtivo
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
        <Title order={2}>Planos</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
          Novo Plano
        </Button>
      </Group>

      <Paper shadow="0" withBorder p="md">
        <Group gap="md" mb="md">
          <TextInput
            placeholder="Buscar por nome ou código..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Status"
            clearable
            data={[
              { value: 'true', label: 'Ativos' },
              { value: 'false', label: 'Inativos' },
            ]}
            value={filterAtivo}
            onChange={setFilterAtivo}
            w={150}
          />
        </Group>

        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Código</Table.Th>
                <Table.Th>Nome</Table.Th>
                <Table.Th>Descrição</Table.Th>
                <Table.Th>Trial</Table.Th>
                <Table.Th>Preços</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th w={120}>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredPlanos.map((plano) => (
                <Table.Tr key={plano.id}>
                  <Table.Td>
                    <Text fw={500}>{plano.codigo}</Text>
                  </Table.Td>
                  <Table.Td>{plano.nome}</Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed" lineClamp={1}>
                      {plano.descricao}
                    </Text>
                  </Table.Td>
                  <Table.Td>{plano.diasTrial} dias</Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      {plano.precos?.map((preco) => (
                        <Badge key={preco.id} size="sm" variant="light">
                          {preco.codigo}: <NumberFormatter value={preco.valor} prefix="R$ " decimalScale={2} />
                        </Badge>
                      ))}
                      {(!plano.precos || plano.precos.length === 0) && (
                        <Text size="sm" c="dimmed">Gratuito</Text>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={plano.ativo ? 'green' : 'gray'}>
                      {plano.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <Tooltip label="Editar">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleOpenModal(plano)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={plano.ativo ? 'Desativar' : 'Ativar'}>
                        <ActionIcon
                          variant="light"
                          color={plano.ativo ? 'orange' : 'green'}
                          onClick={() => handleToggleAtivo(plano)}
                        >
                          {plano.ativo ? <IconX size={16} /> : <IconCheck size={16} />}
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Excluir">
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleConfirmDelete(plano)}
                        >
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

        {filteredPlanos.length === 0 && (
          <Center py="xl">
            <Text c="dimmed">Nenhum plano encontrado</Text>
          </Center>
        )}
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={editingPlano?.isNew ? 'Novo Plano' : 'Editar Plano'}
        size="lg"
      >
        {editingPlano && (
          <Stack gap="md">
            <Group grow>
              <TextInput
                label="Código"
                placeholder="CODIGO_PLANO"
                value={editingPlano.codigo}
                onChange={(e) => setEditingPlano({ ...editingPlano, codigo: e.target.value })}
                required
              />
              <TextInput
                label="Nome"
                placeholder="Nome do plano"
                value={editingPlano.nome}
                onChange={(e) => setEditingPlano({ ...editingPlano, nome: e.target.value })}
                required
              />
            </Group>
            <Textarea
              label="Descrição"
              placeholder="Descrição do plano"
              value={editingPlano.descricao || ''}
              onChange={(e) => setEditingPlano({ ...editingPlano, descricao: e.target.value })}
              rows={3}
            />
            <Group grow>
              <NumberInput
                label="Dias de Trial"
                value={editingPlano.diasTrial}
                onChange={(val) => setEditingPlano({ ...editingPlano, diasTrial: Number(val) || 7 })}
                min={0}
              />
              <NumberInput
                label="Ordem de Exibição"
                value={editingPlano.ordem}
                onChange={(val) => setEditingPlano({ ...editingPlano, ordem: Number(val) || 0 })}
                min={0}
              />
            </Group>
            <Switch
              label="Plano Ativo"
              checked={editingPlano.ativo}
              onChange={(e) => setEditingPlano({ ...editingPlano, ativo: e.currentTarget.checked })}
            />
            <Divider label="Benefícios" />
            <Textarea
              label="Benefícios (um por linha)"
              placeholder="Digite os benefícios..."
              value={editingPlano.beneficios?.join('\n') || ''}
              onChange={(e) =>
                setEditingPlano({
                  ...editingPlano,
                  beneficios: e.target.value.split('\n').filter((b) => b.trim()),
                })
              }
              rows={4}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setModalOpened(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </Group>
          </Stack>
        )}
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
            Tem certeza que deseja excluir o plano{' '}
            <Text span fw={600}>"{planoToDelete?.nome}"</Text>?
          </Text>

          {planoToDelete && planoToDelete.precos && planoToDelete.precos.length > 0 && (
            <Paper withBorder p="sm" bg="orange.0">
              <Text size="sm" c="orange.8">
                Este plano possui {planoToDelete.precos.length} preço(s) cadastrado(s).
                Todos serão removidos junto com o plano.
              </Text>
            </Paper>
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
