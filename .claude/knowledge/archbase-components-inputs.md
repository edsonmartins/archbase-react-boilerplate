# Archbase Componentes de Input - Guia Completo

## Conceito

Os componentes de input do Archbase fornecem binding automático com `ArchbaseDataSource`, permitindo sincronização bidirecional entre formulário e dados. Suportam detecção automática de DataSource V1/V2.

## Props Comuns

Todos os componentes de input aceitam:

```typescript
interface CommonInputProps {
  dataSource: ArchbaseDataSource<T, ID>  // DataSource para binding
  dataField: string                       // Campo do DTO
  label?: string                          // Label do campo
  placeholder?: string                    // Placeholder
  required?: boolean                      // Campo obrigatório
  readOnly?: boolean                      // Somente leitura
  disabled?: boolean                      // Desabilitado
  width?: string | number                 // Largura
  error?: string                          // Mensagem de erro manual
  size?: MantineSize                      // Tamanho do componente
}
```

## ArchbaseEdit

Input de texto simples.

```typescript
import { ArchbaseEdit } from '@archbase/components'

<ArchbaseEdit
  dataSource={dataSource}
  dataField="name"
  label="Nome"
  placeholder="Digite o nome"
  required
  readOnly={isViewOnly}
  maxLength={100}
/>
```

### Props Específicas
- `maxLength`: número máximo de caracteres
- `type`: 'text' | 'password' | 'email'

## ArchbaseTextArea

Área de texto multilinha.

```typescript
import { ArchbaseTextArea } from '@archbase/components'

<ArchbaseTextArea
  dataSource={dataSource}
  dataField="description"
  label="Descrição"
  rows={4}
  maxLength={500}
  autosize
  minRows={3}
  maxRows={8}
/>
```

### Props Específicas
- `rows`: número de linhas
- `autosize`: ajustar altura automaticamente
- `minRows` / `maxRows`: limites para autosize

## ArchbaseNumberEdit

Input numérico com formatação.

```typescript
import { ArchbaseNumberEdit } from '@archbase/components'

<ArchbaseNumberEdit
  dataSource={dataSource}
  dataField="quantity"
  label="Quantidade"
  minValue={0}
  maxValue={1000}
  precision={2}
  thousandSeparator="."
  decimalSeparator=","
  prefix="R$ "
  suffix=""
  allowNegative={false}
  allowEmpty={false}
  integer={false}
  clearable
/>
```

### Props Específicas
- `minValue` / `maxValue`: valores mínimo e máximo (NÃO use `min`/`max`)
- `precision`: casas decimais (NÃO use `decimalScale`)
- `thousandSeparator`: separador de milhar
- `decimalSeparator`: separador decimal
- `prefix` / `suffix`: prefixo/sufixo
- `allowNegative`: permitir números negativos
- `allowEmpty`: permitir valor vazio
- `integer`: apenas números inteiros
- `clearable`: permite limpar o valor

## ArchbaseMaskEdit

Input com máscara.

```typescript
import { ArchbaseMaskEdit } from '@archbase/components'

// Telefone
<ArchbaseMaskEdit
  dataSource={dataSource}
  dataField="phone"
  label="Telefone"
  mask="(00) 00000-0000"
/>

// CPF
<ArchbaseMaskEdit
  dataSource={dataSource}
  dataField="cpf"
  label="CPF"
  mask="000.000.000-00"
/>

// CNPJ
<ArchbaseMaskEdit
  dataSource={dataSource}
  dataField="cnpj"
  label="CNPJ"
  mask="00.000.000/0000-00"
/>

// CEP
<ArchbaseMaskEdit
  dataSource={dataSource}
  dataField="zipCode"
  label="CEP"
  mask="00000-000"
/>
```

### Máscaras Comuns
| Tipo | Máscara |
|------|---------|
| Telefone | `(00) 00000-0000` |
| CPF | `000.000.000-00` |
| CNPJ | `00.000.000/0000-00` |
| CEP | `00000-000` |
| Data | `00/00/0000` |
| Hora | `00:00` |

## ArchbaseSelect

Select/dropdown com opções. **IMPORTANTE**: Usa `options`, `getOptionLabel` e `getOptionValue`.

