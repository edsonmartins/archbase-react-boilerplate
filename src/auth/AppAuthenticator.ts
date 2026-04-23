import { ArchbaseAuthenticator, ArchbaseUser, ArchbaseAccessToken } from '@archbase/security'
import { ARCHBASE_IOC_API_TYPE } from '@archbase/data'
import type { ArchbaseRemoteApiClient } from '@archbase/data'
import { inject, injectable } from 'inversify'
import { ArchbaseTenantManager } from '@archbase/security'

/**
 * Interface para o token de refresh
 */
interface RefreshToken {
  token: string
}

/**
 * Interface para requisição de login
 */
interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

/**
 * Classe de usuário customizada
 *
 * Estende ArchbaseUser para adicionar propriedades específicas do seu app.
 * Adicione aqui os campos que seu usuário precisa ter.
 */
export class AppUser extends ArchbaseUser {
  public id: string
  public displayName: string
  public email: string
  public photo: string
  public isAdmin: boolean
  public role: string
  public permissions: string[]
  public isActive: boolean

  constructor(data: any) {
    super(data)
    this.id = data.id || ''
    this.displayName = data.displayName || data.name || ''
    this.email = data.email || ''
    this.photo = data.photo || data.avatar || ''
    this.isAdmin = data.isAdmin || false
    this.role = data.role || 'USER'
    this.permissions = data.permissions || []
    this.isActive = data.isActive !== undefined ? data.isActive : true
  }

  public isAdministrator = (): boolean => {
    return this.isAdmin
  }
}

/**
 * Autenticador customizado
 *
 * Implementa ArchbaseAuthenticator para fornecer autenticação customizada.
 * Adapte os endpoints e a lógica conforme sua API.
 */
@injectable()
export class AppAuthenticator implements ArchbaseAuthenticator {
  private client: ArchbaseRemoteApiClient

  constructor(@inject(ARCHBASE_IOC_API_TYPE.ApiClient) client: ArchbaseRemoteApiClient) {
    this.client = client
  }

  /**
   * Envia email de reset de senha
   */
  sendResetPasswordEmail(email: string): Promise<void> {
    // TODO: Implementar conforme sua API
    throw new Error('Method not implemented.')
  }

  /**
   * Reseta a senha do usuário
   */
  resetPassword(email: string, passwordResetToken: string, newPassword: string): Promise<void> {
    // TODO: Implementar conforme sua API
    throw new Error('Method not implemented.')
  }

  /**
   * Login com usuário e senha
   */
  public async login(username: string, password: string): Promise<ArchbaseAccessToken> {
    // Obtém o tenantId selecionado, se houver
    const tenantManager = ArchbaseTenantManager.getInstance()
    const tenantId = tenantManager.currentTenant?.id

    const headers: Record<string, string> = {}
    if (tenantId) {
      headers['X-TENANT-ID'] = tenantId
    }

    const request: LoginRequest = {
      email: username,
      password,
      rememberMe: true,
    }

    // Para autenticação, geralmente não usamos token (withoutToken = true)
    const withoutToken = true

    // Adapte o endpoint conforme sua API
    return this.client.post<LoginRequest, ArchbaseAccessToken>('/api/v1/auth/login', request, headers, withoutToken)
  }

  /**
   * Atualiza o token de acesso usando o refresh token
   */
  public async refreshToken(refresh_token: string): Promise<ArchbaseAccessToken> {
    const withoutToken = true

    return this.client.post<RefreshToken, ArchbaseAccessToken>(
      '/api/v1/auth/refresh',
      { token: refresh_token },
      {},
      withoutToken
    )
  }

  /**
   * Faz logout do usuário
   */
  public async logout(): Promise<void> {
    const accessToken = localStorage.getItem('accessToken')

    if (accessToken) {
      try {
        await this.client.post<{}, void>(
          '/api/v1/auth/logout',
          {},
          {
            Authorization: `Bearer ${accessToken}`,
          },
          false
        )
      } catch (error) {
        console.warn('Erro no logout:', error)
      }
    }

    // Limpar tokens locais
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
}
