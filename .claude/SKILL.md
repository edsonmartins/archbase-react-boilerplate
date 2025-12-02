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

```typescript
// CORRETO: useArchbaseSize retorna [width, height]
const ref = useRef<HTMLDivElement>(null)
const [width, height] = useArchbaseSize(ref)
const safeHeight = height > 0 ? height - 130 : 600

<ArchbaseFormTemplate
  innerRef={ref}              // ESSENCIAL!
  title="Cadastro de Usuário"
  dataSource={dataSource}
  isLoading={isLoading}
  isError={isError}
  error={error}
  withBorder={false}
  onCancel={handleCancel}
  onBeforeSave={handleSave}
>
  <Paper ref={ref} withBorder style={{ height: safeHeight }}>
    {/* Campos do form */}
  </Paper>
</ArchbaseFormTemplate>
```

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

**IMPORTANTE**: Requer implementação de `getId()` e `isNewRecord()`!

```typescript
import { injectable, inject } from 'inversify'
import { ArchbaseRemoteApiService } from '@archbase/data'
import type { ArchbaseRemoteApiClient } from '@archbase/data'  // SEMPRE type import!
import { ARCHBASE_IOC_API_TYPE } from '@archbase/core'

@injectable()
export class UserService extends ArchbaseRemoteApiService<UserDto, string> {
  constructor(
    @inject(ARCHBASE_IOC_API_TYPE.ApiClient) client: ArchbaseRemoteApiClient
  ) {
    super(client)
  }

  // OBRIGATÓRIO: Endpoint (SEMPRE PLURAL!)
  protected getEndpoint(): string {
    return '/api/v1/users'
  }

  // OBRIGATÓRIO: Extrair ID
  public getId(entity: UserDto): string {
    return entity.id
  }

  // OBRIGATÓRIO: Verificar se é novo
  public isNewRecord(entity: UserDto): boolean {
    return !entity.id || entity.id === ''
  }

  // OBRIGATÓRIO: Headers
  protected configureHeaders(): Record<string, string> {
    return { 'Content-Type': 'application/json' }
  }
}
```

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

```typescript
export function UserForm({ id, action, onClose }: FormProps) {
  // CORRETO: useArchbaseSize retorna [width, height]
  const ref = useRef<HTMLDivElement>(null)
  const [width, height] = useArchbaseSize(ref)
  const safeHeight = height > 0 ? height - 130 : 600

  // CORRETO: construtor simples
  const [dataSource] = useState(() =>
    new ArchbaseDataSource<UserDto, string>('dsUser')
  )

  const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)

  // CORRETO: usar findOne, não findById
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.findOne(id!),
    enabled: !!id && action !== 'NEW'
  })

  const saveMutation = useMutation({
    mutationFn: (user: UserDto) => userService.save(user),
    onSuccess: () => {
      dataSource.save()  // NÃO use post()!
      onClose()
    }
  })

  useEffect(() => {
    if (data) {
      dataSource.open({ records: [data] })  // NÃO use setData()!
      if (action === 'EDIT') dataSource.edit()
    } else if (action === 'NEW') {
      dataSource.insert({ active: true } as UserDto)  // NÃO use append()!
    }
  }, [data, action])

  const handleSave = async () => {
    const errors = dataSource.validate()
    if (errors && errors.length > 0) return
    const current = dataSource.getCurrentRecord()
    if (current) saveMutation.mutate(current)
  }

  const isViewOnly = action === 'VIEW'

  return (
    <ArchbaseFormTemplate
      innerRef={ref}
      title={action === 'NEW' ? 'Novo Usuário' : 'Editar Usuário'}
      dataSource={dataSource}
      isLoading={isLoading || saveMutation.isPending}
      onCancel={onClose}
      onBeforeSave={handleSave}
    >
      <Paper ref={ref} withBorder style={{ height: safeHeight }}>
        <Box p="md">
          <ArchbaseEdit
            dataSource={dataSource}
            dataField="name"
            label="Nome"
            required
            readOnly={isViewOnly}
          />
        </Box>
      </Paper>
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

---

## 8. Checklist de Desenvolvimento

### Forms
- [ ] Usar `const ref = useRef(); [width, height] = useArchbaseSize(ref)`
- [ ] Calcular `safeHeight = height - 130`
- [ ] Passar `innerRef={ref}` para ArchbaseFormTemplate
- [ ] DataSource com construtor simples: `new ArchbaseDataSource('name')`
- [ ] Carregar dados com `dataSource.open({ records: [...] })`
- [ ] Novo registro com `dataSource.insert({...})`
- [ ] Confirmar com `dataSource.save()`
- [ ] Todos os campos com `dataSource` e `dataField`

### Views/Grids
- [ ] Usar `ArchbaseDataGrid` (não DataTable)
- [ ] Usar `ArchbasePanelTemplate` (não ListTemplate)
- [ ] Colunas com children pattern `<Columns><ArchbaseDataGridColumn /></Columns>`
- [ ] Props de coluna: `header`, `size`, `dataType` (obrigatório)
- [ ] Evento: `onCellDoubleClick` (não onRowDoubleClick)

### Services
- [ ] `type` import para `ArchbaseRemoteApiClient`
- [ ] Implementar `getId(entity)` - OBRIGATÓRIO
- [ ] Implementar `isNewRecord(entity)` - OBRIGATÓRIO
- [ ] Usar `findOne()` (não findById)
- [ ] Endpoint no plural (`/api/v1/users`)

### Selects
- [ ] Usar `options` + `getOptionLabel` + `getOptionValue` (não `data`)
- [ ] ArchbaseAsyncSelect: usar `getOptions` (não `onSearch`)
- [ ] ArchbaseLookupEdit: usar `lookupValueDelegator` (não lookupDataSource)