```typescript
import { ArchbaseSelect } from '@archbase/components'

// Interface do tipo de opção
interface StatusOption {
  id: string
  nome: string
}

// Opções como array de objetos
const statusOptions: StatusOption[] = [
  { id: 'ACTIVE', nome: 'Ativo' },
  { id: 'INACTIVE', nome: 'Inativo' },
  { id: 'PENDING', nome: 'Pendente' }
]

<ArchbaseSelect<UserDto, string, StatusOption>
  dataSource={dataSource}
  dataField="status"
  label="Status"
  options={statusOptions}
  getOptionLabel={(opt) => opt.nome}
  getOptionValue={(opt) => opt.id}
  required
  clearable
  searchable
/>

// Com opções simples (valor = label)
<ArchbaseSelect<UserDto, string, string>
  dataSource={dataSource}
  dataField="status"
  label="Status"
  options={['Ativo', 'Inativo', 'Pendente']}
  getOptionLabel={(opt) => opt}
  getOptionValue={(opt) => opt}
/>

// Com DataSource como options
<ArchbaseSelect<UserDto, string, CategoryDto>
  dataSource={dataSource}
  dataField="categoryId"
  label="Categoria"
  options={dsCategories}
  optionsLabelField="name"
  getOptionLabel={(opt) => opt.name}
  getOptionValue={(opt) => opt.id}
/>

// Com converter (salvar apenas ID)
<ArchbaseSelect<UserDto, string, CategoryDto>
  dataSource={dataSource}
  dataField="categoryId"
  label="Categoria"
  options={categoryOptions}
  getOptionLabel={(opt) => opt.name}
  getOptionValue={(opt) => opt.id}
  converter={(opt) => opt.id}
  getConvertedOption={async (id) => categoryService.findById(id)}
/>
```

### Props Específicas
- `options`: array de opções OU DataSource
- `getOptionLabel`: função para extrair label de uma opção (OBRIGATÓRIO)
- `getOptionValue`: função para extrair value de uma opção (OBRIGATÓRIO)
- `optionsLabelField`: campo para label quando options é DataSource
- `clearable`: permite limpar seleção
- `searchable`: permite busca nas opções
- `nothingFound`: mensagem quando não encontra
- `converter`: função para converter valor antes de salvar
- `getConvertedOption`: função async para buscar opção pelo valor convertido
- `onSelectValue`: callback quando valor é selecionado

> **NÃO USE `data` prop** - a documentação anterior estava incorreta

## ArchbaseMultiSelect

Seleção múltipla.

```typescript
import { ArchbaseMultiSelect } from '@archbase/components'

const tagOptions = [
  { id: 'urgent', name: 'Urgente' },
  { id: 'important', name: 'Importante' },
  { id: 'review', name: 'Revisão' }
]

<ArchbaseMultiSelect<UserDto, string, TagOption>
  dataSource={dataSource}
  dataField="tags"
  label="Tags"
  options={tagOptions}
  getOptionLabel={(opt) => opt.name}
  getOptionValue={(opt) => opt.id}
  maxSelectedValues={5}
  searchable
  clearable
/>
```

## ArchbaseLookupEdit

Campo de lookup com busca remota assíncrona.

**IMPORTANTE**: Usa `lookupValueDelegator` como função assíncrona de busca.

```typescript
import { ArchbaseLookupEdit } from '@archbase/components'

<ArchbaseLookupEdit<UserDto, string, CategoryDto>
  dataSource={dataSource}
  dataField="category"           // Campo onde será atribuído o objeto encontrado
  lookupField="category.code"    // Campo para exibir no input
  label="Categoria"
  placeholder="Digite o código"
  lookupValueDelegator={async (value) => {
    // Busca assíncrona pelo valor digitado
    const result = await categoryService.findByCode(value)
    return result
  }}
  onLookupResult={(category) => {
    // Callback quando encontra o valor
    console.log('Encontrado:', category)
  }}
  onLookupError={(error) => {
    // Callback quando não encontra ou ocorre erro
    console.error('Erro:', error)
  }}
  validateOnExit={true}
  validateMessage="Categoria '%s' não encontrada"
  onActionSearchExecute={() => {
    // Callback para abrir modal de busca avançada
    openSearchModal()
  }}
  tooltipIconSearch="Clique para buscar"
/>
```

### Props Específicas
- `lookupField`: campo para exibir (ex: 'category.code')
- `lookupValueDelegator`: função async que recebe valor e retorna objeto (OBRIGATÓRIO)
- `onLookupResult`: callback quando encontra valor
- `onLookupError`: callback quando erro ou não encontra
- `validateOnExit`: validar ao sair do campo
- `validateMessage`: mensagem de erro (use %s para valor)
- `onActionSearchExecute`: callback para botão de busca
- `tooltipIconSearch`: tooltip do botão de busca
- `iconSearch`: ícone customizado para busca

> **NÃO USE** `lookupDataSource`, `lookupDisplayField`, `lookupValueField` - são props antigas/incorretas

## ArchbaseAsyncSelect

Select com busca assíncrona e paginação.

**IMPORTANTE**: Usa `getOptions` que retorna `OptionsResult<O>`.

