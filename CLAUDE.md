# CLAUDE.md - Archbase React Boilerplate

Este documento fornece contexto para o Claude Code trabalhar eficientemente com este projeto.

**IMPORTANTE**: Esta documentação foi validada contra a biblioteca archbase-react-v3.

## Visão Geral

Este é um boilerplate para aplicações React administrativas usando a biblioteca **Archbase React** baseada em **Mantine v8**.

## Stack Tecnológica

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | 19.x | UI Library |
| TypeScript | 5.3+ | Type Safety |
| Vite | 6.x | Build Tool |
| Mantine | 8.3.6 | UI Components |
| Archbase React | 3.0.7+ | Framework Admin |
| Inversify | 6.2 | IoC/DI Container |
| React Query | 5.x | Data Fetching |
| i18next | 23.x | Internacionalização |
| Axios | 1.7+ | HTTP Client |

## Comandos

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor dev (porta 4200)
pnpm dev:http         # Servidor dev com host exposto

# Build
pnpm build            # Build de produção
pnpm preview          # Preview do build

# Qualidade
pnpm lint             # Verificar ESLint
pnpm lint:fix         # Corrigir ESLint
pnpm format           # Formatar com Prettier
pnpm type-check       # Verificar tipos TypeScript

# Testes
pnpm test             # Rodar testes
pnpm test:ui          # Testes com UI
pnpm test:coverage    # Cobertura de testes
```

## Estrutura do Projeto

```
src/
├── assets/           # Imagens e ícones
├── auth/             # Autenticação (AppAuthenticator, AppUser)
├── components/       # Componentes reutilizáveis
├── contexts/         # React Contexts
├── domain/           # DTOs e modelos de domínio
├── ioc/              # Container IoC (Inversify)
│   ├── ContainerIOC.ts   # Configuração do container
│   └── IOCTypes.ts       # Símbolos para DI
├── locales/          # Traduções (pt-BR, en, es)
├── navigation/       # Dados de navegação e rotas
├── services/         # Services de API
├── styles/           # CSS global
├── theme/            # Temas Light/Dark
├── utils/            # Utilitários
├── views/            # Páginas/Views
├── App.tsx           # Componente raiz
├── AppConstants.tsx  # Constantes globais
└── main.tsx          # Entry point
```

## Padrões Importantes

### 1. Injeção de Dependência (IoC)

Usamos Inversify para IoC. Todos os services devem ser registrados em `ioc/ContainerIOC.ts`:

```typescript
// Definir símbolo em IOCTypes.ts
export const API_TYPE = {
  MyService: Symbol.for('MyService'),
}

// Registrar em ContainerIOC.ts
container.bind<MyService>(API_TYPE.MyService).to(MyService)
```

### 2. Services Remotos

Services devem estender `ArchbaseRemoteApiService` e implementar métodos obrigatórios:

```typescript
import { injectable, inject } from 'inversify'
import { ArchbaseRemoteApiService } from '@archbase/data'
import type { ArchbaseRemoteApiClient } from '@archbase/data'  // SEMPRE type import!
import { ARCHBASE_IOC_API_TYPE } from '@archbase/core'

@injectable()
export class UserService extends ArchbaseRemoteApiService<UserDto, string> {
  constructor(@inject(ARCHBASE_IOC_API_TYPE.ApiClient) client: ArchbaseRemoteApiClient) {
    super(client)
  }

  // OBRIGATÓRIO: Endpoint (sempre plural!)
  protected getEndpoint(): string {
    return '/api/v1/users'
  }

  // OBRIGATÓRIO: Extrair ID da entidade
  public getId(entity: UserDto): string {
    return entity.id
  }

  // OBRIGATÓRIO: Verificar se é registro novo
  public isNewRecord(entity: UserDto): boolean {
    return entity.isNew
  }

  // OBRIGATÓRIO: Headers padrão (pode retornar vazio)
  protected configureHeaders(): Record<string, string> {
    return {}
  }

  // OPCIONAL: Transformar dados da API para DTO
  protected transform(data: any): UserDto {
    return new UserDto(data)
  }
}
```

**IMPORTANTE**: Usar `findOne(id)`, NÃO `findById(id)`!

### 3. DataSource (V2 Recomendado)

Use `useArchbaseRemoteDataSourceV2` para list views e forms:

```typescript
const { dataSource, isLoading, error, refreshData } = useArchbaseRemoteDataSourceV2<UserDto>({
  name: 'dsUser',
  label: 'Usuário',
  service: serviceApi,
  pageSize: 25,
  defaultSortFields: ['nome'],
  validator,
  onError: (error) => ArchbaseNotifications.showError('Atenção', error)
})
```

**Operações corretas:**
- Carregar: `dataSource.setRecords([dto])` ou `dataSource.open({ records: [...] })`
- Inserir: `dataSource.insert({...})` (NÃO `append`)
- Salvar: `dataSource.save()` (NÃO `post`)
- Remover: `dataSource.remove()` (NÃO `delete`)
- Buscar: `dataSource.locate({ id })` (NÃO `goToId`)
- Listar: `dataSource.browseRecords()` (NÃO `getData`)

### 4. Formulários

Use `ArchbaseFormTemplate` com `ValidationErrorsProvider` e Tabs:

```typescript
return (
  <ValidationErrorsProvider>
    <ArchbaseFormTemplate
      title={isAddAction ? 'Novo Usuário' : 'Editar Usuário'}
      dataSource={dataSource}
      onCancel={handleCancel}
      onAfterSave={handleAfterSave}
      withBorder={false}
    >
      <LoadingOverlay visible={isLoading} />
      <Tabs variant="pills" defaultValue="dados"
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Tabs.List style={{ flexShrink: 0 }}>
          <Tabs.Tab value="dados">Dados Gerais</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="dados" style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <ArchbaseEdit dataSource={dataSource} dataField="name" />
        </Tabs.Panel>
      </Tabs>
    </ArchbaseFormTemplate>
  </ValidationErrorsProvider>
)
```

### 5. Grids/Tabelas

Use `ArchbaseDataGrid` (NÃO `ArchbaseDataTable`):

```typescript
import { ArchbaseDataGrid, ArchbaseDataGridColumn, Columns } from '@archbase/components'

