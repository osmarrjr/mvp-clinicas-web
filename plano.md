# Plano: Centralizar constantes em auth e bloquear confirmar senha no change-password

## Contexto

Constantes de UI e mensagens de tooltip estão espalhadas em componentes (`LOGIN_INPUT_CLASS_NAME`, `INPUT_CLASS_NAME`) e em subpastas de componente (`CompanyRegisterForm/constants.ts`), enquanto `validators/password/password.ts` mistura strings de UI com lógica de validação. Isso gera duplicação e dificulta manter consistência visual entre formulários de auth. Além disso, `ChangePasswordForm` permite digitar a confirmação de senha antes da nova senha ser válida, comportamento já corrigido no fluxo de cadastro (`RegisterConfirmPasswordField`).

## Validação arquitetural

- Feature: existente (`auth`)
- Reutiliza componente existente: sim (`Input`, `Label`, `Tooltip`, padrão de `RegisterConfirmPasswordField`)
- Reutiliza GlobalModal / Loading / DataTable: sim (`ChangePasswordOverlays` já usa `GlobalModal` e `Loading`)
- Reutiliza hook existente: sim (`useChangePassword`)
- Reutiliza service existente: não aplicável
- Reutiliza schema existente: sim (`changePasswordSchema`)
- Reutiliza tipos existentes: sim (`ChangePasswordFormValues`)
- Usa shadcn/ui ou componente existente: sim
- Exige novo componente shadcn/ui: não
- Há impacto em autenticação: não (apenas UX de formulário já autenticado)
- Há impacto em permissões/RBAC: não
- Há impacto em contrato de API: não
- Há impacto em Route Handler: não
- Exige teste unitário/componente: sim

## Páginas/componentes afetados

