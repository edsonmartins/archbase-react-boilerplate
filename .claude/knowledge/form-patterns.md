# Archbase Form Patterns - Guia Completo

## Estrutura Base do Formulário

Existem dois padrões para formulários:
- **V1**: `useArchbaseRemoteDataSource` - Para código legado
- **V2**: `useArchbaseRemoteDataSourceV2` - **RECOMENDADO para novos projetos**

**IMPORTANTE**: **NÃO use** `useElementSize` ou `useArchbaseSize` em formulários - causa loop de renderização infinito!

---

## Padrão V2 - useArchbaseRemoteDataSourceV2 (RECOMENDADO)

O padrão V2 oferece melhor integração de tipos e não requer cast `as any`.

```typescript
import { useEffect, useRef } from 'react'
import { ScrollArea, Grid, Stack, LoadingOverlay } from '@mantine/core'
import { useArchbaseRemoteDataSourceV2, useArchbaseRemoteServiceApi, useArchbaseStore } from '@archbase/data'
import { ArchbaseFormTemplate } from '@archbase/template'
import { ArchbaseDialog, ArchbaseNotifications, ArchbaseEdit } from '@archbase/components'
import { useArchbaseValidator, useArchbaseTranslation } from '@archbase/core'
import { useArchbaseNavigationListener } from '@archbase/admin'
import { useLocation, useParams } from 'react-router'
import { useSearchParams } from 'react-router-dom'

export function UserForm() {
  const { t } = useArchbaseTranslation()
  const location = useLocation()
  const { id } = useParams()
  const validator = useArchbaseValidator()
  const [searchParams] = useSearchParams()
  const action = searchParams.get('action') || ''

  // 1. Store com nome fixo (NÃO usar ID dinâmico)
  const templateStore = useArchbaseStore('userFormStore')
  const { closeAllowed } = useArchbaseNavigationListener(location.pathname, () => {
    templateStore.clearAllValues()
    closeAllowed()
  })
  const serviceApi = useArchbaseRemoteServiceApi<UserService>(API_TYPE.User)

  // 2. CRÍTICO: Comparação case-insensitive para action
  const isAddAction = action.toUpperCase() === 'ADD'
  const isEditAction = action.toUpperCase() === 'EDIT'
  const isViewAction = action.toUpperCase() === 'VIEW'

  // 3. ✅ useArchbaseRemoteDataSourceV2 - PADRÃO RECOMENDADO
  const { dataSource, isLoading } = useArchbaseRemoteDataSourceV2<UserDto>({
    name: 'dsUser',
    label: String(t('my-app:Usuário')),
    service: serviceApi,
    pageSize: 50,
    defaultSortFields: ['nome'],
    validator,
    onError: (error) => {
      ArchbaseNotifications.showError(String(t('my-app:Atenção')), error)
    }
  })

  // 4. Flag para garantir que loadRecord só execute uma vez
  const hasLoadedRef = useRef(false)

  // 5. Carrega o registro no useEffect
  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    const loadRecord = async () => {
      if (isAddAction) {
        dataSource.setRecords([])
        const newRecord = UserDto.newInstance()  // ✅ Usa __isNew: true e UUID
        dataSource.insert(newRecord)
      } else if ((isEditAction || isViewAction) && id) {
        try {
          const record = await serviceApi.findOne(id)
          const dto = new UserDto(record)
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
        String(t('my-app:Deseja cancelar?')),
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

  // 4. ✅ CORRETO: Sem useElementSize, usar ScrollArea com height: '100%'
  return (
    <ArchbaseFormTemplate
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
                label={String(t('my-app:Nome'))}
                dataSource={dataSource}
                dataField="nome"
                placeholder={String(t('my-app:Digite o nome'))}
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

## Layouts de Campos

### Layout Vertical com Larguras (PADRÃO RECOMENDADO)

**IMPORTANTE**: Os formulários usam layout **VERTICAL** com `Stack`. Campos são empilhados um abaixo do outro, e campos curtos recebem `width` fixo para não ocupar toda a largura.

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

```typescript
import { Stack } from '@mantine/core'

