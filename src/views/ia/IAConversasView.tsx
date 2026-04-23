/**
 * IAConversasView - Auditoria e Intervenção em Conversas com IA
 *
 * Layout: 3 painéis (Lista 25% | Chat 50% | Contexto 25%)
 * Features:
 * - Sidebar colapsa automaticamente ao abrir para ganhar espaço
 * - Botões de ação visíveis (Assumir/Devolver) ao invés de menu
 * - Suporte a anexos: imagens, documentos, áudio
 */
import { useState, useEffect, useRef, useCallback, useContext } from 'react'
import {
  Badge,
  Group,
  Text,
  Stack,
  Paper,
  Title,
  Loader,
  Center,
  Avatar,
  ScrollArea,
  ActionIcon,
  Tooltip,
  TextInput,
  Select,
  Grid,
  ThemeIcon,
  Button,
  Divider,
  Box,
  Textarea,
  Modal,
  Timeline,
  Indicator,
  FileButton,
  Image,
  Overlay,
  Progress,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconSearch,
  IconFlag,
  IconMessageCircle,
  IconUser,
  IconRobot,
  IconBrandWhatsapp,
  IconDeviceMobile,
  IconWorld,
  IconApi,
  IconSend,
  IconHandStop,
  IconArrowUp,
  IconX,
  IconRefresh,
  IconAlertTriangle,
  IconNote,
  IconPlus,
  IconTool,
  IconClock,
  IconMessage,
  IconUserCircle,
  IconCheck,
  IconPlayerPlay,
  IconPhoto,
  IconFile,
  IconMicrophone,
  IconMicrophoneOff,
  IconPaperclip,
  IconTrash,
  IconDownload,
} from '@tabler/icons-react'
import { ArchbaseNotifications } from '@archbase/components'
import { ArchbaseAdminLayoutContext, ArchbaseAdminLayoutContextValue } from '@archbase/admin'
import { useInjection } from 'inversify-react'

import {
  VixConversationDto,
  VixMessageDto,
  VixInternalNoteDto,
  ConversationStatus,
  ConversationChannel,
} from '../../domain/ia/VixConversationDto'
import { IAService } from '../../services/IAService'
import { API_TYPE } from '../../ioc/IOCTypes'
import { AppColors } from '../../theme/AppThemeLight'

// ============================================
// MOCK DATA - Desativar após validação da API
// ============================================
const USE_MOCK_DATA = true

const mockConversations: VixConversationDto[] = [
  new VixConversationDto({
    id: 'conv-001',
    alunoId: 'aluno-001',
    alunoNome: 'Maria Silva Santos',
    alunoEmail: 'maria.silva@email.com',
    channel: 'APP',
    status: 'ACTIVE',
    startedAt: '2024-04-20T08:30:00',
    lastMessageAt: '2024-04-20T09:15:00',
    messageCount: 12,
    alunoPlano: 'Premium',
    alunoStreak: 15,
    alunoNivel: 'Intermediário',
    tokensUsed: 2450,
    toolsUsed: ['consultar_humor', 'gerar_treino'],
    alertasRelacionados: 0,
  }),
  new VixConversationDto({
    id: 'conv-002',
    alunoId: 'aluno-002',
    alunoNome: 'Ana Costa Lima',
    alunoEmail: 'ana.costa@email.com',
    channel: 'WHATSAPP',
    status: 'ESCALATED',
    startedAt: '2024-04-20T10:00:00',
    lastMessageAt: '2024-04-20T10:45:00',
    messageCount: 8,
    alunoPlano: 'Basic',
    alunoStreak: 3,
    alunoNivel: 'Iniciante',
    tokensUsed: 1890,
    toolsUsed: ['consultar_humor'],
    alertasRelacionados: 1,
    escalationReason: 'Mencionou sentimentos de tristeza persistente',
  }),
  new VixConversationDto({
    id: 'conv-003',
    alunoId: 'aluno-003',
    alunoNome: 'Juliana Oliveira',
    alunoEmail: 'juliana.oliveira@email.com',
    channel: 'WEB',
    status: 'CLOSED',
    startedAt: '2024-04-19T14:20:00',
    lastMessageAt: '2024-04-19T14:55:00',
    endedAt: '2024-04-19T14:55:00',
    messageCount: 6,
    alunoPlano: 'Premium',
    alunoStreak: 28,
    alunoNivel: 'Avançado',
    tokensUsed: 980,
    toolsUsed: ['consultar_progresso'],
  }),
  new VixConversationDto({
    id: 'conv-004',
    alunoId: 'aluno-004',
    alunoNome: 'Fernanda Lima Souza',
    alunoEmail: 'fernanda.lima@email.com',
    channel: 'APP',
    status: 'IN_HUMAN_SUPPORT',
    startedAt: '2024-04-20T07:00:00',
    lastMessageAt: '2024-04-20T07:30:00',
    messageCount: 15,
    alunoPlano: 'Trial',
    alunoStreak: 0,
    alunoNivel: 'Iniciante',
    tokensUsed: 3200,
    toolsUsed: ['consultar_humor', 'gerar_treino', 'verificar_anamnese'],
    alertasRelacionados: 2,
    humanSupportBy: 'Virgínia',
  }),
  new VixConversationDto({
    id: 'conv-005',
    alunoId: 'aluno-005',
    alunoNome: 'Camila Rodrigues',
    alunoEmail: 'camila.rodrigues@email.com',
    channel: 'APP',
    status: 'PENDING',
    startedAt: '2024-04-20T11:00:00',
    lastMessageAt: '2024-04-20T11:05:00',
    messageCount: 2,
    alunoPlano: 'Premium',
    alunoStreak: 7,
    alunoNivel: 'Intermediário',
  }),
]

