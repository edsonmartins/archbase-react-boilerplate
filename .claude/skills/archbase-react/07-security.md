# 07. Sistema de Segurança

O Archbase React v3 possui um sistema completo de segurança para controle de acesso baseado em permissões.

---

## Conceito

O sistema de segurança controla o que cada usuário pode fazer na aplicação:
- **Permissões carregadas por view** - Ao abrir uma view/form, o sistema registra o recurso e obtém as permissões
- **Comportamento: Desabilitar** - Botões/ações sem permissão ficam desabilitados (não ocultos)
- **Administradores** - Usuários admin têm acesso total automaticamente

---

## Componentes Principais

### 1. ArchbaseSecurityProvider (Global)

Provider global que envolve toda a aplicação:

```typescript
// App.tsx
import { ArchbaseSecurityProvider } from '@archbase/security'

// Criar objeto de usuário compatível
const securityUser = currentUser ? {
  id: currentUser.id,
  name: currentUser.displayName,
  email: currentUser.email,
  isAdministrator: currentUser.isAdmin, // IMPORTANTE: boolean, não método!
  // ... outros campos do UserDto
} : null

<ArchbaseSecurityProvider user={securityUser}>
  <App />
</ArchbaseSecurityProvider>
```

### 2. ArchbaseViewSecurityProvider (Por View)

Wrapper para cada view que registra o recurso e carrega permissões:

```typescript
import { ArchbaseViewSecurityProvider } from '@archbase/security'

export function MyView() {
  return (
    <ArchbaseViewSecurityProvider
      resourceName="module.entity"
      resourceDescription="Entity Description"
    >
      <MyViewContent />
    </ArchbaseViewSecurityProvider>
  )
}
```

### 3. useArchbaseSecureForm (Hook)

Hook para obter permissões dentro do componente:

```typescript
import { useArchbaseSecureForm } from '@archbase/security'

function MyViewContent() {
  const { canCreate, canEdit, canDelete, canView, isLoading } =
    useArchbaseSecureForm('module.entity', 'Entity Description')

  // Usar permissões para habilitar/desabilitar ações
  const userRowActions = {
    onAddRow: canCreate ? handleAdd : undefined,
    onEditRow: canEdit ? handleEdit : undefined,
    onRemoveRow: canDelete ? handleRemove : undefined,
    onViewRow: canView ? handleView : undefined
  }

  return (
    <ArchbaseGridTemplate
      userActions={{
        visible: true,
        allowRemove: canDelete,
        onAddExecute: canCreate ? handleAdd : undefined,
        onEditExecute: canEdit ? handleEdit : undefined,
        onRemoveExecute: canDelete ? handleRemove : undefined,
        onViewExecute: canView ? handleView : undefined
      }}
      userRowActions={userRowActions}
    />
  )
}
```

---

## Convenção de Nomenclatura

### Padrão: `{modulo}.{entidade}`

```
catalog.product       - Products
catalog.category      - Categories
sales.order           - Orders
sales.customer        - Customers
admin.user            - Users
```

### Ações Padrão

- `view` - Visualizar registro
- `create` - Criar novo registro
- `edit` - Editar registro existente
- `delete` - Excluir registro
- `list` - Listar registros

---

## Hook Customizado (Recomendado)

Crie um hook customizado para centralizar recursos de segurança:

```typescript
// src/hooks/useAppSecurity.ts
import { useArchbaseSecureForm } from '@archbase/security'

export const APP_SECURITY_RESOURCES = {
  PRODUCT: { name: 'catalog.product', description: 'Products' },
  CATEGORY: { name: 'catalog.category', description: 'Categories' },
  ORDER: { name: 'sales.order', description: 'Orders' },
  CUSTOMER: { name: 'sales.customer', description: 'Customers' },
  USER: { name: 'admin.user', description: 'Users' },
}

export function useAppSecurity({
  module,
  entity,
  description
}: {
  module: string
  entity: string
  description: string
}) {
  const resourceName = `${module}.${entity}`
  return useArchbaseSecureForm(resourceName, description)
}

// Uso:
const { canCreate, canEdit, canDelete, canView } = useAppSecurity({
  module: 'catalog',
  entity: 'product',
  description: 'Products'
})

// Ou usando constantes:
const { canCreate, canEdit, canDelete, canView } = useArchbaseSecureForm(
  APP_SECURITY_RESOURCES.PRODUCT.name,
  APP_SECURITY_RESOURCES.PRODUCT.description
)
```

