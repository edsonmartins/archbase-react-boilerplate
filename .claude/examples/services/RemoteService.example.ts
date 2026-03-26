/**
 * Exemplo: Service Remoto com Archbase
 *
 * Padrão validado contra gestor-rq-admin (produção).
 *
 * IMPORTANTE:
 * - Requer implementação de getId(), isNewRecord(), getEndpoint(), configureHeaders()
 * - Usa findOne() (não findById)
 * - Usa type import para ArchbaseRemoteApiClient
 * - configureHeaders() retorna {} (vazio)
 * - DTOs são classes (não interfaces) com isNew e class-validator
 */

import { injectable, inject } from 'inversify'
import { ArchbaseRemoteApiService } from '@archbase/data'
import type { ArchbaseRemoteApiClient } from '@archbase/data'  // IMPORTANTE: usar 'type' import
import { IsNotEmpty, IsString, IsEnum } from 'class-validator'
import { API_TYPE } from '../../ioc/RapidexIOCTypes'

// ===========================================
// 1. DEFINIR ENUMS + VALUES
// ===========================================
export enum StatusUser {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  PENDENTE = 'PENDENTE',
}

export const StatusUserValues = [
  { value: StatusUser.ATIVO, label: 'Ativo' },
  { value: StatusUser.INATIVO, label: 'Inativo' },
  { value: StatusUser.PENDENTE, label: 'Pendente' },
]

// ===========================================
// 2. DEFINIR DTO (CLASSE, não interface!)
// ===========================================
export class UserDto {
  @IsNotEmpty({ message: 'ID é obrigatório' })
  id: string

  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @IsString()
  name: string

  email: string
  phone: string

  @IsEnum(StatusUser)
  status: StatusUser

  active: boolean
  avatar: string
  roles: string[]

  isNew: boolean  // OBRIGATÓRIO: controle de novo registro

  constructor(data: any = {}) {
    this.id = data.id || ''
    this.name = data.name || ''
    this.email = data.email || ''
    this.phone = data.phone || ''
    this.status = data.status || StatusUser.ATIVO
    this.active = data.active ?? true
    this.avatar = data.avatar || ''
    this.roles = data.roles || []
    this.isNew = data.isNew || false
  }

  static newInstance = () => {
    return new UserDto({
      name: '',
      email: '',
      phone: '',
      status: StatusUser.ATIVO,
      active: true,
      isNew: true,  // Marcar como novo
    })
  }
}

// ===========================================
// 3. DEFINIR SERVICE
// ===========================================
@injectable()
export class UserService extends ArchbaseRemoteApiService<UserDto, string> {
  constructor(
    @inject(API_TYPE.ApiClient) client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  // OBRIGATÓRIO: Endpoint da API (SEMPRE PLURAL!)
  protected getEndpoint(): string {
    return '/api/v1/users'
  }

  // OBRIGATÓRIO: Headers (retornar vazio!)
  protected configureHeaders(): Record<string, string> {
    return {}
  }

  // OPCIONAL: Transformar dados da API para DTO
  protected transform(data: any): UserDto {
    return new UserDto(data)
  }

  // OBRIGATÓRIO: Extrair ID da entidade
  public getId(entity: UserDto): string {
    return entity.id || ''
  }

  // OBRIGATÓRIO: Verificar se é registro novo (usar isNew!)
  public isNewRecord(entity: UserDto): boolean {
    return entity.isNew
  }

  // ===========================================
  // 4. MÉTODOS CUSTOMIZADOS
  // ===========================================

  // GET - Busca por email
  async findByEmail(email: string): Promise<UserDto> {
    const headers = this.configureHeaders()
    const result = await this.client.get<UserDto>(
      `${this.getEndpoint()}/email/${encodeURIComponent(email)}`,
      headers,
      false
    )
    return this.transform(result)
  }

  // GET - Busca usuários ativos
  async findActive(): Promise<UserDto[]> {
    const headers = this.configureHeaders()
    const result = await this.client.get<UserDto[]>(
      `${this.getEndpoint()}?active=true`,
      headers,
      false
    )
    return result.map(item => this.transform(item))
  }

  // PUT - Ativar usuário
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

  // PUT - Desativar usuário
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

  // POST - Atribuir roles
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
// 5. REGISTRO NO IOC
// ===========================================

// Em src/ioc/RapidexIOCTypes.ts:
// export const API_TYPE = {
//   User: Symbol.for('UserService'),
// }

// Em src/ioc/RapidexContainerIOC.ts:
// container.bind<UserService>(API_TYPE.User).to(UserService)

// ===========================================
// 6. USO NO COMPONENTE
// ===========================================

// const serviceApi = useArchbaseRemoteServiceApi<UserService>(API_TYPE.User)
//
// // CORRETO: usar findOne, não findById
// const user = await serviceApi.findOne(id)
//
// // Usar em DataSource V2
// const { dataSource } = useArchbaseRemoteDataSourceV2<UserDto>({
//   name: 'dsUsers',
//   service: serviceApi,
//   pageSize: 25,
// })

export default UserService
