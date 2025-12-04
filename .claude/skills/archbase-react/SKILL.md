# Archbase React - Skill de Referência

Este documento contém a referência completa dos componentes e padrões do Archbase React.

**IMPORTANTE**: Esta documentação foi validada contra a biblioteca archbase-react-v3.

## 1. ArchbaseDataSource (Fundação)

### Conceito
O `ArchbaseDataSource` é o coração da integração de dados. Gerencia:
- Estado dos dados (browsing, editing, inserting)
- Binding bidirecional com componentes
- Validação via IDataSourceValidator
- Eventos de mudança
- Suporta detecção automática V1/V2

### Criação
```typescript
import { ArchbaseDataSource, ArchbaseValidator } from '@archbase/components'

// Construtor simples - apenas nome
const [dataSource] = useState(() =>
  new ArchbaseDataSource<UserDto, string>('dsUser')
)

// Com validação (configurar depois)
useEffect(() => {
  dataSource.setValidator(new ArchbaseValidator())
}, [])
```

### Estados do DataSource
- **BROWSING**: Navegação (padrão)
- **EDITING**: Edição de registro existente
- **INSERTING**: Inserção de novo registro

```typescript
dataSource.isBrowsing()   // Verificar estado
dataSource.isEditing()
dataSource.isInserting()
dataSource.isActive()     // DataSource ativo

dataSource.edit()         // Entrar em modo edição
dataSource.insert({...})  // Novo registro (NÃO use append!)
dataSource.save()         // Confirmar alterações (NÃO use post!)
dataSource.cancel()       // Cancelar alterações
```

### Operações Principais
```typescript
// CARREGAR DADOS - usar open(), NÃO setData()!
dataSource.open({ records: [user1, user2, user3] })
dataSource.open({
  records: data.content,
  grandTotalRecords: data.totalElements,
  currentPage: data.number,
  totalPages: data.totalPages,
  pageSize: data.size
})

// INSERIR - usar insert(), NÃO append()!
dataSource.insert(newUser)

// NAVEGAÇÃO
dataSource.first()
dataSource.last()
dataSource.next()
dataSource.prior()
dataSource.goToRecord(index)

// BUSCA - usar locate(), NÃO goToId()!
dataSource.locate({ id: '123' })
dataSource.locateByFilter((r) => r.email === 'test@email.com')

// MODIFICAÇÃO
dataSource.edit()
dataSource.setFieldValue('name', 'Novo Nome')
dataSource.save()  // NÃO use post()!

// EXCLUSÃO - usar remove(), NÃO delete()!
dataSource.remove()
dataSource.clear()  // NÃO use deleteAll()!

// OBTER DADOS
dataSource.getCurrentRecord()
dataSource.browseRecords()  // NÃO use getData()!
dataSource.getFieldValue('name')
dataSource.getTotalRecords()
```

### Binding com Componentes
```typescript
<ArchbaseEdit
  dataSource={dataSource}   // Referência ao DataSource
  dataField="name"          // Campo do DTO para bind
/>
```

---

## 2. Componentes de Input

### ArchbaseEdit
Input de texto com binding automático.

```typescript
<ArchbaseEdit
  dataSource={dataSource}
  dataField="name"
  label="Nome"
  placeholder="Digite o nome"
  required
  readOnly={isViewOnly}
  disabled={false}
  width="100%"
/>
```

### ArchbaseSelect
Select/dropdown com binding.

**IMPORTANTE**: Usar `options` + `getOptionLabel` + `getOptionValue`, NÃO `data`!

```typescript
interface StatusOption {
  id: string
  name: string
}

const statusOptions: StatusOption[] = [
  { id: 'ACTIVE', name: 'Ativo' },
  { id: 'INACTIVE', name: 'Inativo' }
]

<ArchbaseSelect<UserDto, string, StatusOption>
  dataSource={dataSource}
  dataField="status"
  label="Status"
  options={statusOptions}
  getOptionLabel={(opt) => opt.name}
  getOptionValue={(opt) => opt.id}
  required
  readOnly={isViewOnly}
  clearable
  searchable
/>
```

