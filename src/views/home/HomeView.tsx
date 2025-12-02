import { Container, Title, Text, Paper, Stack, SimpleGrid, Card, ThemeIcon, Group } from '@mantine/core'
import { IconDashboard, IconSettings, IconUsers, IconRocket } from '@tabler/icons-react'
import { archbaseI18next } from '@archbase/core'

/**
 * HomeView - Página inicial após login
 *
 * Esta é uma view placeholder. Substitua pelo seu dashboard ou
 * conteúdo principal conforme necessidade do projeto.
 */
export function HomeView() {
  const features = [
    {
      icon: IconRocket,
      title: 'Pronto para usar',
      description: 'Boilerplate configurado com Archbase React, Mantine v8 e todas as dependências.',
    },
    {
      icon: IconDashboard,
      title: 'Dashboard Admin',
      description: 'Layout administrativo com sidebar, header e sistema de tabs.',
    },
    {
      icon: IconUsers,
      title: 'Autenticação',
      description: 'Sistema de login, logout e gerenciamento de sessão integrado.',
    },
    {
      icon: IconSettings,
      title: 'Configurável',
      description: 'Temas light/dark, i18n (pt-BR, en, es) e IoC Container configurados.',
    },
  ]

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="xs">
            {archbaseI18next.t('Bem-vindo')}
          </Title>
          <Text c="dimmed" size="lg">
            {archbaseI18next.t('Esta é sua página inicial')}
          </Text>
        </div>

        <Paper withBorder p="xl" radius="md">
          <Title order={3} mb="md">
            Archbase React Boilerplate
          </Title>
          <Text c="dimmed" mb="xl">
            Este é um template inicial para projetos React com a biblioteca Archbase. Inclui configurações para
            desenvolvimento com Vite, TypeScript, Mantine UI, Inversify IoC, React Query e internacionalização.
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {features.map((feature, index) => (
              <Card key={index} padding="lg" radius="md" withBorder>
                <Group>
                  <ThemeIcon size="xl" radius="md" variant="light">
                    <feature.icon size={24} />
                  </ThemeIcon>
                  <div style={{ flex: 1 }}>
                    <Text fw={500}>{feature.title}</Text>
                    <Text size="sm" c="dimmed">
                      {feature.description}
                    </Text>
                  </div>
                </Group>
              </Card>
            ))}
          </SimpleGrid>
        </Paper>

        <Paper withBorder p="xl" radius="md">
          <Title order={3} mb="md">
            Próximos Passos
          </Title>
          <Stack gap="sm">
            <Text>
              <strong>1.</strong> Configure o arquivo <code>.env</code> com a URL da sua API
            </Text>
            <Text>
              <strong>2.</strong> Adapte o <code>AppAuthenticator.ts</code> para sua autenticação
            </Text>
            <Text>
              <strong>3.</strong> Adicione seus services em <code>src/services/</code>
            </Text>
            <Text>
              <strong>4.</strong> Crie suas views em <code>src/views/</code>
            </Text>
            <Text>
              <strong>5.</strong> Registre as rotas em <code>navigationData.tsx</code>
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}
