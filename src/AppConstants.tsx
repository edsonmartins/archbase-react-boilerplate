/**
 * Constantes globais do BlueVix Admin
 *
 * BlueVix - App de bem-estar integrado corpo e mente
 */

// Nome do aplicativo
export const APP_NAME = 'BlueVix Admin'

// Versão do aplicativo (vem do .env)
export const APP_VERSION = import.meta.env.VITE_REACT_APP_VERSION || '1.0.0'

// API URL
export const API_URL = import.meta.env.VITE_API || 'http://localhost:8080'

// Nome do translation (usado no i18next)
export const TRANSLATION_NAME = 'bluevix'

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
export const DEFAULT_PAGE_SIZE = 15

// Roles do sistema
export const ROLES = {
  ADMIN: 'ADMIN',
  ADMIN_TREINO: 'ADMIN_TREINO',
  ADMIN_EMOCIONAL: 'ADMIN_EMOCIONAL',
} as const

// Status de aluno
export const ALUNO_STATUS = {
  TRIAL: 'TRIAL',
  ATIVO: 'ATIVO',
  EXPIRADO: 'EXPIRADO',
  PAUSADO: 'PAUSADO',
  CANCELADO: 'CANCELADO',
} as const

// Níveis de treino
export const NIVEL_TREINO = {
  INICIANTE: 'INICIANTE',
  INTERMEDIARIO: 'INTERMEDIARIO',
  AVANCADO: 'AVANCADO',
} as const

// Tipos de plano
export const PLANO_TYPE = {
  SEMENTE: 'SEMENTE',
  ESSENCIAL: 'ESSENCIAL',
  PRESENCA: 'PRESENCA',
  TRIAL: 'TRIAL',
} as const

// Fases do ciclo menstrual
export const FASE_CICLO = {
  MENSTRUAL: 'MENSTRUAL',
  FOLICULAR: 'FOLICULAR',
  OVULATORIA: 'OVULATORIA',
  LUTEA: 'LUTEA',
  DESCONHECIDA: 'DESCONHECIDA',
} as const
