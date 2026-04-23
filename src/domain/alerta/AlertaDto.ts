/**
 * AlertaDto - DTO para Alertas do Sistema Sentinela
 */
export class AlertaDto {
  id: string
  code?: string
  version?: number
  createEntityDate?: string
  updateEntityDate?: string
  tenantId?: string

  // Relacionamento
  alunoId: string
  alunoNome?: string
  alunoEmail?: string

  // Dados do alerta
  tipo: AlertaTipo
  titulo: string
  descricao?: string
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA'
  status: 'PENDENTE' | 'EM_ANALISE' | 'RESOLVIDO' | 'IGNORADO'

  // Datas
  dataGeracao: string
  dataResolucao?: string
  resolvidoPor?: string

  // Notas
  notas?: string

  // Metadados
  dadosAdicionais?: Record<string, unknown>

  // Flag para novo registro
  isNew: boolean

  constructor(data?: Partial<AlertaDto>) {
    this.id = data?.id || ''
    this.code = data?.code
    this.version = data?.version
    this.createEntityDate = data?.createEntityDate
    this.updateEntityDate = data?.updateEntityDate
    this.tenantId = data?.tenantId

    this.alunoId = data?.alunoId || ''
    this.alunoNome = data?.alunoNome
    this.alunoEmail = data?.alunoEmail

    this.tipo = data?.tipo || 'INATIVIDADE_3_DIAS'
    this.titulo = data?.titulo || ''
    this.descricao = data?.descricao
    this.prioridade = data?.prioridade || 'MEDIA'
    this.status = data?.status || 'PENDENTE'

    this.dataGeracao = data?.dataGeracao || new Date().toISOString()
    this.dataResolucao = data?.dataResolucao
    this.resolvidoPor = data?.resolvidoPor

    this.notas = data?.notas
    this.dadosAdicionais = data?.dadosAdicionais

    this.isNew = !data?.id
  }
}

/**
 * Tipos de alerta do sistema
 */
export type AlertaTipo =
  | 'INATIVIDADE_3_DIAS'
  | 'INATIVIDADE_7_DIAS'
  | 'HUMOR_BAIXO_CONSECUTIVO'
  | 'STREAK_PERDIDO'
  | 'PLANO_EXPIRANDO'
  | 'PLANO_EXPIRADO'
  | 'CONVERSA_FLAGUEADA'
  | 'GUARDRAIL_VIOLADO'
  | 'OBJETIVO_NAO_ATINGIDO'
  | 'PADRAO_PREOCUPANTE'