```typescript
import { ArchbaseAsyncSelect, OptionsResult } from '@archbase/components'

// Tipo do resultado
interface OptionsResult<O> {
  options: O[]      // Array de opções
  page: number      // Página atual (0-based)
  totalPages: number // Total de páginas
}

<ArchbaseAsyncSelect<UserDto, string, CustomerDto>
  dataSource={dataSource}
  dataField="customerId"
  label="Cliente"
  placeholder="Digite para buscar..."
  getOptionLabel={(customer) => customer.name}
  getOptionValue={(customer) => customer.id}
  getOptionImage={(customer) => customer.avatarUrl}  // Opcional
  getOptions={async (page, searchValue) => {
    // Busca assíncrona com paginação
    const result = await customerService.search({
      query: searchValue,
      page: page,
      size: 20
    })
    return {
      options: result.content,
      page: result.number,
      totalPages: result.totalPages
    }
  }}
  debounceTime={300}
  minCharsToSearch={3}
  onSelectValue={(customer) => {
    console.log('Selecionado:', customer)
  }}
  onErrorLoadOptions={(error) => {
    console.error('Erro ao carregar:', error)
  }}
  clearable
  searchable
/>

// Com converter (salvar apenas ID)
<ArchbaseAsyncSelect<UserDto, string, CustomerDto>
  dataSource={dataSource}
  dataField="customerId"
  label="Cliente"
  getOptionLabel={(c) => c.name}
  getOptionValue={(c) => c.id}
  getOptions={async (page, value) => { /* ... */ }}
  converter={(customer) => customer.id}
  getConvertedOption={async (id) => customerService.findById(id)}
/>
```

### Props Específicas
- `getOptions`: função async que retorna `OptionsResult<O>` (OBRIGATÓRIO)
- `getOptionLabel`: extrai texto de exibição (OBRIGATÓRIO)
- `getOptionValue`: extrai valor do item (OBRIGATÓRIO)
- `getOptionImage`: extrai URL de imagem (opcional)
- `debounceTime`: delay da busca em ms (default: 500)
- `minCharsToSearch`: mínimo de caracteres para buscar (default: 3)
- `onErrorLoadOptions`: callback de erro
- `onSelectValue`: callback de seleção
- `converter`: função para converter valor antes de salvar
- `getConvertedOption`: função async para buscar opção pelo valor convertido

> **NÃO USE `onSearch`** - a documentação anterior estava incorreta

## ArchbaseDatePickerEdit

Seletor de data.

```typescript
import { ArchbaseDatePickerEdit } from '@archbase/components'

<ArchbaseDatePickerEdit
  dataSource={dataSource}
  dataField="birthDate"
  label="Data de Nascimento"
  clearable
  minDate={new Date(1900, 0, 1)}
  maxDate={new Date()}
/>
```

### Props Específicas
- `minDate` / `maxDate`: limites de data
- `clearable`: permite limpar
- `locale`: locale para calendário

## ArchbaseDateTimePickerEdit

Seletor de data e hora.

```typescript
import { ArchbaseDateTimePickerEdit } from '@archbase/components'

<ArchbaseDateTimePickerEdit
  dataSource={dataSource}
  dataField="scheduledAt"
  label="Agendamento"
/>
```

## ArchbaseSwitch

Toggle switch.

```typescript
import { ArchbaseSwitch } from '@archbase/components'

<ArchbaseSwitch
  dataSource={dataSource}
  dataField="active"
  label="Ativo"
  onLabel="Sim"
  offLabel="Não"
  readOnly={isViewOnly}
/>
```

### Props Específicas
- `onLabel`: texto quando ligado
- `offLabel`: texto quando desligado

## ArchbaseCheckbox

Checkbox simples.

```typescript
import { ArchbaseCheckbox } from '@archbase/components'

<ArchbaseCheckbox
  dataSource={dataSource}
  dataField="acceptTerms"
  label="Aceito os termos de uso"
/>
```

## ArchbaseCheckboxGroup

Grupo de checkboxes.

```typescript
import { ArchbaseCheckboxGroup } from '@archbase/components'

<ArchbaseCheckboxGroup
  dataSource={dataSource}
  dataField="permissions"
  label="Permissões"
  options={[
    { value: 'read', label: 'Leitura' },
    { value: 'write', label: 'Escrita' },
    { value: 'delete', label: 'Exclusão' }
  ]}
/>
```

## ArchbaseRadioGroup

Grupo de radio buttons.

```typescript
import { ArchbaseRadioGroup } from '@archbase/components'

<ArchbaseRadioGroup
  dataSource={dataSource}
  dataField="gender"
  label="Gênero"
  options={[
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
    { value: 'O', label: 'Outro' }
  ]}
/>
```

## ArchbaseColorInput

