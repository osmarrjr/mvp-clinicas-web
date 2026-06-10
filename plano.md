# Plano: Validação de token pós-cadastro de clínica

## Contexto

O fluxo atual de cadastro de clínica exibe modal de sucesso e redireciona imediatamente para `/login` após `POST /api/auth/register`. O backend passou a exigir validação por token de 6 dígitos enviado ao email do cadastro antes de tornar o registro efetivo. É necessário interromper o redirecionamento automático, orientar o usuário sobre o token e criar uma nova etapa de validação com chamada ao endpoint `validate-register-token`.

## Validação arquitetural

- Feature: existente (`auth`)
- Reutiliza componente existente: sim (`GlobalModal`, `Loading`, `Card`, `Input`, `Button`, padrão visual de `CompanyRegisterForm`)
- Reutiliza GlobalModal / Loading / DataTable: sim (`GlobalModal`, `Loading`; `DataTable` não aplicável)
- Reutiliza hook existente: não (novo `useValidateRegisterToken`; `useCompanyRegister` permanece com ajuste de fluxo)
- Reutiliza service existente: não (novos services espelhando padrão de `registerClientService` / `registerServerService`)
- Reutiliza schema existente: não (novo `registerTokenSchema`)
- Reutiliza tipos existentes: sim (estender `src/features/auth/types.ts` com envelope de resposta; padrão `ApiErrorShape` já existente)
- Usa shadcn/ui ou componente existente: sim
- Exige novo componente shadcn/ui: não
- Há impacto em autenticação: sim (fluxo pré-login; sem gravação de cookies JWT)
- Há impacto em permissões/RBAC: não
- Há impacto em contrato de API: sim (novo endpoint não documentado em `docs/api-contracts.md`)
- Há impacto em Route Handler: sim (`POST /api/auth/validate-register-token`)
- Exige teste unitário/componente: sim

## Páginas/componentes afetados

### Criar

- `src/features/auth/schemas/registerTokenSchema.ts`
- `src/features/auth/schemas/registerTokenSchema.spec.ts`
- `src/features/auth/validators/registerToken/registerToken.ts`
- `src/features/auth/validators/registerToken/registerToken.spec.ts`
- `src/features/auth/services/companyRegister/validateRegisterTokenClientService.ts`
- `src/features/auth/services/companyRegister/validateRegisterTokenServerService.ts`
- `src/features/auth/hooks/useValidateRegisterToken.ts`
- `src/features/auth/components/ValidateRegisterTokenForm/ValidateRegisterTokenForm.tsx`
- `src/features/auth/components/ValidateRegisterTokenForm/ValidateRegisterTokenForm.spec.tsx`
- `src/features/auth/components/ValidateRegisterTokenForm/ValidateTokenOverlays.tsx`
- `src/app/(auth)/register/validate-token/page.tsx`
- `src/app/api/auth/validate-register-token/route.ts`

### Alterar

- `src/features/auth/components/CompanyRegisterForm/CompanyRegisterForm.tsx`
- `src/features/auth/components/CompanyRegisterForm/RegisterFormOverlays/RegisterFormOverlays.tsx`
- `src/features/auth/components/CompanyRegisterForm/CompanyRegisterForm.spec.tsx`
- `src/features/auth/types.ts`
- `src/features/auth/constants/queryKeys.ts`
- `src/lib/api/error-messages.ts`

## Contrato de API utilizado

### Existente (inalterado)

- `POST /auth/register-admin` — consumido via `POST /api/auth/register` (cadastro inicial)

### Novo — assumido (não documentado em `docs/api-contracts.md`)

**NestJS:** `POST /auth/validate-register-token`

**Route Handler interno:** `POST /api/auth/validate-register-token`

**Request:**

```typescript
interface ValidateRegisterTokenDto {
  email: string;   // email usado no cadastro
  token: string;   // 6 dígitos numéricos, sem hífen (ex.: "123456")
}
```

**Response sucesso (200):**

```typescript
{ ok: true, data: { message: string } }
// Exemplo: { ok: true, data: { message: "Registration confirmed" } }
```

**Erros esperados:**

| Código HTTP | code semântico | Mensagem sugerida na UI |
|-------------|----------------|-------------------------|
| 400 | `REGISTER_TOKEN_INVALID` | Token inválido ou expirado. Verifique o código enviado para seu email. |
| 400 | `VALIDATION_ERROR` | Dados inválidos. Verifique o token e tente novamente. |
| 500 | `INTERNAL_ERROR` | Ocorreu um erro inesperado. Tente novamente. |