<Stack gap="md">
  <ArchbaseEdit
    dataSource={ds}
    dataField="id"
    label="Identificador"
    width={320}
    readOnly
  />
  <ArchbaseEdit
    dataSource={ds}
    dataField="codigo"
    label="Código"
    width={150}
  />
  <ArchbaseEdit
    dataSource={ds}
    dataField="nome"
    label="Nome"
    // sem width - ocupa largura total
  />
  <ArchbaseEdit
    dataSource={ds}
    dataField="descricao"
    label="Descrição"
    // sem width - ocupa largura total
  />
  <ArchbaseSelect
    dataSource={ds}
    dataField="status"
    label="Status"
    width={250}
    options={statusOptions}
    getOptionLabel={(opt) => opt.name}
    getOptionValue={(opt) => opt.id}
  />
  <ArchbaseMaskEdit
    dataSource={ds}
    dataField="cpf"
    label="CPF"
    mask="000.000.000-00"
    width={180}
  />
  <ArchbaseMaskEdit
    dataSource={ds}
    dataField="telefone"
    label="Telefone"
    mask="(00) 00000-0000"
    width={180}
  />
  <ArchbaseEdit
    dataSource={ds}
    dataField="email"
    label="E-mail"
    width={350}
  />
  <ArchbaseNumberEdit
    dataSource={ds}
    dataField="valor"
    label="Valor"
    width={180}
    precision={2}
  />
  <ArchbaseSwitch
    dataSource={ds}
    dataField="ativo"
    label="Ativo"
    // switch não precisa de width
  />
  <ArchbaseTextArea
    dataSource={ds}
    dataField="observacao"
    label="Observação"
    minRows={3}
    // sem width - ocupa largura total
  />
</Stack>
```

### Princípios de Design

1. **Layout VERTICAL** - usar `Stack`, campos um abaixo do outro
2. **Campos curtos com `width`** - códigos, CPF, telefone, valores monetários
3. **Campos longos sem `width`** - nome, descrição, TextArea ocupam 100%
4. **Switch/Checkbox** - não precisam de width
5. **NÃO usar Grid.Col** - evitar layout horizontal lado a lado

## Form com Tabs

```typescript
import { Tabs } from '@mantine/core'

<Paper withBorder style={{ height: safeHeight }}>
  <Tabs defaultValue="basic" style={{ height: '100%' }}>
    <Tabs.List>
      <Tabs.Tab value="basic">Dados Básicos</Tabs.Tab>
      <Tabs.Tab value="address">Endereço</Tabs.Tab>
      <Tabs.Tab value="contact">Contato</Tabs.Tab>
    </Tabs.List>

    <Tabs.Panel value="basic" style={{ height: 'calc(100% - 40px)' }}>
      <Box p="md" style={{ overflowY: 'auto', height: '100%' }}>
        <Group grow mb="md">
          <ArchbaseEdit dataSource={ds} dataField="name" label="Nome" />
          <ArchbaseEdit dataSource={ds} dataField="email" label="E-mail" />
        </Group>
        <ArchbaseSwitch dataSource={ds} dataField="active" label="Ativo" />
      </Box>
    </Tabs.Panel>

    <Tabs.Panel value="address" style={{ height: 'calc(100% - 40px)' }}>
      <Box p="md" style={{ overflowY: 'auto', height: '100%' }}>
        <Grid>
          <Grid.Col span={{ base: 12, md: 3 }}>
            <ArchbaseMaskEdit dataSource={ds} dataField="zipCode" label="CEP" mask="00000-000" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 9 }}>
            <ArchbaseEdit dataSource={ds} dataField="street" label="Rua" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <ArchbaseEdit dataSource={ds} dataField="number" label="Número" />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <ArchbaseEdit dataSource={ds} dataField="city" label="Cidade" />
          </Grid.Col>
        </Grid>
      </Box>
    </Tabs.Panel>

    <Tabs.Panel value="contact" style={{ height: 'calc(100% - 40px)' }}>
      <Box p="md" style={{ overflowY: 'auto', height: '100%' }}>
        <Stack gap="md">
          <ArchbaseMaskEdit dataSource={ds} dataField="phone" label="Telefone" mask="(00) 00000-0000" />
          <ArchbaseMaskEdit dataSource={ds} dataField="whatsapp" label="WhatsApp" mask="(00) 00000-0000" />
        </Stack>
      </Box>
    </Tabs.Panel>
  </Tabs>
