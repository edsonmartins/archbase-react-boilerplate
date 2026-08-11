import { MantineThemeOverride } from '@mantine/core'
import { appBlue, appGreen, appGray, AppTokens } from './palette'

const T = AppTokens.light

/**
 * Tema claro — mesma linguagem visual do Gestor-RQ e do VendaX Promoter, com o
 * matiz no azul: primária como cor de marca, superfícies levemente tingidas,
 * cantos de 16px e sombra difusa na cor da marca.
 *
 * A sidebar e os destaques do `ArchbaseAdminMainLayout` derivam da cor primária
 * do tema, então trocar a paleta em `palette.ts` reveste o layout inteiro.
 */
export const AppThemeLight: MantineThemeOverride = {
  primaryColor: 'appBlue',
  primaryShade: 6,
  colors: {
    appBlue,
    appGreen,
    appGray,
  },
  // `lg` = 16px, o raio padrão da linguagem visual.
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
    xs: '0 4px 14px rgba(23,37,84,.04)',
    sm: '0 6px 20px rgba(23,37,84,.06)',
    md: T.shadow,
    lg: '0 14px 40px rgba(23,37,84,.10)',
    xl: '0 20px 56px rgba(23,37,84,.12)',
  },
  // Os overrides abaixo pintam por CSS var (--app-*), não pelo token literal do
  // esquema. O valor literal congela a cor do tema vigente no momento em que o
  // componente renderiza: ao alternar o tema na tela, tudo que não re-renderiza
  // (as views em cache do keep-alive, por exemplo) fica com as cores do tema
  // anterior — Paper branco no escuro. A var é resolvida na pintura e segue o
  // html[data-mantine-color-scheme] sozinha. As variáveis vivem em
  // src/styles/index.css, definidas para os dois esquemas.
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
        // O AppShell pinta a área de conteúdo com um cinza próprio, que cobria o
        // fundo definido no body. Os dois halos precisam vir daqui; 'fixed'
        // impede que deslizem com o scroll.
        main: {
          backgroundColor: 'var(--app-bg)',
          backgroundImage:
            'radial-gradient(circle at 85% 8%, rgba(96,165,250,.10), transparent 26%),' +
            'radial-gradient(circle at 15% 88%, rgba(37,99,235,.06), transparent 28%)',
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

/**
 * Cores nomeadas para uso fora do tema — gráficos, badges de status, textos em
 * SVG. Alinhadas à paleta azul: `primary` e `info` vêm da própria escala, e
 * `accent`/`success` do verde de apoio.
 *
 * Preferir os tokens do tema (`theme.colors.appBlue[n]`) ou as CSS vars
 * (`var(--app-*)`) quando houver escolha: estes valores são literais e não
 * acompanham a troca de esquema.
 */
export const AppColors = {
  primary: '#1d4ed8',
  accent: '#12b886',
  blueAccent: '#60a5fa',
  backgroundDark: '#0f1b2e',
  surface: '#17253c',
  surfaceDark: '#0c1524',
  backgroundLight: '#ffffff',
  success: '#12b886',
  error: '#E53E3E',
  warning: '#FF9500',
  info: '#3b82f6',
  textPrimary: '#0d1420',
  textSecondary: '#5f728c',
  gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
} as const

/**
 * Cores por status.
 */
export const StatusColors = {
  ativo: AppColors.success,
  inativo: AppColors.textSecondary,
  pendente: AppColors.warning,
  concluido: AppColors.accent,
  cancelado: AppColors.error,
  em_andamento: '#38d9a9',
  agendado: AppColors.info,
  atrasado: AppColors.error,
  bloqueado: '#991b1b',
} as const

/**
 * Cores por severidade.
 */
export const SeverityColors = {
  baixa: AppColors.accent,
  media: AppColors.warning,
  alta: AppColors.error,
  critica: '#991b1b',
} as const
