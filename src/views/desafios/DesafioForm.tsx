/**
 * DesafioForm - Formulário de Desafio Mensal
 */
import { useEffect, useRef } from 'react'
import {
  Stack,
  LoadingOverlay,
  Tabs,
  Grid,
  Group,
  Text,
  Paper,
  Box,
  SegmentedControl,
} from '@mantine/core'
import { useArchbaseRemoteDataSourceV2, useArchbaseRemoteServiceApi, useArchbaseStore } from '@archbase/data'
import { ArchbaseFormTemplate, ValidationErrorsProvider } from '@archbase/template'
import {
  ArchbaseDialog,
  ArchbaseNotifications,
  ArchbaseEdit,
  ArchbaseSelect,
  ArchbaseNumberEdit,
  ArchbaseSwitch,
  ArchbaseTextArea,
  ArchbaseDatePickerEdit,
} from '@archbase/components'
import { useArchbaseValidator } from '@archbase/core'
import { useArchbaseNavigationListener } from '@archbase/admin'
import { useLocation, useParams } from 'react-router'
import { useSearchParams } from 'react-router-dom'
import { useInjection } from 'inversify-react'
import {
  IconFileText,
  IconSettings,
  IconMessage,
  IconTrophy,
} from '@tabler/icons-react'

import { DesafioMensalDto } from '../../domain/gamificacao/GamificacaoDto'
import { DesafioService } from '../../services/DesafioService'
import { API_TYPE } from '../../ioc/IOCTypes'

// Opções de categoria
const categoriaOptions = [
  { value: 'TREINOS_CONSECUTIVOS', label: 'Treinos Consecutivos' },
  { value: 'MINUTOS_EXERCICIO', label: 'Minutos de Exercício' },
  { value: 'NIVEL_EMOCIONAL', label: 'Nível Emocional' },
  { value: 'HIDRATACAO', label: 'Hidratação' },
  { value: 'SONO_QUALIDADE', label: 'Qualidade do Sono' },
  { value: 'PASSOS_DIARIOS', label: 'Passos Diários' },
  { value: 'MEDITACAO', label: 'Meditação' },
  { value: 'DIARIO_HUMOR', label: 'Diário de Humor' },
  { value: 'SOCIAL_COMPARTILHAR', label: 'Compartilhar nas Redes' },
  { value: 'DESAFIO_VIX', label: 'Desafio da Vix' },
  { value: 'PERSONALIZADO', label: 'Personalizado' },
]

// Opções de tipo de medição
const tipoMedicaoOptions = [
  { value: 'EXTERNO', label: 'Externo' },
  { value: 'APP', label: 'App' },
  { value: 'MISTO', label: 'Misto' },
]

// Opções de tipo de desafio
const tipoDesafioOptions = [
  { value: 'STREAK', label: 'Streak (Consecutivo)' },
  { value: 'ACUMULATIVO', label: 'Acumulativo' },
  { value: 'DIARIO', label: 'Diário' },
  { value: 'ESPECIAL', label: 'Especial' },
]

// Opções de unidade de meta
const unidadeMetaOptions = [
  { value: 'treinos', label: 'treinos' },
  { value: 'minutos', label: 'minutos' },
  { value: 'dias', label: 'dias' },
  { value: 'passos', label: 'passos' },
  { value: 'copos', label: 'copos' },
  { value: 'sessoes', label: 'sessões' },
  { value: 'desafios', label: 'desafios' },
]

// Opções de nível
const nivelOptions = [
  { value: 'INICIANTE', label: 'Iniciante' },
  { value: 'INTERMEDIARIO', label: 'Intermediário' },
  { value: 'AVANCADO', label: 'Avançado' },
  { value: 'TODOS', label: 'Todos' },
]

