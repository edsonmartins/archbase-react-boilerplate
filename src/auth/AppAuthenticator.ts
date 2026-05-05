import { ArchbaseAuthenticator, ArchbaseAccessToken } from '@archbase/security'
import { ARCHBASE_IOC_API_TYPE } from '@archbase/data'
import type { ArchbaseRemoteApiClient } from '@archbase/data'
import { inject, injectable } from 'inversify'
import { ArchbaseTenantManager } from '@archbase/security'
import type { ContextualAuthenticationRequest } from '@archbase/security'
import { AppUserContext, AppLoginResponse } from './AppUser'
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
  context?: string
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
    return this.client.post<{ email: string }, void>(
      '/api/v1/auth/forgot-password',
      { email },
      {},
      true
    )
  }

  /**
   * Reseta a senha do usuário
   */
  resetPassword(email: string, passwordResetToken: string, newPassword: string): Promise<void> {
    return this.client.post<{ email: string; token: string; newPassword: string }, void>(
      '/api/v1/auth/reset-password',
      { email, token: passwordResetToken, newPassword },
      {},
      true
    )
  }

  /**
   * Login com usuário e senha (método básico)
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
   * Login com contexto (método recomendado)
   *
   * Este método é chamado pelo useArchbaseAuthenticationManager quando
   * loginWithContext é usado no componente de login.
   */
  public async loginWithContext(
    request: ContextualAuthenticationRequest
  ): Promise<any> {
    const response = await this.doLogin(request as any)
    return {
      ...this.mapToArchbaseToken(response),
      user: response.user,
      context: response.context,
    }
  }

  /**
   * Mapeia resposta da API para ArchbaseAccessToken
   */
  private mapToArchbaseToken(response: AppLoginResponse): ArchbaseAccessToken {
    return {
      access_token: response.token || response.access_token,
      refresh_token: response.refreshToken || response.refresh_token || '',
      token_type: response.tokenType || response.token_type || 'Bearer',
      expires_in: response.expires_in || 3600,
      ext_expires_in: 3600,
      scope: 'openid profile email',
      id_token: response.token || response.access_token,
      ...response,
    } as ArchbaseAccessToken
  }

  /**
   * Realiza o login interno na API
   */
  private async doLogin(request: LoginRequest): Promise<AppLoginResponse> {
    // Obtém o tenantId selecionado, se houver
    const tenantManager = ArchbaseTenantManager.getInstance()
    const tenantId = tenantManager.currentTenant?.id

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (tenantId) {
      headers['X-TENANT-ID'] = tenantId
    }

    // Para autenticação, geralmente não usamos token (withoutToken = true)
    const withoutToken = true

    // Adapte o endpoint conforme sua API
    return this.client.post<LoginRequest, AppLoginResponse>(
      '/api/v1/auth/login',
      request,
      headers,
      withoutToken
    )
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
    localStorage.removeItem('userContext')
  }

  /**
   * Obtém o usuário atual
   */
  public async getCurrentUser(): Promise<AppUserContext | null> {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      return null
    }

    try {
      const response = await this.client.get<AppUserContext>(
        '/api/v1/auth/me',
        {
          Authorization: `Bearer ${accessToken}`,
        },
        false
      )

      return response
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error)
      return null
    }
  }

  /**
   * Configura interceptor Axios para refresh automático de token em 401.
   * Faz queue de requests concorrentes durante o refresh.
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

    axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

        // Ignora interceptor para endpoints de autenticação (login, refresh, etc)
        const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') ||
                               originalRequest?.url?.includes('/auth/refresh') ||
                               originalRequest?.url?.includes('/auth/tenants')

        if (isAuthEndpoint) {
          return Promise.reject(error)
        }

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
      },
    )
  }
}
