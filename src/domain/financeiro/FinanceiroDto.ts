/**
 * FinanceiroDto - DTOs para o modulo Financeiro do BlueVix
 */

// ============================================
// ENUMS
// ============================================

export type StatusAssinatura = 'PENDENTE' | 'TRIAL' | 'ATIVA' | 'PAUSADA' | 'CANCELADA' | 'EXPIRADA'
export type StatusFatura = 'PENDENTE' | 'PAGA' | 'CANCELADA' | 'VENCIDA'
export type StatusPagamento = 'PENDENTE' | 'PROCESSANDO' | 'APROVADO' | 'REJEITADO' | 'REEMBOLSADO'
export type GatewayPagamento = 'STRIPE' | 'MERCADO_PAGO' | 'PAGSEGURO'
export type MetodoPagamento = 'PIX' | 'CARTAO_CREDITO'

// ============================================
// PLANO DTOs
// ============================================

export class PlanoPrecoDto {
  id: string
  planoId: string
  codigo: string // MENSAL, TRIMESTRAL, SEMESTRAL, ANUAL
  valor: number
  quantidadeMeses: number
  descontoPercentual?: number
  valorMensal?: number
  valorComDesconto?: number
  ativo: boolean

  constructor(data?: Partial<PlanoPrecoDto>) {
    this.id = data?.id || ''
    this.planoId = data?.planoId || ''
    this.codigo = data?.codigo || 'MENSAL'
    this.valor = data?.valor || 0
    this.quantidadeMeses = data?.quantidadeMeses || 1
    this.descontoPercentual = data?.descontoPercentual
    this.valorMensal = data?.valorMensal
    this.valorComDesconto = data?.valorComDesconto
    this.ativo = data?.ativo ?? true
  }
}

export class PlanoDto {
  id: string
  codigo: string
  nome: string
  descricao?: string
  beneficios?: string[]
  diasDuracao?: number
  diasTrial?: number
  ativo: boolean
  ordem?: number
  precos?: PlanoPrecoDto[]
  createdAt?: string
  updatedAt?: string

  isNew: boolean

  constructor(data?: Partial<PlanoDto>) {
    this.id = data?.id || ''
    this.codigo = data?.codigo || ''
    this.nome = data?.nome || ''
    this.descricao = data?.descricao
    this.beneficios = data?.beneficios || []
    this.diasDuracao = data?.diasDuracao
    this.diasTrial = data?.diasTrial || 7
    this.ativo = data?.ativo ?? true
    this.ordem = data?.ordem
    this.precos = data?.precos?.map((p) => new PlanoPrecoDto(p)) || []
    this.createdAt = data?.createdAt
    this.updatedAt = data?.updatedAt
    this.isNew = !data?.id
  }

  static newInstance(): PlanoDto {
    return new PlanoDto()
  }
}

// ============================================
// ASSINATURA DTOs
// ============================================

export class AssinaturaDto {
  id: string
  alunoId: string
  alunoNome?: string
  planoId: string
  planoNome?: string
  planoCodigo?: string
  planoPrecoId?: string
  precoCodigo?: string
  status: StatusAssinatura
  dataInicio?: string
  dataExpiracao?: string
  dataProximaCobranca?: string
  autoRenovacao: boolean
  gateway?: GatewayPagamento
  motivoCancelamento?: string
  dataCancelamento?: string
  createdAt?: string
  updatedAt?: string

  isNew: boolean

  constructor(data?: Partial<AssinaturaDto>) {
    this.id = data?.id || ''
    this.alunoId = data?.alunoId || ''
    this.alunoNome = data?.alunoNome
    this.planoId = data?.planoId || ''
    this.planoNome = data?.planoNome
    this.planoCodigo = data?.planoCodigo
    this.planoPrecoId = data?.planoPrecoId
    this.precoCodigo = data?.precoCodigo
    this.status = data?.status || 'PENDENTE'
    this.dataInicio = data?.dataInicio
    this.dataExpiracao = data?.dataExpiracao
    this.dataProximaCobranca = data?.dataProximaCobranca
    this.autoRenovacao = data?.autoRenovacao ?? true
    this.gateway = data?.gateway
    this.motivoCancelamento = data?.motivoCancelamento
    this.dataCancelamento = data?.dataCancelamento
    this.createdAt = data?.createdAt
    this.updatedAt = data?.updatedAt
    this.isNew = !data?.id
  }

  static newInstance(): AssinaturaDto {
    return new AssinaturaDto()
  }
}

// ============================================
// FATURA DTOs
// ============================================

export class FaturaDto {
  id: string
  codigo: string
  assinaturaId: string
  alunoId: string
  alunoNome?: string
  planoNome?: string
  valorOriginal: number
  desconto?: number
  valorFinal: number
  status: StatusFatura
  dataVencimento?: string
  dataPagamento?: string
  descricao?: string
  createdAt?: string
  updatedAt?: string

  isNew: boolean

  constructor(data?: Partial<FaturaDto>) {
    this.id = data?.id || ''
    this.codigo = data?.codigo || ''
    this.assinaturaId = data?.assinaturaId || ''
    this.alunoId = data?.alunoId || ''
    this.alunoNome = data?.alunoNome
    this.planoNome = data?.planoNome
    this.valorOriginal = data?.valorOriginal || 0
    this.desconto = data?.desconto
    this.valorFinal = data?.valorFinal || 0
    this.status = data?.status || 'PENDENTE'
    this.dataVencimento = data?.dataVencimento
    this.dataPagamento = data?.dataPagamento
    this.descricao = data?.descricao
    this.createdAt = data?.createdAt
    this.updatedAt = data?.updatedAt
    this.isNew = !data?.id
  }

