---
name: design-system
description: Padrões de design system com Tailwind CSS v4, shadcn/ui Radix e preset Nova - Lucide / Geist para o MVP Clínicas Web.
disable-model-invocation: true
---

# Design System — MVP Clínicas Web

## Objetivo

Garantir consistência visual, acessibilidade e reaproveitamento de componentes no MVP Clínicas Web.

Use esta skill sempre que criar ou alterar:

- páginas visuais;
- componentes de UI;
- layouts;
- formulários;
- estados de loading/erro/vazio;
- componentes shadcn/ui;
- classes Tailwind.

---

## Biblioteca base

O projeto utiliza **Tailwind CSS v4**, **shadcn/ui com Radix**, preset **Nova - Lucide / Geist** e `lucide-react`.

Sempre que possível, utilizar **shadcn/ui** antes de criar componentes próprios.

Prioridade obrigatória:

1. Reutilizar componente existente em `src/components/ui`.
2. Adicionar/usar componente equivalente do shadcn/ui.
3. Criar componente próprio somente se não houver equivalente adequado.

Quando um componente shadcn/ui necessário ainda não existir em `src/components/ui`, adicionar via CLI:

```bash
npx shadcn@latest add nome-do-componente
```

---

## Componentes shadcn/ui recomendados

Usar shadcn/ui para:

- Button
- Input
- Label
- Form
- Dialog
- Select
- Textarea
- Badge
- Card
- Table
- DropdownMenu
- Tabs
- Alert
- Sheet
- Separator
- Skeleton
- Sonner/Toast
- Tooltip
- Popover
- Avatar

Comando exemplo:

```bash
npx shadcn@latest add button input label form dialog select textarea badge card table dropdown-menu tabs alert sheet separator skeleton sonner tooltip popover avatar
```

---

## Proibido

- recriar manualmente `Button`, `Input`, `Dialog`, `Select`, `Card`, `Table` ou `Badge` se shadcn/ui atender;
- duplicar componentes em `src/components/ui`;
- criar componente visual customizado sem verificar shadcn/ui;
- aplicar estilos inconsistentes com o design system;
- usar valores arbitrários de Tailwind quando já existir token equivalente;
- remover acessibilidade padrão dos componentes shadcn/ui.

---

## Tokens de design

Usar tokens semânticos gerados pelo shadcn/ui e Tailwind CSS v4.

```txt
bg-background
text-foreground
text-muted-foreground
border-border
bg-card
text-card-foreground
bg-primary
text-primary-foreground
bg-destructive
text-destructive-foreground
```

Evitar valores arbitrários:

```txt
text-[#123456]
bg-[#f1f2f3]
```

Valores arbitrários só devem ser usados quando não houver token adequado e houver justificativa clara.

---

## Layout

Usar layout consistente:

```txt
src/components/layout/
  AppLayout.tsx
  Header.tsx
  Sidebar.tsx
  PageContainer.tsx
```

Páginas internas devem usar container padrão quando existir.

---

## Estados compartilhados

Estados genéricos devem ficar em:

```txt
src/components/shared/
```

Exemplos:

- LoadingState
- ErrorState
- EmptyState
- PageHeader

Para skeletons, priorizar `Skeleton` do shadcn/ui.

Para overlay de carregamento em operações assíncronas (login, submit longo), usar:

```txt
src/components/Loader/loaderView.tsx   → exporta Loading
```

Import:

```tsx
import { Loading } from '@/components/Loader/loaderView';
```

Props: `isOpen: boolean`, `message: string`.

---

## GlobalModal

Modal composto para confirmações e feedback ao usuário.

```txt
src/components/GlobalModal/GlobalModal.tsx
```

Import:

```tsx
import { GlobalModal } from '@/components/GlobalModal';
```

Tipos: `GlobalModalType = "warning" | "error" | "success" | "none"`.

Props principais:

| Prop | Descrição |
|------|-----------|
| `type` | Define ícone e cores (warning, error, success, none) |
| `open` | Controla visibilidade |
| `modalTitle` / `modalSubTitle` | Título e subtítulo |
| `onConfirm` / `onCancel` | Callbacks dos botões |
| `loading` | Spinner no botão confirmar |
| `showCancel` / `showConfirm` | Exibir/ocultar botões |
| `confirmLabel` / `cancelLabel` | Textos dos botões (padrão: "Continuar" / "Cancelar") |
| `showContent` / `content` | Área de conteúdo extra |
| `titleAlign` / `footerAlign` | Alinhamento do cabeçalho e rodapé |

Regras:

