# Plano: Rotas autenticadas com mock de auth e layout (sidebar + header)

## Contexto

O projeto já possui login via Route Handler e cookies HTTP-only, mas ainda não há middleware, sessão server-side nem rotas internas protegidas. Esta tarefa introduz a área autenticada `(app)` com layout padrão (menu lateral de 10 itens mock e header com logo, toggle e menu do usuário), páginas placeholder e um **mock de autenticação com bypass** para permitir desenvolvimento sem API NestJS integrada — o login deve redirecionar para a área autenticada mesmo quando a API falhar.

## Validação arquitetural

- Feature: existente (`auth`) + infraestrutura compartilhada (`lib/auth`, `components/layout`, `config`) + rotas `(app)` novas
- Reutiliza componente existente: sim (`LoginForm`, `Loading`, `dropdown-menu`, `sheet`, `button`, `separator`)
- Reutiliza GlobalModal / Loading / DataTable: Loading sim (login); GlobalModal/DataTable não aplicável nesta tarefa
- Reutiliza hook existente: sim (`useLogin` — estender com redirecionamento pós-sucesso)
- Reutiliza service existente: sim (`authClientService`, `authServerService` — login com ramo mock)
- Reutiliza schema existente: sim (`loginSchema`)
- Reutiliza tipos existentes: parcial — criar `src/lib/api/types.ts` com `User` conforme `docs/api-contracts.md` (ainda não existe no repo)
- Usa shadcn/ui ou componente existente: sim (`DropdownMenu`, `Sheet`, `Button`, `Separator`)
- Exige novo componente shadcn/ui: não (ícone `User` do `lucide-react` no trigger do dropdown; `Avatar` opcional, não obrigatório)
- Há impacto em autenticação: sim
- Há impacto em permissões/RBAC: não (apenas link placeholder “Permissões” no menu do usuário)
- Há impacto em contrato de API: não (mock local; API real permanece para quando mock estiver desligado)
- Há impacto em Route Handler: sim (`/api/auth/login` com bypass; novo `/api/auth/logout`)
- Exige teste unitário/componente: sim
- Exige teste E2E: sim

## Páginas/componentes afetados

