# Plano: Convênios autenticados + ErrorState (404/403)

## Contexto

A página de cadastro de convênios já está em `(app)`, mas o Route Handler interno permanece fora do padrão autenticado (`/clinic-convenio-register`), quebrando a convenção Client Service → `/api/*` → API NestJS. Paralelamente, o projeto não possui tratamento visual padronizado para rotas inexistentes (404) nem para acesso sem permissão (403), embora a arquitetura e o design system prevejam `not-found.tsx` e um componente de estado de erro em `src/components/shared/`.

## Validação arquitetural

- Feature: existente (`convenios`) + infraestrutura compartilhada nova (`ErrorState`, helpers de permissão)
- Reutiliza componente existente: sim (`PageContainer`, `Button`, `AppShell`)
- Reutiliza GlobalModal / Loading / DataTable: não aplicável (telas de erro estáticas)
- Reutiliza hook existente: sim (`useCreateConvenio` — apenas atualização indireta via client service)
- Reutiliza service existente: sim (`createConvenioServerService` — endpoint NestJS permanece `/clinic-convenio-register`)
- Reutiliza schema existente: sim (`createConvenioSchema`)
- Reutiliza tipos existentes: sim (`CreateConvenioResponse`, `AppRole`, `SessionUser`)
- Usa shadcn/ui ou componente existente: sim (`Button` de `src/components/ui/button.tsx`)
- Exige novo componente shadcn/ui: não
- Há impacto em autenticação: sim (Route Handler sob `/api/convenios`; helper `requireAppRole`; `authInterrupts`)
- Há impacto em permissões/RBAC: sim (403 por role nas páginas de convênios; helper reutilizável)
- Há impacto em contrato de API: não (NestJS continua `POST /clinic-convenio-register`)
- Há impacto em Route Handler: sim (mover e remover handler legado)
- Exige teste unitário/componente: sim (`ErrorState`, `requireAppRole`, route handler `/api/convenios`)

## Páginas/componentes afetados

- `src/app/api/convenios/route.ts` (novo)
- `src/app/clinic-convenio-register/route.ts` (remover)
- `src/features/convenios/services/createConvenioClientService.ts`
- `src/app/(app)/convenios/cadastrar/page.tsx`
- `src/components/shared/ErrorState.tsx` (novo)
- `src/lib/auth/requireAppRole.ts` (novo)
- `src/config/permissions.ts` (novo)
- `src/app/not-found.tsx` (novo)
- `src/app/forbidden.tsx` (novo)
- `src/app/(app)/not-found.tsx` (novo)
- `src/app/(app)/forbidden.tsx` (novo)
- `next.config.ts`

## Contrato de API utilizado

- `POST /clinic-convenio-register` (NestJS, via `createConvenioServerService` — sem alteração de contrato externo)

## Dependências/configurações necessárias

- Habilitar `experimental.authInterrupts: true` em `next.config.ts` (obrigatório para `forbidden()` no Next.js 16 — ver `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/authInterrupts.md`)
- Nenhuma dependência npm nova

## Estratégia de testes

- Unitário/componente:
  - `src/components/shared/ErrorState.spec.tsx`
  - `src/lib/auth/requireAppRole.spec.ts`
  - `src/app/api/convenios/route.spec.ts`
- Cenários principais:
  - `ErrorState` renderiza título, descrição, código HTTP e ação primária para variantes `not-found` e `forbidden`
  - `requireAppRole` chama `forbidden()` quando role ausente ou não permitida; retorna sessão quando role permitida
  - `POST /api/convenios` retorna 401 sem cookie, 400 em JSON/schema inválido, 201 em sucesso
  - `createConvenioClientService` passa a chamar `/api/convenios` (ajustar mock se existir teste futuro)

## Passos de implementação

### 1. Spec do componente ErrorState

