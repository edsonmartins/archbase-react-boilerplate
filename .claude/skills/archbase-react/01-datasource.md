# 01. DataSource - Fundação

O `ArchbaseDataSource` é o coração da integração de dados. Gerencia estado, binding, validação e eventos.

---

## 1. ArchbaseDataSource (V1)

### Conceito
Gerencia:
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

## 11. DataSource V2 - Nova Geração

### Conceito
O **DataSource V2** é uma evolução com:
- **Imutabilidade** via Immer
- **50% menos re-renders** em operações
- **Operações em arrays** nativas e type-safe
- **100% compatível** com código V1 existente

### Detecção Automática V1/V2
Os componentes detectam automaticamente a versão:

```typescript
// Detecção automática em componentes
const isDataSourceV2 = dataSource && (
  'appendToFieldArray' in dataSource ||
  'updateFieldArrayItem' in dataSource
);
```

### Criação do DataSource V2 Local

```typescript
import { ArchbaseDataSourceV2 } from '@archbase/data'

interface Pessoa {
  id: string
  nome: string
  email: string
  contatos: Contato[]
  endereco: {
    cep: string
    rua: string
    cidade: string
  }
}

interface Contato {
  tipo: 'EMAIL' | 'TELEFONE' | 'WHATSAPP'
  valor: string
  principal: boolean
}

// Criação simples
const dataSource = new ArchbaseDataSourceV2<Pessoa>({
  name: 'pessoas',
  records: pessoasList
})

// Com configuração completa
const dataSource = new ArchbaseDataSourceV2<Pessoa>({
  name: 'pessoas',
  label: 'Cadastro de Pessoas',
  records: pessoasList,
  validator: customValidator,
  onStateChange: (state) => console.log('Estado:', state)
})
```

### Métodos Core (Compatíveis com V1)

```typescript
// NAVEGAÇÃO
dataSource.first()           // Primeiro registro
dataSource.last()            // Último registro
dataSource.next()            // Próximo
dataSource.prior()           // Anterior
dataSource.goToRecord(index) // Ir para índice

// ESTADO
dataSource.isBrowsing()      // Navegando?
dataSource.isEditing()       // Editando?
dataSource.isInserting()     // Inserindo?
dataSource.isActive()        // Ativo?

// CRUD
dataSource.edit()            // Entrar em modo edição
dataSource.save()            // Salvar alterações
dataSource.cancel()          // Cancelar alterações
dataSource.insert(record)    // Inserir registro
dataSource.remove()          // Remover registro atual

// CAMPOS
dataSource.setFieldValue('nome', 'João')
dataSource.getFieldValue('nome')

// CAMPOS ANINHADOS (suportado!)
dataSource.setFieldValue('endereco.rua', 'Nova Rua')
dataSource.getFieldValue('endereco.cidade')
```

### Operações em Arrays (EXCLUSIVO V2!)

```typescript
// ADICIONAR ao array
dataSource.appendToFieldArray('contatos', {
  tipo: 'EMAIL',
  valor: 'novo@email.com',
  principal: false
})

// ATUALIZAR item do array com Immer draft
dataSource.updateFieldArrayItem('contatos', 0, (draft) => {
  draft.principal = true
  draft.valor = 'atualizado@email.com'
})

// REMOVER item do array
dataSource.removeFromFieldArray('contatos', 1)

// INSERIR em posição específica
dataSource.insertIntoFieldArray('contatos', 0, novoContato)

// OBTER array tipado
const contatos = dataSource.getFieldArray('contatos')
const temContatos = dataSource.hasFieldArrayItems('contatos')
const qtdContatos = dataSource.getFieldArrayLength('contatos')
```

### Hook useArchbaseDataSourceV2

```typescript
import { useArchbaseDataSourceV2 } from '@archbase/data'

function MeuFormulario() {
  const {
    dataSource,
    currentRecord,
    totalRecords,
    currentIndex,
    isEditing,
    isBrowsing,
    isInserting,
    isEmpty,

    // Navigation
    first, last, next, prior,

    // CRUD
    edit, save, cancel, insert, remove,

    // Fields
    setFieldValue, getFieldValue,

    // Arrays (V2 exclusive)
    appendToArray,
    updateArrayItem,
    removeFromArray
  } = useArchbaseDataSourceV2<Pessoa>({
    name: 'pessoas',
    records: pessoasList
  })

  const handleAdicionarContato = () => {
    appendToArray('contatos', {
      tipo: 'EMAIL',
      valor: '',
      principal: false
    })
  }

  return (
    <div>
      <h3>{currentRecord?.nome}</h3>
      <p>Total: {totalRecords}</p>

      {isEditing ? (
        <button onClick={save}>Salvar</button>
      ) : (
        <button onClick={edit}>Editar</button>
      )}

      <button onClick={handleAdicionarContato}>
        + Contato
      </button>
    </div>
  )
}
```

