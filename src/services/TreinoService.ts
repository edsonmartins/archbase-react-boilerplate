import { injectable, inject } from 'inversify'
import { ArchbaseRemoteApiService } from '@archbase/data'
import type { ArchbaseRemoteApiClient } from '@archbase/data'
import { ARCHBASE_IOC_API_TYPE } from '@archbase/core'
import { TreinoDto } from '../domain/treino/TreinoDto'

/**
 * Service para gerenciamento de Treinos
 */
@injectable()
export class TreinoService extends ArchbaseRemoteApiService<TreinoDto, string> {
  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient)
    client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  protected getEndpoint(): string {
    return '/api/v1/admin/treinos'
  }

  public getId(entity: TreinoDto): string {
    return entity.id
  }

  public isNewRecord(entity: TreinoDto): boolean {
    return entity.isNew
  }

  protected configureHeaders(): Record<string, string> {
    return {}
  }

  protected transform(data: unknown): TreinoDto {
    return new TreinoDto(data as Partial<TreinoDto>)
  }

  /**
   * Listar treinos por nível
   */
  public async findByNivel(nivel: string): Promise<TreinoDto[]> {
    const response = await this.client.get<TreinoDto[]>(
      `/api/v1/treinos/nivel/${nivel}`,
      this.configureHeaders()
    )
    return (response || []).map((item) => this.transform(item))
  }

  /**
   * Listar treinos por categoria
   */
  public async findByCategoria(categoria: string): Promise<TreinoDto[]> {
    const response = await this.client.get<TreinoDto[]>(
      `/api/v1/treinos/categoria/${categoria}`,
      this.configureHeaders()
    )
    return (response || []).map((item) => this.transform(item))
  }
}
