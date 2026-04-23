/**
 * DTOs para Progressão de Movimento
 */

export interface ProgressaoStepData {
  id: string
  numeroStep: number
  nome: string
  descricao?: string
  criterioAvanco?: string
}

export interface ProgressaoNivelData {
  nivel: string
  steps: ProgressaoStepData[]
}

export interface PadraoMovimentoData {
  id: string
  nome: string
  descricao?: string
  cor?: string
  icone?: string
  ordem?: number
  ativo?: boolean
  niveis?: ProgressaoNivelData[]
}

export class PadraoMovimentoDto {
  id: string
  nome: string
  descricao: string
  cor: string
  icone: string
  ordem: number
  ativo: boolean
  niveis: ProgressaoNivelData[]

  constructor(data?: Partial<PadraoMovimentoData>) {
    this.id = data?.id || ''
    this.nome = data?.nome || ''
    this.descricao = data?.descricao || ''
    this.cor = data?.cor || 'blue'
    this.icone = data?.icone || ''
    this.ordem = data?.ordem || 0
    this.ativo = data?.ativo ?? true
    this.niveis = data?.niveis || []
  }

  get isNew(): boolean {
    return !this.id || this.id === ''
  }
}

export interface ProgressaoOndulatoriaData {
  id: string
  semana: number
  tipo: string
  fase?: string
  intensidade?: number
  volume?: number
  foco?: string
  descricao?: string
  ativo?: boolean
}

export class ProgressaoOndulatoriaDto {
  id: string
  semana: number
  tipo: string
  fase: string
  intensidade: number
  volume: number
  foco: string
  descricao: string
  ativo: boolean

  constructor(data?: Partial<ProgressaoOndulatoriaData>) {
    this.id = data?.id || ''
    this.semana = data?.semana || 0
    this.tipo = data?.tipo || ''
    this.fase = data?.fase || ''
    this.intensidade = data?.intensidade || 0
    this.volume = data?.volume || 0
    this.foco = data?.foco || ''
    this.descricao = data?.descricao || ''
    this.ativo = data?.ativo ?? true
  }

  get isNew(): boolean {
    return !this.id || this.id === ''
  }
}