---

## Exemplo Completo: ListView com Segurança

```typescript
import { ArchbaseViewSecurityProvider, useArchbaseSecureForm } from '@archbase/security'
import { APP_SECURITY_RESOURCES } from '../../../hooks'

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

function ProductListViewContent() {
  const { t } = useArchbaseTranslation()
  const { canCreate, canEdit, canDelete, canView } = useArchbaseSecureForm(
    APP_SECURITY_RESOURCES.PRODUCT.name,
    APP_SECURITY_RESOURCES.PRODUCT.description
  )

  const userRowActions: UserRowActionsOptions<ProductDto> = {
    actions: ArchbaseGridRowActions,
    onAddRow: canCreate ? handleAddProduct : undefined,
    onEditRow: canEdit ? handleEditProduct : undefined,
    onRemoveRow: canDelete ? handleRemoveProduct : undefined,
    onViewRow: canView ? handleViewProduct : undefined
  }

  return (
    <ArchbaseGridTemplate
      userActions={{
        visible: true,
        allowRemove: canDelete,
        onAddExecute: canCreate ? handleAddProduct : undefined,
        onEditExecute: canEdit ? handleEditProduct : undefined,
        onRemoveExecute: canDelete ? handleRemoveProduct : undefined,
        onViewExecute: canView ? handleViewProduct : undefined
      }}
      userRowActions={userRowActions}
      // ...
    />
  )
}
```

---

## Exemplo Completo: Form com Segurança

```typescript
import { ArchbaseViewSecurityProvider, useArchbaseSecureForm } from '@archbase/security'
import { APP_SECURITY_RESOURCES } from '../../../hooks'

export function ProductForm() {
  return (
    <ArchbaseViewSecurityProvider
      resourceName={APP_SECURITY_RESOURCES.PRODUCT.name}
      resourceDescription={APP_SECURITY_RESOURCES.PRODUCT.description}
    >
      <ProductFormContent />
    </ArchbaseViewSecurityProvider>
  )
}

function ProductFormContent() {
  const { canCreate, canEdit } = useArchbaseSecureForm(
    APP_SECURITY_RESOURCES.PRODUCT.name,
    APP_SECURITY_RESOURCES.PRODUCT.description
  )

  const isAddAction = action.toUpperCase() === 'ADD'
  const isEditAction = action.toUpperCase() === 'EDIT'

  // Verifica se pode salvar baseado na ação e permissão
  const canSave = isAddAction ? canCreate : (isEditAction ? canEdit : false)

  return (
    <ArchbaseFormTemplate
      dataSource={dataSource}
      // O template já verifica permissões internamente
    >
      {/* Campos do form */}
    </ArchbaseFormTemplate>
  )
}
```

---

## Fluxo de Carregamento de Permissões

1. **Usuário abre view** → `ArchbaseViewSecurityProvider` é montado
2. **SecurityManager criado** → com `resourceName` e `resourceDescription`
3. **Chama backend** → `POST /api/v1/resource/register`
4. **Backend responde** → `ResourcePermissionsDto { resourceName, permissions[] }`
5. **Componentes verificam** → `canCreate`, `canEdit`, `canDelete`, `canView`

---

## Endpoint Backend

```
POST /api/v1/resource/register

Request:
{
  "resource": {
    "resourceName": "catalog.product",
    "resourceDescription": "Products"
  },
  "actions": [
    { "actionName": "create", "actionDescription": "Create Products" },
    { "actionName": "edit", "actionDescription": "Edit Products" },
    { "actionName": "delete", "actionDescription": "Delete Products" },
    { "actionName": "view", "actionDescription": "View Products" },
    { "actionName": "list", "actionDescription": "List Products" }
  ]
}

Response:
{
  "resourceName": "catalog.product",
  "permissions": ["create", "edit", "view", "list"]
}
```

---

## Checklist de Implementação

- [ ] Configurar `ArchbaseSecurityProvider` no `App.tsx` com `securityUser`
- [ ] Criar constantes de recurso em `src/hooks/useAppSecurity.ts`
- [ ] Envolver view com `ArchbaseViewSecurityProvider`
- [ ] Criar função `*Content` interna para o conteúdo
- [ ] Usar `useArchbaseSecureForm` para obter permissões
- [ ] Aplicar `canCreate`, `canEdit`, `canDelete`, `canView` nas ações
- [ ] Remover verificação `isAdministrator()` antiga
- [ ] Testar com usuário admin e não-admin
