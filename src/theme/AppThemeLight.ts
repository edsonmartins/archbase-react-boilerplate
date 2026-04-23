import { MantineThemeOverride, MantineColorsTuple } from '@mantine/core'

/**
 * BlueVix - Paleta de cores primária (Azul)
 * 10 tons do mais claro ao mais escuro (padrão Mantine)
 */
const bluevixBlue: MantineColorsTuple = [
  '#E3F0FF', // 0 - lightest
  '#C8DFFA', // 1
  '#A3C9F5', // 2
  '#6EACEB', // 3
  '#4A93E0', // 4
  '#2A7AD4', // 5
  '#1A5DAA', // 6 - primary
  '#0D4A8A', // 7
  '#0D2E5A', // 8 - dark (navbar color)
  '#062648', // 9 - darkest
]

/**
 * BlueVix - Paleta de cores secundária (Teal)
 */
const bluevixTeal: MantineColorsTuple = [
  '#E0FAF6', // 0
  '#C2F5ED', // 1
  '#8FEADC', // 2
  '#5CDCC8', // 3
  '#34CCB3', // 4
  '#1AB89B', // 5
  '#14A085', // 6 - accent
  '#0D8570', // 7
  '#086B5A', // 8
  '#003530', // 9
]

/**
 * BlueVix - Paleta de cores neutras
 */
const bluevixGray: MantineColorsTuple = [
  '#F8FAFC',
  '#F1F5F9',
  '#E2E8F0',
  '#CBD5E1',
  '#94A3B8',
  '#64748B',
  '#475569',
  '#334155',
  '#1E293B',
  '#0F172A',
]

/**
 * Tema claro do BlueVix Admin
 */
export const AppThemeLight: MantineThemeOverride = {
  primaryColor: 'appPrimary',
  colors: {
    appPrimary: bluevixBlue,
    bluevixBlue,
    bluevixTeal,
    bluevixGray,
  },
  defaultRadius: 'md',
  fontFamily: 'Inter, system-ui, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '600',
  },
  components: {
    AppShell: {
      styles: {
        navbar: {
          borderRight: 'none',
          backgroundColor: '#0D2E5A', // Dark navy sidebar
        },
        header: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          backgroundColor: '#ffffff',
        },
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
        withBorder: true,
      },
      styles: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1E293B',
        },
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Badge: {
      styles: {
        root: {
          textTransform: 'none',
        },
      },
    },
    Paper: {
      styles: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1E293B',
        },
      },
    },
    Tabs: {
      defaultProps: {
        variant: 'outline',
      },
    },
  },
}

/**
 * Constantes de cores do BlueVix
 * Use para referência rápida em componentes
 */
export const AppColors = {
  // Primary colors
  primary: '#1A5DAA',
  primaryDark: '#0D2E5A',
  primaryLight: '#4A93E0',

  // Accent/Secondary
  accent: '#14A085',
  accentLight: '#34CCB3',

  // Backgrounds
  navbarBg: '#0D2E5A',
  headerBg: '#ffffff',
  backgroundLight: '#F8FAFC',
  surface: '#ffffff',

  // Status colors
  success: '#14A085',
  error: '#DC2626',
  warning: '#F59E0B',
  info: '#2563EB',

  // Status aluno
  statusAtivo: '#14A085',
  statusTrial: '#F59E0B',
  statusExpirado: '#DC2626',
  statusPausado: '#6B7280',
  statusCancelado: '#991B1B',

  // Níveis de treino
  nivelIniciante: '#22C55E',
  nivelIntermediario: '#F59E0B',
  nivelAvancado: '#EF4444',

  // Text
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textOnDark: '#F8FAFC',

  // Gradient
  gradient: 'linear-gradient(135deg, #1A5DAA 0%, #14A085 100%)',
} as const
