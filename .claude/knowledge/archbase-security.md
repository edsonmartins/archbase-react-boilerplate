# Archbase Security - Sistema de Segurança

Este documento descreve como usar o sistema de segurança do Archbase React v3 no projeto Gestor-RQ.

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

export function MinhaView() {
  return (
    <ArchbaseViewSecurityProvider
      resourceName="modulo.entidade"
      resourceDescription="Descrição da entidade"
    >
      <MinhaViewContent />
    </ArchbaseViewSecurityProvider>
  )
}
```

### 3. useArchbaseSecureForm (Hook)

Hook para obter permissões dentro de um componente.

```tsx
import { useArchbaseSecureForm } from '@archbase/security'

function MinhaViewContent() {
  const { canCreate, canEdit, canDelete, canView, isLoading } =
    useArchbaseSecureForm('modulo.entidade', 'Descrição')

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

### Permissão Completa

```
tms.mecanico.view
tms.mecanico.create
tms.mecanico.edit
tms.mecanico.delete
```

## Hook Customizado: useGestorRQSecurity

O projeto possui um hook customizado para facilitar o uso:

```tsx
import { useGestorRQSecurity, TMS_SECURITY_RESOURCES } from '../../../hooks'

function MinhaView() {
  const { canCreate, canEdit, canDelete, canView } = useGestorRQSecurity({
    module: 'tms',
    entity: 'mecanico',
    description: 'Mecânicos'
  })
}

// Ou usando constantes
const { canCreate, canEdit, canDelete, canView } = useArchbaseSecureForm(
  TMS_SECURITY_RESOURCES.MECANICO.name,
  TMS_SECURITY_RESOURCES.MECANICO.description
)
```

## Constantes de Recursos TMS

```tsx
import { TMS_SECURITY_RESOURCES } from '../../../hooks'

TMS_SECURITY_RESOURCES.MECANICO.name        // 'tms.mecanico'
TMS_SECURITY_RESOURCES.MECANICO.description // 'Mecânicos'
TMS_SECURITY_RESOURCES.PECA_MATERIAL.name   // 'tms.pecamaterial'
// etc.
```

## Padrão de Implementação

### ListView

```tsx
import { ArchbaseViewSecurityProvider, useArchbaseSecureForm } from '@archbase/security'
import { TMS_SECURITY_RESOURCES } from '../../../hooks'

export function EntidadeListView() {
  return (
    <ArchbaseViewSecurityProvider
      resourceName={TMS_SECURITY_RESOURCES.ENTIDADE.name}
      resourceDescription={TMS_SECURITY_RESOURCES.ENTIDADE.description}
    >
      <EntidadeListViewContent />
    </ArchbaseViewSecurityProvider>
  )
}

function EntidadeListViewContent() {
  const { canCreate, canEdit, canDelete, canView } = useArchbaseSecureForm(
    TMS_SECURITY_RESOURCES.ENTIDADE.name,
    TMS_SECURITY_RESOURCES.ENTIDADE.description
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
import { TMS_SECURITY_RESOURCES } from '../../../hooks'

export function EntidadeForm() {
  return (
    <ArchbaseViewSecurityProvider
      resourceName={TMS_SECURITY_RESOURCES.ENTIDADE.name}
      resourceDescription={TMS_SECURITY_RESOURCES.ENTIDADE.description}
    >
      <EntidadeFormContent />
    </ArchbaseViewSecurityProvider>
  )
}

function EntidadeFormContent() {
  const { canCreate, canEdit } = useArchbaseSecureForm(
    TMS_SECURITY_RESOURCES.ENTIDADE.name,
    TMS_SECURITY_RESOURCES.ENTIDADE.description
  )

  const isAddAction = action === 'ADD'
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
```

Response:
```json
{
  "resourceName": "tms.mecanico",
  "permissions": ["create", "edit", "view", "list"]
}
```

## Arquivos Modificados

### Configuração
- `src/App.tsx` - ArchbaseSecurityProvider global

### Hooks
- `src/hooks/useGestorRQSecurity.ts` - Hook customizado
- `src/hooks/index.ts` - Exports

### Views TMS (ListViews)
- `src/views/tms/mecanicos/MecanicoListView.tsx`
- `src/views/tms/tipos-servico/TipoServicoListView.tsx`
- `src/views/tms/abastecimentos/AbastecimentoListView.tsx`
- `src/views/tms/pecas-materiais/PecaMaterialListView.tsx`
- `src/views/tms/planos-manutencao/PlanoManutencaoListView.tsx`

### Views TMS (Forms)
- `src/views/tms/mecanicos/MecanicoForm.tsx`
