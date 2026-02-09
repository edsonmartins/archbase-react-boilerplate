# 11. Padrões de Views

Padrões estabelecidos para estruturação de views em projetos Archbase React.

---

## 1. View + ViewContent Decomposition

**Padrão mais importante!** Toda view deve ser separada em duas camadas:

```typescript
// View externa: Wrapper de segurança
export function ProductListView() {
  return (
    <ArchbaseViewSecurityProvider
      resourceName={APP_SECURITY_RESOURCES.PRODUCT.name}
      resourceDescription={APP_SECURITY_RESOURCES.PRODUCT.description}
    >
      <ProductListViewContent />
    </ArchbaseViewSecurityProvider>
  )
}

// View interna: Lógica e UI
function ProductListViewContent() {
  const { canCreate, canEdit, canDelete, canView } = useArchbaseSecureForm(
    APP_SECURITY_RESOURCES.PRODUCT.name,
    APP_SECURITY_RESOURCES.PRODUCT.description
  )

  // ... resto da implementação
}
```

**Benefícios:**
- Separação clara entre segurança e lógica
- Permite testes isolados
- Melhor organização de código

---

## 2. Render Functions

Funções de renderização para colunas de grid devem ser definidas **fora do useMemo**:

```typescript
function ProductListViewContent() {
  // 1. Render functions definidas ANTES do useMemo
  const renderStatus = (row: ProductDto): ReactNode => {
    return (
      <Badge color={getStatusColor(row.status)} variant="filled" size="md">
        {row.statusLabel}
      </Badge>
    )
  }

  const renderBoolean = (value?: boolean): ReactNode => {
    return value ? (
      <IconCheckbox size={24} color="green" stroke={2} />
    ) : (
      <IconSquare size={24} color="gray" stroke={2} />
    )
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'ACTIVE': 'green',
      'INACTIVE': 'gray',
      'PENDING': 'yellow'
    }
    return colors[status] || 'gray'
  }

  // 2. Colunas com useMemo usando as render functions
  const columns: ReactNode = useMemo(() => {
    return (
      <Columns>
        <ArchbaseDataGridColumn
          dataField="name"
          header="Name"
          size={300}
          dataType="text"
        />
        <ArchbaseDataGridColumn
          dataField="status"
          header="Status"
          size={120}
          dataType="text"
          render={(data) => renderStatus(data.row.original)}
        />
        <ArchbaseDataGridColumn
          dataField="active"
          header="Active"
          size={80}
          dataType="boolean"
          render={(data) => renderBoolean(data.getValue())}
        />
      </Columns>
    )
  }, [t]) // Incluir [t] para i18n
}
```

---

## 3. Constantes de Opções Fora do Componente

Opções de select e mapeamentos de cores devem ser definidos **fora** do componente:

```typescript
// FORA do componente
const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'PENDING', label: 'Pending' }
]

const statusColors: Record<string, string> = {
  'ACTIVE': 'green',
  'INACTIVE': 'gray',
  'PENDING': 'yellow'
}

const typeLabels: Record<string, string> = {
  '1': 'Type A',
  '2': 'Type B',
  '3': 'Type C'
}

// DENTRO do componente - usar as constantes
export function ProductListView() {
  // ...
}
```

---

## 4. Modal com DataSource V2 Local

Para exibir detalhes em modal, crie um DataSource local:

```typescript
function ProductListViewContent() {
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null)
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false)

  // DataSource local para modal de detalhes
  const { dataSource: detailDataSource } = useArchbaseDataSourceV2<ProductDto>({
    name: 'dsProductDetail',
    records: selectedProduct ? [selectedProduct] : []
  })

  // Atualiza quando modal abre
  useEffect(() => {
    if (selectedProduct && detailsOpened) {
      detailDataSource.open({ records: [selectedProduct] })
      detailDataSource.first()
    }
  }, [selectedProduct, detailsOpened])

  const handleViewDetails = (product: ProductDto) => {
    setSelectedProduct(product)
    openDetails()
  }

  return (
    <>
      {/* Grid principal */}
      <ArchbaseGridTemplate ... />

      {/* Modal de detalhes */}
      <Modal
        opened={detailsOpened}
        onClose={closeDetails}
        title="Product Details"
        size="xl"
      >
        {selectedProduct && (
          <ProductDetailContent
            dataSource={detailDataSource}
            product={selectedProduct}
          />
        )}
      </Modal>
    </>
  )
}
```

---

## 5. useDisclosure para Modais

Use `useDisclosure` do Mantine para controlar estados de modais:

```typescript
import { useDisclosure } from '@mantine/hooks'

function ProductListViewContent() {
  // Modal de detalhes
  const [detailsOpened, { open: openDetails, close: closeDetails }] = useDisclosure(false)

  // Modal de configuração
  const [configOpened, { open: openConfig, close: closeConfig }] = useDisclosure(false)

  // Modal de confirmação
  const [confirmOpened, { open: openConfirm, close: closeConfirm }] = useDisclosure(false)

  // Estados associados aos modais
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null)

  const handleView = (product: ProductDto) => {
    setSelectedProduct(product)
    openDetails()
  }
}
```

---

## 6. Seleção de Linhas em Grid

Para operações em lote, use seleção de linhas:

