/**
 * AgenteIADto - DTO para Agentes de IA
 */
export class AgenteIADto {
  id: string
  code?: string
  version?: number
  createEntityDate?: string
  updateEntityDate?: string

  // Dados do agente
  tipo: TipoAgenteIA
  nome: string
  descricao?: string
  personalidade?: string

  // Configuração LLM
  modelo: string
  temperatura: number
  maxTokens: number

  // Limitações
  limitacoes?: string
  guardrailsAtivos?: string[]

  // Status
  ativo: boolean

  // Métricas
  totalInteracoes?: number
  mediaLatenciaMs?: number
  taxaSucesso?: number

  isNew: boolean

  constructor(data?: Partial<AgenteIADto>) {
    this.id = data?.id || ''
    this.code = data?.code
    this.version = data?.version
    this.createEntityDate = data?.createEntityDate
    this.updateEntityDate = data?.updateEntityDate

    this.tipo = data?.tipo || 'ORQUESTRADOR'
    this.nome = data?.nome || ''
    this.descricao = data?.descricao
    this.personalidade = data?.personalidade

    this.modelo = data?.modelo || 'deepseek/deepseek-chat'
    this.temperatura = data?.temperatura ?? 0.3
    this.maxTokens = data?.maxTokens || 2048

    this.limitacoes = data?.limitacoes
    this.guardrailsAtivos = data?.guardrailsAtivos || []

    this.ativo = data?.ativo ?? true

    this.totalInteracoes = data?.totalInteracoes
    this.mediaLatenciaMs = data?.mediaLatenciaMs
    this.taxaSucesso = data?.taxaSucesso

    this.isNew = !data?.id
  }
}

export type TipoAgenteIA =
  | 'ORQUESTRADOR'
  | 'PRESCRITOR'
  | 'MOTIVADOR'
  | 'SUPORTE_EMOCIONAL'
  | 'SENTINELA'
  | 'ANALISTA'

/**
 * ProtocoloDto - DTO para Protocolos Emocionais
 */
export class ProtocoloDto {
  id: string
  code?: string
  version?: number
  createEntityDate?: string
  updateEntityDate?: string

  // Dados do protocolo
  tipo: TipoProtocolo
  nome: string
  descricao?: string

  // Gatilhos
  gatilhos: string[]
  condicoesAtivacao?: string

  // Ações
  acoesAutomaticas: string[]
  mensagemPadrao?: string
  escalationRules?: string

  // Status
  ativo: boolean
  prioridade: number

  isNew: boolean

  constructor(data?: Partial<ProtocoloDto>) {
    this.id = data?.id || ''
    this.code = data?.code
    this.version = data?.version
    this.createEntityDate = data?.createEntityDate
    this.updateEntityDate = data?.updateEntityDate

    this.tipo = data?.tipo || 'CRISE'
    this.nome = data?.nome || ''
    this.descricao = data?.descricao

    this.gatilhos = data?.gatilhos || []
    this.condicoesAtivacao = data?.condicoesAtivacao

    this.acoesAutomaticas = data?.acoesAutomaticas || []
    this.mensagemPadrao = data?.mensagemPadrao
    this.escalationRules = data?.escalationRules

    this.ativo = data?.ativo ?? true
    this.prioridade = data?.prioridade || 0

    this.isNew = !data?.id
  }
}

export type TipoProtocolo =
  | 'CRISE'
  | 'RECAIDA'
  | 'EXCESSO_TREINO'
  | 'BAIXA_ENERGIA'
  | 'ANSIEDADE'
  | 'DESMOTIVACAO'

/**
 * FraseDto - DTO para Frases BlueVix
 */
export class FraseDto {
  id: string
  code?: string
  version?: number
  createEntityDate?: string
  updateEntityDate?: string

  // Dados da frase
  categoria: CategoriaFrase
  texto: string
  contexto?: string

  // Filtros
  faseCiclo?: string
  tipoTreino?: string
  estadoEmocional?: string

  // Status
  ativo: boolean

  isNew: boolean

  constructor(data?: Partial<FraseDto>) {
    this.id = data?.id || ''
    this.code = data?.code
    this.version = data?.version
    this.createEntityDate = data?.createEntityDate
    this.updateEntityDate = data?.updateEntityDate

    this.categoria = data?.categoria || 'MOTIVACIONAL'
    this.texto = data?.texto || ''
    this.contexto = data?.contexto

    this.faseCiclo = data?.faseCiclo
    this.tipoTreino = data?.tipoTreino
    this.estadoEmocional = data?.estadoEmocional

    this.ativo = data?.ativo ?? true

    this.isNew = !data?.id
  }
}