**Regras de integração:**

- Client Service chama apenas o Route Handler interno.
- Server Service chama `${API_URL}/auth/validate-register-token`.
- Route Handler valida body com `registerTokenSchema` (ou schema estendido com `email`).
- Não gravar cookies nem expor JWT ao client nesta etapa.
- Normalizar token na borda do service: remover hífen e caracteres não numéricos antes do envio.

**Persistência do email entre etapas:**

- Ao clicar "Continuar" no modal pós-cadastro, salvar email em `sessionStorage` (`register-validation-email`).
- Na tela de token, ler email do `sessionStorage`; se ausente, redirecionar para `/register`.
- Limpar `sessionStorage` após validação bem-sucedida.

## Rota da nova tela de token

**Sugestão adotada:** `/register/validate-token`

- Arquivo: `src/app/(auth)/register/validate-token/page.tsx`
- Reutiliza layout de `(auth)` (mesmo visual do cadastro/login).
- Acesso esperado somente após cadastro bem-sucedido; fallback para `/register` se email não estiver disponível.

## Textos das modais

### 1. Modal pós-cadastro (formulário de registro)

| Prop | Valor |
|------|-------|
| `type` | `success` |
| `modalTitle` | Cadastro solicitado com sucesso |
| `modalSubTitle` | Seu cadastro foi recebido. Para torná-lo válido, insira o token de 6 dígitos enviado para o email informado no cadastro. |
| `confirmLabel` | Continuar |
| `showCancel` | `false` |
| Ação `onConfirm` | Salvar email em `sessionStorage` e navegar para `/register/validate-token` (sem ir para `/login`) |

### 2. Modal sucesso na validação do token

| Prop | Valor |
|------|-------|
| `type` | `success` |
| `modalTitle` | Cadastro confirmado |
| `modalSubTitle` | Seu cadastro foi validado com sucesso. Agora você pode fazer login. |
| `confirmLabel` | Ir para login |
| `showCancel` | `false` |
| Ação `onConfirm` | Limpar estado/`sessionStorage` e `router.push("/login")` |

### 3. Modal erro na validação do token

| Prop | Valor |
|------|-------|
| `type` | `error` |
| `modalTitle` | Ops! Ocorreu um erro! |
| `modalSubTitle` | Mensagem mapeada do hook (`REGISTER_TOKEN_INVALID`, `VALIDATION_ERROR`, etc.) |
| `confirmLabel` | Fechar |
| `showCancel` | `false` |
| Ação `onConfirm` | Fechar modal e permitir nova tentativa no campo |

### 4. Aviso abaixo do campo de token (não é modal)

- Exibir enquanto os 6 dígitos não estiverem completos.
- Texto: `Informe o token de 6 dígitos no formato 000-000 enviado para seu email.`
- Usar `role="status"` (informativo) ou `role="alert"` se o usuário tentou validar incompleto.
- Ocultar aviso quando token atingir 6 dígitos.

## Dependências/configurações necessárias

- Nenhuma dependência npm nova.
- Reutilizar `Input`, `Label`, `Card`, `Button` de `@/components/ui`.
- Reutilizar `GlobalModal` e `Loading`.
- Variável de ambiente existente: `API_URL` no servidor.
- Não adicionar componente shadcn/ui novo.

## Estratégia de testes

### Unitário

- `registerTokenSchema.spec.ts` — valida formato `XXX-XXX`, rejeita letras, exige 6 dígitos.
- `registerToken.spec.ts` — funções `formatRegisterTokenInput` e `normalizeRegisterToken` (máscara e normalização).

### Componente

- `ValidateRegisterTokenForm.spec.tsx`:
  - renderiza campo com label/placeholder do token;
  - exibe aviso enquanto token incompleto;
  - aplica máscara `XXX-XXX` durante digitação;
  - dispara validação automaticamente ao completar 6 dígitos;
  - não chama service antes de 6 dígitos;
  - exibe `Loading` durante `isPending`;
  - exibe modal de sucesso e redireciona para `/login`;
  - exibe modal de erro em falha da API;
  - redireciona para `/register` se email ausente no `sessionStorage`.

- `CompanyRegisterForm.spec.tsx` (atualizar):
  - modal pós-cadastro com novos textos;
  - botão "Continuar" navega para `/register/validate-token` (não `/login`);
  - email salvo em `sessionStorage` antes da navegação.

### Cenários principais

