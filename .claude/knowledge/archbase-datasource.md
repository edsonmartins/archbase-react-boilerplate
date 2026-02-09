# ArchbaseDataSource - Guia Completo

## Conceito Central

O `ArchbaseDataSource` é a abstração central para gerenciamento de dados no Archbase. Ele:
- Gerencia estado dos dados (browsing, editing, inserting)
- Fornece binding bidirecional com componentes
- Integra validação via IDataSourceValidator
- Emite eventos de mudança
- Suporta detecção automática V1/V2

## Versões Disponíveis

| Versão | Classe/Hook | Uso Recomendado |
|--------|-------------|-----------------|
| V1 | `ArchbaseDataSource` + `useArchbaseRemoteDataSource` | Código legado |
| V2 | `ArchbaseRemoteDataSourceV2` + `useArchbaseRemoteDataSourceV2` | **Novos projetos** |

### Interface Comum: IArchbaseDataSourceBase<T>

Tanto V1 quanto V2 implementam a interface `IArchbaseDataSourceBase<T>`, permitindo que componentes funcionem com ambas as versões sem cast:

```typescript
import type { IArchbaseDataSourceBase } from '@archbase/data'

// Componentes podem aceitar qualquer versão
interface MyComponentProps<T> {
  dataSource: IArchbaseDataSourceBase<T>
  dataField: string
}
```

## Criação

### Básica
```typescript
import { ArchbaseDataSource } from '@archbase/data'

// Criar instância passando apenas o nome
const dataSource = new ArchbaseDataSource<UserDto, string>('dsUser')
```

### Com Validação (class-validator)
```typescript
import { ArchbaseValidator } from '@archbase/core'

const validator = new ArchbaseValidator()

// Validador é passado via setValidator ou no open()
const dataSource = new ArchbaseDataSource<UserDto, string>('dsUser')
dataSource.setValidator(validator)
```

### Com React (useState)
```typescript
const [dataSource] = useState(() =>
  new ArchbaseDataSource<UserDto, string>('dsUser')
)
```

> **IMPORTANTE:** Use `useState` com função para criar apenas uma vez.

## Carregando Dados

### Método open() - CORRETO
```typescript
// Carregar array de registros
dataSource.open({ records: [user1, user2, user3] })

// Carregar registro único
dataSource.open({ records: [singleUser] })

// Com opções adicionais
dataSource.open({
  records: data,
  grandTotalRecords: totalFromServer,
  currentPage: 1,
  totalPages: 10,
  pageSize: 20
})
```

### Uso com React Query
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: () => userService.findAll(0, 100)
})

useEffect(() => {
  if (data?.content) {
    dataSource.open({ records: data.content })
  }
}, [data])
```

## Estados

### BROWSING (Padrão)
Estado de navegação. Não permite modificações diretas.

```typescript
dataSource.isBrowsing()  // true quando não está editando nem inserindo
dataSource.isActive()    // true quando datasource está ativo
```

### EDITING
Editando registro existente.

```typescript
dataSource.edit()        // Entrar em edição do registro atual
dataSource.isEditing()   // true quando em modo edição
```

### INSERTING
Inserindo novo registro.

```typescript
dataSource.insert({ name: '' } as UserDto)  // Inserir novo registro
dataSource.isInserting()                     // true quando inserindo
```

### Estados de Posição
```typescript
dataSource.isBOF()  // true se no início (Before Of File)
dataSource.isEOF()  // true se no fim (End Of File)
```

## Operações de Dados

### Navegação
```typescript
dataSource.first()              // Ir para primeiro registro
dataSource.last()               // Ir para último registro
dataSource.next()               // Próximo registro
dataSource.prior()              // Registro anterior
dataSource.goToRecord(index)    // Ir para índice específico
```

### Buscar Registro
```typescript
// Buscar por campo(s)
dataSource.locate({ id: '123' })
dataSource.locate({ name: 'João', active: true })

// Buscar com filtro customizado
dataSource.locateByFilter((record) => record.email === 'teste@email.com')