### ArchbaseLookupEdit
Lookup com busca remota.

**IMPORTANTE**: Usar `lookupValueDelegator`, NÃO lookupDataSource!

```typescript
<ArchbaseLookupEdit<UserDto, string, CategoryDto>
  dataSource={dataSource}
  dataField="category"
  lookupField="category.code"
  label="Categoria"
  lookupValueDelegator={async (value) => {
    return await categoryService.findByCode(value)
  }}
  onLookupResult={(category) => console.log('Found:', category)}
  onActionSearchExecute={() => openSearchModal()}
/>
```

### ArchbaseAsyncSelect
Select com busca assíncrona e paginação.

**IMPORTANTE**: Usar `getOptions` que retorna `OptionsResult`, NÃO onSearch!

```typescript
<ArchbaseAsyncSelect<UserDto, string, CustomerDto>
  dataSource={dataSource}
  dataField="customerId"
  label="Cliente"
  getOptionLabel={(c) => c.name}
  getOptionValue={(c) => c.id}
  getOptions={async (page, searchValue) => {
    const result = await customerService.search({ query: searchValue, page, size: 20 })
    return {
      options: result.content,
      page: result.number,
      totalPages: result.totalPages
    }
  }}
  debounceTime={300}
  minCharsToSearch={3}
/>
```

### ArchbaseSwitch
Toggle switch.

```typescript
<ArchbaseSwitch
  dataSource={dataSource}
  dataField="active"
  label="Ativo"
  onLabel="Sim"
  offLabel="Não"
  readOnly={isViewOnly}
/>
```

### ArchbaseNumberEdit
Input numérico.

**IMPORTANTE**: Usar `precision` (NÃO decimalScale), `minValue/maxValue` (NÃO min/max)!

```typescript
<ArchbaseNumberEdit
  dataSource={dataSource}
  dataField="quantity"
  label="Quantidade"
  minValue={0}
  maxValue={100}
  precision={2}
  thousandSeparator="."
  decimalSeparator=","
  prefix="R$ "
/>
```

### ArchbaseMaskEdit
Input com máscara.

```typescript
<ArchbaseMaskEdit
  dataSource={dataSource}
  dataField="phone"
  label="Telefone"
  mask="(00) 00000-0000"
/>

// Máscaras comuns:
// Telefone: "(00) 00000-0000"
// CPF: "000.000.000-00"
// CNPJ: "00.000.000/0000-00"
// CEP: "00000-000"
```

### ArchbaseDatePickerEdit
Seletor de data.

```typescript
<ArchbaseDatePickerEdit
  dataSource={dataSource}
  dataField="birthDate"
  label="Data de Nascimento"
  clearable
  minDate={new Date(1900, 0, 1)}
  maxDate={new Date()}
/>
```

### ArchbaseTextArea
Área de texto multilinha.

```typescript
<ArchbaseTextArea
  dataSource={dataSource}
  dataField="description"
  label="Descrição"
  rows={4}
  autosize
  minRows={3}
  maxRows={8}
/>
```

---

## 3. ArchbaseDataGrid

**IMPORTANTE**: O componente é `ArchbaseDataGrid`, NÃO ArchbaseDataTable!

### Uso com Children Pattern
```typescript
import {
  ArchbaseDataGrid,
  ArchbaseDataGridColumn,
  Columns
} from '@archbase/components'

<ArchbaseDataGrid
  dataSource={dataSource}
  height={400}
  highlightOnHover
  onCellDoubleClick={(params) => handleEdit(params.id)}
>
  <Columns>
    {/* IMPORTANTE: usar header (NÃO caption), size (NÃO width), dataType obrigatório */}
    <ArchbaseDataGridColumn
      dataField="name"
      header="Nome"
      size={200}
      dataType="text"
    />
    <ArchbaseDataGridColumn
      dataField="email"
      header="E-mail"
      size={250}
      dataType="text"
    />
    <ArchbaseDataGridColumn
      dataField="active"
      header="Status"
      size={100}
      dataType="boolean"
      align="center"
      render={(value) => (
        <Badge color={value ? 'green' : 'red'}>
          {value ? 'Ativo' : 'Inativo'}
        </Badge>
      )}
    />
    <ArchbaseDataGridColumn
      dataField="createdAt"
      header="Criado em"
      size={150}
      dataType="date"
    />
  </Columns>
</ArchbaseDataGrid>
```

