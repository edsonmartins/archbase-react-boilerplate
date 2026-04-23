/**
 * GatewaysView - Configuração de Gateways de Pagamento do BlueVix
 */
import { useState, useEffect } from 'react'
import {
  Badge,
  Group,
  Text,
  ActionIcon,
  Tooltip,
  Stack,
  Paper,
  Table,
  Loader,
  Center,
  Title,
  Button,
  Modal,
  TextInput,
  Switch,
  Select,
  Card,
  ThemeIcon,
} from '@mantine/core'
import {
  IconPlus,
  IconEdit,
  IconCheck,
  IconStar,
  IconCreditCard,
  IconTrash,
  IconPlayerPause,
} from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { ArchbaseNotifications } from '@archbase/components'
import { useInjection } from 'inversify-react'

import { GatewayConfigDto, GatewayPagamento } from '../../domain/financeiro/FinanceiroDto'
import { GatewayConfigService } from '../../services/FinanceiroService'
import { API_TYPE } from '../../ioc/IOCTypes'

// ============================================
// MOCK DATA
// ============================================
const USE_MOCK_DATA = true

const mockGateways: GatewayConfigDto[] = [
  new GatewayConfigDto({
    id: 'gw-001',
    gateway: 'STRIPE',
    sandbox: false,
    ativo: true,
    padrao: true,
  }),
  new GatewayConfigDto({
    id: 'gw-002',
    gateway: 'MERCADO_PAGO',
    sandbox: true,
    ativo: true,
    padrao: false,
  }),
  new GatewayConfigDto({
    id: 'gw-003',
    gateway: 'PAGSEGURO',
    sandbox: true,
    ativo: false,
    padrao: false,
  }),
]

const gatewayLabels: Record<GatewayPagamento, string> = {
  STRIPE: 'Stripe',
  MERCADO_PAGO: 'Mercado Pago',
  PAGSEGURO: 'PagSeguro',
}

const gatewayDescriptions: Record<GatewayPagamento, string> = {
  STRIPE: 'Gateway internacional com suporte a cartões e PIX',
  MERCADO_PAGO: 'Gateway brasileiro com forte integração PIX',
  PAGSEGURO: 'Gateway brasileiro tradicional',
}

