import { ArchbaseAuthenticator, ArchbaseUser, ArchbaseAccessToken } from '@archbase/security'
import { ARCHBASE_IOC_API_TYPE } from '@archbase/data'
import type { ArchbaseRemoteApiClient } from '@archbase/data'
import { inject, injectable } from 'inversify'
import { ArchbaseTenantManager } from '@archbase/security'
import type { ContextualAuthenticationRequest } from '@archbase/security'
import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

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
    const response = await this.doLogin({
      email: username,
      password,
      rememberMe: true,
    })
    return this.mapToArchbaseToken(response)
  }

  /**
   * Mapeia resposta para ArchbaseAccessToken
   */
  private mapToArchbaseToken(response: any): ArchbaseAccessToken {
    return {
      access_token: response.token || response.access_token,
      refresh_token: response.refreshToken || response.refresh_token || '',
      token_type: response.tokenType || response.token_type || 'Bearer',
      expires_in: response.expiresIn || response.expires_in || 3600,
      ext_expires_in: 3600,
      scope: 'openid profile email',
      id_token: response.token || response.access_token,
      ...response,
    } as ArchbaseAccessToken
  }

  /**
   * Login com contexto (interface ArchbaseAuthenticator)
   */
  public async loginWithContext(
    request: ContextualAuthenticationRequest
  ): Promise<any> {
    console.log('🔐 AppAuthenticator.loginWithContext chamado')
    console.log('📧 Request:', request)
    const response = await this.doLogin(request as any)
    console.log('✅ Response:', response)
    return {
      ...this.mapToArchbaseToken(response),
      user: response.user,
      context: response.context,
    }
  }

  /**
   * Realiza o login interno na API
   */
  private async doLogin(request: LoginRequest): Promise<any> {
    // Obtém o tenantId selecionado, se houver
    const tenantManager = ArchbaseTenantManager.getInstance()
    const tenantId = tenantManager.currentTenant?.id

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (tenantId) {
      headers['X-TENANT-ID'] = tenantId
    }

    console.log('📤 doLogin - Headers:', headers)
    console.log('📤 doLogin - Request:', { email: request.email, rememberMe: request.rememberMe })

    // Para autenticação, geralmente não usamos token (withoutToken = true)
    const withoutToken = true

    // Adapte o endpoint conforme sua API
    return this.client.post<LoginRequest, any>('/api/v1/auth/login', request, headers, withoutToken)
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

  /**
   * Configura interceptors do Axios para:
   * 1. Adicionar token Authorization e X-TENANT-ID em todas as requisições
   * 2. Refresh automático de token em caso de 401
   */
  static setupAxiosInterceptor(): void {
    let isRefreshing = false
    let failedQueue: Array<{
      resolve: (value?: unknown) => void
      reject: (reason?: unknown) => void
    }> = []

    const processQueue = (error: unknown, token: string | null = null) => {
      failedQueue.forEach((prom) => {
        if (error) {
          prom.reject(error)
        } else {
          prom.resolve(token)
        }
      })
      failedQueue = []
    }

    // Interceptor de REQUEST - adiciona token e tenant
    axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }

        const tenantManager = ArchbaseTenantManager.getInstance()
        const tenantId = tenantManager.currentTenant?.id
        if (tenantId) {
          config.headers['X-TENANT-ID'] = tenantId
        }

        return config
      },
      (error) => Promise.reject(error)
    )

    // Interceptor de RESPONSE - refresh automático em 401
    axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // Só tenta refresh em 401 (não em 403 que é permissão)
        if (error.response?.status === 401 && !originalRequest._retry) {
          // Se já está fazendo refresh, enfileira o request
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject })
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return axios(originalRequest)
            })
          }

          originalRequest._retry = true
          isRefreshing = true

          const refreshToken = localStorage.getItem('refreshToken')
          if (!refreshToken) {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
            return Promise.reject(error)
          }

          try {
            const response = await axios.post('/api/v1/auth/refresh', { token: refreshToken })
            const newToken = response.data.access_token || response.data.token
            localStorage.setItem('accessToken', newToken)
            if (response.data.refresh_token || response.data.refreshToken) {
              localStorage.setItem('refreshToken', response.data.refresh_token || response.data.refreshToken)
            }
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            processQueue(null, newToken)
            return axios(originalRequest)
          } catch (refreshError) {
            processQueue(refreshError, null)
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
            return Promise.reject(refreshError)
          } finally {
            isRefreshing = false
          }
        }

        return Promise.reject(error)
      }
    )
  }
}
