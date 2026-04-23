import { injectable, inject } from 'inversify'
import type { ArchbaseRemoteApiClient } from '@archbase/data'
import { ARCHBASE_IOC_API_TYPE } from '@archbase/core'
import {
  AgenteIADto,
  ProtocoloDto,
  FraseDto,
  GuardrailDto,
  LogIADto,
  ConversaAdminDto,
} from '../domain/ia/IADto'
import {
  VixConversationDto,
  VixMessageDto,
  VixInternalNoteDto,
  ConversationStatus,
} from '../domain/ia/VixConversationDto'

/**
 * Service para gerenciamento de IA Admin
 */
@injectable()
export class IAService {
  private client: ArchbaseRemoteApiClient

  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient)
    client: ArchbaseRemoteApiClient
  ) {
    this.client = client
  }

  private getEndpoint(): string {
    return '/api/v1/ia'
  }

  // ========== AGENTES ==========

  public async listAgentes(): Promise<AgenteIADto[]> {
    const response = await this.client.get<AgenteIADto[]>(
      `${this.getEndpoint()}/agentes`,
      {}
    )
    return (response || []).map((item) => new AgenteIADto(item))
  }

  public async getAgente(id: string): Promise<AgenteIADto> {
    const response = await this.client.get<AgenteIADto>(
      `${this.getEndpoint()}/agentes/${id}`,
      {}
    )
    return new AgenteIADto(response)
  }

  public async updateAgente(id: string, data: Partial<AgenteIADto>): Promise<AgenteIADto> {
    const response = await this.client.put<Partial<AgenteIADto>, AgenteIADto>(
      `${this.getEndpoint()}/agentes/${id}`,
      data,
      {}
    )
    return new AgenteIADto(response)
  }

  public async getAgenteMetricas(id: string): Promise<Record<string, unknown>> {
    return this.client.get<Record<string, unknown>>(
      `${this.getEndpoint()}/agentes/${id}/metricas`,
      {}
    )
  }

  // ========== PROTOCOLOS ==========

  public async listProtocolos(): Promise<ProtocoloDto[]> {
    const response = await this.client.get<ProtocoloDto[]>(
      `${this.getEndpoint()}/protocolos`,
      {}
    )
    return (response || []).map((item) => new ProtocoloDto(item))
  }

  public async getProtocolo(id: string): Promise<ProtocoloDto> {
    const response = await this.client.get<ProtocoloDto>(
      `${this.getEndpoint()}/protocolos/${id}`,
      {}
    )
    return new ProtocoloDto(response)
  }

  public async updateProtocolo(id: string, data: Partial<ProtocoloDto>): Promise<ProtocoloDto> {
    const response = await this.client.put<Partial<ProtocoloDto>, ProtocoloDto>(
      `${this.getEndpoint()}/protocolos/${id}`,
      data,
      {}
    )
    return new ProtocoloDto(response)
  }

  public async ativarProtocolo(id: string): Promise<ProtocoloDto> {
    const response = await this.client.post<unknown, ProtocoloDto>(
      `${this.getEndpoint()}/protocolos/${id}/ativar`,
      {},
      {}
    )
    return new ProtocoloDto(response)
  }

  public async desativarProtocolo(id: string): Promise<ProtocoloDto> {
    const response = await this.client.post<unknown, ProtocoloDto>(
      `${this.getEndpoint()}/protocolos/${id}/desativar`,
      {},
      {}
    )
    return new ProtocoloDto(response)
  }

  // ========== FRASES ==========

  public async listFrases(categoria?: string): Promise<FraseDto[]> {
    const url = categoria
      ? `${this.getEndpoint()}/frases?categoria=${categoria}`
      : `${this.getEndpoint()}/frases`
    const response = await this.client.get<FraseDto[]>(url, {})
    return (response || []).map((item) => new FraseDto(item))
  }

  public async createFrase(data: Partial<FraseDto>): Promise<FraseDto> {
    const response = await this.client.post<Partial<FraseDto>, FraseDto>(
      `${this.getEndpoint()}/frases`,
      data,
      {}
    )
    return new FraseDto(response)
  }

  public async updateFrase(id: string, data: Partial<FraseDto>): Promise<FraseDto> {
    const response = await this.client.put<Partial<FraseDto>, FraseDto>(
      `${this.getEndpoint()}/frases/${id}`,
      data,
      {}
    )
    return new FraseDto(response)
  }

  public async deleteFrase(id: string): Promise<void> {
    await this.client.delete(`${this.getEndpoint()}/frases/${id}`, {})
  }

  public async listCategoriasFrases(): Promise<string[]> {
    return this.client.get<string[]>(`${this.getEndpoint()}/frases/categorias`, {})
  }

  // ========== GUARDRAILS ==========

  public async listGuardrails(): Promise<GuardrailDto[]> {
    const response = await this.client.get<GuardrailDto[]>(
      `${this.getEndpoint()}/guardrails`,
      {}
    )
    return (response || []).map((item) => new GuardrailDto(item))
  }

  public async createGuardrail(data: Partial<GuardrailDto>): Promise<GuardrailDto> {
    const response = await this.client.post<Partial<GuardrailDto>, GuardrailDto>(
      `${this.getEndpoint()}/guardrails`,
      data,
      {}
    )
    return new GuardrailDto(response)
  }

  public async updateGuardrail(id: string, data: Partial<GuardrailDto>): Promise<GuardrailDto> {
    const response = await this.client.put<Partial<GuardrailDto>, GuardrailDto>(
      `${this.getEndpoint()}/guardrails/${id}`,
      data,
      {}
    )
    return new GuardrailDto(response)
  }

  public async deleteGuardrail(id: string): Promise<void> {
    await this.client.delete(`${this.getEndpoint()}/guardrails/${id}`, {})
  }

  // ========== LOGS ==========

  public async listLogs(filters?: {
    tipo?: string
    agenteId?: string
    alunoId?: string
    dataInicio?: string
    dataFim?: string
    page?: number
    size?: number
  }): Promise<{ content: LogIADto[]; totalElements: number }> {
    const params = new URLSearchParams()
    if (filters?.tipo) params.append('tipo', filters.tipo)
    if (filters?.agenteId) params.append('agenteId', filters.agenteId)
    if (filters?.alunoId) params.append('alunoId', filters.alunoId)
    if (filters?.dataInicio) params.append('dataInicio', filters.dataInicio)
    if (filters?.dataFim) params.append('dataFim', filters.dataFim)
    if (filters?.page !== undefined) params.append('page', filters.page.toString())
    if (filters?.size !== undefined) params.append('size', filters.size.toString())

    const response = await this.client.get<{ content: LogIADto[]; totalElements: number }>(
      `${this.getEndpoint()}/logs?${params.toString()}`,
      {}
    )
    return {
      content: (response.content || []).map((item) => new LogIADto(item)),
      totalElements: response.totalElements || 0,
    }
  }

  public async getLogStats(): Promise<Record<string, unknown>> {
    return this.client.get<Record<string, unknown>>(
      `${this.getEndpoint()}/logs/stats`,
      {}
    )
  }

  // ========== CONVERSAS ==========

  public async listConversas(filters?: {
    status?: string
    alunoId?: string
    page?: number
    size?: number
  }): Promise<{ content: ConversaAdminDto[]; totalElements: number }> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.alunoId) params.append('alunoId', filters.alunoId)
    if (filters?.page !== undefined) params.append('page', filters.page.toString())
    if (filters?.size !== undefined) params.append('size', filters.size.toString())

    const response = await this.client.get<{ content: ConversaAdminDto[]; totalElements: number }>(
      `${this.getEndpoint()}/conversas?${params.toString()}`,
      {}
    )
    return {
      content: (response.content || []).map((item) => new ConversaAdminDto(item)),
      totalElements: response.totalElements || 0,
    }
  }

  public async getConversa(id: string): Promise<ConversaAdminDto> {
    const response = await this.client.get<ConversaAdminDto>(
      `${this.getEndpoint()}/conversas/${id}`,
      {}
    )
    return new ConversaAdminDto(response)
  }

  public async flagearConversa(id: string, motivo: string): Promise<ConversaAdminDto> {
    const response = await this.client.post<{ motivo: string }, ConversaAdminDto>(
      `${this.getEndpoint()}/conversas/${id}/flag`,
      { motivo },
      {}
    )
    return new ConversaAdminDto(response)
  }

  public async getConversaStats(): Promise<Record<string, unknown>> {
    return this.client.get<Record<string, unknown>>(
      `${this.getEndpoint()}/conversas/stats`,
      {}
    )
  }

  // ========== VIX ADMIN (Intervenção Humana) ==========

  /**
   * Lista todas as conversas da Vix (admin)
   */
  public async listVixConversations(filters?: {
    status?: ConversationStatus
    channel?: string
    alunoId?: string
    page?: number
    size?: number
  }): Promise<{ content: VixConversationDto[]; totalElements: number }> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.channel) params.append('channel', filters.channel)
    if (filters?.alunoId) params.append('alunoId', filters.alunoId)
    if (filters?.page !== undefined) params.append('page', filters.page.toString())
    if (filters?.size !== undefined) params.append('size', filters.size.toString())

    const response = await this.client.get<{ content: VixConversationDto[]; totalElements: number }>(
      `/api/v1/admin/vix/conversations?${params.toString()}`,
      {}
    )
    return {
      content: (response.content || []).map((item) => new VixConversationDto(item)),
      totalElements: response.totalElements || 0,
    }
  }

  /**
   * Obtém uma conversa com todas as mensagens
   */
  public async getVixConversation(id: string): Promise<VixConversationDto> {
    const response = await this.client.get<VixConversationDto>(
      `/api/v1/admin/vix/conversations/${id}`,
      {}
    )
    return new VixConversationDto(response)
  }

  /**
   * Admin envia mensagem na conversa
   */
  public async sendAdminMessage(conversationId: string, message: string): Promise<VixMessageDto> {
    const response = await this.client.post<{ content: string }, VixMessageDto>(
      `/api/v1/admin/vix/conversations/${conversationId}/message`,
      { content: message },
      {}
    )
    return new VixMessageDto(response)
  }

  /**
   * Atualiza o status da conversa
   */
  public async updateConversationStatus(
    id: string,
    status: ConversationStatus,
    reason?: string
  ): Promise<VixConversationDto> {
    const response = await this.client.patch<{ status: ConversationStatus; reason?: string }, VixConversationDto>(
      `/api/v1/admin/vix/conversations/${id}/status`,
      { status, reason },
      {}
    )
    return new VixConversationDto(response)
  }

  /**
   * Assume a conversa (IN_HUMAN_SUPPORT)
   */
  public async takeOverConversation(id: string): Promise<VixConversationDto> {
    return this.updateConversationStatus(id, 'IN_HUMAN_SUPPORT')
  }

  /**
   * Escala a conversa para revisão
   */
  public async escalateConversation(id: string, reason: string): Promise<VixConversationDto> {
    return this.updateConversationStatus(id, 'ESCALATED', reason)
  }

  /**
   * Devolve a conversa para a IA
   */
  public async returnToAI(id: string): Promise<VixConversationDto> {
    return this.updateConversationStatus(id, 'ACTIVE')
  }

  /**
   * Fecha a conversa
   */
  public async closeConversation(id: string): Promise<VixConversationDto> {
    return this.updateConversationStatus(id, 'CLOSED')
  }

  /**
   * Adiciona nota interna à conversa
   */
  public async addInternalNote(conversationId: string, note: string): Promise<VixInternalNoteDto> {
    const response = await this.client.post<{ content: string }, VixInternalNoteDto>(
      `/api/v1/admin/vix/conversations/${conversationId}/note`,
      { content: note },
      {}
    )
    return new VixInternalNoteDto(response)
  }

  /**
   * Lista notas internas de uma conversa
   */
  public async listInternalNotes(conversationId: string): Promise<VixInternalNoteDto[]> {
    const response = await this.client.get<VixInternalNoteDto[]>(
      `/api/v1/admin/vix/conversations/${conversationId}/notes`,
      {}
    )
    return (response || []).map((item) => new VixInternalNoteDto(item))
  }
}
