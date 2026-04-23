import { injectable, inject } from 'inversify'
import { ArchbaseRemoteApiService } from '@archbase/data'
import type { ArchbaseRemoteApiClient } from '@archbase/data'
import { ARCHBASE_IOC_API_TYPE } from '@archbase/core'
import { AlunoDto } from '../domain/aluno/AlunoDto'

/**
 * Service para gerenciamento de Alunos
 */
@injectable()
export class AlunoService extends ArchbaseRemoteApiService<AlunoDto, string> {
  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient)
    client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  protected getEndpoint(): string {
    return '/api/v1/alunos'
  }

  public getId(entity: AlunoDto): string {
    return entity.id
  }

  public isNewRecord(entity: AlunoDto): boolean {
    return entity.isNew
  }

  protected configureHeaders(): Record<string, string> {
    return {}
  }

  protected transform(data: unknown): AlunoDto {
    return new AlunoDto(data as Partial<AlunoDto>)
  }

  /**
   * Buscar aluno pelo userId
   */
  public async findByUserId(userId: string): Promise<AlunoDto> {
    const response = await this.client.get<AlunoDto>(
      `${this.getEndpoint()}/by-user/${userId}`,
      this.configureHeaders()
    )
    return this.transform(response)
  }

  /**
   * Aceitar contrato do aluno
   */
  public async aceitarContrato(id: string): Promise<AlunoDto> {
    const response = await this.client.post<unknown, AlunoDto>(
      `${this.getEndpoint()}/${id}/contrato`,
      {},
      this.configureHeaders()
    )
    return this.transform(response)
  }

  /**
   * Atualização admin de aluno
   */
  public async updateAdmin(id: string, data: Partial<AlunoDto>): Promise<AlunoDto> {
    const response = await this.client.put<Partial<AlunoDto>, AlunoDto>(
      `${this.getEndpoint()}/${id}`,
      data,
      this.configureHeaders()
    )
    return this.transform(response)
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
