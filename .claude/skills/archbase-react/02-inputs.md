# 02. Componentes de Input

Componentes de entrada de dados do Archbase React com binding automático ao DataSource.

---

## ArchbaseEdit

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

---

## ArchbaseSelect

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

---

## ArchbaseLookupEdit

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

---

## ArchbaseAsyncSelect

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

---

## ArchbaseSwitch

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

---

## ArchbaseNumberEdit

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

---

## ArchbaseMaskEdit

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

---

## ArchbaseDatePickerEdit

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

---

## ArchbaseTextArea

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

## Resumo de Props

| Componente | Prop Principal | Observação |
|------------|----------------|------------|
| `ArchbaseEdit` | `dataField` | Input de texto |
| `ArchbaseSelect` | `options + getOptionLabel + getOptionValue` | **NÃO usar `data`** |
| `ArchbaseLookupEdit` | `lookupValueDelegator` | **NÃO usar `lookupDataSource`** |
| `ArchbaseAsyncSelect` | `getOptions` | **NÃO usar `onSearch`** |
| `ArchbaseSwitch` | `dataField` | Toggle on/off |
| `ArchbaseNumberEdit` | `precision + minValue + maxValue` | **NÃO usar `decimalScale + min + max`** |
| `ArchbaseMaskEdit` | `mask` | Máscara de formatação |
| `ArchbaseDatePickerEdit` | `dataField` | Seleção de data |
| `ArchbaseTextArea` | `rows` ou `autosize` | Texto multilinha |

---

## Layout Vertical com Larguras

O projeto usa layout **VERTICAL** com `Stack`. Campos são empilhados, e campos curtos recebem `width` fixo.

| Tipo de Campo | Width | Exemplos |
|--------------|-------|----------|
| ID/UUID | 320 | id, identificador |
| Códigos curtos | 120-150 | código, sigla |
| CPF | 180 | cpf |
| CNPJ | 200 | cnpj |
| Telefone | 180 | telefone, celular |
| Valores monetários | 180 | preço, valor hora |
| Números inteiros | 120-150 | quantidade, tempo |
| Datas | 180 | data nascimento |
| E-mail | 350 | email |
| Selects curtos | 250 | status, tipo, classificação |
| Nome/Descrição | (sem width) | largura total |
| TextArea | (sem width) | largura total |

### Exemplo

```typescript
<Stack gap="md">
  <ArchbaseEdit
    label="Identificador"
    dataSource={dataSource}
    dataField="id"
    width={320}
    readOnly
  />
  <ArchbaseEdit
    label="Código"
    dataSource={dataSource}
    dataField="codigo"
    width={150}
  />
  <ArchbaseEdit
    label="Nome"
    dataSource={dataSource}
    dataField="nome"
    // sem width - ocupa largura total
  />
  <ArchbaseMaskEdit
    label="CPF"
    dataSource={dataSource}
    dataField="cpf"
    mask="000.000.000-00"
    width={180}
  />
</Stack>
```