// Ir para registro específico por referência
dataSource.gotoRecordByData(recordObject)
```

### Modificação
```typescript
// 1. Entrar em modo edição
dataSource.edit()

// 2. Modificar campo(s)
dataSource.setFieldValue('name', 'Novo Nome')
dataSource.setFieldValue('email', 'novo@email.com')

// 3. Confirmar alterações
dataSource.save()

// OU Cancelar alterações
dataSource.cancel()
```

### Inserção
```typescript
// 1. Inserir novo registro (entra automaticamente em modo inserting)
dataSource.insert({ active: true } as UserDto)

// 2. Preencher campos
dataSource.setFieldValue('name', 'Nome')
dataSource.setFieldValue('email', 'email@teste.com')

// 3. Salvar
dataSource.save()
```

### Exclusão
```typescript
dataSource.remove()  // Remove o registro atual
dataSource.clear()   // Limpa todos os dados
```

## Obter Dados

### Registro Atual
```typescript
const current = dataSource.getCurrentRecord()  // Retorna T | undefined
const index = dataSource.getCurrentIndex()     // Retorna número (-1 se BOF)
```

### Todos os Registros
```typescript
const allRecords = dataSource.browseRecords()  // Retorna T[] filtrado
```

### Contadores
```typescript
const count = dataSource.getTotalRecords()       // Total de registros filtrados
const grandTotal = dataSource.getGrandTotalRecords()  // Total sem filtro (do servidor)
```

### Valores de Campo
```typescript
const name = dataSource.getFieldValue('name')
const age = dataSource.getFieldValue('age', 0)  // Com valor default
```

### Paginação
```typescript
const currentPage = dataSource.getCurrentPage()
const totalPages = dataSource.getTotalPages()
dataSource.goToPage(2)  // Ir para página específica
```

## Filtros Client-Side

```typescript
// Adicionar filtro
const myFilter = (record: UserDto) => record.active === true
dataSource.addFilter(myFilter)

// Remover filtro específico
dataSource.removeFilter(myFilter)

// Limpar todos os filtros
dataSource.clearFilters()
```

## Validação

### Configurar Validador
```typescript
import { ArchbaseValidator } from '@archbase/core'

const validator = new ArchbaseValidator()
dataSource.setValidator(validator)
```

### Validar Registro
```typescript
// Valida o registro atual
const errors = dataSource.validate()

// errors é array de DataSourceValidationError:
// { fieldName: string, errorMessage: string, debugMessage: string }
```

### Entidade com class-validator
```typescript
import { IsNotEmpty, IsEmail } from 'class-validator'

export class UserDto {
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  name: string

  @IsEmail({}, { message: 'E-mail inválido' })
  email: string
}
```

## Eventos

### Event Names
```typescript
import { DataSourceEventNames } from '@archbase/data'

DataSourceEventNames.dataChanged      // Dados alterados
DataSourceEventNames.recordChanged    // Registro atual mudou
DataSourceEventNames.fieldChanged     // Campo alterado
DataSourceEventNames.afterScroll      // Após navegação
DataSourceEventNames.beforeEdit       // Antes de entrar em edição
DataSourceEventNames.afterEdit        // Após entrar em edição
DataSourceEventNames.beforeSave       // Antes de salvar
DataSourceEventNames.afterSave        // Após salvar
DataSourceEventNames.beforeCancel     // Antes de cancelar
DataSourceEventNames.afterCancel      // Após cancelar
DataSourceEventNames.beforeRemove     // Antes de remover
DataSourceEventNames.afterRemove      // Após remover
DataSourceEventNames.beforeInsert     // Antes de inserir
DataSourceEventNames.afterInsert      // Após inserir
DataSourceEventNames.onError          // Erro geral
DataSourceEventNames.onFieldError     // Erro de campo específico
```

### Listener de Mudanças
```typescript
const listener = (event: DataSourceEvent<UserDto>) => {
  console.log('Event type:', event.type)
  console.log('Record:', event.record)
}

// Adicionar listener
dataSource.addListener(listener)

// Remover listener
dataSource.removeListener(listener)

