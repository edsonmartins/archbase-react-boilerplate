/**
 * ConfigView - Configurações do Sistema
 */
import {
  Card,
  Stack,
  Title,
  Text,
  TextInput,
  Switch,
  Select,
  Button,
  Group,
  Divider,
  NumberInput,
  Tabs,
  Textarea,
  Avatar,
  Badge,
  Paper,
  SimpleGrid,
  ThemeIcon,
  Box,
  Table,
  Code,
  CopyButton,
  ActionIcon,
  Tooltip,
  Progress,
  ScrollArea,
} from '@mantine/core'
import {
  IconSettings,
  IconBell,
  IconBrandSpotify,
  IconCloud,
  IconRobot,
  IconUsers,
  IconFileText,
  IconServer,
  IconDatabase,
  IconRefresh,
  IconDownload,
  IconCopy,
  IconCheck,
  IconHeart,
  IconBrain,
} from '@tabler/icons-react'
import { useState } from 'react'
import { ArchbaseNotifications } from '@archbase/components'
import { AppColors } from '../../theme/AppThemeLight'

/**
 * View de Configurações do Sistema
 */
export function ConfigView() {
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    // TODO: Integrar com API
    setTimeout(() => {
      setSaving(false)
      ArchbaseNotifications.showSuccess('Sucesso', 'Configurações salvas')
    }, 1000)
  }

  return (
    <Stack gap="lg" p="md">
      <Group justify="space-between">
        <div>
          <Title order={2}>Configurações</Title>
          <Text c="dimmed" size="sm">
            Configurações gerais do sistema BlueVix
          </Text>
        </div>
        <Button onClick={handleSave} loading={saving}>
          Salvar Alterações
        </Button>
      </Group>

      <Tabs defaultValue="geral" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <Tabs.List>
          <Tabs.Tab value="geral" leftSection={<IconSettings size={16} />}>
            Geral
          </Tabs.Tab>
          <Tabs.Tab value="notificacoes" leftSection={<IconBell size={16} />}>
            Notificações
          </Tabs.Tab>
          <Tabs.Tab value="integracoes" leftSection={<IconCloud size={16} />}>
            Integrações
          </Tabs.Tab>
          <Tabs.Tab value="ia" leftSection={<IconRobot size={16} />}>
            IA / Vix
          </Tabs.Tab>
          <Tabs.Tab value="perfis" leftSection={<IconUsers size={16} />}>
            Perfis
          </Tabs.Tab>
          <Tabs.Tab value="contrato" leftSection={<IconFileText size={16} />}>
            Contrato
          </Tabs.Tab>
          <Tabs.Tab value="sistema" leftSection={<IconServer size={16} />}>
            Sistema
          </Tabs.Tab>
        </Tabs.List>

        {/* Tab Geral */}
        <Tabs.Panel value="geral" pt="lg" style={{ flex: 1, minHeight: 0 }}>
          <ScrollArea h="calc(100vh - 220px)">
          <Card shadow="0" withBorder>
            <Stack gap="md">
              <Title order={4}>Configurações Gerais</Title>

              <TextInput
                label="Nome do App"
                defaultValue="BlueVix"
              />

              <Select
                label="Timezone Padrão"
                defaultValue="America/Sao_Paulo"
                data={[
                  { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
                  { value: 'America/Manaus', label: 'Manaus (GMT-4)' },
                  { value: 'America/Fortaleza', label: 'Fortaleza (GMT-3)' },
                ]}
              />

              <NumberInput
                label="Dias de Trial"
                defaultValue={7}
                min={1}
                max={30}
              />

              <Switch
                label="Modo de Manutenção"
                description="Bloqueia acesso de alunos ao app"
              />
            </Stack>
          </Card>
          </ScrollArea>
        </Tabs.Panel>

        {/* Tab Notificações */}
        <Tabs.Panel value="notificacoes" pt="lg" style={{ flex: 1, minHeight: 0 }}>
          <ScrollArea h="calc(100vh - 220px)">
          <Card shadow="0" withBorder>
            <Stack gap="md">
              <Title order={4}>Configurações de Notificações</Title>

              <Switch
                label="Alertas de Inatividade"
                description="Gerar alertas para alunos inativos"
                defaultChecked
              />

              <NumberInput
                label="Dias para alerta de inatividade"
                defaultValue={3}
                min={1}
                max={14}
              />

              <Switch
                label="Alertas de Humor Baixo"
                description="Gerar alertas para humor baixo consecutivo"
                defaultChecked
              />

              <Switch
                label="Alertas de Streak Perdido"
                description="Notificar quando aluno perder streak"
                defaultChecked
              />

              <Switch
                label="Alertas de Plano Expirando"
                description="Notificar 7 dias antes do vencimento"
                defaultChecked
              />
            </Stack>
          </Card>
          </ScrollArea>
        </Tabs.Panel>

        {/* Tab Integrações */}
        <Tabs.Panel value="integracoes" pt="lg" style={{ flex: 1, minHeight: 0 }}>
          <ScrollArea h="calc(100vh - 220px)">
          <Stack gap="md">
            <Card shadow="0" withBorder>
              <Stack gap="md">
                <Group>
                  <IconBrandSpotify size={24} color="#1DB954" />
                  <Title order={4}>Spotify</Title>
                </Group>

                <TextInput
                  label="Client ID"
                  placeholder="Seu Spotify Client ID"
                />

                <TextInput
                  label="Client Secret"
                  type="password"
                  placeholder="Seu Spotify Client Secret"
                />

                <Switch
                  label="Integração Ativa"
                  defaultChecked
                />
              </Stack>
            </Card>

            <Card shadow="0" withBorder>
              <Stack gap="md">
                <Group>
                  <IconCloud size={24} color="#EB6E4B" />
                  <Title order={4}>OpenWeatherMap</Title>
                </Group>

                <TextInput
                  label="API Key"
                  type="password"
                  placeholder="Sua API Key"
                />

                <Switch
                  label="Integração Ativa"
                  defaultChecked
                />
              </Stack>
            </Card>
          </Stack>
          </ScrollArea>
        </Tabs.Panel>

        {/* Tab IA / Vix */}
        <Tabs.Panel value="ia" pt="lg" style={{ flex: 1, minHeight: 0 }}>
          <ScrollArea h="calc(100vh - 220px)">
          <Card shadow="0" withBorder>
            <Stack gap="md">
              <Title order={4}>Configurações de IA</Title>

              <Switch
                label="IA Habilitada"
                description="Ativa/desativa todas as funcionalidades de IA"
                defaultChecked
              />

              <Switch
                label="Modo Mock"
                description="Usar respostas simuladas (sem consumir API)"
              />

              <Select
                label="Provider LLM"
                defaultValue="OPENROUTER"
                data={[
                  { value: 'OPENROUTER', label: 'OpenRouter' },
                  { value: 'OPENAI', label: 'OpenAI' },
                  { value: 'ANTHROPIC', label: 'Anthropic' },
                ]}
              />

              <TextInput
                label="Modelo"
                defaultValue="deepseek/deepseek-chat"
              />

              <TextInput
                label="API Key"
                type="password"
                placeholder="Sua API Key do provider"
              />

              <NumberInput
                label="Temperatura"
                defaultValue={0.3}
                min={0}
                max={1}
                step={0.1}
                decimalScale={1}
              />

              <NumberInput
                label="Max Tokens"
                defaultValue={2048}
                min={256}
                max={8192}
              />
            </Stack>
          </Card>
          </ScrollArea>
        </Tabs.Panel>

        {/* Tab Perfis das Profissionais */}
        <Tabs.Panel value="perfis" pt="lg" style={{ flex: 1, minHeight: 0 }}>
          <ScrollArea h="calc(100vh - 220px)">
          <Stack gap="md">
            {/* Patrícia */}
            <Card shadow="0" withBorder>
              <Group gap="md" mb="md">
                <Avatar size={64} radius="xl" color="green">
                  <IconBrain size={32} />
                </Avatar>
                <div>
                  <Title order={4}>Patrícia</Title>
                  <Text c="dimmed" size="sm">Educadora Física Virtual</Text>
                  <Badge color="green" variant="light" mt={4}>Agente Prescritor</Badge>
                </div>
              </Group>

              <Stack gap="md">
                <Textarea
                  label="Descrição do Perfil"
                  defaultValue="Patrícia é a educadora física virtual do BlueVix. Ela é especialista em prescrição de treinos personalizados, com foco em adaptação às condições físicas e emocionais de cada aluna."
                  minRows={3}
                />

                <Textarea
                  label="Personalidade"
                  defaultValue="Técnica e precisa nas orientações. Educadora: explica o 'porquê' dos exercícios. Empática mas profissional. Sempre valida o esforço da aluna."
                  minRows={2}
                />

                <SimpleGrid cols={2}>
                  <TextInput
                    label="Especialidade"
                    defaultValue="Prescrição de Treinos"
                  />
                  <TextInput
                    label="Formação"
                    defaultValue="Educação Física - CREF"
                  />
                </SimpleGrid>

                <Switch
                  label="Perfil Ativo"
                  defaultChecked
                />
              </Stack>
            </Card>

            {/* Virgínia */}
            <Card shadow="0" withBorder>
              <Group gap="md" mb="md">
                <Avatar size={64} radius="xl" color="pink">
                  <IconHeart size={32} />
                </Avatar>
                <div>
                  <Title order={4}>Virgínia</Title>
                  <Text c="dimmed" size="sm">Psicóloga Virtual</Text>
                  <Badge color="pink" variant="light" mt={4}>Agente Suporte Emocional</Badge>
                </div>
              </Group>

              <Stack gap="md">
                <Textarea
                  label="Descrição do Perfil"
                  defaultValue="Virgínia é a psicóloga virtual do BlueVix. Ela oferece suporte emocional às alunas, ajudando em momentos de ansiedade, estresse ou desmotivação, sempre com acolhimento e escuta ativa."
                  minRows={3}
                />

                <Textarea
                  label="Personalidade"
                  defaultValue="Gentil, compreensiva e paciente. Acolhedora sem ser invasiva. Sabe quando escalar para ajuda profissional real. Mantém limites éticos claros."
                  minRows={2}
                />

                <SimpleGrid cols={2}>
                  <TextInput
                    label="Especialidade"
                    defaultValue="Suporte Emocional"
                  />
                  <TextInput
                    label="Formação"
                    defaultValue="Psicologia - CRP"
                  />
                </SimpleGrid>

                <Switch
                  label="Perfil Ativo"
                  defaultChecked
                />
              </Stack>
            </Card>
          </Stack>
          </ScrollArea>
        </Tabs.Panel>

        {/* Tab Contrato */}
        <Tabs.Panel value="contrato" pt="lg" style={{ flex: 1, minHeight: 0 }}>
          <ScrollArea h="calc(100vh - 220px)">
          <Card shadow="0" withBorder>
            <Stack gap="md">
              <Title order={4}>Termos e Contrato</Title>

              <Textarea
                label="Termos de Uso"
                description="Exibido para alunas no cadastro"
                defaultValue="Ao utilizar o BlueVix, você concorda com os seguintes termos..."
                minRows={6}
              />

              <Textarea
                label="Política de Privacidade"
                description="Link ou texto completo"
                defaultValue="https://bluevix.com.br/privacidade"
                minRows={2}
              />

              <Textarea
                label="Termo de Consentimento LGPD"
                description="Texto do consentimento para coleta de dados"
                defaultValue="Autorizo a coleta e processamento dos meus dados pessoais para fins de personalização do treino e comunicação sobre o serviço."
                minRows={3}
              />

              <Divider label="Assinatura" />

              <SimpleGrid cols={2}>
                <Select
                  label="Planos Disponíveis"
                  defaultValue="all"
                  data={[
                    { value: 'all', label: 'Trial + Basic + Premium' },
                    { value: 'basic_premium', label: 'Basic + Premium' },
                    { value: 'premium_only', label: 'Apenas Premium' },
                  ]}
                />
                <NumberInput
                  label="Duração Trial (dias)"
                  defaultValue={7}
                  min={1}
                  max={30}
                />
              </SimpleGrid>

              <SimpleGrid cols={2}>
                <NumberInput
                  label="Valor Basic (R$)"
                  defaultValue={49.90}
                  decimalScale={2}
                  fixedDecimalScale
                />
                <NumberInput
                  label="Valor Premium (R$)"
                  defaultValue={99.90}
                  decimalScale={2}
                  fixedDecimalScale
                />
              </SimpleGrid>
            </Stack>
          </Card>
          </ScrollArea>
        </Tabs.Panel>

        {/* Tab Sistema */}
        <Tabs.Panel value="sistema" pt="lg" style={{ flex: 1, minHeight: 0 }}>
          <ScrollArea h="calc(100vh - 220px)">
          <Stack gap="md">
            {/* Informações do Sistema */}
            <Card shadow="0" withBorder>
              <Title order={4} mb="md">Informações do Sistema</Title>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }}>
                <Paper withBorder p="md">
                  <Text size="xs" c="dimmed" tt="uppercase">Versão</Text>
                  <Text size="lg" fw={700}>1.0.0</Text>
                </Paper>
                <Paper withBorder p="md">
                  <Text size="xs" c="dimmed" tt="uppercase">Ambiente</Text>
                  <Badge color="green" size="lg">Produção</Badge>
                </Paper>
                <Paper withBorder p="md">
                  <Text size="xs" c="dimmed" tt="uppercase">Último Deploy</Text>
                  <Text size="sm" fw={500}>20/04/2024 14:30</Text>
                </Paper>
                <Paper withBorder p="md">
                  <Text size="xs" c="dimmed" tt="uppercase">Uptime</Text>
                  <Text size="sm" fw={500}>15d 4h 32m</Text>
                </Paper>
              </SimpleGrid>
            </Card>

            {/* Status dos Serviços */}
            <Card shadow="0" withBorder>
              <Group justify="space-between" mb="md">
                <Title order={4}>Status dos Serviços</Title>
                <ActionIcon variant="subtle" color="gray">
                  <IconRefresh size={18} />
                </ActionIcon>
              </Group>
              <Stack gap="sm">
                <ServiceStatus name="API Backend" status="online" latency={45} />
                <ServiceStatus name="Banco de Dados" status="online" latency={12} />
                <ServiceStatus name="ChromaDB (RAG)" status="online" latency={28} />
                <ServiceStatus name="OpenRouter (LLM)" status="online" latency={180} />
                <ServiceStatus name="Redis (Cache)" status="online" latency={5} />
              </Stack>
            </Card>

            {/* Backup e Manutenção */}
            <Card shadow="0" withBorder>
              <Title order={4} mb="md">Backup e Manutenção</Title>
              <Stack gap="md">
                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>Último Backup</Text>
                    <Text size="xs" c="dimmed">20/04/2024 03:00 - Automático</Text>
                  </div>
                  <Button variant="light" leftSection={<IconDownload size={16} />}>
                    Download Backup
                  </Button>
                </Group>

                <Divider />

                <Group justify="space-between">
                  <div>
                    <Text size="sm" fw={500}>Re-indexar Base RAG</Text>
                    <Text size="xs" c="dimmed">Última execução: 19/04/2024 22:00</Text>
                  </div>
                  <Button variant="light" color="orange" leftSection={<IconDatabase size={16} />}>
                    Re-indexar
                  </Button>
                </Group>
              </Stack>
            </Card>

            {/* Chaves e Tokens */}
            <Card shadow="0" withBorder>
              <Title order={4} mb="md">Chaves e Tokens</Title>
              <Stack gap="sm">
                <Group justify="space-between">
                  <div>
                    <Text size="sm">API Key (Admin)</Text>
                    <Code>bv_admin_****************************</Code>
                  </div>
                  <CopyButton value="bv_admin_1234567890abcdef">
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copiado!' : 'Copiar'}>
                        <ActionIcon variant="subtle" onClick={copy}>
                          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
                <Group justify="space-between">
                  <div>
                    <Text size="sm">Webhook Secret</Text>
                    <Code>whsec_****************************</Code>
                  </div>
                  <CopyButton value="whsec_1234567890abcdef">
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? 'Copiado!' : 'Copiar'}>
                        <ActionIcon variant="subtle" onClick={copy}>
                          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
              </Stack>
            </Card>
          </Stack>
          </ScrollArea>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  )
}

// ========== Componentes Auxiliares ==========

interface ServiceStatusProps {
  name: string
  status: 'online' | 'offline' | 'degraded'
  latency?: number
}

function ServiceStatus({ name, status, latency }: ServiceStatusProps) {
  const statusColors = {
    online: 'green',
    offline: 'red',
    degraded: 'yellow',
  }

  const statusLabels = {
    online: 'Online',
    offline: 'Offline',
    degraded: 'Degradado',
  }

  return (
    <Paper withBorder p="sm">
      <Group justify="space-between">
        <Group gap="sm">
          <ThemeIcon size={10} radius="xl" color={statusColors[status]} />
          <Text size="sm">{name}</Text>
        </Group>
        <Group gap="md">
          {latency !== undefined && (
            <Text size="xs" c="dimmed">{latency}ms</Text>
          )}
          <Badge size="sm" color={statusColors[status]} variant="light">
            {statusLabels[status]}
          </Badge>
        </Group>
      </Group>
    </Paper>
  )
}