export type CategoriaFrase =
  | 'MOTIVACIONAL'
  | 'ACOLHIMENTO'
  | 'CELEBRACAO'
  | 'INCENTIVO'
  | 'REFLEXAO'
  | 'DESCANSO'

/**
 * GuardrailDto - DTO para Guardrails de Segurança
 */
export class GuardrailDto {
  id: string
  code?: string
  version?: number
  createEntityDate?: string
  updateEntityDate?: string

  // Dados do guardrail
  tipo: TipoGuardrail
  nome: string
  descricao?: string

  // Regras
  palavrasProibidas?: string[]
  limitesResposta?: Record<string, number>
  escalationTriggers?: string[]

  // Status
  ativo: boolean
  prioridade: number

  // Métricas
  totalViolacoes?: number

  isNew: boolean

  constructor(data?: Partial<GuardrailDto>) {
    this.id = data?.id || ''
    this.code = data?.code
    this.version = data?.version
    this.createEntityDate = data?.createEntityDate
    this.updateEntityDate = data?.updateEntityDate

    this.tipo = data?.tipo || 'CONTEUDO'
    this.nome = data?.nome || ''
    this.descricao = data?.descricao

    this.palavrasProibidas = data?.palavrasProibidas || []
    this.limitesResposta = data?.limitesResposta
    this.escalationTriggers = data?.escalationTriggers || []

    this.ativo = data?.ativo ?? true
    this.prioridade = data?.prioridade || 0

    this.totalViolacoes = data?.totalViolacoes

    this.isNew = !data?.id
  }
}

export type TipoGuardrail =
  | 'CONTEUDO'
  | 'COMPORTAMENTO'
  | 'LIMITE_TOKENS'
  | 'ESCALATION'
  | 'PRIVACIDADE'

/**
 * LogIADto - DTO para Logs de IA
 */
export class LogIADto {
  id: string
  createEntityDate?: string

  // Contexto
  agenteId?: string
  agenteNome?: string
  alunoId?: string
  alunoNome?: string
  conversaId?: string

  // Dados do log
  tipo: TipoLogIA
  mensagem: string
  detalhes?: Record<string, unknown>

  // Métricas
  tokensInput?: number
  tokensOutput?: number
  latenciaMs?: number

  // Status
  sucesso: boolean
  erro?: string

  constructor(data?: Partial<LogIADto>) {
    this.id = data?.id || ''
    this.createEntityDate = data?.createEntityDate

    this.agenteId = data?.agenteId
    this.agenteNome = data?.agenteNome
    this.alunoId = data?.alunoId
    this.alunoNome = data?.alunoNome
    this.conversaId = data?.conversaId

    this.tipo = data?.tipo || 'INFO'
    this.mensagem = data?.mensagem || ''
    this.detalhes = data?.detalhes

    this.tokensInput = data?.tokensInput
    this.tokensOutput = data?.tokensOutput
    this.latenciaMs = data?.latenciaMs

    this.sucesso = data?.sucesso ?? true
    this.erro = data?.erro
  }
}

export type TipoLogIA =
  | 'INFO'
  | 'DEBUG'
  | 'WARNING'
  | 'ERROR'
  | 'TOOL_CALL'
  | 'TOOL_RESULT'
  | 'GUARDRAIL_VIOLACAO'
  | 'PROTOCOLO_ATIVADO'

/**
 * ConversaAdminDto - DTO para visualização admin de conversas
 */
export class ConversaAdminDto {
  id: string
  alunoId: string
  alunoNome?: string
  alunoEmail?: string

  // Metadados
  dataInicio: string
  dataUltimaMensagem?: string
  totalMensagens: number

  // Status
  status: 'ATIVA' | 'FECHADA' | 'FLAGUEADA'
  motivoFlag?: string
  flagueadaPor?: string

  // Análise
  sentimentoGeral?: 'POSITIVO' | 'NEUTRO' | 'NEGATIVO'
  topicos?: string[]

  constructor(data?: Partial<ConversaAdminDto>) {
    this.id = data?.id || ''
    this.alunoId = data?.alunoId || ''
    this.alunoNome = data?.alunoNome
    this.alunoEmail = data?.alunoEmail

    this.dataInicio = data?.dataInicio || ''
    this.dataUltimaMensagem = data?.dataUltimaMensagem
    this.totalMensagens = data?.totalMensagens || 0

    this.status = data?.status || 'ATIVA'
    this.motivoFlag = data?.motivoFlag
    this.flagueadaPor = data?.flagueadaPor

    this.sentimentoGeral = data?.sentimentoGeral
    this.topicos = data?.topicos || []
  }
}
