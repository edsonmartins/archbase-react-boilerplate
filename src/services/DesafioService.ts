import { injectable, inject } from 'inversify'
import { ArchbaseRemoteApiService } from '@archbase/data'
import type { ArchbaseRemoteApiClient } from '@archbase/data'
import { ARCHBASE_IOC_API_TYPE } from '@archbase/core'
import { DesafioMensalDto } from '../domain/gamificacao/GamificacaoDto'

/**
 * Service para gerenciamento de Desafios Mensais
 */
@injectable()
export class DesafioService extends ArchbaseRemoteApiService<DesafioMensalDto, string> {
  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient)
    client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  protected getEndpoint(): string {
    return '/api/v1/desafios'
  }

  public getId(entity: DesafioMensalDto): string {
    return entity.id
  }

  public isNewRecord(entity: DesafioMensalDto): boolean {
    return entity.isNew
  }

  protected configureHeaders(): Record<string, string> {
    return {}
  }

  protected transform(data: unknown): DesafioMensalDto {
    return new DesafioMensalDto(data as Partial<DesafioMensalDto>)
  }

  /**
   * Listar desafios ativos
   */
  public async findAtivos(): Promise<DesafioMensalDto[]> {
    const response = await this.client.get<DesafioMensalDto[]>(
      `${this.getEndpoint()}/ativos`,
      this.configureHeaders()
    )
    return (response || []).map((item) => this.transform(item))
  }

  /**
   * Toggle ativo/inativo
   */
  public async toggle(id: string): Promise<DesafioMensalDto> {
    const response = await this.client.put<unknown, DesafioMensalDto>(
      `${this.getEndpoint()}/${id}/toggle`,
      {},
      this.configureHeaders()
    )
    return this.transform(response)
  }
}