const mockMessages: VixMessageDto[] = [
  new VixMessageDto({
    id: 'msg-001',
    conversationId: 'conv-001',
    role: 'USER',
    content: 'Oi Vix, estou me sentindo um pouco cansada hoje',
    timestamp: '2024-04-20T08:30:00',
  }),
  new VixMessageDto({
    id: 'msg-002',
    conversationId: 'conv-001',
    role: 'ASSISTANT',
    content: 'Olá Maria! Entendo como você se sente. É importante respeitar os sinais do seu corpo. Como está seu nível de energia de 0 a 10?',
    timestamp: '2024-04-20T08:30:30',
    tokenCount: 45,
    modelName: 'deepseek-chat',
  }),
  new VixMessageDto({
    id: 'msg-003',
    conversationId: 'conv-001',
    role: 'USER',
    content: 'Acho que uns 4',
    timestamp: '2024-04-20T08:31:00',
  }),
  new VixMessageDto({
    id: 'msg-004',
    conversationId: 'conv-001',
    role: 'TOOL',
    content: 'Resultado: humor registrado como 4/10',
    timestamp: '2024-04-20T08:31:05',
    toolName: 'consultar_humor',
    toolCallId: 'call-001',
  }),
  new VixMessageDto({
    id: 'msg-005',
    conversationId: 'conv-001',
    role: 'ASSISTANT',
    content: 'Agradeço por compartilhar. Um nível 4 indica que talvez um treino mais leve seria ideal hoje. Que tal uma sessão de yoga restaurativo ou uma caminhada tranquila? Posso montar uma sessão especial para você.',
    timestamp: '2024-04-20T08:31:30',
    tokenCount: 68,
    modelName: 'deepseek-chat',
  }),
  new VixMessageDto({
    id: 'msg-006',
    conversationId: 'conv-001',
    role: 'USER',
    content: 'Sim, por favor! Uma sessão mais leve seria ótimo.',
    timestamp: '2024-04-20T08:32:00',
  }),
]

// Tipos para anexos
interface Attachment {
  id: string
  type: 'IMAGE' | 'DOCUMENT' | 'AUDIO'
  file: File
  preview?: string
  uploading?: boolean
  progress?: number
}

/**
 * View principal de Conversas IA
 */
