import { MantineThemeOverride, MantineColorsTuple } from '@mantine/core'

/**
 * Paleta de cores primária para tema escuro
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
 * Tema escuro do aplicativo
 */
export const AppThemeDark: MantineThemeOverride = {
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
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: '#1a1f24',
        },
        header: {
          borderBottom: 'none',
          backgroundColor: '#1a1f24',
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
          backgroundColor: '#212529',
          color: '#f8f9fa',
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
          backgroundColor: '#212529',
          color: '#f8f9fa',
        },
      },
    },
  },
}