</Paper>
```

## Form com Seções

```typescript
import { Fieldset, Divider } from '@mantine/core'

<Paper withBorder style={{ height: safeHeight }}>
  <ScrollArea h={safeHeight - 20} p="md">
    <Fieldset legend="Dados Pessoais" mb="md">
      <Group grow>
        <ArchbaseEdit dataSource={ds} dataField="name" label="Nome" />
        <ArchbaseEdit dataSource={ds} dataField="email" label="E-mail" />
      </Group>
    </Fieldset>

    <Fieldset legend="Endereço" mb="md">
      <Grid>
        <Grid.Col span={4}>
          <ArchbaseMaskEdit dataSource={ds} dataField="zipCode" label="CEP" mask="00000-000" />
        </Grid.Col>
        <Grid.Col span={8}>
          <ArchbaseEdit dataSource={ds} dataField="street" label="Rua" />
        </Grid.Col>
      </Grid>
    </Fieldset>

    <Fieldset legend="Configurações">
      <Stack gap="sm">
        <ArchbaseSwitch dataSource={ds} dataField="active" label="Ativo" />
        <ArchbaseSwitch dataSource={ds} dataField="notifications" label="Receber notificações" />
      </Stack>
    </Fieldset>
  </ScrollArea>
</Paper>
```

## Form com Accordion

```typescript
import { Accordion } from '@mantine/core'

// Opções para ArchbaseSelect - CORRETO: usar options + getOptionLabel + getOptionValue
const roleOptions = [
  { id: 'admin', name: 'Administrador' },
  { id: 'user', name: 'Usuário' },
  { id: 'guest', name: 'Visitante' }
]

<Paper withBorder style={{ height: safeHeight }}>
  <ScrollArea h={safeHeight - 20}>
    <Accordion defaultValue="basic">
      <Accordion.Item value="basic">
        <Accordion.Control>Dados Básicos</Accordion.Control>
        <Accordion.Panel>
          <Stack gap="md">
            <ArchbaseEdit dataSource={ds} dataField="name" label="Nome" />
            <ArchbaseEdit dataSource={ds} dataField="email" label="E-mail" />
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="advanced">
        <Accordion.Control>Configurações Avançadas</Accordion.Control>
        <Accordion.Panel>
          <Stack gap="md">
            {/* CORRETO: ArchbaseSelect com options + getters */}
            <ArchbaseSelect
              dataSource={ds}
              dataField="role"
              label="Perfil"
              options={roleOptions}
              getOptionLabel={(opt) => opt.name}
              getOptionValue={(opt) => opt.id}
            />
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  </ScrollArea>
</Paper>
```

## Form Master-Detail

```typescript
import { ArchbaseDataGrid, ArchbaseDataGridColumn, Columns } from '@archbase/components'
import { ScrollArea, Box, Group, Stack, Text } from '@mantine/core'

