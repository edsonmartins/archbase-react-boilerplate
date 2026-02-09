/**
 * Exemplo: Formulário Básico com Archbase
 *
 * Este exemplo demonstra a estrutura padrão de um formulário
 * usando ArchbaseDataSource e ArchbaseFormTemplate.
 *
 * IMPORTANTE: Este exemplo usa as APIs corretas da biblioteca archbase-react-v3
 */

import { useState, useEffect, useRef } from 'react'
import { Paper, Box, Group, Grid } from '@mantine/core'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Imports Archbase
import {
  ArchbaseDataSource,
  ArchbaseValidator,
  ArchbaseEdit,
  ArchbaseSelect,
  ArchbaseSwitch,
  ArchbaseMaskEdit,
  ArchbaseDatePickerEdit
} from '@archbase/components'
import { ArchbaseFormTemplate, useArchbaseSize } from '@archbase/template'
import { useArchbaseRemoteServiceApi } from '@archbase/data'

// Imports locais
import { API_TYPE } from '@ioc/IOCTypes'
import type { UserService } from '@services/UserService'
import type { UserDto } from '@domain/UserDto'

// ===========================================
// 1. TIPOS E INTERFACES
// ===========================================
interface UserFormProps {
  id?: string
  action: 'NEW' | 'EDIT' | 'VIEW'
  onClose: () => void
}

// Interface para opções de status
interface StatusOption {
  id: string
  name: string
}

// ===========================================
// 2. COMPONENTE DO FORMULÁRIO
// ===========================================
export function UserForm({ id, action, onClose }: UserFormProps) {
  // ------------------------------------------
  // 2.1 Hook de tamanho - CORRETO: retorna [width, height]
  // ------------------------------------------
  const ref = useRef<HTMLDivElement>(null)
  const [width, height] = useArchbaseSize(ref)
  const safeHeight = height > 0 ? height - 130 : 600

  // ------------------------------------------
  // 2.2 DataSource - CORRETO: novo construtor
  // ------------------------------------------
  const [dataSource] = useState(() =>
    new ArchbaseDataSource<UserDto, string>('dsUser')
  )

  // Configurar validator separadamente (se usar class-validator)
  useEffect(() => {
    dataSource.setValidator(new ArchbaseValidator())
  }, [])

  // ------------------------------------------
  // 2.3 Services e QueryClient
  // ------------------------------------------
  const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)
  const queryClient = useQueryClient()

  // ------------------------------------------
  // 2.4 Query para carregar dados (EDIT/VIEW)
  // CORRETO: usar findOne, não findById
  // ------------------------------------------
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.findOne(id!),
    enabled: !!id && action !== 'NEW'
  })

  // ------------------------------------------
  // 2.5 Mutation para salvar
  // ------------------------------------------
  const saveMutation = useMutation({
    mutationFn: (user: UserDto) => userService.save(user),
    onSuccess: () => {
      dataSource.save()  // CORRETO: save(), não post()
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onClose()
    }
  })

  // ------------------------------------------
  // 2.6 Effect para popular DataSource
  // CORRETO: usar open() em vez de setData()
  // ------------------------------------------
  useEffect(() => {
    if (data) {
      // Registro existente
      dataSource.open({ records: [data] })
      if (action === 'EDIT') {
        dataSource.edit()  // Entrar em modo edição
      }
    } else if (action === 'NEW') {
      // Novo registro - CORRETO: usar insert(), não append()
      dataSource.insert({
        active: true,
        status: 'ACTIVE'
      } as UserDto)
    }
  }, [data, action])

  // ------------------------------------------
  // 2.7 Handler de save
  // ------------------------------------------
  const handleSave = async () => {
    // Validar antes de salvar
    const errors = dataSource.validate()
    if (errors && errors.length > 0) return

    // Enviar para API
    const currentData = dataSource.getCurrentRecord()
    if (currentData) {
      saveMutation.mutate(currentData)
    }
  }

  // ------------------------------------------
  // 2.8 Flag de somente leitura
  // ------------------------------------------
  const isViewOnly = action === 'VIEW'

  // ------------------------------------------
  // 2.9 Opções para select - CORRETO: usar options + getters
  // ------------------------------------------
  const statusOptions: StatusOption[] = [
    { id: 'ACTIVE', name: 'Ativo' },
    { id: 'INACTIVE', name: 'Inativo' },
    { id: 'PENDING', name: 'Pendente' }
  ]

  // ------------------------------------------
  // 2.10 Render
  // ------------------------------------------
  return (
    <ArchbaseFormTemplate
      innerRef={ref}
      title={action === 'NEW' ? 'Novo Usuário' : action === 'EDIT' ? 'Editar Usuário' : 'Visualizar Usuário'}
      dataSource={dataSource}
      isLoading={isLoading || saveMutation.isPending}
      isError={isError}
      error={error}
      withBorder={false}
      onCancel={onClose}
      onBeforeSave={handleSave}
    >
      <Paper ref={ref} withBorder style={{ height: safeHeight }}>
        <Box p="md">
          {/* Linha 1: Nome e E-mail */}
          <Group grow mb="md">
            <ArchbaseEdit
              dataSource={dataSource}
              dataField="name"
              label="Nome"
              placeholder="Digite o nome completo"
              required
              readOnly={isViewOnly}
            />
            <ArchbaseEdit
              dataSource={dataSource}
              dataField="email"
              label="E-mail"
              placeholder="usuario@email.com"
              required
              readOnly={isViewOnly}
            />
          </Group>

          {/* Linha 2: Telefone e Data de Nascimento */}
          <Grid mb="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <ArchbaseMaskEdit
                dataSource={dataSource}
                dataField="phone"
                label="Telefone"
                mask="(00) 00000-0000"
                required
                readOnly={isViewOnly}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <ArchbaseDatePickerEdit
                dataSource={dataSource}
                dataField="birthDate"
                label="Data de Nascimento"
                readOnly={isViewOnly}
              />
            </Grid.Col>
          </Grid>

          {/* Linha 3: Status e Ativo */}
          {/* CORRETO: usar options + getOptionLabel + getOptionValue */}
          <Group grow>
            <ArchbaseSelect<UserDto, string, StatusOption>
              dataSource={dataSource}
              dataField="status"
              label="Status"
              options={statusOptions}
              getOptionLabel={(opt) => opt.name}
              getOptionValue={(opt) => opt.id}
              required
              readOnly={isViewOnly}
            />
            <ArchbaseSwitch
              dataSource={dataSource}
              dataField="active"
              label="Usuário Ativo"
              readOnly={isViewOnly}
            />
          </Group>
        </Box>
      </Paper>
    </ArchbaseFormTemplate>
  )
}

// ===========================================
// 3. EXPORTAÇÃO
// ===========================================
export default UserForm
