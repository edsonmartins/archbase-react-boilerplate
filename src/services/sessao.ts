import { ARCHBASE_IOC_API_TYPE, IOCContainer } from '@archbase/core'
import type { ArchbaseTokenManager } from '@archbase/core'
import { getArchbaseTokenRenewer } from '@archbase/data'

/**
 * O access token da sessão, pelo token manager do archbase — o mesmo que o `ArchbaseRemoteApiClient` usa.
 *
 * Não leia a chave `accessToken` do localStorage: o archbase guarda o token cifrado em outra chave, e essa ninguém
 * grava. Medido num Admin gerado deste boilerplate (VendaX, VEN-1126, 16/11): com a sessão de pé, a chave não existia,
 * e os pedidos que a liam saíam sem `Authorization`.
 */
export function tokenDaSessao(): string | null {
  try {
    return IOCContainer.getContainer().get<ArchbaseTokenManager>(ARCHBASE_IOC_API_TYPE.TokenManager).getToken()?.access_token ?? null
  } catch {
    return null
  }
}

/**
 * `fetch` com o token da sessão e a mesma reação ao 401 do cliente do archbase: tenta uma vez de novo com o token que
 * outra aba já gravou ou com o que a renovação (uma só, compartilhada) devolver. Sem token novo, devolve o 401.
 * Use para o que fica fora do cliente HTTP do archbase, como baixar arquivo.
 */
export async function fetchComSessao(url: string, init: RequestInit = {}): Promise<Response> {
  const comToken = (token: string | null): RequestInit => ({
    ...init,
    headers: { ...(init.headers as Record<string, string>), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  })
  const usado = tokenDaSessao()
  const r = await fetch(url, comToken(usado))
  if (r.status !== 401 || !usado) {
    return r
  }
  let novo = tokenDaSessao()
  if (!novo || novo === usado) {
    const renovador = getArchbaseTokenRenewer()
    novo = renovador ? await renovador(usado).catch(() => null) : null
  }
  return novo && novo !== usado ? fetch(url, comToken(novo)) : r
}
