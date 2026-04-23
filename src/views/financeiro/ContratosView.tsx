/**
 * ContratosView - Gestão de Contratos do BlueVix
 */
import { useState, useEffect } from 'react'
import {
  Badge,
  Group,
  Text,
  TextInput,
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
  Switch,
} from '@mantine/core'
import {
  IconSearch,
  IconEdit,
  IconEye,
  IconPlus,
  IconFileText,
  IconUpload,
  IconTrash,
} from '@tabler/icons-react'
import { useDisclosure } from '@mantine/hooks'
import { ArchbaseNotifications } from '@archbase/components'
import { useInjection } from 'inversify-react'

import { ContratoDto } from '../../domain/financeiro/FinanceiroDto'
import { ContratoService } from '../../services/FinanceiroService'
import { API_TYPE } from '../../ioc/IOCTypes'

// ============================================
// MOCK DATA
// ============================================
const USE_MOCK_DATA = true

const mockContratos: ContratoDto[] = [
  new ContratoDto({
    id: 'contrato-001',
    codigo: 'TERMOS_USO',
    titulo: 'Termos de Uso',
    conteudo: '# Termos de Uso\n\nEste documento estabelece os termos e condições para uso da plataforma BlueVix...',
    versao: 3,
    obrigatorioAceite: true,
    ativo: true,
    dataPublicacao: '2024-01-15',
  }),
  new ContratoDto({
    id: 'contrato-002',
    codigo: 'POLITICA_PRIVACIDADE',
    titulo: 'Política de Privacidade',
    conteudo: '# Política de Privacidade\n\nEsta política descreve como coletamos e utilizamos seus dados...',
    versao: 2,
    obrigatorioAceite: true,
    ativo: true,
    dataPublicacao: '2024-01-15',
  }),
  new ContratoDto({
    id: 'contrato-003',
    codigo: 'CONTRATO_ASSINATURA',
    titulo: 'Contrato de Assinatura',
    conteudo: '# Contrato de Assinatura\n\nAo assinar um plano BlueVix, você concorda com os seguintes termos...',
    versao: 1,
    obrigatorioAceite: true,
    ativo: true,
    dataPublicacao: '2024-02-01',
  }),
  new ContratoDto({
    id: 'contrato-004',
    codigo: 'TERMO_RESPONSABILIDADE',
    titulo: 'Termo de Responsabilidade',
    conteudo: '# Termo de Responsabilidade\n\nO aluno declara estar apto a realizar atividades físicas...',
    versao: 1,
    obrigatorioAceite: false,
    ativo: true,
    dataPublicacao: '2024-01-20',
  }),
]

