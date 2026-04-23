import { ARCHBASE_IOC_API_TYPE } from '@archbase/core'

/**
 * Tipos de serviços para Injeção de Dependência (IoC)
 *
 * Este arquivo define os símbolos usados para registrar e resolver
 * serviços no container Inversify.
 *
 * Os tipos do Archbase são reexportados para conveniência.
 * Adicione seus próprios tipos de serviço conforme necessário.
 */
export const API_TYPE = {
  // ============================================
  // Archbase Security Services (obrigatórios)
  // ============================================
  Authenticator: ARCHBASE_IOC_API_TYPE.Authenticator,
  TokenManager: ARCHBASE_IOC_API_TYPE.TokenManager,
  ApiClient: ARCHBASE_IOC_API_TYPE.ApiClient,
  User: ARCHBASE_IOC_API_TYPE.User,
  Profile: ARCHBASE_IOC_API_TYPE.Profile,
  Group: ARCHBASE_IOC_API_TYPE.Group,
  Resource: ARCHBASE_IOC_API_TYPE.Resource,
  ApiToken: ARCHBASE_IOC_API_TYPE.ApiToken,

  // ============================================
  // BlueVix Admin Services
  // ============================================
  AlunoService: Symbol.for('AlunoService'),
  TreinoService: Symbol.for('TreinoService'),
  ExercicioService: Symbol.for('ExercicioService'),
  AlertaService: Symbol.for('AlertaService'),
  DesafioService: Symbol.for('DesafioService'),
  IAService: Symbol.for('IAService'),
  ProgressaoService: Symbol.for('ProgressaoService'),

  // ============================================
  // Financeiro Services
  // ============================================
  PlanoService: Symbol.for('PlanoService'),
  AssinaturaService: Symbol.for('AssinaturaService'),
  FaturaService: Symbol.for('FaturaService'),
  PagamentoService: Symbol.for('PagamentoService'),
  ContratoService: Symbol.for('ContratoService'),
  GatewayConfigService: Symbol.for('GatewayConfigService'),
  FinanceiroFacadeService: Symbol.for('FinanceiroFacadeService'),
}
