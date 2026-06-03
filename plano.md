# Plano: Tela de cadastro de empresa (onboarding)

## Contexto

A clínica precisa se cadastrar no sistema antes do primeiro login. A tela pública de cadastro de empresa complementa o fluxo de autenticação já implementado (`LoginForm`), acessível pelo link "Clique aqui" e pela rota `/register`. O formulário valida dados brasileiros (CPF/CNPJ, UF/cidade via IBGE), plano comercial e integra com a API de cadastro documentada, com feedback de loading e modais de erro/sucesso.

## Validação arquitetural

- Feature: existente (`auth` — extensão do onboarding)
- Reutiliza componente existente: sim (`Card`, `Input`, `Label`, `Button`, `Select` shadcn/ui, layout visual do `LoginForm`)
- Reutiliza GlobalModal / Loading / DataTable: sim (`GlobalModal`, `Loading`; DataTable não aplicável)
- Reutiliza hook existente: não (novos `useCompanyRegister`, `useIbgeLocations`)
- Reutiliza service existente: parcial (padrão de `authClientService` / `authServerService` / Route Handler)
- Reutiliza schema existente: não (novo `companyRegisterSchema`)
- Reutiliza tipos existentes: parcial (envelope `ok`/`error`; tipos de cadastro em `src/features/auth/types.ts` ou `src/lib/api/types.ts` quando criado)
- Usa shadcn/ui ou componente existente: sim (`select`, `input`, `label`, `button`, `card`)
- Exige novo componente shadcn/ui: não (`select` já existe em `src/components/ui/select.tsx`)
- Há impacto em autenticação: sim (onboarding público; sucesso redireciona para login sem gravar cookies)
- Há impacto em permissões/RBAC: não
- Há impacto em contrato de API: sim (lacuna entre formulário e `RegisterAdminDto` atual — ver Riscos)
- Há impacto em Route Handler: sim (`POST /api/auth/register`)
- Exige teste unitário/componente: sim
- Exige teste E2E: sim

## Páginas/componentes afetados

- `src/app/(auth)/register/page.tsx` (criar)
- `src/app/api/auth/register/route.ts` (criar)
- `src/features/auth/components/CompanyRegisterForm.tsx` (criar)
- `src/features/auth/components/LoginForm.tsx` (link "Clique aqui" → `/register`)
- `src/features/auth/schemas/companyRegisterSchema.ts` (criar)
- `src/features/auth/hooks/useCompanyRegister.ts` (criar)
- `src/features/auth/hooks/useIbgeLocations.ts` (criar)
- `src/features/auth/services/ibgeClientService.ts` (criar)
- `src/features/auth/services/registerClientService.ts` (criar)
- `src/features/auth/services/registerServerService.ts` (criar)
- `src/lib/validators/cpfCnpj.ts` (criar — máscara e validação de dígitos)
- `src/features/auth/constants/plans.ts` (criar — opções estáticas do select Plano)
- `docs/api-contracts.md` (atualizar DTO de cadastro de clínica, se alinhado com backend)

## Contrato de API utilizado

- `POST /auth/register-admin` (referência em `docs/api-contracts.md`)
- APIs externas públicas (sem auth):
  - `GET https://servicodados.ibge.gov.br/api/v1/localidades/estados`
  - `GET https://servicodados.ibge.gov.br/api/v1/localidades/estados/{UF}/municipios` (`{UF}` = sigla do estado, ex.: `SP`)

## Dependências/configurações necessárias

- Nenhuma dependência npm obrigatória (máscara CPF/CNPJ e validação em `src/lib/validators/cpfCnpj.ts`).
- Confirmar variável `API_URL` no servidor (mesmo padrão de `authServerService`).
- Garantir rota pública `/register` acessível sem cookie (sem middleware bloqueando, se existir no futuro).

## Estratégia de testes

- Unitário/componente:
  - `src/lib/validators/cpfCnpj.spec.ts`
  - `src/features/auth/schemas/companyRegisterSchema.spec.ts`
  - `src/features/auth/components/CompanyRegisterForm.spec.tsx`
- E2E: `e2e/auth/register.unauth.spec.ts`
- Cenários principais:
  - Acesso via `/register` e via botão "Clique aqui" no login.
  - Botão de envio desabilitado até todos os campos válidos.
  - Estado carrega da IBGE; cidade desabilitada com placeholder "Selecione um estado" até escolher UF e carregar municípios.
  - CPF (11 dígitos, máscara `000.000.000-00`) e CNPJ (14 dígitos, máscara `00.000.000/0000-00`) rejeitam formato inválido.
  - Loading durante fetch IBGE e durante submit.
  - Erro de IBGE ou de API exibe `GlobalModal` tipo `error` com mensagem amigável.
  - Sucesso exibe `GlobalModal` tipo `success` com botão "Confirmar" redirecionando para `/login`.
  - `LoginForm.spec.tsx`: "Clique aqui" navega para `/register` (mock de `next/navigation` ou `Link`).

## Passos de implementação

### 1. Alinhar contrato e tipos de cadastro

