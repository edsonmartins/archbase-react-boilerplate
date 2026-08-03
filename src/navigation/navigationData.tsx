/**
 * Dados de navegação do aplicativo
 *
 * Define a estrutura de menus e navegação.
 * Usado pelo ArchbaseAdminMainLayout para renderizar sidebar e tabs.
 */

import { IconDashboard, IconShield, IconKey, IconUsers, IconUserCircle, IconFolder } from '@tabler/icons-react'

import { ArchbaseNavigationItem } from '@archbase/admin'
import { HomeView } from '@views/home/HomeView'
// Os nomes exportados pelo pacote são prefixados com `Archbase`. Importar sem o
// prefixo lança SyntaxError no CARREGAMENTO do módulo — antes de qualquer código
// rodar —, então o React nunca monta: a aplicação inteira fica em branco, com o
// #root vazio e NADA no console. É o pior modo de falhar possível para um
// boilerplate, porque quem clona não vê nem por onde começar a investigar.
import {
  ArchbaseSecurityView as SecurityView,
  ArchbaseApiTokenView as ApiTokenView,
} from '@archbase/security-ui'

import {
  HOME_ROUTE,
  SEGURANCA_ROUTE,
  USUARIOS_ROUTE,
  API_TOKENS_ROUTE,
} from './navigationDataConstants'

/**
 * Estrutura de navegação do aplicativo
 *
 * Cada item pode ter:
 * - label: texto exibido no menu
 * - icon: ELEMENTO do ícone — `<IconDashboard />`, não `IconDashboard`
 * - link: rota de navegação
 * - component: ELEMENTO a renderizar — `<HomeView />`, não `HomeView`
 * - showInSidebar: OBRIGATÓRIO. A sidebar filtra o item que não o tem
 * - links: subitens do menu (para menus aninhados)
 * - requiredPermissions: permissões necessárias (opcional)
 */
// Três detalhes que, juntos, deixavam a sidebar VAZIA:
//
//   showInSidebar   OBRIGATÓRIO — sem ele a sidebar filtra o item, sem erro
//   icon            ELEMENTO    — `<IconDashboard />`, não a referência
//   component       ELEMENTO    — `<HomeView />`, não a referência
//
// O primeiro escondia os outros dois: com a sidebar vazia nada era renderizado,
// então nada quebrava. Assim que os itens apareciam, o ícone do Tabler — um
// `forwardRef`, isto é um objeto `{$$typeof, render}` — quebrava com "Objects
// are not valid as a React child", e o componente passado como função não
// renderizava, deixando a aba abrir vazia.
export const navigationData: ArchbaseNavigationItem[] = [
  // ============================================
  // Home / Dashboard
  // ============================================
  {
    label: 'Home',
    showInSidebar: true,
    category: 'principal',
    color: undefined,
    icon: <IconDashboard />,
    link: HOME_ROUTE,
    component: <HomeView />,
  },

  // ============================================
  // Segurança
  // ============================================
  {
    label: 'Segurança',
    showInSidebar: true,
    category: 'principal',
    color: undefined,
    icon: <IconShield />,
    links: [
      {
        label: 'Usuários',
        showInSidebar: true,
        category: 'principal',
        color: undefined,
        icon: <IconUsers />,
        link: USUARIOS_ROUTE,
        component: <SecurityView />,
      },
      {
        label: 'Tokens de API',
        showInSidebar: true,
        category: 'principal',
        color: undefined,
        icon: <IconKey />,
        link: API_TOKENS_ROUTE,
        component: <ApiTokenView />,
      },
    ],
  },

  // ============================================
  // Adicione seus menus customizados abaixo
  // ============================================
  // Exemplo:
  // {
  //   label: 'Produtos',
  //   icon: IconPackage,
  //   link: PRODUCTS_ROUTE,
  //   component: ProductsView,
  // },
]
