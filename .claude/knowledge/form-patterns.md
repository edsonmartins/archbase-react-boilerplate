# Archbase Form Patterns - Guia Completo

## Estrutura Base do Formulário

Todo formulário Archbase segue este padrão:

```typescript
import { useState, useEffect, useRef } from 'react'
import { Paper, Box, Group } from '@mantine/core'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArchbaseDataSource } from '@archbase/data'
import { ArchbaseValidator, ArchbaseEdit } from '@archbase/components'
import { ArchbaseFormTemplate, useArchbaseSize } from '@archbase/template'
import { useArchbaseRemoteServiceApi } from '@archbase/data'
import * as yup from 'yup'

// 1. Definir schema de validação
const userSchema = yup.object({
  name: yup.string().required('Nome obrigatório'),
  email: yup.string().email('E-mail inválido').required('E-mail obrigatório')
})

// 2. Definir props do form
interface UserFormProps {
  id?: string
  action: 'NEW' | 'EDIT' | 'VIEW'
  onClose: () => void
}

export function UserForm({ id, action, onClose }: UserFormProps) {
  // 3. Hook de tamanho - CORRETO: useArchbaseSize retorna [width, height]
  const ref = useRef<HTMLDivElement>(null)
  const [width, height] = useArchbaseSize(ref)
  const safeHeight = height > 0 ? height - 130 : 600

  // 4. DataSource com useState - construtor simples, apenas nome
  const [dataSource] = useState(() =>
    new ArchbaseDataSource<UserDto, string>('dsUser')
  )

  // 5. Configurar validador separadamente
  useEffect(() => {
    dataSource.setValidator(new ArchbaseValidator(userSchema))
  }, [])

  // 6. Service via IoC
  const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)
  const queryClient = useQueryClient()

  // 7. Query para carregar dados - CORRETO: findOne (não findById!)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.findOne(id!),
    enabled: !!id && action !== 'NEW'
  })

  // 8. Mutation para salvar
  const saveMutation = useMutation({
    mutationFn: (user: UserDto) => userService.save(user),
    onSuccess: () => {
      dataSource.save()  // CORRETO: save() (não post!)
      queryClient.invalidateQueries({ queryKey: ['users'] })
      onClose()
    }
  })

  // 9. Effect para popular DataSource
  useEffect(() => {
    if (data) {
      dataSource.open({ records: [data] })  // CORRETO: open() (não setData!)
      if (action === 'EDIT') dataSource.edit()
    } else if (action === 'NEW') {
      dataSource.insert({ active: true } as UserDto)  // CORRETO: insert() (não append!)
    }
  }, [data, action])

  // 10. Handler de save
  const handleSave = async () => {
    const isValid = await dataSource.validate()
    if (!isValid) return
    saveMutation.mutate(dataSource.getCurrentRecord())
  }

  // 11. Flag de somente leitura
  const isViewOnly = action === 'VIEW'

  // 12. Render
  return (
    <ArchbaseFormTemplate
      innerRef={ref}                    // OBRIGATÓRIO
      title={action === 'NEW' ? 'Novo Usuário' : 'Editar Usuário'}
      dataSource={dataSource}
      isLoading={isLoading || saveMutation.isPending}
      isError={isError}
      error={error}
      withBorder={false}
      onCancel={onClose}
      onBeforeSave={handleSave}
    >
      <Paper ref={ref} withBorder style={{ height: safeHeight }}>
        <Box p="md">
          {/* Campos do formulário */}
        </Box>
      </Paper>
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

function OrderForm({ id, action, onClose }: FormProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, height] = useArchbaseSize(ref)  // CORRETO: retorna tupla
  const safeHeight = height > 0 ? height - 130 : 600

  // DataSource do pedido (master)
  const [dsOrder] = useState(() =>
    new ArchbaseDataSource<OrderDto, string>('dsOrder')
  )

  // DataSource dos itens (detail)
  const [dsItems] = useState(() =>
    new ArchbaseDataSource<OrderItemDto, string>('dsItems')
  )

  useEffect(() => {
    if (data) {
      dsOrder.open({ records: [data] })  // CORRETO: open() (não setData!)
      dsItems.open({ records: data.items || [] })  // CORRETO: open()
      if (action === 'EDIT') dsOrder.edit()
    }
  }, [data])

  return (
    <ArchbaseFormTemplate
      innerRef={ref}
      dataSource={dsOrder}
      // ...
    >
      <Paper ref={ref} withBorder style={{ height: safeHeight }}>
        <Stack gap={0} style={{ height: '100%' }}>
          {/* Header - Dados do pedido */}
          <Box p="md" style={{ borderBottom: '1px solid #eee' }}>
            <Group grow>
              <ArchbaseEdit dataSource={dsOrder} dataField="customerName" label="Cliente" />
              <ArchbaseDatePickerEdit dataSource={dsOrder} dataField="date" label="Data" />
            </Group>
          </Box>

          {/* Body - Tabela de itens - CORRETO: ArchbaseDataGrid (não DataTable!) */}
          <Box style={{ flex: 1 }}>
            <ArchbaseDataGrid
              dataSource={dsItems}
              height="100%"
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
                  dataType="number"
                />
                <ArchbaseDataGridColumn
                  dataField="price"
                  header="Preço"
                  size={100}
                  dataType="number"
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
      </Paper>
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

- [ ] Usar `useRef()` e `useArchbaseSize(ref)` que retorna `[width, height]`
- [ ] Passar `innerRef={ref}` para ArchbaseFormTemplate
- [ ] DataSource criado com `useState` e apenas nome no construtor
- [ ] Validator configurado via `dataSource.setValidator()` em useEffect
- [ ] Query com `enabled` correto para NEW vs EDIT
- [ ] Usar `findOne()` (não `findById()`) no service
- [ ] `useEffect` populando DataSource com `open({ records })` (não `setData`)
- [ ] Chamar `edit()` ou `insert()` (não `append()`) conforme action
- [ ] Chamar `save()` (não `post()`) após salvar
- [ ] Flag `isViewOnly` para campos readOnly
- [ ] Handler de save com validação
- [ ] Invalidar queries após salvar
- [ ] Paper com `height: safeHeight`
