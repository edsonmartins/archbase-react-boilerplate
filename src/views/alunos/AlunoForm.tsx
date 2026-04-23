/**
 * AlunoForm - Formulario completo de Aluno com 4 Tabs (Anamnese)
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
  Slider,
  SegmentedControl,
  Divider,
  Alert,
  Switch,
  ScrollArea,
  FileButton,
  Button,
  Image,
  Avatar,
  ActionIcon,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
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
  ArchbaseMaskEdit,
} from '@archbase/components'
import { useArchbaseValidator } from '@archbase/core'
import { useArchbaseNavigationListener } from '@archbase/admin'
import { useLocation, useParams } from 'react-router'
import { useSearchParams } from 'react-router-dom'
import { useInjection } from 'inversify-react'
import {
  IconUser,
  IconHeartbeat,
  IconMoodSmile,
  IconFileText,
  IconInfoCircle,
  IconUpload,
  IconTrash,
} from '@tabler/icons-react'

import { AlunoDto } from '../../domain/aluno/AlunoDto'
import { AlunoService } from '../../services/AlunoService'
import { API_TYPE } from '../../ioc/IOCTypes'

// Opções de nível
const nivelOptions = [
  { value: 'INICIANTE', label: 'Iniciante' },
  { value: 'INTERMEDIARIO', label: 'Intermediário' },
  { value: 'AVANCADO', label: 'Avançado' },
]

// Opções de status
const statusOptions = [
  { value: 'TRIAL', label: 'Trial' },
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'EXPIRADO', label: 'Expirado' },
  { value: 'PAUSADO', label: 'Pausado' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

// Opções de plano
const planoOptions = [
  { value: 'TRIAL', label: 'Trial (7 dias)' },
  { value: 'SEMENTE', label: 'Semente' },
  { value: 'ESSENCIAL', label: 'Essencial' },
  { value: 'PRESENCA', label: 'Presença' },
]

// Opções de gênero
const generoOptions = [
  { value: 'FEMININO', label: 'Feminino' },
  { value: 'MASCULINO', label: 'Masculino' },
  { value: 'OUTRO', label: 'Outro' },
  { value: 'NAO_INFORMAR', label: 'Prefiro não informar' },
]

// Opções de objetivo
const objetivoOptions = [
  { value: 'SAUDE', label: 'Manter a saúde' },
  { value: 'EMAGRECIMENTO', label: 'Emagrecer' },
  { value: 'FORCA', label: 'Ganhar força' },
  { value: 'FLEXIBILIDADE', label: 'Melhorar flexibilidade' },
  { value: 'ENERGIA', label: 'Ter mais energia' },
]

// Opções de dores (MultiSelect)
const doresOptions = [
  { value: 'LOMBAR', label: 'Lombar' },
  { value: 'JOELHOS', label: 'Joelhos' },
  { value: 'OMBROS', label: 'Ombros' },
  { value: 'CERVICAL', label: 'Cervical' },
  { value: 'QUADRIL', label: 'Quadril' },
  { value: 'PUNHOS', label: 'Punhos' },
  { value: 'TORNOZELOS', label: 'Tornozelos' },
]

// Opções de equipamentos
const equipamentosOptions = [
  { value: 'COLCHONETE', label: 'Colchonete' },
  { value: 'HALTERES', label: 'Halteres' },
  { value: 'ELASTICO', label: 'Elástico' },
  { value: 'BOLA', label: 'Bola' },
  { value: 'BANCO', label: 'Banco' },
  { value: 'KETTLEBELL', label: 'Kettlebell' },
  { value: 'BARRA', label: 'Barra' },
]

// Opções sim/não
const simNaoOptions = [
  { value: 'SIM', label: 'Sim' },
  { value: 'NAO', label: 'Não' },
  { value: 'TALVEZ', label: 'Não sei' },
]

// Opções de perfil emocional
const perfilEmocionalOptions = [
  { value: 'ANSIOSO', label: 'Ansioso(a)' },
  { value: 'ESTRESSADO', label: 'Estressado(a)' },
  { value: 'DEPRESSIVO', label: 'Depressivo(a)' },
  { value: 'EQUILIBRADO', label: 'Equilibrado(a)' },
  { value: 'MOTIVADO', label: 'Motivado(a)' },
  { value: 'RESISTENTE', label: 'Resistente' },
]

// Opções de qualidade do sono
const qualidadeSonoOptions = [
  { value: 'PESSIMA', label: 'Péssima' },
  { value: 'RUIM', label: 'Ruim' },
  { value: 'REGULAR', label: 'Regular' },
  { value: 'BOA', label: 'Boa' },
  { value: 'OTIMA', label: 'Ótima' },
]

export function AlunoForm() {
  const location = useLocation()
  const { id } = useParams()
  const validator = useArchbaseValidator()
  const [searchParams] = useSearchParams()
  const action = searchParams.get('action') || ''

  const alunoService = useInjection<AlunoService>(API_TYPE.AlunoService)

  // Store com nome fixo
  const templateStore = useArchbaseStore('alunoFormStore')
  const { closeAllowed } = useArchbaseNavigationListener(location.pathname, () => {
    templateStore.clearAllValues()
    closeAllowed()
  })
  const serviceApi = useArchbaseRemoteServiceApi<AlunoService>(API_TYPE.AlunoService)

  // Comparacao case-insensitive para action
  const isAddAction = action.toUpperCase() === 'ADD'
  const isEditAction = action.toUpperCase() === 'EDIT'
  const isViewAction = action.toUpperCase() === 'VIEW'

  // useArchbaseRemoteDataSourceV2
  const { dataSource, isLoading } = useArchbaseRemoteDataSourceV2<AlunoDto>({
    name: 'dsAluno',
    label: 'Aluno',
    service: serviceApi,
    pageSize: 50,
    defaultSortFields: ['nome'],
    validator,
    onError: (error) => {
      ArchbaseNotifications.showError('Atenção', error)
    },
  })

  // Flag para garantir que loadRecord so execute uma vez
  const loadedIdRef = useRef<string | null>(null)

  // Carrega o registro
  useEffect(() => {
    if (loadedIdRef.current === (id || 'new')) return
    loadedIdRef.current = id || 'new'

    const loadRecord = async () => {
      if (isAddAction) {
        dataSource.setRecords([])
        const newRecord = AlunoDto.newInstance()
        dataSource.insert(newRecord)
      } else if ((isEditAction || isViewAction) && id) {
        try {
          const record = await alunoService.findOne(id)
          const dto = new AlunoDto(record)
          dataSource.setRecords([dto])
          if (isEditAction) {
            dataSource.edit()
          }
        } catch (error: unknown) {
          ArchbaseNotifications.showError('Atencao', String(error))
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
        title={isAddAction ? 'Novo Aluno' : `Editar Aluno`}
        dataSource={dataSource}
        onCancel={handleCancel}
        onAfterSave={handleAfterSave}
        withBorder={false}
        buttonsPosition="header"
        saveLabel="Salvar"
        cancelLabel={isViewAction ? 'Fechar' : 'Cancelar'}
      >
        <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <LoadingOverlay visible={isLoading} />
          <Tabs
            variant="pills"
            defaultValue="dados"
            style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}
          >
            <Tabs.List style={{ flexShrink: 0 }}>
              <Tabs.Tab value="dados" leftSection={<IconUser size={16} />}>
                Dados Pessoais
              </Tabs.Tab>
              <Tabs.Tab value="anamnese-fisica" leftSection={<IconHeartbeat size={16} />}>
                Anamnese Física
              </Tabs.Tab>
              <Tabs.Tab value="anamnese-emocional" leftSection={<IconMoodSmile size={16} />}>
                Anamnese Emocional
              </Tabs.Tab>
              <Tabs.Tab value="contrato" leftSection={<IconFileText size={16} />}>
                Contrato e Status
              </Tabs.Tab>
            </Tabs.List>

            {/* TAB 1: Dados Pessoais */}
            <Tabs.Panel value="dados" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <ScrollArea style={{ height: 'calc(100vh - 220px)' }} type="auto" offsetScrollbars>
              <Stack gap="md" p="md">
              <ArchbaseEdit<AlunoDto, string>
                label="Nome Completo"
                dataSource={dataSource}
                dataField="nome"
                placeholder="Digite o nome completo"
                required
              />

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseEdit<AlunoDto, string>
                    label="E-mail"
                    dataSource={dataSource}
                    dataField="email"
                    placeholder="email@exemplo.com"
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseMaskEdit<AlunoDto, string>
                    label="Telefone / WhatsApp"
                    dataSource={dataSource}
                    dataField="telefone"
                    mask="(00) 00000-0000"
                    placeholder="(11) 99999-9999"
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DatePickerInput
                    label="Data de Nascimento"
                    placeholder="Selecione..."
                    value={currentRecord?.dataNascimento ? new Date(currentRecord.dataNascimento) : null}
                    onChange={(date) => {
                      if (dataSource.getCurrentRecord()) {
                        const dateValue = date ? (date as unknown as Date).toISOString().split('T')[0] : undefined
                        dataSource.setFieldValue('dataNascimento', dateValue)
                      }
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseSelect
                    label="Gênero"
                    dataSource={dataSource}
                    dataField="genero"
                    options={generoOptions}
                    getOptionLabel={(opt: { value: string; label: string }) => opt.label}
                    getOptionValue={(opt: { value: string; label: string }) => opt.value}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 8 }}>
                  <ArchbaseEdit<AlunoDto, string>
                    label="Cidade"
                    dataSource={dataSource}
                    dataField="cidade"
                    placeholder="Ex: São Paulo"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <ArchbaseEdit<AlunoDto, string>
                    label="Estado"
                    dataSource={dataSource}
                    dataField="estado"
                    placeholder="Ex: SP"
                  />
                </Grid.Col>
              </Grid>

              <Box>
                <Text size="sm" fw={500} mb="xs">Foto do Aluno</Text>
                <Group align="flex-start" gap="md">
                  <Paper withBorder p="xs" radius="md">
                    {currentRecord?.avatar ? (
                      <Image
                        src={currentRecord.avatar}
                        w={120}
                        h={120}
                        radius="md"
                        fit="cover"
                        fallbackSrc="https://placehold.co/120x120?text=Foto"
                      />
                    ) : (
                      <Avatar size={120} radius="md">
                        <IconUser size={60} />
                      </Avatar>
                    )}
                  </Paper>
                  {!isViewAction && (
                    <Stack gap="xs">
                      <FileButton
                        onChange={(file) => {
                          if (file) {
                            const reader = new FileReader()
                            reader.onload = () => {
                              dataSource.setFieldValue('avatar', reader.result as string)
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                        accept="image/png,image/jpeg,image/gif,image/webp"
                      >
                        {(props) => (
                          <Button
                            {...props}
                            variant="light"
                            leftSection={<IconUpload size={16} />}
                            size="xs"
                          >
                            Enviar foto
                          </Button>
                        )}
                      </FileButton>
                      {currentRecord?.avatar && (
                        <ActionIcon
                          variant="light"
                          color="red"
                          size="lg"
                          onClick={() => dataSource.setFieldValue('avatar', '')}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      )}
                    </Stack>
                  )}
                </Group>
              </Box>
              </Stack>
            </ScrollArea>
          </Tabs.Panel>

          {/* TAB 2: Anamnese Física */}
          <Tabs.Panel value="anamnese-fisica" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <ScrollArea style={{ height: 'calc(100vh - 220px)' }} type="auto" offsetScrollbars>
              <Stack gap="md" p="md">
              <Text size="sm" fw={500}>Nível de Treino</Text>
              <SegmentedControl
                fullWidth
                value={currentRecord?.nivelTreino || 'INICIANTE'}
                onChange={(value) => {
                  if (dataSource.getCurrentRecord()) {
                    dataSource.setFieldValue('nivelTreino', value)
                  }
                }}
                data={[
                  { value: 'INICIANTE', label: 'Iniciante' },
                  { value: 'INTERMEDIARIO', label: 'Intermediário' },
                  { value: 'AVANCADO', label: 'Avançado' },
                ]}
              />

              <ArchbaseSelect
                label="Objetivo Principal"
                dataSource={dataSource}
                dataField="objetivo"
                options={objetivoOptions}
                getOptionLabel={(opt: { value: string; label: string }) => opt.label}
                getOptionValue={(opt: { value: string; label: string }) => opt.value}
              />

              <Paper withBorder p="md">
                <Text size="sm" fw={500} mb="xs">Possui dores ou desconfortos?</Text>
                <Group>
                  {doresOptions.map((dor) => (
                    <Switch
                      key={dor.value}
                      label={dor.label}
                      checked={(currentRecord?.dores || []).includes(dor.value)}
                      onChange={(e) => {
                        const dores = currentRecord?.dores || []
                        const newDores = e.currentTarget.checked
                          ? [...dores, dor.value]
                          : dores.filter((d) => d !== dor.value)
                        dataSource.setFieldValue('dores', newDores)
                      }}
                    />
                  ))}
                </Group>
              </Paper>

              <ArchbaseTextArea<AlunoDto, string>
                label="Limitações Físicas"
                dataSource={dataSource}
                dataField="limitacoesFisicas"
                placeholder="Descreva quaisquer limitações físicas..."
                minRows={2}
              />

              <Paper withBorder p="md">
                <Text size="sm" fw={500} mb="xs">Equipamentos Disponíveis em Casa</Text>
                <Group>
                  {equipamentosOptions.map((eq) => (
                    <Switch
                      key={eq.value}
                      label={eq.label}
                      checked={(currentRecord?.equipamentosDisponiveis || []).includes(eq.value)}
                      onChange={(e) => {
                        const eqs = currentRecord?.equipamentosDisponiveis || []
                        const newEqs = e.currentTarget.checked
                          ? [...eqs, eq.value]
                          : eqs.filter((q) => q !== eq.value)
                        dataSource.setFieldValue('equipamentosDisponiveis', newEqs)
                      }}
                    />
                  ))}
                </Group>
              </Paper>

              <ArchbaseSelect
                label="Possui Autorização Médica para Exercícios?"
                dataSource={dataSource}
                dataField="autorizacaoMedica"
                options={simNaoOptions}
                getOptionLabel={(opt: { value: string; label: string }) => opt.label}
                getOptionValue={(opt: { value: string; label: string }) => opt.value}
                width={250}
              />

              <ArchbaseTextArea<AlunoDto, string>
                label="Restrições Médicas"
                dataSource={dataSource}
                dataField="restricoesMedicas"
                placeholder="Doenças, medicamentos, alergias..."
                minRows={2}
              />

              <Divider label="Dados Físicos" labelPosition="center" />

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseNumberEdit<AlunoDto, number>
                    label="Peso (kg)"
                    dataSource={dataSource}
                    dataField="pesoKg"
                    min={30}
                    max={300}
                    width={150}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseNumberEdit<AlunoDto, number>
                    label="Altura (cm)"
                    dataSource={dataSource}
                    dataField="alturaCm"
                    min={100}
                    max={250}
                    width={150}
                  />
                </Grid.Col>
              </Grid>
              </Stack>
            </ScrollArea>
          </Tabs.Panel>

          {/* TAB 3: Anamnese Emocional */}
          <Tabs.Panel value="anamnese-emocional" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <ScrollArea style={{ height: 'calc(100vh - 220px)' }} type="auto" offsetScrollbars>
              <Stack gap="md" p="md">
              <Alert icon={<IconInfoCircle size={16} />} color="violet" variant="light">
                <Text size="sm">
                  Estas informações são confidenciais e serão usadas pela Virgínia para
                  personalizar o acompanhamento emocional da aluna.
                </Text>
              </Alert>

              <ArchbaseSelect
                label="Perfil Emocional BlueVix"
                dataSource={dataSource}
                dataField="perfilEmocional"
                options={perfilEmocionalOptions}
                getOptionLabel={(opt: { value: string; label: string }) => opt.label}
                getOptionValue={(opt: { value: string; label: string }) => opt.value}
              />

              <Box>
                <Text size="sm" fw={500} mb="xs">Humor Predominante (1-10)</Text>
                <Slider
                  value={currentRecord?.humorPredominante || 5}
                  onChange={(value) => {
                    if (dataSource.getCurrentRecord()) {
                      dataSource.setFieldValue('humorPredominante', value)
                    }
                  }}
                  min={1}
                  max={10}
                  step={1}
                  marks={[
                    { value: 1, label: '1' },
                    { value: 5, label: '5' },
                    { value: 10, label: '10' },
                  ]}
                  color="violet"
                  mb="lg"
                />
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Muito baixo</Text>
                  <Text size="xs" c="dimmed">Muito alto</Text>
                </Group>
              </Box>

              <Box>
                <Text size="sm" fw={500} mb="xs">Nível de Estresse (1-10)</Text>
                <Slider
                  value={currentRecord?.nivelEstresse || 5}
                  onChange={(value) => {
                    if (dataSource.getCurrentRecord()) {
                      dataSource.setFieldValue('nivelEstresse', value)
                    }
                  }}
                  min={1}
                  max={10}
                  step={1}
                  marks={[
                    { value: 1, label: '1' },
                    { value: 5, label: '5' },
                    { value: 10, label: '10' },
                  ]}
                  color="orange"
                  mb="lg"
                />
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">Muito baixo</Text>
                  <Text size="xs" c="dimmed">Muito alto</Text>
                </Group>
              </Box>

              <Text size="sm" fw={500}>Qualidade do Sono</Text>
              <SegmentedControl
                fullWidth
                value={currentRecord?.qualidadeSono || 'REGULAR'}
                onChange={(value) => {
                  if (dataSource.getCurrentRecord()) {
                    dataSource.setFieldValue('qualidadeSono', value)
                  }
                }}
                data={[
                  { value: 'PESSIMA', label: 'Péssima' },
                  { value: 'RUIM', label: 'Ruim' },
                  { value: 'REGULAR', label: 'Regular' },
                  { value: 'BOA', label: 'Boa' },
                  { value: 'OTIMA', label: 'Ótima' },
                ]}
              />

              <ArchbaseSelect
                label="Está em Terapia/Acompanhamento Psicológico?"
                dataSource={dataSource}
                dataField="emTerapia"
                options={simNaoOptions}
                getOptionLabel={(opt: { value: string; label: string }) => opt.label}
                getOptionValue={(opt: { value: string; label: string }) => opt.value}
                width={250}
              />

              <ArchbaseTextArea<AlunoDto, string>
                label="Gatilhos Emocionais"
                dataSource={dataSource}
                dataField="gatilhosEmocionais"
                placeholder="Situações que desencadeiam ansiedade, estresse..."
                minRows={2}
              />

              <Paper withBorder p="md" bg="violet.0">
                <Text size="sm" fw={500} mb="xs" c="violet">
                  Observações da Virgínia (Visível apenas para profissionais)
                </Text>
                <ArchbaseTextArea<AlunoDto, string>
                  dataSource={dataSource}
                  dataField="observacoesVirginia"
                  placeholder="Anotações e observações da Virgínia sobre a aluna..."
                  minRows={3}
                />
              </Paper>
              </Stack>
            </ScrollArea>
          </Tabs.Panel>

          {/* TAB 4: Contrato e Status */}
          <Tabs.Panel value="contrato" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <ScrollArea style={{ height: 'calc(100vh - 220px)' }} type="auto" offsetScrollbars>
              <Stack gap="md" p="md">
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseSelect
                    label="Status"
                    dataSource={dataSource}
                    dataField="status"
                    options={statusOptions}
                    getOptionLabel={(opt: { value: string; label: string }) => opt.label}
                    getOptionValue={(opt: { value: string; label: string }) => opt.value}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseSelect
                    label="Plano"
                    dataSource={dataSource}
                    dataField="plano"
                    options={planoOptions}
                    getOptionLabel={(opt: { value: string; label: string }) => opt.label}
                    getOptionValue={(opt: { value: string; label: string }) => opt.value}
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DatePickerInput
                    label="Início do Trial"
                    placeholder="Selecione..."
                    value={currentRecord?.dataInicioTrial ? new Date(currentRecord.dataInicioTrial) : null}
                    onChange={(date) => {
                      if (dataSource.getCurrentRecord()) {
                        const dateValue = date ? (date as unknown as Date).toISOString().split('T')[0] : undefined
                        dataSource.setFieldValue('dataInicioTrial', dateValue)
                      }
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DatePickerInput
                    label="Expiração do Plano"
                    placeholder="Selecione..."
                    value={currentRecord?.dataExpiracaoPlano ? new Date(currentRecord.dataExpiracaoPlano) : null}
                    onChange={(date) => {
                      if (dataSource.getCurrentRecord()) {
                        const dateValue = date ? (date as unknown as Date).toISOString().split('T')[0] : undefined
                        dataSource.setFieldValue('dataExpiracaoPlano', dateValue)
                      }
                    }}
                  />
                </Grid.Col>
              </Grid>

              <Divider label="Contrato" labelPosition="center" />

              <ArchbaseSwitch<AlunoDto, boolean>
                label="Contrato Aceito"
                dataSource={dataSource}
                dataField="contratoAceito"
              />

              {currentRecord?.dataAceiteContrato && (
                <Text size="sm" c="dimmed">
                  Aceito em: {new Date(currentRecord.dataAceiteContrato).toLocaleDateString('pt-BR')}
                </Text>
              )}

              <Divider label="Preferências" labelPosition="center" />

              <ArchbaseSwitch<AlunoDto, boolean>
                label="Aceita Acompanhamento de Ciclo Menstrual"
                dataSource={dataSource}
                dataField="aceitaCicloMenstrual"
              />

              <ArchbaseSwitch<AlunoDto, boolean>
                label="Notificações Ativas"
                dataSource={dataSource}
                dataField="notificacoesAtivas"
              />

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseEdit<AlunoDto, string>
                    label="Horário Preferido de Treino"
                    dataSource={dataSource}
                    dataField="horarioPreferidoTreino"
                    placeholder="Ex: 06:00"
                    width={150}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseEdit<AlunoDto, string>
                    label="Timezone"
                    dataSource={dataSource}
                    dataField="timezone"
                    placeholder="Ex: America/Sao_Paulo"
                  />
                </Grid.Col>
              </Grid>

              <ArchbaseTextArea<AlunoDto, string>
                label="Observações Gerais"
                dataSource={dataSource}
                dataField="observacoesGerais"
                placeholder="Outras observações..."
                minRows={3}
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
            </ScrollArea>
          </Tabs.Panel>
          </Tabs>
        </Box>
      </ArchbaseFormTemplate>
    </ValidationErrorsProvider>
  )
}
