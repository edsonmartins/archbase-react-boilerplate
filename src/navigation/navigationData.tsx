/**
 * Dados de navegação do aplicativo
 *
 * Define a estrutura de menus e navegação.
 * Usado pelo ArchbaseAdminMainLayout para renderizar sidebar e tabs.
 */

import { IconDashboard, IconShield, IconKey, IconUsers, IconUserCircle, IconFolder } from '@tabler/icons-react'

import { ArchbaseNavigationItem } from '@archbase/admin'
import { HomeView } from '@views/home/HomeView'
import { SecurityView } from '@archbase/security-ui'
import { ApiTokenView } from '@archbase/security-ui'

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
 * - icon: ícone do Tabler Icons
 * - link: rota de navegação
 * - component: componente a ser renderizado
 * - links: subitens do menu (para menus aninhados)
 * - requiredPermissions: permissões necessárias (opcional)
 */
export const navigationData: ArchbaseNavigationItem[] = [
  // ============================================
  // Home / Dashboard
  // ============================================
  {
    label: 'Home',
    icon: IconDashboard,
    link: HOME_ROUTE,
    component: HomeView,
  },

  // ============================================
  // Segurança
  // ============================================
  {
    label: 'Segurança',
    icon: IconShield,
    links: [
      {
        label: 'Usuários',
        icon: IconUsers,
        link: USUARIOS_ROUTE,
        component: SecurityView,
      },
      {
        label: 'Tokens de API',
        icon: IconKey,
        link: API_TOKENS_ROUTE,
        component: ApiTokenView,
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
