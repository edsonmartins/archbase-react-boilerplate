# Archbase Troubleshooting - Guia de Resolução de Problemas

## Problemas de Renderização

### "width: 0px, height: 0px" no Form

**Sintoma:** Formulário não renderiza ou aparece colapsado.

**Causa:** Falta `innerRef` no ArchbaseFormTemplate ou uso incorreto do hook.

**Solução:**
```typescript
// CORRETO
const { ref, height } = useArchbaseSize()
const safeHeight = height > 0 ? height - 130 : 600

<ArchbaseFormTemplate
  innerRef={ref}  // OBRIGATÓRIO!
  // ...
>
  <Paper withBorder style={{ height: safeHeight }}>
    {/* conteúdo */}
  </Paper>
</ArchbaseFormTemplate>
```

### Tabela não aparece

**Sintoma:** ArchbaseDataTable renderiza vazio mesmo com dados.

**Causa:** Falta definir altura ou DataSource não está populado.

**Solução:**
```typescript
// Verificar se dados foram setados
useEffect(() => {
  if (data) {
    dataSource.setData(data)  // Setar dados!
  }
}, [data])

// Definir altura obrigatória
<ArchbaseDataTable
  dataSource={dataSource}
  columns={columns}
  height={400}  // OBRIGATÓRIO!
/>
```

## Problemas de DataSource

### "Cannot modify in browsing state"

**Sintoma:** Erro ao tentar modificar campo.

**Causa:** DataSource está em estado BROWSING (padrão).

**Solução:**
```typescript
// Para editar registro existente
dataSource.edit()
dataSource.setFieldValue('name', 'Novo Nome')

// Para novo registro
dataSource.append({ active: true } as UserDto)
```

### Campos não atualizam na UI

**Sintoma:** Valor muda no DataSource mas componente não reflete.

**Causa:** Componente não está vinculado corretamente.

**Solução:**
```typescript
// Verificar que componente tem dataSource E dataField
<ArchbaseEdit
  dataSource={dataSource}  // Referência ao DataSource
  dataField="name"         // Nome do campo no DTO
/>
```

### Dados perdidos após navegação

**Sintoma:** Ao voltar para tela, dados desaparecem.

**Causa:** DataSource é recriado a cada render.

**Solução:**
```typescript
// Usar useState com função para criar uma única vez
const [dataSource] = useState(() =>
  new ArchbaseDataSource<UserDto, string>({
    name: 'dsUser',
    initialData: []
  })
)
```

## Problemas de Validação

### "Property 'validator' does not exist" no ArchbaseFormTemplate

**Sintoma:** Erro de TypeScript ao passar validator.

**Causa:** validator não é prop do ArchbaseFormTemplate.

**Solução:**
```typescript
// ERRADO
<ArchbaseFormTemplate validator={validator}>

// CORRETO - usar no DataSource
const [dataSource] = useState(() =>
  new ArchbaseDataSource<UserDto, string>({
    name: 'dsUser',
    validator: new ArchbaseYupValidator(userSchema)  // Aqui!
  })
)
```

### Erros de validação não aparecem

**Sintoma:** Formulário não mostra erros mesmo com dados inválidos.

**Causa:** Validator não configurado ou validação não chamada.

**Solução:**
```typescript
// 1. Configurar validator no DataSource
const dataSource = new ArchbaseDataSource({
  name: 'dsUser',
  validator: new ArchbaseYupValidator(schema)
})

// 2. Chamar validate antes de salvar
const handleSave = async () => {
  const isValid = await dataSource.validate()
  if (!isValid) return  // Erros serão exibidos automaticamente
  // salvar...
}
```

## Problemas de Service

### "Metadata not found" no Inversify

**Sintoma:** Erro ao injetar service.

**Causa:** Import incorreto do tipo.

**Solução:**
```typescript
// ERRADO
import { ArchbaseRemoteApiClient } from '@archbase/data'

// CORRETO - usar type import
import type { ArchbaseRemoteApiClient } from '@archbase/data'
```

