/**
 * Exemplo: Custom Hooks com DataSource
 *
 * Este exemplo demonstra como criar hooks customizados
 * para encapsular lógica de DataSource e queries.
 *
 * IMPORTANTE: Este exemplo usa as APIs corretas da biblioteca archbase-react-v3
 * - ArchbaseDataSource construtor simples: new ArchbaseDataSource('name')
 * - Usar open() em vez de setData()
 * - Usar save() em vez de post()
 * - Usar insert() em vez de append()
 * - Usar findOne() em vez de findById()
 */

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArchbaseDataSource, ArchbaseValidator } from '@archbase/components'
import { useArchbaseRemoteServiceApi } from '@archbase/data'

import { API_TYPE } from '@ioc/IOCTypes'
import type { UserService } from '@services/UserService'
import type { UserDto } from '@domain/UserDto'

// ===========================================
// 1. HOOK BÁSICO DE DATASOURCE
// ===========================================

/**
 * Hook para gerenciar DataSource de usuários
 */
export function useUserDataSource() {
  const [dataSource] = useState(() =>
    new ArchbaseDataSource<UserDto, string>('dsUser')
  )

  return dataSource
}

// ===========================================
// 2. HOOK COM QUERY INTEGRADA
// ===========================================

/**
 * Hook para carregar um usuário por ID
 */
export function useUser(id?: string) {
  const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)

  const [dataSource] = useState(() =>
    new ArchbaseDataSource<UserDto, string>('dsUser')
  )

  // CORRETO: usar findOne, não findById
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.findOne(id!),
    enabled: !!id
  })

  useEffect(() => {
    if (data) {
      // CORRETO: usar open(), não setData()
      dataSource.open({ records: [data] })
    }
  }, [data, dataSource])

  return {
    dataSource,
    isLoading,
    isError,
    error,
    refetch
  }
}

// ===========================================
// 3. HOOK PARA LISTA DE USUÁRIOS
// ===========================================

interface UseUsersOptions {
  initialFilters?: {
    name?: string
    status?: string
    active?: boolean
  }
  enabled?: boolean
}

/**
 * Hook para gerenciar lista de usuários
 */
export function useUsers(options: UseUsersOptions = {}) {
  const { initialFilters = {}, enabled = true } = options
  const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)

  const [filters, setFilters] = useState(initialFilters)

  const [dataSource] = useState(() =>
    new ArchbaseDataSource<UserDto, string>('dsUsers')
  )

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => userService.findAll(0, 100),
    enabled
  })

  useEffect(() => {
    if (data?.content) {
      // CORRETO: usar open(), não setData()
      dataSource.open({ records: data.content })
    }
  }, [data, dataSource])

  const updateFilters = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  return {
    dataSource,
    filters,
    setFilters: updateFilters,
    clearFilters,
    isLoading,
    isError,
    error,
    refetch
  }
}

// ===========================================
// 4. HOOK PARA FORMULÁRIO COMPLETO
// ===========================================

interface UseUserFormOptions {
  id?: string
  action: 'NEW' | 'EDIT' | 'VIEW'
  onSuccess?: () => void
}

/**
 * Hook completo para formulário de usuário
 */
