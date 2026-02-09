/**
 * TEMPLATE: Remote Service com Archbase
 *
 * Este template demonstra o padrão recomendado para criar services
 * que se comunicam com APIs REST.
 *
 * Substitua:
 * - Entity -> Nome da sua entidade (ex: User, Product, Order)
 * - EntityDto -> DTO da entidade (ex: UserDto, ProductDto)
 * - /api/v1/entities -> Endpoint da sua API
 */

import { injectable, inject } from 'inversify'
import { ArchbaseRemoteApiService } from '@archbase/data'
import type { ArchbaseRemoteApiClient } from '@archbase/data' // IMPORTANTE: usar 'type' import!
import { ARCHBASE_IOC_API_TYPE } from '@archbase/core'

// TODO: Importar do seu projeto
// import { EntityDto } from '@/domain/EntityDto'

// Placeholder - substitua pelo seu DTO
interface EntityDto {
  id: string
  name: string
  status: string
  isNewRecord?: boolean
}

// =============================================================================
// SERVICE BÁSICO
// =============================================================================

/**
 * Service básico para operações CRUD.
 * Estende ArchbaseRemoteApiService que já fornece:
 * - findAll() - Listar todos
 * - findOne(id) - Buscar por ID
 * - save(entity) - Salvar (criar ou atualizar)
 * - delete(id) - Remover
 * - findAllWithPage(page, size) - Paginação
 * - findAllWithFilterAndSort(filter, page, size, sort) - Filtro e ordenação
 */
@injectable()
export class EntityRemoteService extends ArchbaseRemoteApiService<EntityDto, string> {
  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient) client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  // ============================================
  // MÉTODOS OBRIGATÓRIOS
  // ============================================

  /**
   * Endpoint da API (sempre plural!)
   */
  protected getEndpoint(): string {
    return '/api/v1/entities'
  }

  /**
   * Extrair ID da entidade
   */
  public getId(entity: EntityDto): string {
    return entity.id
  }

  /**
   * Verificar se é registro novo
   */
  public isNewRecord(entity: EntityDto): boolean {
    return !entity.id || entity.id === '' || entity.isNewRecord === true
  }

  /**
   * Headers padrão para requisições
   */
  protected configureHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json'
    }
  }

  /**
   * Transformar resposta da API em DTO tipado
   */
  protected transform(entity: EntityDto): EntityDto {
    return new EntityDtoImpl(entity)
  }
}

// Implementação do DTO para o transform
class EntityDtoImpl implements EntityDto {
  id: string
  name: string
  status: string
  isNewRecord?: boolean

  constructor(data: any) {
    this.id = data.id || ''
    this.name = data.name || ''
    this.status = data.status || 'ACTIVE'
    this.isNewRecord = data.isNewRecord || false
  }
}

// =============================================================================
// SERVICE AVANÇADO COM MÉTODOS CUSTOMIZADOS
// =============================================================================

// Interfaces auxiliares
interface EntityStatsDto {
  total: number
  active: number
  inactive: number
  pending: number
}

interface EntityFiltersDto {
  name?: string
  status?: string
  startDate?: string
  endDate?: string
}

interface PageResult<T> {
  content: T[]
  totalElements: number
  totalPages: number
  pageable: {
    pageNumber: number
    pageSize: number
  }
}

/**
 * Service avançado com métodos customizados para operações específicas.
 */