export function GatewaysView() {
  const [gateways, setGateways] = useState<GatewayConfigDto[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpened, setModalOpened] = useState(false)
  const [editingGateway, setEditingGateway] = useState<GatewayConfigDto | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)
  const [gatewayToDelete, setGatewayToDelete] = useState<GatewayConfigDto | null>(null)
  const [toggleModalOpened, { open: openToggleModal, close: closeToggleModal }] = useDisclosure(false)
  const [gatewayToToggle, setGatewayToToggle] = useState<GatewayConfigDto | null>(null)

  const gatewayConfigService = useInjection<GatewayConfigService>(API_TYPE.GatewayConfigService)

  useEffect(() => {
    loadGateways()
  }, [])

  const loadGateways = async () => {
    setLoading(true)
    try {
      if (USE_MOCK_DATA) {
        await new Promise((r) => setTimeout(r, 500))
        setGateways(mockGateways)
      } else {
        const list = await gatewayConfigService.findAll(0, 100)
        setGateways(list.content.map((g: unknown) => new GatewayConfigDto(g as Partial<GatewayConfigDto>)))
      }
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao carregar gateways')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (gateway?: GatewayConfigDto) => {
    setEditingGateway(gateway || GatewayConfigDto.newInstance())
    setApiKey('')
    setApiSecret('')
    setWebhookSecret('')
    setModalOpened(true)
  }

  const handleSave = async () => {
    if (!editingGateway) return

    try {
      const data = {
        ...editingGateway,
        apiKey: apiKey || undefined,
        apiSecret: apiSecret || undefined,
        webhookSecret: webhookSecret || undefined,
      }
      await gatewayConfigService.save(data as GatewayConfigDto)
      setModalOpened(false)
      await loadGateways()
      ArchbaseNotifications.showSuccess('Sucesso', 'Gateway salvo com sucesso')
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao salvar gateway')
    }
  }

  const handleConfirmToggle = (gateway: GatewayConfigDto) => {
    setGatewayToToggle(gateway)
    openToggleModal()
  }

  const handleToggleAtivo = async () => {
    if (!gatewayToToggle) return

    try {
      if (gatewayToToggle.ativo) {
        if (!USE_MOCK_DATA) {
          await gatewayConfigService.desativar(gatewayToToggle.id)
        } else {
          setGateways((prev) =>
            prev.map((g) => (g.id === gatewayToToggle.id ? { ...g, ativo: false } : g))
          )
        }
      } else {
        if (!USE_MOCK_DATA) {
          await gatewayConfigService.ativar(gatewayToToggle.id)
        } else {
          setGateways((prev) =>
            prev.map((g) => (g.id === gatewayToToggle.id ? { ...g, ativo: true } : g))
          )
        }
      }
      ArchbaseNotifications.showSuccess('Sucesso', `Gateway ${gatewayToToggle.ativo ? 'desativado' : 'ativado'} com sucesso`)
      closeToggleModal()
      setGatewayToToggle(null)
      if (!USE_MOCK_DATA) {
        await loadGateways()
      }
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao alterar status do gateway')
    }
  }

  const handleDefinirPadrao = async (gateway: GatewayConfigDto) => {
    try {
      await gatewayConfigService.definirComoPadrao(gateway.id)
      await loadGateways()
      ArchbaseNotifications.showSuccess('Sucesso', 'Gateway definido como padrão')
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao definir gateway como padrão')
    }
  }

  const handleConfirmDelete = (gateway: GatewayConfigDto) => {
    setGatewayToDelete(gateway)
    openDeleteModal()
  }

  const handleDelete = async () => {
    if (!gatewayToDelete) return

    try {
      if (!USE_MOCK_DATA) {
        await gatewayConfigService.delete(gatewayToDelete.id)
      } else {
        setGateways((prev) => prev.filter((g) => g.id !== gatewayToDelete.id))
      }
      ArchbaseNotifications.showSuccess('Sucesso', `Gateway "${gatewayLabels[gatewayToDelete.gateway]}" excluído com sucesso`)
      closeDeleteModal()
      setGatewayToDelete(null)
      if (!USE_MOCK_DATA) {
        await loadGateways()
      }
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao excluir gateway')
    }
  }

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
        <Title order={2}>Gateways de Pagamento</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
          Novo Gateway
        </Button>
      </Group>

      <Group grow align="stretch">
        {gateways.map((gateway) => (
          <Card key={gateway.id} shadow="0" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Group>
                  <ThemeIcon size="lg" variant="light" color="blue">
                    <IconCreditCard size={20} />
                  </ThemeIcon>
                  <div>
                    <Text fw={500}>{gatewayLabels[gateway.gateway]}</Text>
                    <Text size="xs" c="dimmed">
                      {gatewayDescriptions[gateway.gateway]}
                    </Text>
                  </div>
                </Group>
                {gateway.padrao && (
                  <Badge leftSection={<IconStar size={12} />} color="yellow">
                    Padrão
                  </Badge>
                )}
              </Group>

              <Group>
                <Badge color={gateway.ativo ? 'green' : 'gray'}>
                  {gateway.ativo ? 'Ativo' : 'Inativo'}
                </Badge>
                <Badge color={gateway.sandbox ? 'orange' : 'blue'} variant="outline">
                  {gateway.sandbox ? 'Sandbox' : 'Produção'}
                </Badge>
              </Group>

              <Group justify="flex-end" mt="md">
                <Tooltip label="Editar">
                  <ActionIcon variant="light" color="blue" onClick={() => handleOpenModal(gateway)}>
                    <IconEdit size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label={gateway.ativo ? 'Desativar' : 'Ativar'}>
                  <ActionIcon
                    variant="light"
                    color={gateway.ativo ? 'orange' : 'green'}
                    onClick={() => handleConfirmToggle(gateway)}
                  >
                    {gateway.ativo ? <IconPlayerPause size={16} /> : <IconCheck size={16} />}
                  </ActionIcon>
                </Tooltip>
                {!gateway.padrao && gateway.ativo && (
                  <Tooltip label="Definir como Padrão">
                    <ActionIcon variant="light" color="yellow" onClick={() => handleDefinirPadrao(gateway)}>
                      <IconStar size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
                <Tooltip label="Excluir">
                  <ActionIcon variant="light" color="red" onClick={() => handleConfirmDelete(gateway)}>
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Stack>
          </Card>
        ))}
      </Group>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={editingGateway?.isNew ? 'Novo Gateway' : 'Editar Gateway'}
      >
        {editingGateway && (
          <Stack gap="md">
            <Select
              label="Gateway"
              data={[
                { value: 'STRIPE', label: 'Stripe' },
                { value: 'MERCADO_PAGO', label: 'Mercado Pago' },
                { value: 'PAGSEGURO', label: 'PagSeguro' },
              ]}
              value={editingGateway.gateway}
              onChange={(val) =>
                setEditingGateway({ ...editingGateway, gateway: val as GatewayPagamento })
              }
              disabled={!editingGateway.isNew}
              required
            />
            <TextInput
              label="API Key"
              placeholder="sk_live_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              description="Deixe em branco para manter a chave atual"
            />
            <TextInput
              label="API Secret"
              placeholder="Secret key..."
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              description="Deixe em branco para manter a chave atual"
              type="password"
            />
            <TextInput
              label="Webhook Secret"
              placeholder="whsec_..."
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              description="Para validação de webhooks"
            />
            <Group>
              <Switch
                label="Modo Sandbox"
                checked={editingGateway.sandbox}
                onChange={(e) =>
                  setEditingGateway({ ...editingGateway, sandbox: e.currentTarget.checked })
                }
              />
              <Switch
                label="Ativo"
                checked={editingGateway.ativo}
                onChange={(e) =>
                  setEditingGateway({ ...editingGateway, ativo: e.currentTarget.checked })
                }
              />
            </Group>
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setModalOpened(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Modal de Confirmação de Ativar/Desativar */}
      <Modal
        opened={toggleModalOpened}
        onClose={closeToggleModal}
        title={gatewayToToggle?.ativo ? 'Confirmar Desativação' : 'Confirmar Ativação'}
        size="md"
      >
        <Stack gap="md">
          <Text>
            Tem certeza que deseja {gatewayToToggle?.ativo ? 'desativar' : 'ativar'} o gateway{' '}
            <Text span fw={600}>"{gatewayToToggle ? gatewayLabels[gatewayToToggle.gateway] : ''}"</Text>?
          </Text>

          {gatewayToToggle?.ativo && gatewayToToggle?.padrao && (
            <Paper withBorder p="sm" bg="orange.0">
              <Text size="sm" c="orange.8">
                Este é o gateway padrão. Desativá-lo pode afetar novos pagamentos.
              </Text>
            </Paper>
          )}

          {gatewayToToggle?.ativo && !gatewayToToggle?.sandbox && (
            <Paper withBorder p="sm" bg="red.0">
              <Text size="sm" c="red.8">
                Este gateway está em modo produção. A desativação pode afetar pagamentos em andamento.
              </Text>
            </Paper>
          )}

          <Group justify="flex-end">
            <Button variant="default" onClick={closeToggleModal}>
              Cancelar
            </Button>
            <Button color={gatewayToToggle?.ativo ? 'orange' : 'green'} onClick={handleToggleAtivo}>
              {gatewayToToggle?.ativo ? 'Desativar' : 'Ativar'}
            </Button>
          </Group>
        </Stack>
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
            Tem certeza que deseja excluir o gateway{' '}
            <Text span fw={600}>"{gatewayToDelete ? gatewayLabels[gatewayToDelete.gateway] : ''}"</Text>?
          </Text>

          {gatewayToDelete && gatewayToDelete.padrao && (
            <Paper withBorder p="sm" bg="orange.0">
              <Text size="sm" c="orange.8">
                Este é o gateway padrão. Será necessário definir outro gateway como padrão após a exclusão.
              </Text>
            </Paper>
          )}

          {gatewayToDelete && !gatewayToDelete.sandbox && (
            <Paper withBorder p="sm" bg="red.0">
              <Text size="sm" c="red.8">
                Este gateway está em modo produção. A exclusão pode afetar pagamentos em andamento.
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
