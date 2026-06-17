# Plano: Listagem de usuários da clínica (GET /staff)

## Contexto

A sidebar já aponta **Usuários → Listar** para `/usuarios/listar`, mas a rota ainda não existe. Existe apenas um stub em `/staff` com mensagem "em breve". A tarefa implementa a tela de listagem dos membros da equipe cadastrados na clínica, consumindo `GET /staff` com autenticação e role `clinic_admin`, exibindo os dados em tabela com feedback de loading e erro conforme padrões do projeto.

## Validação arquitetural

- Feature: nova (`src/features/staff/`)
- Reutiliza componente existente: sim (`DataTable`, `PageContainer`, `GlobalModal`, `Loading`)
- Reutiliza GlobalModal / Loading / DataTable: sim
- Reutiliza hook existente: não (novo `useStaffList`)
- Reutiliza service existente: não (novos client/server services)
- Reutiliza schema existente: não aplicável (GET sem body)
- Reutiliza tipos existentes: sim (`AppRole` de `src/lib/auth/types.ts`; `StaffMember` conforme `docs/api-contracts.md`)
- Usa shadcn/ui ou componente existente: sim (`DataTable` + `ui/table`)
- Exige novo componente shadcn/ui: não
- Há impacto em autenticação: sim (Route Handler lê cookie HTTP-only; sem token → 401)
- Há impacto em permissões/RBAC: sim (API exige `clinic_admin`; tratar `STAFF_FORBIDDEN` na UI)
- Há impacto em contrato de API: não (consumo de contrato existente)
- Há impacto em Route Handler: sim (novo `GET /api/staff`)
- Exige teste unitário/componente: sim (SDD + cobertura de estados loading/erro/vazio/tabela)

## Decisões de design

### 1. Rota final: `/usuarios/listar`

- **Página principal:** `src/app/(app)/usuarios/listar/page.tsx` (alinha com sidebar em `src/components/layout/sidebar/config.ts`).
- **Compatibilidade:** substituir stub `src/app/(app)/staff/page.tsx` por `redirect("/usuarios/listar")` para não quebrar links antigos.
- **Proteção de rota:** adicionar prefixo `/usuarios` em `PROTECTED_ROUTE_PREFIXES` (`src/config/navigation.ts`).
- **Nav legado:** atualizar item "Usuários" em `src/config/navigation.ts` de `/staff` para `/usuarios/listar`.

### 2. Feature folder: `src/features/staff/`

- Domínio da API e da arquitetura (`docs/architecture.md` — bounded context **Staff**).
- Rotas de UI permanecem em português (`/usuarios/...`); código de domínio segue nomenclatura da API (`staff`).
- Mesmo padrão de `convenios`: feature em inglês/API, rotas de UI em PT.

### 3. Query param `role` (OpenAPI obrigatório)

- OpenAPI marca `role` como obrigatório (`doctor | receptionist | clinic_admin`).
- **MVP sem filtro na UI:** o server service fará **3 chamadas paralelas** (`Promise.all`) — uma por role — e consolidará o resultado:
  - deduplicar por `id`;
  - ordenar alfabeticamente por `name`.
- Função interna reutilizável: `listStaffByRoleServerService(accessToken, role)` + `listAllStaffServerService(accessToken)` que orquestra as três.
- **Fallback documentado:** se a API passar a aceitar `GET /staff` sem `role`, simplificar para chamada única no server service (sem alterar contrato do client).
- Filtro por role na UI fica **fora do escopo** desta entrega; pode ser adicionado depois reutilizando `listStaffByRoleServerService`.

### 4. Colunas da tabela

| Coluna (header PT-BR) | Campo API | Observação |
| --------------------- | --------- | ---------- |
| Nome | `name` | — |
| E-mail | `email` | — |
| Telefone | `phone` | exibir "—" quando `null` (`showDashWhenEmpty` no `DataTable`) |
| Perfil | `role` | label PT-BR via mapa: `clinic_admin` → Administrador, `doctor` → Médico, `receptionist` → Recepcionista |

Colunas **não** exibidas nesta entrega: `id`, `clinic_id`, `created_at`, `updated_at`.

### 5. Feedback de endpoint (GET)

- **Loading:** `Loading` enquanto `isPending` / `isLoading`.
- **Erro:** `GlobalModal type="error"` sempre que `ok: false` ou exceção (`CLINIC_NOT_FOUND`, `STAFF_FORBIDDEN`, etc.) via `getErrorMessage`.
- **Sucesso:** sem modal (regra `api-feedback-modals.mdc` — GET atualiza UI silenciosamente).
- **Vazio:** mensagem inline na tabela (`noResults`), ex.: "Nenhum usuário cadastrado."

## Páginas/componentes afetados

