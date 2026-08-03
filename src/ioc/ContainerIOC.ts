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
// Configure o tenant padrão ou remova se não usar multi-tenancy
// O tenant vai no cabeçalho `X-Tenant-Id` de toda requisição, e o Hibernate
// acrescenta `where tenant_id = ?` sozinho a partir dele. Precisa casar com
// `archbase.app.tenant.default.id` do backend.
//
// Deixar um literal aqui tem um modo de falhar traiçoeiro: o login devolve
// "Usuário/senha não encontrados" porque o usuário existe e NÃO É ENCONTRADO
// naquele tenant. A mensagem manda procurar defeito na credencial, que está
// certa. Por isso o valor vem de variável de ambiente, e o default é o mesmo
// que o backend usa.
ArchbaseTenantManager.getInstance().setCurrentTenant({
  id: import.meta.env.VITE_TENANT_ID ?? 'a9f814d2-4dae-41f3-851b-8aa3d4706561',
  // `descricao` é obrigatório em `ArchbaseTenantInfo`; sem ele o projeto nasce
  // com erro de tipo.
  descricao: import.meta.env.VITE_TENANT_NOME ?? 'Tenant padrão',
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
// Registro de Serviços Customizados
// Adicione seus serviços aqui
// ============================================
// Exemplo:
// container.bind<UserService>(API_TYPE.UserService).to(UserService)
// container.bind<ProductService>(API_TYPE.ProductService).to(ProductService)

export default container
