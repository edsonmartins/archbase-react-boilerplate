/**
 * ExercicioDto - DTO para Exercícios do BlueVix
 */

// Tipos para padrões de movimento BlueVix
export type PadraoMovimento = 'AGACHAMENTO' | 'HINGE' | 'EMPURRAR' | 'PUXAR' | 'CORE' | 'MOBILIDADE'
export type NivelExercicio = 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO' | 'TODOS'
export type TipoEquipamento = 'NENHUM' | 'HALTERES' | 'BARRA' | 'ELASTICO' | 'COLCHONETE' | 'KETTLEBELL' | 'BOLA' | 'BANCO'

export class ExercicioDto {
  id: string
  code?: string
  version?: number
  createEntityDate?: string
  updateEntityDate?: string
  tenantId?: string

  // Dados do exercício
  nome: string
  descricao?: string
  instrucoes?: string
  categoria: string
  nivel: NivelExercicio

  // Padrão de movimento BlueVix (6 fases)
  padraoMovimento?: PadraoMovimento
  stepPadrao?: number // Step 1-10 dentro do padrão

  // Equipamento principal
  equipamento?: TipoEquipamento

  // Tempo e calorias
  duracaoSegundos?: number
  repeticoes?: number
  repeticoesTexto?: string // Ex: "12" ou "8-12"
  series?: number
  caloriasPorMinuto?: number

  // Mídia
  imagemUrl?: string
  videoUrl?: string
  gifUrl?: string

  // Configurações
  ativo: boolean
  ordenacao?: number

  // Equipamentos necessários (lista completa)
  equipamentos?: string[]

  // Grupos musculares
  gruposMusculares?: string[]

  // Flag para novo registro
  isNew: boolean

  constructor(data?: Partial<ExercicioDto>) {
    this.id = data?.id || ''
    this.code = data?.code
    this.version = data?.version
    this.createEntityDate = data?.createEntityDate
    this.updateEntityDate = data?.updateEntityDate
    this.tenantId = data?.tenantId

    this.nome = data?.nome || ''
    this.descricao = data?.descricao
    this.instrucoes = data?.instrucoes
    this.categoria = data?.categoria || ''
    this.nivel = data?.nivel || 'INICIANTE'

    this.padraoMovimento = data?.padraoMovimento
    this.stepPadrao = data?.stepPadrao

    this.equipamento = data?.equipamento || 'NENHUM'

    this.duracaoSegundos = data?.duracaoSegundos
    this.repeticoes = data?.repeticoes
    this.repeticoesTexto = data?.repeticoesTexto
    this.series = data?.series
    this.caloriasPorMinuto = data?.caloriasPorMinuto

    this.imagemUrl = data?.imagemUrl
    this.videoUrl = data?.videoUrl
    this.gifUrl = data?.gifUrl

    this.ativo = data?.ativo ?? true
    this.ordenacao = data?.ordenacao

    this.equipamentos = data?.equipamentos || []
    this.gruposMusculares = data?.gruposMusculares || []

    this.isNew = !data?.id
  }

  static newInstance(): ExercicioDto {
    return new ExercicioDto({
      nome: '',
      categoria: '',
      nivel: 'INICIANTE',
      equipamento: 'NENHUM',
      ativo: true,
    })
  }
}
