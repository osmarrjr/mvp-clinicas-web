# Arquitetura — MVP Clínicas Web

## Visão geral

- **Next.js 16** com App Router e TypeScript.
- **React 19**.
- **Tailwind CSS** para estilização.
- **shadcn/ui** como base preferencial para componentes de UI.
- **TanStack Query** para cache, mutações e revalidação em Client Components.
- **React Hook Form + Zod** para formulários.
- **Supabase Auth** no backend/API, com token JWT protegido no frontend via cookie HTTP-only.
- Consome a API REST NestJS via `NEXT_PUBLIC_API_URL`.
- Arquitetura por feature.

---

## Estrutura principal

```txt
src/
  app/
  features/
  components/
  lib/
  config/
  providers/
  middleware.ts   # ou proxy.ts no Next.js 16+
```

---

## Fluxo de autenticação

1. Usuário faz login no frontend.
2. O frontend envia credenciais para um **Route Handler** interno do Next.js.
3. O Route Handler chama `POST /auth/login` na API NestJS.
4. A API retorna `{ accessToken, refreshToken, user }`.
5. O Route Handler grava os tokens em cookies HTTP-only.
6. Middleware/Proxy Next.js verifica o cookie nas rotas protegidas.
7. Server Components leem sessão/token via função server-side, como `getServerSession()`.
8. Client Components **não acessam token**; quando precisam de dados autenticados, chamam Route Handlers internos.

Fluxo obrigatório para chamadas autenticadas feitas pelo client:

```txt
Client Component
 ↓
Client Service
 ↓
Route Handler Next.js
 ↓
API NestJS
```

---

## Estrutura de rotas

```txt
src/app/
  layout.tsx
  (auth)/
    login/
      page.tsx
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

## Bounded contexts / features

- **Auth**: login, onboarding admin, OAuth Google e recuperação de senha.
- **Dashboard**: visão geral do dia e contadores.
- **Patients**: lista, detalhe, criação e edição de pacientes.
- **Appointments**: lista com filtros, detalhe, criação, edição e transições de status.
- **Staff**: lista e criação de médicos/recepcionistas.
- **Profile**: visualização e edição do próprio perfil.
- **Permissions**: permissões efetivas e vínculo secretária → médicos.

Cada domínio deve ficar em `src/features/<feature>`.

---

## Camadas

```txt
src/app/            → rotas, layouts, páginas e route handlers
src/features/       → regra de negócio por domínio
src/components/     → UI compartilhada, layout e estados genéricos
src/lib/            → infraestrutura compartilhada, API client, sessão, erros e utils
src/config/         → rotas, menus, constantes e env helpers
src/providers/      → providers globais
src/middleware.ts ou src/proxy.ts   → proteção de rotas autenticadas
```

---

## Componentes

Componentes de domínio ficam na feature:

```txt
src/features/patients/components/PatientForm.tsx
```

Componentes compartilhados ficam em:

```txt
src/components/ui/
src/components/layout/
src/components/shared/
```

Antes de criar componente visual próprio, verificar se já existe em `src/components/ui` ou se pode ser adicionado via shadcn/ui.

---

## Data fetching

- Server Components usam Server Services.
- Client Components usam hooks + TanStack Query quando houver interação, cache ou mutação.
- Client Components não fazem HTTP direto para API NestJS autenticada.
- Client Components chamam Route Handlers internos.

---

## Relações principais

- `User` pertence a `Clinic`.
- `Patient` pertence a `Clinic`.
- `Appointment` referencia `Patient`, `Doctor(User)` e pertence a `Clinic`.
- `Receptionist` acessa `Appointments` somente dos médicos vinculados via `secretary_doctor_access`.
