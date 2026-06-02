---
name: react
description: Índice e regras essenciais de Next.js 16 + React 19 para o MVP Clínicas Web.
disable-model-invocation: true
---

# React / Next.js 16 Skill

## Objetivo

Esta skill é a fonte principal dos padrões React/Next.js do MVP Clínicas Web.

Ela deve ser lida antes de qualquer implementação que envolva:

- páginas;
- componentes;
- hooks;
- services;
- providers;
- data fetching;
- autenticação;
- formulários;
- testes de interface.

Este arquivo é apenas um índice. Os detalhes ficam nos arquivos complementares desta pasta.

---

## Stack oficial

- Next.js 16 com App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod
- API NestJS
- Cookies HTTP-only
- Arquitetura por feature

---

## Arquivos desta skill

```txt
.cursor/skills/react/
  SKILL.md
  architecture.md
  data-fetching.md
  forms.md
  testing.md
  conventions.md
```

---

## Leitura obrigatória mínima

Antes de implementar qualquer tarefa React/Next.js, leia:

```txt
.cursor/skills/react/SKILL.md
.cursor/skills/react/architecture.md
.cursor/skills/react/data-fetching.md
```

---

## Leitura condicional

Leia também:

```txt
.cursor/skills/react/forms.md
```

Quando a tarefa envolver formulários, validação, React Hook Form ou Zod.

Leia também:

```txt
.cursor/skills/react/testing.md
```

Quando a tarefa envolver criação/alteração de testes, componentes interativos ou comportamento de usuário.

Leia também:

```txt
.cursor/skills/react/conventions.md
```

Antes de finalizar qualquer implementação.

---

## Regras essenciais

- Toda página em `src/app` começa como Server Component.
- Client Component somente quando houver necessidade real.
- Regra de negócio fica dentro de `src/features/`.
- Componentes de domínio ficam dentro da feature.
- Componentes compartilhados ficam em `src/components/`.
- Client Components nunca acessam token.
- Cookies devem ser HTTP-only.
- Chamadas autenticadas feitas pelo client passam por Route Handler.
- TanStack Query é usado somente em Client Components.
- React Hook Form + Zod são obrigatórios em formulários.
- Não usar `any`, exceto justificativa explícita e localizada.
- Não duplicar tipos, schemas, hooks ou services.
- Usar imports relativos para arquivos próximos e alias `@/` para arquivos fora da área imediata.
- Todo carregamento de dados deve tratar loading, error, empty e success.
- Usar shadcn/ui ou componentes existentes antes de criar componentes visuais próprios.
- Não criar abstrações prematuras.
- Não refatorar fora do escopo da tarefa.

---

## Ordem recomendada de implementação

1. Conferir contrato de API em `docs/api-contracts.md`.
2. Reutilizar tipos existentes.
3. Criar ou ajustar service.
4. Criar ou ajustar schema, se houver formulário.
5. Criar ou ajustar hook, se houver estado client-side ou TanStack Query.
6. Criar ou ajustar componente.
7. Criar ou ajustar página.
8. Criar ou ajustar testes.
9. Validar estados de UI.
10. Rodar lint, testes e build.

---

## Antes de criar qualquer arquivo

Verifique se já existe equivalente em:

```txt
src/features/<feature>/
src/components/
src/lib/
src/config/
```

Só crie novo artefato quando não houver reaproveitamento adequado.

---

## Proibido

- lógica de negócio em `src/app`;
- chamadas HTTP diretas para API NestJS dentro de componentes;
- token no client;
- DTO duplicado;
- schema duplicado;
- hook genérico sem uso real;
- componente compartilhado usado apenas uma vez;
- alteração de contrato de API sem previsão no plano;
- refactor fora do escopo;
- recriar manualmente componente já disponível via shadcn/ui.