- Arquivo: `src/components/shared/ErrorState.spec.tsx`
- O que fazer: definir contrato do componente compartilhado de erro de página (nome alinhado ao design system e `docs/architecture.md`, não `PageError`). Props esperadas: `statusCode: 404 | 403`, `title`, `description`, `actionLabel`, `actionHref`; opcional `secondaryAction`. Usar `Button` e ícone Lucide (`FileQuestion` / `ShieldX`). Textos em pt-BR.
- Spec primeiro: este arquivo
- Depende de: Nenhum

### 2. Implementar ErrorState

- Arquivo: `src/components/shared/ErrorState.tsx`
- O que fazer: componente Server ou Client conforme necessidade (preferir Server Component se não houver hooks). Layout centralizado, acessível (`role="alert"`, heading semântico, foco em botão de ação). Exportar também presets/helpers leves, ex.: `notFoundErrorStateProps` e `forbiddenErrorStateProps`, para reutilizar em `not-found.tsx` e `forbidden.tsx`.
- Spec primeiro: `src/components/shared/ErrorState.spec.tsx`
- Depende de: passo 1

### 3. Spec e helper de permissão por role

- Arquivo: `src/lib/auth/requireAppRole.spec.ts`
- O que fazer: testar helper que compõe `requireServerSession()` + verificação de `AppRole`. Se role não estiver em `allowedRoles`, chamar `forbidden()` de `next/navigation` (mock como em `session.spec.ts`). Se permitido, retornar `ServerSession`.
- Spec primeiro: `src/lib/auth/requireAppRole.spec.ts`
- Depende de: Nenhum

### 4. Config de permissões e helper requireAppRole

- Arquivo: `src/config/permissions.ts`, `src/lib/auth/requireAppRole.ts`
- O que fazer: mapear rotas/recursos a roles permitidas. Para convênios, definir constante `CONVENIOS_ALLOWED_ROLES` (padrão inicial: `AppRole.ClinicAdmin` e `AppRole.Receptionist` — registrar no plano/risco que product deve confirmar). Exportar `requireAppRole(allowedRoles: AppRole[])` reutilizável por páginas server-side.
- Spec primeiro: `src/lib/auth/requireAppRole.spec.ts`
- Depende de: passo 3

### 5. Habilitar authInterrupts e criar páginas 404/403

- Arquivo: `next.config.ts`, `src/app/not-found.tsx`, `src/app/forbidden.tsx`, `src/app/(app)/not-found.tsx`, `src/app/(app)/forbidden.tsx`
- O que fazer:
  - Adicionar `experimental: { authInterrupts: true }` em `next.config.ts`.
  - Root `not-found.tsx` e `forbidden.tsx`: renderizar `ErrorState` com copy pt-BR; ação primária para `/login` ou `/` conforme contexto público.
  - `(app)/not-found.tsx` e `(app)/forbidden.tsx`: renderizar `ErrorState` dentro do fluxo autenticado (herda `AppShell` via layout `(app)`); ação primária para `/dashboard`.
  - Consultar docs Next 16: `notFound()` → `not-found.tsx`; `forbidden()` → `forbidden.tsx` (HTTP 403).
- Spec primeiro: coberto indiretamente por `ErrorState.spec.tsx`
- Depende de: passos 2 e 4

### 6. Proteger página de cadastro de convênios por role

- Arquivo: `src/app/(app)/convenios/cadastrar/page.tsx`
- O que fazer: tornar Server Component async; chamar `requireAppRole(CONVENIOS_ALLOWED_ROLES)` antes de renderizar `PageContainer` + `ConvenioRegisterForm`. Usuário autenticado sem role adequada deve ver 403 via `forbidden()`, não redirect para login.
- Spec primeiro: Não aplicável (coberto por `requireAppRole.spec.ts`)
- Depende de: passo 4

### 7. Spec do Route Handler /api/convenios

- Arquivo: `src/app/api/convenios/route.spec.ts`
- O que fazer: espelhar padrão de `src/app/api/auth/login/route.spec.ts` e `change-password/route.ts`: mock de cookies, `createConvenioServerService`, cenários 401/400/201.
- Spec primeiro: este arquivo
- Depende de: Nenhum