function OrderForm() {
  // ...setup similar ao padrão useArchbaseRemoteDataSource...

  // DataSource do pedido (master) - vem do useArchbaseRemoteDataSource
  const { dataSource: dsOrder, isLoading } = useArchbaseRemoteDataSource<OrderDto, string>({
    name: 'dsOrder',
    // ...
  })

  // DataSource dos itens (detail) - criado separadamente
  const [dsItems] = useState(() =>
    new ArchbaseDataSource<OrderItemDto, string>('dsItems')
  )

  // Quando order carrega, popular items
  useEffect(() => {
    const order = dsOrder.getCurrentRecord()
    if (order?.items) {
      dsItems.open({ records: order.items })
    }
  }, [dsOrder.getCurrentRecord()])

  return (
    <ArchbaseFormTemplate
      dataSource={dsOrder}
      onCancel={handleCancel}
      onAfterSave={handleAfterSave}
      withBorder={false}
    >
      <ScrollArea style={{ height: '100%' }}>
        <Stack gap={0} style={{ height: '100%' }}>
          {/* Header - Dados do pedido */}
          <Box p="md" style={{ borderBottom: '1px solid #eee' }}>
            <Group grow>
              <ArchbaseEdit dataSource={dsOrder} dataField="customerName" label="Cliente" />
              <ArchbaseDatePickerEdit dataSource={dsOrder} dataField="date" label="Data" />
            </Group>
          </Box>

          {/* Body - Tabela de itens - CORRETO: ArchbaseDataGrid (não DataTable!) */}
          <Box style={{ flex: 1, minHeight: 300 }}>
            <ArchbaseDataGrid
              dataSource={dsItems}
              height={300}
            >
              <Columns>
                <ArchbaseDataGridColumn
                  dataField="productName"
                  header="Produto"
                  size={200}
                  dataType="text"
                />
                <ArchbaseDataGridColumn
                  dataField="quantity"
                  header="Qtd"
                  size={80}
                  dataType="integer"
                />
                <ArchbaseDataGridColumn
                  dataField="price"
                  header="Preço"
                  size={100}
                  dataType="currency"
                />
              </Columns>
            </ArchbaseDataGrid>
          </Box>

          {/* Footer - Totais */}
          <Box p="md" style={{ borderTop: '1px solid #eee' }}>
            <Group justify="flex-end">
              <Text fw={700}>Total: R$ {total.toFixed(2)}</Text>
            </Group>
          </Box>
        </Stack>
      </ScrollArea>
    </ArchbaseFormTemplate>
  )
}
```

## Validação Condicional

```typescript
const schema = yup.object({
  personType: yup.string().required(),
  cpf: yup.string().when('personType', {
    is: 'PF',
    then: (schema) => schema.required('CPF obrigatório').matches(/^\d{11}$/, 'CPF inválido'),
    otherwise: (schema) => schema.notRequired()
  }),
  cnpj: yup.string().when('personType', {
    is: 'PJ',
    then: (schema) => schema.required('CNPJ obrigatório').matches(/^\d{14}$/, 'CNPJ inválido'),
    otherwise: (schema) => schema.notRequired()
  })
})

// Opções para tipo de pessoa
const personTypeOptions = [
  { id: 'PF', name: 'Pessoa Física' },
  { id: 'PJ', name: 'Pessoa Jurídica' }
]

