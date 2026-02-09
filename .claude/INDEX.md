# Documentação Archbase React - Índice

Este índice mapeia toda a documentação disponível para desenvolvimento com Archbase React v3.

---

## Skills (Referência Rápida)

Para usar quando precisa fazer algo rapidamente. Exemplos minimalistas e tabelas resumidas.

**Localização:** `.claude/skills/archbase-react/`

| Arquivo | Conteúdo | Quando usar |
|---------|----------|-------------|
| `SKILL.md` | Índice mestre, comandos mais usados | Primeiro lugar para consultar |
| `01-datasource.md` | DataSource V1/V2, estados, operações | Criar/manipular dados |
| `02-inputs.md` | Componentes de input com binding | Montar formulários |
| `03-grid.md` | ArchbaseDataGrid, colunas, tipos | Criar tabelas/grids |
| `04-templates.md` | FormTemplate, PanelTemplate, etc | Layout de views |
| `05-services.md` | Services remotos, IoC | Comunicar com API |
| `06-forms.md` | Padrão de formulário, layout | Criar formulários |
| `07-security.md` | Sistema de permissões | Controle de acesso |
| `08-workspace.md` | Kanban, Lookup Modals, Workflow | Views complexas |
| `09-reference.md` | Checklists, correções críticas | Troubleshooting rápido |
| `10-advanced-patterns.md` | ECharts, KPI Cards, WebSocket | Dashboards avançados |
| `11-view-patterns.md` | Padrões de views (a criar) | Estrutura de views |
| `12-dashboard-patterns.md` | Padrões de dashboard (a criar) | Dashboards |

---

## Knowledge (Guias Detalhados)

Para usar quando precisa entender completamente um conceito. Exemplos completos e padrões avançados.

**Localização:** `.claude/knowledge/`

| Arquivo | Conteúdo | Quando usar |
|---------|----------|-------------|
| `archbase-datasource.md` | DataSource completo, eventos, validação | Aprender DataSource |
| `archbase-services.md` | Services completo, React Query | Aprender Services |
| `archbase-components-inputs.md` | Todos os inputs, props completas | Referência de inputs |
| `archbase-components-tables.md` | Grid completo, detail panel, ações | Referência de grids |
| `archbase-core.md` | Providers, hooks principais, i18n | Conceitos fundamentais |
| `archbase-security.md` | Segurança completa, endpoints | Implementar segurança |
| `form-patterns.md` | 6 padrões de forms | Forms avançados |
| `view-patterns.md` | Padrões de views CRUD (a criar) | Views avançadas |
| `troubleshooting.md` | Problemas comuns e soluções | Resolver bugs |

---

## Examples (Código Funcional)

Exemplos prontos para copiar e adaptar.

**Localização:** `.claude/skills/archbase-react/examples/`

| Arquivo | Conteúdo |
|---------|----------|
| `forms/BasicForm.example.tsx` | Formulário básico com DataSource V2 |
| `forms/TabsForm.example.tsx` | Formulário com abas |
| `views/ListView.example.tsx` | Lista com filtros e ações |
| `views/CRUDView.example.tsx` | View CRUD completa |
| `hooks/useDataSource.example.tsx` | Hook customizado |
| `services/RemoteService.example.ts` | Service com métodos customizados |

---

## Templates (Scaffolds)

Templates para criar novos componentes rapidamente.

**Localização:** `.claude/skills/archbase-react/templates/`

| Arquivo | Propósito |
|---------|-----------|
| `README.md` | Guia de uso dos templates |
| `ListViewTemplate.tsx` | Base para criar ListView |
| `FormViewTemplate.tsx` | Base para criar Form |
| `ManagerViewTemplate.tsx` | Base para criar CRUD completo |
| `ModalTemplates.tsx` | Bases para modais |
| `ServiceTemplate.ts` | Base para criar Service |

---

## Mapeamento: Skills ↔ Knowledge

| Tópico | Skills (Rápido) | Knowledge (Detalhado) |
|--------|-----------------|----------------------|
| DataSource | `01-datasource.md` | `archbase-datasource.md` |
| Services | `05-services.md` | `archbase-services.md` |
| Inputs | `02-inputs.md` | `archbase-components-inputs.md` |
| Grids | `03-grid.md` | `archbase-components-tables.md` |
| Forms | `06-forms.md` | `form-patterns.md` |
| Security | `07-security.md` | `archbase-security.md` |
| Templates | `04-templates.md` | - |
| Workspace | `08-workspace.md` | - |
| Advanced | `10-advanced-patterns.md` | - |

---

## Fluxo de Trabalho Recomendado

1. **Iniciando** → Leia `SKILL.md` para visão geral
2. **Fazer algo rápido** → Consulte o skill específico (01-10)
3. **Entender completamente** → Leia o arquivo de knowledge correspondente
4. **Copiar código** → Use os examples
5. **Criar do zero** → Use os templates
6. **Resolver problema** → Consulte `troubleshooting.md`

---

## Correções Críticas (Resumo)

| Errado | Correto |
|--------|---------|
| `ArchbaseDataTable` | `ArchbaseDataGrid` |
| `ArchbaseListTemplate` | `ArchbasePanelTemplate` |
| `caption` / `width` | `header` / `size` |
| `dataSource.setData()` | `dataSource.open()` ou V2: `setRecords()` |
| `service.findById()` | `service.findOne()` |
| `action === 'ADD'` | `action.toUpperCase() === 'ADD'` |
| `useElementSize` em forms | `ScrollArea` com `height: '100%'` |
| Store dinâmico | Store com nome fixo |

Para lista completa, veja `skills/archbase-react/09-reference.md`.

---

**Versão:** 3.0.7+
**Atualizado:** 2026-02-09
