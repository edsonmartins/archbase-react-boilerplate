# Archbase Security - Sistema de Segurança

Este documento descreve como usar o sistema de segurança do Archbase React v3.

## Visão Geral

O sistema de segurança permite controlar o acesso a funcionalidades baseado em permissões de usuário. As permissões são carregadas do backend quando uma view/form é aberta.

## Componentes Principais

### 1. ArchbaseSecurityProvider (Global)

Provider global que deve envolver toda a aplicação. Recebe o usuário logado.

```tsx
// App.tsx
import { ArchbaseSecurityProvider } from '@archbase/security'

// Criar objeto de usuário compatível
const securityUser = currentUser ? {
  id: currentUser.id,
  name: currentUser.displayName,
  email: currentUser.email,
  isAdministrator: currentUser.isAdmin,
  // ... outros campos
} : null

<ArchbaseSecurityProvider user={securityUser}>
  <App />
</ArchbaseSecurityProvider>
```

### 2. ArchbaseViewSecurityProvider (Por View)

Provider específico para cada view/form. Registra o recurso e carrega permissões do backend.

```tsx
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

Hook para obter permissões dentro de um componente.

```tsx
import { useArchbaseSecureForm } from '@archbase/security'

function MyViewContent() {
  const { canCreate, canEdit, canDelete, canView, isLoading } =
    useArchbaseSecureForm('module.entity', 'Description')

  // Usar permissões para habilitar/desabilitar ações
  return (
    <Button disabled={!canCreate} onClick={handleAdd}>
      Novo
    </Button>
  )
}
```

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

### Permissão Completa

```
catalog.product.view
catalog.product.create
catalog.product.edit
catalog.product.delete
```

## Hook Customizado: useAppSecurity

Crie um hook customizado para centralizar recursos de segurança:

```tsx
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

// Ou usando constantes
const { canCreate, canEdit, canDelete, canView } = useArchbaseSecureForm(
  APP_SECURITY_RESOURCES.PRODUCT.name,
  APP_SECURITY_RESOURCES.PRODUCT.description
)
```

## Constantes de Recursos

```tsx
import { APP_SECURITY_RESOURCES } from '../../../hooks'

APP_SECURITY_RESOURCES.PRODUCT.name        // 'catalog.product'
APP_SECURITY_RESOURCES.PRODUCT.description // 'Products'
APP_SECURITY_RESOURCES.CATEGORY.name       // 'catalog.category'
// etc.
```

## Padrão de Implementação

### ListView

```tsx
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
  const { canCreate, canEdit, canDelete, canView } = useArchbaseSecureForm(
    APP_SECURITY_RESOURCES.PRODUCT.name,
    APP_SECURITY_RESOURCES.PRODUCT.description
  )

  // Usar permissões nas ações
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

### Form

```tsx
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
  const canSave = isAddAction ? canCreate : canEdit

  return (
    <ArchbaseFormTemplate dataSource={dataSource}>
      {/* campos do form */}
    </ArchbaseFormTemplate>
  )
}
```

## Fluxo de Carregamento de Permissões

1. Usuário abre uma view
2. `ArchbaseViewSecurityProvider` é montado
3. `ArchbaseSecurityManager` é criado com o nome do recurso
4. `manager.apply()` chama `POST /api/v1/resource/register`
5. Backend registra o recurso/ações (se não existem) e retorna permissões do usuário
6. `ResourcePermissionsDto` contém `{ resourceName, permissions[] }`
7. Componentes usam `hasPermission()` para verificar acesso

## Comportamento

### Quando usuário NÃO tem permissão

- Botões ficam **desabilitados** (não ocultos)
- Usuário vê a interface completa mas não pode executar ação
- Pode-se adicionar tooltip explicando a restrição

### Quando usuário É Admin

- `isAdministrator = true` concede todas as permissões automaticamente
- `hasPermission()` sempre retorna `true` para admins

## Endpoint Backend

```
POST /api/v1/resource/register
```

Request:
```json
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
```

Response:
```json
{
  "resourceName": "catalog.product",
  "permissions": ["create", "edit", "view", "list"]
}
```

## Arquivos a Criar/Modificar

### Configuração
- `src/App.tsx` - ArchbaseSecurityProvider global

### Hooks
- `src/hooks/useAppSecurity.ts` - Hook customizado
- `src/hooks/index.ts` - Exports

### Views (exemplo)
- `src/views/catalog/products/ProductListView.tsx`
- `src/views/catalog/products/ProductForm.tsx`
- `src/views/sales/orders/OrderListView.tsx`
- `src/views/sales/orders/OrderForm.tsx`