function PersonForm() {
  const personType = dataSource.getFieldValue('personType')

  return (
    <>
      {/* CORRETO: ArchbaseSelect com options + getters */}
      <ArchbaseSelect
        dataSource={dataSource}
        dataField="personType"
        label="Tipo de Pessoa"
        options={personTypeOptions}
        getOptionLabel={(opt) => opt.name}
        getOptionValue={(opt) => opt.id}
      />

      {personType === 'PF' && (
        <ArchbaseMaskEdit
          dataSource={dataSource}
          dataField="cpf"
          label="CPF"
          mask="000.000.000-00"
        />
      )}

      {personType === 'PJ' && (
        <ArchbaseMaskEdit
          dataSource={dataSource}
          dataField="cnpj"
          label="CNPJ"
          mask="00.000.000/0000-00"
        />
      )}
    </>
  )
}
```

## Campos Dependentes

```typescript
function AddressFields() {
  const [cities, setCities] = useState<CityOption[]>([])

  // Buscar cidades quando estado mudar
  const handleStateChange = async (stateId: string) => {
    const cityList = await cityService.findByState(stateId)
    setCities(cityList)
  }

  useEffect(() => {
    const stateId = dataSource.getFieldValue('stateId')
    if (stateId) {
      handleStateChange(stateId)
    }
  }, [dataSource.getFieldValue('stateId')])

  return (
    <>
      {/* CORRETO: ArchbaseSelect com options + getters */}
      <ArchbaseSelect
        dataSource={dataSource}
        dataField="stateId"
        label="Estado"
        options={states}
        getOptionLabel={(opt) => opt.name}
        getOptionValue={(opt) => opt.id}
        onChange={(value) => {
          // Limpar cidade quando mudar estado
          dataSource.setFieldValue('cityId', null)
          if (value) handleStateChange(value)
        }}
      />
      <ArchbaseSelect
        dataSource={dataSource}
        dataField="cityId"
        label="Cidade"
        options={cities}
        getOptionLabel={(opt) => opt.name}
        getOptionValue={(opt) => opt.id}
        disabled={cities.length === 0}
      />
    </>
  )
}
```

## Resumo de Correções Críticas

| Errado | Correto |
|--------|---------|
| `{ ref, height } = useArchbaseSize()` | `[width, height] = useArchbaseSize(ref)` com `ref = useRef()` |
| `new ArchbaseDataSource({ name, initialData, validator })` | `new ArchbaseDataSource('dsName')` + `setValidator()` separado |
| `dataSource.setData([data])` | `dataSource.open({ records: [data] })` |
| `dataSource.append({})` | `dataSource.insert({})` |
| `dataSource.post()` | `dataSource.save()` |
| `service.findById(id)` | `service.findOne(id)` |
| `<ArchbaseSelect data={[...]}>` | `<ArchbaseSelect options getOptionLabel getOptionValue>` |
| `<ArchbaseDataTable columns={[...]}>` | `<ArchbaseDataGrid><Columns>...</Columns></ArchbaseDataGrid>` |

## Checklist de Form

### Padrão V2 - useArchbaseRemoteDataSourceV2 (RECOMENDADO)
- [ ] **CRÍTICO**: NÃO usar `useElementSize` ou `useArchbaseSize` - causam loop de renderização!
- [ ] Usar `ScrollArea` com `style={{ height: '100%' }}` para scroll interno
- [ ] Usar `useArchbaseStore('nomeFixo')` - NÃO usar ID dinâmico
- [ ] Usar `useArchbaseRemoteDataSourceV2` - **SEM cast `as any`**
- [ ] Usar `useRef(false)` + `useEffect` para carregar registro uma única vez
- [ ] **CRÍTICO**: Comparar action com `toUpperCase()`: `action.toUpperCase() === 'ADD'`
- [ ] Usar `dataSource.setRecords([dto])` para carregar registro existente
- [ ] Usar `dataSource.insert(Dto.newInstance())` para novo registro
- [ ] Usar `dataSource.edit()` para entrar em modo edição
- [ ] Todos os campos com `dataSource` e `dataField` - **SEM cast!**
- [ ] Usar `onAfterSave` para limpar store e fechar
- [ ] Handler de cancel usando `!isViewAction`
- [ ] Usar `findOne()` (não `findById()`) no service
- [ ] Chamar `save()` (não `post()`) após salvar

### Diferenças V1 vs V2

| V1 (useArchbaseRemoteDataSource) | V2 (useArchbaseRemoteDataSourceV2) |
|----------------------------------|-----------------------------------|
| `onLoadComplete` callback | `useEffect` com `hasLoadedRef` |
| Precisa de cast `as any` | **Não precisa de cast** |
| `store: templateStore` obrigatório | Opcional |
| `loadOnStart` / `id` props | Carrega manualmente no `useEffect` |