### Tipos de Dados (dataType)
- `text`: Texto simples
- `integer`: Número inteiro
- `float`: Número decimal
- `currency`: Moeda
- `boolean`: Verdadeiro/Falso
- `date`: Data
- `datetime`: Data e hora
- `time`: Apenas hora
- `enum`: Enumeração (usar com enumValues)
- `image`: URL de imagem
- `uuid`: UUID

---

## 4. Templates

### ArchbaseFormTemplate
Template para formulários.

**IMPORTANTE**: NÃO use `useElementSize` - causa loop de renderização! Use CSS flexbox.

```typescript
// ✅ CORRETO: Sem useElementSize, usar ScrollArea com height: '100%'
<ArchbaseFormTemplate
  title="Cadastro de Usuário"
  dataSource={dataSource}
  isLoading={isLoading}
  isError={isError}
  error={error}
  withBorder={false}
  onCancel={handleCancel}
  onAfterSave={handleAfterSave}
>
  <ScrollArea style={{ height: '100%' }}>
    <LoadingOverlay visible={isLoading} />
    <Grid>
      <Grid.Col span={{ base: 12, sm: 8, md: 6 }}>
        <Stack>
          {/* Campos do form */}
        </Stack>
      </Grid.Col>
    </Grid>
  </ScrollArea>
</ArchbaseFormTemplate>

// ❌ ERRADO: useElementSize causa loop infinito!
// const { ref, height } = useElementSize()
// <ArchbaseFormTemplate innerRef={ref} ...>
//   <Paper style={{ height: safeHeight }}>
```

**Por quê evitar useElementSize?**
- O `ArchbaseFormTemplate` usa `forceUpdate()` internamente após eventos do DataSource
- O `useElementSize` detecta mudança de tamanho e causa re-render
- Isso cria um loop: forceUpdate → render → size change → re-render → ...

### ArchbasePanelTemplate
Template para listas/painéis.

**IMPORTANTE**: NÃO existe ArchbaseListTemplate! Usar ArchbasePanelTemplate!

```typescript
<ArchbasePanelTemplate
  innerRef={ref}
  title="Usuários"
  isLoading={isLoading}
  isError={isError}
  error={error}
  onNewRecord={handleNew}
>
  <ArchbaseDataGrid dataSource={dataSource} ... />
</ArchbasePanelTemplate>
```

---

## 5. Services Remotos

### Service Base

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
    return entity.__isNew === true  // ✅ Usar __isNew, NÃO verificar id vazio
  }
}
```

**IMPORTANTE sobre `isNewRecord()`:**
- Use `entity.__isNew === true`
- **NÃO** use `!entity.id || entity.id === ''` quando DTOs geram UUID no `newInstance()`
- O campo `__isNew` é setado no DTO e indica explicitamente se é um registro novo

### Métodos Herdados
```typescript
// CORRETO: usar findOne, NÃO findById!
findOne(id: ID): Promise<T>

// Paginação
findAll(page: number, size: number): Promise<Page<T>>

// CRUD
save<R>(entity: T): Promise<R>  // Usa isNewRecord internamente
delete(id: ID): Promise<void>
```

### Uso no Componente
```typescript
const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)

// CORRETO
const user = await userService.findOne(id)

