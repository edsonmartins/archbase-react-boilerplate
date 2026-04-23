import { useState, useEffect } from 'react'
import { BluevixLogin } from './BluevixLogin'

interface LoginProps {
  onLogin: (username: string, password: string, rememberMe: boolean) => Promise<void>
  onSendResetPasswordEmail?: (email: string) => Promise<void>
  onResetPassword?: (email: string, token: string, newPassword: string) => Promise<void>
  error?: string | null
  credentialsExpired?: { email: string; message: string } | null
  onClearCredentialsExpired?: () => void
}

/**
 * Componente de Login do BlueVix Admin
 *
 * Tela de autenticacao com design split-screen
 * Gradiente azul/verde na esquerda, formulario na direita
 */
export function Login({
  onLogin,
  onSendResetPasswordEmail,
  onResetPassword,
  error,
  credentialsExpired,
  onClearCredentialsExpired,
}: LoginProps) {
  const [localError, setLocalError] = useState<string | undefined>(error ?? undefined)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLocalError(error ?? undefined)
  }, [error])

  const handleLogin = async (username: string, password: string, rememberMe: boolean) => {
    console.log('🔐 Login.tsx handleLogin chamado')
    console.log('📧 Username:', username)
    setLoading(true)
    try {
      console.log('📤 Chamando onLogin do App.tsx...')
      await onLogin(username, password, rememberMe)
      console.log('✅ onLogin retornou com sucesso')
    } catch (err) {
      console.error('❌ Erro no handleLogin:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <BluevixLogin
      onLogin={handleLogin}
      onSendResetPasswordEmail={onSendResetPasswordEmail}
      onResetPassword={onResetPassword}
      error={localError}
      loading={loading}
      credentialsExpired={credentialsExpired}
      onClearCredentialsExpired={onClearCredentialsExpired}
    />
  )
}