- Usar para confirmações destrutivas, erros de operação e sucesso pós-ação.
- Não recriar modais ad hoc com `Dialog` quando `GlobalModal` atender.
- Modal de warning não exibe botão de fechar (`showCloseButton` ignorado para `type="warning"`).

---

## DataTable

Tabela composta com TanStack Table sobre primitivos shadcn/ui.

```txt
src/components/Table/
  index.tsx              → DataTable (default export)
  pagination.tsx         → DataTablePagination
  header-sort-icon.tsx   → SortIcon
```

Import:

```tsx
import DataTable from '@/components/Table';
```

Dependência: `@tanstack/react-table`.

Props principais:

| Prop | Descrição |
|------|-----------|
| `data` / `columns` | Dados e definição de colunas (`ColumnDef[]`) |
| `isLoading` | Exibe linha de loading com spinner |
| `noResults` | Mensagem ou node quando vazio |
| `pagination` / `setPagination` | Paginação manual (server-side) |
| `sorting` / `setSorting` | Ordenação controlada |
| `rowSelection` / `setRowSelection` | Seleção de linhas |
| `rowCount` | Total de registros (paginação manual) |
| `getRowId` | Função customizada de ID da linha |
| `onRowSelectionChange` | Callback com linhas selecionadas |
| `rowSize` | `"sm"` \| `"md"` \| `"lg"` — padding das células |
| `centralizeInformation` | Centraliza conteúdo das células |

`ColumnMeta` estendido:

- `showDashWhenEmpty` — exibe `-` quando valor vazio;
- `allowDashInExpanded` — aplica dash também em sub-rows expandidas.

Regras:

- Usar `DataTable` para listagens de domínio (pacientes, agendamentos, staff).
- Paginação manual quando dados vêm paginados da API (`manualPagination: true`).
- Paginação só aparece quando `rowCount > 10`.
- Não recriar tabela com `Table` shadcn/ui diretamente para listagens paginadas/sortáveis.
- Estado de loading inline na tabela; overlay global continua sendo `Loading`.

Exemplo mínimo:

```tsx
'use client';

import { useState } from 'react';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import DataTable from '@/components/Table';

const columns: ColumnDef<Patient>[] = [/* ... */];

export function PatientsTable({ data, total }: Props) {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<SortingState>([]);

  return (
    <DataTable
      data={data}
      columns={columns}
      rowCount={total}
      pagination={pagination}
      setPagination={setPagination}
      sorting={sorting}
      setSorting={setSorting}
      isLoading={false}
    />
  );
}
```

---

## Formulários

Formulários devem usar:

- React Hook Form;
- Zod;
- `@hookform/resolvers/zod`;
- componentes shadcn/ui de formulário;
- mensagens de erro visíveis e acessíveis.

Preferir a composição padrão shadcn:

- `Form`
- `FormField`
- `FormItem`
- `FormLabel`
- `FormControl`
- `FormMessage`

Campos precisam ter:

- label associado;
- erro visível próximo ao campo;
- estado disabled/loading durante submit;
- foco visível;
- mensagens em português.

---

## Acessibilidade obrigatória

- Todo input deve ter `<label htmlFor>` correspondente ou `aria-label`.
- Botões apenas com ícone devem ter `aria-label`.
- Mensagens de erro devem ser perceptíveis e próximas do campo.
- Nunca remover foco visível sem substituto.
- Preferir seletores acessíveis para testes: role, label, placeholder, text.
- Cores devem respeitar contraste adequado.

---

## Responsividade

Padrão mobile-first.

Correto:

```tsx
<div className="flex flex-col gap-4 md:flex-row md:items-center">
```

Evitar pensar primeiro em desktop e adaptar mobile depois.

---

## Imports de componentes UI

Como componentes shadcn/ui ficam fora da feature, usar alias:

```ts
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

Dentro da mesma pasta ou feature, usar import relativo.

---

## Checklist de UI

- [ ] Reutilizou componente existente antes de criar novo.
- [ ] Priorizou shadcn/ui quando aplicável.
- [ ] Não recriou componente primitivo existente.
- [ ] UI é responsiva mobile-first.
- [ ] Inputs possuem label acessível.
- [ ] Botões de ícone possuem `aria-label`.
- [ ] Estados loading/error/empty/success foram tratados.
- [ ] Listagens usam `DataTable` quando aplicável.
- [ ] Confirmações/feedback usam `GlobalModal` quando aplicável.
- [ ] Overlay de carregamento usa `Loading` quando aplicável.
- [ ] Não há valores arbitrários desnecessários.
- [ ] O padrão visual está consistente com o restante do projeto.
