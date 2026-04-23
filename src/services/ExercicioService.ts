import { injectable, inject } from 'inversify'
import { ArchbaseRemoteApiService } from '@archbase/data'
import type { ArchbaseRemoteApiClient } from '@archbase/data'
import { ARCHBASE_IOC_API_TYPE } from '@archbase/core'
import { ExercicioDto } from '../domain/exercicio/ExercicioDto'

/**
 * Service para gerenciamento de Exercícios
 */
@injectable()
export class ExercicioService extends ArchbaseRemoteApiService<ExercicioDto, string> {
  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient)
    client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  protected getEndpoint(): string {
    return '/api/v1/exercicios'
  }

  public getId(entity: ExercicioDto): string {
    return entity.id
  }

  public isNewRecord(entity: ExercicioDto): boolean {
    return entity.isNew
  }

  protected configureHeaders(): Record<string, string> {
    return {}
  }

  protected transform(data: unknown): ExercicioDto {
    return new ExercicioDto(data as Partial<ExercicioDto>)
  }

  /**
   * Listar apenas exercícios ativos
   */
  public async findAtivos(): Promise<ExercicioDto[]> {
    const response = await this.client.get<ExercicioDto[]>(
      `${this.getEndpoint()}/ativos`,
      this.configureHeaders()
    )
    return (response || []).map((item) => this.transform(item))
  }

  /**
   * Deletar definitivamente
   */
  public async deleteDefinitivo(id: string): Promise<void> {
    await this.client.delete(
      `${this.getEndpoint()}/${id}/definitivo`,
      this.configureHeaders()
    )
  }
}
