# 03. ArchbaseDataGrid

**IMPORTANTE**: O componente é `ArchbaseDataGrid`, NÃO ArchbaseDataTable!

---

## Uso com Children Pattern

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

---

## Tipos de Dados (dataType)

| dataType | Descrição | Exemplo |
|----------|-----------|---------|
| `text` | Texto simples | nome, email |
| `integer` | Número inteiro | quantidade, idade |
| `float` | Número decimal | peso, altura |
| `currency` | Moeda | preço, valor |
| `boolean` | Verdadeiro/Falso | ativo, aprovado |
| `date` | Data apenas | data nascimento |
| `datetime` | Data e hora | created at |
| `time` | Apenas hora | horário |
| `enum` | Enumeração (usar com enumValues) | status |
| `image` | URL de imagem | foto, avatar |
| `uuid` | UUID | id |

---

## Props Principais

| Prop | Tipo | Descrição |
|------|------|-----------|
| `dataSource` | DataSource | Fonte de dados |
| `height` | number/string | Altura do grid |
| `isLoading` | boolean | Mostrar loading |
| `highlightOnHover` | boolean | Destacar linha ao hover |
| `onCellDoubleClick` | function | Ao dar duplo clique na célula |
| `bordered` | boolean | Mostrar borda |

---

## Colunas

### Props de Coluna

| Prop | Tipo | Descrição |
|------|------|-----------|
| `dataField` | string | Campo do DTO |
| `header` | string | Título da coluna (**NÃO `caption`**) |
| `size` | number | Largura da coluna (**NÃO `width`**) |
| `dataType` | string | Tipo de dado (**obrigatório**) |
| `align` | 'left'\|'center'\|'right' | Alinhamento |
| `render` | function | Renderização customizada |
| `visible` | boolean | Visibilidade |

### Render Customizado

```typescript
<ArchbaseDataGridColumn
  dataField="status"
  header="Status"
  size={130}
  dataType="text"
  render={(data) => <StatusBadge status={data.getValue()} size="xs" />}
/>
```

---

## Eventos

```typescript
<ArchbaseDataGrid
  dataSource={dataSource}
  height={400}
  // Duplo clique na célula
  onCellDoubleClick={(params) => {
    console.log('Clique:', params.id, params.field)
    handleEdit(params.id)
  }}
  // Duplo clique na linha
  onRowDoubleClick={(row) => {
    console.log('Linha:', row)
  }}
  // Seleção mudou
  onSelectionChange={(selection) => {
    console.log('Seleção:', selection)
  }}
/>
```

---

## Paginação

```typescript
const [pagination, setPagination] = useState({
  page: 0,
  pageSize: 50
})

<ArchbaseDataGrid
  dataSource={dataSource}
  height={400}
  pagination={{
    page: pagination.page,
    pageSize: pagination.pageSize,
    onPageChange: (page) => setPagination({ ...pagination, page }),
    onPageSizeChange: (size) => setPagination({ page: 0, pageSize: size })
  }}
/>
```