- Cadastro OK → modal informativa → Continuar → tela de token.
- Token incompleto → aviso visível → sem chamada de API.
- Token completo → chamada automática ao endpoint.
- Validação OK → modal sucesso → login.
- Validação com token inválido → modal erro → usuário pode corrigir e reenviar.

## Passos de implementação

### 1. Spec — schema e validador de token

- Arquivo: `src/features/auth/schemas/registerTokenSchema.spec.ts`, `src/features/auth/validators/registerToken/registerToken.spec.ts`
- O que fazer: definir testes para máscara `XXX-XXX`, normalização para 6 dígitos e regras Zod antes da implementação.
- Spec primeiro: estes arquivos `.spec.ts`
- Depende de: Nenhum

### 2. Schema e validador de token

- Arquivo: `src/features/auth/schemas/registerTokenSchema.ts`, `src/features/auth/validators/registerToken/registerToken.ts`
- O que fazer:
  - Schema Zod com campo `token` no formato visual `^\d{3}-\d{3}$`;
  - Helper `formatRegisterTokenInput(value: string): string` para máscara progressiva;
  - Helper `normalizeRegisterToken(value: string): string` retornando 6 dígitos sem hífen;
  - Tipo inferido `RegisterTokenFormValues`.
- Spec primeiro: passo 1
- Depende de: Passo 1

### 3. Tipos e chaves de mutation

- Arquivo: `src/features/auth/types.ts`, `src/features/auth/constants/queryKeys.ts`, `src/lib/api/error-messages.ts`
- O que fazer:
  - Adicionar `ValidateRegisterTokenDto`, `ValidateRegisterTokenSuccessData`, `ValidateRegisterTokenResponse`;
  - Adicionar `authMutationKeys.validateRegisterToken`;
  - Adicionar `REGISTER_TOKEN_INVALID` em `ERROR_MESSAGES`.
- Spec primeiro: Não aplicável
- Depende de: Passo 2

### 4. Spec — services de validação

- Arquivo: `src/features/auth/services/companyRegister/validateRegisterTokenClientService.spec.ts` (opcional, se o projeto já testa services; caso contrário, cobrir via hook/componente)
- O que fazer: se criado, testar normalização do token e tratamento de envelope `ok: false`.
- Spec primeiro: arquivo `.spec.ts` do service, se adotado
- Depende de: Passo 3

### 5. Server Service e Client Service

- Arquivo: `src/features/auth/services/companyRegister/validateRegisterTokenServerService.ts`, `src/features/auth/services/companyRegister/validateRegisterTokenClientService.ts`
- O que fazer:
  - Server Service (`"server-only"`): `POST ${API_URL}/auth/validate-register-token` com `{ email, token }` normalizado;
  - Client Service: `POST /api/auth/validate-register-token`;
  - Retornar envelope tipado; mapear erros de rede/env.
- Spec primeiro: Não aplicável (ou spec do passo 4)
- Depende de: Passo 3

### 6. Hook de validação

- Arquivo: `src/features/auth/hooks/useValidateRegisterToken.ts`
- O que fazer:
  - `useMutation` com `authMutationKeys.validateRegisterToken`;
  - Expor `validateToken({ email, token })`, `isPending`, `isSuccess`, `errorMessage`, `clearError`, `resetSuccess`;
  - Mapear códigos de erro para português (espelhar padrão de `useCompanyRegister`).
- Spec primeiro: Não aplicável
- Depende de: Passo 5

### 7. Spec — componente de validação de token

- Arquivo: `src/features/auth/components/ValidateRegisterTokenForm/ValidateRegisterTokenForm.spec.tsx`
- O que fazer: escrever testes de comportamento (máscara, aviso, auto-submit, modais, redirect) antes do componente.
- Spec primeiro: este arquivo `.spec.tsx`
- Depende de: Passo 6

### 8. Componentes da tela de token

- Arquivo: `src/features/auth/components/ValidateRegisterTokenForm/ValidateRegisterTokenForm.tsx`, `src/features/auth/components/ValidateRegisterTokenForm/ValidateTokenOverlays.tsx`
- O que fazer:
  - Client Component com React Hook Form + Zod;
  - Campo único de token com máscara `XXX-XXX` via `onChange` controlado;
  - Aviso abaixo do campo enquanto dígitos < 6;
  - `useEffect` (ou watcher do form) dispara `validateToken` somente quando schema válido (6 dígitos);
  - Evitar chamadas duplicadas com flag/ref de submissão em andamento;
  - Ler email do `sessionStorage` no mount; redirect `/register` se ausente;
  - `ValidateTokenOverlays`: `Loading`, `GlobalModal` success/error (textos da seção acima);
  - Visual alinhado ao card de `CompanyRegisterForm` (mesmas classes de card/input quando possível).
