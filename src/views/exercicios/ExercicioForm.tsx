/**
 * ExercicioForm - Formulario de Exercicio
 */
import { useEffect, useRef } from 'react'
import { Stack, LoadingOverlay, Tabs, Grid, Group, Image, Text, Paper, Box } from '@mantine/core'
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
} from '@archbase/components'
import { useArchbaseValidator } from '@archbase/core'
import { useArchbaseNavigationListener } from '@archbase/admin'
import { useLocation, useParams } from 'react-router'
import { useSearchParams } from 'react-router-dom'
import { useInjection } from 'inversify-react'
import { IconFileText, IconVideo, IconSettings } from '@tabler/icons-react'

import { ExercicioDto } from '../../domain/exercicio/ExercicioDto'
import { ExercicioService } from '../../services/ExercicioService'
import { API_TYPE } from '../../ioc/IOCTypes'

// Opcoes de padrao de movimento
const padraoMovimentoOptions = [
  { value: 'AGACHAMENTO', label: 'Agachamento' },
  { value: 'HINGE', label: 'Hinge (Dobradiça)' },
  { value: 'EMPURRAR', label: 'Empurrar' },
  { value: 'PUXAR', label: 'Puxar' },
  { value: 'CORE', label: 'Core' },
  { value: 'MOBILIDADE', label: 'Mobilidade' },
]

// Opcoes de nivel
const nivelOptions = [
  { value: 'INICIANTE', label: 'Iniciante' },
  { value: 'INTERMEDIARIO', label: 'Intermediario' },
  { value: 'AVANCADO', label: 'Avancado' },
  { value: 'TODOS', label: 'Todos os niveis' },
]

// Opcoes de equipamento
const equipamentoOptions = [
  { value: 'NENHUM', label: 'Nenhum (peso corporal)' },
  { value: 'HALTERES', label: 'Halteres' },
  { value: 'BARRA', label: 'Barra' },
  { value: 'ELASTICO', label: 'Elastico' },
  { value: 'COLCHONETE', label: 'Colchonete' },
  { value: 'KETTLEBELL', label: 'Kettlebell' },
  { value: 'BOLA', label: 'Bola' },
  { value: 'BANCO', label: 'Banco' },
]

// Opcoes de categoria
const categoriaOptions = [
  { value: 'LIBERACAO_MIOFASCIAL', label: 'Liberacao Miofascial' },
  { value: 'MOBILIDADE_ARTICULAR', label: 'Mobilidade Articular' },
  { value: 'CORE_QUADRIL', label: 'Core + Quadril' },
  { value: 'FORCA_FUNCIONAL', label: 'Forca Funcional' },
  { value: 'CARDIO_CONSCIENTE', label: 'Cardio Consciente' },
  { value: 'DESACELERACAO', label: 'Desaceleracao' },
]