<ArchbaseDataGrid dataSource={dataSource} height={400}>
  <Columns>
    {/* IMPORTANTE: header (não caption), size (não width), dataType obrigatório */}
    <ArchbaseDataGridColumn
      dataField="name"
      header="Nome"
      size={200}
      dataType="text"
    />
  </Columns>
</ArchbaseDataGrid>
```

### 6. Select com Opções

Use `options` + `getOptionLabel` + `getOptionValue`:

```typescript
const statusOptions = [
  { id: 'ACTIVE', name: 'Ativo' },
  { id: 'INACTIVE', name: 'Inativo' }
]

<ArchbaseSelect
  dataSource={dataSource}
  dataField="status"
  options={statusOptions}
  getOptionLabel={(opt) => opt.name}
  getOptionValue={(opt) => opt.id}
/>
```

### 7. Navegação

Adicione rotas em `navigation/navigationData.tsx`:

```typescript
{
  label: 'Minha View',
  icon: IconPackage,
  link: '/minha-view',
  component: MinhaView,
}
```

## Documentação Adicional

Para documentação detalhada sobre componentes Archbase, consulte:

- `.claude/SKILL.md` - Referência completa de componentes
- `.claude/knowledge/` - Documentação modular por tema
- `.claude/examples/` - Exemplos de código funcionais

## Convenções de Código

### Nomenclatura

- **DTOs**: Sufixo `Dto` - `UserDto`, `ProductDto`
- **Services**: Sufixo `Service` - `UserService`, `ProductService`
- **Views**: Sufixo `View` - `UserListView`, `ProductFormView`
- **DataSources**: Prefixo `ds` - `dsUser`, `dsProducts`

### Imports

Use path aliases:
```typescript
import { UserService } from '@services/UserService'
import { UserDto } from '@domain/user/UserDto'
import { ErrorFallback } from '@utils/ErrorFallback'
```

### TypeScript

- Sempre use tipos explícitos
- Prefira interfaces sobre types para objetos
- Use `type` imports para decorators Inversify

## Resumo de Correções Críticas

| Errado | Correto |
|--------|---------|
| `ArchbaseDataTable` | `ArchbaseDataGrid` |
| `ArchbaseListTemplate` | `ArchbaseGridTemplate` (list views CRUD) |
| `caption` / `width` | `header` / `size` |
| `columns={[...]}` | `<Columns><ArchbaseDataGridColumn /></Columns>` |
| `dataSource.setData()` | `dataSource.open({ records })` ou V2: `dataSource.setRecords()` |
| `dataSource.post()` | `dataSource.save()` |
| `dataSource.append()` | `dataSource.insert()` |
| `dataSource.delete()` | `dataSource.remove()` |
| `service.findById()` | `service.findOne()` |
| `<ArchbaseSelect data={}>` | `<ArchbaseSelect options getOptionLabel getOptionValue>` |
| `isNewRecord` com `!entity.id` | `entity.isNew` |
| DTO como interface | DTO como **classe** com constructor e `isNew: boolean` |
| `configureHeaders` com Content-Type | `configureHeaders` retornando `{}` |
| `useArchbaseRemoteDataSource` + cast | `useArchbaseRemoteDataSourceV2` sem cast |
| `action === 'ADD'` | `action.toUpperCase() === 'ADD'` |

## Erros Comuns

### "width: 0px, height: 0px"
Em list views, usar `const { ref, height } = useElementSize()` do Mantine.

### "Property 'validator' does not exist"
Validator vai no DataSource: `dataSource.setValidator(...)`, não no FormTemplate.

### "Cannot modify in browsing state"
Chame `dataSource.edit()` antes de modificar.

### "Abstract method not implemented"
Service precisa implementar `getId()` e `isNewRecord()`.

### "Metadata not found"
Usar `import type { ArchbaseRemoteApiClient }` (com `type`).

## Links Úteis

- [Mantine v8 Docs](https://mantine.dev/)
- [React Query](https://tanstack.com/query)
- [Inversify](https://inversify.io/)
- [Tabler Icons](https://tabler-icons.io/)
