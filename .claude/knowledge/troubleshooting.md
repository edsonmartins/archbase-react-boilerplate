# Archbase Troubleshooting - Guia de Resolução de Problemas

## Problemas de Renderização

### "width: 0px, height: 0px" no Form

**Sintoma:** Formulário não renderiza ou aparece colapsado.

**Causa:** Uso de `useElementSize` ou `useArchbaseSize` que causam loop de renderização infinito.

**Solução:**
```typescript
// ✅ CORRETO: Usar ScrollArea com height: '100%'
<ArchbaseFormTemplate
  dataSource={dataSource}
  onCancel={handleCancel}
  onAfterSave={handleAfterSave}
  withBorder={false}
>
  <ScrollArea style={{ height: '100%' }}>
    <LoadingOverlay visible={isLoading} />
    <Grid>
      {/* conteúdo */}
    </Grid>
  </ScrollArea>
</ArchbaseFormTemplate>

// ❌ ERRADO: NÃO usar useElementSize - causa loop infinito!
// const { ref, height } = useElementSize()
// <ArchbaseFormTemplate innerRef={ref}...>
```

### Tabela não aparece

**Sintoma:** ArchbaseDataGrid renderiza vazio mesmo com dados.

**Causa:** Falta definir altura ou DataSource não está populado.

**Solução:**
```typescript
// ✅ CORRETO: Usar open() (NÃO setData!)
useEffect(() => {
  if (data) {
    dataSource.open({ records: data })
  }
}, [data])

// ✅ CORRETO: Usar ArchbaseDataGrid (NÃO DataTable!)
// Definir altura obrigatória
<ArchbaseDataGrid
  dataSource={dataSource}
  height={400}  // OBRIGATÓRIO!
>
  <Columns>
    <ArchbaseDataGridColumn dataField="name" header="Nome" size={200} dataType="text" />
  </Columns>
</ArchbaseDataGrid>
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

// ✅ CORRETO: Para novo registro usar insert() (NÃO append!)
dataSource.insert(UserDto.newInstance())
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
// ✅ CORRETO: Usar useArchbaseRemoteDataSource (recomendado para forms)
const { dataSource, isLoading } = useArchbaseRemoteDataSource<UserDto, string>({
  name: 'dsUser',
  label: 'Usuário',
  service: serviceApi,
  store: templateStore,  // Usar store para persistir dados
  // ...
})

// Alternativa: DataSource simples com useState
const [dataSource] = useState(() =>
  new ArchbaseDataSource<UserDto, string>('dsUser')
)
```

## Problemas de Validação

### "Property 'validator' does not exist" no ArchbaseFormTemplate

**Sintoma:** Erro de TypeScript ao passar validator.

**Causa:** validator não é prop do ArchbaseFormTemplate.

**Solução:**
```typescript
// ❌ ERRADO
<ArchbaseFormTemplate validator={validator}>

// ✅ CORRETO: Usar useArchbaseRemoteDataSource com validator
const validator = useArchbaseValidator()

const { dataSource, isLoading } = useArchbaseRemoteDataSource<UserDto, string>({
  name: 'dsUser',
  validator,  // Passa o validator aqui!
  // ...
})

// Alternativa: Configurar separadamente
const [dataSource] = useState(() =>
  new ArchbaseDataSource<UserDto, string>('dsUser')
)

useEffect(() => {
  dataSource.setValidator(validator)
}, [])
```

### Erros de validação não aparecem

**Sintoma:** Formulário não mostra erros mesmo com dados inválidos.

**Causa:** Validator não configurado ou mensagens de tradução não encontradas.

**Solução:**
```typescript
// 1. Usar useArchbaseValidator e passar para useArchbaseRemoteDataSource
const validator = useArchbaseValidator()

const { dataSource } = useArchbaseRemoteDataSource<UserDto, string>({
  name: 'dsUser',
  validator,  // ✅ Validator configurado
  // ...
})

// 2. Para mensagens de validação traduzidas (class-validator), usar:
// No DTO:
@IsNotEmpty({ message: 'my-app:O nome é obrigatório' })
nome: string

// No App.tsx, configurar translationName:
<ArchbaseAdminMainLayout
  translationName="my-app"  // ✅ Prefixo das traduções
  // ...
/>

// 3. O ArchbaseFormTemplate chama validate() automaticamente ao salvar
// Os erros serão exibidos automaticamente nos campos
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
// ✅ CORRETO: Usar ArchbaseDataGrid (NÃO DataTable!)
const columns = useMemo(() => [...], [])

<ArchbaseDataGrid
  dataSource={dataSource}
  height={400}  // Altura fixa para virtualização
>
  <Columns>
    <ArchbaseDataGridColumn dataField="name" header="Nome" size={200} dataType="text" />
  </Columns>
</ArchbaseDataGrid>
```

### Formulário lento ao digitar

**Solução:** Verificar re-renders desnecessários

```typescript
// ✅ Memoizar componentes pesados
const MemoizedGrid = memo(ArchbaseDataGrid)

// ✅ Evitar criar funções inline
const handleChange = useCallback((value) => {
  // ...
}, [])

// ❌ NÃO usar useElementSize no form - causa loop de renderização!
// Use ScrollArea com height: '100%' ao invés
```

## Checklist de Debug

1. **Console do navegador:** Verificar erros JavaScript
2. **Network tab:** Verificar chamadas de API
3. **React DevTools:** Verificar props e state
4. **Verificar imports:** CSS, reflect-metadata, tipos
5. **Verificar IoC:** Services registrados
6. **Verificar DataSource:** Estado (browsing/editing), dados carregados com `open()`
7. **Verificar hooks corretos:** NÃO usar useElementSize em forms - usar ScrollArea
8. **Verificar comparação de action:** Usar `action.toUpperCase() === 'ADD'` (case-insensitive)
