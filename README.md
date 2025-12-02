# Archbase React Boilerplate

<p align="center">
  <img src="https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.3+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Mantine-8.3.6-339AF0?style=for-the-badge&logo=mantine&logoColor=white" alt="Mantine" />
  <img src="https://img.shields.io/badge/Archbase-3.0.7+-FF6B6B?style=for-the-badge" alt="Archbase" />
</p>

<p align="center">
  Boilerplate completo para aplicações React administrativas usando a biblioteca <strong>Archbase React</strong>.
</p>

---

## Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Requisitos](#requisitos)
- [Instalação](#instalação)
- [Comandos Disponíveis](#comandos-disponíveis)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Arquitetura](#arquitetura)
- [Configuração](#configuração)
- [Guia de Desenvolvimento](#guia-de-desenvolvimento)
- [Documentação Claude Code](#documentação-claude-code)
- [Contribuição](#contribuição)
- [Licença](#licença)

---

## Visão Geral

Este boilerplate fornece uma base sólida e padronizada para criar aplicações administrativas React com a biblioteca **Archbase React**. Inclui autenticação, navegação por tabs, temas light/dark, internacionalização e integração completa com APIs REST.

### Por que usar este boilerplate?

- **Produtividade**: Estrutura pronta para começar a desenvolver imediatamente
- **Padronização**: Convenções e padrões consistentes em todo o código
- **Escalabilidade**: Arquitetura modular que cresce com seu projeto
- **Manutenibilidade**: Código organizado e documentado
- **Integração Claude Code**: Documentação especializada para assistência de IA

---

## Funcionalidades

### Core

- **Autenticação JWT** com refresh token e gerenciamento de sessão
- **Navegação por Tabs** com persistência de estado
- **Temas Light/Dark** com troca dinâmica
- **Internacionalização (i18n)** com suporte a pt-BR, en e es
- **Injeção de Dependência** com Inversify para serviços desacoplados

### UI/UX

- **Layout Administrativo** responsivo com sidebar colapsável
- **Command Palette** (Ctrl+K) para navegação rápida
- **Notificações** toast integradas
- **Loading States** globais e por componente
- **Error Boundaries** com fallback elegante

### Desenvolvimento

- **Hot Module Replacement** com Vite
- **TypeScript Strict Mode** para type safety
- **ESLint + Prettier** para qualidade de código
- **Vitest** para testes unitários
- **Path Aliases** para imports limpos

---

## Stack Tecnológica

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **React** | 19.x | UI Library |
| **TypeScript** | 5.3+ | Type Safety |
| **Vite** | 6.x | Build Tool & Dev Server |
| **Mantine** | 8.3.6 | UI Components Base |
| **Archbase React** | 3.0.7+ | Framework Admin |
| **Inversify** | 6.2 | IoC/DI Container |
| **React Query** | 5.x | Data Fetching & Caching |
| **React Router** | 6.x | Routing |
| **i18next** | 23.x | Internacionalização |
| **Axios** | 1.7+ | HTTP Client |
| **Tabler Icons** | 3.x | Iconografia |

---

## Requisitos

- **Node.js** >= 16.0.0
- **pnpm** >= 9.0.0 (recomendado) ou npm >= 8.0.0
- **Git** para controle de versão

---

## Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/archbase-react-boilerplate.git
cd archbase-react-boilerplate
```

### 2. Instalar Dependências

```bash
pnpm install
```

### 3. Configurar Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
VITE_API=http://localhost:8080
VITE_APP_NAME=Minha Aplicação
VITE_APP_VERSION=1.0.0
```

### 4. Iniciar o Servidor de Desenvolvimento

```bash
pnpm dev
```

A aplicação estará disponível em `http://localhost:5173`

---

## Comandos Disponíveis

### Desenvolvimento

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia servidor de desenvolvimento |
| `pnpm dev:http` | Servidor dev com host exposto (porta 4200) |
| `pnpm dev:debug` | Servidor dev com logs detalhados do Vite |

### Build

| Comando | Descrição |
|---------|-----------|
| `pnpm build` | Compila para produção |
| `pnpm preview` | Preview do build de produção |

### Qualidade de Código

| Comando | Descrição |
|---------|-----------|
| `pnpm lint` | Verifica erros com ESLint |
| `pnpm lint:fix` | Corrige erros automaticamente |
| `pnpm format` | Formata código com Prettier |
| `pnpm type-check` | Verifica tipos TypeScript |

### Testes

| Comando | Descrição |
|---------|-----------|
| `pnpm test` | Executa testes em watch mode |
| `pnpm test:run` | Executa testes uma vez |
| `pnpm test:ui` | Testes com interface visual |
| `pnpm test:coverage` | Relatório de cobertura |

### Manutenção

| Comando | Descrição |
|---------|-----------|
| `pnpm setup` | Instala deps e verifica tipos |
| `pnpm clean` | Remove dist e node_modules |
| `pnpm reinstall` | Limpa e reinstala tudo |

---

## Estrutura do Projeto

```
archbase-react-boilerplate/
├── .claude/                    # Documentação para Claude Code
│   ├── SKILL.md               # Referência completa de componentes
│   ├── knowledge/             # Documentação modular por tema
│   │   ├── archbase-core.md
│   │   ├── archbase-datasource.md
│   │   ├── archbase-services.md
│   │   ├── archbase-components-inputs.md
│   │   ├── archbase-components-tables.md
│   │   ├── form-patterns.md
│   │   ├── view-patterns.md
│   │   └── troubleshooting.md
│   ├── examples/              # Exemplos de código funcionais
│   │   ├── forms/
│   │   ├── views/
│   │   ├── services/
│   │   └── hooks/
│   └── templates/             # Templates prontos para usar
│       ├── ListViewTemplate.tsx
│       ├── FormViewTemplate.tsx
│       ├── ModalTemplates.tsx
│       ├── ServiceTemplate.ts
│       └── ManagerViewTemplate.tsx
│
├── src/
│   ├── assets/                # Recursos estáticos
│   │   ├── icons/
│   │   └── images/
│   │
│   ├── auth/                  # Autenticação
│   │   └── AppAuthenticator.ts
│   │
│   ├── components/            # Componentes reutilizáveis
│   │
│   ├── contexts/              # React Contexts
│   │
│   ├── domain/                # DTOs e modelos de domínio
│   │
│   ├── hooks/                 # Hooks customizados
│   │
│   ├── ioc/                   # Container IoC (Inversify)
│   │   ├── ContainerIOC.ts    # Configuração do container
│   │   └── IOCTypes.ts        # Símbolos para DI
│   │
│   ├── locales/               # Traduções
│   │   ├── pt-BR/
│   │   ├── en/
│   │   └── es/
│   │
│   ├── navigation/            # Dados de navegação e rotas
│   │   ├── navigationData.tsx
│   │   └── navigationDataConstants.tsx
│   │
│   ├── services/              # Services de API
│   │
│   ├── styles/                # CSS global
│   │   └── index.css
│   │
│   ├── theme/                 # Temas Light/Dark
│   │   ├── AppThemeLight.ts
│   │   ├── AppThemeDark.ts
│   │   └── index.ts
│   │
│   ├── utils/                 # Utilitários
│   │   └── ErrorFallback.tsx
│   │
│   ├── views/                 # Páginas/Views
│   │   ├── home/
│   │   └── login/
│   │
│   ├── App.tsx                # Componente raiz
│   ├── AppConstants.tsx       # Constantes globais
│   └── main.tsx               # Entry point
│
├── CLAUDE.md                  # Instruções para Claude Code
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Arquitetura

### Padrão de Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                        Views (UI)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  ListView   │  │  FormView   │  │   Modal     │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                     DataSource                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  - Binding de dados automático                        │   │
│  │  - Gerenciamento de estado (browsing/editing)         │   │
│  │  - Validação integrada                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Services (API)                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  - Comunicação com backend REST                       │   │
│  │  - Injeção de dependência (IoC)                       │   │
│  │  - Transformação de dados                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API                               │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

1. **View** renderiza componentes vinculados ao DataSource
2. **DataSource** gerencia estado e notifica mudanças
3. **Service** executa operações CRUD via API
4. **Backend** processa e retorna dados

### Injeção de Dependência

```typescript
// 1. Definir símbolo (IOCTypes.ts)
export const API_TYPE = {
  UserService: Symbol.for('UserService'),
}

// 2. Registrar service (ContainerIOC.ts)
container.bind<UserService>(API_TYPE.UserService).to(UserService)

// 3. Usar na view
const userService = useArchbaseRemoteServiceApi<UserService>(API_TYPE.UserService)
```

---

## Configuração

### Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `VITE_API` | URL base da API | `http://localhost:8080` |
| `VITE_APP_NAME` | Nome da aplicação | `Minha App` |
| `VITE_APP_VERSION` | Versão da aplicação | `1.0.0` |

### Temas

Os temas são configurados em `src/theme/`:

```typescript
// AppThemeLight.ts
export const AppThemeLight: MantineThemeOverride = {
  colors: {
    appPrimary: ['#e6f2ff', '#cce5ff', ...],
  },
  primaryColor: 'appPrimary',
  // ...
}
```

### Internacionalização

Adicione traduções em `src/locales/{idioma}/translation.json`:

```json
{
  "WELCOME": "Bem-vindo",
  "SAVE": "Salvar",
  "CANCEL": "Cancelar"
}
```

---

## Guia de Desenvolvimento

### Criar uma Nova View

1. **Criar o Service** (se necessário):

```typescript
// src/services/ProductService.ts
@injectable()
export class ProductService extends ArchbaseRemoteApiService<ProductDto, string> {
  constructor(@inject(ARCHBASE_IOC_API_TYPE.ApiClient) client: ArchbaseRemoteApiClient) {
    super(client)
  }

  protected getEndpoint(): string {
    return '/api/v1/products'
  }

  public getId(entity: ProductDto): string {
    return entity.id
  }

  public isNewRecord(entity: ProductDto): boolean {
    return !entity.id
  }
}
```

2. **Registrar no IoC**:

```typescript
// IOCTypes.ts
export const API_TYPE = {
  Product: Symbol.for('ProductService'),
}

// ContainerIOC.ts
container.bind<ProductService>(API_TYPE.Product).to(ProductService)
```

3. **Criar a ListView**:

```typescript
// src/views/products/ProductListView.tsx
export function ProductListView() {
  const serviceApi = useArchbaseRemoteServiceApi<ProductService>(API_TYPE.Product)
  const ref = useRef<HTMLDivElement>(null)
  const [width, height] = useArchbaseSize(ref)

  const { dataSource } = useArchbaseRemoteDataSource<ProductDto, string>({
    name: 'dsProducts',
    service: serviceApi,
    pageSize: 25,
    loadOnStart: true,
  })

  return (
    <ArchbaseGridTemplate
      innerRef={ref}
      title="Produtos"
      dataSource={dataSource}
      // ...
    />
  )
}
```

4. **Adicionar à Navegação**:

```typescript
// navigationData.tsx
{
  label: 'Produtos',
  icon: IconPackage,
  link: '/products',
  component: ProductListView,
}
```

### Padrões Importantes

#### DataSource

```typescript
// Carregar dados
dataSource.open({ records: [...] })

// Inserir
dataSource.insert(newEntity)

// Editar
dataSource.edit()

// Salvar
await dataSource.save()

// Cancelar
dataSource.cancel()

// Remover
dataSource.remove()
```

#### Formulários

```typescript
const ref = useRef<HTMLDivElement>(null)
const [width, height] = useArchbaseSize(ref)

<ArchbaseFormTemplate innerRef={ref} dataSource={dataSource}>
  <ArchbaseEdit dataSource={dataSource} dataField="name" label="Nome" />
  <ArchbaseSelect
    dataSource={dataSource}
    dataField="status"
    options={statusOptions}
    getOptionLabel={(opt) => opt.name}
    getOptionValue={(opt) => opt.id}
  />
</ArchbaseFormTemplate>
```

#### Grids

```typescript
<ArchbaseDataGrid dataSource={dataSource} height={400}>
  <Columns>
    <ArchbaseDataGridColumn dataField="name" header="Nome" size={200} dataType="text" />
    <ArchbaseDataGridColumn dataField="price" header="Preço" size={100} dataType="number" />
  </Columns>
</ArchbaseDataGrid>
```

---

## Documentação Claude Code

Este boilerplate inclui documentação especializada para uso com **Claude Code**, permitindo assistência de IA inteligente durante o desenvolvimento.

### Arquivos de Documentação

| Arquivo | Descrição |
|---------|-----------|
| `CLAUDE.md` | Instruções principais e padrões |
| `.claude/SKILL.md` | Referência completa de componentes |
| `.claude/knowledge/` | Documentação modular por tema |
| `.claude/examples/` | Exemplos de código funcionais |
| `.claude/templates/` | Templates prontos para copiar |

### Como Usar

O Claude Code lerá automaticamente `CLAUDE.md` e terá acesso à documentação completa para:

- Criar novas views, forms e services
- Resolver problemas comuns
- Seguir padrões da biblioteca Archbase
- Gerar código consistente com o projeto

### Templates Disponíveis

```bash
# Copiar template de ListView
cp .claude/templates/ListViewTemplate.tsx src/views/myentity/MyEntityListView.tsx

# Copiar template de FormView
cp .claude/templates/FormViewTemplate.tsx src/views/myentity/MyEntityForm.tsx

# Copiar template de Service
cp .claude/templates/ServiceTemplate.ts src/services/MyEntityService.ts
```

---

## Convenções de Código

### Nomenclatura

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| DTOs | Sufixo `Dto` | `UserDto`, `ProductDto` |
| Services | Sufixo `Service` | `UserService`, `ProductService` |
| Views | Sufixo `View` | `UserListView`, `ProductFormView` |
| DataSources | Prefixo `ds` | `dsUser`, `dsProducts` |

### Imports

Use path aliases configurados no `tsconfig.json`:

```typescript
import { UserService } from '@services/UserService'
import { UserDto } from '@domain/user/UserDto'
import { ErrorFallback } from '@utils/ErrorFallback'
```

### TypeScript

- Sempre use tipos explícitos
- Prefira interfaces sobre types para objetos
- Use `type` imports para decorators Inversify

```typescript
import type { ArchbaseRemoteApiClient } from '@archbase/data'
```

---

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Regras de Commit

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

---

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">
  Desenvolvido com Archbase React
</p>
