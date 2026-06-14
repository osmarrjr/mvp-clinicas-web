# Plano: Tela de cadastro de convênios

## Contexto

O menu lateral já expõe **Convênios → Cadastrar** (`/convenios/cadastrar`), mas a rota ainda não possui `page.tsx` nem feature associada. É necessário entregar o formulário de cadastro com validação Zod, feedback via `GlobalModal`/`Loading` e fluxo autenticado (Client Service → Route Handler → API). O Swagger v0.1.0 **não possui endpoint de convênios**; a implementação deve preparar a camada de integração com contrato provisório alinhado ao formulário, documentando-o em `docs/api-contracts.md` até a API NestJS disponibilizar o recurso.

## Validação arquitetural

- Feature: nova (`src/features/convenios/`)
- Reutiliza componente existente: sim (`PageContainer`, `GlobalModal`, `Loading`, `Button`, `Input`, `Label`, `Card`, `Select`)
- Reutiliza GlobalModal / Loading / DataTable: sim (`GlobalModal`, `Loading`; `DataTable` não aplicável)
- Reutiliza hook existente: não
- Reutiliza service existente: não
- Reutiliza schema existente: não
- Reutiliza tipos existentes: não (criar tipos da feature; envelope `ok/error` segue padrão global)
- Usa shadcn/ui ou componente existente: sim
- Exige novo componente shadcn/ui: não (`select`, `input`, `label`, `button`, `card` já existem; `form` do shadcn não existe no projeto — seguir padrão `LoginForm` com `Label` + `Input` + mensagens de erro)
- Há impacto em autenticação: sim (rota protegida; Route Handler lê cookie `accessToken`)
- Há impacto em permissões/RBAC: não (sem regra explícita no escopo; endpoint futuro provavelmente exigirá sessão de clínica)
- Há impacto em contrato de API: sim (contrato provisório a documentar; endpoint ainda ausente no Swagger)
- Há impacto em Route Handler: sim (`POST /api/convenios`)
- Exige teste unitário/componente: não (solicitação explícita do usuário para ignorar testes)

## Páginas/componentes afetados

- `src/config/navigation.ts`
- `src/app/(app)/convenios/cadastrar/page.tsx`
- `src/app/api/convenios/route.ts`
- `src/features/convenios/constants/categories.ts`
- `src/features/convenios/constants/queryKeys.ts`
- `src/features/convenios/schemas/createConvenioSchema.ts`
- `src/features/convenios/types.ts`
- `src/features/convenios/services/createConvenioPayload.ts`
- `src/features/convenios/services/createConvenioClientService.ts`
- `src/features/convenios/services/createConvenioServerService.ts`
- `src/features/convenios/hooks/useCreateConvenio.ts`
- `src/features/convenios/components/ConvenioRegisterForm.tsx`
- `src/features/convenios/components/ConvenioRegisterFormOverlays.tsx`
- `docs/api-contracts.md` (seção provisória de convênios)

## Contrato de API utilizado

**Provisório** (endpoint ainda não publicado no Swagger v0.1.0; alinhar com backend quando disponível):

- `POST /convenios` — cadastrar convênio da clínica autenticada
- Request body (camelCase):

```typescript
{
  name: string;              // 5–60 chars, sem @ # !
  acronym: string;           // 5–30 chars, sem @ # !
  category: "particular" | "convenio";
  ansRegistration?: string;  // 6 dígitos numéricos, opcional
  cardNumberMask?: string;   // até 30 chars, apenas 0 - . /
}
```

- Response 201 (envelope padrão):

```typescript
{
  ok: true,
  data: {
    id: string;
    clinic_id: string;
    name: string;
    acronym: string;
    category: "particular" | "convenio";
    ans_registration: string | null;
    card_number_mask: string | null;
    created_at: string;
    updated_at: string;
  }
}
```

- Route Handler interno: `POST /api/convenios` (valida sessão + schema Zod, repassa ao Server Service)

## Dependências/configurações necessárias

- Nenhuma nova dependência npm
- Variável de ambiente existente: `API_URL` (usada pelos Server Services autenticados)
- Componentes shadcn/ui já presentes: `button`, `input`, `label`, `card`, `select`

