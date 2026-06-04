# Arquitetura React 19 / Next.js 16

## Estrutura base

```txt
src/
  app/
  features/
  components/
  lib/
  config/
  providers/
  middleware.ts
```

---

## App Router

Estrutura esperada:

```txt
src/app/
  layout.tsx
  (auth)/
    login/
      page.tsx
      _components/
    register/
      page.tsx
    password-recovery/
      page.tsx
  (app)/
    layout.tsx
    dashboard/
      page.tsx
    patients/
      page.tsx
      [id]/
        page.tsx
    appointments/
      page.tsx
      [id]/
        page.tsx
    staff/
      page.tsx
    profile/
      page.tsx
  not-found.tsx
  error.tsx
```

---

## `src/app`

Responsável por:

- rotas;
- layouts;
- páginas;
- route handlers;
- autenticação;
- busca inicial de dados.

Não colocar em `src/app`:

- regra de negócio complexa;
- validações extensas;
- transformações complexas;
- chamadas duplicadas à API;
- componentes grandes de domínio.

---

## Regra para páginas

As páginas devem:

1. validar sessão quando necessário;
2. buscar dados iniciais;
3. renderizar componentes da feature;
4. passar `initialData` quando aplicável.

Exemplo:

```tsx
export default async function PatientsPage() {
  const patients = await getPatients();

  return <PatientsPageContent initialData={patients} />;
}
```

A página deve ser uma camada fina.

---

## Server Components

Toda página começa como Server Component.

Usar Server Components para:

- validação de sessão;
- busca inicial de dados;
- renderização inicial;
- leitura de cookies HTTP-only;
- redirecionamentos protegidos.

Server Components são preferíveis sempre que possível.

---

## Client Components

Usar Client Component apenas quando precisar de:

- estado local;
- eventos;
- React Hook Form;
- TanStack Query;
- browser APIs;
- modais;
- filtros;
- componentes interativos.

Adicionar somente quando necessário:

```tsx
'use client';
```

Não transformar uma página inteira em Client Component sem necessidade.

---

## `src/features`

Cada domínio deve ficar em uma feature.

Exemplo:

```txt
features/
  patients/
    components/
    hooks/
    services/
    schemas/
    types.ts
```

Exemplos de features:

```txt
features/auth
features/dashboard
features/patients
features/appointments
features/staff
features/profile
features/permissions
```

Toda regra de negócio pertence à feature.

---

## `src/components`

Usar apenas para componentes compartilhados.

Exemplos:

```txt
components/ui/
components/layout/
components/shared/
components/GlobalModal/
components/Loader/
components/Table/
```

Componentes compostos disponíveis:

- `GlobalModal` — modal de confirmação/feedback (`warning`, `error`, `success`, `none`);
- `Loading` — overlay de carregamento com logo e spinner;
- `DataTable` — tabela com TanStack Table (sort, paginação manual, seleção, sub-rows).

Referência de uso: `.cursor/skills/design-system/SKILL.md`.

Não colocar componentes específicos de domínio.

Correto:

```txt
features/patients/components/PatientForm.tsx
```

Errado:

```txt
components/PatientForm.tsx
```

---

## `src/lib`

Infraestrutura compartilhada:

- API client;
- sessão e cookies;
- tratamento de erros;
- utilitários;
- tipos globais.

Exemplos:

```txt
lib/api/client.ts
lib/api/types.ts
lib/api/error-messages.ts
lib/auth/session.ts
lib/utils.ts
```

Não colocar regra de negócio de domínio em `lib`.

---

## Estados obrigatórios de UI

Todo componente que carrega dados deve tratar:

- loading;
- error;
- empty;
- success.

Não renderizar listas diretamente sem tratar estados.

---

## Checklist de arquitetura

- [ ] Página continua simples.
- [ ] Server Component usado por padrão.
- [ ] Client Component usado somente quando necessário.
- [ ] Regra de negócio está na feature.
- [ ] Componentes de domínio estão na feature.
- [ ] Componentes compartilhados estão em `components/`.
- [ ] Infraestrutura compartilhada está em `lib/`.
- [ ] Não houve refactor fora do escopo.
