/**
 * BlueVix Admin - Dados de navegação
 *
 * Define a estrutura de menus e navegação do admin.
 */

import {
  IconDashboard,
  IconUsers,
  IconAlertTriangle,
  IconRun,
  IconBarbell,
  IconTarget,
  IconChartBar,
  IconSettings,
  IconShield,
  IconKey,
  IconRobot,
  IconBrain,
  IconHeart,
  IconMessageCircle,
  IconFileText,
  IconBook,
  IconShieldCheck,
  IconHistory,
  IconTrendingUp,
  IconCash,
  IconReceipt,
  IconCreditCard,
  IconFileDescription,
  IconWallet,
  IconReportMoney,
} from '@tabler/icons-react'

import { ArchbaseNavigationItem } from '@archbase/admin'
import { ArchbaseSecurityView } from '@archbase/security-ui'

// Views do BlueVix
import { DashboardView } from '../views/dashboard/DashboardView'
import { AlunosListView } from '../views/alunos/AlunosListView'
import { AlunoForm } from '../views/alunos/AlunoForm'
import { AlunoFichaView } from '../views/alunos/AlunoFichaView'
import { AlertasView } from '../views/alertas/AlertasView'
import { TreinosView } from '../views/treinos/TreinosView'
import { TreinoFichaView } from '../views/treinos/TreinoFichaView'
import { ExerciciosView } from '../views/exercicios/ExerciciosView'
import { ExercicioForm } from '../views/exercicios/ExercicioForm'
import { ExercicioFichaView } from '../views/exercicios/ExercicioFichaView'
import { TreinoForm } from '../views/treinos/TreinoForm'
import { DesafiosView } from '../views/desafios/DesafiosView'
import { DesafioForm } from '../views/desafios/DesafioForm'
import { RelatoriosView } from '../views/relatorios/RelatoriosView'
import { ConfigView } from '../views/config/ConfigView'

// Views de IA
import { IAAgentesView } from '../views/ia/IAAgentesView'
import { IAConversasView } from '../views/ia/IAConversasView'
import { IAConhecimentoView } from '../views/ia/IAConhecimentoView'
import { IALogsView } from '../views/ia/IALogsView'
import { IAFrasesView } from '../views/ia/IAFrasesView'
import { IAGuardrailsView } from '../views/ia/IAGuardrailsView'
import { IAProtocolosView } from '../views/ia/IAProtocolosView'
import { IAChecklistView } from '../views/ia/IAChecklistView'
import { IAProgressaoView } from '../views/ia/IAProgressaoView'

// Views de Financeiro
import {
  FinanceiroDashboardView,
  PlanosView,
  AssinaturasView,
  FaturasView,
  PagamentosView,
  ContratosView,
  GatewaysView,
} from '../views/financeiro'

// Rotas
import {
  HOME_ROUTE,
  ALUNOS_ROUTE,
  ALUNO_NOVO_ROUTE,
  ALUNO_EDITAR_ROUTE,
  ALUNO_FICHA_ROUTE,
  ALERTAS_ROUTE,
  TREINOS_ROUTE,
  TREINO_NOVO_ROUTE,
  TREINO_EDITAR_ROUTE,
  TREINO_FICHA_ROUTE,
  EXERCICIOS_ROUTE,
  EXERCICIO_NOVO_ROUTE,
  EXERCICIO_EDITAR_ROUTE,
  EXERCICIO_FICHA_ROUTE,
  DESAFIOS_ROUTE,
  DESAFIO_NOVO_ROUTE,
  DESAFIO_EDITAR_ROUTE,
  RELATORIOS_ROUTE,
  CONFIG_ROUTE,
  USUARIOS_ROUTE,
  API_TOKENS_ROUTE,
  IA_AGENTES_ROUTE,
  IA_PROTOCOLOS_ROUTE,
  IA_FRASES_ROUTE,
  IA_GUARDRAILS_ROUTE,
  IA_CONHECIMENTO_ROUTE,
  IA_PROGRESSAO_ROUTE,
  IA_LOGS_ROUTE,
  IA_CONVERSAS_ROUTE,
  FINANCEIRO_DASHBOARD_ROUTE,
  FINANCEIRO_PLANOS_ROUTE,
  FINANCEIRO_ASSINATURAS_ROUTE,
  FINANCEIRO_FATURAS_ROUTE,
  FINANCEIRO_PAGAMENTOS_ROUTE,
  FINANCEIRO_CONTRATOS_ROUTE,
  FINANCEIRO_GATEWAYS_ROUTE,
} from './navigationDataConstants'

/**
 * Estrutura de navegação do BlueVix Admin
 */