## Estratégia de testes

- Unitário/componente: Não aplicável por solicitação do usuário
- Cenários principais: Não aplicável por solicitação do usuário

## Passos de implementação

### 1. Proteger rotas `/convenios/*`

- Arquivo: `src/config/navigation.ts`
- O que fazer: incluir `"/convenios"` em `PROTECTED_ROUTE_PREFIXES` para que usuários não autenticados sejam redirecionados ao login com `callbackUrl`.
- Spec primeiro: Não aplicável
- Depende de: Nenhum

### 2. Documentar contrato provisório de convênios

- Arquivo: `docs/api-contracts.md`
- O que fazer: adicionar seção **Convênios** com `POST /convenios`, payload/request, response `data` em snake_case, códigos de erro esperados (`VALIDATION_ERROR`, `CLINIC_NOT_FOUND`, `CONVENIO_CREATE_FAILED`, `AUTH_MISSING`, `AUTH_INVALID`) e nota de que o endpoint ainda não consta no Swagger v0.1.0.
- Spec primeiro: Não aplicável
- Depende de: Nenhum

### 3. Criar schema Zod e tipos da feature

- Arquivo: `src/features/convenios/schemas/createConvenioSchema.ts`
- O que fazer: definir `createConvenioSchema` e `CreateConvenioFormValues` com regras:
  - `name`: obrigatório, trim, min 5, max 60, regex rejeitando `@`, `#`, `!`
  - `acronym`: obrigatório, trim, min 5, max 30, regex rejeitando `@`, `#`, `!`
  - `category`: `z.enum(["particular", "convenio"])` com mensagem amigável; labels de UI mapeadas em constante
  - `ansRegistration`: string opcional; se preenchida após trim, exatamente 6 dígitos (`/^\d{6}$/`)
  - `cardNumberMask`: string opcional; se preenchida, max 30 e regex `/^[0\-./]*$/`
  - Campos opcionais vazios normalizados para `undefined` no payload (helper em `createConvenioPayload.ts`)
- Arquivo: `src/features/convenios/constants/categories.ts` — opções `{ value: "particular", label: "Particular" }` e `{ value: "convenio", label: "Convênio" }`
- Arquivo: `src/features/convenios/types.ts` — tipos de request/response e envelope `{ ok, data?, error? }`
- Spec primeiro: Não aplicável
- Depende de: Passo 2

### 4. Implementar services e payload builder

- Arquivo: `src/features/convenios/services/createConvenioPayload.ts`
- O que fazer: mapear `CreateConvenioFormValues` → body camelCase da API; omitir campos opcionais vazios.
- Arquivo: `src/features/convenios/services/createConvenioClientService.ts`
- O que fazer: `fetch("/api/convenios", { method: "POST", ... })`, parse do envelope, retorno tipado (padrão `registerClientService`).
- Arquivo: `src/features/convenios/services/createConvenioServerService.ts`
- O que fazer: `server-only`; ler `API_URL`; `POST ${apiUrl}/convenios` com `Authorization: Bearer ${accessToken}`; tratar erres de rede/envelope como demais Server Services autenticados.
- Arquivo: `src/features/convenios/constants/queryKeys.ts` — chave de mutation (ex.: `conveniosMutationKeys.create`)
- Spec primeiro: Não aplicável
- Depende de: Passo 3

### 5. Criar Route Handler autenticado

- Arquivo: `src/app/api/convenios/route.ts`
- O que fazer: espelhar padrão de `src/app/api/auth/change-password/route.ts`:
  - ler cookie `accessToken`; 401 se ausente;
  - parse JSON + `createConvenioSchema.safeParse`;
  - chamar `createConvenioServerService`;
  - responder 201 com `{ ok: true, data }` ou erro com `getErrorMessage`.
- Spec primeiro: Não aplicável
- Depende de: Passo 4

### 6. Criar hook de mutation

- Arquivo: `src/features/convenios/hooks/useCreateConvenio.ts`
- O que fazer: `useMutation` (TanStack Query) chamando `createConvenioClientService`; expor `create`, `isPending`, `isSuccess`, `errorMessage`, `clearError`, `resetSuccess`; mapear falhas com `getErrorMessage` (padrão `useCompanyRegister`).
- Spec primeiro: Não aplicável
- Depende de: Passo 4

