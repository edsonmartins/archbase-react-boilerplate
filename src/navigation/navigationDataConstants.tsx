/**
 * BlueVix Admin - Constantes de rotas de navegação
 *
 * Define todas as rotas usadas no sistema.
 * Mantenha organizado por módulo/feature.
 */

// ============================================
// Core Routes
// ============================================
export const HOME_ROUTE = '/dashboard'
export const LOGIN_ROUTE = '/login'

// ============================================
// Alunos Routes
// ============================================
export const ALUNOS_ROUTE = '/alunos'
export const ALUNO_NOVO_ROUTE = '/alunos/novo'
export const ALUNO_EDITAR_ROUTE = '/alunos/:id/editar'
export const ALUNO_FICHA_ROUTE = '/alunos/:id'

// ============================================
// Alertas Routes
// ============================================
export const ALERTAS_ROUTE = '/alertas'

// ============================================
// Treinos Routes
// ============================================
export const TREINOS_ROUTE = '/treinos'
export const TREINO_NOVO_ROUTE = '/treinos/novo'
export const TREINO_EDITAR_ROUTE = '/treinos/:id/editar'
export const TREINO_FICHA_ROUTE = '/treinos/:id'
export const EXERCICIOS_ROUTE = '/exercicios'
export const EXERCICIO_NOVO_ROUTE = '/exercicios/novo'
export const EXERCICIO_EDITAR_ROUTE = '/exercicios/:id/editar'
export const EXERCICIO_FICHA_ROUTE = '/exercicios/:id'

// ============================================
// Gamificação Routes
// ============================================
export const DESAFIOS_ROUTE = '/desafios'
export const DESAFIO_NOVO_ROUTE = '/desafios/novo'
export const DESAFIO_EDITAR_ROUTE = '/desafios/:id/editar'

// ============================================
// IA Admin Routes
// ============================================
export const IA_ROUTE = '/ia'
export const IA_AGENTES_ROUTE = '/ia/agentes'
export const IA_PROTOCOLOS_ROUTE = '/ia/protocolos'
export const IA_FRASES_ROUTE = '/ia/frases'
export const IA_GUARDRAILS_ROUTE = '/ia/guardrails'
export const IA_CONHECIMENTO_ROUTE = '/ia/conhecimento'
export const IA_PROGRESSAO_ROUTE = '/ia/progressao'
export const IA_CHECKLIST_ROUTE = '/ia/checklist'
export const IA_LOGS_ROUTE = '/ia/logs'
export const IA_CONVERSAS_ROUTE = '/ia/conversas'

// ============================================
// Relatórios e Configurações
// ============================================
export const RELATORIOS_ROUTE = '/relatorios'
export const CONFIG_ROUTE = '/config'

// ============================================
// Financeiro Routes
// ============================================
export const FINANCEIRO_ROUTE = '/financeiro'
export const FINANCEIRO_DASHBOARD_ROUTE = '/financeiro/dashboard'
export const FINANCEIRO_PLANOS_ROUTE = '/financeiro/planos'
export const FINANCEIRO_ASSINATURAS_ROUTE = '/financeiro/assinaturas'
export const FINANCEIRO_FATURAS_ROUTE = '/financeiro/faturas'
export const FINANCEIRO_PAGAMENTOS_ROUTE = '/financeiro/pagamentos'
export const FINANCEIRO_CONTRATOS_ROUTE = '/financeiro/contratos'
export const FINANCEIRO_GATEWAYS_ROUTE = '/financeiro/gateways'

// ============================================
// Security Routes (Archbase padrão)
// ============================================
export const SEGURANCA_ROUTE = '/seguranca'
export const USUARIOS_ROUTE = '/seguranca/usuarios'
export const PERFIS_ROUTE = '/seguranca/perfis'
export const GRUPOS_ROUTE = '/seguranca/grupos'
export const RECURSOS_ROUTE = '/seguranca/recursos'
export const API_TOKENS_ROUTE = '/seguranca/api-tokens'
