import { MantineThemeOverride } from '@mantine/core'
import { appBlue, appGreen, appGray, AppTokens } from './palette'

const T = AppTokens.dark

/**
 * Tema escuro — o par de {@link AppThemeLight}. As duas variantes partem da mesma
 * paleta e dos mesmos raios; o que muda são as superfícies e a intensidade dos
 * halos, que no escuro precisam ser mais discretos para não virar mancha.
 *
 * Assim como no claro, as cores dos componentes vêm de CSS var (`--app-*`) e não
 * de token literal — é o que faz uma view em cache do keep-alive acompanhar a
 * troca de tema em vez de congelar as cores do tema anterior.
 */
export const AppThemeDark: MantineThemeOverride = {
  primaryColor: 'appBlue',
  primaryShade: 6,
  colors: {
    appBlue,
    appGreen,
    appGray,
  },
  defaultRadius: 'lg',
  radius: {
    xs: '6px',
    sm: '9px',
    md: '11px',
    lg: '16px',
    xl: '22px',
  },
  fontFamily: 'Inter, system-ui, sans-serif',
  headings: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '700',
  },
  shadows: {
    xs: '0 4px 14px rgba(0,0,0,.20)',
    sm: '0 6px 20px rgba(0,0,0,.24)',
    md: T.shadow,
    lg: '0 14px 40px rgba(0,0,0,.32)',
    xl: '0 20px 56px rgba(0,0,0,.36)',
  },
  components: {
    AppShell: {
      styles: {
        navbar: {
          border: 'none',
          backgroundImage: AppTokens.sidebarGradient,
          backgroundColor: AppTokens.blue950,
        },
        header: {
          borderBottom: '1px solid var(--app-border)',
          backgroundColor: 'var(--app-surface)',
        },
        main: {
          backgroundColor: 'var(--app-bg)',
          // Halos mais fracos que no claro: sobre fundo escuro, a mesma opacidade
          // vira mancha visível em vez de sugestão de profundidade.
          backgroundImage:
            'radial-gradient(circle at 85% 8%, rgba(96,165,250,.07), transparent 26%),' +
            'radial-gradient(circle at 15% 88%, rgba(37,99,235,.05), transparent 28%)',
          backgroundAttachment: 'fixed',
        },
      },
    },
    Card: {
      defaultProps: {
        shadow: 'md',
        radius: 'lg',
        withBorder: true,
      },
      styles: {
        root: {
          backgroundColor: 'var(--app-surface)',
          borderColor: 'var(--app-border)',
          color: 'var(--app-text)',
        },
      },
    },
    Paper: {
      styles: {
        root: {
          backgroundColor: 'var(--app-surface)',
          borderColor: 'var(--app-border)',
          color: 'var(--app-text)',
        },
      },
    },
    Button: {
      defaultProps: {
        radius: 'sm',
      },
    },
    Badge: {
      styles: {
        root: {
          textTransform: 'none',
        },
      },
    },
    Table: {
      styles: {
        th: {
          color: 'var(--app-muted)',
          fontWeight: 700,
          backgroundColor: 'var(--app-surface-2)',
        },
      },
    },
  },
}