export const navigationData: ArchbaseNavigationItem[] = [
  // ============================================
  // Dashboard
  // ============================================
  {
    label: 'Dashboard',
    icon: <IconDashboard />,
    link: HOME_ROUTE,
    component: <DashboardView />,
    category: 'dashboard',
    color: '#1A5DAA',
    showInSidebar: true,
  },

  // ============================================
  // Gestão de Alunos
  // ============================================
  {
    label: 'Alunos',
    icon: <IconUsers />,
    link: ALUNOS_ROUTE,
    component: <AlunosListView />,
    category: 'alunas',
    color: '#1A5DAA',
    showInSidebar: true,
  },
  {
    label: 'Novo Aluno',
    icon: <IconUsers />,
    link: ALUNO_NOVO_ROUTE,
    component: <AlunoForm />,
    category: 'alunas',
    color: '#1A5DAA',
    showInSidebar: false,
  },
  {
    label: 'Editar Aluno',
    icon: <IconUsers />,
    link: ALUNO_EDITAR_ROUTE,
    component: <AlunoForm />,
    category: 'alunas',
    color: '#1A5DAA',
    showInSidebar: false,
  },
  {
    label: 'Ficha do Aluno',
    icon: <IconUsers />,
    link: ALUNO_FICHA_ROUTE,
    component: <AlunoFichaView />,
    category: 'alunas',
    color: '#1A5DAA',
    showInSidebar: false,
  },

  // ============================================
  // Alertas (Sentinela)
  // ============================================
  {
    label: 'Alertas',
    icon: <IconAlertTriangle />,
    link: ALERTAS_ROUTE,
    component: <AlertasView />,
    category: 'alertas',
    color: '#DC2626',
    showInSidebar: true,
  },

  // ============================================
  // Treinos & Exercícios
  // ============================================
  {
    label: 'Treinos',
    icon: <IconRun />,
    category: 'treinos',
    color: '#14A085',
    showInSidebar: true,
    links: [
      {
        label: 'Programas de Treino',
        icon: <IconRun />,
        link: TREINOS_ROUTE,
        component: <TreinosView />,
        category: 'treinos',
        color: '#14A085',
        showInSidebar: true,
      },
      {
        label: 'Novo Treino',
        icon: <IconRun />,
        link: TREINO_NOVO_ROUTE,
        component: <TreinoForm />,
        category: 'treinos',
        color: '#14A085',
        showInSidebar: false,
      },
      {
        label: 'Editar Treino',
        icon: <IconRun />,
        link: TREINO_EDITAR_ROUTE,
        component: <TreinoForm />,
        category: 'treinos',
        color: '#14A085',
        showInSidebar: false,
      },
      {
        label: 'Ficha do Treino',
        icon: <IconRun />,
        link: TREINO_FICHA_ROUTE,
        component: <TreinoFichaView />,
        category: 'treinos',
        color: '#14A085',
        showInSidebar: false,
      },
      {
        label: 'Exercícios',
        icon: <IconBarbell />,
        link: EXERCICIOS_ROUTE,
        component: <ExerciciosView />,
        category: 'treinos',
        color: '#14A085',
        showInSidebar: true,
      },
      {
        label: 'Novo Exercício',
        icon: <IconBarbell />,
        link: EXERCICIO_NOVO_ROUTE,
        component: <ExercicioForm />,
        category: 'treinos',
        color: '#14A085',
        showInSidebar: false,
      },
      {
        label: 'Editar Exercício',
        icon: <IconBarbell />,
        link: EXERCICIO_EDITAR_ROUTE,
        component: <ExercicioForm />,
        category: 'treinos',
        color: '#14A085',
        showInSidebar: false,
      },
      {
        label: 'Ficha do Exercício',
        icon: <IconBarbell />,
        link: EXERCICIO_FICHA_ROUTE,
        component: <ExercicioFichaView />,
        category: 'treinos',
        color: '#14A085',
        showInSidebar: false,
      },
    ],
  },

  // ============================================
  // Gamificação
  // ============================================
  {
    label: 'Desafios',
    icon: <IconTarget />,
    category: 'gamificacao',
    color: '#F59E0B',
    showInSidebar: true,
    links: [
      {
        label: 'Desafios Mensais',
        icon: <IconTarget />,
        link: DESAFIOS_ROUTE,
        component: <DesafiosView />,
        category: 'gamificacao',
        color: '#F59E0B',
        showInSidebar: true,
      },
      {
        label: 'Novo Desafio',
        icon: <IconTarget />,
        link: DESAFIO_NOVO_ROUTE,
        component: <DesafioForm />,
        category: 'gamificacao',
        color: '#F59E0B',
        showInSidebar: false,
      },
      {
        label: 'Editar Desafio',
        icon: <IconTarget />,
        link: DESAFIO_EDITAR_ROUTE,
        component: <DesafioForm />,
        category: 'gamificacao',
        color: '#F59E0B',
        showInSidebar: false,
      },
    ],
  },

  // ============================================
  // IA Admin
  // ============================================
  {
    label: 'IA Admin',
    icon: <IconBrain />,
    category: 'ia',
    color: '#7c3aed',
    showInSidebar: true,
    links: [
      {
        label: 'Agentes',
        icon: <IconRobot />,
        link: IA_AGENTES_ROUTE,
        component: <IAAgentesView />,
        category: 'ia',
        color: '#7c3aed',
        showInSidebar: true,
      },
      {
        label: 'Conversas',
        icon: <IconMessageCircle />,
        link: IA_CONVERSAS_ROUTE,
        component: <IAConversasView />,
        category: 'ia',
        color: '#7c3aed',
        showInSidebar: true,
      },
      {
        label: 'Protocolos',
        icon: <IconHeart />,
        link: IA_PROTOCOLOS_ROUTE,
        component: <IAProtocolosView />,
        category: 'ia',
        color: '#7c3aed',
        showInSidebar: true,
      },
      {
        label: 'Frases',
        icon: <IconFileText />,
        link: IA_FRASES_ROUTE,
        component: <IAFrasesView />,
        category: 'ia',
        color: '#7c3aed',
        showInSidebar: true,
      },
      {
        label: 'Guardrails',
        icon: <IconShieldCheck />,
        link: IA_GUARDRAILS_ROUTE,
        component: <IAGuardrailsView />,
        category: 'ia',
        color: '#7c3aed',
        showInSidebar: true,
      },
      {
        label: 'Base de Conhecimento',
        icon: <IconBook />,
        link: IA_CONHECIMENTO_ROUTE,
        component: <IAConhecimentoView />,
        category: 'ia',
        color: '#7c3aed',
        showInSidebar: true,
      },
      {
        label: 'Progressão',
        icon: <IconTrendingUp />,
        link: IA_PROGRESSAO_ROUTE,
        component: <IAProgressaoView />,
        category: 'ia',
        color: '#7c3aed',
        showInSidebar: true,
      },
      {
        label: 'Logs',
        icon: <IconHistory />,
        link: IA_LOGS_ROUTE,
        component: <IALogsView />,
        category: 'ia',
        color: '#7c3aed',
        showInSidebar: true,
      },
    ],
  },

  // ============================================
  // Financeiro
  // ============================================
  {
    label: 'Financeiro',
    icon: <IconCash />,
    category: 'financeiro',
    color: '#059669',
    showInSidebar: true,
    links: [
      {
        label: 'Dashboard',
        icon: <IconReportMoney />,
        link: FINANCEIRO_DASHBOARD_ROUTE,
        component: <FinanceiroDashboardView />,
        category: 'financeiro',
        color: '#059669',
        showInSidebar: true,
      },
      {
        label: 'Planos',
        icon: <IconWallet />,
        link: FINANCEIRO_PLANOS_ROUTE,
        component: <PlanosView />,
        category: 'financeiro',
        color: '#059669',
        showInSidebar: true,
      },
      {
        label: 'Assinaturas',
        icon: <IconReceipt />,
        link: FINANCEIRO_ASSINATURAS_ROUTE,
        component: <AssinaturasView />,
        category: 'financeiro',
        color: '#059669',
        showInSidebar: true,
      },
      {
        label: 'Faturas',
        icon: <IconFileDescription />,
        link: FINANCEIRO_FATURAS_ROUTE,
        component: <FaturasView />,
        category: 'financeiro',
        color: '#059669',
        showInSidebar: true,
      },
      {
        label: 'Pagamentos',
        icon: <IconCreditCard />,
        link: FINANCEIRO_PAGAMENTOS_ROUTE,
        component: <PagamentosView />,
        category: 'financeiro',
        color: '#059669',
        showInSidebar: true,
      },
      {
        label: 'Contratos',
        icon: <IconFileText />,
        link: FINANCEIRO_CONTRATOS_ROUTE,
        component: <ContratosView />,
        category: 'financeiro',
        color: '#059669',
        showInSidebar: true,
      },
      {
        label: 'Gateways',
        icon: <IconCreditCard />,
        link: FINANCEIRO_GATEWAYS_ROUTE,
        component: <GatewaysView />,
        category: 'financeiro',
        color: '#059669',
        showInSidebar: true,
      },
    ],
  },

  // ============================================
  // Relatórios
  // ============================================
  {
    label: 'Relatórios',
    icon: <IconChartBar />,
    link: RELATORIOS_ROUTE,
    component: <RelatoriosView />,
    category: 'relatorios',
    color: '#1A5DAA',
    showInSidebar: true,
  },

  // ============================================
  // Configurações
  // ============================================
  {
    label: 'Configurações',
    icon: <IconSettings />,
    link: CONFIG_ROUTE,
    component: <ConfigView />,
    category: 'configuracoes',
    color: '#64748B',
    showInSidebar: true,
  },

  // ============================================
  // Segurança (Archbase)
  // ============================================
  {
    label: 'Segurança',
    icon: <IconShield />,
    category: 'seguranca',
    color: '#14A085',
    showInSidebar: true,
    links: [
      {
        label: 'Usuários',
        icon: <IconUsers />,
        link: USUARIOS_ROUTE,
        component: <ArchbaseSecurityView />,
        category: 'seguranca',
        color: '#14A085',
        showInSidebar: true,
      },
      {
        label: 'Tokens de API',
        icon: <IconKey />,
        link: API_TOKENS_ROUTE,
        component: <ConfigView />,
        category: 'seguranca',
        color: '#14A085',
        showInSidebar: true,
      },
    ],
  },
]
