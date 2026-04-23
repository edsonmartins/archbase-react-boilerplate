/**
 * TreinoDto - DTO para Treinos do BlueVix
 */

// Tipos para niveis de treino
export type NivelTreino = 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO'

// Tipos para as 6 fases do treino BlueVix
export type FaseTreino =
  | 'LIBERACAO_MIOFASCIAL'
  | 'MOBILIDADE_ARTICULAR'
  | 'CORE_QUADRIL'
  | 'FORCA_FUNCIONAL'
  | 'CARDIO_CONSCIENTE'
  | 'DESACELERACAO'

// Exercicio dentro de uma fase do treino
export interface ExercicioTreinoDto {
  id: string
  exercicioId: string
  exercicioNome?: string
  ordem: number
  series: number
  repeticoes: string // Ex: "12" ou "8-12"
  tempoDescanso?: number // em segundos
  observacao?: string
}

// Fase do treino
export interface FaseDto {
  tipo: FaseTreino
  nome: string
  cor: string
  duracaoMinutos?: number
  exercicios: ExercicioTreinoDto[]
}

export class TreinoDto {
  id: string
  code?: string
  version?: number
  createEntityDate?: string
  updateEntityDate?: string
  tenantId?: string

  // Dados do treino
  nome: string
  descricao?: string
  nivel: NivelTreino
  categoria: string
  semana?: number // Semana do programa (1-12)
  tipoTreino?: 'A' | 'B' | 'C' | 'DESCANSO'
  duracaoMinutos: number
  caloriasPrevistas?: number
  imagemUrl?: string

  // 6 Fases do treino BlueVix
  fases?: FaseDto[]

  // Configuracoes
  ativo: boolean
  ordenacao?: number

  // Metadados
  exerciciosCount?: number

  // Flag para novo registro
  isNew: boolean

  constructor(data?: Partial<TreinoDto>) {
    this.id = data?.id || ''
    this.code = data?.code
    this.version = data?.version
    this.createEntityDate = data?.createEntityDate
    this.updateEntityDate = data?.updateEntityDate
    this.tenantId = data?.tenantId

    this.nome = data?.nome || ''
    this.descricao = data?.descricao
    this.nivel = data?.nivel || 'INICIANTE'
    this.categoria = data?.categoria || ''
    this.semana = data?.semana
    this.tipoTreino = data?.tipoTreino
    this.duracaoMinutos = data?.duracaoMinutos || 0
    this.caloriasPrevistas = data?.caloriasPrevistas
    this.imagemUrl = data?.imagemUrl

    this.fases = data?.fases || TreinoDto.defaultFases()

    this.ativo = data?.ativo ?? true
    this.ordenacao = data?.ordenacao

    this.exerciciosCount = data?.exerciciosCount

    this.isNew = !data?.id
  }

  static defaultFases(): FaseDto[] {
    return [
      { tipo: 'LIBERACAO_MIOFASCIAL', nome: 'Liberacao Miofascial', cor: 'teal', exercicios: [] },
      { tipo: 'MOBILIDADE_ARTICULAR', nome: 'Mobilidade Articular', cor: 'blue', exercicios: [] },
      { tipo: 'CORE_QUADRIL', nome: 'Core + Quadril', cor: 'violet', exercicios: [] },
      { tipo: 'FORCA_FUNCIONAL', nome: 'Forca Funcional', cor: 'yellow', exercicios: [] },
      { tipo: 'CARDIO_CONSCIENTE', nome: 'Cardiovascular Consciente', cor: 'orange', exercicios: [] },
      { tipo: 'DESACELERACAO', nome: 'Desaceleracao', cor: 'teal', exercicios: [] },
    ]
  }

  static newInstance(): TreinoDto {
    return new TreinoDto({
      nome: '',
      categoria: '',
      nivel: 'INICIANTE',
      duracaoMinutos: 30,
      ativo: true,
    })
  }
}

/**
 * DTO para Sessão de Treino
 */
export class SessaoDto {
  id: string
  alunoId: string
  treinoId: string
  treinoNome?: string

  dataInicio: string
  dataFim?: string
  faseAtual: string
  status: 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA'

  duracaoSegundos?: number
  caloriasQueimadas?: number
  frequenciaCardiacaMedia?: number

  xpGanho?: number
  notaAluno?: number
  feedbackAluno?: string

  isNew: boolean

  constructor(data?: Partial<SessaoDto>) {
    this.id = data?.id || ''
    this.alunoId = data?.alunoId || ''
    this.treinoId = data?.treinoId || ''
    this.treinoNome = data?.treinoNome

    this.dataInicio = data?.dataInicio || new Date().toISOString()
    this.dataFim = data?.dataFim
    this.faseAtual = data?.faseAtual || 'AQUECIMENTO'
    this.status = data?.status || 'EM_ANDAMENTO'

    this.duracaoSegundos = data?.duracaoSegundos
    this.caloriasQueimadas = data?.caloriasQueimadas
    this.frequenciaCardiacaMedia = data?.frequenciaCardiacaMedia

    this.xpGanho = data?.xpGanho
    this.notaAluno = data?.notaAluno
    this.feedbackAluno = data?.feedbackAluno

    this.isNew = !data?.id
  }
}
