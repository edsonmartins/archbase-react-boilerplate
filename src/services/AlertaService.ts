import { injectable, inject } from 'inversify'
import { ArchbaseRemoteApiService } from '@archbase/data'
import type { ArchbaseRemoteApiClient } from '@archbase/data'
import { ARCHBASE_IOC_API_TYPE } from '@archbase/core'
import { AlertaDto } from '../domain/alerta/AlertaDto'

/**
 * Service para gerenciamento de Alertas
 */
@injectable()
export class AlertaService extends ArchbaseRemoteApiService<AlertaDto, string> {
  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient)
    client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  protected getEndpoint(): string {
    return '/api/v1/alertas'
  }

  public getId(entity: AlertaDto): string {
    return entity.id
  }

  public isNewRecord(entity: AlertaDto): boolean {
    return entity.isNew
  }

  protected configureHeaders(): Record<string, string> {
    return {}
  }

  protected transform(data: unknown): AlertaDto {
    return new AlertaDto(data as Partial<AlertaDto>)
  }

  /**
   * Listar alertas por aluno
   */
  public async findByAluno(alunoId: string): Promise<AlertaDto[]> {
    const response = await this.client.get<AlertaDto[]>(
      `${this.getEndpoint()}/by-aluno/${alunoId}`,
      this.configureHeaders()
    )
    return (response || []).map((item) => this.transform(item))
  }

  /**
   * Atualizar status do alerta
   */
  public async updateStatus(
    id: string,
    status: 'PENDENTE' | 'EM_ANALISE' | 'RESOLVIDO' | 'IGNORADO'
  ): Promise<AlertaDto> {
    const response = await this.client.put<{ status: string }, AlertaDto>(
      `${this.getEndpoint()}/${id}/status`,
      { status },
      this.configureHeaders()
    )
    return this.transform(response)
  }

  /**
   * Adicionar nota ao alerta
   */
  public async addNota(id: string, nota: string): Promise<AlertaDto> {
    const response = await this.client.post<{ nota: string }, AlertaDto>(
      `${this.getEndpoint()}/${id}/note`,
      { nota },
      this.configureHeaders()
    )
    return this.transform(response)
  }

  /**
   * Resolver alerta
   */
  public async resolver(id: string, resolucao?: string): Promise<AlertaDto> {
    const response = await this.client.post<{ resolucao?: string }, AlertaDto>(
      `${this.getEndpoint()}/${id}/resolver`,
      { resolucao },
      this.configureHeaders()
    )
    return this.transform(response)
  }
}