export function ContratosView() {
  const [contratos, setContratos] = useState<ContratoDto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpened, setModalOpened] = useState(false)
  const [viewModalOpened, setViewModalOpened] = useState(false)
  const [editingContrato, setEditingContrato] = useState<ContratoDto | null>(null)
  const [viewingContrato, setViewingContrato] = useState<ContratoDto | null>(null)
  const [newVersionContent, setNewVersionContent] = useState('')
  const [publishModalOpened, setPublishModalOpened] = useState(false)
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false)
  const [contratoToDelete, setContratoToDelete] = useState<ContratoDto | null>(null)

  const contratoService = useInjection<ContratoService>(API_TYPE.ContratoService)

  useEffect(() => {
    loadContratos()
  }, [])

  const loadContratos = async () => {
    setLoading(true)
    try {
      if (USE_MOCK_DATA) {
        await new Promise((r) => setTimeout(r, 500))
        setContratos(mockContratos)
      } else {
        const page = await contratoService.findAll(0, 100)
        setContratos(page.content.map((c: unknown) => new ContratoDto(c as Partial<ContratoDto>)))
      }
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao carregar contratos')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (contrato?: ContratoDto) => {
    setEditingContrato(contrato || ContratoDto.newInstance())
    setModalOpened(true)
  }

  const handleViewContrato = (contrato: ContratoDto) => {
    setViewingContrato(contrato)
    setViewModalOpened(true)
  }

  const handleOpenPublishModal = (contrato: ContratoDto) => {
    setEditingContrato(contrato)
    setNewVersionContent(contrato.conteudo)
    setPublishModalOpened(true)
  }

  const handleSave = async () => {
    if (!editingContrato) return

    try {
      await contratoService.save(editingContrato)
      setModalOpened(false)
      await loadContratos()
      ArchbaseNotifications.showSuccess('Sucesso', 'Contrato salvo com sucesso')
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao salvar contrato')
    }
  }

  const handlePublishNewVersion = async () => {
    if (!editingContrato) return

    try {
      await contratoService.publicarNovaVersao(editingContrato.id, newVersionContent)
      setPublishModalOpened(false)
      await loadContratos()
      ArchbaseNotifications.showSuccess('Sucesso', 'Nova versão publicada')
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao publicar nova versão')
    }
  }

  const handleConfirmDelete = (contrato: ContratoDto) => {
    setContratoToDelete(contrato)
    openDeleteModal()
  }

  const handleDelete = async () => {
    if (!contratoToDelete) return

    try {
      if (!USE_MOCK_DATA) {
        await contratoService.delete(contratoToDelete.id)
      } else {
        setContratos((prev) => prev.filter((c) => c.id !== contratoToDelete.id))
      }
      ArchbaseNotifications.showSuccess('Sucesso', `Contrato "${contratoToDelete.titulo}" excluído com sucesso`)
      closeDeleteModal()
      setContratoToDelete(null)
      if (!USE_MOCK_DATA) {
        await loadContratos()
      }
    } catch (error) {
      ArchbaseNotifications.showError('Erro', 'Erro ao excluir contrato')
    }
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const filteredContratos = contratos.filter((contrato) => {
    return (
      contrato.titulo.toLowerCase().includes(search.toLowerCase()) ||
      contrato.codigo.toLowerCase().includes(search.toLowerCase())
    )
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
        <Title order={2}>Contratos</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => handleOpenModal()}>
          Novo Contrato
        </Button>
      </Group>

      <Paper shadow="0" withBorder p="md">
        <Group gap="md" mb="md">
          <TextInput
            placeholder="Buscar por título ou código..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
        </Group>

        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Código</Table.Th>
                <Table.Th>Título</Table.Th>
                <Table.Th>Versão</Table.Th>
                <Table.Th>Obrigatório</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Publicação</Table.Th>
                <Table.Th w={150}>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredContratos.map((contrato) => (
                <Table.Tr key={contrato.id}>
                  <Table.Td>
                    <Group gap={4}>
                      <IconFileText size={16} />
                      <Text fw={500} size="sm">{contrato.codigo}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{contrato.titulo}</Table.Td>
                  <Table.Td>
                    <Badge variant="light">v{contrato.versao}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={contrato.obrigatorioAceite ? 'red' : 'gray'}>
                      {contrato.obrigatorioAceite ? 'Sim' : 'Não'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={contrato.ativo ? 'green' : 'gray'}>
                      {contrato.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{formatDate(contrato.dataPublicacao)}</Table.Td>
                  <Table.Td>
                    <Group gap={4}>
                      <Tooltip label="Visualizar">
                        <ActionIcon
                          variant="light"
                          color="gray"
                          onClick={() => handleViewContrato(contrato)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Editar">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => handleOpenModal(contrato)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Publicar Nova Versão">
                        <ActionIcon
                          variant="light"
                          color="green"
                          onClick={() => handleOpenPublishModal(contrato)}
                        >
                          <IconUpload size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Excluir">
                        <ActionIcon
                          variant="light"
                          color="red"
                          onClick={() => handleConfirmDelete(contrato)}
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

        {filteredContratos.length === 0 && (
          <Center py="xl">
            <Text c="dimmed">Nenhum contrato encontrado</Text>
          </Center>
        )}
      </Paper>

      {/* Modal de Edição */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={editingContrato?.isNew ? 'Novo Contrato' : 'Editar Contrato'}
        size="xl"
      >
        {editingContrato && (
          <Stack gap="md">
            <Group grow>
              <TextInput
                label="Código"
                placeholder="CODIGO_CONTRATO"
                value={editingContrato.codigo}
                onChange={(e) => setEditingContrato({ ...editingContrato, codigo: e.target.value })}
                required
              />
              <TextInput
                label="Título"
                placeholder="Título do contrato"
                value={editingContrato.titulo}
                onChange={(e) => setEditingContrato({ ...editingContrato, titulo: e.target.value })}
                required
              />
            </Group>
            <Textarea
              label="Conteúdo (Markdown)"
              placeholder="Conteúdo do contrato..."
              value={editingContrato.conteudo}
              onChange={(e) => setEditingContrato({ ...editingContrato, conteudo: e.target.value })}
              rows={15}
              required
            />
            <Group>
              <Switch
                label="Aceite Obrigatório"
                checked={editingContrato.obrigatorioAceite}
                onChange={(e) =>
                  setEditingContrato({ ...editingContrato, obrigatorioAceite: e.currentTarget.checked })
                }
              />
              <Switch
                label="Ativo"
                checked={editingContrato.ativo}
                onChange={(e) =>
                  setEditingContrato({ ...editingContrato, ativo: e.currentTarget.checked })
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

      {/* Modal de Visualização */}
      <Modal
        opened={viewModalOpened}
        onClose={() => setViewModalOpened(false)}
        title={viewingContrato?.titulo}
        size="xl"
      >
        {viewingContrato && (
          <Stack gap="md">
            <Group>
              <Badge>Versão {viewingContrato.versao}</Badge>
              <Badge color={viewingContrato.obrigatorioAceite ? 'red' : 'gray'}>
                {viewingContrato.obrigatorioAceite ? 'Aceite Obrigatório' : 'Aceite Opcional'}
              </Badge>
            </Group>
            <Paper p="md" bg="gray.0" style={{ whiteSpace: 'pre-wrap' }}>
              {viewingContrato.conteudo}
            </Paper>
            <Group justify="flex-end">
              <Button variant="light" onClick={() => setViewModalOpened(false)}>
                Fechar
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Modal de Publicar Nova Versão */}
      <Modal
        opened={publishModalOpened}
        onClose={() => setPublishModalOpened(false)}
        title="Publicar Nova Versão"
        size="xl"
      >
        {editingContrato && (
          <Stack gap="md">
            <Text>
              Publicando nova versão do contrato <strong>{editingContrato.titulo}</strong>
            </Text>
            <Text size="sm" c="dimmed">
              Versão atual: v{editingContrato.versao} - Nova versão: v{editingContrato.versao + 1}
            </Text>
            <Textarea
              label="Novo Conteúdo"
              value={newVersionContent}
              onChange={(e) => setNewVersionContent(e.target.value)}
              rows={15}
              required
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={() => setPublishModalOpened(false)}>
                Cancelar
              </Button>
              <Button color="green" onClick={handlePublishNewVersion}>
                Publicar v{editingContrato.versao + 1}
              </Button>
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
            Tem certeza que deseja excluir o contrato{' '}
            <Text span fw={600}>"{contratoToDelete?.titulo}"</Text>?
          </Text>

          {contratoToDelete && contratoToDelete.obrigatorioAceite && (
            <Paper withBorder p="sm" bg="orange.0">
              <Text size="sm" c="orange.8">
                Este contrato possui aceite obrigatório. A exclusão pode afetar o fluxo de cadastro de novos usuários.
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
