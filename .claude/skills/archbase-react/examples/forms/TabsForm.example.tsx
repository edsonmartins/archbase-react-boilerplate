/**
 * Exemplo: Formulário com Tabs
 *
 * Este exemplo demonstra como criar um formulário complexo
 * com múltiplas abas usando Mantine Tabs.
 *
 * IMPORTANTE: Este exemplo usa as APIs corretas da biblioteca archbase-react-v3
 */

import { useState, useEffect, useRef } from 'react'
import { Paper, Box, Group, Grid, Tabs, Stack, ScrollArea } from '@mantine/core'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import {
  ArchbaseDataSource,
  ArchbaseValidator,
  ArchbaseEdit,
  ArchbaseSelect,
  ArchbaseSwitch,
  ArchbaseMaskEdit,
  ArchbaseDatePickerEdit,
  ArchbaseTextArea,
  ArchbaseNumberEdit
} from '@archbase/components'
import { ArchbaseFormTemplate, useArchbaseSize } from '@archbase/template'
import { useArchbaseRemoteServiceApi } from '@archbase/data'

import { API_TYPE } from '@ioc/IOCTypes'
import type { CustomerService } from '@services/CustomerService'
import type { CustomerDto } from '@domain/CustomerDto'

// ===========================================
// TIPOS
// ===========================================
interface CustomerFormProps {
  id?: string
  action: 'NEW' | 'EDIT' | 'VIEW'
  onClose: () => void
}

// Interfaces para opções
interface PersonTypeOption {
  id: string
  name: string
}

interface StateOption {
  id: string
  name: string
}

interface PaymentOption {
  id: string
  name: string
}