### 8. Mover Route Handler de convênios para /api/convenios

- Arquivo: `src/app/api/convenios/route.ts`
- O que fazer: migrar lógica de `src/app/clinic-convenio-register/route.ts` (validação cookie, `createConvenioSchema`, `createConvenioServerService`, envelope `{ ok, data | error }`). Manter status codes atuais. Opcional defensivo: retornar 403 JSON se role não permitida (alinhado a `CONVENIOS_ALLOWED_ROLES`) — apenas se não aumentar escopo além do necessário.
- Spec primeiro: `src/app/api/convenios/route.spec.ts`
- Depende de: passo 7

### 9. Atualizar client service e remover rota legada

- Arquivo: `src/features/convenios/services/createConvenioClientService.ts`
- O que fazer: alterar `fetch("/clinic-convenio-register")` para `fetch("/api/convenios")`. Manter envelope e tratamento de erro.
- Arquivo: `src/app/clinic-convenio-register/route.ts`
- O que fazer: remover arquivo/pasta após migração. Garantir que nenhuma referência permaneça no repo (grep).
- Spec primeiro: Não aplicável
- Depende de: passo 8

### 10. Verificação final de escopo

- Arquivo: Nenhum (grep + build)
- O que fazer: confirmar que staff (`clinic-user-register`, `clinic-user-types`) não foi alterado; `/convenios/listar` continua inexistente e cai em 404 global/(app) conforme layout; `PROTECTED_ROUTE_PREFIXES` já inclui `/convenios` — sem mudança necessária; sidebar permanece apontando para rotas futuras.
- Spec primeiro: Não aplicável
- Depende de: passos 5–9

## Riscos / atenções

- `forbidden()` exige `experimental.authInterrupts: true`; sem isso, build/runtime falha ao chamar o helper.
- Matriz de roles para convênios não está documentada na API; confirmar com product se `doctor` deve ou não acessar cadastro antes de fixar `CONVENIOS_ALLOWED_ROLES`.
- `(app)/not-found.tsx` só preserva shell autenticado quando o 404 ocorre dentro do segmento `(app)`; URLs globais inexistentes usam root `app/not-found.tsx` (sem sidebar) — comportamento esperado.
- Sidebar referencia `/convenios/listar`, que ainda não existe: usuário verá 404 até feature de listagem — fora deste escopo.
- Não mover handlers de staff nesta tarefa.
- `createConvenioServerService` continua chamando NestJS em `/clinic-convenio-register`; alterar apenas o Route Handler interno Next.js.
- Manter feedback de formulário via `GlobalModal`/`Loading` existentes em `ConvenioRegisterFormOverlays` — telas 404/403 não usam toast/Alert ad hoc.

## Checklist final

- [x] Specs unitárias/componentes escritas e passando quando aplicável
- [x] Componente sem lógica de negócio: delega a hooks/services
- [x] Tipos derivados dos contratos em `src/lib/api/types.ts`
- [x] Estados de loading, erro e vazio tratados na UI
- [x] Client Components não acessam token
- [x] Route Handler usado para chamadas autenticadas do client
- [x] shadcn/ui ou componente existente priorizado quando houver UI
- [x] GlobalModal, Loading ou DataTable reutilizados quando aplicável
- [x] Acessibilidade considerada em formulários, botões, mensagens e navegação
- [x] Imports seguem regra híbrida: relativo perto, alias longo
- [x] Sem `any` nos tipos, exceto justificativa explícita
- [x] Sem duplicação de DTO, schema, hook, service ou componente
- [x] `npm run test` sem erros quando aplicável (novos specs OK; 2 falhas pré-existentes em UserMenu.spec)
- [ ] `npm run lint` sem erros (5 erros pré-existentes fora do escopo)
- [x] `npm run build` sem erros