```typescript
function ProductListViewContent() {
  const [selectedRows, setSelectedRows] = useState<ProductDto[]>([])

  const handleRowSelectionChange = (rows: ProductDto[]) => {
    setSelectedRows(rows)
  }

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      ArchbaseNotifications.showWarning('Warning', 'Select at least one product')
      return
    }

    // Confirmação
    modals.openConfirmModal({
      title: 'Confirm Delete',
      children: `Delete ${selectedRows.length} products?`,
      onConfirm: async () => {
        const ids = selectedRows.map(p => p.id)
        await productService.bulkDelete(ids)
        setSelectedRows([])
        refreshData()
      }
    })
  }

  return (
    <ArchbaseGridTemplate
      enableRowSelection={true}
      onSelectedRowsChanged={handleRowSelectionChange}
      userActions={{
        headerLeft: (
          <Button
            leftSection={<IconTrash size={16} />}
            disabled={selectedRows.length === 0}
            onClick={handleBulkDelete}
          >
            Delete Selected ({selectedRows.length})
          </Button>
        )
      }}
    />
  )
}
```

---

## 7. Operações em Lote

Padrão para atualizar múltiplos registros:

```typescript
const handleBulkUpdate = async () => {
  if (selectedRows.length === 0) {
    ArchbaseNotifications.showWarning('Warning', 'Select at least one item')
    return
  }

  setIsUpdating(true)
  try {
    const ids = selectedRows
      .map((item) => item.id)
      .filter((id): id is string => id !== undefined)

    const response = await axios.patch<{ updated: number; total: number }>(
      '/api/v1/products/batch/status',
      { ids, status: newStatus }
    )

    ArchbaseNotifications.showSuccess(
      'Success',
      `${response.data.updated} of ${response.data.total} items updated`
    )

    closeModal()
    setSelectedRows([])
    refreshData()
  } catch (err: any) {
    ArchbaseNotifications.showError('Error', err.message)
  } finally {
    setIsUpdating(false)
  }
}
```

---

## 8. Tabs em Modais de Detalhes

Para detalhes complexos, use Tabs dentro do modal:

```typescript
<Modal opened={detailsOpened} onClose={closeDetails} size="xl">
  <Tabs defaultValue="general" variant="outline">
    <Tabs.List>
      <Tabs.Tab value="general" leftSection={<IconInfoCircle size={16} />}>
        General Info
      </Tabs.Tab>
      <Tabs.Tab value="details" leftSection={<IconList size={16} />}>
        Details
      </Tabs.Tab>
      <Tabs.Tab value="history" leftSection={<IconHistory size={16} />}>
        History
      </Tabs.Tab>
    </Tabs.List>

    <ScrollArea h={500} mt="md">
      <Tabs.Panel value="general">
        <Stack gap="md">
          {/* Campos gerais */}
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="details">
        {/* Detalhes específicos */}
      </Tabs.Panel>

      <Tabs.Panel value="history">
        {/* Histórico */}
      </Tabs.Panel>
    </ScrollArea>
  </Tabs>
</Modal>
```

---

## 9. Container Height com useElementSize

Para altura dinâmica de containers:

```typescript
import { useElementSize } from '@mantine/hooks'

function ProductListViewContent() {
  const { ref: containerRef, height: containerHeight } = useElementSize()

  return (
    <Paper ref={containerRef} style={{ height: '100%', overflow: 'hidden' }}>
      <ArchbaseGridTemplate
        height={containerHeight - 60} // Descontar header/padding
        // ...
      />
    </Paper>
  )
}
```

**Alternativa com useArchbaseElementSizeArea:**

```typescript
import { useArchbaseElementSizeArea } from '@archbase/core'

function ProductListViewContent() {
  const [containerRef, { height: containerHeight }] = useArchbaseElementSizeArea()

  return (
    <Paper ref={containerRef} style={{ height: '100%' }}>
      <ArchbaseGridTemplate height={containerHeight} />
    </Paper>
  )
}
```

---

## 10. Alertas Baseados em DTO

Para mostrar alertas condicionais baseados em dados:

```typescript
{selectedProduct && (() => {
  const dto = new ProductDto(selectedProduct)
  return (
    <>
      {dto.isExpired && (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          title="Expired Product"
          color="red"
          variant="filled"
          mb="md"
        >
          This product has expired and needs attention.
        </Alert>
      )}
      {dto.isLowStock && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Low Stock"
          color="yellow"
          variant="light"
          mb="md"
        >
          Stock level is below minimum threshold.
        </Alert>
      )}
    </>
  )
})()}
```

---

## Resumo de Boas Práticas

| Prática | Descrição |
|---------|-----------|
| View decomposition | Separar View e ViewContent |
| Render functions | Definir antes do useMemo |
| Constantes externas | Opções e cores fora do componente |
| DataSource local | Para modais de detalhes |
| useDisclosure | Para estados de modais |
| Seleção de linhas | Para operações em lote |
| Tabs em modais | Para detalhes complexos |
| useElementSize | Para altura dinâmica |

---

## Estrutura de Arquivo Recomendada

```
ProductListView.tsx
├── Imports
├── Constantes (statusOptions, colors)
├── Interfaces (Props, etc)
├── export function ProductListView()
│   └── ArchbaseViewSecurityProvider
│       └── ProductListViewContent
└── function ProductListViewContent()
    ├── Hooks (useState, useDisclosure, etc)
    ├── DataSources
    ├── Render functions
    ├── Event handlers
    ├── useMemo (columns)
    └── return JSX
```
