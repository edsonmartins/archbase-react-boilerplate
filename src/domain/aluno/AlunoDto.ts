/**
 * AlunoDto - DTO para Aluno/Estudante do BlueVix
 */

// Tipos para perfil emocional BlueVix
export type PerfilEmocional =
  | 'ANSIOSO'
  | 'ESTRESSADO'
  | 'DEPRESSIVO'
  | 'EQUILIBRADO'
  | 'MOTIVADO'
  | 'RESISTENTE'

// Tipos para qualidade do sono
export type QualidadeSono = 'PESSIMA' | 'RUIM' | 'REGULAR' | 'BOA' | 'OTIMA'

// Tipos para opcao sim/nao/talvez
export type OpcaoSimNao = 'SIM' | 'NAO' | 'TALVEZ'

export class AlunoDto {
  id: string
  code?: string
  version?: number
  createEntityDate?: string
  updateEntityDate?: string
  tenantId?: string

  // Dados basicos
  userId: string
  nome: string
  email: string
  telefone?: string
  dataNascimento?: string
  genero?: 'FEMININO' | 'MASCULINO' | 'OUTRO' | 'NAO_INFORMAR'
  cidade?: string
  estado?: string
  avatar?: string // Imagem em base64
  avatarUrl?: string // URL alternativa (legado)

  // Plano e Status
  plano: 'SEMENTE' | 'ESSENCIAL' | 'PRESENCA' | 'TRIAL'
  status: 'TRIAL' | 'ATIVO' | 'EXPIRADO' | 'PAUSADO' | 'CANCELADO'
  nivelTreino: 'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO'

  // Datas do plano
  dataInicioPlano?: string
  dataInicioTrial?: string
  dataExpiracaoPlano?: string

  // Contrato
  contratoAceito: boolean
  dataAceiteContrato?: string

  // ============================================
  // ANAMNESE FISICA
  // ============================================
  objetivo?: 'SAUDE' | 'EMAGRECIMENTO' | 'FORCA' | 'FLEXIBILIDADE' | 'ENERGIA'
  dores?: string[] // Ex: ['LOMBAR', 'JOELHOS', 'OMBROS', 'CERVICAL', 'QUADRIL', 'PUNHOS', 'TORNOZELOS']
  limitacoesFisicas?: string
  equipamentosDisponiveis?: string[] // Ex: ['COLCHONETE', 'HALTERES', 'ELASTICO', 'BOLA']
  autorizacaoMedica?: OpcaoSimNao
  restricoesMedicas?: string

  // Dados fisicos
  pesoKg?: number
  alturaCm?: number

  // ============================================
  // ANAMNESE EMOCIONAL
  // ============================================
  perfilEmocional?: PerfilEmocional
  humorPredominante?: number // 1-10
  nivelEstresse?: number // 1-10
  qualidadeSono?: QualidadeSono
  emTerapia?: OpcaoSimNao
  gatilhosEmocionais?: string
  observacoesVirginia?: string // Observacoes da Virginia (visivel so para profissional)

  // ============================================
  // PREFERENCIAS
  // ============================================
  aceitaCicloMenstrual: boolean
  notificacoesAtivas: boolean
  horarioPreferidoTreino?: string
  timezone?: string
  observacoesGerais?: string

  // Flag para novo registro
  isNew: boolean

  constructor(data?: Partial<AlunoDto>) {
    this.id = data?.id || ''
    this.code = data?.code
    this.version = data?.version
    this.createEntityDate = data?.createEntityDate
    this.updateEntityDate = data?.updateEntityDate
    this.tenantId = data?.tenantId

    this.userId = data?.userId || ''
    this.nome = data?.nome || ''
    this.email = data?.email || ''
    this.telefone = data?.telefone
    this.dataNascimento = data?.dataNascimento
    this.genero = data?.genero
    this.cidade = data?.cidade
    this.estado = data?.estado
    this.avatar = data?.avatar
    this.avatarUrl = data?.avatarUrl

    this.plano = data?.plano || 'TRIAL'
    this.status = data?.status || 'TRIAL'
    this.nivelTreino = data?.nivelTreino || 'INICIANTE'

    this.dataInicioPlano = data?.dataInicioPlano
    this.dataInicioTrial = data?.dataInicioTrial
    this.dataExpiracaoPlano = data?.dataExpiracaoPlano

    this.contratoAceito = data?.contratoAceito || false
    this.dataAceiteContrato = data?.dataAceiteContrato

    // Anamnese fisica
    this.objetivo = data?.objetivo
    this.dores = data?.dores || []
    this.limitacoesFisicas = data?.limitacoesFisicas
    this.equipamentosDisponiveis = data?.equipamentosDisponiveis || []
    this.autorizacaoMedica = data?.autorizacaoMedica
    this.restricoesMedicas = data?.restricoesMedicas
    this.pesoKg = data?.pesoKg
    this.alturaCm = data?.alturaCm

    // Anamnese emocional
    this.perfilEmocional = data?.perfilEmocional
    this.humorPredominante = data?.humorPredominante
    this.nivelEstresse = data?.nivelEstresse
    this.qualidadeSono = data?.qualidadeSono
    this.emTerapia = data?.emTerapia
    this.gatilhosEmocionais = data?.gatilhosEmocionais
    this.observacoesVirginia = data?.observacoesVirginia

    // Preferencias
    this.aceitaCicloMenstrual = data?.aceitaCicloMenstrual || false
    this.notificacoesAtivas = data?.notificacoesAtivas ?? true
    this.horarioPreferidoTreino = data?.horarioPreferidoTreino
    this.timezone = data?.timezone
    this.observacoesGerais = data?.observacoesGerais

    this.isNew = !data?.id
  }

  static newInstance(): AlunoDto {
    return new AlunoDto({
      nome: '',
      email: '',
      plano: 'TRIAL',
      status: 'TRIAL',
      nivelTreino: 'INICIANTE',
      notificacoesAtivas: true,
      aceitaCicloMenstrual: false,
      contratoAceito: false,
    })
  }
}

/**
 * DTO para criação de Aluno
 */
export interface AlunoCreateDto {
  nome: string
  email: string
  telefone?: string
  dataNascimento?: string
  plano?: string
  nivelTreino?: string
  objetivo?: string
  restricoesMedicas?: string
  pesoKg?: number
  alturaCm?: number
  aceitaCicloMenstrual?: boolean
}

/**
 * DTO para atualização de Aluno
 */
export interface AlunoUpdateDto {
  nome?: string
  telefone?: string
  dataNascimento?: string
  avatarUrl?: string
  plano?: string
  status?: string
  nivelTreino?: string
  objetivo?: string
  restricoesMedicas?: string
  pesoKg?: number
  alturaCm?: number
  aceitaCicloMenstrual?: boolean
  notificacoesAtivas?: boolean
  horarioPreferidoTreino?: string
  timezone?: string
}
