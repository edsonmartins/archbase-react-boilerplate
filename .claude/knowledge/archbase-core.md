# Archbase Core - Conceitos Fundamentais

## Visão Geral

O Archbase React é uma biblioteca de componentes React construída sobre Mantine v8, projetada para desenvolvimento rápido de aplicações administrativas.

## Pacotes Principais

| Pacote | Descrição |
|--------|-----------|
| `@archbase/core` | Providers, hooks core, i18n, tema |
| `@archbase/components` | Componentes de UI com binding |
| `@archbase/data` | DataSource, Services, API Client |
| `@archbase/admin` | Layout admin, navegação, tabs |
| `@archbase/security` | Autenticação, autorização |
| `@archbase/security-ui` | Views de segurança prontas |
| `@archbase/template` | Templates de form e list |
| `@archbase/layout` | Componentes de layout |

## Providers

### ArchbaseGlobalProvider
Provider raiz que configura tema, i18n e IoC.

```typescript
<ArchbaseGlobalProvider
  colorScheme={colorScheme}        // 'light' | 'dark'
  containerIOC={containerIOC}      // Container Inversify
  themeDark={AppThemeDark}
  themeLight={AppThemeLight}
  translationName="app"            // Namespace i18n
  translationResource={{
    en: translation_en,
    'pt-BR': translation_ptbr,
  }}
>
  {children}
</ArchbaseGlobalProvider>
```

### ArchbaseAppProvider
Provider de aplicação com contexto de usuário.

```typescript
<ArchbaseAppProvider
  user={currentUser}
  owner={null}
  selectedCompany={undefined}
  variant="filled"
  setCustomTheme={handleChangeTheme}
  navigationProvider={ArchbaseNavigationProvider}
>
  {children}
</ArchbaseAppProvider>
```

## Hooks Principais

### useArchbaseTheme
Acesso ao tema Mantine atual.

```typescript
const theme = useArchbaseTheme()
// theme.colors.primary, theme.breakpoints, etc.
```

### useArchbaseRemoteServiceApi
Obtém instância de service do IoC.

```typescript
const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)
```

### useArchbaseAuthenticationManager
Gerencia autenticação.

```typescript
const {
  login,
  logout,
  isAuthenticated,
  isAuthenticating,
  username,
  accessToken,
  error
} = useArchbaseAuthenticationManager({})
```

### useArchbaseSize
Calcula dimensões para forms responsivos.

```typescript
const { ref, height, width } = useArchbaseSize()
const safeHeight = height > 0 ? height - 130 : 600
```

### useArchbaseStore
Acesso ao store global (Zustand).

```typescript
const store = useArchbaseStore()
store.reset() // Limpa estado
```

### useArchbaseAdminStore
Store específico do admin layout.

```typescript
const adminStore = useArchbaseAdminStore()
adminStore.openedTabs
adminStore.activeTabId
adminStore.setActiveTabId(id)
adminStore.setOpenedTabs(tabs)
```

## Internacionalização (i18n)

### Configuração
Traduções são carregadas via `translationResource` no provider.

### Uso
```typescript
import { archbaseI18next } from '@archbase/core'

// Tradução simples
archbaseI18next.t('Nome')

// Com namespace
archbaseI18next.t('app:Nome')
```

### Arquivos de Tradução
```
src/locales/
├── pt-BR/translation.json
├── en/translation.json
└── es/translation.json
```

## Error Handling

### ArchbaseErrorBoundary
Boundary para erros React.

```typescript
<ArchbaseErrorBoundary
  FallbackComponent={ErrorFallback}
  onError={logError}
>
  {children}
</ArchbaseErrorBoundary>
```

### processErrorMessage
Utilitário para processar erros de API.

```typescript
import { processErrorMessage } from '@archbase/core'

try {
  await apiCall()
} catch (err) {
  const message = processErrorMessage(err)
  // message é string formatada
}
```

## Constantes do IoC

```typescript
import { ARCHBASE_IOC_API_TYPE } from '@archbase/core'

ARCHBASE_IOC_API_TYPE.Authenticator
ARCHBASE_IOC_API_TYPE.TokenManager
ARCHBASE_IOC_API_TYPE.ApiClient
ARCHBASE_IOC_API_TYPE.User
ARCHBASE_IOC_API_TYPE.Profile
ARCHBASE_IOC_API_TYPE.Group
ARCHBASE_IOC_API_TYPE.Resource
```