// ERRADO - não existe findById!
// const user = await userService.findById(id)
```

---

## 6. Form Pattern Correto

### Comparação de Action (IMPORTANTE!)

**CRÍTICO**: As constantes de action no sistema são em **minúsculas** (`'add'`, `'edit'`, `'view'`), mas o padrão antigo usava maiúsculas. Para evitar bugs, **sempre use comparação case-insensitive**:

```typescript
// CORRETO: Comparação case-insensitive
const isAddAction = action.toUpperCase() === 'ADD'
const isEditAction = action.toUpperCase() === 'EDIT'
const isViewAction = action.toUpperCase() === 'VIEW'

// ERRADO: Comparação direta pode falhar se action vier em minúsculas
// if (action === 'ADD') { ... }  // ❌ Falha se action === 'add'
```

### Exemplo Completo (Padrão useArchbaseRemoteDataSource)

```typescript
import { ScrollArea, Grid, Stack, LoadingOverlay } from '@mantine/core'
import { useArchbaseRemoteDataSource, useArchbaseRemoteServiceApi, useArchbaseStore } from '@archbase/data'
import { ArchbaseFormTemplate } from '@archbase/template'
import { ArchbaseDialog, ArchbaseNotifications, ArchbaseEdit } from '@archbase/components'
import { useArchbaseNavigationListener } from '@archbase/admin'

