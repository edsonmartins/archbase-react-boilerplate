# Archbase Services - Guia Completo

## Conceito

Os services do Archbase encapsulam chamadas à API REST, seguindo o padrão Repository com injeção de dependência via Inversify.

## Estrutura Base

### ArchbaseRemoteApiService

Classe abstrata que fornece operações CRUD padrão.

**IMPORTANTE**: Requer implementação de 3 métodos abstratos:
- `getEndpoint()` - URL da API
- `getId(entity)` - Extrair ID da entidade
- `isNewRecord(entity)` - Verificar se é registro novo

```typescript
import { injectable, inject } from 'inversify'
import { ArchbaseRemoteApiService } from '@archbase/data'
import type { ArchbaseRemoteApiClient } from '@archbase/data'  // SEMPRE usar 'type' import
import { ARCHBASE_IOC_API_TYPE } from '@archbase/core'

@injectable()
export class UserService extends ArchbaseRemoteApiService<UserDto, string> {
  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient) client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  // OBRIGATÓRIO: URL da API (SEMPRE NO PLURAL!)
  protected getEndpoint(): string {
    return '/api/v1/users'
  }

  // OBRIGATÓRIO: Extrair ID da entidade
  public getId(entity: UserDto): string {
    return entity.id
  }

  // OBRIGATÓRIO: Verificar se é registro novo
  public isNewRecord(entity: UserDto): boolean {
    return !entity.id || entity.id === ''
  }

  // OBRIGATÓRIO: Headers padrão
  protected configureHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json'
    }
  }
}
```

## Métodos Herdados

O `ArchbaseRemoteApiService` fornece automaticamente:

```typescript
// Buscar um registro por ID
findOne(id: ID): Promise<T>  // NÃO use 'findById'!

// Listar com paginação
findAll(page: number, size: number): Promise<Page<T>>
findAllWithSort(page: number, size: number, sort: string[]): Promise<Page<T>>
findAllByIds(ids: ID[]): Promise<T[]>

// Filtros
findAllWithFilter(filter: string, page: number, size: number): Promise<Page<T>>
findAllWithFilterAndSort(filter: string, page: number, size: number, sort: string[]): Promise<Page<T>>
findAllMultipleFields(value: string, fields: string, page: number, size: number, sort: string): Promise<Page<T>>

// CRUD
save<R>(entity: T): Promise<R>  // POST para novo, PUT para existente (usa isNewRecord)
delete(id: ID): Promise<void>

// Validação
validate(entity: T): Promise<void>
validateGroup<R>(entity: T, groups: any[]): Promise<R>

// Existência
exists(id: ID): Promise<boolean>
existsByComplexId(id: T): Promise<boolean>

// ID complexo
findByComplexId<R>(id: T): Promise<R>
```

## Interface Page

```typescript
interface Page<T> {
  content: T[]                 // Dados da página
  totalElements: number        // Total de registros
  totalPages: number           // Total de páginas
  number: number               // Página atual (0-based)
  size: number                 // Tamanho da página
  first: boolean               // É primeira página?
  last: boolean                // É última página?
  empty: boolean               // Está vazia?
  numberOfElements: number     // Quantidade nesta página
  sort: Sort                   // Ordenação
  pageable?: Pageable          // Info de paginação
}
```

## Métodos Customizados

### GET Customizado

```typescript
@injectable()
export class UserService extends ArchbaseRemoteApiService<UserDto, string> {
  // ... métodos abstratos obrigatórios

  async findByEmail(email: string): Promise<UserDto> {
    const headers = this.configureHeaders()
    const result = await this.client.get<UserDto>(
      `${this.getEndpoint()}/email/${encodeURIComponent(email)}`,
      headers,
      false  // com token
    )
    // Usar transform se existir
    if (typeof this['transform'] === 'function') {
      return this['transform'](result)
    }
    return result
  }

  async findActive(): Promise<UserDto[]> {
    const headers = this.configureHeaders()
    const result = await this.client.get<UserDto[]>(
      `${this.getEndpoint()}?active=true`,
      headers,
      false
    )
    return result
  }
}
```

### POST Customizado