export function IAConversasView() {
  const iaService = useInjection<IAService>(API_TYPE.IAService)

  // Contexto para controlar a sidebar
  const adminLayoutContext = useContext<ArchbaseAdminLayoutContextValue>(ArchbaseAdminLayoutContext)
  const previousCollapsedState = useRef<boolean | undefined>(undefined)

  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState<VixConversationDto[]>([])
  const [selectedConversation, setSelectedConversation] = useState<VixConversationDto | null>(null)
  const [messages, setMessages] = useState<VixMessageDto[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [channelFilter, setChannelFilter] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)

  // Anexos
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Drag and drop
  const [isDragging, setIsDragging] = useState(false)

  // Modals
  const [escalateModalOpened, { open: openEscalateModal, close: closeEscalateModal }] = useDisclosure(false)
  const [noteModalOpened, { open: openNoteModal, close: closeNoteModal }] = useDisclosure(false)
  const [escalateReason, setEscalateReason] = useState('')
  const [noteContent, setNoteContent] = useState('')

  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Colapsar sidebar ao montar o componente
  useEffect(() => {
    previousCollapsedState.current = adminLayoutContext.collapsed
    if (!adminLayoutContext.collapsed && adminLayoutContext.setCollapsed) {
      adminLayoutContext.setCollapsed(true)
    }
    return () => {
      // Restaurar estado anterior ao desmontar
      if (previousCollapsedState.current === false && adminLayoutContext.setCollapsed) {
        adminLayoutContext.setCollapsed(false)
      }
    }
  }, [])

  // Carregar conversas
  useEffect(() => {
    loadConversations()
  }, [statusFilter, channelFilter])

  // Scroll para o final quando mensagens mudam
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages])

  const loadConversations = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true)
      }
      if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300))
        let filtered = mockConversations
        if (statusFilter) {
          filtered = filtered.filter(c => c.status === statusFilter)
        }
        if (channelFilter) {
          filtered = filtered.filter(c => c.channel === channelFilter)
        }
        setConversations(filtered)
      } else {
        const response = await iaService.listVixConversations({
          status: statusFilter as ConversationStatus || undefined,
          channel: channelFilter || undefined,
          size: 50,
        })
        setConversations(response.content)
      }
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível carregar as conversas')
    } finally {
      if (showLoading) {
        setLoading(false)
      }
    }
  }

  // Refresh silencioso (sem loading)
  const refreshConversations = () => loadConversations(false)

  const loadMessages = async (conversationId: string) => {
    if (USE_MOCK_DATA) {
      const filtered = mockMessages.filter(m => m.conversationId === conversationId)
      setMessages(filtered.length > 0 ? filtered : mockMessages)
    } else {
      try {
        const conv = await iaService.getVixConversation(conversationId)
        setMessages(conv.messages || [])
      } catch (err) {
        ArchbaseNotifications.showError('Erro', 'Não foi possível carregar as mensagens')
      }
    }
  }

  const handleSelectConversation = (conv: VixConversationDto) => {
    setSelectedConversation(conv)
    loadMessages(conv.id)
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return

    try {
      setSending(true)
      if (USE_MOCK_DATA) {
        const newMsg = new VixMessageDto({
          id: `msg-${Date.now()}`,
          conversationId: selectedConversation.id,
          role: 'ADMIN',
          content: messageInput,
          timestamp: new Date().toISOString(),
        })
        setMessages(prev => [...prev, newMsg])
        setMessageInput('')
        ArchbaseNotifications.showSuccess('Mensagem enviada', 'A aluna receberá sua mensagem')
      } else {
        const newMsg = await iaService.sendAdminMessage(selectedConversation.id, messageInput)
        setMessages(prev => [...prev, newMsg])
        setMessageInput('')
        ArchbaseNotifications.showSuccess('Mensagem enviada', 'A aluna receberá sua mensagem')
      }
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível enviar a mensagem')
    } finally {
      setSending(false)
    }
  }

  const handleTakeOver = async () => {
    if (!selectedConversation) return
    try {
      if (USE_MOCK_DATA) {
        const updated = new VixConversationDto({ ...selectedConversation, status: 'IN_HUMAN_SUPPORT', humanSupportBy: 'Admin' })
        setSelectedConversation(updated)
        ArchbaseNotifications.showSuccess('Conversa assumida', 'Você está agora no controle da conversa')
        refreshConversations()
      } else {
        await iaService.takeOverConversation(selectedConversation.id)
        ArchbaseNotifications.showSuccess('Conversa assumida', 'Você está agora no controle da conversa')
        refreshConversations()
      }
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível assumir a conversa')
    }
  }

  const handleEscalate = async () => {
    if (!selectedConversation || !escalateReason.trim()) return
    try {
      if (USE_MOCK_DATA) {
        const updated = new VixConversationDto({ ...selectedConversation, status: 'ESCALATED', escalationReason: escalateReason })
        setSelectedConversation(updated)
        ArchbaseNotifications.showSuccess('Conversa escalada', 'A conversa foi marcada para revisão')
        closeEscalateModal()
        setEscalateReason('')
        refreshConversations()
      } else {
        await iaService.escalateConversation(selectedConversation.id, escalateReason)
        ArchbaseNotifications.showSuccess('Conversa escalada', 'A conversa foi marcada para revisão')
        closeEscalateModal()
        setEscalateReason('')
        refreshConversations()
      }
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível escalar a conversa')
    }
  }

  const handleReturnToAI = async () => {
    if (!selectedConversation) return
    try {
      if (USE_MOCK_DATA) {
        const updated = new VixConversationDto({ ...selectedConversation, status: 'ACTIVE', humanSupportBy: undefined })
        setSelectedConversation(updated)
        ArchbaseNotifications.showSuccess('Devolvido para IA', 'A Vix retomou o controle da conversa')
        refreshConversations()
      } else {
        await iaService.returnToAI(selectedConversation.id)
        ArchbaseNotifications.showSuccess('Devolvido para IA', 'A Vix retomou o controle da conversa')
        refreshConversations()
      }
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível devolver para a IA')
    }
  }

  const handleClose = async () => {
    if (!selectedConversation) return
    try {
      if (USE_MOCK_DATA) {
        const updated = new VixConversationDto({ ...selectedConversation, status: 'CLOSED', endedAt: new Date().toISOString() })
        setSelectedConversation(updated)
        ArchbaseNotifications.showSuccess('Conversa fechada', 'A conversa foi encerrada')
        refreshConversations()
      } else {
        await iaService.closeConversation(selectedConversation.id)
        ArchbaseNotifications.showSuccess('Conversa fechada', 'A conversa foi encerrada')
        refreshConversations()
      }
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível fechar a conversa')
    }
  }

  const handleAddNote = async () => {
    if (!selectedConversation || !noteContent.trim()) return
    try {
      if (USE_MOCK_DATA) {
        ArchbaseNotifications.showSuccess('Nota adicionada', 'Sua nota foi salva')
        closeNoteModal()
        setNoteContent('')
      } else {
        await iaService.addInternalNote(selectedConversation.id, noteContent)
        ArchbaseNotifications.showSuccess('Nota adicionada', 'Sua nota foi salva')
        closeNoteModal()
        setNoteContent('')
      }
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível adicionar a nota')
    }
  }

  // === Funções de Anexos ===

  const handleFileSelect = (files: File | File[] | null) => {
    if (!files) return
    const fileArray = Array.isArray(files) ? files : [files]

    fileArray.forEach((file) => {
      const isImage = file.type.startsWith('image/')
      const isAudio = file.type.startsWith('audio/')
      const type: 'IMAGE' | 'DOCUMENT' | 'AUDIO' = isImage ? 'IMAGE' : isAudio ? 'AUDIO' : 'DOCUMENT'

      const attachment: Attachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        file,
        preview: isImage ? URL.createObjectURL(file) : undefined,
      }

      setAttachments((prev) => [...prev, attachment])
    })
  }

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => {
      const att = prev.find((a) => a.id === id)
      if (att?.preview) {
        URL.revokeObjectURL(att.preview)
      }
      return prev.filter((a) => a.id !== id)
    })
  }

  // === Gravação de Áudio ===

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' })

        const attachment: Attachment = {
          id: `att-${Date.now()}`,
          type: 'AUDIO',
          file: audioFile,
        }

        setAttachments((prev) => [...prev, attachment])
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      ArchbaseNotifications.showError('Erro', 'Não foi possível acessar o microfone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // === Drag and Drop ===

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    handleFileSelect(files)
  }

  // Limpar URLs de preview ao desmontar
  useEffect(() => {
    return () => {
      attachments.forEach((att) => {
        if (att.preview) {
          URL.revokeObjectURL(att.preview)
        }
      })
    }
  }, [])

  const filteredConversations = conversations.filter((c) => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      c.alunoNome?.toLowerCase().includes(searchLower) ||
      c.alunoEmail?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" color={AppColors.primary} />
      </Center>
    )
  }

  return (
    <Stack gap="md" p="md" h="calc(100vh - 120px)">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Title order={2}>Conversas com Vix</Title>
          <Text c="dimmed" size="sm">
            Auditoria e intervenção em conversas da IA
          </Text>
        </div>
        <Group>
          <Badge variant="light" color="blue" size="lg">
            {conversations.length} conversas
          </Badge>
          <ActionIcon variant="subtle" onClick={() => loadConversations()}>
            <IconRefresh size={18} />
          </ActionIcon>
        </Group>
      </Group>

      {/* Filtros */}
      <Group>
        <TextInput
          placeholder="Buscar por aluna..."
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ width: 220 }}
        />
        <Select
          placeholder="Status"
          data={[
            { value: 'ACTIVE', label: 'Ativas' },
            { value: 'PENDING', label: 'Pendentes' },
            { value: 'ESCALATED', label: 'Escaladas' },
            { value: 'IN_HUMAN_SUPPORT', label: 'Suporte Humano' },
            { value: 'CLOSED', label: 'Fechadas' },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
          clearable
          style={{ width: 160 }}
        />
        <Select
          placeholder="Canal"
          data={[
            { value: 'APP', label: 'App' },
            { value: 'WHATSAPP', label: 'WhatsApp' },
            { value: 'WEB', label: 'Web' },
          ]}
          value={channelFilter}
          onChange={setChannelFilter}
          clearable
          style={{ width: 130 }}
        />
      </Group>

      {/* 3 Painéis */}
      <Grid style={{ flex: 1, minHeight: 0 }} gutter="md">
        {/* Lista de Conversas (25%) */}
        <Grid.Col span={3}>
          <Paper withBorder h="100%" style={{ overflow: 'hidden' }}>
            <ScrollArea h="100%">
              <Stack gap={0}>
                {filteredConversations.map((conv) => (
                  <ConversationListItem
                    key={conv.id}
                    conversation={conv}
                    selected={selectedConversation?.id === conv.id}
                    onClick={() => handleSelectConversation(conv)}
                  />
                ))}
                {filteredConversations.length === 0 && (
                  <Center p="xl">
                    <Text c="dimmed" size="sm">Nenhuma conversa encontrada</Text>
                  </Center>
                )}
              </Stack>
            </ScrollArea>
          </Paper>
        </Grid.Col>

        {/* Chat (50%) */}
        <Grid.Col span={6}>
          <Paper withBorder h="100%" style={{ display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                {/* Header do Chat com Botões de Ação */}
                <Box p="sm" style={{ borderBottom: '1px solid #eee' }}>
                  <Group justify="space-between">
                    <Group gap="sm">
                      <Avatar size="md" radius="xl" color="blue">
                        {selectedConversation.alunoNome?.charAt(0) || '?'}
                      </Avatar>
                      <div>
                        <Text size="sm" fw={500}>{selectedConversation.alunoNome}</Text>
                        <Group gap={4}>
                          <ChannelIcon channel={selectedConversation.channel} size={12} />
                          <Text size="xs" c="dimmed">{selectedConversation.channel}</Text>
                        </Group>
                      </div>
                    </Group>
                    <Group gap="xs">
                      <Badge color={selectedConversation.getStatusColor()} size="sm">
                        {selectedConversation.getStatusLabel()}
                      </Badge>

                      {/* Botões de Ação */}
                      {selectedConversation.status !== 'IN_HUMAN_SUPPORT' &&
                        selectedConversation.status !== 'CLOSED' && (
                          <Button
                            size="xs"
                            color="orange"
                            leftSection={<IconHandStop size={14} />}
                            onClick={handleTakeOver}
                          >
                            Assumir
                          </Button>
                        )}

                      {selectedConversation.status === 'IN_HUMAN_SUPPORT' && (
                        <Button
                          size="xs"
                          variant="outline"
                          color="blue"
                          leftSection={<IconPlayerPlay size={14} />}
                          onClick={handleReturnToAI}
                        >
                          Devolver para IA
                        </Button>
                      )}

                      {selectedConversation.status !== 'CLOSED' && (
                        <Button
                          size="xs"
                          variant="light"
                          color="yellow"
                          leftSection={<IconArrowUp size={14} />}
                          onClick={openEscalateModal}
                        >
                          Escalar
                        </Button>
                      )}

                      <Button
                        size="xs"
                        variant="subtle"
                        color="gray"
                        leftSection={<IconNote size={14} />}
                        onClick={openNoteModal}
                      >
                        Nota
                      </Button>

                      {selectedConversation.status !== 'CLOSED' && (
                        <Button
                          size="xs"
                          variant="subtle"
                          color="red"
                          leftSection={<IconX size={14} />}
                          onClick={handleClose}
                        >
                          Fechar
                        </Button>
                      )}
                    </Group>
                  </Group>
                </Box>

                {/* Mensagens */}
                <ScrollArea style={{ flex: 1 }} viewportRef={scrollAreaRef} p="sm">
                  <Stack gap="md">
                    {messages.map((msg) => (
                      <MessageBubble key={msg.id} message={msg} />
                    ))}
                  </Stack>
                </ScrollArea>

                {/* Input de Mensagem com Anexos */}
                {(selectedConversation.status === 'IN_HUMAN_SUPPORT' ||
                  selectedConversation.status === 'ESCALATED') && (
                  <Box
                    p="sm"
                    style={{
                      borderTop: '1px solid #eee',
                      position: 'relative',
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {/* Overlay de Drag and Drop */}
                    {isDragging && (
                      <Overlay
                        color="#1a5daa"
                        backgroundOpacity={0.1}
                        radius="sm"
                        zIndex={5}
                      >
                        <Center h="100%">
                          <Stack align="center" gap="xs">
                            <IconPaperclip size={32} color="#1a5daa" />
                            <Text fw={500} c="blue">Solte os arquivos aqui</Text>
                          </Stack>
                        </Center>
                      </Overlay>
                    )}

                    {/* Preview de Anexos */}
                    {attachments.length > 0 && (
                      <Group gap="xs" mb="xs">
                        {attachments.map((att) => (
                          <Paper
                            key={att.id}
                            p="xs"
                            withBorder
                            radius="sm"
                            style={{ position: 'relative' }}
                          >
                            <Group gap="xs">
                              {att.type === 'IMAGE' && att.preview ? (
                                <Image
                                  src={att.preview}
                                  alt={att.file.name}
                                  w={60}
                                  h={60}
                                  fit="cover"
                                  radius="sm"
                                />
                              ) : att.type === 'AUDIO' ? (
                                <ThemeIcon size={40} variant="light" color="orange">
                                  <IconMicrophone size={20} />
                                </ThemeIcon>
                              ) : (
                                <ThemeIcon size={40} variant="light" color="blue">
                                  <IconFile size={20} />
                                </ThemeIcon>
                              )}
                              <Stack gap={2}>
                                <Text size="xs" fw={500} lineClamp={1} style={{ maxWidth: 100 }}>
                                  {att.file.name}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  {(att.file.size / 1024).toFixed(1)} KB
                                </Text>
                              </Stack>
                              <ActionIcon
                                size="sm"
                                color="red"
                                variant="subtle"
                                onClick={() => handleRemoveAttachment(att.id)}
                              >
                                <IconTrash size={14} />
                              </ActionIcon>
                            </Group>
                          </Paper>
                        ))}
                      </Group>
                    )}

                    {/* Indicador de Gravação */}
                    {isRecording && (
                      <Paper p="xs" bg="red.0" mb="xs" radius="sm">
                        <Group gap="xs">
                          <ThemeIcon size="sm" color="red" variant="filled" radius="xl">
                            <IconMicrophone size={12} />
                          </ThemeIcon>
                          <Text size="sm" fw={500} c="red">
                            Gravando... {formatRecordingTime(recordingTime)}
                          </Text>
                          <Button size="xs" color="red" variant="light" onClick={stopRecording}>
                            Parar
                          </Button>
                        </Group>
                      </Paper>
                    )}

                    <Group gap="xs" align="flex-end">
                      {/* Botões de Anexo */}
                      <Group gap={4}>
                        <FileButton
                          onChange={handleFileSelect}
                          accept="image/*"
                          multiple
                        >
                          {(props) => (
                            <Tooltip label="Enviar imagem">
                              <ActionIcon {...props} variant="subtle" color="gray">
                                <IconPhoto size={18} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </FileButton>

                        <FileButton
                          onChange={handleFileSelect}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                          multiple
                        >
                          {(props) => (
                            <Tooltip label="Enviar documento">
                              <ActionIcon {...props} variant="subtle" color="gray">
                                <IconFile size={18} />
                              </ActionIcon>
                            </Tooltip>
                          )}
                        </FileButton>

                        <Tooltip label={isRecording ? 'Parar gravação' : 'Gravar áudio'}>
                          <ActionIcon
                            variant={isRecording ? 'filled' : 'subtle'}
                            color={isRecording ? 'red' : 'gray'}
                            onClick={isRecording ? stopRecording : startRecording}
                          >
                            {isRecording ? (
                              <IconMicrophoneOff size={18} />
                            ) : (
                              <IconMicrophone size={18} />
                            )}
                          </ActionIcon>
                        </Tooltip>
                      </Group>

                      <Textarea
                        placeholder="Digite sua mensagem..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.currentTarget.value)}
                        style={{ flex: 1 }}
                        minRows={1}
                        maxRows={3}
                        autosize
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <ActionIcon
                        size="lg"
                        color="blue"
                        variant="filled"
                        onClick={handleSendMessage}
                        loading={sending}
                        disabled={!messageInput.trim() && attachments.length === 0}
                      >
                        <IconSend size={18} />
                      </ActionIcon>
                    </Group>
                  </Box>
                )}

                {/* Aviso quando não pode responder */}
                {selectedConversation.status === 'ACTIVE' && (
                  <Box p="sm" bg="blue.0" style={{ borderTop: '1px solid #eee' }}>
                    <Group gap="xs">
                      <IconRobot size={16} color={AppColors.primary} />
                      <Text size="xs" c="dimmed">
                        A Vix está conduzindo esta conversa. Clique em "Assumir Conversa" para intervir.
                      </Text>
                    </Group>
                  </Box>
                )}

                {selectedConversation.status === 'CLOSED' && (
                  <Box p="sm" bg="gray.0" style={{ borderTop: '1px solid #eee' }}>
                    <Group gap="xs">
                      <IconCheck size={16} color="gray" />
                      <Text size="xs" c="dimmed">
                        Esta conversa foi encerrada.
                      </Text>
                    </Group>
                  </Box>
                )}
              </>
            ) : (
              <Center h="100%">
                <Stack align="center" gap="sm">
                  <ThemeIcon size={64} radius="xl" variant="light" color="gray">
                    <IconMessageCircle size={32} />
                  </ThemeIcon>
                  <Text c="dimmed">Selecione uma conversa para ver os detalhes</Text>
                </Stack>
              </Center>
            )}
          </Paper>
        </Grid.Col>

        {/* Painel de Contexto (25%) */}
        <Grid.Col span={3}>
          <Paper withBorder h="100%" p="md" style={{ overflow: 'auto' }}>
            {selectedConversation ? (
              <ConversationContext conversation={selectedConversation} />
            ) : (
              <Center h="100%">
                <Text c="dimmed" size="sm">Selecione uma conversa</Text>
              </Center>
            )}
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Modal de Escalação */}
      <Modal opened={escalateModalOpened} onClose={closeEscalateModal} title="Escalar Conversa" size="md">
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Descreva o motivo da escalação. Esta nota será visível para a equipe de suporte.
          </Text>
          <Textarea
            label="Motivo da Escalação"
            placeholder="Ex: Aluna mencionou sintomas de ansiedade severa..."
            value={escalateReason}
            onChange={(e) => setEscalateReason(e.currentTarget.value)}
            minRows={3}
            required
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeEscalateModal}>Cancelar</Button>
            <Button color="orange" onClick={handleEscalate} disabled={!escalateReason.trim()}>
              Escalar
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Modal de Nota Interna */}
      <Modal opened={noteModalOpened} onClose={closeNoteModal} title="Adicionar Nota Interna" size="md">
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Notas internas são visíveis apenas para a equipe, não para a aluna.
          </Text>
          <Textarea
            label="Nota"
            placeholder="Digite sua nota..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.currentTarget.value)}
            minRows={3}
            required
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeNoteModal}>Cancelar</Button>
            <Button onClick={handleAddNote} disabled={!noteContent.trim()}>
              Salvar Nota
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}

// ========== Componentes Auxiliares ==========

interface ConversationListItemProps {
  conversation: VixConversationDto
  selected: boolean
  onClick: () => void
}

function ConversationListItem({ conversation, selected, onClick }: ConversationListItemProps) {
  const hasAlert = conversation.alertasRelacionados && conversation.alertasRelacionados > 0

  return (
    <Paper
      p="sm"
      style={{
        backgroundColor: selected ? 'rgba(26, 93, 170, 0.1)' : undefined,
        cursor: 'pointer',
        borderBottom: '1px solid #eee',
      }}
      onClick={onClick}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <Indicator color="red" disabled={!hasAlert} size={8}>
            <Avatar size="sm" radius="xl" color="blue">
              {conversation.alunoNome?.charAt(0) || '?'}
            </Avatar>
          </Indicator>
          <Stack gap={2} style={{ minWidth: 0 }}>
            <Text size="sm" fw={500} truncate>
              {conversation.alunoNome || 'Desconhecido'}
            </Text>
            <Group gap={4}>
              <ChannelIcon channel={conversation.channel} size={12} />
              <Text size="xs" c="dimmed">
                {conversation.messageCount} msgs • {conversation.getDuration()}
              </Text>
            </Group>
          </Stack>
        </Group>
        <Badge size="xs" color={conversation.getStatusColor()} variant="light">
          {conversation.status === 'IN_HUMAN_SUPPORT' ? 'HUMANO' : conversation.status}
        </Badge>
      </Group>
    </Paper>
  )
}

interface ChannelIconProps {
  channel: ConversationChannel
  size?: number
}

function ChannelIcon({ channel, size = 16 }: ChannelIconProps) {
  const icons: Record<ConversationChannel, React.ReactNode> = {
    APP: <IconDeviceMobile size={size} color={AppColors.primary} />,
    WHATSAPP: <IconBrandWhatsapp size={size} color="#25D366" />,
    WEB: <IconWorld size={size} color={AppColors.accent} />,
    API: <IconApi size={size} color="gray" />,
  }
  return <>{icons[channel] || <IconMessage size={size} />}</>
}

interface MessageBubbleProps {
  message: VixMessageDto
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'USER'
  const isAssistant = message.role === 'ASSISTANT'
  const isTool = message.role === 'TOOL'
  const isAdmin = message.role === 'ADMIN'
  const isSystem = message.role === 'SYSTEM'

  if (isTool) {
    return (
      <Paper p="xs" radius="sm" bg="gray.1" style={{ maxWidth: '90%', margin: '0 auto' }}>
        <Group gap="xs">
          <IconTool size={14} color="gray" />
          <Text size="xs" c="dimmed" fw={500}>{message.toolName}</Text>
        </Group>
        <Text size="xs" c="dimmed">{message.content}</Text>
      </Paper>
    )
  }

  const bubbleColor = isUser
    ? '#E3F0FF'
    : isAdmin
    ? '#E8F5E9'
    : isSystem
    ? '#FFF3E0'
    : '#F1F5F9'

  const avatarColor = isUser ? 'blue' : isAdmin ? 'green' : 'teal'
  const avatarIcon = isUser ? (
    <IconUser size={14} />
  ) : isAdmin ? (
    <IconUserCircle size={14} />
  ) : (
    <IconRobot size={14} />
  )

  return (
    <Group
      align="flex-start"
      gap="sm"
      style={{
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      <Avatar size="sm" radius="xl" color={avatarColor}>
        {avatarIcon}
      </Avatar>
      <Paper
        p="sm"
        radius="md"
        style={{
          maxWidth: '75%',
          backgroundColor: bubbleColor,
        }}
      >
        {isAdmin && (
          <Text size="xs" c="green" fw={500} mb={4}>
            Suporte Humano
          </Text>
        )}
        <Text size="sm">{message.content}</Text>
        <Group justify="flex-end" gap={4} mt={4}>
          {message.tokenCount && (
            <Text size="xs" c="dimmed">{message.tokenCount} tokens</Text>
          )}
          <Text size="xs" c="dimmed">
            {new Date(message.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Group>
      </Paper>
    </Group>
  )
}

interface ConversationContextProps {
  conversation: VixConversationDto
}

function ConversationContext({ conversation }: ConversationContextProps) {
  return (
    <Stack gap="md">
      {/* Info da Aluna */}
      <div>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb="xs">Aluna</Text>
        <Group gap="sm">
          <Avatar size="lg" radius="xl" color="blue">
            {conversation.alunoNome?.charAt(0)}
          </Avatar>
          <div>
            <Text size="sm" fw={500}>{conversation.alunoNome}</Text>
            <Text size="xs" c="dimmed">{conversation.alunoEmail}</Text>
          </div>
        </Group>
      </div>

      <Divider />

      {/* Métricas da Conversa */}
      <div>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb="xs">Conversa</Text>
        <Stack gap="xs">
          <Group justify="space-between">
            <Group gap={4}>
              <ChannelIcon channel={conversation.channel} size={14} />
              <Text size="sm">Canal</Text>
            </Group>
            <Badge variant="light">{conversation.channel}</Badge>
          </Group>
          <Group justify="space-between">
            <Group gap={4}>
              <IconClock size={14} />
              <Text size="sm">Duração</Text>
            </Group>
            <Text size="sm" fw={500}>{conversation.getDuration()}</Text>
          </Group>
          <Group justify="space-between">
            <Group gap={4}>
              <IconMessage size={14} />
              <Text size="sm">Mensagens</Text>
            </Group>
            <Text size="sm" fw={500}>{conversation.messageCount}</Text>
          </Group>
          {conversation.tokensUsed && (
            <Group justify="space-between">
              <Text size="sm">Tokens</Text>
              <Text size="sm" fw={500}>{conversation.tokensUsed.toLocaleString()}</Text>
            </Group>
          )}
        </Stack>
      </div>

      <Divider />

      {/* Info da Aluna */}
      <div>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb="xs">Perfil</Text>
        <Stack gap="xs">
          {conversation.alunoPlano && (
            <Group justify="space-between">
              <Text size="sm">Plano</Text>
              <Badge variant="light" color={conversation.alunoPlano === 'Premium' ? 'violet' : 'gray'}>
                {conversation.alunoPlano}
              </Badge>
            </Group>
          )}
          {conversation.alunoNivel && (
            <Group justify="space-between">
              <Text size="sm">Nível</Text>
              <Text size="sm" fw={500}>{conversation.alunoNivel}</Text>
            </Group>
          )}
          {conversation.alunoStreak !== undefined && (
            <Group justify="space-between">
              <Text size="sm">Streak</Text>
              <Group gap={4}>
                <Text size="sm" fw={500}>{conversation.alunoStreak}</Text>
                {conversation.alunoStreak > 0 && <Text>🔥</Text>}
              </Group>
            </Group>
          )}
        </Stack>
      </div>

      {/* Tools Usadas */}
      {conversation.toolsUsed && conversation.toolsUsed.length > 0 && (
        <>
          <Divider />
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb="xs">Tools Usadas</Text>
            <Stack gap={4}>
              {conversation.toolsUsed.map((tool, idx) => (
                <Group key={idx} gap={4}>
                  <IconTool size={12} color="gray" />
                  <Text size="xs">{tool}</Text>
                </Group>
              ))}
            </Stack>
          </div>
        </>
      )}

      {/* Alertas */}
      {conversation.alertasRelacionados !== undefined && conversation.alertasRelacionados > 0 && (
        <>
          <Divider />
          <div>
            <Group gap={4} mb="xs">
              <IconAlertTriangle size={14} color="orange" />
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Alertas</Text>
            </Group>
            <Badge color="orange" variant="light">
              {conversation.alertasRelacionados} alerta(s) relacionado(s)
            </Badge>
          </div>
        </>
      )}

      {/* Motivo da Escalação */}
      {conversation.escalationReason && (
        <>
          <Divider />
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb="xs">Motivo da Escalação</Text>
            <Paper p="xs" bg="orange.0" radius="sm">
              <Text size="xs">{conversation.escalationReason}</Text>
            </Paper>
          </div>
        </>
      )}

      {/* Suporte Humano */}
      {conversation.humanSupportBy && (
        <>
          <Divider />
          <div>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb="xs">Suporte Humano</Text>
            <Group gap={4}>
              <IconUserCircle size={14} color={AppColors.primary} />
              <Text size="sm">{conversation.humanSupportBy}</Text>
            </Group>
          </div>
        </>
      )}
    </Stack>
  )
}