export function UserForm() {
  const { t } = useArchbaseTranslation()
  const location = useLocation()
  const { id } = useParams()
  const validator = useArchbaseValidator()
  const [searchParams] = useSearchParams()
  const action = searchParams.get('action') || ''

  // Store com nome fixo (NÃO usar ID dinâmico para evitar problemas)
  const templateStore = useArchbaseStore('userFormStore')
  const { closeAllowed } = useArchbaseNavigationListener(location.pathname, () => {
    templateStore.clearAllValues()
    closeAllowed()
  })
  const serviceApi = useArchbaseRemoteServiceApi<UserService>(API_TYPE.User)

  // CORRETO: Comparação case-insensitive para action
  const isAddAction = action.toUpperCase() === 'ADD'
  const isEditAction = action.toUpperCase() === 'EDIT'
  const isViewAction = action.toUpperCase() === 'VIEW'

  // CORRETO: useArchbaseRemoteDataSource com onLoadComplete
  const { dataSource, isLoading } = useArchbaseRemoteDataSource<UserDto, string>({
    name: 'dsUser',
    label: String(t('gestor-rq-admin:Usuário')),
    service: serviceApi,
    store: templateStore,
    pageSize: 50,
    loadOnStart: !isAddAction,
    validator,
    id: isEditAction || isViewAction ? id : undefined,
    onLoadComplete: (dataSource) => {
      // ✅ SEM forceUpdate() - NÃO é necessário!
      if (action.toUpperCase() === 'EDIT') {
        dataSource.edit()
      } else if (action.toUpperCase() === 'ADD') {
        const newRecord = UserDto.newInstance()  // ✅ Usa __isNew: true e UUID
        dataSource.insert(newRecord)
      }
    },
    onError: (error, origin) => {
      ArchbaseNotifications.showError(String(t('gestor-rq-admin:Atenção')), error, origin)
    }
  })

  const handleAfterSave = () => {
    templateStore.clearAllValues()
    closeAllowed()
  }

  const handleCancel = () => {
    if (!isViewAction) {
      ArchbaseDialog.showConfirmDialogYesNo(
        String(t('gestor-rq-admin:Confirme')),
        String(t('gestor-rq-admin:Deseja cancelar?')),
        () => {
          if (!dataSource.isBrowsing()) {
            dataSource.cancel()
          }
          templateStore.clearAllValues()
          closeAllowed()
        },
        () => { }
      )
    } else {
      templateStore.clearAllValues()
      closeAllowed()
    }
  }

  // ✅ CORRETO: Sem useElementSize, usar ScrollArea
  return (
    <ArchbaseFormTemplate
      title={String(t('gestor-rq-admin:Usuário'))}
      dataSource={dataSource}
      onCancel={handleCancel}
      onAfterSave={handleAfterSave}
      withBorder={false}
    >
      <ScrollArea style={{ height: '100%' }}>
        <LoadingOverlay visible={isLoading} />
        <Grid>
          <Grid.Col span={{ base: 12, sm: 8, md: 6 }}>
            <Stack>
              <ArchbaseEdit<UserDto, string>
                label={String(t('gestor-rq-admin:Nome'))}
                dataSource={dataSource}
                dataField="nome"
                placeholder={String(t('gestor-rq-admin:Digite o nome'))}
                required
              />
              {/* Mais campos... */}
            </Stack>
          </Grid.Col>
        </Grid>
      </ScrollArea>
    </ArchbaseFormTemplate>
  )
}
```

---

## 7. Resumo de Correções Críticas

| Documentação Anterior (ERRADO) | Correto |
|-------------------------------|---------|
| `ArchbaseDataTable` | `ArchbaseDataGrid` |
| `ArchbaseListTemplate` | `ArchbasePanelTemplate` |
| `columns={[...]}` (array) | `<Columns><ArchbaseDataGridColumn /></Columns>` |
| `caption` | `header` |
| `width` | `size` |
| `onRowDoubleClick` | `onCellDoubleClick` |
| `dataSource.setData([])` | `dataSource.open({ records: [] })` |
| `dataSource.post()` | `dataSource.save()` |
| `dataSource.append({})` | `dataSource.insert({})` |
| `dataSource.delete()` | `dataSource.remove()` |
| `dataSource.goToId(id)` | `dataSource.locate({ id })` |
| `dataSource.getData()` | `dataSource.browseRecords()` |
| `service.findById(id)` | `service.findOne(id)` |
| `<ArchbaseSelect data={[]}` | `<ArchbaseSelect options={[]} getOptionLabel getOptionValue` |
| `<ArchbaseLookupEdit lookupDataSource` | `<ArchbaseLookupEdit lookupValueDelegator` |
| `<ArchbaseAsyncSelect onSearch` | `<ArchbaseAsyncSelect getOptions` |
| `<ArchbaseNumberEdit min max decimalScale` | `minValue maxValue precision` |
| `{ ref, height } = useArchbaseSize()` | `[width, height] = useArchbaseSize(ref)` |
| Sem getId/isNewRecord | `getId()` e `isNewRecord()` são OBRIGATÓRIOS |
| `action === 'ADD'` (direta) | `action.toUpperCase() === 'ADD'` (case-insensitive) |
| `forceUpdate()` no onLoadComplete | **NÃO usar** - causa loop de renderização |
| DTO sem UUID no newInstance() | Sempre gerar `id: uuidv4()` no newInstance() |
| DTO sem `__isNew` | Adicionar `__isNew: true` no newInstance() |
| `isNewRecord` verificando id vazio | Usar `entity.__isNew === true` |
| `useElementSize` no form | **NÃO usar** - usar `ScrollArea` com `height: '100%'` |
| `innerRef={ref}` no FormTemplate | **NÃO usar** quando não precisa medir altura |
| Store com ID dinâmico `store${id}` | Usar nome fixo `'formStore'` |

---

## 8. DTOs - Padrões Importantes

### Campo `__isNew` e Geração de UUID (CRÍTICO!)

**SEMPRE** inclua o campo `__isNew` e gere um UUID no método `newInstance()` dos DTOs:

```typescript
import { v4 as uuidv4 } from 'uuid'
import { IsOptional, IsBoolean, IsString } from 'class-validator'

export class EntityDto {
  @IsOptional()
  @IsString()
  id?: string

  @IsOptional()
  @IsBoolean()
  __isNew?: boolean  // ✅ CAMPO OBRIGATÓRIO para identificar novos registros

  // ...outros campos...

  constructor(data: any = {}) {
    this.id = data.id
    this.__isNew = data.__isNew ?? false  // ✅ Default false para registros existentes
    // ...outros campos...
  }

