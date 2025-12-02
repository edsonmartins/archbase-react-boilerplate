import { MantineThemeOverride, MantineColorsTuple } from '@mantine/core'

/**
 * Paleta de cores primária
 * 10 tons do mais claro ao mais escuro (padrão Mantine)
 */
const appPrimary: MantineColorsTuple = [
  '#e7f5ff',
  '#d0ebff',
  '#a5d8ff',
  '#74c0fc',
  '#4dabf7',
  '#339af0',
  '#228be6', // primary
  '#1c7ed6',
  '#1971c2',
  '#1864ab',
]

/**
 * Paleta de cores secundária/accent
 */
const appAccent: MantineColorsTuple = [
  '#e6fcf5',
  '#c3fae8',
  '#96f2d7',
  '#63e6be',
  '#38d9a9',
  '#20c997',
  '#12b886', // accent
  '#0ca678',
  '#099268',
  '#087f5b',
]

/**
 * Paleta de cores neutras
 */
const appGray: MantineColorsTuple = [
  '#f8f9fa',
  '#e9ecef',
  '#dee2e6',
  '#ced4da',
  '#adb5bd',
  '#6c757d',
  '#495057',
  '#343a40',
  '#212529',
  '#1a1f24',
]

/**
 * Tema claro do aplicativo
 */
export const AppThemeLight: MantineThemeOverride = {
  primaryColor: 'appPrimary',
  colors: {
    appPrimary,
    appAccent,
    appGray,
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
          borderRight: '1px solid rgba(0, 0, 0, 0.1)',
          backgroundColor: '#ffffff',
        },
        header: {
          borderBottom: 'none',
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
          color: '#1a1f24',
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
          color: '#1a1f24',
        },
      },
    },
  },
}

/**
 * Constantes de cores do aplicativo
 * Use para referência rápida em componentes
 */
export const AppColors = {
  primary: '#228be6',
  accent: '#12b886',
  backgroundDark: '#303841',
  surface: '#46515e',
  surfaceDark: '#1a1f24',
  backgroundLight: '#ffffff',
  success: '#12b886',
  error: '#E53E3E',
  warning: '#FF9500',
  info: '#228be6',
  textPrimary: '#1a1f24',
  textSecondary: '#46515e',
  gradient: 'linear-gradient(135deg, #228be6 0%, #12b886 100%)',
} as const
