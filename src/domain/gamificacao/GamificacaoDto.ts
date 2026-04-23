/**
 * GamificacaoResumoDto - Resumo de gamificação do aluno
 */
export class GamificacaoResumoDto {
  alunoId: string

  // XP
  xpTotal: number
  xpNivelAtual: number
  xpProximoNivel: number
  nivel: number

  // Streak
  streakAtual: number
  streakMax: number
  ultimaAtividade?: string

  // Badges
  badgesTotal: number
  badgesRecentes?: BadgeDto[]

  // Desafios
  desafiosAtivos: number
  desafiosConcluidos: number

  constructor(data?: Partial<GamificacaoResumoDto>) {
    this.alunoId = data?.alunoId || ''

    this.xpTotal = data?.xpTotal || 0
    this.xpNivelAtual = data?.xpNivelAtual || 0
    this.xpProximoNivel = data?.xpProximoNivel || 100
    this.nivel = data?.nivel || 1

    this.streakAtual = data?.streakAtual || 0
    this.streakMax = data?.streakMax || 0
    this.ultimaAtividade = data?.ultimaAtividade

    this.badgesTotal = data?.badgesTotal || 0
    this.badgesRecentes = data?.badgesRecentes || []

    this.desafiosAtivos = data?.desafiosAtivos || 0
    this.desafiosConcluidos = data?.desafiosConcluidos || 0
  }
}

/**
 * BadgeDto - DTO para Badges
 */
export class BadgeDto {
  id: string
  codigo: string
  nome: string
  descricao?: string
  icone?: string
  categoria: string
  raridade: 'COMUM' | 'RARO' | 'EPICO' | 'LENDARIO'
  xpRecompensa: number
  dataConquista?: string

  isNew: boolean

  constructor(data?: Partial<BadgeDto>) {
    this.id = data?.id || ''
    this.codigo = data?.codigo || ''
    this.nome = data?.nome || ''
    this.descricao = data?.descricao
    this.icone = data?.icone
    this.categoria = data?.categoria || ''
    this.raridade = data?.raridade || 'COMUM'
    this.xpRecompensa = data?.xpRecompensa || 0
    this.dataConquista = data?.dataConquista

    this.isNew = !data?.id
  }
}

// Tipos para categorias de desafio
export type CategoriaDesafio =
  | 'TREINOS_CONSECUTIVOS'
  | 'MINUTOS_EXERCICIO'
  | 'NIVEL_EMOCIONAL'
  | 'HIDRATACAO'
  | 'SONO_QUALIDADE'
  | 'PASSOS_DIARIOS'
  | 'MEDITACAO'
  | 'DIARIO_HUMOR'
  | 'SOCIAL_COMPARTILHAR'
  | 'DESAFIO_VIX'
  | 'PERSONALIZADO'

// Tipos para medicao
export type TipoMedicao = 'EXTERNO' | 'APP' | 'MISTO'

// Tipos para nivel
export type NivelDesafio = 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO' | 'TODOS'

/**
 * DesafioMensalDto - DTO para Desafios Mensais
 */
export class DesafioMensalDto {
  id: string
  code?: string
  version?: number
  createEntityDate?: string
  updateEntityDate?: string

  // Dados do desafio
  titulo: string
  descricao?: string
  descricaoAluno?: string // Descricao visivel para o aluno (max 150 chars)
  tipo: string
  categoria?: CategoriaDesafio
  tipoMedicao?: TipoMedicao
  nivel?: NivelDesafio

  // Meta
  meta: number
  unidadeMeta?: string // Ex: "treinos", "minutos", "dias"

  // Recompensas
  xpRecompensa: number
  badgeRecompensa?: string
  badgeEmoji?: string // Emoji do badge
  badgeNome?: string // Nome do badge

  // Mensagens da Vix
  mensagemVixSortear?: string // Mensagem quando sortear (max 200 chars)
  mensagemVixConcluir?: string // Mensagem quando concluir (max 200 chars)

  // Periodo
  dataInicio: string
  dataFim: string

  // Status
  ativo: boolean

  isNew: boolean

  constructor(data?: Partial<DesafioMensalDto>) {
    this.id = data?.id || ''
    this.code = data?.code
    this.version = data?.version
    this.createEntityDate = data?.createEntityDate
    this.updateEntityDate = data?.updateEntityDate

    this.titulo = data?.titulo || ''
    this.descricao = data?.descricao
    this.descricaoAluno = data?.descricaoAluno
    this.tipo = data?.tipo || ''
    this.categoria = data?.categoria
    this.tipoMedicao = data?.tipoMedicao || 'APP'
    this.nivel = data?.nivel || 'TODOS'

    this.meta = data?.meta || 0
    this.unidadeMeta = data?.unidadeMeta

    this.xpRecompensa = data?.xpRecompensa || 0
    this.badgeRecompensa = data?.badgeRecompensa
    this.badgeEmoji = data?.badgeEmoji
    this.badgeNome = data?.badgeNome

    this.mensagemVixSortear = data?.mensagemVixSortear
    this.mensagemVixConcluir = data?.mensagemVixConcluir

    this.dataInicio = data?.dataInicio || ''
    this.dataFim = data?.dataFim || ''

    this.ativo = data?.ativo ?? true

    this.isNew = !data?.id
  }

  static newInstance(): DesafioMensalDto {
    const hoje = new Date()
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

    return new DesafioMensalDto({
      titulo: '',
      categoria: 'TREINOS_CONSECUTIVOS',
      tipoMedicao: 'APP',
      nivel: 'TODOS',
      meta: 0,
      xpRecompensa: 100,
      dataInicio: hoje.toISOString().split('T')[0],
      dataFim: fimMes.toISOString().split('T')[0],
      ativo: true,
    })
  }
}

/**
 * StreakDto - DTO para Streak
 */
export class StreakDto {
  id: string
  alunoId: string
  streakAtual: number
  streakMax: number
  ultimaAtividade?: string
  ativo: boolean
  dataInicioStreak?: string

  isNew: boolean

  constructor(data?: Partial<StreakDto>) {
    this.id = data?.id || ''
    this.alunoId = data?.alunoId || ''
    this.streakAtual = data?.streakAtual || 0
    this.streakMax = data?.streakMax || 0
    this.ultimaAtividade = data?.ultimaAtividade
    this.ativo = data?.ativo ?? true
    this.dataInicioStreak = data?.dataInicioStreak

    this.isNew = !data?.id
  }
}
