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
      description: 'Boilerplate com Archbase React, Mantine v8 e dependências.',
    },
    {
      icon: IconDashboard,
      title: 'Dashboard Admin',
      description: 'Layout administrativo com sidebar, header e tabs.',
    },
    {
      icon: IconUsers,
      title: 'Autenticação',
      description: 'Sistema de login, logout e gerenciamento de sessão.',
    },
    {
      icon: IconSettings,
      title: 'Configurável',
      description: 'Temas light/dark, i18n e IoC Container configurados.',
    },
  ]

  return (
    <Container size="lg" py="lg">
      <Stack gap="lg">
        <div>
          <Title order={2} mb={4}>
            {archbaseI18next.t('Bem-vindo')}
          </Title>
          <Text c="dimmed">
            {archbaseI18next.t('Esta é sua página inicial')}
          </Text>
        </div>

        <Paper withBorder p="lg" radius="md">
          <Title order={3} mb="sm">
            Archbase React Boilerplate
          </Title>
          <Text c="dimmed" mb="md">
            Template React com Vite, TypeScript, Mantine UI, Inversify IoC e React Query.
          </Text>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {features.map((feature, index) => (
              <Card key={index} padding="md" radius="md" withBorder>
                <Group wrap="nowrap">
                  <ThemeIcon size="lg" radius="md" variant="light">
                    <feature.icon size={20} />
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

        <Paper withBorder p="lg" radius="md">
          <Title order={3} mb="sm">
            Próximos Passos
          </Title>
          <Stack gap="xs">
            <Text size="sm"><strong>1.</strong> Configure o arquivo <code>.env</code> com a URL da sua API</Text>
            <Text size="sm"><strong>2.</strong> Adapte o <code>AppAuthenticator.ts</code> para sua autenticação</Text>
            <Text size="sm"><strong>3.</strong> Adicione seus services em <code>src/services/</code></Text>
            <Text size="sm"><strong>4.</strong> Crie suas views em <code>src/views/</code></Text>
            <Text size="sm"><strong>5.</strong> Registre as rotas em <code>navigationData.tsx</code></Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}
