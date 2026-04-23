/**
 * VixConversationDto - DTO para Conversas com a Vix
 */

export type ConversationStatus = 'ACTIVE' | 'CLOSED' | 'PENDING' | 'ESCALATED' | 'IN_HUMAN_SUPPORT'
export type ConversationChannel = 'APP' | 'WHATSAPP' | 'WEB' | 'API'
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL' | 'ADMIN'
export type AttachmentType = 'IMAGE' | 'AUDIO' | 'VIDEO' | 'FILE' | 'LINK'

/**
 * DTO para anexos de mensagens
 */
export class VixAttachmentDto {
  type: AttachmentType
  url: string
  name?: string
  mimeType?: string
  previewUrl?: string

  constructor(data?: Partial<VixAttachmentDto>) {
    this.type = data?.type || 'FILE'
    this.url = data?.url || ''
    this.name = data?.name
    this.mimeType = data?.mimeType
    this.previewUrl = data?.previewUrl
  }
}

/**
 * DTO para mensagens da conversa
 */
export class VixMessageDto {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  timestamp: string
  tokenCount?: number
  modelName?: string
  toolCallId?: string
  toolName?: string
  attachments?: VixAttachmentDto[]

  constructor(data?: Partial<VixMessageDto>) {
    this.id = data?.id || ''
    this.conversationId = data?.conversationId || ''
    this.role = data?.role || 'USER'
    this.content = data?.content || ''
    this.timestamp = data?.timestamp || new Date().toISOString()
    this.tokenCount = data?.tokenCount
    this.modelName = data?.modelName
    this.toolCallId = data?.toolCallId
    this.toolName = data?.toolName
    this.attachments = data?.attachments?.map(a => new VixAttachmentDto(a))
  }
}

/**
 * DTO para notas internas da conversa
 */
export class VixInternalNoteDto {
  id: string
  conversationId: string
  content: string
  authorId: string
  authorName: string
  createdAt: string

  constructor(data?: Partial<VixInternalNoteDto>) {
    this.id = data?.id || ''
    this.conversationId = data?.conversationId || ''
    this.content = data?.content || ''
    this.authorId = data?.authorId || ''
    this.authorName = data?.authorName || ''
    this.createdAt = data?.createdAt || new Date().toISOString()
  }
}

/**
 * DTO para conversa completa
 */
export class VixConversationDto {
  id: string
  alunoId: string
  alunoNome: string
  alunoEmail?: string
  alunoAvatar?: string
  channel: ConversationChannel
  status: ConversationStatus
  startedAt: string
  endedAt?: string
  lastMessageAt: string
  messageCount: number
  summary?: string
  messages?: VixMessageDto[]
  internalNotes?: VixInternalNoteDto[]

  // Contexto adicional
  alunoPlano?: string
  alunoStreak?: number
  alunoNivel?: string
  tokensUsed?: number
  toolsUsed?: string[]
  alertasRelacionados?: number
  escalationReason?: string
  humanSupportBy?: string

  isNew: boolean

  constructor(data?: Partial<VixConversationDto>) {
    this.id = data?.id || ''
    this.alunoId = data?.alunoId || ''
    this.alunoNome = data?.alunoNome || ''
    this.alunoEmail = data?.alunoEmail
    this.alunoAvatar = data?.alunoAvatar
    this.channel = data?.channel || 'APP'
    this.status = data?.status || 'ACTIVE'
    this.startedAt = data?.startedAt || new Date().toISOString()
    this.endedAt = data?.endedAt
    this.lastMessageAt = data?.lastMessageAt || new Date().toISOString()
    this.messageCount = data?.messageCount || 0
    this.summary = data?.summary
    this.messages = data?.messages?.map(m => new VixMessageDto(m))
    this.internalNotes = data?.internalNotes?.map(n => new VixInternalNoteDto(n))

    this.alunoPlano = data?.alunoPlano
    this.alunoStreak = data?.alunoStreak
    this.alunoNivel = data?.alunoNivel
    this.tokensUsed = data?.tokensUsed
    this.toolsUsed = data?.toolsUsed || []
    this.alertasRelacionados = data?.alertasRelacionados
    this.escalationReason = data?.escalationReason
    this.humanSupportBy = data?.humanSupportBy

    this.isNew = !data?.id
  }

  /**
   * Retorna a cor do badge baseado no status
   */
  getStatusColor(): string {
    const colors: Record<ConversationStatus, string> = {
      ACTIVE: 'green',
      PENDING: 'yellow',
      ESCALATED: 'orange',
      IN_HUMAN_SUPPORT: 'blue',
      CLOSED: 'gray',
    }
    return colors[this.status] || 'gray'
  }

  /**
   * Retorna o label do status em português
   */
  getStatusLabel(): string {
    const labels: Record<ConversationStatus, string> = {
      ACTIVE: 'Ativa',
      PENDING: 'Pendente',
      ESCALATED: 'Escalada',
      IN_HUMAN_SUPPORT: 'Suporte Humano',
      CLOSED: 'Fechada',
    }
    return labels[this.status] || this.status
  }

  /**
   * Retorna o ícone do canal
   */
  getChannelIcon(): string {
    const icons: Record<ConversationChannel, string> = {
      APP: 'device-mobile',
      WHATSAPP: 'brand-whatsapp',
      WEB: 'world',
      API: 'api',
    }
    return icons[this.channel] || 'message'
  }

  /**
   * Calcula a duração da conversa
   */
  getDuration(): string {
    const start = new Date(this.startedAt)
    const end = this.endedAt ? new Date(this.endedAt) : new Date(this.lastMessageAt)
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) return `${diffMins}min`
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours}h ${mins}min`
  }
}