export function ExercicioForm() {
  const location = useLocation()
  const { id } = useParams()
  const validator = useArchbaseValidator()
  const [searchParams] = useSearchParams()
  const action = searchParams.get('action') || ''

  const exercicioService = useInjection<ExercicioService>(API_TYPE.ExercicioService)

  // Store com nome fixo
  const templateStore = useArchbaseStore('exercicioFormStore')
  const { closeAllowed } = useArchbaseNavigationListener(location.pathname, () => {
    templateStore.clearAllValues()
    closeAllowed()
  })
  const serviceApi = useArchbaseRemoteServiceApi<ExercicioService>(API_TYPE.ExercicioService)

  // Comparacao case-insensitive para action
  const isAddAction = action.toUpperCase() === 'ADD'
  const isEditAction = action.toUpperCase() === 'EDIT'
  const isViewAction = action.toUpperCase() === 'VIEW'

  // useArchbaseRemoteDataSourceV2
  const { dataSource, isLoading } = useArchbaseRemoteDataSourceV2<ExercicioDto>({
    name: 'dsExercicio',
    label: 'Exercicio',
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
        const newRecord = ExercicioDto.newInstance()
        dataSource.insert(newRecord)
      } else if ((isEditAction || isViewAction) && id) {
        try {
          const record = await exercicioService.findOne(id)
          const dto = new ExercicioDto(record)
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
  const imagemUrl = currentRecord?.imagemUrl

  return (
    <ValidationErrorsProvider>
      <ArchbaseFormTemplate
        title={isAddAction ? 'Novo Exercicio' : `Editar Exercicio`}
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
            <Tabs.Tab value="midia" leftSection={<IconVideo size={16} />}>
              Midia
            </Tabs.Tab>
            <Tabs.Tab value="config" leftSection={<IconSettings size={16} />}>
              Configuracoes
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="dados" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <Stack gap="md" p="md">
              <ArchbaseEdit<ExercicioDto, string>
                label="Nome do Exercício"
                dataSource={dataSource}
                dataField="nome"
                placeholder="Digite o nome do exercício"
                required
              />

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseSelect
                    label="Padrão de Movimento"
                    dataSource={dataSource}
                    dataField="padraoMovimento"
                    options={padraoMovimentoOptions}
                    getOptionLabel={(opt: { value: string; label: string }) => opt.label}
                    getOptionValue={(opt: { value: string; label: string }) => opt.value}
                    placeholder="Selecione o padrão"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseNumberEdit<ExercicioDto, number>
                    label="Step dentro do Padrão"
                    dataSource={dataSource}
                    dataField="stepPadrao"
                    min={1}
                    max={10}
                    placeholder="1 a 10"
                  />
                </Grid.Col>
              </Grid>

              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseSelect
                    label="Nível"
                    dataSource={dataSource}
                    dataField="nivel"
                    options={nivelOptions}
                    getOptionLabel={(opt: { value: string; label: string }) => opt.label}
                    getOptionValue={(opt: { value: string; label: string }) => opt.value}
                    required
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <ArchbaseSelect
                    label="Categoria/Fase"
                    dataSource={dataSource}
                    dataField="categoria"
                    options={categoriaOptions}
                    getOptionLabel={(opt: { value: string; label: string }) => opt.label}
                    getOptionValue={(opt: { value: string; label: string }) => opt.value}
                  />
                </Grid.Col>
              </Grid>

              <ArchbaseSelect
                label="Equipamento Principal"
                dataSource={dataSource}
                dataField="equipamento"
                options={equipamentoOptions}
                getOptionLabel={(opt: { value: string; label: string }) => opt.label}
                getOptionValue={(opt: { value: string; label: string }) => opt.value}
                width={300}
              />

              <Grid>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <ArchbaseNumberEdit<ExercicioDto, number>
                    label="Duração (segundos)"
                    dataSource={dataSource}
                    dataField="duracaoSegundos"
                    min={0}
                    placeholder="Ex: 30"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <ArchbaseEdit<ExercicioDto, string>
                    label="Repetições"
                    dataSource={dataSource}
                    dataField="repeticoesTexto"
                    placeholder="Ex: 12 ou 8-12"
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <ArchbaseNumberEdit<ExercicioDto, number>
                    label="Séries"
                    dataSource={dataSource}
                    dataField="series"
                    min={1}
                    max={10}
                    placeholder="Ex: 3"
                  />
                </Grid.Col>
              </Grid>

              <ArchbaseTextArea<ExercicioDto, string>
                label="Descrição"
                dataSource={dataSource}
                dataField="descricao"
                placeholder="Descrição do exercício"
                minRows={2}
              />

              <ArchbaseTextArea<ExercicioDto, string>
                label="Instruções de Execução"
                dataSource={dataSource}
                dataField="instrucoes"
                placeholder="Passo a passo para executar o exercício"
                minRows={3}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="midia" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <Stack gap="md" p="md">
              <ArchbaseEdit<ExercicioDto, string>
                label="URL do Video"
                dataSource={dataSource}
                dataField="videoUrl"
                placeholder="https://..."
              />

              <ArchbaseEdit<ExercicioDto, string>
                label="URL da Imagem"
                dataSource={dataSource}
                dataField="imagemUrl"
                placeholder="https://..."
              />

              {imagemUrl && (
                <Paper withBorder p="md">
                  <Text size="sm" c="dimmed" mb="xs">
                    Preview da Imagem
                  </Text>
                  <Image src={imagemUrl} maw={300} radius="md" />
                </Paper>
              )}

              <ArchbaseEdit<ExercicioDto, string>
                label="URL do GIF"
                dataSource={dataSource}
                dataField="gifUrl"
                placeholder="https://..."
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="config" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            <Stack gap="md" p="md">
              <ArchbaseSwitch<ExercicioDto, boolean>
                label="Exercicio Ativo"
                dataSource={dataSource}
                dataField="ativo"
              />

              <ArchbaseNumberEdit<ExercicioDto, number>
                label="Ordenacao"
                dataSource={dataSource}
                dataField="ordenacao"
                min={0}
                width={150}
                placeholder="Ex: 1"
              />

              <ArchbaseNumberEdit<ExercicioDto, number>
                label="Calorias por Minuto"
                dataSource={dataSource}
                dataField="caloriasPorMinuto"
                min={0}
                width={180}
                placeholder="Ex: 5"
              />

              <Paper withBorder p="md" bg="gray.0">
                <Text size="sm" fw={500} mb="xs">
                  Informacoes do Sistema
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
