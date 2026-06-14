# Arquitetura — SisMed Web

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

1. Usuário faz login no frontend (`LoginForm` → `useLogin` → `authClientService`).
2. O frontend envia credenciais para o Route Handler interno `POST /api/auth/login`.
3. O Route Handler valida com `loginSchema` e chama `loginServerService`.
4. O Server Service chama `POST /auth/login` na API NestJS.
5. A API retorna `{ accessToken, refreshToken, user }`.
6. O Route Handler grava `accessToken` e `refreshToken` em cookies HTTP-only e responde ao client apenas com `{ user }`.
7. Middleware/Proxy Next.js verifica o cookie nas rotas protegidas.
8. Server Components leem sessão/token via função server-side, como `getServerSession()`.
9. Client Components **não acessam token**; quando precisam de dados autenticados, chamam Route Handlers internos.

### Feature Auth (implementada)

```txt
src/features/auth/
  components/LoginForm.tsx
  hooks/useLogin.ts
  schemas/loginSchema.ts
  services/authClientService.ts
  services/authServerService.ts

src/app/
  (auth)/login/page.tsx
  api/auth/login/route.ts
```

Referência detalhada: `.cursor/skills/react/auth.md`.

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
src/components/ui/           → primitivos shadcn/ui
src/components/layout/       → AppLayout, Header, Sidebar, PageContainer
src/components/shared/       → LoadingState, ErrorState, EmptyState, PageHeader
src/components/GlobalModal/  → modal de confirmação/feedback (warning, error, success)
src/components/Loader/       → overlay de carregamento global (Loading)
src/components/Table/        → DataTable com TanStack Table (sort, paginação, seleção)
```

Antes de criar componente visual próprio, verificar se já existe em `src/components/ui`, nos componentes compartilhados acima ou se pode ser adicionado via shadcn/ui.

Referência de uso: `.cursor/skills/design-system/SKILL.md`.

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
