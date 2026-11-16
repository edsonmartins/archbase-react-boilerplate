import { beforeEach, describe, expect, it, vi } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

// Num Admin gerado deste boilerplate (VendaX, VEN-1126, 16/11), os pedidos que liam `localStorage.getItem('accessToken')`
// saíam sem Authorization: o archbase não grava essa chave. A sessão vem do token manager do archbase.

const estado = vi.hoisted(() => ({ guardado: null as string | null, renovador: null as null | ((t: string) => Promise<string | null>) }))

vi.mock('@archbase/core', () => ({
  ARCHBASE_IOC_API_TYPE: { TokenManager: 'TokenManager' },
  IOCContainer: {
    getContainer: () => ({ get: () => ({ getToken: () => (estado.guardado ? { access_token: estado.guardado } : null) }) }),
  },
}))
vi.mock('@archbase/data', () => ({ getArchbaseTokenRenewer: () => estado.renovador }))

const { fetchComSessao, tokenDaSessao } = await import('./sessao')

const resposta = (status: number) => ({ status }) as Response
const fetchMock = vi.fn()
const autorizacao = (i: number) => (fetchMock.mock.calls[i][1].headers as Record<string, string>).Authorization

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
  estado.guardado = 'velho'
  estado.renovador = null
})

describe('fetchComSessao', () => {
  it('leva o token da sessão, o do archbase', async () => {
    fetchMock.mockResolvedValue(resposta(200))
    await fetchComSessao('/x', { headers: { 'X-TENANT-ID': 't' } })
    expect(autorizacao(0)).toBe('Bearer velho')
    expect(fetchMock.mock.calls[0][1].headers['X-TENANT-ID']).toBe('t')
    expect(tokenDaSessao()).toBe('velho')
  })

  it('no 401, repete uma vez com o token que outra aba já gravou', async () => {
    fetchMock.mockImplementationOnce(async () => {
      estado.guardado = 'novo'
      return resposta(401)
    }).mockResolvedValueOnce(resposta(200))
    const r = await fetchComSessao('/x')
    expect(r.status).toBe(200)
    expect(autorizacao(1)).toBe('Bearer novo')
  })

  it('no 401 com o mesmo token guardado, pede a renovação e repete com o renovado', async () => {
    estado.renovador = vi.fn().mockResolvedValue('renovado')
    fetchMock.mockResolvedValueOnce(resposta(401)).mockResolvedValueOnce(resposta(200))
    await fetchComSessao('/x')
    expect(estado.renovador).toHaveBeenCalledWith('velho')
    expect(autorizacao(1)).toBe('Bearer renovado')
  })

  it('renovação negada: devolve o 401, sem segunda tentativa', async () => {
    estado.renovador = vi.fn().mockResolvedValue(null)
    fetchMock.mockResolvedValue(resposta(401))
    const r = await fetchComSessao('/x')
    expect(r.status).toBe(401)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})

describe('ninguém mais lê as chaves que o archbase não grava', () => {
  const raiz = resolve(__dirname, '..')
  const fontes = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) => {
      const p = join(dir, n)
      if (statSync(p).isDirectory()) return fontes(p)
      return /\.(ts|tsx)$/.test(n) && !/\.test\./.test(n) ? [p] : []
    })

  it("nenhum arquivo de src/ lê localStorage 'accessToken' ou 'refreshToken'", () => {
    const quem = fontes(raiz).filter((p) => /localStorage\.getItem\(\s*['"](accessToken|refreshToken)['"]/.test(readFileSync(p, 'utf8')))
    expect(quem).toEqual([])
  })
})
