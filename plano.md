# Plano: Rotas autenticadas, proteção de sessão e sidebar

## Contexto

O login já grava `accessToken` e `refreshToken` em cookies HTTP-only, mas rotas como `/dashboard` ainda são públicas — não há `proxy.ts`/`middleware`, nem `getServerSession()`. Esta tarefa protege as telas autenticadas, centraliza o layout do app com menu lateral e prepara a estrutura `(app)` prevista em `docs/architecture.md` para Dashboard, Agenda e Usuários (placeholders sem integração com API).

## Validação arquitetural

- Feature: existente (`auth` + infra compartilhada de layout/sessão)
- Reutiliza componente existente: sim (`Button`, `Separator`, `Sheet` para mobile; `PageHeader` se aplicável)
- Reutiliza GlobalModal / Loading / DataTable: não aplicável (layout estático e placeholders)
- Reutiliza hook existente: não
- Reutiliza service existente: não
- Reutiliza schema existente: não
- Reutiliza tipos existentes: sim (`LoginUser` em `src/features/auth/types.ts` como base mínima de sessão, se necessário)
- Usa shadcn/ui ou componente existente: sim
- Exige novo componente shadcn/ui: sim (`sidebar` — ainda não existe em `src/components/ui/`)
- Há impacto em autenticação: sim
- Há impacto em permissões/RBAC: não (apenas presença de cookie; RBAC fica para fases futuras)
- Há impacto em contrato de API: não
- Há impacto em Route Handler: não (handlers existentes continuam lendo cookie no servidor)
- Exige teste unitário/componente: sim

## Páginas/componentes afetados

- `src/proxy.ts` (novo — proteção de rotas no Next.js 16)
- `src/lib/auth/session.ts` (novo)
- `src/lib/auth/route-guards.ts` (novo — lógica testável extraída do proxy)
- `src/config/navigation.ts` (novo — itens do menu)
- `src/components/layout/AppSidebar.tsx` (novo)
- `src/components/layout/AppSidebar.spec.tsx` (novo)
- `src/components/layout/AppShell.tsx` (novo — Client Component com `SidebarProvider`)
- `src/components/layout/PageContainer.tsx` (novo — container padrão de páginas internas)
- `src/components/ui/sidebar.tsx` e dependências geradas pelo shadcn (novo)
- `src/app/(app)/layout.tsx` (novo)
- `src/app/(app)/dashboard/page.tsx` (mover de `src/app/dashboard/page.tsx`)
- `src/app/(app)/appointments/page.tsx` (novo — placeholder “Agenda”)
- `src/app/(app)/staff/page.tsx` (novo — placeholder “Usuários”)
- `src/app/dashboard/page.tsx` (remover após migração)
- `src/features/auth/constants/authRoutes.ts` (atualizar/estender rotas protegidas, se necessário)

## Contrato de API utilizado

Nenhum.

## Dependências/configurações necessárias

- Adicionar componente shadcn/ui Sidebar (e dependências que o CLI instalar, ex.: `collapsible`, `tooltip` se ausentes):
  ```bash
  npx shadcn@latest add sidebar
  ```
- Verificar convenção Next.js 16.2.6: usar `src/proxy.ts` com export `proxy` e `ProxyConfig` (conforme `docs/architecture.md` e tipos `NextProxy`/`ProxyConfig` em `next/server`). Não criar `middleware.ts` em paralelo.

## Estratégia de testes

- Unitário/componente:
  - `src/lib/auth/route-guards.spec.ts`
  - `src/lib/auth/session.spec.ts`
  - `src/components/layout/AppSidebar.spec.tsx`
- Cenários principais:
  - Rota protegida sem cookie `accessToken` → decisão de redirect para `/login` com `callbackUrl` seguro
  - Rota pública de auth (`/login`, `/register`) com cookie presente → redirect para `/dashboard`
  - `/change-password` permanece acessível mesmo autenticado (fluxo de primeiro acesso)
  - `getServerSession()` retorna `null`/ausente quando cookie inexistente; retorna sessão mínima quando cookie presente
  - Sidebar renderiza 3 itens (Dashboard, Agenda, Usuários) com links corretos (`/dashboard`, `/appointments`, `/staff`)
  - Item ativo reflete `pathname` atual
  - Placeholders das páginas internas renderizam título esperado

