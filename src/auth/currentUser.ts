import { useArchbaseAppContext } from '@archbase/core'
import { AppUser } from './AppUser'

const CURRENT_USER_STORAGE_KEY = 'app.current-user'

/**
 * Persiste o usuário atual no localStorage
 */
export function persistCurrentUser(user?: AppUser | null): void {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
    return
  }

  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(user))
}

/**
 * Remove o usuário atual do localStorage
 */
export function clearCurrentUser(): void {
  localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
}

/**
 * Recupera o usuário armazenado do localStorage
 */
export function getStoredCurrentUser(): AppUser | undefined {
  const raw = localStorage.getItem(CURRENT_USER_STORAGE_KEY)
  if (!raw) {
    return undefined
  }

  try {
    return new AppUser(JSON.parse(raw))
  } catch (_error) {
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY)
    return undefined
  }
}

/**
 * Retorna o ID do ator de domínio (userId ou id)
 */
export function getDomainActorId(user?: Partial<AppUser> | null): string {
  return user?.userId || user?.id || ''
}

/**
 * Hook para obter o usuário atual do contexto da aplicação
 */
export function useCurrentAppUser(): AppUser | undefined {
  const { user } = useArchbaseAppContext()
  return user ? new AppUser(user) : undefined
}