### 7. Implementar formulário e overlays

- Arquivo: `src/features/convenios/components/ConvenioRegisterFormOverlays.tsx`
- O que fazer: `Loading` durante `isPending`; `GlobalModal type="error"` para falhas; `GlobalModal type="success"` após cadastro (POST) com título/subtítulo de confirmação; callbacks de dismiss/confirm.
- Arquivo: `src/features/convenios/components/ConvenioRegisterForm.tsx`
- O que fazer:
  - `'use client'`; React Hook Form + `zodResolver(createConvenioSchema)` + `mode: "onChange"` + `defaultValues` para todos os campos;
  - layout com `Card`/`PageContainer` interno, título "Cadastrar convênio", labels acessíveis;
  - campos texto com `Input` + `Label` + mensagem de erro com `role="alert"`;
  - `category` com `Select` (shadcn) via `Controller` do RHF — placeholder "Categoria", sem filtro interno, duas opções da constante;
  - `isSubmitDisabled = !form.formState.isValid || isPending`;
  - submit chama `useCreateConvenio`; em sucesso abre modal; ao confirmar sucesso, `form.reset()` e `resetSuccess()`;
  - placeholders conforme especificação da tarefa.
- Spec primeiro: Não aplicável
- Depende de: Passo 6

### 8. Criar página fina da rota

- Arquivo: `src/app/(app)/convenios/cadastrar/page.tsx`
- O que fazer: Server Component fino (como `dashboard/page.tsx`); renderizar `PageContainer` + `ConvenioRegisterForm`; layout `(app)` já garante sessão via `getServerSession()`.
- Spec primeiro: Não aplicável
- Depende de: Passo 7

## Riscos / atenções

- **Endpoint inexistente na API:** até o backend publicar `POST /convenios`, o cadastro retornará erro de rede/404 — UI deve exibir `GlobalModal` de erro; não simular sucesso falso.
- **Contrato provisório:** nomes de campos e enum `category` podem mudar quando o Swagger for atualizado; revisar `createConvenioPayload.ts`, tipos e `docs/api-contracts.md` na integração real.
- **Rota protegida:** sem incluir `/convenios` em `PROTECTED_ROUTE_PREFIXES`, usuários deslogados acessariam a tela dentro do `(app)` layout (que redireciona), mas middleware/guards de callback podem falhar — passo 1 é obrigatório.
- **Select + RHF:** garantir valor controlado e validação de categoria obrigatória (evitar `undefined` permanente no default).
- **Campos opcionais:** strings vazias não devem falhar validação nem ser enviadas como `""` na API.
- **Acessibilidade:** associar `htmlFor`/`id`, `aria-invalid` nos inputs inválidos, mensagens com `role="alert"`.
- **Escopo de testes:** usuário pediu ignorar specs; checklist de PR com testes fica pendente para entrega futura.

## Checklist final

- [x] Specs unitárias/componentes escritas e passando quando aplicável *(dispensado nesta entrega)*
- [x] Componente sem lógica de negócio: delega a hooks/services
- [x] Tipos derivados dos contratos em `src/features/convenios/types.ts` (atualizar `src/lib/api/types.ts` somente se houver tipo global reutilizável)
- [x] Estados de loading, erro e vazio tratados na UI
- [x] Client Components não acessam token
- [x] Route Handler usado para chamadas autenticadas do client
- [x] shadcn/ui ou componente existente priorizado quando houver UI
- [x] GlobalModal, Loading ou DataTable reutilizados quando aplicável
- [x] Acessibilidade considerada em formulários, botões, mensagens e navegação
- [x] Imports seguem regra híbrida: relativo perto, alias longo
- [x] Sem `any` nos tipos, exceto justificativa explícita
- [x] Sem duplicação de DTO, schema, hook, service ou componente
- [x] `npm run test` sem erros quando aplicável *(não bloqueante nesta entrega)*
- [x] `npm run lint` sem erros
- [x] `npm run build` sem erros