- `src/app/(app)/usuarios/listar/page.tsx` (novo)
- `src/app/(app)/staff/page.tsx` (redirect)
- `src/app/api/staff/route.ts` (novo)
- `src/config/navigation.ts`
- `src/features/staff/types.ts` (novo)
- `src/features/staff/constants/queryKeys.ts` (novo)
- `src/features/staff/constants/roleLabels.ts` (novo)
- `src/features/staff/services/staffServerService.ts` (novo)
- `src/features/staff/services/staffClientService.ts` (novo)
- `src/features/staff/hooks/useStaffList.ts` (novo)
- `src/features/staff/components/StaffListTable.tsx` (novo)
- `src/features/staff/components/StaffListOverlays.tsx` (novo)
- `src/features/staff/components/StaffListPageContent.tsx` (novo)

## Contrato de API utilizado

- `GET /staff?role=doctor` — lista médicos
- `GET /staff?role=receptionist` — lista recepcionistas
- `GET /staff?role=clinic_admin` — lista administradores
- Auth: `Authorization: Bearer <accessToken>`
- Role exigida na API: `clinic_admin`
- Response sucesso: `{ ok: true, data: StaffMember[] }`
- Erros relevantes: `CLINIC_NOT_FOUND`, `STAFF_FORBIDDEN`, `STAFF_LIST_FAILED`, `AUTH_MISSING`, `AUTH_INVALID`

## Dependências/configurações necessárias

- Nenhuma nova dependência npm.
- Reutilizar `AppRole` de `src/lib/auth/types.ts`.
- Reutilizar `getErrorMessage` de `src/lib/api/error-messages.ts`.
- Reutilizar `renderWithQueryClient` (`src/test-utils/renderWithQueryClient.tsx`) nos testes do hook/componente.
- Variável de ambiente já existente: `API_URL` (server service, padrão `createConvenioServerService`).

## Estratégia de testes

- Unitário/componente:
  - `src/features/staff/constants/roleLabels.spec.ts`
  - `src/features/staff/services/staffServerService.spec.ts`
  - `src/features/staff/hooks/useStaffList.spec.ts`
  - `src/features/staff/components/StaffListPageContent.spec.tsx`
- Cenários principais:
  - Mapa de roles retorna labels PT-BR corretos para todos os valores de `AppRole`.
  - Server service consolida 3 respostas, deduplica por `id` e ordena por `name`.
  - Server service propaga erro quando qualquer chamada retorna `ok: false`.
  - Hook expõe `isLoading`, `errorMessage`, `staff`, `clearError`; dispara fetch ao montar.
  - Componente renderiza `Loading` durante carregamento.
  - Componente exibe `GlobalModal` de erro e permite dismiss via `clearError`.
  - Componente exibe tabela com colunas Nome, E-mail, Telefone, Perfil quando há dados.
  - Componente exibe estado vazio quando `data` é array vazio.
  - Componente **não** exibe modal de sucesso após carregar dados.

## Passos de implementação

### 1. Tipos e constantes da feature

- Arquivo: `src/features/staff/types.ts`
- O que fazer: definir `StaffMember` (snake_case, espelhando `docs/api-contracts.md`), `ListStaffResponse` (`{ ok: true; data: StaffMember[] } | { ok: false; error: { code: string; message: string } }`).
- Spec primeiro: Não aplicável
- Depende de: Nenhum

- Arquivo: `src/features/staff/constants/roleLabels.ts`
- O que fazer: exportar `STAFF_ROLE_LABELS: Record<AppRole, string>` com labels PT-BR e helper `getStaffRoleLabel(role: AppRole): string`.
- Spec primeiro: `src/features/staff/constants/roleLabels.spec.ts`
- Depende de: Passo 1 (tipos)

- Arquivo: `src/features/staff/constants/queryKeys.ts`
- O que fazer: exportar `staffQueryKeys = { list: ["staff", "list"] as const }`.
- Spec primeiro: Não aplicável
- Depende de: Nenhum

### 2. Server service

- Arquivo: `src/features/staff/services/staffServerService.ts`
- O que fazer: implementar `listStaffByRoleServerService(accessToken, role)` (fetch `GET ${API_URL}/staff?role=${role}` com Bearer) e `listAllStaffServerService(accessToken)` (3 chamadas paralelas, merge deduplicado e ordenado). Tratar envelope `{ ok, data?, error? }`, erros de rede e `ENV_ERROR` quando `API_URL` ausente. Marcar com `"server-only"`.
- Spec primeiro: `src/features/staff/services/staffServerService.spec.ts`
- Depende de: Passo 1

### 3. Route Handler

- Arquivo: `src/app/api/staff/route.ts`
- O que fazer: implementar `GET` — ler cookie `accessToken`; se ausente, retornar 401 `{ ok: false, error: { code: "AUTH_MISSING", ... } }`; chamar `listAllStaffServerService`; repassar envelope com status HTTP adequado (401 para `AUTH_INVALID`, 400 para demais erros de negócio). Seguir padrão de `src/app/api/auth/change-password/route.ts` (`errorResponse` helper + `getErrorMessage`).
- Spec primeiro: Não aplicável (opcional futuro: `route.spec.ts` se houver precedente na feature)
- Depende de: Passo 2

### 4. Client service

- Arquivo: `src/features/staff/services/staffClientService.ts`
- O que fazer: implementar `listStaffClientService()` — `fetch("/api/staff")`, parse JSON como `ListStaffResponse`, retornar body tipado (sem throw; caller decide pelo `ok`).
- Spec primeiro: Não aplicável
- Depende de: Passo 3

