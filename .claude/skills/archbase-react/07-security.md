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

export function MinhaView() {
  return (
    <ArchbaseViewSecurityProvider
      resourceName="modulo.entidade"
      resourceDescription="Descrição da Entidade"
    >
      <MinhaViewContent />
    </ArchbaseViewSecurityProvider>
  )
}
```

### 3. useArchbaseSecureForm (Hook)

Hook para obter permissões dentro do componente:

```typescript
import { useArchbaseSecureForm } from '@archbase/security'

function MinhaViewContent() {
  const { canCreate, canEdit, canDelete, canView, isLoading } =
    useArchbaseSecureForm('modulo.entidade', 'Descrição da Entidade')

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
tms.mecanico          - Mecânicos
tms.pecamaterial      - Peças e Materiais
tms.tiposervico       - Tipos de Serviço
tms.planomanutencao   - Planos de Manutenção
tms.abastecimento     - Abastecimentos
tms.ordemservico      - Ordens de Serviço
checklist.modelo      - Modelos de Checklist
viagem.monitor        - Monitor de Viagens
```

### Ações Padrão

- `view` - Visualizar registro
- `create` - Criar novo registro
- `edit` - Editar registro existente
- `delete` - Excluir registro
- `list` - Listar registros

---

## Hook Customizado do Projeto

O projeto possui um hook customizado para facilitar o uso:

```typescript
import { useGestorRQSecurity, TMS_SECURITY_RESOURCES } from '../../../hooks'

// Opção 1: Usando o hook customizado
const { canCreate, canEdit, canDelete, canView } = useGestorRQSecurity({
  module: 'tms',
  entity: 'mecanico',
  description: 'Mecânicos'
})

// Opção 2: Usando constantes do projeto
const { canCreate, canEdit, canDelete, canView } = useArchbaseSecureForm(
  TMS_SECURITY_RESOURCES.MECANICO.name,
  TMS_SECURITY_RESOURCES.MECANICO.description
)
```

---

## Exemplo Completo: ListView com Segurança

```typescript
import { ArchbaseViewSecurityProvider, useArchbaseSecureForm } from '@archbase/security'
import { TMS_SECURITY_RESOURCES } from '../../../hooks'

export function MecanicoListView() {
  return (
    <ArchbaseViewSecurityProvider
      resourceName={TMS_SECURITY_RESOURCES.MECANICO.name}
      resourceDescription={TMS_SECURITY_RESOURCES.MECANICO.description}
    >
      <MecanicoListViewContent />
    </ArchbaseViewSecurityProvider>
  )
}

function MecanicoListViewContent() {
  const { t } = useArchbaseTranslation()
  const { canCreate, canEdit, canDelete, canView } = useArchbaseSecureForm(
    TMS_SECURITY_RESOURCES.MECANICO.name,
    TMS_SECURITY_RESOURCES.MECANICO.description
  )

  const userRowActions: UserRowActionsOptions<MecanicoDto> = {
    actions: ArchbaseGridRowActions,
    onAddRow: canCreate ? handleAddMecanico : undefined,
    onEditRow: canEdit ? handleEditMecanico : undefined,
    onRemoveRow: canDelete ? handleRemoveMecanico : undefined,
    onViewRow: canView ? handleViewMecanico : undefined
  }

  return (
    <ArchbaseGridTemplate
      userActions={{
        visible: true,
        allowRemove: canDelete,
        onAddExecute: canCreate ? handleAddMecanico : undefined,
        onEditExecute: canEdit ? handleEditMecanico : undefined,
        onRemoveExecute: canDelete ? handleRemoveMecanico : undefined,
        onViewExecute: canView ? handleViewMecanico : undefined
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
import { TMS_SECURITY_RESOURCES } from '../../../hooks'

export function MecanicoForm() {
  return (
    <ArchbaseViewSecurityProvider
      resourceName={TMS_SECURITY_RESOURCES.MECANICO.name}
      resourceDescription={TMS_SECURITY_RESOURCES.MECANICO.description}
    >
      <MecanicoFormContent />
    </ArchbaseViewSecurityProvider>
  )
}

function MecanicoFormContent() {
  const { canCreate, canEdit } = useArchbaseSecureForm(
    TMS_SECURITY_RESOURCES.MECANICO.name,
    TMS_SECURITY_RESOURCES.MECANICO.description
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
    "resourceName": "tms.mecanico",
    "resourceDescription": "Mecânicos"
  },
  "actions": [
    { "actionName": "create", "actionDescription": "Criar Mecânicos" },
    { "actionName": "edit", "actionDescription": "Editar Mecânicos" },
    { "actionName": "delete", "actionDescription": "Deletar Mecânicos" },
    { "actionName": "view", "actionDescription": "Visualizar Mecânicos" },
    { "actionName": "list", "actionDescription": "Listar Mecânicos" }
  ]
}

Response:
{
  "resourceName": "tms.mecanico",
  "permissions": ["create", "edit", "view", "list"]
}
```

---

## Checklist de Implementação

- [ ] Configurar `ArchbaseSecurityProvider` no `App.tsx` com `securityUser`
- [ ] Criar constantes de recurso em `src/hooks/useGestorRQSecurity.ts`
- [ ] Envolver view com `ArchbaseViewSecurityProvider`
- [ ] Criar função `*Content` interna para o conteúdo
- [ ] Usar `useArchbaseSecureForm` para obter permissões
- [ ] Aplicar `canCreate`, `canEdit`, `canDelete`, `canView` nas ações
- [ ] Remover verificação `isAdministrator()` antiga
- [ ] Testar com usuário admin e não-admin