// OU usar on/off
dataSource.on('afterSave', (event) => { ... })
dataSource.off('afterSave', handler)
```

### Listener de Campo Específico
```typescript
// Ouvir mudanças em campo específico
dataSource.addFieldChangeListener('name', (value, oldValue) => {
  console.log('Name changed from', oldValue, 'to', value)
})

// Remover listener de campo
dataSource.removeFieldChangeListener('name', handler)
```

### Controle de Listeners
```typescript
dataSource.disabledAllListeners()  // Desabilitar temporariamente
dataSource.enableAllListeners()    // Reabilitar
```

## Integração com React Query

### Carregar Dados
```typescript
function useUserDataSource(id?: string) {
  const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)

  const [dataSource] = useState(() =>
    new ArchbaseDataSource<UserDto, string>('dsUser')
  )

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.findOne(id!),
    enabled: !!id
  })

  useEffect(() => {
    if (data) {
      dataSource.open({ records: [data] })
      dataSource.edit()  // Se for para edição
    }
  }, [data])

  return { dataSource, isLoading, isError, error }
}
```

### Salvar Dados
```typescript
const queryClient = useQueryClient()
const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)

const saveMutation = useMutation({
  mutationFn: (user: UserDto) => userService.save(user),
  onSuccess: (savedUser) => {
    dataSource.setFieldValue('id', savedUser.id)
    dataSource.save()  // Confirmar no datasource
    queryClient.invalidateQueries(['users'])
  }
})

const handleSave = async () => {
  const errors = dataSource.validate()
  if (errors && errors.length > 0) return

  const currentData = dataSource.getCurrentRecord()
  if (currentData) {
    saveMutation.mutate(currentData)
  }
}
```

## Padrão Completo de Form

```typescript
export function UserForm({ id, action, onClose }: FormProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, height] = useArchbaseSize(ref)
  const safeHeight = height > 0 ? height - 130 : 600

  const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)
  const queryClient = useQueryClient()

  // DataSource
  const [dataSource] = useState(() =>
    new ArchbaseDataSource<UserDto, string>('dsUser')
  )

  // Carregar dados
  const { data, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.findOne(id!),
    enabled: !!id && action !== 'NEW'
  })

  // Popular DataSource quando dados chegarem
  useEffect(() => {
    if (data) {
      dataSource.open({ records: [data] })
      if (action === 'EDIT') dataSource.edit()
    } else if (action === 'NEW') {
      dataSource.insert({ active: true } as UserDto)
    }
  }, [data, action])

  // Mutation para salvar
  const saveMutation = useMutation({
    mutationFn: (user: UserDto) => userService.save(user),
    onSuccess: () => {
      dataSource.save()
      queryClient.invalidateQueries(['users'])
      onClose()
    }
  })

  // Handler de save
  const handleSave = async () => {
    const errors = dataSource.validate()
    if (errors && errors.length > 0) return

    const current = dataSource.getCurrentRecord()
    if (current) {
      saveMutation.mutate(current)
    }
  }

  return (
    <ArchbaseFormTemplate
      innerRef={ref}
      dataSource={dataSource}
      isLoading={isLoading}
      onBeforeSave={handleSave}
      onCancel={onClose}
    >
      <Paper ref={ref} withBorder style={{ height: safeHeight }}>
        <ArchbaseEdit dataSource={dataSource} dataField="name" />
      </Paper>
    </ArchbaseFormTemplate>
  )
}
```

## Propriedades do DataSource

| Propriedade | Tipo | Descrição |
|-------------|------|-----------|
| `uuid` | string | Identificador único da instância |
| `name` | string | Nome do DataSource |
| `label` | string | Label para exibição |
| `lastDataChangedAt` | number | Timestamp da última alteração |
| `lastDataBrowsingOn` | number | Timestamp da última navegação |

## Checklist de Uso

- [ ] Criar DataSource com `useState` e função
- [ ] Usar `open({ records: [...] })` para carregar dados
- [ ] Chamar `edit()` antes de modificar registro existente
- [ ] Chamar `insert({...})` para novo registro
- [ ] Chamar `save()` após modificações bem-sucedidas
- [ ] Chamar `cancel()` se usuário desistir
- [ ] Usar `validate()` antes de enviar para API
- [ ] Usar `browseRecords()` para obter todos os registros
- [ ] Usar `getCurrentRecord()` para obter registro atual

## Erros Comuns

### "Cannot modify in browsing state"
**Solução:** Chamar `edit()` ou `insert()` primeiro.

```typescript
// ERRADO
dataSource.setFieldValue('name', 'Novo')

