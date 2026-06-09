# Plano: Refatorar CompanyRegisterForm para TanStack Query

## Contexto

O formulário de cadastro de empresa (`CompanyRegisterForm`) depende de dois hooks com controle manual de estado (`useIbgeLocations` com `useState` + `useEffect`, `useCompanyRegister` com `useState` para pending/success/error) e de quatro `useEffect` no componente apenas para sincronizar erros e sucesso com modais. O projeto já possui `@tanstack/react-query` instalado, mas ainda não expõe `QueryClientProvider`. A refatoração migra data fetching e mutação para TanStack Query, reduz efeitos colaterais no componente e estabelece query keys padronizadas para dados IBGE e cadastro.

## Validação arquitetural

- Feature: existente (`auth`)
- Reutiliza componente existente: sim (`GlobalModal`, `Loading`, `SearchableSelect`, `PlanSelectionStep`, campos de registro)
- Reutiliza GlobalModal / Loading / DataTable: sim (`GlobalModal`, `Loading`; `DataTable` não aplicável)
- Reutiliza hook existente: sim (refatorar internamente `useIbgeLocations` e `useCompanyRegister`; manter camada de hook de domínio)
- Reutiliza service existente: sim (`ibgeClientService`, `registerClientService` — sem alterar contratos)
- Reutiliza schema existente: sim (`companyRegisterSchema`)
- Reutiliza tipos existentes: sim (`CompanyRegisterFormValues`, `IbgeState`, `IbgeMunicipality`, `RegisterClinicResponse`)
- Usa shadcn/ui ou componente existente: sim (sem mudança visual)
- Exige novo componente shadcn/ui: não
- Há impacto em autenticação: não (fluxo de registro permanece via Route Handler; token continua HTTP-only)
- Há impacto em permissões/RBAC: não
- Há impacto em contrato de API: não
- Há impacto em Route Handler: não
- Exige teste unitário/componente: sim

## Decisão arquitetural principal

**Refatorar os hooks internamente** (`useIbgeLocations` → `useQuery`, `useCompanyRegister` → `useMutation`), **não** chamar `useQuery`/`useMutation` diretamente no `CompanyRegisterForm`.

Motivos:

- Alinha com `.cursor/skills/react/data-fetching.md` (Client Service → hook com TanStack Query → componente).
- Mantém o componente fino, focado em UI e React Hook Form.
- Preserva a API pública dos hooks (com ajustes mínimos), facilitando testes do formulário via mock de hook — padrão já usado em `LoginForm.spec.tsx`.
- Centraliza mapeamento de erros e query keys na feature `auth`, evitando strings espalhadas.

## Páginas/componentes afetados

- `src/lib/react-query/query-client.ts` (criar)
- `src/components/providers/QueryProvider.tsx` (criar)
- `src/app/layout.tsx`
- `src/features/auth/constants/queryKeys.ts` (criar)
- `src/features/auth/hooks/useIbgeLocations.ts`
- `src/features/auth/hooks/useCompanyRegister.ts`
- `src/features/auth/components/CompanyRegisterForm/CompanyRegisterForm.tsx`
- `src/features/auth/components/CompanyRegisterForm/CompanyRegisterForm.spec.tsx`
- `src/test-utils/renderWithQueryClient.tsx` (criar — helper opcional para specs futuras)

## Contrato de API utilizado

- IBGE (client-side, API pública): `GET {NEXT_PUBLIC_IBGE_API_URL}/estados` e `GET {NEXT_PUBLIC_IBGE_API_URL}/estados/{uf}/municipios` via `ibgeClientService`
- `POST /auth/register-admin` (via `POST /api/auth/register`) via `registerClientService`

## Dependências/configurações necessárias