export function useUserForm({ id, action, onSuccess }: UseUserFormOptions) {
  const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)
  const queryClient = useQueryClient()

  // DataSource com validação
  const [dataSource] = useState(() => {
    const ds = new ArchbaseDataSource<UserDto, string>('dsUser')
    ds.setValidator(new ArchbaseValidator())
    return ds
  })

  // CORRETO: usar findOne, não findById
  const { data, isLoading: isLoadingData, isError, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.findOne(id!),
    enabled: !!id && action !== 'NEW'
  })

  // Mutation para salvar
  const saveMutation = useMutation({
    mutationFn: (user: UserDto) => userService.save(user),
    onSuccess: () => {
      // CORRETO: usar save(), não post()
      dataSource.save()
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onSuccess?.()
    }
  })

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: (userId: string) => userService.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onSuccess?.()
    }
  })

  // Popular DataSource quando dados chegam
  useEffect(() => {
    if (data) {
      // CORRETO: usar open(), não setData()
      dataSource.open({ records: [data] })
      if (action === 'EDIT') {
        dataSource.edit()
      }
    } else if (action === 'NEW') {
      // CORRETO: usar insert(), não append()
      dataSource.insert({ active: true } as UserDto)
    }
  }, [data, action, dataSource])

  // Função de save
  const save = useCallback(async () => {
    const errors = dataSource.validate()
    if (errors && errors.length > 0) {
      return false
    }
    const currentData = dataSource.getCurrentRecord()
    if (currentData) {
      await saveMutation.mutateAsync(currentData)
    }
    return true
  }, [dataSource, saveMutation])

  // Função de delete
  const remove = useCallback(async () => {
    const currentId = dataSource.getFieldValue('id')
    if (currentId) {
      await deleteMutation.mutateAsync(currentId)
    }
  }, [dataSource, deleteMutation])

  // Função para resetar form
  const reset = useCallback(() => {
    if (action === 'NEW') {
      dataSource.cancel()
      // CORRETO: usar insert(), não append()
      dataSource.insert({ active: true } as UserDto)
    } else if (data) {
      // CORRETO: usar open(), não setData()
      dataSource.open({ records: [data] })
      if (action === 'EDIT') {
        dataSource.edit()
      }
    }
  }, [action, data, dataSource])

  return {
    dataSource,
    isLoading: isLoadingData || saveMutation.isPending || deleteMutation.isPending,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isError,
    error: error || saveMutation.error || deleteMutation.error,
    isViewOnly: action === 'VIEW',
    save,
    remove,
    reset
  }
}

// ===========================================
// 5. HOOK PARA PAGINAÇÃO
// ===========================================

interface UsePaginatedUsersOptions {
  pageSize?: number
}

/**
 * Hook para lista paginada de usuários
 */
export function usePaginatedUsers({ pageSize = 20 }: UsePaginatedUsersOptions = {}) {
  const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)

  const [page, setPage] = useState(1)

  const [dataSource] = useState(() =>
    new ArchbaseDataSource<UserDto, string>('dsUsers')
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['users', 'paginated', page, pageSize],
    queryFn: () => userService.findAll(page - 1, pageSize)  // API usa 0-based
  })

  useEffect(() => {
    if (data?.content) {
      // CORRETO: usar open() com paginação
      dataSource.open({
        records: data.content,
        grandTotalRecords: data.totalElements,
        currentPage: data.number,
        totalPages: data.totalPages,
        pageSize: data.size
      })
    }
  }, [data, dataSource])

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const nextPage = useCallback(() => {
    setPage(p => p + 1)
  }, [])

  const prevPage = useCallback(() => {
    setPage(p => Math.max(1, p - 1))
  }, [])

  return {
    dataSource,
    page,
    pageSize,
    totalRecords: data?.totalElements || 0,
    totalPages: Math.ceil((data?.totalElements || 0) / pageSize),
    isLoading,
    isError,
    error,
    goToPage,
    nextPage,
    prevPage
  }
}

// ===========================================
// 6. EXEMPLO DE USO NO COMPONENTE
// ===========================================

/*
import { useUserForm } from '@hooks/useDataSource.example'

function UserFormComponent({ id, action, onClose }) {
  const {
    dataSource,
    isLoading,
    isSaving,
    isError,
    error,
    isViewOnly,
    save
  } = useUserForm({ id, action, onSuccess: onClose })

  const handleSave = async () => {
    const success = await save()
    if (success) {
      // Já chamou onClose via onSuccess
    }
  }

  return (
    <ArchbaseFormTemplate
      dataSource={dataSource}
      isLoading={isLoading}
      isError={isError}
      error={error}
      onBeforeSave={handleSave}
      onCancel={onClose}
    >
      <ArchbaseEdit
        dataSource={dataSource}
        dataField="name"
        label="Nome"
        readOnly={isViewOnly}
      />
    </ArchbaseFormTemplate>
  )
}
*/

export default {
  useUserDataSource,
  useUser,
  useUsers,
  useUserForm,
  usePaginatedUsers
}
