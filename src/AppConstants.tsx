/**
 * Constantes globais do aplicativo
 *
 * Defina aqui valores constantes usados em todo o app.
 */

// Nome do aplicativo
export const APP_NAME = 'Archbase React Boilerplate'

// Versão do aplicativo (vem do .env)
export const APP_VERSION = import.meta.env.VITE_REACT_APP_VERSION || '1.0.0'

// API URL
export const API_URL = import.meta.env.VITE_API || 'http://localhost:8080'

// Nome do translation (usado no i18next)
export const TRANSLATION_NAME = 'app'

// Chaves de localStorage
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  COLOR_SCHEME: 'mantine-color-scheme',
} as const

// Timeout padrão para requisições (ms)
export const DEFAULT_REQUEST_TIMEOUT = 30000

// Tamanho padrão de paginação
export const DEFAULT_PAGE_SIZE = 20