Seletor de cor.

```typescript
import { ArchbaseColorInput } from '@archbase/components'

<ArchbaseColorInput
  dataSource={dataSource}
  dataField="themeColor"
  label="Cor do Tema"
  format="hex"
  swatches={['#ff0000', '#00ff00', '#0000ff']}
/>
```

## ArchbaseRating

Avaliação com estrelas.

```typescript
import { ArchbaseRating } from '@archbase/components'

<ArchbaseRating
  dataSource={dataSource}
  dataField="rating"
  label="Avaliação"
  count={5}
  readOnly={isViewOnly}
/>
```

## ArchbaseSlider

Slider para valores numéricos.

```typescript
import { ArchbaseSlider } from '@archbase/components'

<ArchbaseSlider
  dataSource={dataSource}
  dataField="percentage"
  label="Percentual"
  min={0}
  max={100}
  step={5}
  marks={[
    { value: 0, label: '0%' },
    { value: 50, label: '50%' },
    { value: 100, label: '100%' }
  ]}
/>
```

## Padrões de Layout

### Campos em Linha

```typescript
import { Group } from '@mantine/core'

<Group grow>
  <ArchbaseEdit dataSource={ds} dataField="firstName" label="Nome" />
  <ArchbaseEdit dataSource={ds} dataField="lastName" label="Sobrenome" />
</Group>
```

### Grid Responsivo

```typescript
import { Grid } from '@mantine/core'

<Grid>
  <Grid.Col span={{ base: 12, md: 6 }}>
    <ArchbaseEdit dataSource={ds} dataField="name" label="Nome" />
  </Grid.Col>
  <Grid.Col span={{ base: 12, md: 6 }}>
    <ArchbaseEdit dataSource={ds} dataField="email" label="E-mail" />
  </Grid.Col>
</Grid>
```

### Stack Vertical

```typescript
import { Stack } from '@mantine/core'

<Stack>
  <ArchbaseEdit dataSource={ds} dataField="name" label="Nome" />
  <ArchbaseEdit dataSource={ds} dataField="email" label="E-mail" />
  <ArchbaseTextArea dataSource={ds} dataField="bio" label="Bio" />
</Stack>
```

## Tratamento de ReadOnly

```typescript
const isViewOnly = action === 'VIEW'

<ArchbaseEdit
  dataSource={dataSource}
  dataField="name"
  label="Nome"
  readOnly={isViewOnly}  // Aplicar em cada campo
/>
```

## Validação Visual

Os componentes exibem erros automaticamente quando:
1. DataSource tem validator configurado
2. Validação falha no campo específico

```typescript
// Configurar no DataSource
const dataSource = new ArchbaseDataSource<UserDto, string>('dsUser')
dataSource.setValidator(new ArchbaseValidator())

// Componente exibe erro automaticamente
<ArchbaseEdit
  dataSource={dataSource}
  dataField="email"  // Se inválido, mostra erro
  label="E-mail"
/>
```

## Resumo de Props Corretas

| Componente | Props Principais |
|------------|-----------------|
| ArchbaseSelect | `options`, `getOptionLabel`, `getOptionValue` |
| ArchbaseAsyncSelect | `getOptions` (retorna OptionsResult), `getOptionLabel`, `getOptionValue` |
| ArchbaseLookupEdit | `lookupValueDelegator` (async), `lookupField` |
| ArchbaseNumberEdit | `minValue`, `maxValue`, `precision` |

## Erros Comuns

### "Options must have getOptionLabel"
**Solução:** Sempre fornecer `getOptionLabel` e `getOptionValue` para ArchbaseSelect.

```typescript
// ERRADO
<ArchbaseSelect
  options={[{ value: '1', label: 'Um' }]}
/>

// CORRETO
<ArchbaseSelect
  options={items}
  getOptionLabel={(item) => item.label}
  getOptionValue={(item) => item.value}
/>
```

### "Cannot read property of undefined" em Lookup
**Solução:** Usar `lookupValueDelegator` corretamente.

```typescript
// ERRADO
<ArchbaseLookupEdit
  lookupDataSource={dsCategories}
  lookupDisplayField="name"
/>

// CORRETO
<ArchbaseLookupEdit
  lookupField="category.name"
  lookupValueDelegator={async (value) => categoryService.findByCode(value)}
/>
```

### "getOptions is not a function" em AsyncSelect
**Solução:** Usar `getOptions` em vez de `onSearch`.

```typescript
// ERRADO
<ArchbaseAsyncSelect
  onSearch={async (query) => results}
/>

// CORRETO
<ArchbaseAsyncSelect
  getOptions={async (page, query) => ({
    options: results,
    page: 0,
    totalPages: 1
  })}
/>
```