---

## 12. DataSource V2 Remoto

### useArchbaseRemoteDataSourceV2

```typescript
import {
  useArchbaseRemoteDataSourceV2,
  useArchbaseRemoteServiceApi
} from '@archbase/data'
import { ArchbaseNotifications } from '@archbase/components'

function ListaPessoas() {
  const serviceApi = useArchbaseRemoteServiceApi<PessoaService>(API_TYPE.Pessoa)

  const {
    dataSource,
    isLoading,
    error,
    isError,
    currentRecord,
    refreshData
  } = useArchbaseRemoteDataSourceV2<PessoaDto>({
    name: 'dsPessoas',
    label: 'Pessoas',
    service: serviceApi,
    pageSize: 50,
    loadOnStart: true,
    defaultSortFields: ['-dataCriacao'],
    onError: (error) => {
      ArchbaseNotifications.showError('Erro', error)
    }
  })

  // Paginação
  const handlePageChange = (page: number) => {
    const options = dataSource.getOptions()
    options.currentPage = page
    dataSource.refreshData(options)
  }

  return (
    <div>
      <ArchbaseDataGrid
        dataSource={dataSource}
        height={400}
        isLoading={isLoading}
      >
        <Columns>
          <ArchbaseDataGridColumn dataField="nome" header="Nome" size={200} dataType="text" />
          <ArchbaseDataGridColumn dataField="email" header="Email" size={250} dataType="text" />
        </Columns>
      </ArchbaseDataGrid>
    </div>
  )
}
```

### Exemplo: Formulário com Arrays (Pedidos e Itens)

```typescript
interface Pedido {
  id: string
  cliente: string
  itens: ItemPedido[]
  desconto: number
  frete: number
}

interface ItemPedido {
  produtoId: string
  produtoNome: string
  quantidade: number
  precoUnitario: number
  observacoes: string[]
}

function FormularioPedido({ pedidoId }: { pedidoId?: string }) {
  const serviceApi = useArchbaseRemoteServiceApi<PedidoService>(API_TYPE.Pedido)

  const { dataSource, isLoading } = useArchbaseRemoteDataSourceV2<Pedido>({
    name: 'dsPedido',
    service: serviceApi,
    id: pedidoId,
    loadOnStart: !!pedidoId
  })

  // V2: Adicionar item ao pedido
  const handleAdicionarItem = (produto: { id: string; nome: string; preco: number }) => {
    dataSource.appendToFieldArray('itens', {
      produtoId: produto.id,
      produtoNome: produto.nome,
      quantidade: 1,
      precoUnitario: produto.preco,
      observacoes: []
    })
  }

  // V2: Atualizar quantidade
  const handleAtualizarQuantidade = (index: number, quantidade: number) => {
    dataSource.updateFieldArrayItem('itens', index, (draft) => {
      draft.quantidade = quantidade
    })
  }

  // V2: Adicionar observação ao item
  const handleAdicionarObservacao = (itemIndex: number, obs: string) => {
    dataSource.updateFieldArrayItem('itens', itemIndex, (draft) => {
      draft.observacoes.push(obs)
    })
  }

  // V2: Remover item
  const handleRemoverItem = (index: number) => {
    dataSource.removeFromFieldArray('itens', index)
  }

  // Cálculos reativos
  const itens = dataSource.getFieldArray('itens')
  const subtotal = itens.reduce((acc, item) =>
    acc + (item.quantidade * item.precoUnitario), 0
  )
  const desconto = dataSource.getFieldValue('desconto') || 0
  const frete = dataSource.getFieldValue('frete') || 0
  const total = subtotal - desconto + frete

  return (
    <ArchbaseFormTemplate
      title="Pedido"
      dataSource={dataSource}
      isLoading={isLoading}
    >
      <Stack>
        <ArchbaseEdit
          dataSource={dataSource}
          dataField="cliente"
          label="Cliente"
        />

        <Divider label="Itens do Pedido" />

        {itens.map((item, index) => (
          <Group key={index}>
            <Text>{item.produtoNome}</Text>
            <NumberInput
              value={item.quantidade}
              onChange={(v) => handleAtualizarQuantidade(index, v as number)}
              min={1}
            />
            <Text>R$ {(item.quantidade * item.precoUnitario).toFixed(2)}</Text>
            <Button
              color="red"
              size="xs"
              onClick={() => handleRemoverItem(index)}
            >
              Remover
            </Button>
          </Group>
        ))}

        <Button onClick={() => handleAdicionarItem({id: '1', nome: 'Produto', preco: 10})}>
          + Adicionar Item
        </Button>

        <Divider label="Totais" />

        <Group>
          <ArchbaseNumberEdit
            dataSource={dataSource}
            dataField="desconto"
            label="Desconto"
            width={150}
          />
          <ArchbaseNumberEdit
            dataSource={dataSource}
            dataField="frete"
            label="Frete"
            width={150}
          />
        </Group>

        <Text fw={700}>Total: R$ {total.toFixed(2)}</Text>
      </Stack>
    </ArchbaseFormTemplate>
  )
}
```

