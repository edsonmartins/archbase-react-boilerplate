import { ArchbaseUser } from '@archbase/security'

/**
 * Contexto do usuário da aplicação
 *
 * Adapte os campos conforme necessário para seu domínio.
 */
interface AppUserContext {
  type: 'WEB_ADMIN' | 'MOBILE_APP'
  userId: string
  fullName: string
  email: string
  phone?: string
  role: string
  status: 'ATIVO' | 'INATIVO' | 'BLOQUEADO'
  avatarUrl?: string

  // Território/Região
  territoryId?: string
  territoryName?: string

  // Equipe
  teamId?: string
  teamName?: string

  // Supervisor
  supervisorId?: string
  supervisorName?: string

  // Permissões
  permissions: string[]

  // Flags de contexto
  isActive: boolean
  lastLogin?: string
  lastActivity?: string
}

/**
 * Resposta de login da aplicação
 * Compatível com ArchbaseAccessToken
 */
interface AppLoginResponse {
  // Campos da API
  token: string
  refreshToken?: string
  tokenType: string
  expiresAt: string
  user: {
    id: string
    email: string
    name: string
  }
  context: AppUserContext

  // Campos compatíveis com ArchbaseAccessToken
  access_token?: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
  ext_expires_in?: number
  scope?: string
  id_token?: string
}

/**
 * Classe de usuário customizada
 *
 * Estende ArchbaseUser para adicionar propriedades específicas do seu app.
 * Adicione aqui os campos que seu usuário precisa ter.
 */
export class AppUser extends ArchbaseUser {
  public id: string
  public userId?: string
  public displayName: string
  public email: string
  public photo: string
  public isAdmin: boolean
  public role: string
  public fullName: string
  public phone?: string
  public permissions: string[]
  public isActive: boolean
  public status: string
  public teamId?: string
  public teamName?: string
  public territoryId?: string
  public territoryName?: string
  public supervisorId?: string

  constructor(data: any) {
    super(data)
    this.id = data.id || data.userId || ''
    this.userId = data.userId || data.id
    this.displayName = data.displayName || data.name || ''
    this.email = data.email || ''
    this.photo = data.photo || data.avatar || data.avatarUrl || ''
    this.isAdmin = data.isAdmin || false
    this.role = data.role || 'USER'
    this.fullName = data.fullName || data.displayName || data.name || ''
    this.phone = data.phone
    this.permissions = data.permissions || []
    this.isActive = data.isActive !== undefined ? data.isActive : true
    this.status = data.status || 'ATIVO'
    this.teamId = data.teamId
    this.teamName = data.teamName
    this.territoryId = data.territoryId
    this.territoryName = data.territoryName
    this.supervisorId = data.supervisorId
  }

  public isAdministrator = (): boolean => {
    return this.isAdmin
  }

  public hasPermission = (permission: string): boolean => {
    return this.permissions.includes(permission) || this.isAdmin
  }

  public hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((p) => this.permissions.includes(p)) || this.isAdmin
  }
}

export type { AppUserContext, AppLoginResponse }