- `src/features/auth/constants/index.ts` (novo — barrel central)
- `src/features/auth/constants/formStyles.ts` (novo)
- `src/features/auth/constants/passwordTooltips.ts` (novo)
- `src/features/auth/constants/authRoutes.ts` (re-export via index; sem alteração de conteúdo)
- `src/features/auth/constants/plans.ts` (re-export via index; sem alteração de conteúdo)
- `src/features/auth/constants/queryKeys.ts` (re-export via index; sem alteração de conteúdo)
- `src/features/auth/constants/registerValidation.ts` (re-export via index; sem alteração de conteúdo)
- `src/features/auth/components/CompanyRegisterForm/constants.ts` (remover após migração)
- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/components/ChangePasswordForm/ChangePasswordForm.tsx`
- `src/features/auth/components/CompanyRegisterForm/CompanyRegisterForm.tsx`
- `src/features/auth/components/CompanyRegisterForm/RegisterPassword/RegisterPasswordField.tsx`
- `src/features/auth/components/CompanyRegisterForm/RegisterPassword/RegisterConfirmPasswordField.tsx`
- `src/features/auth/components/ValidateRegisterTokenForm/ValidateRegisterTokenForm.tsx`
- `src/features/auth/validators/password/password.ts`
- `src/features/auth/components/ChangePasswordForm/ChangePasswordForm.spec.tsx` (novo)
- `.cursor/skills/react/conventions.md` (documentar padrão)

## Contrato de API utilizado

Nenhum.

## Dependências/configurações necessárias

Nenhuma.

## Estrutura do constants central

### O que mover para `src/features/auth/constants/`

| Constante atual | Origem | Destino | Nome final |
|---|---|---|---|
| `REGISTER_INPUT_CLASS_NAME` | `CompanyRegisterForm/constants.ts` | `formStyles.ts` | `AUTH_FORM_INPUT_CLASS_NAME` |
| `REGISTER_TOKEN_DIGIT_INPUT_CLASS_NAME` | `CompanyRegisterForm/constants.ts` | `formStyles.ts` | `AUTH_TOKEN_DIGIT_INPUT_CLASS_NAME` |
| `LOGIN_INPUT_CLASS_NAME` | `LoginForm.tsx` (local) | `formStyles.ts` | `AUTH_FORM_INPUT_CLASS_NAME` (mesma constante) |
| `INPUT_CLASS_NAME` | `ChangePasswordForm.tsx` (local) | `formStyles.ts` | `AUTH_FORM_INPUT_CLASS_NAME` (mesma constante) |
| `PASSWORD_REQUIREMENTS_TOOLTIP` | `validators/password/password.ts` | `passwordTooltips.ts` | manter nome |
| `CONFIRM_NEW_PASSWORD_TOOLTIP` | `validators/password/password.ts` | `passwordTooltips.ts` | manter nome |

**Canônico de estilo:** usar a string de `REGISTER_INPUT_CLASS_NAME` como base (inclui `disabledFormControlClassName` e `aria-[invalid=true]:ring-2`), unificando pequenas diferenças entre login e change-password.

### O que manter em arquivos separados dentro de `constants/`

| Arquivo | Conteúdo | Motivo |
|---|---|---|
| `authRoutes.ts` | rotas de navegação auth | domínio de roteamento |
| `plans.ts` | opções de plano | dados de domínio |
| `queryKeys.ts` | chaves TanStack Query | infra de cache |
| `registerValidation.ts` | chaves de sessão/localStorage do registro | domínio específico do fluxo |

### Entry point central

Criar **`src/features/auth/constants/index.ts`** como barrel público da feature (equivalente ao `constants.ts` solicitado, evitando conflito entre arquivo `constants.ts` e pasta `constants/` no mesmo nível).

Exports esperados:

```ts
export * from "./formStyles";
export * from "./passwordTooltips";
export * from "./authRoutes";
export * from "./plans";
export * from "./queryKeys";
export * from "./registerValidation";
```

Imports recomendados após migração:

- Dentro de `features/auth/components/*`: `from "../../constants"` ou `from "../constants"` conforme profundidade
- Cruzando módulos distantes: `@/features/auth/constants`

### O que remover

- `src/features/auth/components/CompanyRegisterForm/constants.ts` (conteúdo migrado; deletar arquivo)

### O que permanece em `validators/password/password.ts`

Somente lógica de validação (`getPasswordValidationError`, `getPasswordStrength`, tipos e helpers). Sem strings de tooltip.

---

## Padrão para futuras features

Documentar em `.cursor/skills/react/conventions.md` (nova seção **Constantes por feature**):

1. **Pasta `constants/`** na raiz da feature para qualquer valor compartilhado entre 2+ arquivos da mesma feature.
2. **`constants/index.ts`** como entry point único (barrel) — importar sempre de `../constants` ou `@/features/<feature>/constants`.
3. **Arquivos temáticos** dentro de `constants/` quando houver agrupamento claro (`formStyles.ts`, `routes.ts`, `queryKeys.ts`).
4. **Proibido** definir constantes compartilhadas inline em componentes ou em `constants.ts` dentro de subpastas de componente.
5. **Validators/schemas** guardam apenas lógica e mensagens de erro de validação; tooltips, classNames e labels reutilizáveis ficam em `constants/`.
6. **Features pequenas** podem usar um único `constants.ts` na raiz da feature; ao crescer, migrar para pasta `constants/` + `index.ts` sem alterar o padrão de import (`@/features/<feature>/constants`).

---

## Estratégia de testes

- Unitário/componente: `src/features/auth/components/ChangePasswordForm/ChangePasswordForm.spec.tsx` (novo)
- Cenários principais:
  - Campo "Confirmar senha" inicia `disabled` quando nova senha está vazia ou inválida
  - Campo "Confirmar senha" habilita quando nova senha atende `getPasswordValidationError(..., {}) === null`
  - Ao invalidar nova senha após preencher confirmação, confirmação é limpa e volta a `disabled`
  - Botão de exibir/ocultar confirmação respeita o mesmo `disabled`
  - Submit continua bloqueado até formulário válido (`changePasswordSchema`)
- Regressão: `npm run test` nos specs existentes (`changePasswordSchema.spec.ts`, `LoginForm.spec.tsx`, `companyRegisterSchema.spec.ts`) após atualizar imports

---

## Passos de implementação

### 1. Criar módulos centralizados de constantes

- Arquivo: `src/features/auth/constants/formStyles.ts`
- O que fazer: criar `AUTH_FORM_INPUT_CLASS_NAME` e `AUTH_TOKEN_DIGIT_INPUT_CLASS_NAME` consolidando as strings duplicadas; importar `disabledFormControlClassName` de `@/lib/styles/disabled-field`.
- Spec primeiro: Não aplicável
- Depende de: Nenhum

### 2. Extrair tooltips de senha para constants

- Arquivo: `src/features/auth/constants/passwordTooltips.ts`
- O que fazer: mover `PASSWORD_REQUIREMENTS_TOOLTIP` e `CONFIRM_NEW_PASSWORD_TOOLTIP` de `password.ts`; remover exports de tooltip do validator.
- Spec primeiro: Não aplicável
- Depende de: Nenhum

### 3. Criar barrel central da feature

- Arquivo: `src/features/auth/constants/index.ts`
- O que fazer: re-exportar todos os módulos de `constants/` incluindo os novos; garantir resolução de import `@/features/auth/constants`.
- Spec primeiro: Não aplicável
- Depende de: Passos 1 e 2

### 4. Migrar imports nos componentes auth

- Arquivo: `LoginForm.tsx`, `ChangePasswordForm.tsx`, `CompanyRegisterForm.tsx`, `RegisterPasswordField.tsx`, `RegisterConfirmPasswordField.tsx`, `ValidateRegisterTokenForm.tsx`
- O que fazer: substituir constantes locais e imports antigos por `@/features/auth/constants` (ou caminho relativo curto conforme convenção híbrida); usar `AUTH_FORM_INPUT_CLASS_NAME` / `AUTH_TOKEN_DIGIT_INPUT_CLASS_NAME` e tooltips centralizados.
- Spec primeiro: Não aplicável
- Depende de: Passo 3

### 5. Remover arquivo duplicado de componente

- Arquivo: `src/features/auth/components/CompanyRegisterForm/constants.ts`
- O que fazer: deletar após todos os imports migrados; confirmar que nenhum import residual aponta para `./constants` local.
- Spec primeiro: Não aplicável
- Depende de: Passo 4

### 6. Bloquear confirmar senha no ChangePasswordForm

- Arquivo: `src/features/auth/components/ChangePasswordForm/ChangePasswordForm.tsx`
- O que fazer:
  - `watch("newPassword")` e `watch("confirmNewPassword")`
  - `isNewPasswordValid = useMemo(() => getPasswordValidationError(newPassword, {}) === null, [newPassword])`
  - `useEffect`: se `!isNewPasswordValid && confirmNewPassword`, chamar `form.setValue("confirmNewPassword", "", { shouldValidate: true })`
  - Aplicar `disabled={!isNewPasswordValid}` no `Input` de confirmação e no botão de toggle de visibilidade
  - Aplicar `disabledFieldClassName` no botão de toggle (mesmo padrão de `RegisterConfirmPasswordField`)
  - Manter validação final no `changePasswordSchema` (sem duplicar regra no componente além do gate de UX)
- Spec primeiro: `ChangePasswordForm.spec.tsx`
- Depende de: Passo 4

### 7. Escrever spec de componente do ChangePasswordForm

- Arquivo: `src/features/auth/components/ChangePasswordForm/ChangePasswordForm.spec.tsx`
- O que fazer: seguir padrão de `LoginForm.spec.tsx` (mock de `useChangePassword`, `useRouter`, `ChangePasswordOverlays`); cobrir cenários de disabled/enabled/clear descritos na estratégia de testes.
- Spec primeiro: este arquivo
- Depende de: Passo 6

### 8. Documentar padrão de constants em conventions

- Arquivo: `.cursor/skills/react/conventions.md`
- O que fazer: adicionar seção **Constantes por feature** conforme definido acima; incluir exemplo de estrutura e regra de proibição de constantes compartilhadas em componentes.
- Spec primeiro: Não aplicável
- Depende de: Passos 1–5 concluídos (para documentar estrutura final real)

---

## Riscos / atenções

- Unificação de classNames pode alterar levemente aparência do login/change-password (ex.: adição de estilos `disabled:` e `ring-2` no estado inválido); validar visualmente nos três formulários.
- `constants/index.ts` + pasta `constants/` exige cuidado para não criar também `src/features/auth/constants.ts` na raiz (conflito de resolução de módulo).
- `RegisterConfirmPasswordField` usa `@/` para tooltip enquanto outros usam relativo — aproveitar migração para padronizar imports conforme skill híbrida.
- Gate de UX no change-password usa contexto vazio `{}` (correto para troca de senha); cadastro continua passando contexto com dados pessoais no schema/validator.
- Acessibilidade: campo disabled deve permanecer associado ao `Label`; tooltip de confirmação já informa dependência da senha válida.

---

## Critérios de aceite

1. Não existe constante compartilhada de className ou tooltip definida inline em componentes auth ou em `CompanyRegisterForm/constants.ts`.
2. `AUTH_FORM_INPUT_CLASS_NAME` é usada por Login, Register, Change Password e demais campos de formulário auth que hoje duplicam estilo.
3. `AUTH_TOKEN_DIGIT_INPUT_CLASS_NAME` é usada por `ValidateRegisterTokenForm`.
4. Tooltips de senha importados exclusivamente de `@/features/auth/constants` (ou barrel relativo equivalente).
5. `password.ts` contém apenas lógica de validação (sem tooltips).
6. Em `/change-password`, o campo "Confirmar senha" e seu botão de visibilidade ficam `disabled` até a nova senha ser válida.
7. Se a nova senha ficar inválida após digitar confirmação, o valor de confirmação é limpo automaticamente.
8. Comportamento de submit inalterado: botão só habilita com formulário válido e sem `isPending`.
9. Spec `ChangePasswordForm.spec.tsx` cobre os três cenários de gate (disabled inicial, habilita com senha válida, limpa ao invalidar).
10. `.cursor/skills/react/conventions.md` documenta o padrão para novas features.
11. `npm run test`, `npm run lint` e `npm run build` passam sem erros.

---

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
- [ ] `npm run lint` sem erros (5 erros pré-existentes em main: Table/index.tsx, create-pr-on-approval.js)
- [x] `npm run build` sem erros
