/**
 * BlueVix Admin Domain Index
 */

// Aluno
export { AlunoDto } from './aluno/AlunoDto'
export type { AlunoCreateDto, AlunoUpdateDto } from './aluno/AlunoDto'

// Treino
export { TreinoDto, SessaoDto } from './treino/TreinoDto'

// Exercício
export { ExercicioDto } from './exercicio/ExercicioDto'

// Alerta
export { AlertaDto } from './alerta/AlertaDto'
export type { AlertaTipo } from './alerta/AlertaDto'

// Gamificação
export {
  GamificacaoResumoDto,
  BadgeDto,
  DesafioMensalDto,
  StreakDto,
} from './gamificacao/GamificacaoDto'

// IA
export {
  AgenteIADto,
  ProtocoloDto,
  FraseDto,
  GuardrailDto,
  LogIADto,
  ConversaAdminDto,
} from './ia/IADto'
export type {
  TipoAgenteIA,
  TipoProtocolo,
  CategoriaFrase,
  TipoGuardrail,
  TipoLogIA,
} from './ia/IADto'

// Financeiro
export {
  PlanoDto,
  PlanoPrecoDto,
  AssinaturaDto,
  FaturaDto,
  PagamentoDto,
  ContratoDto,
  ContratoAceiteDto,
  GatewayConfigDto,
  FinanceiroResumoDto,
} from './financeiro/FinanceiroDto'
export type {
  StatusAssinatura,
  StatusFatura,
  StatusPagamento,
  GatewayPagamento,
  MetodoPagamento,
} from './financeiro/FinanceiroDto'
