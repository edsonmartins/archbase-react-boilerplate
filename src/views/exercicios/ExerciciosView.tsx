/**
 * ExerciciosView - Gestao de Exercicios
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
  Image,
  Paper,
  Table,
  Title,
  Loader,
  Center,
  Button,
  Modal,
  AspectRatio,
  Box,
  ScrollArea,
} from '@mantine/core'
import { IconEdit, IconTrash, IconPlus, IconVideo, IconEye } from '@tabler/icons-react'
import { ArchbaseNotifications, ArchbaseDialog } from '@archbase/components'
import { useInjection } from 'inversify-react'
import { useNavigate } from 'react-router-dom'

import { ExercicioDto } from '../../domain/exercicio/ExercicioDto'
import { ExercicioService } from '../../services/ExercicioService'
import { API_TYPE } from '../../ioc/IOCTypes'
import { EXERCICIO_NOVO_ROUTE, EXERCICIO_EDITAR_ROUTE, EXERCICIO_FICHA_ROUTE } from '../../navigation/navigationDataConstants'

// ============================================
// MOCK DATA - Desativar após validação
// ============================================
const USE_MOCK_DATA = true

const mockExercicios: ExercicioDto[] = [
  new ExercicioDto({
    id: 'ex-001',
    nome: 'Agachamento Livre',
    descricao: 'Agachamento com peso corporal',
    categoria: 'Força',
    nivel: 'INICIANTE',
    padraoMovimento: 'AGACHAMENTO',
    stepPadrao: 1,
    equipamento: 'NENHUM',
    duracaoSegundos: 45,
    repeticoes: 12,
    series: 3,
    videoUrl: 'https://example.com/video1',
    ativo: true,
  }),
  new ExercicioDto({
    id: 'ex-002',
    nome: 'Agachamento com Halteres',
    descricao: 'Agachamento segurando halteres',
    categoria: 'Força',
    nivel: 'INTERMEDIARIO',
    padraoMovimento: 'AGACHAMENTO',
    stepPadrao: 3,
    equipamento: 'HALTERES',
    duracaoSegundos: 60,
    repeticoes: 10,
    series: 4,
    videoUrl: 'https://example.com/video2',
    ativo: true,
  }),
  new ExercicioDto({
    id: 'ex-003',
    nome: 'Levantamento Terra Romeno',
    descricao: 'Hinge com foco em posteriores',
    categoria: 'Força',
    nivel: 'INTERMEDIARIO',
    padraoMovimento: 'HINGE',
    stepPadrao: 4,
    equipamento: 'HALTERES',
    duracaoSegundos: 50,
    repeticoes: 10,
    series: 3,
    videoUrl: 'https://example.com/video3',
    ativo: true,
  }),
  new ExercicioDto({
    id: 'ex-004',
    nome: 'Flexão de Braços',
    descricao: 'Flexão tradicional no solo',
    categoria: 'Força',
    nivel: 'INICIANTE',
    padraoMovimento: 'EMPURRAR',
    stepPadrao: 2,
    equipamento: 'COLCHONETE',
    duracaoSegundos: 40,
    repeticoes: 8,
    series: 3,
    videoUrl: 'https://example.com/video4',
    ativo: true,
  }),
  new ExercicioDto({
    id: 'ex-005',
    nome: 'Remada com Elástico',
    descricao: 'Remada unilateral com elástico',
    categoria: 'Força',
    nivel: 'INICIANTE',
    padraoMovimento: 'PUXAR',
    stepPadrao: 1,
    equipamento: 'ELASTICO',
    duracaoSegundos: 45,
    repeticoes: 12,
    series: 3,
    videoUrl: 'https://example.com/video5',
    ativo: true,
  }),
  new ExercicioDto({
    id: 'ex-006',
    nome: 'Prancha Isométrica',
    descricao: 'Prancha frontal com apoio nos antebraços',
    categoria: 'Core',
    nivel: 'INICIANTE',
    padraoMovimento: 'CORE',
    stepPadrao: 1,
    equipamento: 'COLCHONETE',
    duracaoSegundos: 30,
    ativo: true,
  }),
  new ExercicioDto({
    id: 'ex-007',
    nome: 'Bird Dog',
    descricao: 'Extensão alternada de braço e perna',
    categoria: 'Core',
    nivel: 'INICIANTE',
    padraoMovimento: 'CORE',
    stepPadrao: 2,
    equipamento: 'COLCHONETE',
    duracaoSegundos: 40,
    repeticoes: 10,
    series: 2,
    ativo: true,
  }),
  new ExercicioDto({
    id: 'ex-008',
    nome: 'Liberação Miofascial - Quadríceps',
    descricao: 'Liberação com foam roller',
    categoria: 'Mobilidade',
    nivel: 'TODOS',
    padraoMovimento: 'MOBILIDADE',
    stepPadrao: 1,
    equipamento: 'COLCHONETE',
    duracaoSegundos: 60,
    ativo: true,
  }),
  new ExercicioDto({
    id: 'ex-009',
    nome: 'Afundo Búlgaro',
    descricao: 'Afundo com pé posterior elevado',
    categoria: 'Força',
    nivel: 'AVANCADO',
    padraoMovimento: 'AGACHAMENTO',
    stepPadrao: 7,
    equipamento: 'BANCO',
    duracaoSegundos: 60,
    repeticoes: 8,
    series: 4,
    videoUrl: 'https://example.com/video9',
    ativo: true,
  }),
  new ExercicioDto({
    id: 'ex-010',
    nome: 'Dead Bug',
    descricao: 'Estabilização de core em decúbito dorsal',
    categoria: 'Core',
    nivel: 'INICIANTE',
    padraoMovimento: 'CORE',
    stepPadrao: 2,
    equipamento: 'COLCHONETE',
    duracaoSegundos: 45,
    repeticoes: 12,
    series: 2,
    ativo: false,
  }),
]

export function ExerciciosView() {
  const navigate = useNavigate()
  const exercicioService = useInjection<ExercicioService>(API_TYPE.ExercicioService)

  const [loading, setLoading] = useState(true)
  const [exercicios, setExercicios] = useState<ExercicioDto[]>([])
  const [nivelFilter, setNivelFilter] = useState<string | null>(null)

  // Video modal state
  const [videoModalOpened, setVideoModalOpened] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; nome: string } | null>(null)

  useEffect(() => {
    loadExercicios()
  }, [])

  const loadExercicios = async () => {
    try {
      setLoading(true)
      if (USE_MOCK_DATA) {
        // Simula delay de rede
        await new Promise(resolve => setTimeout(resolve, 500))
        setExercicios(mockExercicios)
      } else {
        const response = await exercicioService.findAll(0, 50)
        setExercicios(response.content || [])
      }
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível carregar os exercícios')
    } finally {
      setLoading(false)
    }
  }

  const handleNew = () => {
    navigate(`${EXERCICIO_NOVO_ROUTE}?action=add`)
  }

  const handleView = (exercicio: ExercicioDto) => {
    navigate(EXERCICIO_FICHA_ROUTE.replace(':id', exercicio.id))
  }

  const handleOpenVideo = (exercicio: ExercicioDto) => {
    if (exercicio.videoUrl) {
      setSelectedVideo({ url: exercicio.videoUrl, nome: exercicio.nome })
      setVideoModalOpened(true)
    }
  }

  const handleCloseVideo = () => {
    setVideoModalOpened(false)
    setSelectedVideo(null)
  }

  const handleEdit = (exercicio: ExercicioDto) => {
    navigate(`${EXERCICIO_EDITAR_ROUTE.replace(':id', exercicio.id)}?action=edit`)
  }

  const handleDelete = (exercicio: ExercicioDto) => {
    ArchbaseDialog.showConfirmDialogYesNo(
      'Confirme',
      `Deseja remover o exercício "${exercicio.nome}"?`,
      async () => {
        try {
          await exercicioService.delete(exercicio.id)
          ArchbaseNotifications.showSuccess('Sucesso', 'Exercício removido')
          loadExercicios()
        } catch (err) {
          ArchbaseNotifications.showError('Erro', 'Não foi possível remover o exercício')
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

  const filteredExercicios = exercicios.filter((exercicio) => {
    return !nivelFilter || exercicio.nivel === nivelFilter
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
        <Title order={2}>Exercicios</Title>
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
            Novo Exercicio
          </Button>
        </Group>
      </Group>

      <Paper withBorder>
        <ScrollArea h="calc(100vh - 220px)" offsetScrollbars>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Exercicio</Table.Th>
                <Table.Th>Nivel</Table.Th>
                <Table.Th>Duracao</Table.Th>
                <Table.Th>Repeticoes</Table.Th>
                <Table.Th>Video</Table.Th>
                <Table.Th>Ativo</Table.Th>
                <Table.Th>Acoes</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredExercicios.map((exercicio) => (
                <Table.Tr key={exercicio.id}>
                  <Table.Td>
                    <Group gap="sm">
                      {exercicio.imagemUrl ? (
                        <Image src={exercicio.imagemUrl} w={40} h={40} radius="sm" fit="cover" />
                      ) : (
                        <div style={{ width: 40, height: 40, backgroundColor: '#f0f0f0', borderRadius: 4 }} />
                      )}
                      <Stack gap={0}>
                        <Text size="sm" fw={500}>{exercicio.nome}</Text>
                        <Text size="xs" c="dimmed">{exercicio.categoria}</Text>
                      </Stack>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <NivelBadge nivel={exercicio.nivel} />
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {exercicio.duracaoSegundos
                        ? `${Math.floor(exercicio.duracaoSegundos / 60)}:${String(exercicio.duracaoSegundos % 60).padStart(2, '0')}`
                        : '-'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {exercicio.repeticoes ? `${exercicio.repeticoes}x` : ''}
                      {exercicio.series ? ` (${exercicio.series} séries)` : ''}
                      {!exercicio.repeticoes && !exercicio.series ? '-' : ''}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {exercicio.videoUrl ? (
                      <Tooltip label="Ver vídeo">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => handleOpenVideo(exercicio)}
                        >
                          <IconVideo size={16} />
                        </ActionIcon>
                      </Tooltip>
                    ) : (
                      <Text size="xs" c="dimmed">-</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Switch checked={exercicio.ativo} readOnly size="sm" />
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Visualizar">
                        <ActionIcon variant="subtle" color="blue" onClick={() => handleView(exercicio)}>
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Editar">
                        <ActionIcon variant="subtle" color="yellow" onClick={() => handleEdit(exercicio)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Remover">
                        <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(exercicio)}>
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

      {/* Video Modal */}
      <Modal
        opened={videoModalOpened}
        onClose={handleCloseVideo}
        title={selectedVideo?.nome || 'Vídeo do Exercício'}
        size="lg"
        centered
      >
        {selectedVideo && (
          <Box>
            <AspectRatio ratio={16 / 9}>
              {selectedVideo.url.includes('youtube') || selectedVideo.url.includes('youtu.be') ? (
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo.url)}
                  title={selectedVideo.nome}
                  style={{ border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : selectedVideo.url.includes('vimeo') ? (
                <iframe
                  src={getVimeoEmbedUrl(selectedVideo.url)}
                  title={selectedVideo.nome}
                  style={{ border: 0 }}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={selectedVideo.url}
                  controls
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                >
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              )}
            </AspectRatio>
            <Group justify="flex-end" mt="md">
              <Button
                variant="light"
                component="a"
                href={selectedVideo.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir em Nova Aba
              </Button>
            </Group>
          </Box>
        )}
      </Modal>
    </Stack>
  )
}

// Helper functions for video embeds
function getYouTubeEmbedUrl(url: string): string {
  const videoId = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/)?.[1]
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url
}

function getVimeoEmbedUrl(url: string): string {
  const videoId = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1]
  return videoId ? `https://player.vimeo.com/video/${videoId}` : url
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
