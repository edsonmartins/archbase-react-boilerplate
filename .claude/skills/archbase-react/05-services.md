# 05. Services Remotos

Services para comunicação com API REST usando ArchbaseRemoteApiService.

---

## Service Base

**IMPORTANTE**: Requer implementação de `getId()`, `isNewRecord()` e `configureHeaders()`!

```typescript
import { injectable, inject } from 'inversify'
import { ArchbaseRemoteApiService } from '@archbase/data'
import type { ArchbaseRemoteApiClient } from '@archbase/data'  // SEMPRE type import!
import { API_TYPE } from '../../ioc/RapidexIOCTypes'

@injectable()
export class UserService extends ArchbaseRemoteApiService<UserDto, string> {
  constructor(
    @inject(API_TYPE.ApiClient) client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  // OBRIGATÓRIO: Endpoint (SEMPRE PLURAL!)
  protected getEndpoint(): string {
    return '/api/v1/users'
  }

  // OBRIGATÓRIO: Headers (pode retornar vazio)
  protected configureHeaders(): Record<string, string> {
    return {}
  }

  // OPCIONAL: Transformar dados da API para DTO
  protected transform(data: any): UserDto {
    return new UserDto(data)
  }

  // OBRIGATÓRIO: Extrair ID
  public getId(entity: UserDto): string {
    return entity.id || ''
  }

  // OBRIGATÓRIO: Verificar se é novo (usar __isNew!)
  public isNewRecord(entity: UserDto): boolean {
    return entity.__isNew === true  // Usar __isNew, NÃO verificar id vazio
  }
}
```

### Pontos Importantes

1. **Type import**: `import type { ArchbaseRemoteApiClient }` - evita erro de decorator
2. **Endpoint no plural**: `/api/v1/users` (não `/api/v1/user`)
3. **`__isNew`**: Use `entity.__isNew === true` para verificar registro novo
4. **getId()**: Sempre retornar o ID da entidade

---

## Métodos Herdados

```typescript
// CRUD
findOne(id: ID): Promise<T>              // Buscar por ID
findAll(page: number, size: number): Promise<Page<T>>  // Listar paginado
save<R>(entity: T): Promise<R>          // Salvar (cria ou atualiza)
delete(id: ID): Promise<void>           // Excluir
```

### Uso Correto

```typescript
const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)

// CORRETO
const user = await userService.findOne(id)

// ERRADO - não existe findById!
// const user = await userService.findById(id)
```

---

## Métodos Customizados

```typescript
@injectable()
export class UserService extends ArchbaseRemoteApiService<UserDto, string> {
  // ... métodos obrigatórios ...

  // Método customizado
  async findByEmail(email: string): Promise<UserDto | null> {
    try {
      const response = await this.client.get(`${this.getEndpoint()}/by-email/${email}`)
      return new UserDto(response.data)
    } catch (error) {
      return null
    }
  }

  // Método com parâmetros
  async searchByName(query: string, page = 0, size = 20): Promise<Page<UserDto>> {
    const response = await this.client.get(`${this.getEndpoint()}/search`, {
      params: { q: query, page, size }
    })
    return response.data
  }

  // Método de ação (endpoint diferente)
  async activate(id: string): Promise<UserDto> {
    const response = await this.client.post(`${this.getEndpoint()}/${id}/activate`)
    return new UserDto(response.data)
  }
}
```

---

## IoC Container

### Registrar Symbols

```typescript
// src/ioc/RapidexIOCTypes.ts
export const API_TYPE = {
  User: Symbol.for('UserService'),
  Product: Symbol.for('ProductService'),
  Order: Symbol.for('OrderService')
}
```

### Registrar no Container

```typescript
// src/ioc/RapidexContainerIOC.ts
import { ContainerModule interfaces } from 'inversify'

export const apiContainer = new ContainerModule((bind: interfaces.Bind) => {
  bind<UserService>(API_TYPE.User).to(UserService).inSingletonScope()
  bind<ProductService>(API_TYPE.Product).to(ProductService).inSingletonScope()
  bind<OrderService>(API_TYPE.Order).to(OrderService).inSingletonScope()
})
```

### Usar no Componente

```typescript
import { useArchbaseRemoteServiceApi } from '@archbase/data'
import { API_TYPE } from '../../ioc/RapidexIOCTypes'

function MyComponent() {
  const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.User)

  const handleLoad = async () => {
    const users = await userService.findAll(0, 50)
    console.log(users)
  }

  return <div>...</div>
}
```

---

## Tratamento de Erros

```typescript
class UserService extends ArchbaseRemoteApiService<UserDto, string> {
  async findOne(id: string): Promise<UserDto> {
    try {
      const response = await this.client.get(`${this.getEndpoint()}/${id}`)
      return this.transform(response.data)
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Usuário não encontrado')
      }
      throw error
    }
  }
}
```

---

## DTOs com newInstance

```typescript
import { v4 as uuidv4 } from 'uuid'

export class UserDto {
  id?: string
  __isNew?: boolean  // OBRIGATÓRIO
  nome: string
  email: string
  ativo: boolean

  constructor(data: any = {}) {
    this.id = data.id
    this.__isNew = data.__isNew ?? false
    this.nome = data.nome || ''
    this.email = data.email || ''
    this.ativo = data.ativo ?? true
  }

  static newInstance = () => {
    return new UserDto({
      id: uuidv4(),      // Gerar UUID
      __isNew: true,     // Marcar como novo
      nome: '',
      email: '',
      ativo: true
    })
  }
}
```

### Por quê `newInstance()`?

- Gera UUID automaticamente para evitar colisões
- Marca `__isNew: true` para o `isNewRecord()` funcionar
- Define valores padrão sensatos

---

## Resumo de Erros Comuns

| Errado | Correto |
|--------|---------|
| `import { ArchbaseRemoteApiClient }` | `import type { ArchbaseRemoteApiClient }` |
| `/api/v1/user` (singular) | `/api/v1/users` (plural) |
| `!entity.id` para `isNewRecord` | `entity.__isNew === true` |
| `service.findById()` | `service.findOne()` |
| Sem `newInstance()` | Sempre criar com UUID e `__isNew` |
