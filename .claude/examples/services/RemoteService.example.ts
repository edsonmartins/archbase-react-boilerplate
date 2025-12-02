/**
 * Exemplo: Service Remoto com Archbase
 *
 * Este exemplo demonstra como criar um service que
 * estende ArchbaseRemoteApiService com métodos customizados.
 *
 * IMPORTANTE: Este exemplo usa as APIs corretas da biblioteca archbase-react-v3
 * - Requer implementação de getId() e isNewRecord()
 * - Usa findOne() (não findById)
 * - Usa type import para ArchbaseRemoteApiClient
 */

import { injectable, inject } from 'inversify'
import { ArchbaseRemoteApiService } from '@archbase/data'
import type { ArchbaseRemoteApiClient } from '@archbase/data'  // IMPORTANTE: usar 'type' import
import { ARCHBASE_IOC_API_TYPE } from '@archbase/core'

// ===========================================
// 1. DEFINIR DTO
// ===========================================
export interface UserDto {
  id: string
  name: string
  email: string
  phone?: string
  birthDate?: Date
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  active: boolean
  avatar?: string
  roles?: string[]
  createdAt?: Date
  updatedAt?: Date
}

// ===========================================
// 2. DEFINIR SERVICE
// ===========================================
@injectable()
export class UserService extends ArchbaseRemoteApiService<UserDto, string> {
  // ------------------------------------------
  // 2.1 Construtor com injeção
  // ------------------------------------------
  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient) client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  // ------------------------------------------
  // 2.2 Endpoint da API (SEMPRE PLURAL!)
  // OBRIGATÓRIO: método abstrato
  // ------------------------------------------
  protected getEndpoint(): string {
    return '/api/v1/users'
  }

  // ------------------------------------------
  // 2.3 Extrair ID da entidade
  // OBRIGATÓRIO: método abstrato
  // ------------------------------------------
  public getId(entity: UserDto): string {
    return entity.id
  }

  // ------------------------------------------
  // 2.4 Verificar se é registro novo
  // OBRIGATÓRIO: método abstrato
  // ------------------------------------------
  public isNewRecord(entity: UserDto): boolean {
    return !entity.id || entity.id === ''
  }

  // ------------------------------------------
  // 2.5 Headers padrão
  // OBRIGATÓRIO: método abstrato
  // ------------------------------------------
  protected configureHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json'
    }
  }

  // ------------------------------------------
  // 2.6 Transformar entidade (OPCIONAL)
  // Útil para converter datas de string para Date
  // ------------------------------------------
  protected transform(entity: UserDto): UserDto {
    if (entity.createdAt && typeof entity.createdAt === 'string') {
      entity.createdAt = new Date(entity.createdAt)
    }
    if (entity.updatedAt && typeof entity.updatedAt === 'string') {
      entity.updatedAt = new Date(entity.updatedAt)
    }
    if (entity.birthDate && typeof entity.birthDate === 'string') {
      entity.birthDate = new Date(entity.birthDate)
    }
    return entity
  }

  // ===========================================
  // 3. MÉTODOS CUSTOMIZADOS
  // ===========================================

  // ------------------------------------------
  // 3.1 GET - Busca por email
  // ------------------------------------------
  async findByEmail(email: string): Promise<UserDto> {
    const headers = this.configureHeaders()
    const result = await this.client.get<UserDto>(
      `${this.getEndpoint()}/email/${encodeURIComponent(email)}`,
      headers,
      false  // não mostrar loading global
    )
    return this.transform(result)
  }

  // ------------------------------------------
  // 3.2 GET - Busca usuários ativos
  // ------------------------------------------
  async findActive(): Promise<UserDto[]> {
    const headers = this.configureHeaders()
    const result = await this.client.get<UserDto[]>(
      `${this.getEndpoint()}?active=true`,
      headers,
      false
    )
    return result.map(item => this.transform(item))
  }

  // ------------------------------------------
  // 3.3 GET - Busca com filtros
  // ------------------------------------------
  async search(filters: {
    name?: string
    email?: string
    status?: string
    page?: number
    size?: number
  }): Promise<{ content: UserDto[]; totalElements: number }> {
    const headers = this.configureHeaders()
    const params = new URLSearchParams()

    if (filters.name) params.append('name', filters.name)
    if (filters.email) params.append('email', filters.email)
    if (filters.status) params.append('status', filters.status)
    if (filters.page !== undefined) params.append('page', filters.page.toString())
    if (filters.size !== undefined) params.append('size', filters.size.toString())

    const queryString = params.toString()
    const url = queryString
      ? `${this.getEndpoint()}/search?${queryString}`
      : `${this.getEndpoint()}/search`

    const result = await this.client.get<{ content: UserDto[]; totalElements: number }>(
      url,
      headers,
      false
    )

    return {
      content: result.content.map(item => this.transform(item)),
      totalElements: result.totalElements
    }
  }

  // ------------------------------------------
  // 3.4 PUT - Atualizar status
  // ------------------------------------------
  async updateStatus(id: string, active: boolean): Promise<UserDto> {
    const headers = this.configureHeaders()
    const result = await this.client.put<{ active: boolean }, UserDto>(
      `${this.getEndpoint()}/${id}/status`,
      { active },
      headers,
      false
    )
    return this.transform(result)
  }

  // ------------------------------------------
  // 3.5 PUT - Ativar usuário
  // ------------------------------------------
  async activate(id: string): Promise<UserDto> {
    const headers = this.configureHeaders()
    const result = await this.client.put<void, UserDto>(
      `${this.getEndpoint()}/${id}/activate`,
      undefined,
      headers,
      false
    )
    return this.transform(result)
  }

  // ------------------------------------------
  // 3.6 PUT - Desativar usuário
  // ------------------------------------------
  async deactivate(id: string): Promise<UserDto> {
    const headers = this.configureHeaders()
    const result = await this.client.put<void, UserDto>(
      `${this.getEndpoint()}/${id}/deactivate`,
      undefined,
      headers,
      false
    )
    return this.transform(result)
  }

  // ------------------------------------------
  // 3.7 PUT - Alterar senha
  // ------------------------------------------
  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    const headers = this.configureHeaders()
    await this.client.put<{ oldPassword: string; newPassword: string }, void>(
      `${this.getEndpoint()}/${id}/password`,
      { oldPassword, newPassword },
      headers,
      false
    )
  }

  // ------------------------------------------
  // 3.8 POST - Reset de senha
  // ------------------------------------------
  async resetPassword(email: string): Promise<void> {
    const headers = this.configureHeaders()
    await this.client.post<{ email: string }, void>(
      `${this.getEndpoint()}/reset-password`,
      { email },
      headers,
      false
    )
  }

  // ------------------------------------------
  // 3.9 POST - Upload de avatar
  // ------------------------------------------
  async uploadAvatar(id: string, file: File): Promise<UserDto> {
    const formData = new FormData()
    formData.append('file', file)

    // Para FormData, não definir Content-Type (browser define automaticamente)
    const headers = { ...this.configureHeaders() }
    delete headers['Content-Type']

    const result = await this.client.post<FormData, UserDto>(
      `${this.getEndpoint()}/${id}/avatar`,
      formData,
      headers,
      false
    )
    return this.transform(result)
  }

  // ------------------------------------------
  // 3.10 POST - Criar em lote
  // ------------------------------------------
  async bulkCreate(users: Omit<UserDto, 'id'>[]): Promise<UserDto[]> {
    const headers = this.configureHeaders()
    const result = await this.client.post<Omit<UserDto, 'id'>[], UserDto[]>(
      `${this.getEndpoint()}/bulk`,
      users,
      headers,
      false
    )
    return result.map(item => this.transform(item))
  }

  // ------------------------------------------
  // 3.11 DELETE - Exclusão em lote
  // ------------------------------------------
  async bulkDelete(ids: string[]): Promise<void> {
    const headers = this.configureHeaders()
    await this.client.post<string[], void>(
      `${this.getEndpoint()}/bulk-delete`,
      ids,
      headers,
      false
    )
  }

  // ------------------------------------------
  // 3.12 POST - Atribuir roles
  // ------------------------------------------
  async assignRoles(id: string, roleIds: string[]): Promise<UserDto> {
    const headers = this.configureHeaders()
    const result = await this.client.post<string[], UserDto>(
      `${this.getEndpoint()}/${id}/roles`,
      roleIds,
      headers,
      false
    )
    return this.transform(result)
  }
}

// ===========================================
// 4. REGISTRO NO IOC
// ===========================================

// Em src/ioc/IOCTypes.ts:
// export const API_TYPE = {
//   UserService: Symbol.for('UserService'),
// }

// Em src/ioc/ContainerIOC.ts:
// import { UserService } from '@services/UserService'
// import { API_TYPE } from './IOCTypes'
// containerIOC.bind<UserService>(API_TYPE.UserService).to(UserService)

// ===========================================
// 5. USO NO COMPONENTE
// ===========================================

// import { useArchbaseRemoteServiceApi } from '@archbase/data'
// import { API_TYPE } from '@ioc/IOCTypes'
// import { UserService } from '@services/UserService'
//
// function MyComponent() {
//   const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)
//
//   // CORRETO: usar findOne, não findById
//   const loadUser = async (id: string) => {
//     const user = await userService.findOne(id)
//     console.log(user)
//   }
//
//   const handleActivate = async (id: string) => {
//     try {
//       await userService.activate(id)
//     } catch (error) {
//       console.error(error)
//     }
//   }
// }

export default UserService
