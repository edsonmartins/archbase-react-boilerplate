# 07. Sistema de Segurança

O Archbase React v3 possui um sistema completo de segurança para controle de acesso baseado em permissões.

---

## Conceito

O sistema de segurança controla o que cada usuário pode fazer na aplicação:
- **Permissões carregadas por view** - Ao abrir uma view/form, o sistema registra o recurso e obtém as permissões
- **Comportamento: Desabilitar** - Botões/ações sem permissão ficam desabilitados (não ocultos)
- **Administradores** - Usuários admin têm acesso total automaticamente

---

## ⚠️ O auto-registro de recursos, e o que ele impede no backend

Aquele "registra o recurso" acima não é figura de linguagem: o `ArchbaseSecurityManager` chama
**`POST /api/v1/resource/register`** ao abrir cada tela, para declarar no banco o recurso e as ações
que a view usa. Isso acontece para **qualquer usuário**, não só administradores.

**Consequência prática:** esse endpoint é administrativo pela marcação do framework. Se o backend
ligar

```yaml
archbase:
  security:
    admin-endpoints:
      policy: admin-only     # NÃO faça isso enquanto usar o auto-registro
```

então **toda tela quebra com 403 para todo usuário que não seja administrador**. Não é um endpoint
mal marcado que dá para corrigir isolado: é um endpoint de escrita que faz parte do fluxo normal de
qualquer usuário.

Aconteceu em produção. O sintoma é confuso — a pessoa loga normalmente e recebe 403 em telas que
nada têm de administrativas.

Enquanto o auto-registro existir, o backend precisa ficar em `policy: permit`. Isso deixa em aberto
uma escalação de privilégio conhecida (qualquer autenticado alcança `POST /api/v1/user`), e a saída
definitiva passa por dar ao auto-registro uma política própria, separada dos demais endpoints
administrativos.

---

## Tela de Diagnóstico de Acesso

Desde a 4.3.0 o `@archbase/security-ui` traz o `ArchbaseSecurityDiagnosticsView`: panorama, árvore de
quem tem o quê, simulação de acesso e leitura da trilha de auditoria. **Somente leitura** — nada ali
altera permissão.

Ela não aparece sozinha; precisa ser registrada na navegação:

```tsx
import { ArchbaseSecurityDiagnosticsView } from '@archbase/security-ui'

// no item de menu, junto de Usuários e Tokens de API
{
  label: 'Diagnóstico de Acesso',
  icon: <IconShield />,
  link: DIAGNOSTICO_SEGURANCA_ROUTE,   // ex.: '/seguranca/diagnostico'
  component: <ArchbaseSecurityDiagnosticsView />,
  showInSidebar: true,
}
```

**Do lado do backend depende de uma chave**, e sem ela o controller nem é registrado:

```yaml
archbase:
  security:
    diagnostics:
      enabled: true
```

Sem isso a tela abre e as chamadas voltam **404** — não 403. Se você ver 404 aqui, é a chave, não
permissão. Mesmo ligada, cada endpoint exige `isAdministrator` por conta própria.

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

## Hooks Customizados (Recomendado)

### 1. Constantes de Segurança por Módulo

```typescript
// src/security/securityResources.ts
export const CATALOG_SECURITY_RESOURCES = {
  PRODUCT: { name: 'catalog.product', description: 'Produtos' },
  CATEGORY: { name: 'catalog.category', description: 'Categorias' },
}

export const SALES_SECURITY_RESOURCES = {
  ORDER: { name: 'sales.order', description: 'Pedidos' },
  CUSTOMER: { name: 'sales.customer', description: 'Clientes' },
}

export const ADMIN_SECURITY_RESOURCES = {
  USER: { name: 'admin.user', description: 'Usuários' },
}
```

### 2. Hook useSecureActions (Produção)

Hook wrapper que adiciona `can()`, `canAny()`, `canAll()` para ações customizadas:

```typescript
// src/hooks/useSecureActions.ts
import { useCallback, useEffect, useMemo } from 'react'
import { useArchbaseSecureForm } from '@archbase/security'

interface SecurityAction {
  name: string
  description: string
}

export function useSecureActions(
  resourceName: string,
  resourceDescription: string,
  customActions: SecurityAction[] = []
) {
  const secureForm = useArchbaseSecureForm(resourceName, resourceDescription)

  useEffect(() => {
    if (customActions.length > 0 && secureForm.registerAction) {
      customActions.forEach(action => {
        secureForm.registerAction(action.name, action.description)
      })
    }
  }, [])

  const can = useCallback(
    (actionName: string): boolean => {
      return secureForm.hasPermission ? secureForm.hasPermission(actionName) : false
    },
    [secureForm]
  )

  const canAny = useCallback(
    (actionNames: string[]): boolean => {
      return secureForm.hasAnyPermission
        ? secureForm.hasAnyPermission(actionNames)
        : actionNames.some(name => can(name))
    },
    [secureForm, can]
  )

  const canAll = useCallback(
    (actionNames: string[]): boolean => {
      return secureForm.hasAllPermissions
        ? secureForm.hasAllPermissions(actionNames)
        : actionNames.every(name => can(name))
    },
    [secureForm, can]
  )

  return {
    canCreate: secureForm.canCreate,
    canEdit: secureForm.canEdit,
    canDelete: secureForm.canDelete,
    canView: secureForm.canView,
    canList: secureForm.canList,
    can,
    canAny,
    canAll,
    isLoading: secureForm.isLoading,
    error: secureForm.error,
  }
}

// Uso padrão (CRUD):
const { canCreate, canEdit, canDelete, canView } = useSecureActions(
  CATALOG_SECURITY_RESOURCES.PRODUCT.name,
  CATALOG_SECURITY_RESOURCES.PRODUCT.description,
)

// Uso com ações customizadas:
const { canCreate, canEdit, can } = useSecureActions(
  CATALOG_SECURITY_RESOURCES.PRODUCT.name,
  CATALOG_SECURITY_RESOURCES.PRODUCT.description,
  [
    { name: 'approve', description: 'Aprovar produto' },
    { name: 'export', description: 'Exportar produtos' },
  ]
)
if (can('approve')) { /* ... */ }
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