- `@tanstack/react-query` — já instalado; **não** adicionar dependências novas
- Criar `QueryClientProvider` em `src/components/providers/QueryProvider.tsx` (Client Component) com instância de `QueryClient` exportada/reutilizável para testes
- Envolver `{children}` no `RootLayout` (`src/app/layout.tsx`) com `QueryProvider`, ao lado do `TooltipProvider` existente
- Query keys centralizadas em `src/features/auth/constants/queryKeys.ts`:

```ts
export const ibgeQueryKeys = {
  all: ['ibge'] as const,
  states: () => [...ibgeQueryKeys.all, 'states'] as const,
  cities: (uf: string) => [...ibgeQueryKeys.all, 'cities', uf] as const,
};

export const authMutationKeys = {
  register: ['auth', 'register'] as const,
};
```

- Configuração sugerida do `QueryClient` global: `staleTime` elevado para queries IBGE (ex.: `1000 * 60 * 60 * 24`), `retry: 1` para falhas transitórias, `refetchOnWindowFocus: false` no cadastro

## Estratégia de testes

- Unitário/componente: `CompanyRegisterForm.spec.tsx` (principal); specs de hook opcionais em `useIbgeLocations.spec.tsx` e `useCompanyRegister.spec.tsx` se o developer quiser cobrir mapeamento de erro/query keys isoladamente
- Cenários principais:
  - Formulário continua exibindo seleção de planos e campos após escolher plano
  - Loading de estados (`isLoadingStates` / overlay "Carregando estados")
  - Modal de erro de cadastro (mensagem amigável da mutation)
  - Modal de sucesso e redirecionamento para `/login`
  - Botão submit desabilitado quando formulário inválido ou `isPending`
  - Voltar para seleção de planos via "Alterar"
- Abordagem de mock (manter padrão do projeto):
  - **Preferencial para `CompanyRegisterForm.spec.tsx`:** continuar mockando `useIbgeLocations` e `useCompanyRegister` (comportamento visível, sem acoplar ao TanStack Query no teste de componente)
  - Ajustar mocks se a API pública dos hooks mudar levemente (`reset`/`mutate` em vez de `register`, etc.)
  - Se criar specs de hook: envolver com `QueryClientProvider` + `QueryClient` isolado por teste, mockar apenas `ibgeClientService` / `registerClientService` (conforme `.cursor/skills/react/testing.md`)

## Passos de implementação

### 1. Infraestrutura TanStack Query (QueryClient + Provider)

- Arquivo: `src/lib/react-query/query-client.ts`, `src/components/providers/QueryProvider.tsx`, `src/app/layout.tsx`
- O que fazer:
  - Criar factory `createQueryClient()` com defaults do projeto (staleTime, retry)
  - Criar `QueryProvider` (`"use client"`) que instancia `QueryClient` via `useState(() => createQueryClient())` e envolve children com `QueryClientProvider`
  - Importar e renderizar `<QueryProvider>` no `RootLayout`, envolvendo `{children}` (dentro ou junto ao `TooltipProvider`)
  - Exportar `createQueryClient` para reutilização em testes
- Spec primeiro: Não aplicável
- Depende de: Nenhum

### 2. Query keys da feature auth

- Arquivo: `src/features/auth/constants/queryKeys.ts`
- O que fazer:
  - Definir `ibgeQueryKeys` e `authMutationKeys` conforme seção de dependências
  - Importar nos hooks refatorados; não usar strings literais espalhadas
- Spec primeiro: Não aplicável (coberto indiretamente pelos testes de hook/componente)
- Depende de: Nenhum

### 3. Refatorar `useIbgeLocations` para `useQuery`

