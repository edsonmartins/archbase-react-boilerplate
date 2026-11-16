import { ArchbaseAuthenticator, ArchbaseAccessToken } from '@archbase/security'
import { ARCHBASE_IOC_API_TYPE } from '@archbase/data'
import type { ArchbaseRemoteApiClient } from '@archbase/data'
import { inject, injectable } from 'inversify'
import { ArchbaseTenantManager } from '@archbase/security'
import type { ContextualAuthenticationRequest } from '@archbase/security'
import { AppUserContext, AppLoginResponse } from './AppUser'
import { tokenDaSessao } from '../services/sessao'

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
   * Atualiza o token de acesso usando o refresh token.
   *
   * O endpoint do archbase-security é `/api/v1/auth/refresh-token` (ArchbaseAuthenticationController), com o corpo
   * `{ token }`. A rota antiga, `/api/v1/auth/refresh`, não existe (404 "No static resource"): o hook do archbase-react,
   * que renova 5 min antes de vencer, recebia o erro e encerrava a sessão — todo Admin gerado deste boilerplate perdia a
   * sessão no vencimento do token. O tenant vai como no login, para backends multitenant.
   */
  public async refreshToken(refresh_token: string): Promise<ArchbaseAccessToken> {
    const withoutToken = true
    const tenantId = ArchbaseTenantManager.getInstance().currentTenant?.id
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (tenantId) {
      headers['X-TENANT-ID'] = tenantId
    }

    return this.client.post<RefreshToken, ArchbaseAccessToken>(
      AppAuthenticator.ENDPOINT_DE_REFRESH,
      { token: refresh_token },
      headers,
      withoutToken
    )
  }

  /** O endpoint de renovação do archbase-security. */
  static readonly ENDPOINT_DE_REFRESH = '/api/v1/auth/refresh-token'

  /**
   * Faz logout do usuário
   */
  public async logout(): Promise<void> {
    // O token da sessão vem do token manager do archbase. A chave `accessToken` do localStorage ninguém grava (o
    // archbase guarda o token cifrado em outra): lido dali, o logout saía sem token (VEN-1126 do VendaX, 16/11).
    const accessToken = tokenDaSessao()

    if (accessToken) {
      try {
        await this.client.post<Record<string, never>, void>(
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
    const accessToken = tokenDaSessao()
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

  // O interceptor de 401 que morava aqui (setupAxiosInterceptor) nunca era ligado e lia o token de chaves do
  // localStorage que ninguém grava. Desde a 4.13.4 o cliente do archbase reage ao 401 sozinho: tenta o token que
  // outra aba guardou, senão uma renovação compartilhada, e encerra a sessão se ela for negada. Para `fetch` fora do
  // cliente (baixar arquivo), use `fetchComSessao` de `services/sessao`.
}