  static newInstance(): FaturaDto {
    return new FaturaDto()
  }
}

// ============================================
// PAGAMENTO DTOs
// ============================================

export class PagamentoDto {
  id: string
  faturaId: string
  faturaCodigo?: string
  alunoId: string
  gateway: GatewayPagamento
  metodo: MetodoPagamento
  valor: number
  status: StatusPagamento
  gatewayPagamentoId?: string
  pixCopiaECola?: string
  pixQrCode?: string
  pixExpiracao?: string
  cartaoUltimos4?: string
  cartaoBandeira?: string
  valorReembolsado?: number
  dataReembolso?: string
  motivoReembolso?: string
  erroMensagem?: string
  createdAt?: string
  updatedAt?: string

  isNew: boolean

  constructor(data?: Partial<PagamentoDto>) {
    this.id = data?.id || ''
    this.faturaId = data?.faturaId || ''
    this.faturaCodigo = data?.faturaCodigo
    this.alunoId = data?.alunoId || ''
    this.gateway = data?.gateway || 'STRIPE'
    this.metodo = data?.metodo || 'PIX'
    this.valor = data?.valor || 0
    this.status = data?.status || 'PENDENTE'
    this.gatewayPagamentoId = data?.gatewayPagamentoId
    this.pixCopiaECola = data?.pixCopiaECola
    this.pixQrCode = data?.pixQrCode
    this.pixExpiracao = data?.pixExpiracao
    this.cartaoUltimos4 = data?.cartaoUltimos4
    this.cartaoBandeira = data?.cartaoBandeira
    this.valorReembolsado = data?.valorReembolsado
    this.dataReembolso = data?.dataReembolso
    this.motivoReembolso = data?.motivoReembolso
    this.erroMensagem = data?.erroMensagem
    this.createdAt = data?.createdAt
    this.updatedAt = data?.updatedAt
    this.isNew = !data?.id
  }

  static newInstance(): PagamentoDto {
    return new PagamentoDto()
  }
}

// ============================================
// CONTRATO DTOs
// ============================================

export class ContratoDto {
  id: string
  codigo: string
  titulo: string
  conteudo: string
  versao: number
  obrigatorioAceite: boolean
  ativo: boolean
  dataPublicacao?: string
  createdAt?: string
  updatedAt?: string

  isNew: boolean

  constructor(data?: Partial<ContratoDto>) {
    this.id = data?.id || ''
    this.codigo = data?.codigo || ''
    this.titulo = data?.titulo || ''
    this.conteudo = data?.conteudo || ''
    this.versao = data?.versao || 1
    this.obrigatorioAceite = data?.obrigatorioAceite ?? true
    this.ativo = data?.ativo ?? true
    this.dataPublicacao = data?.dataPublicacao
    this.createdAt = data?.createdAt
    this.updatedAt = data?.updatedAt
    this.isNew = !data?.id
  }

  static newInstance(): ContratoDto {
    return new ContratoDto()
  }
}

export class ContratoAceiteDto {
  id: string
  alunoId: string
  contratoId: string
  contratoTitulo?: string
  versaoContrato: number
  dataAceite?: string
  ipAceite?: string

  constructor(data?: Partial<ContratoAceiteDto>) {
    this.id = data?.id || ''
    this.alunoId = data?.alunoId || ''
    this.contratoId = data?.contratoId || ''
    this.contratoTitulo = data?.contratoTitulo
    this.versaoContrato = data?.versaoContrato || 1
    this.dataAceite = data?.dataAceite
    this.ipAceite = data?.ipAceite
  }
}

// ============================================
// GATEWAY CONFIG DTOs
// ============================================

export class GatewayConfigDto {
  id: string
  gateway: GatewayPagamento
  sandbox: boolean
  ativo: boolean
  padrao: boolean
  createdAt?: string
  updatedAt?: string

  isNew: boolean

  constructor(data?: Partial<GatewayConfigDto>) {
    this.id = data?.id || ''
    this.gateway = data?.gateway || 'STRIPE'
    this.sandbox = data?.sandbox ?? true
    this.ativo = data?.ativo ?? false
    this.padrao = data?.padrao ?? false
    this.createdAt = data?.createdAt
    this.updatedAt = data?.updatedAt
    this.isNew = !data?.id
  }

  static newInstance(): GatewayConfigDto {
    return new GatewayConfigDto()
  }
}

// ============================================
// RESUMO FINANCEIRO DTO
// ============================================

export class FinanceiroResumoDto {
  totalAssinaturasAtivas: number
  totalAssinaturasTrials: number
  totalAssinaturasCanceladas: number
  totalFaturasPendentes: number
  totalFaturasVencidas: number
  receitaMesAtual: number
  receitaMesAnterior: number
  ticketMedio: number
  taxaConversaoTrial: number
  taxaChurn: number

  constructor(data?: Partial<FinanceiroResumoDto>) {
    this.totalAssinaturasAtivas = data?.totalAssinaturasAtivas || 0
    this.totalAssinaturasTrials = data?.totalAssinaturasTrials || 0
    this.totalAssinaturasCanceladas = data?.totalAssinaturasCanceladas || 0
    this.totalFaturasPendentes = data?.totalFaturasPendentes || 0
    this.totalFaturasVencidas = data?.totalFaturasVencidas || 0
    this.receitaMesAtual = data?.receitaMesAtual || 0
    this.receitaMesAnterior = data?.receitaMesAnterior || 0
    this.ticketMedio = data?.ticketMedio || 0
    this.taxaConversaoTrial = data?.taxaConversaoTrial || 0
    this.taxaChurn = data?.taxaChurn || 0
  }
}