- Arquivo: `src/features/auth/hooks/useIbgeLocations.ts`
- O que fazer:
  - Substituir `useState`/`useEffect`/`useRef` por duas queries:
    - **Estados:** `useQuery({ queryKey: ibgeQueryKeys.states(), queryFn: fetchStates, staleTime: ... })`
    - **Cidades:** `useQuery({ queryKey: ibgeQueryKeys.cities(normalizedUf), queryFn: () => fetchCitiesByUf(normalizedUf), enabled: Boolean(normalizedUf), staleTime: ... })`
  - Manter assinatura `useIbgeLocations(stateUf?: string)` e retorno compatível:
    - `states` ← `data ?? []`
    - `cities` ← `data ?? []`
    - `isLoadingStates` ← `isLoading || isFetching` (primeira carga)
    - `isLoadingCities` ← idem, respeitando `enabled`
    - `statesError` ← mensagem amigável derivada de `isError` (`"Não foi possível carregar os estados."`)
    - `citiesError` ← mensagem amigável derivada de `isError` (`"Não foi possível carregar os municípios."`)
  - `clearStatesError` / `clearCitiesError`: usar `queryClient.resetQueries({ queryKey: ibgeQueryKeys.states() })` e `resetQueries({ queryKey: ibgeQueryKeys.cities(uf) })` (ou `removeQueries` se preferir limpar cache)
  - Remover lógica manual de race condition (`requestIdRef`); TanStack Query cancela requests obsoletos via `signal` — passar `signal` do `queryFn` para `fetch` nos services **somente se** ajustar `ibgeClientService`; caso contrário, confiar no `enabled` + query key por UF (aceitável para escopo atual)
- Spec primeiro: `src/features/auth/hooks/useIbgeLocations.spec.tsx` (opcional)
- Depende de: passos 1 e 2

### 4. Refatorar `useCompanyRegister` para `useMutation`

- Arquivo: `src/features/auth/hooks/useCompanyRegister.ts`
- O que fazer:
  - Substituir `useState` por `useMutation`:
    - `mutationKey: authMutationKeys.register`
    - `mutationFn`: chamar `registerClientService(payload)`; se `!response.ok`, **lançar** `Error` com mensagem mapeada de `REGISTER_ERROR_MESSAGES`; retornar `response.data` em sucesso
    - Erros de rede (`catch` do service): lançar `Error(REGISTER_ERROR_MESSAGES.INTERNAL_ERROR)`
  - Expor API compatível com o formulário:
    - `register(payload)` → `mutateAsync(payload)` ou wrapper `mutate` (preferir manter nome `register` para minimizar diff no componente)
    - `isPending` ← `isPending`
    - `isSuccess` ← `isSuccess`
    - `errorMessage` ← derivar de `error?.message ?? null` (não usar `useState`)
    - `clearError` ← `reset()`
    - `resetSuccess` ← `reset()` (manter se usado; unificar em `reset` se redundante)
  - **Não** invalidar queries globais após registro (cadastro público sem listagem relacionada no client)
  - Aceitar opções opcionais `UseCompanyRegisterOptions` com `onSuccess` / `onError` se facilitar eliminar `useEffect` no componente (alternativa: callbacks passados no `mutate` no submit)
- Spec primeiro: `src/features/auth/hooks/useCompanyRegister.spec.tsx` (opcional)
- Depende de: passos 1 e 2

### 5. Simplificar `CompanyRegisterForm` — eliminar `useEffect` de modais

- Arquivo: `src/features/auth/components/CompanyRegisterForm/CompanyRegisterForm.tsx`
- O que fazer:
  - Remover os 4 `useEffect` que sincronizam `statesError`, `citiesError`, `errorMessage` e `isSuccess` com estado local de modal
  - **Modal de erro — abordagem declarativa (sem `useEffect`):**
    - Derivar `activeError = errorMessage ?? statesError ?? citiesError`
    - Controlar dismiss com estado mínimo: `dismissedError` (string | null); modal aberto quando `Boolean(activeError) && activeError !== dismissedError`
    - Em `onConfirm`/`onCancel` do `GlobalModal` de erro: `setDismissedError(activeError)`, chamar `clearError()`, `clearStatesError()`, `clearCitiesError()`
    - Quando `activeError` mudar (nova mensagem), o modal reabre automaticamente porque `activeError !== dismissedError`
  - **Modal de sucesso — abordagem declarativa:**
    - `open={isSuccess}` diretamente no `GlobalModal` de sucesso
    - Em `onConfirm`: `resetSuccess()` (ou `reset()`) + `router.push("/login")`
    - Em `onCancel`: `resetSuccess()`
  - **Submit:** restaurar chamada real `await submitRegister(values)` (hoje comentada com `console.log`) usando o hook refatorado
  - Remover import de `useEffect` se não restar uso
  - Manter `Loading`, `GlobalModal`, selects IBGE e demais UI inalterados
  - `handleStateChange`: manter reset de cidade e `clearCitiesError()` ao trocar UF
