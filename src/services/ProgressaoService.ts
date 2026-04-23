import { injectable, inject } from 'inversify'
import type { ArchbaseRemoteApiClient } from '@archbase/data'
import { ARCHBASE_IOC_API_TYPE } from '@archbase/core'
import {
  PadraoMovimentoDto,
  ProgressaoOndulatoriaDto,
  ProgressaoStepData,
} from '../domain/progressao/ProgressaoDto'

/**
 * Service para gerenciamento de Progressão (Padrões de Movimento e Ondulatória)
 */
@injectable()
export class ProgressaoService {
  private client: ArchbaseRemoteApiClient

  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient)
    client: ArchbaseRemoteApiClient
  ) {
    this.client = client
  }

  // ========== PADRÕES DE MOVIMENTO ==========

  /**
   * Lista todos os padrões de movimento
   */
  public async listPadroes(): Promise<PadraoMovimentoDto[]> {
    const response = await this.client.get<PadraoMovimentoDto[]>(
      '/api/v1/padroes-movimento/todos',
      {}
    )
    return (response || []).map((item) => new PadraoMovimentoDto(item))
  }

  /**
   * Lista padrões de movimento ativos
   */
  public async listPadroesAtivos(): Promise<PadraoMovimentoDto[]> {
    const response = await this.client.get<PadraoMovimentoDto[]>(
      '/api/v1/padroes-movimento/ativos',
      {}
    )
    return (response || []).map((item) => new PadraoMovimentoDto(item))
  }

  /**
   * Busca um padrão por ID (com steps)
   */
  public async getPadrao(id: string): Promise<PadraoMovimentoDto> {
    const response = await this.client.get<PadraoMovimentoDto>(
      `/api/v1/padroes-movimento/${id}`,
      {}
    )
    return new PadraoMovimentoDto(response)
  }

  /**
   * Cria um novo padrão de movimento
   */
  public async createPadrao(data: {
    nome: string
    descricao?: string
    cor?: string
    icone?: string
    ordem?: number
  }): Promise<PadraoMovimentoDto> {
    const response = await this.client.post<typeof data, PadraoMovimentoDto>(
      '/api/v1/padroes-movimento',
      data,
      {}
    )
    return new PadraoMovimentoDto(response)
  }

  /**
   * Atualiza um padrão de movimento
   */
  public async updatePadrao(
    id: string,
    data: {
      nome?: string
      descricao?: string
      cor?: string
      icone?: string
      ordem?: number
      ativo?: boolean
    }
  ): Promise<PadraoMovimentoDto> {
    const response = await this.client.put<typeof data, PadraoMovimentoDto>(
      `/api/v1/padroes-movimento/${id}`,
      data,
      {}
    )
    return new PadraoMovimentoDto(response)
  }

  /**
   * Desativa um padrão de movimento
   */
  public async deletePadrao(id: string): Promise<void> {
    await this.client.delete(`/api/v1/padroes-movimento/${id}`, {})
  }

  // ========== STEPS DE PROGRESSÃO ==========

  /**
   * Lista steps de um padrão
   */
  public async listSteps(padraoId: string): Promise<ProgressaoStepData[]> {
    const response = await this.client.get<ProgressaoStepData[]>(
      `/api/v1/padroes-movimento/${padraoId}/steps`,
      {}
    )
    return response || []
  }

  /**
   * Lista steps de um padrão por nível
   */
  public async listStepsPorNivel(padraoId: string, nivel: string): Promise<ProgressaoStepData[]> {
    const response = await this.client.get<ProgressaoStepData[]>(
      `/api/v1/padroes-movimento/${padraoId}/steps/nivel/${nivel}`,
      {}
    )
    return response || []
  }

  /**
   * Cria um novo step
   */
  public async createStep(data: {
    padraoMovimentoId: string
    nivel: string
    numeroStep: number
    nome: string
    descricao?: string
    criterioAvanco?: string
  }): Promise<ProgressaoStepData> {
    const response = await this.client.post<typeof data, ProgressaoStepData>(
      '/api/v1/padroes-movimento/steps',
      data,
      {}
    )
    return response
  }

  /**
   * Atualiza um step
   */
  public async updateStep(
    id: string,
    data: {
      nivel?: string
      numeroStep?: number
      nome?: string
      descricao?: string
      criterioAvanco?: string
      ativo?: boolean
    }
  ): Promise<ProgressaoStepData> {
    const response = await this.client.put<typeof data, ProgressaoStepData>(
      `/api/v1/padroes-movimento/steps/${id}`,
      data,
      {}
    )
    return response
  }

  /**
   * Desativa um step
   */
  public async deleteStep(id: string): Promise<void> {
    await this.client.delete(`/api/v1/padroes-movimento/steps/${id}`, {})
  }

  // ========== PROGRESSÃO ONDULATÓRIA ==========

  /**
   * Lista todas as progressões ondulatórias
   */
  public async listProgressoes(): Promise<ProgressaoOndulatoriaDto[]> {
    const response = await this.client.get<ProgressaoOndulatoriaDto[]>(
      '/api/v1/progressao-ondulatoria/todas',
      {}
    )
    return (response || []).map((item) => new ProgressaoOndulatoriaDto(item))
  }

  /**
   * Lista progressões ativas
   */
  public async listProgressoesAtivas(): Promise<ProgressaoOndulatoriaDto[]> {
    const response = await this.client.get<ProgressaoOndulatoriaDto[]>(
      '/api/v1/progressao-ondulatoria/ativas',
      {}
    )
    return (response || []).map((item) => new ProgressaoOndulatoriaDto(item))
  }

  /**
   * Busca progressão por ID
   */
  public async getProgressao(id: string): Promise<ProgressaoOndulatoriaDto> {
    const response = await this.client.get<ProgressaoOndulatoriaDto>(
      `/api/v1/progressao-ondulatoria/${id}`,
      {}
    )
    return new ProgressaoOndulatoriaDto(response)
  }

  /**
   * Busca progressão por semana
   */
  public async getProgressaoPorSemana(semana: number): Promise<ProgressaoOndulatoriaDto> {
    const response = await this.client.get<ProgressaoOndulatoriaDto>(
      `/api/v1/progressao-ondulatoria/semana/${semana}`,
      {}
    )
    return new ProgressaoOndulatoriaDto(response)
  }

  /**
   * Lista progressões por mês (1=semanas 1-4, 2=semanas 5-8, 3=semanas 9-12)
   */
  public async listProgressoesPorMes(mes: number): Promise<ProgressaoOndulatoriaDto[]> {
    const response = await this.client.get<ProgressaoOndulatoriaDto[]>(
      `/api/v1/progressao-ondulatoria/mes/${mes}`,
      {}
    )
    return (response || []).map((item) => new ProgressaoOndulatoriaDto(item))
  }

  /**
   * Cria uma nova progressão ondulatória
   */
  public async createProgressao(data: {
    semana: number
    tipo: string
    fase: string
    intensidade: number
    volume: number
    foco: string
    descricao?: string
  }): Promise<ProgressaoOndulatoriaDto> {
    const response = await this.client.post<typeof data, ProgressaoOndulatoriaDto>(
      '/api/v1/progressao-ondulatoria',
      data,
      {}
    )
    return new ProgressaoOndulatoriaDto(response)
  }

  /**
   * Atualiza uma progressão ondulatória
   */
  public async updateProgressao(
    id: string,
    data: {
      semana?: number
      tipo?: string
      fase?: string
      intensidade?: number
      volume?: number
      foco?: string
      descricao?: string
      ativo?: boolean
    }
  ): Promise<ProgressaoOndulatoriaDto> {
    const response = await this.client.put<typeof data, ProgressaoOndulatoriaDto>(
      `/api/v1/progressao-ondulatoria/${id}`,
      data,
      {}
    )
    return new ProgressaoOndulatoriaDto(response)
  }

  /**
   * Desativa uma progressão ondulatória
   */
  public async deleteProgressao(id: string): Promise<void> {
    await this.client.delete(`/api/v1/progressao-ondulatoria/${id}`, {})
  }
}
