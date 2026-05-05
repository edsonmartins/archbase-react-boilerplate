import { useState, useEffect } from 'react'
import { ArchbaseLogin } from './ArchbaseLogin'
import { APP_NAME } from '../../AppConstants'

interface LoginProps {
  onLogin: (username: string, password: string, rememberMe: boolean) => Promise<void>
  onSendResetPasswordEmail?: (email: string) => Promise<void>
  onResetPassword?: (email: string, token: string, newPassword: string) => Promise<void>
  error?: string | null
  credentialsExpired?: { email: string; message: string } | null
  onClearCredentialsExpired?: () => void
}

/**
 * Componente de Login
 *
 * Wrapper para o ArchbaseLogin que gerencia o estado de loading
 * e passa as props necessarias para o componente de UI.
 *
 * Layout split-screen com gradiente na esquerda e formulario na direita.
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
    setLoading(true)
    try {
      await onLogin(username, password, rememberMe)
    } catch (err) {
      console.error('Erro no handleLogin:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ArchbaseLogin
      onLogin={handleLogin}
      onSendResetPasswordEmail={onSendResetPasswordEmail}
      onResetPassword={onResetPassword}
      error={localError}
      loading={loading}
      credentialsExpired={credentialsExpired}
      onClearCredentialsExpired={onClearCredentialsExpired}
      appName={APP_NAME}
      appSubtitle="Painel Administrativo"
      copyrightText="Archbase"
    />
  )
}