export function DesafioForm() {
  const location = useLocation()
  const { id } = useParams()
  const validator = useArchbaseValidator()
  const [searchParams] = useSearchParams()
  const action = searchParams.get('action') || ''

  const desafioService = useInjection<DesafioService>(API_TYPE.DesafioService)

  // Store com nome fixo
  const templateStore = useArchbaseStore('desafioFormStore')
  const { closeAllowed } = useArchbaseNavigationListener(location.pathname, () => {
    templateStore.clearAllValues()
    closeAllowed()
  })
  const serviceApi = useArchbaseRemoteServiceApi<DesafioService>(API_TYPE.DesafioService)

  // Comparação case-insensitive para action
  const isAddAction = action.toUpperCase() === 'ADD'
  const isEditAction = action.toUpperCase() === 'EDIT'
  const isViewAction = action.toUpperCase() === 'VIEW'

  // useArchbaseRemoteDataSourceV2
  const { dataSource, isLoading } = useArchbaseRemoteDataSourceV2<DesafioMensalDto>({
    name: 'dsDesafio',
    label: 'Desafio',
    service: serviceApi,
    pageSize: 50,
    defaultSortFields: ['titulo'],
    validator,
    onError: (error) => {
      ArchbaseNotifications.showError('Atenção', error)
    },
  })

  // Flag para garantir que loadRecord só execute uma vez
  const loadedIdRef = useRef<string | null>(null)

  // Carrega o registro
  useEffect(() => {
    if (loadedIdRef.current === (id || 'new')) return
    loadedIdRef.current = id || 'new'

    const loadRecord = async () => {
      if (isAddAction) {
        dataSource.setRecords([])
        const newRecord = DesafioMensalDto.newInstance()
        dataSource.insert(newRecord)
      } else if ((isEditAction || isViewAction) && id) {
        try {
          const record = await desafioService.findOne(id)
          const dto = new DesafioMensalDto(record)
          dataSource.setRecords([dto])
          if (isEditAction) {
            dataSource.edit()
          }
        } catch (error: unknown) {
          ArchbaseNotifications.showError('Atenção', String(error))
        }
      }
    }

    loadRecord()
  }, [id])

  const handleAfterSave = () => {
    templateStore.clearAllValues()
    closeAllowed()
  }

  const handleCancel = () => {
    if (!isViewAction) {
      ArchbaseDialog.showConfirmDialogYesNo(
        'Confirme',
        'Deseja cancelar as alterações?',
        () => {
          if (!dataSource.isBrowsing()) {
            dataSource.cancel()
          }
          templateStore.clearAllValues()
          closeAllowed()
        },
        () => {}
      )
    } else {
      templateStore.clearAllValues()
      closeAllowed()
    }
  }

  const currentRecord = dataSource.getCurrentRecord()

  return (
    <ValidationErrorsProvider>
      <ArchbaseFormTemplate
        title={isAddAction ? 'Novo Desafio' : 'Editar Desafio'}
        dataSource={dataSource}
        onCancel={handleCancel}
        onAfterSave={handleAfterSave}
        withBorder={false}
        buttonsPosition="header"
        saveLabel="Salvar"
        cancelLabel={isViewAction ? 'Fechar' : 'Cancelar'}
      >
        <LoadingOverlay visible={isLoading} />
        <Tabs
          variant="pills"
          defaultValue="dados"
          style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <Tabs.List style={{ flexShrink: 0 }}>
            <Tabs.Tab value="dados" leftSection={<IconFileText size={16} />}>
              Dados Gerais
            </Tabs.Tab>
            <Tabs.Tab value="mensagens" leftSection={<IconMessage size={16} />}>
              Mensagens da Vix
            </Tabs.Tab>
            <Tabs.Tab value="recompensa" leftSection={<IconTrophy size={16} />}>
              Recompensa
            </Tabs.Tab>
            <Tabs.Tab value="config" leftSection={<IconSettings size={16} />}>
              Configurações
            </Tabs.Tab>
          </Tabs.List>

          {/* Tab Dados Gerais */}
          <Tabs.Panel value="dados" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <Stack gap="md" p="md">
              <ArchbaseEdit<DesafioMensalDto, string>
                label="Título"
                dataSource={dataSource}
                dataField="titulo"
                placeholder="Ex: 30 Dias de Treino"
                required
                description="Mínimo 5 caracteres"
              />

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseSelect
                    label="Categoria"
                    dataSource={dataSource}
                    dataField="categoria"
                    options={categoriaOptions}
                    getOptionLabel={(opt: { value: string; label: string }) => opt.label}
                    getOptionValue={(opt: { value: string; label: string }) => opt.value}
                    placeholder="Selecione..."
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseSelect
                    label="Tipo de Desafio"
                    dataSource={dataSource}
                    dataField="tipo"
                    options={tipoDesafioOptions}
                    getOptionLabel={(opt: { value: string; label: string }) => opt.label}
                    getOptionValue={(opt: { value: string; label: string }) => opt.value}
                    placeholder="Selecione..."
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseSelect
                    label="Tipo de Medição"
                    dataSource={dataSource}
                    dataField="tipoMedicao"
                    options={tipoMedicaoOptions}
                    getOptionLabel={(opt: { value: string; label: string }) => opt.label}
                    getOptionValue={(opt: { value: string; label: string }) => opt.value}
                    placeholder="Selecione..."
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseSelect
                    label="Nível"
                    dataSource={dataSource}
                    dataField="nivel"
                    options={nivelOptions}
                    getOptionLabel={(opt: { value: string; label: string }) => opt.label}
                    getOptionValue={(opt: { value: string; label: string }) => opt.value}
                    placeholder="Selecione..."
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseNumberEdit<DesafioMensalDto, number>
                    label="Meta"
                    dataSource={dataSource}
                    dataField="meta"
                    min={1}
                    required
                    placeholder="Ex: 30"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseSelect
                    label="Unidade da Meta"
                    dataSource={dataSource}
                    dataField="unidadeMeta"
                    options={unidadeMetaOptions}
                    getOptionLabel={(opt: { value: string; label: string }) => opt.label}
                    getOptionValue={(opt: { value: string; label: string }) => opt.value}
                    placeholder="Selecione..."
                  />
                </Grid.Col>
              </Grid>

              <ArchbaseTextArea<DesafioMensalDto, string>
                label="Descrição"
                dataSource={dataSource}
                dataField="descricao"
                placeholder="Descrição completa do desafio"
                minRows={2}
              />

              <ArchbaseTextArea<DesafioMensalDto, string>
                label="Descrição para Aluno"
                dataSource={dataSource}
                dataField="descricaoAluno"
                placeholder="Descrição que aparece para o aluno (max 150 caracteres)"
                minRows={2}
              />

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseDatePickerEdit<DesafioMensalDto, string>
                    label="Data Início"
                    dataSource={dataSource}
                    dataField="dataInicio"
                    placeholder="Selecione..."
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseDatePickerEdit<DesafioMensalDto, string>
                    label="Data Fim"
                    dataSource={dataSource}
                    dataField="dataFim"
                    placeholder="Selecione..."
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>

          {/* Tab Mensagens da Vix */}
          <Tabs.Panel value="mensagens" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <Stack gap="md" p="md">
              <Text size="sm" c="dimmed">
                Configure as mensagens que a Vix usará ao interagir com a aluna sobre este desafio.
              </Text>

              <ArchbaseTextArea<DesafioMensalDto, string>
                label="Mensagem ao Sortear"
                dataSource={dataSource}
                dataField="mensagemVixSortear"
                placeholder="O que a Vix diz quando sorteia este desafio para a aluna (max 200 caracteres)"
                minRows={3}
                description="Mensagem de apresentação do desafio"
              />

              <ArchbaseTextArea<DesafioMensalDto, string>
                label="Mensagem ao Concluir"
                dataSource={dataSource}
                dataField="mensagemVixConcluir"
                placeholder="O que a Vix diz quando a aluna conclui o desafio (max 200 caracteres)"
                minRows={3}
                description="Mensagem de parabenização"
              />
            </Stack>
          </Tabs.Panel>

          {/* Tab Recompensa */}
          <Tabs.Panel value="recompensa" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <Stack gap="md" p="md">
              <Text size="sm" c="dimmed">
                Configure a recompensa que a aluna receberá ao completar o desafio.
              </Text>

              <ArchbaseNumberEdit<DesafioMensalDto, number>
                label="XP de Recompensa"
                dataSource={dataSource}
                dataField="xpRecompensa"
                min={0}
                placeholder="Ex: 500"
                description="Pontos de experiência ganhos ao completar"
              />

              <Grid>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <ArchbaseEdit<DesafioMensalDto, string>
                    label="Emoji do Badge"
                    dataSource={dataSource}
                    dataField="badgeEmoji"
                    placeholder="Ex: 🏆"
                    description="Emoji que representa o badge"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 8 }}>
                  <ArchbaseEdit<DesafioMensalDto, string>
                    label="Nome do Badge"
                    dataSource={dataSource}
                    dataField="badgeNome"
                    placeholder="Ex: Guerreira 30 Dias"
                    description="Nome do badge conquistado"
                  />
                </Grid.Col>
              </Grid>
            </Stack>
          </Tabs.Panel>

          {/* Tab Configurações */}
          <Tabs.Panel value="config" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <Stack gap="md" p="md">
              <ArchbaseSwitch<DesafioMensalDto, boolean>
                label="Desafio Ativo"
                dataSource={dataSource}
                dataField="ativo"
              />

              <Paper withBorder p="md" bg="gray.0">
                <Text size="sm" fw={500} mb="xs">
                  Informações do Sistema
                </Text>
                <Group gap="xl">
                  <Box>
                    <Text size="xs" c="dimmed">ID</Text>
                    <Text size="sm">{currentRecord?.id || '-'}</Text>
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed">Criado em</Text>
                    <Text size="sm">
                      {currentRecord?.createEntityDate
                        ? new Date(currentRecord.createEntityDate).toLocaleDateString('pt-BR')
                        : '-'}
                    </Text>
                  </Box>
                  <Box>
                    <Text size="xs" c="dimmed">Atualizado em</Text>
                    <Text size="sm">
                      {currentRecord?.updateEntityDate
                        ? new Date(currentRecord.updateEntityDate).toLocaleDateString('pt-BR')
                        : '-'}
                    </Text>
                  </Box>
                </Group>
              </Paper>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </ArchbaseFormTemplate>
    </ValidationErrorsProvider>
  )
}