// CORRETO
dataSource.edit()
dataSource.setFieldValue('name', 'Novo')
```

### "Validator errors not showing"
**Solução:** Configurar validator no DataSource.

```typescript
const validator = new ArchbaseValidator()
dataSource.setValidator(validator)
```

### "Fields not updating in UI"
**Solução:** Verificar que componentes têm `dataSource` e `dataField`.

```typescript
<ArchbaseEdit
  dataSource={dataSource}  // Obrigatório
  dataField="name"         // Obrigatório
/>
```

### "Data not loading"
**Solução:** Usar `open()` em vez de `setData()`.

```typescript
// ERRADO
dataSource.setData(records)

// CORRETO
dataSource.open({ records: records })
```

---

## useArchbaseRemoteDataSourceV2 - PADRÃO RECOMENDADO

O hook `useArchbaseRemoteDataSourceV2` é o **padrão recomendado para novos projetos**. Ele integra automaticamente com o service para operações CRUD.

### Exemplo Completo de Form com V2

```typescript
import { useEffect, useRef } from 'react'
import { Grid, Stack, LoadingOverlay } from '@mantine/core'
import {
  useArchbaseRemoteDataSourceV2,
  useArchbaseRemoteServiceApi,
  useArchbaseStore
} from '@archbase/data'
import {
  ArchbaseDialog,
  ArchbaseNotifications,
  ArchbaseEdit,
  ArchbaseSwitch,
  ArchbaseNumberEdit,
  ArchbaseTextArea
} from '@archbase/components'
import { ArchbaseFormTemplate } from '@archbase/template'
import { useArchbaseValidator, useArchbaseTranslation } from '@archbase/core'
import { useArchbaseNavigationListener } from '@archbase/admin'
import { useLocation, useParams } from 'react-router'
import { useSearchParams } from 'react-router-dom'