## Passos de implementação

### 1. Constantes de navegação e rotas protegidas

- Arquivo: `src/config/navigation.ts`
- O que fazer: definir `APP_NAV_ITEMS` com label PT-BR e path alinhado à arquitetura:
  - Dashboard → `/dashboard`
  - Agenda → `/appointments`
  - Usuários → `/staff`
  Exportar também listas auxiliares (`PROTECTED_ROUTE_PREFIXES`, `AUTH_PUBLIC_ROUTES`, `AUTH_ROUTES_REDIRECT_WHEN_AUTHENTICATED`) para uso no proxy e nos testes.
- Spec primeiro: Não aplicável (constantes puras; cobertura indireta via `route-guards.spec.ts`)
- Depende de: Nenhum

### 2. Utilitário de sessão server-side

- Arquivo: `src/lib/auth/session.ts`
- O que fazer: criar `getServerSession()` usando `cookies()` de `next/headers`. Ler cookie `accessToken`; se ausente, retornar `null`. Se presente, retornar objeto mínimo tipado (ex.: `{ isAuthenticated: true }` — sem expor token ao client). Criar `requireServerSession()` que redireciona para `/login` quando sessão ausente (uso opcional em páginas/layout server-side como camada extra).
- Spec primeiro: `src/lib/auth/session.spec.ts`
- Depende de: Nenhum

### 3. Lógica testável de guardas de rota

- Arquivo: `src/lib/auth/route-guards.ts`
- O que fazer: extrair funções puras, ex.: `resolveProtectedRouteRedirect(pathname, hasAccessToken)` e `resolveAuthRouteRedirect(pathname, hasAccessToken)`, encapsulando regras de redirect. Validar `callbackUrl`/`next` de forma segura (apenas paths internos começando com `/`, rejeitando `//` e URLs externas).
- Spec primeiro: `src/lib/auth/route-guards.spec.ts`
- Depende de: Passo 1

### 4. Proxy de proteção de rotas (Next.js 16)

- Arquivo: `src/proxy.ts`
- O que fazer: implementar export `proxy(request: NextRequest)` que:
  1. Ignora assets estáticos via `matcher`/`config.matcher` adequado (`_next/static`, `_next/image`, favicon, imagens).
  2. Verifica existência do cookie `accessToken` (checagem otimista — sem validar JWT no proxy).
  3. Bloqueia rotas protegidas (`/dashboard`, `/appointments`, `/staff` e prefixos futuros do grupo `(app)`) redirecionando para `/login?callbackUrl=<path>` quando sem cookie.
  4. Redireciona usuários autenticados que tentam acessar `/login` ou `/register` para `/dashboard`.
  5. **Não** redireciona autenticados em `/change-password` nem `/register/validate-token`.
  6. Não interfere em `POST /api/auth/*` (matcher ou early return para `/api/`).
  Delegar decisões às funções do passo 3.
- Spec primeiro: coberto por `src/lib/auth/route-guards.spec.ts` (proxy fino; evitar teste E2E do runtime Next no Vitest)
- Depende de: Passos 1 e 3

### 5. Instalar Sidebar shadcn/ui

- Arquivo: `src/components/ui/sidebar.tsx` (+ arquivos gerados pelo CLI)
- O que fazer: executar `npx shadcn@latest add sidebar`. Revisar imports gerados para usar alias `@/` conforme projeto. Não customizar tokens além do necessário.
- Spec primeiro: Não aplicável
- Depende de: Nenhum

### 6. Sidebar do app

- Arquivo: `src/components/layout/AppSidebar.tsx`
- O que fazer: Client Component usando primitivos shadcn Sidebar. Renderizar logo/título do app, lista de navegação a partir de `APP_NAV_ITEMS`, ícones Lucide (`LayoutDashboard`, `Calendar`, `Users`). Destacar item ativo via `usePathname()`. Links com `next/link`. Sem chamadas de API. Garantir `aria-label` em botões de ícone e navegação por teclado (preservar acessibilidade do shadcn).
- Spec primeiro: `src/components/layout/AppSidebar.spec.tsx`
- Depende de: Passos 1 e 5