### 5. Hook de listagem

- Arquivo: `src/features/staff/hooks/useStaffList.ts`
- O que fazer: Client hook com `useQuery` (`queryKey: staffQueryKeys.list`, `queryFn` via `listStaffClientService`). Expor `{ staff, isLoading, isError, errorMessage, refetch, clearError }`. `errorMessage` via `getErrorMessage`. `clearError` reseta query error state. Sem modal de sucesso.
- Spec primeiro: `src/features/staff/hooks/useStaffList.spec.ts`
- Depende de: Passo 4

### 6. Componentes de UI

- Arquivo: `src/features/staff/components/StaffListTable.tsx`
- O que fazer: definir colunas `ColumnDef<StaffMember>[]` (Nome, E-mail, Telefone, Perfil) e renderizar `DataTable` com `isLoading`, `noResults` e `showDashWhenEmpty` na coluna telefone. Perfil usa `getStaffRoleLabel`.
- Spec primeiro: Não aplicável (coberto pelo spec do page content)
- Depende de: Passo 1

- Arquivo: `src/features/staff/components/StaffListOverlays.tsx`
- O que fazer: renderizar `Loading` (`isOpen={isLoading}`) e `GlobalModal type="error"` quando `errorModalOpen`/`errorMessage`; sem modal de sucesso.
- Spec primeiro: Não aplicável
- Depende de: Nenhum

- Arquivo: `src/features/staff/components/StaffListPageContent.tsx`
- O que fazer: Client Component orquestrador — título "Usuários", subtítulo descritivo, consome `useStaffList`, renderiza `StaffListTable` + `StaffListOverlays`. Controla abertura do modal de erro a partir de `errorMessage`.
- Spec primeiro: `src/features/staff/components/StaffListPageContent.spec.tsx`
- Depende de: Passos 5 e 6 (tabela/overlays)

### 7. Página e rotas

- Arquivo: `src/app/(app)/usuarios/listar/page.tsx`
- O que fazer: página fina (Server Component) com `PageContainer` renderizando `<StaffListPageContent />`.
- Spec primeiro: Não aplicável
- Depende de: Passo 6

- Arquivo: `src/app/(app)/staff/page.tsx`
- O que fazer: substituir stub por `redirect("/usuarios/listar")` de `next/navigation`.
- Spec primeiro: Não aplicável
- Depende de: Passo 7 (página principal)

- Arquivo: `src/config/navigation.ts`
- O que fazer: adicionar `"/usuarios"` em `PROTECTED_ROUTE_PREFIXES`; atualizar nav item Usuários para `path: "/usuarios/listar"`.
- Spec primeiro: Não aplicável
- Depende de: Passo 7

- Arquivo: `src/lib/auth/route-guards.spec.ts`
- O que fazer: adicionar expectativa de rota protegida para `/usuarios/listar` (e opcionalmente `/usuarios`).
- Spec primeiro: Não aplicável (ajuste de teste existente)
- Depende de: Passo 7

## Riscos / atenções

- **Query param `role` obrigatório:** três chamadas paralelas aumentam latência e carga; monitorar se API passa a suportar listagem sem filtro.
- **Permissão `clinic_admin`:** usuários sem permissão receberão `STAFF_FORBIDDEN` da API — exibir mensagem amigável; guard de role no frontend não existe ainda (fora do escopo).
- **Duplicidade de rotas:** manter redirect `/staff` até remover referências legadas; sidebar já usa `/usuarios/listar`.
- **Telefone E.164:** valor pode vir como `+5511...`; avaliar se `formatPhone` existente cobre o formato ou exibir valor bruto com fallback "—".
- **Consistência de Route Handler:** usar `/api/staff` (padrão data-fetching skill) em vez do padrão legado top-level de convênios (`/clinic-convenio-register`).
- **TanStack Query:** garantir que componente de teste use `renderWithQueryClient` para evitar falhas por provider ausente.

## Checklist final

- [x] Specs unitárias/componentes escritas e passando quando aplicável
- [x] Componente sem lógica de negócio: delega a hooks/services
- [x] Tipos derivados dos contratos em `docs/api-contracts.md` (`StaffMember`, snake_case)
- [x] Estados de loading, erro e vazio tratados na UI
- [x] Client Components não acessam token
- [x] Route Handler usado para chamadas autenticadas do client (`GET /api/staff`)
- [x] shadcn/ui ou componente existente priorizado quando houver UI (`DataTable`)
- [x] GlobalModal, Loading ou DataTable reutilizados quando aplicável
- [x] Acessibilidade considerada em formulários, botões, mensagens e navegação
- [x] Imports seguem regra híbrida: relativo perto, alias longe
- [x] Sem `any` nos tipos, exceto justificativa explícita
- [x] Sem duplicação de DTO, schema, hook, service ou componente
- [x] `npm run test` sem erros quando aplicável
- [x] `npm run lint` sem erros
- [x] `npm run build` sem erros