export function MecanicoForm() {
  const { t } = useArchbaseTranslation()
  const location = useLocation()
  const { id } = useParams()
  const validator = useArchbaseValidator()
  const [searchParams] = useSearchParams()
  const action = searchParams.get('action') || ''

  const templateStore = useArchbaseStore('mecanicoFormStore')
  const { closeAllowed } = useArchbaseNavigationListener(location.pathname, () => {
    templateStore.clearAllValues()
    closeAllowed()
  })
  const serviceApi = useArchbaseRemoteServiceApi<MecanicoService>(API_TYPE.Mecanico)

  const isAddAction = action.toUpperCase() === 'ADD'
  const isEditAction = action.toUpperCase() === 'EDIT'
  const isViewAction = action.toUpperCase() === 'VIEW'

  // ✅ useArchbaseRemoteDataSourceV2 - Padrão recomendado
  const {
    dataSource,
    isLoading
  } = useArchbaseRemoteDataSourceV2<MecanicoDto>({
    name: 'dsMecanico',
    label: String(t('my-app:Mecânico')),
    service: serviceApi,
    pageSize: 50,
    defaultSortFields: ['nome'],
    validator,
    onError: (error) => {
      ArchbaseNotifications.showError(String(t('my-app:Atenção')), error)
    }
  })

  // Flag para garantir que loadRecord só execute uma vez
  const hasLoadedRef = useRef(false)

  // Carrega o registro apenas uma vez quando o componente monta
  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    const loadRecord = async () => {
      if (isAddAction) {
        dataSource.setRecords([])
        const newRecord = MecanicoDto.newInstance()
        dataSource.insert(newRecord)
      } else if ((isEditAction || isViewAction) && id) {
        try {
          const record = await serviceApi.findOne(id)
          const dto = new MecanicoDto(record)
          dataSource.setRecords([dto])
          if (isEditAction) {
            dataSource.edit()
          }
        } catch (error: any) {
          ArchbaseNotifications.showError(String(t('my-app:Atenção')), String(error))
        }
      }
    }

    loadRecord()
  }, [])

  const handleAfterSave = () => {
    templateStore.clearAllValues()
    closeAllowed()
  }

  const handleCancel = () => {
    if (!isViewAction) {
      ArchbaseDialog.showConfirmDialogYesNo(
        String(t('my-app:Confirme')),
        String(t('my-app:Deseja cancelar a edição/inserção?')),
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

  // ✅ dataSource pode ser passado diretamente para componentes
  // Sem necessidade de cast 'as any'
  return (
    <ArchbaseFormTemplate
      dataSource={dataSource}
      onCancel={handleCancel}
      onAfterSave={handleAfterSave}
      withBorder={false}
    >
      <LoadingOverlay visible={isLoading} />
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="md">
            <ArchbaseEdit<MecanicoDto, string>
              label={String(t('my-app:Nome'))}
              dataSource={dataSource}
              dataField="nome"
              placeholder={String(t('my-app:Digite o nome'))}
              required
            />
            <ArchbaseNumberEdit<MecanicoDto, number>
              label={String(t('my-app:Valor/Hora (R$)'))}
              dataSource={dataSource}
              dataField="valorHora"
              precision={2}
              minValue={0}
              prefix="R$ "
              width={180}
            />
            <ArchbaseSwitch<MecanicoDto, boolean>
              label={String(t('my-app:Ativo'))}
              dataSource={dataSource}
              dataField="ativo"
            />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <ArchbaseTextArea<MecanicoDto, string>
            label={String(t('my-app:Observação'))}
            dataSource={dataSource}
            dataField="observacoes"
            autosize
            minRows={8}
          />
        </Grid.Col>
      </Grid>
    </ArchbaseFormTemplate>
  )
}
```

### Características do useArchbaseRemoteDataSourceV2

1. **Compatibilidade Total**: O `dataSource` retornado implementa `IArchbaseDataSourceBase<T>`, funcionando com todos os componentes Archbase sem cast
2. **Integração com Service**: Operações de save/delete são feitas automaticamente via service
3. **Métodos Disponíveis**:
   - `setRecords([...])` - Define registros
   - `insert(record)` - Insere novo registro
   - `edit()` - Entra em modo edição
   - `save()` - Salva via service
   - `cancel()` - Cancela alterações
   - `remove()` - Remove registro atual
   - `getFieldValue(field)` - Obtém valor do campo
   - `setFieldValue(field, value)` - Define valor do campo

### Diferenças entre V1 e V2

| Aspecto | V1 (useArchbaseRemoteDataSource) | V2 (useArchbaseRemoteDataSourceV2) |
|---------|----------------------------------|-----------------------------------|
| Tipo do dataSource | `ArchbaseDataSource<T, ID>` | `ArchbaseRemoteDataSourceV2<T>` |
| Interface comum | Não | Sim (`IArchbaseDataSourceBase<T>`) |
| Cast necessário | Às vezes `as any` | **Nunca** |
| Carregar registros | `onLoadComplete` callback | `setRecords()` + `useEffect` |
| Operações em array | Manual | Métodos nativos |
| Performance | Boa | **Melhor** (menos re-renders) |

### Migração de V1 para V2

```typescript
// ❌ ANTES (V1) - Necessitava cast
const { dataSource } = useArchbaseRemoteDataSource<UserDto, string>({...})
const ds = dataSource as any  // Cast necessário
<ArchbaseEdit dataSource={ds} dataField="nome" />

// ✅ DEPOIS (V2) - Sem cast
const { dataSource } = useArchbaseRemoteDataSourceV2<UserDto>({...})
<ArchbaseEdit dataSource={dataSource} dataField="nome" />  // Funciona direto!
```
