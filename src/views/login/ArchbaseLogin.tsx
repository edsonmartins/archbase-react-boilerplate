import React, { useState } from 'react'
import {
  Center,
  Grid,
  Text,
  Title,
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Checkbox,
  Stack,
  Alert,
  LoadingOverlay,
  Group,
  Box,
  Anchor,
  PinInput,
  useMantineTheme,
} from '@mantine/core'
import { IconAlertCircle, IconArrowLeft, IconLock, IconBox } from '@tabler/icons-react'
import classes from './Login.module.css'

interface ArchbaseLoginProps {
  onLogin: (email: string, password: string, rememberMe: boolean) => Promise<void>
  onSendResetPasswordEmail?: (email: string) => Promise<void>
  onResetPassword?: (email: string, token: string, newPassword: string) => Promise<void>
  error?: string | undefined
  loading?: boolean
  credentialsExpired?: { email: string; message: string } | null
  onClearCredentialsExpired?: () => void
  /** Nome do aplicativo exibido na tela de login */
  appName?: string
  /** Subtitulo exibido abaixo do nome do app */
  appSubtitle?: string
  /** Texto de direitos autorais */
  copyrightText?: string
}

type LoginView = 'login' | 'forgot-password' | 'reset-password'

/**
 * Componente de Login com layout split-screen
 *
 * Layout responsivo com gradiente na esquerda e formulario na direita.
 * Personalizavel via props para diferentes aplicacoes.
 */
export function ArchbaseLogin(props: ArchbaseLoginProps) {
  const theme = useMantineTheme()
  const {
    appName = 'Archbase Admin',
    appSubtitle = 'Painel Administrativo',
    copyrightText = 'Archbase',
  } = props

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [view, setView] = useState<LoginView>('login')
  const [resetEmail, setResetEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)

  // Cores do tema
  const primaryColor = theme.colors[theme.primaryColor]?.[6] || '#228be6'
  const accentColor = theme.colors[theme.primaryColor]?.[4] || '#12b886'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      return
    }

    try {
      await props.onLogin(email, password, rememberMe)
    } catch (error) {
      console.error('Erro no login:', error)
    }
  }

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!props.onSendResetPasswordEmail) return
    setIsResetting(true)
    setResetError(null)
    try {
      await props.onSendResetPasswordEmail(resetEmail)
      setView('reset-password')
    } catch (err: any) {
      setResetError(err?.message || 'Erro ao enviar email de recuperacao')
    } finally {
      setIsResetting(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!props.onResetPassword) return
    if (newPassword !== confirmPassword) {
      setResetError('As senhas nao conferem')
      return
    }
    setIsResetting(true)
    setResetError(null)
    try {
      const emailToUse = props.credentialsExpired?.email || resetEmail
      await props.onResetPassword(emailToUse, resetToken, newPassword)
      setResetSuccess(true)
      if (props.onClearCredentialsExpired) props.onClearCredentialsExpired()
    } catch (err: any) {
      setResetError(err?.message || 'Erro ao redefinir senha')
    } finally {
      setIsResetting(false)
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
    if (props.onClearCredentialsExpired) props.onClearCredentialsExpired()
  }

  // Se credenciais expiraram, mostrar tela de reset direto
  if (props.credentialsExpired && view === 'login') {
    return (
      <Grid classNames={{ root: classes.gridContainer, inner: classes.gridContainer }} gap={0}>
        <Grid.Col
          span={8}
          style={{
            padding: 0,
            height: '100vh',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box ta="center">
            <IconBox size={120} color="white" style={{ opacity: 0.3 }} />
            <Title order={1} c="white" mt="xl" style={{ fontSize: '3rem' }}>
              {appName}
            </Title>
            <Text c="white" size="xl" mt="md" style={{ opacity: 0.8 }}>
              {appSubtitle}
            </Text>
          </Box>
        </Grid.Col>

        <Grid.Col
          span={4}
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '2rem',
            background: '#F8FAFC',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          <Center>
            <Paper withBorder p={30} radius="md" w={400} style={{ position: 'relative' }}>
              <LoadingOverlay visible={isResetting} />

              <Stack align="center" mb="md">
                <IconLock size={40} color="#E53E3E" />
                <Title order={3} ta="center">
                  Senha Expirada
                </Title>
              </Stack>

              <Alert color="orange" mb="md">
                {props.credentialsExpired.message}
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
                    <Center>
                      <PinInput
                        length={6}
                        value={resetToken}
                        onChange={setResetToken}
                        type="number"
                        oneTimeCode
                      />
                    </Center>
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

                    <Button type="submit" fullWidth loading={isResetting}>
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
          </Center>
        </Grid.Col>
      </Grid>
    )
  }

  return (
    <Grid classNames={{ root: classes.gridContainer, inner: classes.gridContainer }} gap={0}>
      <Grid.Col
        span={8}
        style={{
          padding: 0,
          height: '100vh',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box ta="center">
          <IconBox size={120} color="white" style={{ opacity: 0.3 }} />
          <Title order={1} c="white" mt="xl" style={{ fontSize: '3rem' }}>
            {appName}
          </Title>
          <Text c="white" size="xl" mt="md" style={{ opacity: 0.8 }}>
            {appSubtitle}
          </Text>
        </Box>
      </Grid.Col>

      <Grid.Col
        span={4}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '2rem',
          background: '#F8FAFC',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <Center>
          <Paper withBorder p={30} radius="md" w={400} style={{ position: 'relative' }}>
            <LoadingOverlay visible={props.loading || isResetting} />

            {view === 'login' && (
              <>
                <Title order={2} ta="center" mb="md">
                  Bem-vindo
                </Title>

                <Text c="dimmed" size="sm" ta="center" mb="xl">
                  Faca login para acessar o painel administrativo
                </Text>

                {props.error && (
                  <Alert icon={<IconAlertCircle size="1rem" />} color="red" mb="md">
                    {props.error}
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Stack>
                    <TextInput
                      label="Email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.currentTarget.value)}
                      required
                      disabled={props.loading}
                    />

                    <PasswordInput
                      label="Senha"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.currentTarget.value)}
                      required
                      disabled={props.loading}
                    />

                    <Group justify="space-between" mt="lg">
                      <Checkbox
                        label="Lembrar de mim"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.currentTarget.checked)}
                        disabled={props.loading}
                      />

                      {props.onSendResetPasswordEmail && (
                        <Anchor
                          size="sm"
                          onClick={() => {
                            setView('forgot-password')
                            setResetEmail(email)
                          }}
                        >
                          Esqueceu a senha?
                        </Anchor>
                      )}
                    </Group>

                    <Button
                      fullWidth
                      mt="xl"
                      type="submit"
                      loading={props.loading}
                      disabled={!email || !password}
                    >
                      Entrar
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
                    <Button type="submit" fullWidth loading={isResetting}>
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
                        <Center>
                          <PinInput
                            length={6}
                            value={resetToken}
                            onChange={setResetToken}
                            type="number"
                            oneTimeCode
                          />
                        </Center>
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
                        <Button type="submit" fullWidth loading={isResetting}>
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
        </Center>

        <Text fz="xs" c="dimmed" ta="center" mt="md">
          Direitos reservados © {new Date().getFullYear()} {copyrightText}
        </Text>
      </Grid.Col>
    </Grid>
  )
}