- Spec primeiro: passo 7
- Depende de: Passo 6

### 9. Página da tela de token

- Arquivo: `src/app/(auth)/register/validate-token/page.tsx`
- O que fazer: Server Component fino renderizando `<ValidateRegisterTokenForm />`.
- Spec primeiro: Não aplicável
- Depende de: Passo 8

### 10. Route Handler de validação

- Arquivo: `src/app/api/auth/validate-register-token/route.ts`
- O que fazer:
  - Parsear JSON;
  - Validar com schema que inclua `email` + `token` (pode ser `registerTokenSchema.extend({ email: z.string().email() })` em arquivo dedicado ou no handler);
  - Chamar `validateRegisterTokenServerService`;
  - Mapear códigos para status HTTP (400 para `REGISTER_TOKEN_INVALID` / `VALIDATION_ERROR`);
  - Retornar envelope `{ ok, data }` ou `{ ok: false, error }` sem cookies.
- Spec primeiro: Não aplicável
- Depende de: Passo 5

### 11. Ajuste do fluxo pós-cadastro (formulário existente)

- Arquivo: `src/features/auth/components/CompanyRegisterForm/RegisterFormOverlays/RegisterFormOverlays.tsx`, `src/features/auth/components/CompanyRegisterForm/CompanyRegisterForm.tsx`
- O que fazer:
  - Atualizar textos do modal de sucesso (título, subtítulo, botão "Continuar");
  - Em `handleConfirmSuccess`: persistir `email` do formulário em `sessionStorage` e `router.push("/register/validate-token")` — remover `router.push("/login")`;
  - Passar `email` do form para o handler de sucesso.
- Spec primeiro: Não aplicável
- Depende de: Passo 9

### 12. Atualizar specs do formulário de cadastro

- Arquivo: `src/features/auth/components/CompanyRegisterForm/CompanyRegisterForm.spec.tsx`
- O que fazer:
  - Ajustar teste "exibe modal de sucesso e redireciona ao confirmar" para novos textos e rota `/register/validate-token`;
  - Verificar persistência do email em `sessionStorage`.
- Spec primeiro: Não aplicável (spec existente a atualizar)
- Depende de: Passo 11

## Riscos / atenções

- Endpoint `validate-register-token` não está em `docs/api-contracts.md`; confirmar contrato real com backend (campos, formato do token, necessidade de `email`).
- Risco de chamadas duplicadas ao auto-submit: usar guard com `isPending` e controle de último token enviado.
- `sessionStorage` é volátil (aba fechada perde contexto); fallback para `/register` é obrigatório.
- Não gravar JWT nesta etapa — cadastro ainda não está autenticado.
- Máscara `XXX-XXX` deve aceitar apenas dígitos; colar texto deve ser sanitizado.
- Acessibilidade: label do campo, aviso associado ao input (`aria-describedby`), foco visível.
- Atualizar `docs/api-contracts.md` após confirmação do contrato com o backend (fora do escopo imediato, mas recomendado).

## Comandos de validação

```bash
npm run test
npm run lint
npm run build
```

## Checklist final

- [x] Specs unitárias/componentes escritas e passando quando aplicável
- [x] Componente sem lógica de negócio: delega a hooks/services
- [x] Tipos derivados dos contratos em `src/features/auth/types.ts`
- [x] Estados de loading, erro e vazio tratados na UI
- [x] Client Components não acessam token
- [x] Route Handler usado para chamadas do client ao NestJS
- [x] shadcn/ui ou componente existente priorizado quando houver UI
- [x] GlobalModal e Loading reutilizados
- [x] Acessibilidade considerada em formulários, botões, mensagens e navegação
- [x] Imports seguem regra híbrida: relativo perto, alias longe
- [x] Sem `any` nos tipos, exceto justificativa explícita
- [x] Sem duplicação de DTO, schema, hook, service ou componente
- [x] Modal pós-cadastro não redireciona para login
- [x] Tela `/register/validate-token` chama API somente com 6 dígitos completos
- [x] Sucesso na validação redireciona para `/login`
- [x] `npm run test` sem erros
- [ ] `npm run lint` sem erros
- [x] `npm run build` sem erros