### "Service not registered"

**Sintoma:** useArchbaseRemoteServiceApi retorna undefined.

**Causa:** Service não registrado no container IoC.

**Solução:**
```typescript
// src/ioc/ContainerIOC.ts
import { UserService } from '@services/UserService'
import { API_TYPE } from './IOCTypes'

containerIOC.bind<UserService>(API_TYPE.UserService).to(UserService)
```

### Erro 401/403 não tratado

**Sintoma:** Aplicação não redireciona para login após expirar sessão.

**Solução:**
```typescript
import { processErrorMessage } from '@archbase/core'

try {
  await userService.save(data)
} catch (error: any) {
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    logout()  // Redirecionar para login
    return
  }
  const message = processErrorMessage(error)
  // mostrar erro
}
```

## Problemas de TypeScript

### "Property 'readOnly' does not exist" no ArchbaseFormTemplate

**Sintoma:** Erro ao passar readOnly para o template.

**Causa:** readOnly não existe em ArchbaseFormTemplate.

**Solução:**
```typescript
// Aplicar readOnly em cada campo individualmente
const isViewOnly = action === 'VIEW'

<ArchbaseEdit
  dataSource={dataSource}
  dataField="name"
  readOnly={isViewOnly}  // Aqui!
/>
```

### Tipos genéricos incorretos

**Sintoma:** TypeScript reclama de tipos em services.

**Solução:**
```typescript
// Especificar tipos corretos
const result = await this.client.post<RequestDto, ResponseDto>(
  url,
  requestData,
  headers,
  false
)
```

## Problemas de Estilo

### Componentes Mantine não estilizados

**Sintoma:** Componentes aparecem sem estilo.

**Causa:** CSS não importado.

**Solução:**
```typescript
// No App.tsx ou main.tsx - ORDEM IMPORTA!
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import '@archbase/components/dist/index.css'
import '@archbase/layout/dist/index.css'
import '@archbase/admin/dist/index.css'
```

### Conflito de estilos Tailwind/Mantine

**Sintoma:** Estilos conflitantes entre Tailwind e Mantine.

**Solução:**
```javascript
// tailwind.config.js
module.exports = {
  corePlugins: {
    preflight: false  // Desabilitar reset do Tailwind
  }
}
```

## Problemas de Build

### "reflect-metadata" error

**Sintoma:** Erro de decorators ou metadata.

**Solução:**
```typescript
// No início do App.tsx ou main.tsx
import 'reflect-metadata'

// tsconfig.json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### "Cannot find module" para aliases

**Sintoma:** Imports com @ não resolvem.

**Solução:**
```typescript
// vite.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@components': path.resolve(__dirname, './src/components'),
    // ... outros aliases
  }
}

// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"]
    }
  }
}
```

## Problemas de Performance

### Lista lenta com muitos registros

**Solução:**
1. Usar paginação server-side
2. Definir altura fixa na tabela
3. Memoizar colunas

```typescript
const columns = useMemo(() => [...], [])

<ArchbaseDataTable
  height={400}  // Altura fixa para virtualização
  recordsPerPage={20}
  page={page}
  onPageChange={setPage}
  totalRecords={total}
/>
```

### Formulário lento ao digitar

**Solução:** Verificar re-renders desnecessários

```typescript
// Memoizar componentes pesados
const MemoizedTable = memo(ArchbaseDataTable)

// Evitar criar funções inline
const handleChange = useCallback((value) => {
  // ...
}, [])
```

## Checklist de Debug

1. **Console do navegador:** Verificar erros JavaScript
2. **Network tab:** Verificar chamadas de API
3. **React DevTools:** Verificar props e state
4. **Verificar imports:** CSS, reflect-metadata, tipos
5. **Verificar IoC:** Services registrados
6. **Verificar DataSource:** Estado (browsing/editing), dados setados
7. **Verificar refs:** innerRef passado para templates