- Spec primeiro: atualizar `src/features/auth/components/CompanyRegisterForm/CompanyRegisterForm.spec.tsx`
- Depende de: passos 3 e 4

### 6. Atualizar specs do formulário

- Arquivo: `src/features/auth/components/CompanyRegisterForm/CompanyRegisterForm.spec.tsx`
- O que fazer:
  - Manter mocks de `useCompanyRegister` e `useIbgeLocations` (padrão `LoginForm.spec.tsx`)
  - Ajustar `setupCompanyRegisterMock` se nomes de retorno mudarem (`reset` vs `resetSuccess`, etc.)
  - Garantir cenários existentes passando: plano, campos, loading estados, modal erro API, modal sucesso + redirect, alterar plano
  - Adicionar cenário opcional: modal de erro IBGE (`statesError` / `citiesError`) via mock do hook
  - **Não** exigir `QueryClientProvider` neste spec enquanto hooks permanecerem mockados
- Spec primeiro: este arquivo é o artefato de spec deste passo
- Depende de: passo 5

### 7. Helper de teste para TanStack Query (opcional, recomendado)

- Arquivo: `src/test-utils/renderWithQueryClient.tsx`
- O que fazer:
  - Exportar `renderWithQueryClient(ui)` que envolve UI com `QueryClientProvider` usando `createQueryClient()` com `retry: false` nos testes
  - Documentar uso para futuros specs de hooks sem duplicar setup
- Spec primeiro: Não aplicável
- Depende de: passo 1

## Riscos / atenções

- **QueryClientProvider ausente quebra runtime:** implementar Provider (passo 1) **antes** de refatorar hooks; sem provider, `useQuery`/`useMutation` lançam erro
- **Regressão no submit:** `onSubmit` está com `console.log` e registro comentado; restaurar `await submitRegister(values)` na mesma entrega
- **Mudança de contrato do hook de registro:** se `registerClientService` retorna envelope `{ ok: false }` sem throw, a `mutationFn` **deve** lançar erro para TanStack Query marcar `isError`; não retornar envelope de erro como sucesso
- **Dismiss de modal vs reset de query:** ao fechar modal de erro IBGE, `resetQueries` pode refetch automático; preferir `reset` que limpa erro sem refetch imediato, ou refetch silencioso — validar UX manualmente
- **Cache IBGE entre montagens:** `staleTime` alto evita refetch desnecessário ao alternar passos plano/formulário
- **Cidades sem UF:** manter `enabled: false` quando UF vazia; retornar `cities: []`, `isLoadingCities: false`
- **`useLogin` permanece com useState:** decisão consciente; este plano não migra login — evitar escopo creep
- **Testes mockando hooks:** interface pública estável é crítica; se expor `mutate` bruto do TanStack Query no componente, specs precisarão de refactor maior
- **Acessibilidade:** modais continuam via `GlobalModal`; mensagens de erro mantêm `role="alert"` nos campos do formulário

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
- [x] Query keys centralizadas em `src/features/auth/constants/queryKeys.ts`
- [x] `QueryClientProvider` configurado no layout raiz
- [x] `useEffect` de sincronização de modais removidos do `CompanyRegisterForm`
- [x] `npm run test` sem erros quando aplicável
- [x] `npm run lint` sem erros
- [x] `npm run build` sem erros
