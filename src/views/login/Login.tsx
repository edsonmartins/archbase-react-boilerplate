import { useState } from 'react'
import {
  TextInput,
  PasswordInput,
  Checkbox,
  Button,
  Paper,
  Title,
  Text,
  Container,
  Stack,
  Alert,
  Center,
  Box,
  Anchor,
  Group,
  PinInput,
} from '@mantine/core'
import { IconAlertCircle, IconArrowLeft, IconLock } from '@tabler/icons-react'
import { archbaseI18next } from '@archbase/core'

interface LoginProps {
  onLogin: (username: string, password: string, rememberMe: boolean) => Promise<void>
  onSendResetPasswordEmail?: (email: string) => Promise<void>
  onResetPassword?: (email: string, token: string, newPassword: string) => Promise<void>
  error?: string | null
  credentialsExpired?: { email: string; message: string } | null
  onClearCredentialsExpired?: () => void
}

type LoginView = 'login' | 'forgot-password' | 'reset-password'

/**
 * Componente de Login
 *
 * Tela de autenticacao com email/senha, recuperacao de senha e reset de senha expirada.
 */
export function Login({
  onLogin,
  onSendResetPasswordEmail,
  onResetPassword,
  error,
  credentialsExpired,
  onClearCredentialsExpired,
}: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [view, setView] = useState<LoginView>('login')
  const [resetEmail, setResetEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onLogin(email, password, rememberMe)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onSendResetPasswordEmail) return
    setIsLoading(true)
    setResetError(null)
    try {
      await onSendResetPasswordEmail(resetEmail)
      setView('reset-password')
    } catch (err: any) {
      setResetError(err?.message || 'Erro ao enviar email de recuperacao')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onResetPassword) return
    if (newPassword !== confirmPassword) {
      setResetError('As senhas nao conferem')
      return
    }
    setIsLoading(true)
    setResetError(null)
    try {
      const emailToUse = credentialsExpired?.email || resetEmail
      await onResetPassword(emailToUse, resetToken, newPassword)
      setResetSuccess(true)
      if (onClearCredentialsExpired) onClearCredentialsExpired()
    } catch (err: any) {
      setResetError(err?.message || 'Erro ao redefinir senha')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setView('login')
    setResetEmail('')
    setResetToken('')
    setNewPassword('')
    setConfirmPassword('')
    setResetError(null)
    setResetSuccess(false)
    if (onClearCredentialsExpired) onClearCredentialsExpired()
  }

  // Se credenciais expiraram, mostrar tela de reset direto
  if (credentialsExpired && view === 'login') {
    return (
      <Box
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #228be6 0%, #12b886 100%)',
        }}
      >
        <Container size={420} my={40}>
          <Center mb="xl">
            <Title c="white" order={1}>
              Archbase React
            </Title>
          </Center>

          <Paper withBorder shadow="md" p={30} mt={30} radius="md">
            <Stack align="center" mb="md">
              <IconLock size={40} color="#E53E3E" />
              <Title order={3} ta="center">
                Senha Expirada
              </Title>
            </Stack>

            <Alert color="orange" mb="md">
              {credentialsExpired.message}
            </Alert>

            {resetSuccess ? (
              <Stack>
                <Alert color="green">Senha redefinida com sucesso!</Alert>
                <Button fullWidth onClick={handleBackToLogin}>
                  Voltar ao Login
                </Button>
              </Stack>
            ) : (
              <form onSubmit={handleResetPassword}>
                <Stack gap="md">
                  <Text size="sm" c="dimmed">
                    Insira o codigo recebido por email e sua nova senha.
                  </Text>
                  <PinInput
                    length={6}
                    value={resetToken}
                    onChange={setResetToken}
                    type="number"
                    oneTimeCode
                  />
                  <PasswordInput
                    label="Nova Senha"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.currentTarget.value)}
                  />
                  <PasswordInput
                    label="Confirmar Nova Senha"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                  />

                  {resetError && (
                    <Alert icon={<IconAlertCircle size={16} />} color="red">
                      {resetError}
                    </Alert>
                  )}

                  <Button type="submit" fullWidth loading={isLoading}>
                    Redefinir Senha
                  </Button>
                  <Anchor size="sm" ta="center" onClick={handleBackToLogin}>
                    <Group gap={4} justify="center">
                      <IconArrowLeft size={14} />
                      Voltar ao Login
                    </Group>
                  </Anchor>
                </Stack>
              </form>
            )}
          </Paper>
        </Container>
      </Box>
    )
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #228be6 0%, #12b886 100%)',
      }}
    >
      <Container size={420} my={40}>
        <Center mb="xl">
          <Title c="white" order={1}>
            Archbase React
          </Title>
        </Center>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          {view === 'login' && (
            <>
              <Title order={2} ta="center" mb="md">
                {archbaseI18next.t('Seja Bem-vindo')}
              </Title>

              <Text c="dimmed" size="sm" ta="center" mb="lg">
                {archbaseI18next.t('getStarted')}
              </Text>

              {error && (
                <Alert icon={<IconAlertCircle size={16} />} title="Erro" color="red" mb="md">
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack gap="md">
                  <TextInput
                    label={archbaseI18next.t('Email')}
                    placeholder="seu@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.currentTarget.value)}
                  />

                  <PasswordInput
                    label={archbaseI18next.t('Senha')}
                    placeholder={archbaseI18next.t('Sua senha')}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.currentTarget.value)}
                  />

                  <Group justify="space-between">
                    <Checkbox
                      label={archbaseI18next.t('Lembre-me')}
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.currentTarget.checked)}
                    />
                    {onSendResetPasswordEmail && (
                      <Anchor
                        size="sm"
                        onClick={() => {
                          setView('forgot-password')
                          setResetEmail(email)
                        }}
                      >
                        Esqueci minha senha
                      </Anchor>
                    )}
                  </Group>

                  <Button type="submit" fullWidth loading={isLoading}>
                    {archbaseI18next.t('signIn')}
                  </Button>
                </Stack>
              </form>
            </>
          )}

          {view === 'forgot-password' && (
            <>
              <Title order={3} ta="center" mb="md">
                Recuperar Senha
              </Title>
              <Text c="dimmed" size="sm" ta="center" mb="lg">
                Informe seu email para receber o codigo de recuperacao.
              </Text>

              {resetError && (
                <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
                  {resetError}
                </Alert>
              )}

              <form onSubmit={handleSendResetEmail}>
                <Stack gap="md">
                  <TextInput
                    label="Email"
                    placeholder="seu@email.com"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.currentTarget.value)}
                  />
                  <Button type="submit" fullWidth loading={isLoading}>
                    Enviar Codigo
                  </Button>
                  <Anchor size="sm" ta="center" onClick={handleBackToLogin}>
                    <Group gap={4} justify="center">
                      <IconArrowLeft size={14} />
                      Voltar ao Login
                    </Group>
                  </Anchor>
                </Stack>
              </form>
            </>
          )}

          {view === 'reset-password' && (
            <>
              <Title order={3} ta="center" mb="md">
                Redefinir Senha
              </Title>

              {resetSuccess ? (
                <Stack>
                  <Alert color="green">Senha redefinida com sucesso!</Alert>
                  <Button fullWidth onClick={handleBackToLogin}>
                    Voltar ao Login
                  </Button>
                </Stack>
              ) : (
                <>
                  <Text c="dimmed" size="sm" ta="center" mb="lg">
                    Insira o codigo recebido por email e sua nova senha.
                  </Text>

                  {resetError && (
                    <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
                      {resetError}
                    </Alert>
                  )}

                  <form onSubmit={handleResetPassword}>
                    <Stack gap="md">
                      <PinInput
                        length={6}
                        value={resetToken}
                        onChange={setResetToken}
                        type="number"
                        oneTimeCode
                      />
                      <PasswordInput
                        label="Nova Senha"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.currentTarget.value)}
                      />
                      <PasswordInput
                        label="Confirmar Nova Senha"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                      />
                      <Button type="submit" fullWidth loading={isLoading}>
                        Redefinir Senha
                      </Button>
                      <Anchor size="sm" ta="center" onClick={handleBackToLogin}>
                        <Group gap={4} justify="center">
                          <IconArrowLeft size={14} />
                          Voltar ao Login
                        </Group>
                      </Anchor>
                    </Stack>
                  </form>
                </>
              )}
            </>
          )}
        </Paper>

        <Text c="white" size="xs" ta="center" mt="md">
          &copy; {new Date().getFullYear()} - {archbaseI18next.t('Direitos reservados')}
        </Text>
      </Container>
    </Box>
  )
}