```typescript
async createWithRole(user: UserDto, roleId: string): Promise<UserDto> {
  const headers = this.configureHeaders()
  const result = await this.client.post<UserDto, UserDto>(
    `${this.getEndpoint()}/with-role/${roleId}`,
    user,
    headers,
    false
  )
  return result
}

async bulkCreate(users: UserDto[]): Promise<UserDto[]> {
  const headers = this.configureHeaders()
  const result = await this.client.post<UserDto[], UserDto[]>(
    `${this.getEndpoint()}/bulk`,
    users,
    headers,
    false
  )
  return result
}
```

### PUT Customizado

```typescript
async updateStatus(id: string, status: string): Promise<UserDto> {
  const headers = this.configureHeaders()
  const result = await this.client.put<{ status: string }, UserDto>(
    `${this.getEndpoint()}/${id}/status`,
    { status },
    headers,
    false
  )
  return result
}

async activate(id: string): Promise<UserDto> {
  const headers = this.configureHeaders()
  const result = await this.client.put<void, UserDto>(
    `${this.getEndpoint()}/${id}/activate`,
    undefined,
    headers,
    false
  )
  return result
}
```

### PATCH Customizado

```typescript
async partialUpdate(id: string, fields: Partial<UserDto>): Promise<UserDto> {
  const headers = this.configureHeaders()
  const result = await this.client.patch<Partial<UserDto>, UserDto>(
    `${this.getEndpoint()}/${id}`,
    fields,
    headers,
    false
  )
  return result
}
```

### DELETE Customizado

```typescript
async softDelete(id: string): Promise<void> {
  const headers = this.configureHeaders()
  await this.client.delete<void>(
    `${this.getEndpoint()}/${id}/soft`,
    headers,
    false
  )
}

async bulkDelete(ids: string[]): Promise<void> {
  const headers = this.configureHeaders()
  await this.client.post<string[], void>(
    `${this.getEndpoint()}/bulk-delete`,
    ids,
    headers,
    false
  )
}
```

## Registro no IoC

### Definir Símbolos

```typescript
// src/ioc/IOCTypes.ts
export const API_TYPE = {
  UserService: Symbol.for('UserService'),
  ProductService: Symbol.for('ProductService'),
  OrderService: Symbol.for('OrderService'),
}
```

### Registrar no Container

```typescript
// src/ioc/ContainerIOC.ts
import { Container } from 'inversify'
import { UserService } from '@services/UserService'
import { API_TYPE } from './IOCTypes'

const containerIOC = new Container()

// Registrar services
containerIOC.bind<UserService>(API_TYPE.UserService).to(UserService)
containerIOC.bind<ProductService>(API_TYPE.ProductService).to(ProductService)

export default containerIOC
```

## Uso nos Componentes

### Hook useArchbaseRemoteServiceApi

```typescript
import { useArchbaseRemoteServiceApi } from '@archbase/data'
import { API_TYPE } from '@ioc/IOCTypes'
import { UserService } from '@services/UserService'

function UserComponent() {
  const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)

  const handleSave = async (user: UserDto) => {
    try {
      await userService.save(user)
    } catch (error) {
      console.error(error)
    }
  }
}
```

### Com React Query

```typescript
function useUsers() {
  const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)

  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.findAll(0, 100)
  })
}

function useUser(id: string) {
  const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)

  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.findOne(id),  // NÃO use 'findById'!
    enabled: !!id
  })
}

function useSaveUser() {
  const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (user: UserDto) => userService.save(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    }
  })
}
```

## Service Completo de Exemplo