### 7. Shell de layout autenticado

- Arquivo: `src/components/layout/AppShell.tsx`, `src/components/layout/PageContainer.tsx`
- O que fazer:
  - `AppShell`: Client Component com `SidebarProvider`, `AppSidebar`, área principal (`SidebarInset` ou equivalente) e slot `{children}`.
  - `PageContainer`: wrapper server-friendly com padding/responsividade padrão para conteúdo das páginas.
- Spec primeiro: Não aplicável (coberto indiretamente pelo spec da sidebar e smoke das páginas)
- Depende de: Passo 6

### 8. Layout do grupo de rotas `(app)`

- Arquivo: `src/app/(app)/layout.tsx`
- O que fazer: Server Component que envolve `{children}` com `AppShell`. Opcionalmente chamar `getServerSession()` e `redirect('/login')` como defesa em profundidade (proxy já protege). Manter layout enxuto — sem lógica de domínio.
- Spec primeiro: Não aplicável
- Depende de: Passos 2 e 7

### 9. Migrar Dashboard e criar placeholders

- Arquivo: `src/app/(app)/dashboard/page.tsx`, `src/app/(app)/appointments/page.tsx`, `src/app/(app)/staff/page.tsx`
- O que fazer:
  - Mover conteúdo atual de `src/app/dashboard/page.tsx` para `(app)/dashboard/page.tsx`, adaptando para usar `PageContainer` e título via `PageHeader` (se criado) ou heading simples.
  - Criar placeholders em `appointments` (“Agenda — em breve”) e `staff` (“Usuários — em breve”).
  - Remover `src/app/dashboard/page.tsx` antigo para evitar rota duplicada fora do grupo protegido.
  - Manter URLs públicas inalteradas: `/dashboard`, `/appointments`, `/staff` (grupo `(app)` não altera URL).
- Spec primeiro: Não aplicável (conteúdo estático; validar manualmente ou snapshot mínimo se desejado)
- Depende de: Passo 8

### 10. Ajustes finais de rotas auth e verificação

- Arquivo: `src/features/auth/constants/authRoutes.ts` (se necessário)
- O que fazer: garantir consistência das constantes de redirect pós-login (`AUTH_ROUTES.dashboard` continua `/dashboard`). Confirmar que `LoginForm` e links da landing continuam funcionando após migração. Rodar `npm run test`, `npm run lint`, `npm run build`.
- Spec primeiro: Não aplicável
- Depende de: Passos 4 e 9

## Riscos / atenções

- **Next.js 16 proxy vs middleware:** usar `src/proxy.ts` com export `proxy`; confirmar na documentação local (`node_modules/next/dist/docs/` ou tipos em `next/server`) antes de implementar — não manter os dois arquivos.
- **Segurança em camadas:** o proxy faz checagem otimista de cookie; validação real de token permanece nos Route Handlers (`change-password` já lê `accessToken`). Não decodificar/expor JWT em Client Components.
- **Open redirect:** sanitizar `callbackUrl`/`next` ao redirecionar para login pós-auth.
- **`/change-password`:** usuário autenticado com `passwordChangeRequired` precisa acessar a rota — excluir do redirect “auth → dashboard”.
- **Sidebar mobile:** shadcn Sidebar usa `Sheet` em viewport pequeno — validar toggle e foco.
- **Escopo de menu vs arquitetura:** labels “Agenda” e “Usuários” no menu; paths `/appointments` e `/staff` conforme `docs/architecture.md` (não criar `/agenda` ou `/usuarios` para evitar divergência futura).
- **Duplicação:** centralizar itens de menu em `src/config/navigation.ts`; não hardcodar links no sidebar e nas páginas separadamente.

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
- [x] `npm run test` sem erros quando aplicável
- [ ] `npm run lint` sem erros (5 erros pré-existentes fora do escopo: Table/index.tsx, create-pr-on-approval.js)
- [x] `npm run build` sem erros