- `src/middleware.ts` (novo)
- `src/config/navigation.ts` (novo)
- `src/lib/api/types.ts` (novo)
- `src/lib/auth/mock.ts` (novo)
- `src/lib/auth/session.ts` (novo)
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts` (novo)
- `src/features/auth/hooks/useLogin.ts`
- `src/features/auth/hooks/useLogout.ts` (novo)
- `src/features/auth/services/authClientService.ts`
- `src/features/auth/components/LoginForm.tsx`
- `src/components/layout/AppLayout.tsx` (novo)
- `src/components/layout/Header.tsx` (novo)
- `src/components/layout/Sidebar.tsx` (novo)
- `src/components/layout/PageContainer.tsx` (novo)
- `src/app/(app)/layout.tsx` (novo)
- `src/app/(app)/dashboard/page.tsx` (novo)
- `src/app/(app)/patients/page.tsx` (novo)
- `src/app/(app)/appointments/page.tsx` (novo)
- `src/app/(app)/staff/page.tsx` (novo)
- `src/app/(app)/profile/page.tsx` (novo)
- `src/app/(app)/permissions/page.tsx` (novo)
- Páginas placeholder adicionais para completar os 10 itens do menu lateral (ex.: `reports`, `settings`, `notifications`, `help` — nomes em inglês na pasta, labels em PT no config)
- `e2e/auth/authenticated.setup.ts` (novo)
- `e2e/auth/login.spec.ts`
- `e2e/app/dashboard.layout.spec.ts` (novo)
- `e2e/auth/logout.spec.ts` (novo)
- `playwright.config.ts` (variáveis de ambiente do webServer para mock)
- `.env.local` / documentação em `docs/running-locally.md` (exemplo de `AUTH_MOCK_ENABLED`)

## Contrato de API utilizado

- `POST /auth/login` — referência em `docs/api-contracts.md` (continua sendo chamado pelo `loginServerService` quando mock está ativo; falhas são ignoradas pelo bypass)
- Nenhum endpoint novo na API NestJS nesta tarefa

## Dependências/configurações necessárias

- Variável de ambiente servidor: `AUTH_MOCK_ENABLED=true` (`.env.local` e `webServer.env` no Playwright para E2E)
- Nenhuma dependência npm nova prevista
- Componentes shadcn/ui já presentes: `dropdown-menu`, `sheet`, `button`, `separator` — sem instalação adicional obrigatória

## Estratégia de testes

- Unitário/componente:
  - `src/lib/auth/session.spec.ts` — presença/ausência de cookie `accessToken`
  - `src/lib/auth/mock.spec.ts` — usuário mock e tokens mock
  - `src/components/layout/Sidebar.spec.tsx` — renderiza 10 itens com links
  - `src/components/layout/Header.spec.tsx` — logo, botão toggle (`aria-label`), dropdown com Conta/Permissões/Sair
  - `src/components/layout/AppLayout.spec.tsx` — composição sidebar + header + children
  - `src/features/auth/hooks/useLogout.spec.ts` ou spec do client service de logout
  - Atualizar `src/features/auth/components/LoginForm.spec.tsx` — redireciona após sucesso (mock `useRouter`)
- E2E:
  - `e2e/auth/authenticated.setup.ts` — login com credenciais quaisquer e `storageState` em `.playwright/auth.json`
  - `e2e/app/dashboard.layout.spec.ts` — layout autenticado visível (sidebar, header, dashboard)
  - `e2e/auth/logout.spec.ts` — “Sair” limpa sessão e volta para `/login`
  - Atualizar `e2e/auth/login.spec.ts` — bypass com mock: submit redireciona para `/dashboard` mesmo com API mockada retornando erro
- Cenários principais:
  - Login com `AUTH_MOCK_ENABLED=true` e API retornando `INVALID_CREDENTIALS` ainda define cookies e redireciona para `/dashboard`
  - Acesso a `/dashboard` sem cookie redireciona para `/login`
  - Acesso a `/login` com cookie válido redireciona para `/dashboard`
  - Sidebar exibe 10 itens; item ativo destacado conforme rota
  - Header: toggle abre/fecha sidebar em mobile (Sheet); em desktop colapsa largura da sidebar
  - Dropdown usuário: links Conta e Permissões navegam; Sair chama logout e redireciona
  - Middleware não expõe token ao client

## Passos de implementação

### 1. Tipos globais e constantes de mock

- Arquivo: `src/lib/api/types.ts`, `src/lib/auth/mock.ts`
- O que fazer: definir `User` e `AppRole` alinhados a `docs/api-contracts.md`; exportar `MOCK_USER`, `MOCK_ACCESS_TOKEN`, `MOCK_REFRESH_TOKEN` e helper `isAuthMockEnabled()` lendo `process.env.AUTH_MOCK_ENABLED === 'true'`
- Spec primeiro: `src/lib/auth/mock.spec.ts`
- Depende de: Nenhum

### 2. Sessão server-side e cookies

- Arquivo: `src/lib/auth/session.ts`
- O que fazer: funções `getServerSession()` (lê `cookies()` do Next, verifica `accessToken`, retorna `{ user }` com `MOCK_USER` quando mock ou sessão válida) e `isAuthenticated()`; não expor token ao client
- Spec primeiro: `src/lib/auth/session.spec.ts`
- Depende de: Passo 1

### 3. Bypass no login e Route Handler de logout

- Arquivo: `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`, `src/features/auth/services/authClientService.ts`
- O que fazer: no `POST /api/auth/login`, se `isAuthMockEnabled()`, após `loginServerService` — em falha (qualquer `!response.ok` ou exceção de rede) gravar cookies mock e responder `{ ok: true, data: { user: MOCK_USER } }`; em sucesso real, manter comportamento atual; se mock ativo e sucesso real, preferir cookies reais da API. No `POST /api/auth/logout`, limpar `accessToken` e `refreshToken` (`maxAge: 0`) e retornar `{ ok: true }`. Adicionar `logoutClientService()` no client service
- Spec primeiro: Não aplicável (lógica coberta por E2E e testes de hook/service se extraída)
- Depende de: Passo 1

### 4. Middleware de proteção de rotas

- Arquivo: `src/middleware.ts`
- O que fazer: matcher para rotas `(app)` (`/dashboard`, `/patients`, `/appointments`, `/staff`, `/profile`, `/permissions` e demais placeholders do menu); sem `accessToken` → redirect `/login`; com cookie em rotas `(auth)` (`/login`, `/register`) → redirect `/dashboard`; usar `config` centralizado em `src/config/routes.ts` para listas de rotas públicas/protegidas
- Spec primeiro: Não aplicável (validar via E2E)
- Depende de: Passo 2

### 5. Configuração de navegação (10 itens mock)

- Arquivo: `src/config/navigation.ts`, `src/config/routes.ts`
- O que fazer: array tipado de 10 itens `{ label, href, icon }` (lucide-react) cobrindo roadmap + placeholders: Dashboard, Pacientes, Agendamentos, Equipe, Relatórios, Permissões, Perfil, Configurações, Notificações, Ajuda; mapear `href` para páginas em `src/app/(app)/`
- Spec primeiro: Não aplicável
- Depende de: Nenhum

### 6. Componentes de layout (sidebar + header + shell)

- Arquivo: `src/components/layout/Sidebar.tsx`, `Header.tsx`, `AppLayout.tsx`, `PageContainer.tsx`
- O que fazer: `AppLayout` Client Component com estado `sidebarOpen`/`sidebarCollapsed`; `Sidebar` lista os 10 itens com `Link` e estado ativo via `usePathname()`; desktop sidebar fixa, mobile via `Sheet` (reutilizar padrão de `LandingHeader`); `Header` com logo `/loading-logo.svg`, botão toggle (`PanelLeft` ou `Menu`, `aria-label="Alternar menu"`), `DropdownMenu` com trigger ícone `User` e itens Conta (`/profile`), Permissões (`/permissions`), Sair (chama `useLogout`); `PageContainer` com padding responsivo para conteúdo das páginas
- Spec primeiro: `src/components/layout/Sidebar.spec.tsx`, `Header.spec.tsx`, `AppLayout.spec.tsx`
- Depende de: Passo 5

### 7. Layout e páginas placeholder `(app)`

- Arquivo: `src/app/(app)/layout.tsx`, `src/app/(app)/**/page.tsx`
- O que fazer: layout Server Component que valida sessão com `getServerSession()` (redirect se ausente — defesa em profundidade além do middleware) e renderiza `AppLayout` com `children`; cada página placeholder Server Component simples com título (ex.: “Dashboard”) dentro de `PageContainer`; garantir rota para cada item do menu
- Spec primeiro: Não aplicável
- Depende de: Passo 6

### 8. Fluxo de login e logout no client

- Arquivo: `src/features/auth/hooks/useLogin.ts`, `useLogout.ts`, `LoginForm.tsx`
- O que fazer: após `login` retornar sucesso, `router.push('/dashboard')` e `router.refresh()`; remover `console.log` de debug; `useLogout` chama `logoutClientService`, depois `router.push('/login')` e `router.refresh()`; wire “Sair” no Header; manter exibição de erro apenas quando mock **desligado** e API falhar
- Spec primeiro: atualizar `src/features/auth/components/LoginForm.spec.tsx`; `src/features/auth/hooks/useLogout.spec.ts` se criado
- Depende de: Passos 3 e 6

### 9. Testes E2E e setup autenticado

- Arquivo: `e2e/auth/authenticated.setup.ts`, `e2e/app/dashboard.layout.spec.ts`, `e2e/auth/logout.spec.ts`, `e2e/auth/login.spec.ts`, `playwright.config.ts`
- O que fazer: setup faz login na UI e salva `.playwright/auth.json`; testes de layout autenticado verificam sidebar (10 links), header e toggle; logout E2E; corrigir asserções desatualizadas em `login.spec.ts` (heading atual é “Bem-vindo”, não “Login”; mock de route não deve esperar tokens no JSON — cookies via Set-Cookie); configurar `webServer.env: { AUTH_MOCK_ENABLED: 'true' }` no Playwright
- Spec primeiro: arquivos E2E acima
- Depende de: Passos 4, 7 e 8

### 10. Documentação local do mock

- Arquivo: `docs/running-locally.md`
- O que fazer: documentar `AUTH_MOCK_ENABLED=true`, fluxo de bypass e variáveis `QA_EMAIL`/`QA_PASSWORD` (opcionais com mock)
- Spec primeiro: Não aplicável
- Depende de: Passo 3

## Riscos / atenções

- **Grupo de rotas**: usar `(app)` conforme `docs/architecture.md`, não `(protected)`, para evitar divergência documental
- **Bypass apenas em dev/QA**: `AUTH_MOCK_ENABLED` nunca deve ir para produção; documentar e considerar falhar build se mock ativo em `NODE_ENV=production` (opcional, fora do escopo mínimo)
- **E2E existente** (`e2e/auth/login.spec.ts`) pode estar desalinhado com UI atual (“Bem-vindo”) e com contrato do Route Handler (tokens só em cookie) — corrigir no passo 9
- **Dupla proteção**: middleware + `getServerSession` no layout evitam flash de conteúdo; manter ambos
- **LoginForm** hoje não redireciona após sucesso — obrigatório no passo 8
- **Cookies**: manter nomes `accessToken`/`refreshToken`; mock usa valores fixos reconhecidos por `getServerSession`
- **Acessibilidade**: botões só com ícone precisam `aria-label`; itens do dropdown acessíveis por `role="menuitem"`
- **Mobile**: sidebar em `Sheet` no breakpoint `md`; testar toggle no E2E se viável com viewport mobile
- **Escopo**: não implementar RBAC real nem chamadas autenticadas à API NestJS nesta tarefa
- **`src/lib/api/types.ts`**: criar agora evita duplicação de tipo `User` em `authServerService`

## Checklist final

- [x] Specs unitárias/componentes escritas e passando quando aplicável
- [x] Specs E2E escritas e passando quando aplicável
- [x] Componente sem lógica de negócio: delega a hooks/services
- [x] Tipos derivados dos contratos em `src/lib/api/types.ts`
- [x] Estados de loading, erro e vazio tratados na UI
- [x] Client Components não acessam token
- [x] Route Handler usado para chamadas autenticadas do client
- [x] shadcn/ui ou componente existente priorizado quando houver UI
- [x] GlobalModal, Loading ou DataTable reutilizados quando aplicável
- [x] Acessibilidade considerada em formulários, botões, mensagens e navegação
- [x] Imports seguem regra híbrida: relativo perto, alias longe
- [x] Sem `any` nos tipos, exceto justificativa explícita
- [x] Sem duplicação de DTO, schema, hook, service ou componente
- [x] `npm run test` sem erros (60/60)
- [x] `npm run test:e2e` sem erros (12/12; requer `PLAYWRIGHT_BASE_URL` apontando para o Next.js, não para `API_URL`)
- [x] `npm run lint` sem erros (0 errors)
- [x] `npm run build` sem erros