---

## 13. Padrão de Compatibilidade V1/V2

### Hook useArchbaseV1V2Compatibility

Este hook é usado internamente pelos componentes para suportar ambas as versões:

```typescript
import { useArchbaseV1V2Compatibility } from '@archbase/data'

function MeuComponenteCustom<T, ID>({
  dataSource,
  dataField,
  value,
  onChangeValue
}: Props<T, ID>) {

  // 1. HOOK DE COMPATIBILIDADE
  const {
    isDataSourceV2,
    currentValue,
    handleValueChange,
    loadDataSourceFieldValue,
    isReadOnly,
    v1State: { forceUpdate }
  } = useArchbaseV1V2Compatibility<string>(
    'MeuComponenteCustom',
    dataSource,
    dataField,
    value
  )

  // 2. LISTENER DO DATASOURCE
  useArchbaseDataSourceListener<T, ID>({
    dataSource,
    listener: (event) => {
      // V2 não precisa de forceUpdate - estado é reativo
      if (!isDataSourceV2) {
        forceUpdate()
      }
    }
  })

  // 3. CARREGAMENTO INICIAL
  useEffect(() => {
    loadDataSourceFieldValue()
  }, [loadDataSourceFieldValue])

  // 4. HANDLER DE MUDANÇA
  const handleChange = useCallback((newValue: string) => {
    handleValueChange(newValue)
    onChangeValue?.(newValue)
  }, [handleValueChange, onChangeValue])

  return (
    <input
      value={currentValue}
      onChange={(e) => handleChange(e.target.value)}
      disabled={isReadOnly}
    />
  )
}
```

### Detecção Automática por Duck Typing

```typescript
// Componentes detectam V2 pela presença destes métodos
function isDataSourceV2(ds: any): boolean {
  return ds && (
    typeof ds.appendToFieldArray === 'function' ||
    typeof ds.updateFieldArrayItem === 'function' ||
    typeof ds.getFieldArray === 'function'
  )
}
```

---

## Resumo V1 vs V2

| Aspecto | V1 | V2 |
|---------|----|----|
| **Criação** | `new ArchbaseDataSource('name', options)` | `new ArchbaseDataSourceV2({ name, records })` |
| **Arrays** | Manual com `setFieldValue` | `appendToFieldArray`, `updateFieldArrayItem`, `removeFromFieldArray` |
| **Imutabilidade** | Mutável | Immer integrado |
| **Re-renders** | forceUpdate frequente | 50% menos re-renders |
| **Type Safety** | Básica | Completa com generics |
| **Campos aninhados** | Suportado | Suportado |
| **Compatibilidade** | - | 100% compatível com V1 |
| **Hook** | `useArchbaseDataSourceListener` | `useArchbaseDataSourceV2` |

### Quando usar V2?
- Projetos novos - melhor performance desde o início
- Arrays complexos - operações nativas e type-safe
- Performance crítica - 50% menos re-renders
- Type safety - erros em tempo de compilação

### Quando manter V1?
- Projetos legados - zero alterações necessárias
- Migração gradual - ambos funcionam juntos
- Equipe em transição - aprende V2 aos poucos
