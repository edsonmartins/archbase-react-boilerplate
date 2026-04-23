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
} from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { archbaseI18next } from '@archbase/core'

interface LoginProps {
  onLogin: (username: string, password: string, rememberMe: boolean) => Promise<void>
  error?: string | null
}

/**
 * Componente de Login
 *
 * Tela de autenticação básica com email/senha.
 * Personalize o design conforme necessidade do projeto.
 */
export function Login({ onLogin, error }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onLogin(email, password, rememberMe)
    } finally {
      setIsLoading(false)
    }
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

              <Checkbox
                label={archbaseI18next.t('Lembre-me')}
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.currentTarget.checked)}
              />

              <Button type="submit" fullWidth loading={isLoading}>
                {archbaseI18next.t('signIn')}
              </Button>
            </Stack>
          </form>
        </Paper>

        <Text c="white" size="xs" ta="center" mt="md">
          © {new Date().getFullYear()} - {archbaseI18next.t('Direitos reservados')}
        </Text>
      </Container>
    </Box>
  )
}