- Arquivo: `docs/api-contracts.md`, `src/features/auth/types.ts` (ou `src/lib/api/types.ts`)
- O que fazer: Documentar DTO alinhado ao formulário (proposta abaixo) e tipo de resposta `RegisterClinicResponse`. Validar com backend antes do merge; o `RegisterAdminDto` atual não cobre CNPJ, cidade, plano nem cadastro sem senha/nome do admin.
- Proposta de request (estender contrato):

```typescript
interface RegisterClinicDto {
  clinicName: string;       // mín. 3 caracteres (UI); backend pode manter mín. 2
  taxId: string;            // apenas dígitos — 11 (CPF) ou 14 (CNPJ)
  taxIdType: 'cpf' | 'cnpj';
  stateUf: string;          // sigla IBGE, ex.: 'SP'
  city: string;             // nome do município
  cityIbgeId?: number;      // id do município (opcional, do JSON IBGE)
  email: string;
  plan: 'basic' | 'assistant' | 'pro';
}
```

- Response (201): manter envelope `{ ok: true, data: { clinicId: string } }` ou equivalente acordado com API (sem expor token ao client se o fluxo exige login posterior).
- Spec primeiro: Não aplicável
- Depende de: Nenhum

### 2. Utilitários CPF/CNPJ

- Arquivo: `src/lib/validators/cpfCnpj.ts`, `src/lib/validators/cpfCnpj.spec.ts`
- O que fazer: Funções `stripDigits`, `formatCpf`, `formatCnpj`, `detectTaxIdType`, `isValidCpf`, `isValidCnpj` (validação de dígitos verificadores). Exportar helpers usados pelo Zod via `.refine()` / `.superRefine()`.
- Spec primeiro: `src/lib/validators/cpfCnpj.spec.ts`
- Depende de: Nenhum

### 3. Schema Zod do formulário

- Arquivo: `src/features/auth/schemas/companyRegisterSchema.ts`, `src/features/auth/schemas/companyRegisterSchema.spec.ts`
- O que fazer:
  - `companyName`: `z.string().min(3, 'Nome da empresa deve ter pelo menos 3 caracteres.')`
  - `taxId`: string com refine CPF 11 ou CNPJ 14 dígitos
  - `stateUf`: `z.string().min(1, 'Estado é obrigatório.')`
  - `city`: `z.string().min(1, 'Cidade é obrigatória.')`
  - `email`: email válido
  - `plan`: `z.enum(['basic', 'assistant', 'pro'])`
  - Tipo: `CompanyRegisterFormValues`
- Spec primeiro: `companyRegisterSchema.spec.ts`
- Depende de: Passo 2

### 4. Constantes de planos e serviço IBGE

- Arquivo: `src/features/auth/constants/plans.ts`, `src/features/auth/services/ibgeClientService.ts`
- O que fazer:
  - Planos estáticos para o select:
    - `basic` — "Plano basic - R$ 35,00"
    - `assistant` — "Plano assistant - R$ 75,00"
    - `pro` — "Plano pro - R$ 135,00"
  - `fetchStates()` e `fetchCitiesByUf(uf: string)` com tipos `IbgeState`, `IbgeMunicipality`; ordenar por `nome`; tratar falha de rede/HTTP.
- Spec primeiro: Não aplicável (coberto no hook/componente)
- Depende de: Nenhum

### 5. Hook de localidades IBGE

- Arquivo: `src/features/auth/hooks/useIbgeLocations.ts`
- O que fazer: Ao montar, carregar estados (`isLoadingStates`, `statesError`). Ao mudar `stateUf`, limpar cidade, carregar municípios (`isLoadingCities`, `citiesError`). Expor listas e flags para o formulário. Erros expostos para o componente abrir `GlobalModal` tipo `error` com mensagem contextual (ex.: "Não foi possível carregar os estados." / "... municípios.").
- Spec primeiro: Não aplicável
- Depende de: Passo 4

### 6. Server e client services + Route Handler de cadastro

- Arquivo: `src/features/auth/services/registerServerService.ts`, `registerClientService.ts`, `src/app/api/auth/register/route.ts`
- O que fazer:
  - `registerServerService`: `"server-only"`, `POST ${API_URL}/auth/register-admin` (ou endpoint acordado no passo 1), body mapeado de `CompanyRegisterFormValues` → DTO da API.
  - `registerClientService`: `POST /api/auth/register`, envelope tipado.
  - Route Handler: validar com `companyRegisterSchema.safeParse`, delegar ao server service, **não** gravar cookies (diferente do login).
  - Mapear códigos de erro (`USER_ALREADY_EXISTS`, `VALIDATION_ERROR`, etc.) via `getErrorMessage` de `src/lib/api/error-messages.ts` quando existir.
- Spec primeiro: Não aplicável
- Depende de: Passos 1 e 3

### 7. Hook de submissão do cadastro

