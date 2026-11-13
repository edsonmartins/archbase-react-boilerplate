import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// A renovação do token é a rota do archbase-security (ArchbaseAuthenticationController: POST /api/v1/auth/refresh-token,
// corpo { token }). /api/v1/auth/refresh não existe (404): o hook do archbase-react, que renova 5 min antes de vencer,
// recebia o erro e encerrava a sessão de todo Admin gerado deste boilerplate. Lê a fonte porque importar o
// AppAuthenticator puxa o @archbase inteiro.
describe('renovação do token — a rota do archbase-security, com o tenant', () => {
  const fonte = readFileSync(resolve(__dirname, 'AppAuthenticator.ts'), 'utf8')
  const refresh = fonte.slice(fonte.indexOf('public async refreshToken'), fonte.indexOf('ENDPOINT_DE_REFRESH ='))

  it('renova em /api/v1/auth/refresh-token, e não na rota antiga, que não existe', () => {
    expect(fonte).toContain("ENDPOINT_DE_REFRESH = '/api/v1/auth/refresh-token'")
    expect(fonte).not.toContain("'/api/v1/auth/refresh'")
    expect(refresh).toContain('AppAuthenticator.ENDPOINT_DE_REFRESH')
  })

  it('manda o refresh token no corpo e o tenant no cabeçalho, como o login', () => {
    expect(refresh).toContain('{ token: refresh_token }')
    expect(refresh).toContain("headers['X-TENANT-ID'] = tenantId")
  })
})