  static newInstance = () => {
    return new EntityDto({
      id: uuidv4(),      // ✅ Gerar UUID para o ID
      __isNew: true,     // ✅ Marcar como novo registro
      // ...outros campos padrão...
      ativo: true
    })
  }
}
```

**Por quê?**
- O `id` é gerado com UUID para evitar colisões no backend
- O `__isNew` é usado pelo `isNewRecord()` do Service para decidir se faz POST ou PUT
- Sem `__isNew`, o sistema não consegue distinguir um registro novo de um existente

### NÃO usar forceUpdate() no onLoadComplete (CRÍTICO!)

O `forceUpdate()` dentro do callback `onLoadComplete` causa **loop de renderização infinito**:

```typescript
// ❌ ERRADO - Causa loop infinito!
onLoadComplete: (dataSource) => {
  if (isEditAction) {
    dataSource.edit()
  }
  forceUpdate()  // ❌ NÃO FAZER ISSO!
}

// ✅ CORRETO - O DataSource notifica automaticamente
onLoadComplete: (dataSource) => {
  if (isEditAction) {
    dataSource.edit()
  }
  // Sem forceUpdate() - não é necessário
}
```

**Por quê?** O `ArchbaseDataSource` já notifica os componentes automaticamente quando seu estado muda.

---

## 9. Checklist de Desenvolvimento

### Forms (usando useArchbaseRemoteDataSource)
- [ ] **CRÍTICO**: NÃO usar `useElementSize` - causa loop de renderização!
- [ ] Usar `ScrollArea` com `style={{ height: '100%' }}` para scroll
- [ ] Usar `useArchbaseStore('nomeFixo')` - NÃO usar ID dinâmico
- [ ] Usar `useArchbaseRemoteDataSource` com `onLoadComplete`
- [ ] **CRÍTICO**: NÃO usar `forceUpdate()` no `onLoadComplete`
- [ ] **CRÍTICO**: Comparar action com `toUpperCase()` (ex: `action.toUpperCase() === 'ADD'`)
- [ ] No `onLoadComplete`: chamar `dataSource.edit()` para EDIT, `dataSource.insert(Dto.newInstance())` para ADD
- [ ] Todos os campos com `dataSource` e `dataField`
- [ ] Usar `onAfterSave` para limpar store e fechar

### Views/Grids
- [ ] Usar `ArchbaseDataGrid` (não DataTable)
- [ ] Usar `ArchbasePanelTemplate` (não ListTemplate)
- [ ] Colunas com children pattern `<Columns><ArchbaseDataGridColumn /></Columns>`
- [ ] Props de coluna: `header`, `size`, `dataType` (obrigatório)
- [ ] Evento: `onCellDoubleClick` (não onRowDoubleClick)

### Services
- [ ] `type` import para `ArchbaseRemoteApiClient`
- [ ] Implementar `getEndpoint()` - OBRIGATÓRIO
- [ ] Implementar `configureHeaders()` - OBRIGATÓRIO (pode retornar `{}`)
- [ ] Implementar `getId(entity)` - OBRIGATÓRIO
- [ ] Implementar `isNewRecord(entity)` usando `entity.__isNew === true` - OBRIGATÓRIO
- [ ] OPCIONAL: `transform(data)` para converter API → DTO
- [ ] Usar `findOne()` (não findById)
- [ ] Endpoint no plural (`/api/v1/users`)

### Selects
- [ ] Usar `options` + `getOptionLabel` + `getOptionValue` (não `data`)
- [ ] ArchbaseAsyncSelect: usar `getOptions` (não `onSearch`)
- [ ] ArchbaseLookupEdit: usar `lookupValueDelegator` (não lookupDataSource)

### DTOs
- [ ] Importar `import { v4 as uuidv4 } from 'uuid'`
- [ ] **CRÍTICO**: Adicionar campo `__isNew?: boolean`
- [ ] No construtor: `this.__isNew = data.__isNew ?? false`
- [ ] **CRÍTICO**: No `newInstance()`: `id: uuidv4()` e `__isNew: true`
- [ ] Definir valores padrão sensatos (ativo: true, etc.)