- Arquivo: `src/features/auth/hooks/useCompanyRegister.ts`
- O que fazer: Estado `isPending`, `error` (mensagem para modal), `isSuccess`. Função `register(values)` chama `registerClientService`. Não redirecionar automaticamente — o componente controla modal de sucesso.
- Spec primeiro: Não aplicável
- Depende de: Passo 6

### 8. Componente CompanyRegisterForm

- Arquivo: `src/features/auth/components/CompanyRegisterForm.tsx`, `CompanyRegisterForm.spec.tsx`
- O que fazer:
  - Reutilizar layout visual do `LoginForm` (gradiente, `Card`, tipografia).
  - React Hook Form + `zodResolver(companyRegisterSchema)`, `mode: 'onChange'`, submit desabilitado se `!formState.isValid || isPending`.
  - Campos: nome, CPF/CNPJ com máscara dinâmica (`onChange` formata), selects Estado/Cidade/Plano (shadcn `Select`).
  - Cidade: `disabled` e placeholder "Selecione um estado" até `stateUf` definido e municípios carregados; após load, habilitar com opções IBGE.
  - `Loading` com mensagens: "Carregando estados", "Carregando cidades", "Cadastrando empresa" conforme flags.
  - `GlobalModal` erro: título + subtítulo com tipo de erro (IBGE vs API).
  - `GlobalModal` sucesso: `showCancel={false}`, `confirmLabel="Confirmar"`, `onConfirm` → `router.push('/login')`.
  - Integrar `useIbgeLocations` e `useCompanyRegister`; resetar cidade ao trocar estado.
- Spec primeiro: `CompanyRegisterForm.spec.tsx`
- Depende de: Passos 3, 5, 7

### 9. Página e navegação a partir do login

- Arquivo: `src/app/(auth)/register/page.tsx`, `src/features/auth/components/LoginForm.tsx`
- O que fazer:
  - Página renderiza `CompanyRegisterForm`.
  - No `LoginForm`, botão "Clique aqui" como `Link` para `/register` ou `router.push('/register')` preservando acessibilidade (`type="button"` se usar router).
  - Link opcional "Já possui conta? Faça login" na tela de cadastro.
- Spec primeiro: Atualizar `LoginForm.spec.tsx`
- Depende de: Passo 8

### 10. Testes E2E

- Arquivo: `e2e/auth/register.spec.ts`
- O que fazer: Fluxos de rota direta, link do login, validação de botão, mock de IBGE e API se necessário (Playwright `route.fulfill`), modal de sucesso e redirecionamento.
- Spec primeiro: `e2e/auth/register.spec.ts`
- Depende de: Passo 9

## Riscos / atenções

- **Lacuna de contrato**: `POST /auth/register-admin` em `docs/api-contracts.md` exige `name`, `password` e `clinicName` (mín. 2), sem `cnpj`, `cidade`, `plano` ou `estado`. O formulário da demanda não inclui senha nem nome do admin. Alinhar endpoint/DTO com o time da API antes de implementar o mapeamento definitivo; registrar extensão em `api-contracts.md`.
- **Cadastro sem auto-login**: resposta atual de `register-admin` inclui `accessToken`; a demanda pede redirecionamento manual para login — Route Handler **não** deve setar cookies.
- **IBGE**: API pública; tratar CORS (geralmente OK). UF na URL de municípios é a **sigla** (`estado.sigla`), não o `id` numérico.
- **CNPJ vs CPF**: detectar pelo número de dígitos após strip; alternar máscara e validação sem campo separado "tipo".
- **Typo do usuário**: "R$ 75,,00" → exibir "R$ 75,00" no label do plano assistant.
- **Duplicação**: não criar segundo modal; usar apenas `GlobalModal`.
- **Acessibilidade**: `aria-invalid`, `role="alert"` nos erros de campo; labels associados; select com texto legível; modal com foco gerenciado pelo Dialog.
- **Segurança**: não expor token no client; chamada de cadastro via Route Handler, mesmo sendo rota pública na API NestJS.

## Checklist final

- [x] Specs unitárias/componentes escritas e passando quando aplicável
- [ ] Specs E2E escritas e passando quando aplicável
- [ ] Componente sem lógica de negócio: delega a hooks/services
- [ ] Tipos derivados dos contratos em `src/lib/api/types.ts` ou `src/features/auth/types.ts`
- [ ] Estados de loading, erro e vazio tratados na UI
- [ ] Client Components não acessam token
- [x] Route Handler usado para chamada de cadastro ao NestJS
- [x] shadcn/ui ou componente existente priorizado quando houver UI
- [x] GlobalModal e Loading reutilizados quando aplicável
- [x] Acessibilidade considerada em formulários, botões, mensagens e navegação
- [x] Imports seguem regra híbrida: relativo perto, alias longe
- [x] Sem `any` nos tipos, exceto justificativa explícita
- [x] Sem duplicação de DTO, schema, hook, service ou componente
- [x] `npm run test` sem erros quando aplicável
- [ ] `npm run test:e2e` sem erros quando aplicável (requer `npx playwright install` e servidor livre na porta 3000)
- [x] `npm run lint` sem erros nos arquivos da feature auth
- [x] `npm run build` sem erros
