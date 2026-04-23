import axios from 'axios'
import { API_TYPE } from './IOCTypes'
import { AppAuthenticator } from '@auth/AppAuthenticator'
import { IOCContainer, ARCHBASE_IOC_API_TYPE } from '@archbase/core'
import { ArchbaseAccessTokenService, ArchbaseApiTokenService } from '@archbase/security'
import { ArchbaseAxiosRemoteApiClient, ArchbaseRemoteApiClient } from '@archbase/data'
import {
  DefaultArchbaseTokenManager,
  ArchbaseUserService,
  ArchbaseProfileService,
  ArchbaseGroupService,
  ArchbaseResourceService,
  ArchbaseTenantManager,
} from '@archbase/security'

/**
 * Configuração do Container IoC (Inversify)
 *
 * Este arquivo configura o container de injeção de dependências.
 * Registra todos os serviços necessários para o funcionamento do app.
 */

// Configura a URL base do Axios
axios.defaults.baseURL = import.meta.env.VITE_API

// Obtém o container singleton
const container = IOCContainer.getContainer()

// ============================================
// Configuração do Tenant (multi-tenancy)
// ============================================
// Tenant ID padrão do BlueVix
ArchbaseTenantManager.getInstance().setCurrentTenant({
  id: 'b1u3v1x0-0001-4000-a000-000000000001',
  descricao: 'BlueVix Admin',
})

// ============================================
// Registro do Token Manager
// ============================================
IOCContainer.registerTokenManager(DefaultArchbaseTokenManager)

// ============================================
// Registro dos Serviços de Segurança
// ============================================
IOCContainer.registerSecurityServices({
  userService: ArchbaseUserService,
  profileService: ArchbaseProfileService,
  groupService: ArchbaseGroupService,
  resourceService: ArchbaseResourceService,
  accessTokenService: ArchbaseAccessTokenService,
  apiTokenService: ArchbaseApiTokenService,
})

// ============================================
// Registro do Autenticador Customizado
// ============================================
// Remove o autenticador padrão se existir para evitar conflito
if (IOCContainer.hasService(ARCHBASE_IOC_API_TYPE.Authenticator)) {
  IOCContainer.unbindService(ARCHBASE_IOC_API_TYPE.Authenticator)
}
IOCContainer.registerService(ARCHBASE_IOC_API_TYPE.Authenticator, AppAuthenticator)

// ============================================
// Registro do Cliente API
// ============================================
container.bind<ArchbaseRemoteApiClient>(API_TYPE.ApiClient).to(ArchbaseAxiosRemoteApiClient)

// ============================================
// BlueVix Admin Services
// ============================================
import { AlunoService } from '../services/AlunoService'
import { TreinoService } from '../services/TreinoService'
import { ExercicioService } from '../services/ExercicioService'
import { AlertaService } from '../services/AlertaService'
import { DesafioService } from '../services/DesafioService'
import { IAService } from '../services/IAService'
import { ProgressaoService } from '../services/ProgressaoService'
import {
  PlanoService,
  AssinaturaService,
  FaturaService,
  PagamentoService,
  ContratoService,
  GatewayConfigService,
  FinanceiroFacadeService,
} from '../services/FinanceiroService'

container.bind<AlunoService>(API_TYPE.AlunoService).to(AlunoService).inSingletonScope()
container.bind<TreinoService>(API_TYPE.TreinoService).to(TreinoService).inSingletonScope()
container.bind<ExercicioService>(API_TYPE.ExercicioService).to(ExercicioService).inSingletonScope()
container.bind<AlertaService>(API_TYPE.AlertaService).to(AlertaService).inSingletonScope()
container.bind<DesafioService>(API_TYPE.DesafioService).to(DesafioService).inSingletonScope()
container.bind<IAService>(API_TYPE.IAService).to(IAService).inSingletonScope()
container.bind<ProgressaoService>(API_TYPE.ProgressaoService).to(ProgressaoService).inSingletonScope()

// ============================================
// Financeiro Services
// ============================================
container.bind<PlanoService>(API_TYPE.PlanoService).to(PlanoService).inSingletonScope()
container.bind<AssinaturaService>(API_TYPE.AssinaturaService).to(AssinaturaService).inSingletonScope()
container.bind<FaturaService>(API_TYPE.FaturaService).to(FaturaService).inSingletonScope()
container.bind<PagamentoService>(API_TYPE.PagamentoService).to(PagamentoService).inSingletonScope()
container.bind<ContratoService>(API_TYPE.ContratoService).to(ContratoService).inSingletonScope()
container.bind<GatewayConfigService>(API_TYPE.GatewayConfigService).to(GatewayConfigService).inSingletonScope()
container.bind<FinanceiroFacadeService>(API_TYPE.FinanceiroFacadeService).to(FinanceiroFacadeService).inSingletonScope()

// ============================================
// Configuração do Axios Interceptor
// ============================================
// Adiciona token e tenant em todas as requisições
// Faz refresh automático de token em 401
AppAuthenticator.setupAxiosInterceptor()

export default container