```typescript
// src/services/UserService.ts
import { injectable, inject } from 'inversify'
import { ArchbaseRemoteApiService } from '@archbase/data'
import type { ArchbaseRemoteApiClient } from '@archbase/data'  // SEMPRE 'type' import!
import { ARCHBASE_IOC_API_TYPE } from '@archbase/core'
import type { UserDto } from '@domain/UserDto'

@injectable()
export class UserService extends ArchbaseRemoteApiService<UserDto, string> {
  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient) client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  // OBRIGATÓRIO
  protected getEndpoint(): string {
    return '/api/v1/users'
  }

  // OBRIGATÓRIO
  public getId(entity: UserDto): string {
    return entity.id
  }

  // OBRIGATÓRIO
  public isNewRecord(entity: UserDto): boolean {
    return !entity.id || entity.id === ''
  }

  // OBRIGATÓRIO
  protected configureHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json'
    }
  }

  // OPCIONAL: Transformar entidade após receber da API
  protected transform(entity: UserDto): UserDto {
    // Exemplo: converter datas de string para Date
    if (entity.createdAt && typeof entity.createdAt === 'string') {
      entity.createdAt = new Date(entity.createdAt)
    }
    return entity
  }

  // Métodos customizados
  async findByEmail(email: string): Promise<UserDto> {
    const headers = this.configureHeaders()
    const result = await this.client.get<UserDto>(
      `${this.getEndpoint()}/email/${encodeURIComponent(email)}`,
      headers,
      false
    )
    return this.transform ? this.transform(result) : result
  }

  async findActive(): Promise<UserDto[]> {
    const headers = this.configureHeaders()
    return this.client.get<UserDto[]>(
      `${this.getEndpoint()}?active=true`,
      headers,
      false
    )
  }

  async updateStatus(id: string, active: boolean): Promise<UserDto> {
    const headers = this.configureHeaders()
    return this.client.put<{ active: boolean }, UserDto>(
      `${this.getEndpoint()}/${id}/status`,
      { active },
      headers,
      false
    )
  }

  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    const headers = this.configureHeaders()
    await this.client.put<{ oldPassword: string; newPassword: string }, void>(
      `${this.getEndpoint()}/${id}/password`,
      { oldPassword, newPassword },
      headers,
      false
    )
  }

  async uploadAvatar(id: string, file: File): Promise<UserDto> {
    const formData = new FormData()
    formData.append('file', file)

    // Para FormData, remover Content-Type (browser define automaticamente)
    const headers = { ...this.configureHeaders() }
    delete headers['Content-Type']

    return this.client.post<FormData, UserDto>(
      `${this.getEndpoint()}/${id}/avatar`,
      formData,
      headers,
      false
    )
  }
}
```

## Tratamento de Erros

```typescript
import { processErrorMessage } from '@archbase/core'

async function handleApiCall() {
  try {
    await userService.save(userData)
  } catch (error: any) {
    // Processar mensagem de erro
    const message = processErrorMessage(error)

    // Verificar tipo de erro
    if (error?.response?.status === 401) {
      // Não autorizado - redirecionar para login
    } else if (error?.response?.status === 403) {
      // Proibido - sem permissão
    } else if (error?.response?.status === 404) {
      // Não encontrado
    } else if (error?.response?.status === 422) {
      // Erro de validação
      const validationErrors = error.response.data.errors
    } else {
      // Erro genérico
      console.error(message)
    }
  }
}
```

## Padrões Obrigatórios

### Checklist

- [ ] Usar `type` import para `ArchbaseRemoteApiClient`
- [ ] Decorar classe com `@injectable()`
- [ ] Injetar client com `@inject(ARCHBASE_IOC_API_TYPE.ApiClient)`
- [ ] Implementar `getEndpoint()` retornando URL no plural
- [ ] Implementar `getId(entity)` retornando o ID da entidade
- [ ] Implementar `isNewRecord(entity)` verificando se é novo registro
- [ ] Implementar `configureHeaders()` retornando headers padrão
- [ ] Usar generics corretos: `client.method<RequestType, ResponseType>`
- [ ] Chamar `configureHeaders()` em todos os métodos customizados

### Resumo de Diferenças

| Documentação Anterior (ERRADO) | Correto |
|-------------------------------|---------|
| `findById(id)` | `findOne(id)` |
| Sem `getId()` | `getId(entity)` é OBRIGATÓRIO |
| Sem `isNewRecord()` | `isNewRecord(entity)` é OBRIGATÓRIO |
| `import { ArchbaseRemoteApiClient }` | `import type { ArchbaseRemoteApiClient }` |

### Erros Comuns

**"Metadata not found"**
```typescript
// ERRADO
import { ArchbaseRemoteApiClient } from '@archbase/data'

// CORRETO
import type { ArchbaseRemoteApiClient } from '@archbase/data'
```

**"Abstract method not implemented"**
```typescript
// Verificar se implementou todos os métodos abstratos
public getId(entity: UserDto): string {
  return entity.id
}

public isNewRecord(entity: UserDto): boolean {
  return !entity.id
}
```

**"Service not registered"**
```typescript
// Verificar registro no ContainerIOC.ts
containerIOC.bind<UserService>(API_TYPE.UserService).to(UserService)
```

**"Cannot read property of undefined"**
```typescript
// Sempre verificar se service foi injetado
const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)
if (!userService) {
  throw new Error('UserService not available')
}
```
