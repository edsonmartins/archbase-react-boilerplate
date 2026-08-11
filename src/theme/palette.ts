import { MantineColorsTuple } from '@mantine/core'

/**
 * Paleta do boilerplate — mesma linguagem visual do Gestor-RQ (`gestor-rq-admin`)
 * e do VendaX Promoter, com o matiz no azul.
 *
 * A estrutura é a que esses apps já usam, e é o que faz os três se lerem como a
 * mesma família sem se confundirem: escala de 10 tons, **tom 6 é a primária**
 * (o `filled` do Mantine), tom 4 é o realce claro, tokens separados de superfície
 * para claro e escuro, e gradientes próprios para sidebar, marca e fundo.
 *
 * Trocar o produto de cor é trocar esta escala e os tokens abaixo — as views não
 * precisam saber de nada, porque referenciam `appBlue` e `AppTokens`, nunca um
 * hexadecimal solto.
 */
export const appBlue: MantineColorsTuple = [
  '#eff6ff',
  '#dbeafe',
  '#bfdbfe',
  '#93c5fd',
  '#60a5fa', // realce claro
  '#3b82f6',
  '#1d4ed8', // ← primária (filled)
  '#1e40af',
  '#1e3a8a',
  '#172554',
]

/**
 * Verde de apoio — para `success` e realces que não são a primária.
 *
 * No Gestor-RQ o papel é invertido (primária verde, apoio azul). Manter um apoio
 * de matiz distante evita que estado de sucesso e ação primária se confundam,
 * que é o risco de usar dois tons do mesmo azul.
 */
export const appGreen: MantineColorsTuple = [
  '#e6fcf5',
  '#c3fae8',
  '#96f2d7',
  '#63e6be',
  '#38d9a9',
  '#20c997',
  '#12b886',
  '#0ca678',
  '#099268',
  '#087f5b',
]

/** Neutros tingidos de azul: os cinzas puxam para o frio, não para o neutro puro. */
export const appGray: MantineColorsTuple = [
  '#f7f9fc',
  '#eef3f9',
  '#e2eaf4',
  '#c7d5e8',
  '#9dafc7',
  '#667994',
  '#4a5a72',
  '#2f3c4e',
  '#1b2534',
  '#0d1420',
]

/** Tokens literais, para uso em CSS e em estilos inline. */
export const AppTokens = {
  blue950: '#172554',
  blue900: '#1e3a8a',
  blue800: '#1e40af',
  blue700: '#1d4ed8',
  blue600: '#2563eb',
  blue500: '#3b82f6',
  blue400: '#60a5fa',
  sky: '#93c5fd',

  light: {
    bg: '#f4f7fb',
    surface: '#ffffff',
    surface2: '#f8fafd',
    surface3: '#eaf1f9',
    text: '#0d1420',
    muted: '#5f728c',
    border: '#dbe6f2',
    shadow: '0 10px 30px rgba(23,37,84,.08)',
  },
  dark: {
    bg: '#070c16',
    surface: '#0c1524',
    surface2: '#0f1b2e',
    surface3: '#17253c',
    text: '#e9f1fb',
    muted: '#93a7c4',
    border: '#1e3252',
    shadow: '0 12px 36px rgba(0,0,0,.28)',
  },

  /**
   * Ícones do menu lateral: azul acinzentado, não a primária. O azul vivo sobre o
   * fundo escuro fica neon e compete com o item ativo; este tom quebra o bloco de
   * branco sem chamar atenção. O rótulo segue branco, então a hierarquia
   * texto > ícone se mantém.
   */
  sidebarIcon: '#93a7c4',

  /**
   * Ícones do menu lateral contraído. O tom acinzentado acima só faz sentido
   * acompanhado do rótulo: sem ele o ícone fica sozinho na pílula e o cinza lê
   * como desabilitado. Contraído não há texto para competir, então o ícone assume
   * o branco da pele escura e vira o único portador da hierarquia.
   */
  sidebarIconCollapsed: '#e9f1fb',

  /** Gradiente da sidebar. */
  sidebarGradient: 'linear-gradient(180deg, rgba(23,37,84,.98), rgba(30,64,175,.97))',

  /** Fundo do item de menu ativo. */
  sidebarItemActive: 'linear-gradient(90deg, rgba(96,165,250,.82), rgba(37,99,235,.66))',

  /**
   * Fundo da área de conteúdo: dois halos radiais sobre a cor base. Multi-camada
   * na shorthand `background` (gradientes primeiro, cor por último). Passado
   * direto na prop `mainBackground` do layout.
   *
   * A prop é um valor único, não um par claro/escuro — quem escolhe entre as duas
   * variantes é o `colorScheme` no App.
   */
  mainBackground:
    'radial-gradient(circle at 85% 8%, rgba(96,165,250,.10), transparent 26%),' +
    'radial-gradient(circle at 15% 88%, rgba(37,99,235,.06), transparent 28%),' +
    '#f4f7fb',
  mainBackgroundDark:
    'radial-gradient(circle at 85% 8%, rgba(96,165,250,.07), transparent 26%),' +
    'radial-gradient(circle at 15% 88%, rgba(37,99,235,.05), transparent 28%),' +
    '#070c16',

  /**
   * Cores do tab strip (`ArchbaseAdminTabContainer`).
   * A aba ativa fica na cor da superfície do conteúdo — mantendo a leitura de
   * "a aba ativa é a folha aberta embaixo" — e ganha um traço da primária no topo.
   * A faixa usa `surface3` para separar do conteúdo sem virar um bloco.
   */
  tabs: {
    barBackground: '#eaf1f9',
    tabBackground: '#f8fafd',
    tabActiveBackground: '#ffffff',
    titleColor: '#5f728c',
    titleActiveColor: '#1d4ed8',
    activeAccentColor: '#1d4ed8',
    dividerColor: '#c7d5e8',
    bottomBarBackground: '#ffffff',
  },
  tabsDark: {
    barBackground: '#0f1b2e',
    tabBackground: '#0c1524',
    tabActiveBackground: '#17253c',
    titleColor: '#93a7c4',
    titleActiveColor: '#93c5fd',
    activeAccentColor: '#60a5fa',
    dividerColor: '#1e3252',
    bottomBarBackground: '#17253c',
  },

  /** Gradiente do botão primário. */
  primaryGradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
  /** Gradiente da marca (logo, tela de login). */
  brandGradient: 'linear-gradient(135deg, #60a5fa, #2563eb)',
} as const
