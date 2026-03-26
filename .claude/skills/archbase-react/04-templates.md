# 04. Templates

Templates de layout do Archbase React para formulários e views.

---

## ArchbaseFormTemplate

Template para formulários.

**IMPORTANTE**: NÃO use `useElementSize` - causa loop de renderização! Use CSS flexbox.

```typescript
// CORRETO: Sem useElementSize, usar ScrollArea com height: '100%'
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

// ERRADO: useElementSize causa loop infinito!
// const { ref, height } = useElementSize()
// <ArchbaseFormTemplate innerRef={ref} ...>
//   <Paper style={{ height: safeHeight }}>
```

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `title` | string | Título do formulário |
| `dataSource` | DataSource | Fonte de dados |
| `isLoading` | boolean | Estado de carregamento |
| `isError` | boolean | Estado de erro |
| `error` | string | Mensagem de erro |
| `withBorder` | boolean | Mostrar borda |
| `onCancel` | function | Ao cancelar |
| `onAfterSave` | function | Após salvar |

---

## ArchbasePanelTemplate

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

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `title` | string | Título do painel |
| `isLoading` | boolean | Estado de carregamento |
| `isError` | boolean | Estado de erro |
| `error` | string | Mensagem de erro |
| `onNewRecord` | function | Ao criar novo registro |
| `innerRef` | RefObject | Ref para medições |

---

## ArchbaseSpaceTemplate

Template para views complexas com header customizado.

```typescript
import { ArchbaseSpaceTemplate } from '@archbase/template'
import { useElementSize } from '@mantine/hooks'
import { useRef } from 'react'

export function WorkspaceView() {
  const containerRef = useRef(null)
  const { height: containerHeight } = useElementSize()

  const safeHeight = containerHeight > 0 ? containerHeight - 60 : 600

  return (
    <ArchbaseSpaceTemplate
      title="Título da View"
      withBorder
      innerRef={containerRef}
      // Botões à esquerda (ações principais)
      headerLeft={
        <Group gap="sm">
          <Button leftSection={<IconPlus size={16} />}>
            Novo
          </Button>
        </Group>
      }
      // Botões à direita (filtros, toggle visualização)
      headerRight={
        <Group gap="sm">
          <Select placeholder="Status" data={statusOptions} />
        </Group>
      }
    >
      <Paper p={2} style={{ height: safeHeight }}>
        {/* Conteúdo */}
      </Paper>
    </ArchbaseSpaceTemplate>
  )
}
```

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `title` | string | Título da view |
| `withBorder` | boolean | Mostrar borda |
| `innerRef` | RefObject | Ref para calcular dimensões |
| `headerLeft` | ReactNode | Componentes à esquerda do header |
| `headerRight` | ReactNode | Componentes à direita do header |
| `onClose` | function | Callback ao fechar |

---

## ArchbaseGridTemplate (PRINCIPAL para List Views)

Template principal para views de listagem com CRUD completo, paginação e filtros integrados.

**IMPORTANTE**: Este é o template padrão para list views, não `ArchbasePanelTemplate`.

```typescript
import { ArchbaseGridTemplate, ArchbaseGridTemplateRef } from '@archbase/template'
import { useElementSize } from '@mantine/hooks'

function ProductListViewContent() {
  const templateRef = useRef<ArchbaseGridTemplateRef | null>(null)
  const { ref: containerRef, height: containerHeight } = useElementSize()

  const { dataSource, isLoading, error, refreshData, remove } =
    useArchbaseRemoteDataSourceV2<ProductDto>({
      name: 'dsProducts',
      label: 'Produtos',
      service: serviceApi,
      pageSize: 25,
      defaultSortFields: ['nome'],
    })

  const columns: ReactNode = useMemo(() => (
    <Columns>
      <ArchbaseDataGridColumn<ProductDto>
        dataField="nome" dataType="text" header="Nome" size={300}
      />
      <ArchbaseDataGridColumn<ProductDto>
        dataField="status" dataType="text" header="Status" size={120}
        render={(data) => <Badge>{data.getValue()}</Badge>}
      />
    </Columns>
  ), [t])

  return (
    <Paper p="md" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper ref={containerRef} withBorder style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <ArchbaseGridTemplate<ProductDto, string>
          ref={templateRef}
          title=""
          height={containerHeight}
          width={'100%'}
          dataSource={dataSource}
          pageSize={25}
          isLoading={isLoading}
          error={error}
          isError={Boolean(error)}
          clearError={handleClearError}
          withBorder={false}
          userActions={{
            visible: true,
            allowRemove: canDelete,
            onAddExecute: canCreate ? handleAdd : undefined,
            onEditExecute: canEdit ? handleEdit : undefined,
            onRemoveExecute: canDelete ? handleRemove : undefined,
            onViewExecute: canView ? handleView : undefined,
          }}
          userRowActions={userRowActions}
          getRowId={getRowId}
          enableRowSelection={true}
          enableRowActions={true}
          columns={columns}
          filterType={'normal'}
          positionActionsColumn={'first'}
        />
      </Paper>
    </Paper>
  )
}
```

### Props do ArchbaseGridTemplate

| Prop | Tipo | Descrição |
|------|------|-----------|
| `ref` | Ref | Ref para controle do template |
| `title` | string | Título (geralmente vazio) |
| `height` | number | Altura do container |
| `width` | string/number | Largura |
| `dataSource` | DataSource | Fonte de dados V2 |
| `pageSize` | number | Itens por página |
| `isLoading` | boolean | Estado de carregamento |
| `error` | Error | Erro atual |
| `userActions` | object | Ações CRUD do toolbar |
| `userRowActions` | object | Ações por linha |
| `columns` | ReactNode | Colunas do grid |
| `filterType` | string | Tipo de filtro ('normal') |
| `enableRowSelection` | boolean | Habilitar seleção |
| `enableRowActions` | boolean | Habilitar ações na linha |
| `positionActionsColumn` | string | Posição da coluna de ações |

---

## Comparação de Templates

| Template | Uso Recomendado | Características |
|----------|-----------------|-----------------|
| `ArchbaseGridTemplate` | **List views CRUD** | Grid com paginação, filtros, ações CRUD |
| `ArchbaseFormTemplate` | Formulários de edição | Binding automático, ações de salvar |
| `ArchbaseSpaceTemplate` | Views complexas | Header customizado, conteúdo flexível |
| `ArchbasePanelTemplate` | Listas simples sem paginação | Grid básico |
| `ArchbaseModalTemplate` | Modais/Dialogs | Modal com actions |

---

## ArchbaseModalTemplate

Template para modais.

```typescript
<ArchbaseModalTemplate
  title="Detalhes"
  size="80%"
  height="700px"
  opened={opened}
  onClickOk={() => {
    handleSave()
    onClose()
  }}
  onClickCancel={onClose}
  onClose={onClose}
  okButtonLabel="Salvar"
>
  <Stack gap="md">
    {/* Conteúdo do modal */}
  </Stack>
</ArchbaseModalTemplate>
```

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `title` | string | Título do modal |
| `opened` | boolean | Controla abertura |
| `size` | string | Tamanho do modal |
| `height` | string | Altura do modal |
| `onClickOk` | function | Ao clicar OK |
| `onClickCancel` | function | Ao clicar Cancelar |
| `onClose` | function | Ao fechar |
| `okButtonLabel` | string | Texto do botão OK |