@injectable()
export class EntityRemoteServiceAdvanced extends ArchbaseRemoteApiService<EntityDto, string> {
  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient) client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  protected getEndpoint(): string {
    return '/api/v1/entities'
  }

  public getId(entity: EntityDto): string {
    return entity.id
  }

  public isNewRecord(entity: EntityDto): boolean {
    return !entity.id || entity.id === ''
  }

  protected configureHeaders(): Record<string, string> {
    return { 'Content-Type': 'application/json' }
  }

  protected transform(entity: EntityDto): EntityDto {
    return new EntityDtoImpl(entity)
  }

  // ============================================
  // MÉTODOS CUSTOMIZADOS
  // ============================================

  /**
   * Busca com filtros avançados
   */
  async findWithFilters(
    filters: EntityFiltersDto,
    page: number = 0,
    size: number = 20
  ): Promise<PageResult<EntityDto>> {
    const response = await this.client.get(
      `${this.getEndpoint()}/search`,
      { ...filters, page, size },
      false
    )
    return {
      ...response,
      content: response.content.map((item: EntityDto) => this.transform(item))
    }
  }

  /**
   * Obter estatísticas
   */
  async getStats(): Promise<EntityStatsDto> {
    const response = await this.client.get(
      `${this.getEndpoint()}/stats`,
      {},
      false
    )
    return response as EntityStatsDto
  }

  /**
   * Operações em massa - Ativar
   */
  async bulkActivate(ids: string[]): Promise<void> {
    await this.client.put(
      `${this.getEndpoint()}/bulk-activate`,
      { ids },
      false
    )
  }

  /**
   * Operações em massa - Desativar
   */
  async bulkDeactivate(ids: string[]): Promise<void> {
    await this.client.put(
      `${this.getEndpoint()}/bulk-deactivate`,
      { ids },
      false
    )
  }

  /**
   * Operações em massa - Remover
   */
  async bulkDelete(ids: string[]): Promise<void> {
    await this.client.delete(
      `${this.getEndpoint()}/bulk`,
      { ids },
      false
    )
  }

  /**
   * Duplicar entidade
   */
  async duplicate(id: string): Promise<EntityDto> {
    const response = await this.client.post(
      `${this.getEndpoint()}/${id}/duplicate`,
      {},
      false
    )
    return this.transform(response as EntityDto)
  }

  /**
   * Verificar se nome existe
   */
  async checkNameExists(name: string, excludeId?: string): Promise<boolean> {
    const response = await this.client.get(
      `${this.getEndpoint()}/check-name`,
      { name, excludeId },
      false
    )
    return response.exists
  }

  /**
   * Exportar dados
   */
  async exportToExcel(filters?: EntityFiltersDto): Promise<Blob> {
    const response = await this.client.get(
      `${this.getEndpoint()}/export`,
      filters || {},
      false,
      { responseType: 'blob' }
    )
    return response as Blob
  }

  /**
   * Atualização parcial (PATCH)
   */
  async partialUpdate(id: string, data: Partial<EntityDto>): Promise<EntityDto> {
    const response = await this.client.patch(
      `${this.getEndpoint()}/${id}`,
      data,
      false
    )
    return this.transform(response as EntityDto)
  }

  /**
   * Buscar por status
   */
  async findByStatus(status: string, page: number = 0, size: number = 20): Promise<PageResult<EntityDto>> {
    const response = await this.client.get(
      `${this.getEndpoint()}/by-status/${status}`,
      { page, size },
      false
    )
    return {
      ...response,
      content: response.content.map((item: EntityDto) => this.transform(item))
    }
  }

  /**
   * Ação customizada (ex: aprovar, rejeitar, processar)
   */
  async approve(id: string, comments?: string): Promise<EntityDto> {
    const response = await this.client.post(
      `${this.getEndpoint()}/${id}/approve`,
      { comments },
      false
    )
    return this.transform(response as EntityDto)
  }

  async reject(id: string, reason: string): Promise<EntityDto> {
    const response = await this.client.post(
      `${this.getEndpoint()}/${id}/reject`,
      { reason },
      false
    )
    return this.transform(response as EntityDto)
  }
}

// =============================================================================
// REGISTRO NO CONTAINER IoC
// =============================================================================

/**
 * No arquivo ioc/ContainerIOC.ts, registrar o service:
 *
 * import { EntityRemoteService } from '@/services/EntityRemoteService'
 * import { API_TYPE } from './IOCTypes'
 *
 * container.bind<EntityRemoteService>(API_TYPE.Entity).to(EntityRemoteService)
 *
 * No arquivo ioc/IOCTypes.ts, adicionar o símbolo:
 *
 * export const API_TYPE = {
 *   Entity: Symbol.for('EntityRemoteService'),
 *   // ... outros services
 * }
 */

// =============================================================================
// USO DO SERVICE
// =============================================================================

/**
 * Exemplo de uso em um componente:
 *
 * import { useArchbaseRemoteServiceApi } from 'archbase-react'
 * import { EntityRemoteService } from '@/services/EntityRemoteService'
 * import { API_TYPE } from '@/ioc/IOCTypes'
 *
 * function MyComponent() {
 *   const serviceApi = useArchbaseRemoteServiceApi<EntityRemoteService>(API_TYPE.Entity)
 *
 *   // Usar em DataSource
 *   const { dataSource } = useArchbaseRemoteDataSource<EntityDto, string>({
 *     name: 'dsEntity',
 *     service: serviceApi,
 *     pageSize: 25,
 *     loadOnStart: true
 *   })
 *
 *   // Ou chamar diretamente
 *   const handleCustomAction = async () => {
 *     const stats = await serviceApi.getStats()
 *     console.log(stats)
 *   }
 *
 *   // Operação de busca
 *   const handleSearch = async (filters: EntityFiltersDto) => {
 *     const result = await serviceApi.findWithFilters(filters, 0, 20)
 *     return result.content
 *   }
 * }
 */
