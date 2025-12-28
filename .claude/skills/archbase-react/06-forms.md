# 06. Forms - Padrões e Layout

Padrões completos para formulários com Archbase React.

---

## Form Pattern - useArchbaseRemoteDataSourceV2 (RECOMENDADO)

O padrão V2 é **recomendado** porque:
- Não requer cast `as any` para passar dataSource aos componentes
- Implementa a interface `IArchbaseDataSourceBase<T>`
- Melhor performance com menos re-renders

### Comparação de Action (CRÍTICO!)

**CRÍTICO**: As constantes de action no sistema são em **minúsculas** (`'add'`, `'edit'`, `'view'`). Use comparação case-insensitive:

```typescript
// CORRETO: Comparação case-insensitive
const isAddAction = action.toUpperCase() === 'ADD'
const isEditAction = action.toUpperCase() === 'EDIT'
const isViewAction = action.toUpperCase() === 'VIEW'

// ERRADO: Comparação direta pode falhar
// if (action === 'ADD') { ... }  // Falha se action === 'add'
```

### Exemplo Completo

```typescript
import { useEffect, useRef } from 'react'
import { Grid, Stack, LoadingOverlay } from '@mantine/core'
import { useArchbaseRemoteDataSourceV2, useArchbaseRemoteServiceApi, useArchbaseStore } from '@archbase/data'
import { ArchbaseFormTemplate } from '@archbase/template'
import { ArchbaseDialog, ArchbaseNotifications, ArchbaseEdit, ArchbaseSwitch } from '@archbase/components'
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

  // Store com nome fixo (NÃO usar ID dinâmico)
  const templateStore = useArchbaseStore('userFormStore')
  const { closeAllowed } = useArchbaseNavigationListener(location.pathname, () => {
    templateStore.clearAllValues()
    closeAllowed()
  })
  const serviceApi = useArchbaseRemoteServiceApi<UserService>(API_TYPE.User)

  // Comparação case-insensitive
  const isAddAction = action.toUpperCase() === 'ADD'
  const isEditAction = action.toUpperCase() === 'EDIT'
  const isViewAction = action.toUpperCase() === 'VIEW'

  // useArchbaseRemoteDataSourceV2 - PADRÃO RECOMENDADO
  const { dataSource, isLoading } = useArchbaseRemoteDataSourceV2<UserDto>({
    name: 'dsUser',
    label: String(t('gestor-rq-admin:Usuário')),
    service: serviceApi,
    pageSize: 50,
    defaultSortFields: ['nome'],
    validator,
    onError: (error) => {
      ArchbaseNotifications.showError(String(t('gestor-rq-admin:Atenção')), error)
    }
  })

  // Flag para garantir que loadRecord só execute uma vez
  const hasLoadedRef = useRef(false)

  // Carrega o registro apenas uma vez
  useEffect(() => {
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    const loadRecord = async () => {
      if (isAddAction) {
        dataSource.setRecords([])
        const newRecord = UserDto.newInstance()  // Usa __isNew: true e UUID
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
          ArchbaseNotifications.showError(String(t('gestor-rq-admin:Atenção')), String(error))
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

  // dataSource pode ser passado diretamente - SEM CAST!
  return (
    <ArchbaseFormTemplate
      dataSource={dataSource}
      onCancel={handleCancel}
      onAfterSave={handleAfterSave}
      withBorder={false}
    >
      <LoadingOverlay visible={isLoading} />
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="md">
            <ArchbaseEdit<UserDto, string>
              label={String(t('gestor-rq-admin:Nome'))}
              dataSource={dataSource}
              dataField="nome"
              placeholder={String(t('gestor-rq-admin:Digite o nome'))}
              required
            />
            <ArchbaseSwitch<UserDto, boolean>
              label={String(t('gestor-rq-admin:Ativo'))}
              dataSource={dataSource}
              dataField="ativo"
            />
          </Stack>
        </Grid.Col>
      </Grid>
    </ArchbaseFormTemplate>
  )
}
```

---

## Layout Vertical com Larguras

**IMPORTANTE**: Os formulários usam layout **VERTICAL** com `Stack`. Campos são empilhados, e campos curtos recebem `width` fixo.

### Tabela de Larguras

| Tipo de Campo | Width | Exemplos |
|--------------|-------|----------|
| ID/UUID | 320 | id, identificador |
| Códigos curtos | 120-150 | código, sigla |
| CPF | 180 | cpf |
| CNPJ | 200 | cnpj |
| Telefone | 180 | telefone, celular |
| Valores monetários | 180 | preço, valor |
| Números inteiros | 120-150 | quantidade, tempo |
| Datas | 180 | data nascimento |
| E-mail | 350 | email |
| Selects curtos | 250 | status, tipo |
| Nome/Descrição | (sem width) | largura total |
| TextArea | (sem width) | largura total |

### Exemplo de Layout

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
  <ArchbaseEdit
    label="Descrição"
    dataSource={dataSource}
    dataField="descricao"
    // sem width - ocupa largura total
  />
  <ArchbaseSelect
    label="Status"
    dataSource={dataSource}
    dataField="status"
    width={250}
  />
  <ArchbaseMaskEdit
    label="CPF"
    dataSource={dataSource}
    dataField="cpf"
    mask="000.000.000-00"
    width={180}
  />
  <ArchbaseMaskEdit
    label="Telefone"
    dataSource={dataSource}
    dataField="telefone"
    mask="(00) 00000-0000"
    width={180}
  />
  <ArchbaseNumberEdit
    label="Valor"
    dataSource={dataSource}
    dataField="valor"
    width={180}
    precision={2}
  />
  <ArchbaseSwitch
    label="Ativo"
    dataSource={dataSource}
    dataField="ativo"
    // switch não precisa de width
  />
  <ArchbaseTextArea
    label="Observação"
    dataSource={dataSource}
    dataField="observacao"
    minRows={3}
    // sem width - ocupa largura total
  />
</Stack>
```

### Princípios

1. **Layout VERTICAL** - usar `Stack`, campos um abaixo do outro
2. **Campos curtos com `width`** - códigos, CPF, telefone, valores
3. **Campos longos sem `width`** - nome, descrição, TextArea ocupam 100%
4. **Switch/Checkbox** - não precisam de width
5. **NÃO usar Grid.Col** - evitar layout horizontal lado a lado

---

## Erros Comuns em Forms

| Errado | Correto |
|--------|---------|
| `forceUpdate()` no onLoadComplete | **NÃO usar** - causa loop |
| `useElementSize` no form | **NÃO usar** - usar `ScrollArea` |
| Store com ID dinâmico | Nome fixo `'formStore'` |
| `action === 'ADD'` | `action.toUpperCase() === 'ADD'` |
| `const ds = dataSource as any` | Usar V2 sem cast |

---

## Resumo de Correções

| Documentação Anterior | Correto |
|-----------------------|---------|
| `dataSource.post()` | `dataSource.save()` |
| `dataSource.append({})` | `dataSource.insert({})` |
| `forceUpdate()` | Não usar - DataSource é reativo |
| `useElementSize` | `ScrollArea` com `height: '100%'` |
| Store dinâmico | Store fixo |
| Action direta | Action case-insensitive |
