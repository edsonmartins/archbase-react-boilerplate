import { useEffect, useMemo, useCallback } from 'react'
import { useArchbaseSecureForm } from '@archbase/security'
import type { SecurityAction } from '@security/securityActions'

/**
 * Hook que estende useArchbaseSecureForm adicionando:
 * - Registro automático de ações customizadas
 * - Helper `can(actionName)` para verificar permissões
 * - Lista de ações disponíveis para o recurso
 *
 * @param resourceName Nome do recurso (ex: 'minha_entidade')
 * @param resourceDescription Descrição do recurso (ex: 'Minha Entidade')
 * @param customActions Array de ações customizadas para registrar
 *
 * @example
 * ```tsx
 * const CUSTOM_ACTIONS = [
 *   { name: 'aprovar', description: 'Aprovar Item' },
 *   { name: 'cancelar', description: 'Cancelar Item' },
 * ]
 *
 * const { canCreate, canEdit, can, isLoading } = useSecureActions(
 *   'minha_entidade',
 *   'Minha Entidade',
 *   CUSTOM_ACTIONS
 * )
 *
 * if (can('aprovar')) {
 *   // permitir ação
 * }
 * ```
 */
export function useSecureActions(
  resourceName: string,
  resourceDescription: string,
  customActions: SecurityAction[] = []
) {
  const secureForm = useArchbaseSecureForm(resourceName, resourceDescription)

  useEffect(() => {
    if (customActions.length > 0 && secureForm.registerAction) {
      customActions.forEach(action => {
        secureForm.registerAction(action.name, action.description)
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const can = useCallback(
    (actionName: string): boolean => {
      if (secureForm.hasPermission) {
        return secureForm.hasPermission(actionName)
      }
      return false
    },
    [secureForm]
  )

  const canAny = useCallback(
    (actionNames: string[]): boolean => {
      if (secureForm.hasAnyPermission) {
        return secureForm.hasAnyPermission(actionNames)
      }
      return actionNames.some(name => can(name))
    },
    [secureForm, can]
  )

  const canAll = useCallback(
    (actionNames: string[]): boolean => {
      if (secureForm.hasAllPermissions) {
        return secureForm.hasAllPermissions(actionNames)
      }
      return actionNames.every(name => can(name))
    },
    [secureForm, can]
  )

  const customActionNames = useMemo(
    () => customActions.map(a => a.name),
    [customActions]
  )

  return {
    // Permissões CRUD padrão
    canCreate: secureForm.canCreate,
    canEdit: secureForm.canEdit,
    canDelete: secureForm.canDelete,
    canView: secureForm.canView,
    canList: secureForm.canList,

    // Verificação de ações customizadas
    can,
    canAny,
    canAll,

    // Verificação genérica (da lib)
    hasPermission: secureForm.hasPermission,
    hasAnyPermission: secureForm.hasAnyPermission,
    hasAllPermissions: secureForm.hasAllPermissions,

    // Registro de novas ações
    registerAction: secureForm.registerAction,

    // Estado
    isLoading: secureForm.isLoading,
    error: secureForm.error,

    // Security Manager (para casos avançados)
    securityManager: secureForm.securityManager,

    // Lista de ações customizadas registradas
    customActionNames,
  }
}

export type UseSecureActionsReturn = ReturnType<typeof useSecureActions>

export function useBasicSecurity(
  resourceName: string,
  resourceDescription: string
) {
  return useSecureActions(resourceName, resourceDescription, [])
}
