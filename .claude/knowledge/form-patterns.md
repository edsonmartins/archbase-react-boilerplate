# Archbase Form Patterns - Guia Completo

## Estrutura Base do Formulário (Padrão useArchbaseRemoteDataSource)

**IMPORTANTE**: Este é o padrão recomendado. **NÃO use** `useElementSize` ou `useArchbaseSize` em formulários - causa loop de renderização infinito!

```typescript
import { ScrollArea, Grid, Stack, LoadingOverlay } from '@mantine/core'
import { useArchbaseRemoteDataSource, useArchbaseRemoteServiceApi, useArchbaseStore } from '@archbase/data'
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

  // 3. useArchbaseRemoteDataSource com onLoadComplete
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

## Layouts de Campos

### Campos em Linha

```typescript
<Group grow mb="md">
  <ArchbaseEdit
    dataSource={dataSource}
    dataField="firstName"
    label="Nome"
    required
    readOnly={isViewOnly}
  />
  <ArchbaseEdit
    dataSource={dataSource}
    dataField="lastName"
    label="Sobrenome"
    required
    readOnly={isViewOnly}
  />
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
  <Grid.Col span={{ base: 12, md: 4 }}>
    <ArchbaseMaskEdit dataSource={ds} dataField="phone" label="Telefone" mask="(00) 00000-0000" />
  </Grid.Col>
  <Grid.Col span={{ base: 12, md: 4 }}>
    <ArchbaseMaskEdit dataSource={ds} dataField="cpf" label="CPF" mask="000.000.000-00" />
  </Grid.Col>
  <Grid.Col span={{ base: 12, md: 4 }}>
    <ArchbaseDatePickerEdit dataSource={ds} dataField="birthDate" label="Data de Nascimento" />
  </Grid.Col>
</Grid>
```

### Stack Vertical

```typescript
import { Stack } from '@mantine/core'

<Stack gap="md">
  <ArchbaseEdit dataSource={ds} dataField="name" label="Nome" />
  <ArchbaseEdit dataSource={ds} dataField="email" label="E-mail" />
  <ArchbaseTextArea dataSource={ds} dataField="description" label="Descrição" rows={4} />
</Stack>
```

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

### Padrão Recomendado (useArchbaseRemoteDataSource)
- [ ] **CRÍTICO**: NÃO usar `useElementSize` ou `useArchbaseSize` - causam loop de renderização!
- [ ] Usar `ScrollArea` com `style={{ height: '100%' }}` para scroll interno
- [ ] Usar `useArchbaseStore('nomeFixo')` - NÃO usar ID dinâmico
- [ ] Usar `useArchbaseRemoteDataSource` com `onLoadComplete`
- [ ] **CRÍTICO**: NÃO usar `forceUpdate()` no `onLoadComplete`
- [ ] **CRÍTICO**: Comparar action com `toUpperCase()`: `action.toUpperCase() === 'ADD'`
- [ ] No `onLoadComplete`: chamar `dataSource.edit()` para EDIT, `dataSource.insert(Dto.newInstance())` para ADD
- [ ] Todos os campos com `dataSource` e `dataField`
- [ ] Usar `onAfterSave` para limpar store e fechar
- [ ] Handler de cancel usando `!isViewAction` (não `action !== 'VIEW'`)
- [ ] Usar `findOne()` (não `findById()`) no service
- [ ] DataSource carrega com `open({ records })` (não `setData`)
- [ ] Chamar `edit()` ou `insert()` (não `append()`) conforme action
- [ ] Chamar `save()` (não `post()`) após salvar
