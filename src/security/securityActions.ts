/**
 * Definição de ações de segurança customizadas do sistema.
 * Cada ação possui um nome (usado para verificar permissão) e uma descrição (exibida na UI de administração).
 *
 * Padrão de nomenclatura:
 * - Ações CRUD básicas: create, view, edit, delete, list (já providas pelo useArchbaseSecureForm)
 * - Ações de workflow: usar verbos no infinitivo (iniciar, concluir, aprovar)
 * - Ações específicas: descrever a operação de forma clara
 *
 * Exemplo de uso:
 * ```typescript
 * export const MY_MODULE_ACTIONS = {
 *   ITEM: {
 *     APROVAR: { name: 'aprovar', description: 'Aprovar Item' },
 *     CANCELAR: { name: 'cancelar', description: 'Cancelar Item' },
 *     EXPORTAR: { name: 'exportar', description: 'Exportar Relatório' },
 *   },
 * }
 * ```
 */

export interface SecurityAction {
  name: string
  description: string
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extrai todas as ações de um módulo de segurança como array flat
 */
export function getActionsForResource(
  resourceActions: Record<string, SecurityAction>
): SecurityAction[] {
  return Object.values(resourceActions)
}

/**
 * Converte ações em array de strings (nomes)
 */
export function actionsToArray(
  resourceActions: Record<string, SecurityAction>
): string[] {
  return Object.values(resourceActions).map(a => a.name)
}

// ============================================================================
// EXEMPLO - Remova e substitua pelos módulos do seu projeto
// ============================================================================

export const SAMPLE_ACTIONS = {
  ITEM: {
    APROVAR: { name: 'aprovar', description: 'Aprovar Item' },
    REPROVAR: { name: 'reprovar', description: 'Reprovar Item' },
    CANCELAR: { name: 'cancelar', description: 'Cancelar Item' },
    EXPORTAR: { name: 'exportar', description: 'Exportar Relatório' },
  },
}