// ===========================================
// COMPONENTE
// ===========================================
export function CustomerForm({ id, action, onClose }: CustomerFormProps) {
  // CORRETO: useArchbaseSize retorna [width, height]
  const ref = useRef<HTMLDivElement>(null)
  const [width, height] = useArchbaseSize(ref)
  const safeHeight = height > 0 ? height - 130 : 600
  const tabContentHeight = safeHeight - 60

  // CORRETO: construtor simples + setValidator
  const [dataSource] = useState(() => {
    const ds = new ArchbaseDataSource<CustomerDto, string>('dsCustomer')
    ds.setValidator(new ArchbaseValidator())
    return ds
  })

  const customerService = useArchbaseRemoteServiceApi<CustomerService>(API_TYPE.CustomerService)
  const queryClient = useQueryClient()

  // CORRETO: usar findOne, não findById
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.findOne(id!),
    enabled: !!id && action !== 'NEW'
  })

  const saveMutation = useMutation({
    mutationFn: (customer: CustomerDto) => customerService.save(customer),
    onSuccess: () => {
      // CORRETO: usar save(), não post()
      dataSource.save()
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      onClose()
    }
  })

  useEffect(() => {
    if (data) {
      // CORRETO: usar open(), não setData()
      dataSource.open({ records: [data] })
      if (action === 'EDIT') dataSource.edit()
    } else if (action === 'NEW') {
      // CORRETO: usar insert(), não append()
      dataSource.insert({
        personType: 'PF',
        active: true
      } as CustomerDto)
    }
  }, [data, action])

  const handleSave = async () => {
    const errors = dataSource.validate()
    if (errors && errors.length > 0) return
    const current = dataSource.getCurrentRecord()
    if (current) {
      saveMutation.mutate(current)
    }
  }

  const isViewOnly = action === 'VIEW'

  // CORRETO: opções com id/name para usar com getOptionLabel/getOptionValue
  const personTypeOptions: PersonTypeOption[] = [
    { id: 'PF', name: 'Pessoa Física' },
    { id: 'PJ', name: 'Pessoa Jurídica' }
  ]

  const stateOptions: StateOption[] = [
    { id: 'SP', name: 'São Paulo' },
    { id: 'RJ', name: 'Rio de Janeiro' },
    { id: 'MG', name: 'Minas Gerais' },
  ]

  const paymentOptions: PaymentOption[] = [
    { id: 'CASH', name: 'À Vista' },
    { id: '30D', name: '30 dias' },
    { id: '30_60D', name: '30/60 dias' },
    { id: '30_60_90D', name: '30/60/90 dias' }
  ]

  return (
    <ArchbaseFormTemplate
      innerRef={ref}
      title={action === 'NEW' ? 'Novo Cliente' : action === 'EDIT' ? 'Editar Cliente' : 'Visualizar Cliente'}
      dataSource={dataSource}
      isLoading={isLoading || saveMutation.isPending}
      isError={isError}
      error={error}
      withBorder={false}
      onCancel={onClose}
      onBeforeSave={handleSave}
    >
      <Paper ref={ref} withBorder style={{ height: safeHeight }}>
        <Tabs defaultValue="basic" style={{ height: '100%' }}>
          {/* Lista de Tabs */}
          <Tabs.List>
            <Tabs.Tab value="basic">Dados Básicos</Tabs.Tab>
            <Tabs.Tab value="address">Endereço</Tabs.Tab>
            <Tabs.Tab value="contact">Contato</Tabs.Tab>
            <Tabs.Tab value="financial">Financeiro</Tabs.Tab>
          </Tabs.List>

          {/* Tab: Dados Básicos */}
          <Tabs.Panel value="basic" style={{ height: tabContentHeight }}>
            <ScrollArea h={tabContentHeight} p="md">
              <Stack gap="md">
                <Group grow>
                  <ArchbaseEdit
                    dataSource={dataSource}
                    dataField="name"
                    label="Nome/Razão Social"
                    required
                    readOnly={isViewOnly}
                  />
                </Group>

                <Group grow>
                  <ArchbaseEdit
                    dataSource={dataSource}
                    dataField="email"
                    label="E-mail"
                    required
                    readOnly={isViewOnly}
                  />
                </Group>

                <Grid>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    {/* CORRETO: usar options + getOptionLabel + getOptionValue */}
                    <ArchbaseSelect<CustomerDto, string, PersonTypeOption>
                      dataSource={dataSource}
                      dataField="personType"
                      label="Tipo de Pessoa"
                      options={personTypeOptions}
                      getOptionLabel={(opt) => opt.name}
                      getOptionValue={(opt) => opt.id}
                      required
                      readOnly={isViewOnly}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <ArchbaseMaskEdit
                      dataSource={dataSource}
                      dataField="cpfCnpj"
                      label="CPF/CNPJ"
                      mask={dataSource.getFieldValue('personType') === 'PF'
                        ? '000.000.000-00'
                        : '00.000.000/0000-00'}
                      required
                      readOnly={isViewOnly}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <ArchbaseDatePickerEdit
                      dataSource={dataSource}
                      dataField="birthDate"
                      label="Data de Nascimento"
                      readOnly={isViewOnly}
                    />
                  </Grid.Col>
                </Grid>

                <ArchbaseSwitch
                  dataSource={dataSource}
                  dataField="active"
                  label="Cliente Ativo"
                  readOnly={isViewOnly}
                />
              </Stack>
            </ScrollArea>
          </Tabs.Panel>

          {/* Tab: Endereço */}
          <Tabs.Panel value="address" style={{ height: tabContentHeight }}>
            <ScrollArea h={tabContentHeight} p="md">
              <Stack gap="md">
                <Grid>
                  <Grid.Col span={{ base: 12, md: 3 }}>
                    <ArchbaseMaskEdit
                      dataSource={dataSource}
                      dataField="zipCode"
                      label="CEP"
                      mask="00000-000"
                      required
                      readOnly={isViewOnly}
                    />
                  </Grid.Col>
                </Grid>

                <Grid>
                  <Grid.Col span={{ base: 12, md: 9 }}>
                    <ArchbaseEdit
                      dataSource={dataSource}
                      dataField="street"
                      label="Rua"
                      required
                      readOnly={isViewOnly}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 3 }}>
                    <ArchbaseEdit
                      dataSource={dataSource}
                      dataField="number"
                      label="Número"
                      required
                      readOnly={isViewOnly}
                    />
                  </Grid.Col>
                </Grid>

                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <ArchbaseEdit
                      dataSource={dataSource}
                      dataField="complement"
                      label="Complemento"
                      readOnly={isViewOnly}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <ArchbaseEdit
                      dataSource={dataSource}
                      dataField="neighborhood"
                      label="Bairro"
                      readOnly={isViewOnly}
                    />
                  </Grid.Col>
                </Grid>

                <Grid>
                  <Grid.Col span={{ base: 12, md: 8 }}>
                    <ArchbaseEdit
                      dataSource={dataSource}
                      dataField="city"
                      label="Cidade"
                      required
                      readOnly={isViewOnly}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    {/* CORRETO: usar options + getOptionLabel + getOptionValue */}
                    <ArchbaseSelect<CustomerDto, string, StateOption>
                      dataSource={dataSource}
                      dataField="state"
                      label="Estado"
                      options={stateOptions}
                      getOptionLabel={(opt) => opt.name}
                      getOptionValue={(opt) => opt.id}
                      required
                      readOnly={isViewOnly}
                    />
                  </Grid.Col>
                </Grid>
              </Stack>
            </ScrollArea>
          </Tabs.Panel>

          {/* Tab: Contato */}
          <Tabs.Panel value="contact" style={{ height: tabContentHeight }}>
            <ScrollArea h={tabContentHeight} p="md">
              <Stack gap="md">
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <ArchbaseMaskEdit
                      dataSource={dataSource}
                      dataField="phone"
                      label="Telefone"
                      mask="(00) 00000-0000"
                      required
                      readOnly={isViewOnly}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <ArchbaseMaskEdit
                      dataSource={dataSource}
                      dataField="whatsapp"
                      label="WhatsApp"
                      mask="(00) 00000-0000"
                      readOnly={isViewOnly}
                    />
                  </Grid.Col>
                </Grid>

                <ArchbaseEdit
                  dataSource={dataSource}
                  dataField="contactName"
                  label="Nome do Contato"
                  readOnly={isViewOnly}
                />

                <ArchbaseTextArea
                  dataSource={dataSource}
                  dataField="notes"
                  label="Observações"
                  rows={4}
                  readOnly={isViewOnly}
                />
              </Stack>
            </ScrollArea>
          </Tabs.Panel>

          {/* Tab: Financeiro */}
          <Tabs.Panel value="financial" style={{ height: tabContentHeight }}>
            <ScrollArea h={tabContentHeight} p="md">
              <Stack gap="md">
                <Grid>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    {/* CORRETO: usar precision (não decimalScale), minValue/maxValue (não min/max) */}
                    <ArchbaseNumberEdit
                      dataSource={dataSource}
                      dataField="creditLimit"
                      label="Limite de Crédito"
                      prefix="R$ "
                      precision={2}
                      thousandSeparator="."
                      decimalSeparator=","
                      readOnly={isViewOnly}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 6 }}>
                    <ArchbaseNumberEdit
                      dataSource={dataSource}
                      dataField="discount"
                      label="Desconto Padrão (%)"
                      suffix=" %"
                      precision={2}
                      minValue={0}
                      maxValue={100}
                      readOnly={isViewOnly}
                    />
                  </Grid.Col>
                </Grid>

                {/* CORRETO: usar options + getOptionLabel + getOptionValue */}
                <ArchbaseSelect<CustomerDto, string, PaymentOption>
                  dataSource={dataSource}
                  dataField="paymentCondition"
                  label="Condição de Pagamento"
                  options={paymentOptions}
                  getOptionLabel={(opt) => opt.name}
                  getOptionValue={(opt) => opt.id}
                  readOnly={isViewOnly}
                />
              </Stack>
            </ScrollArea>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </ArchbaseFormTemplate>
  )
}

export default CustomerForm
