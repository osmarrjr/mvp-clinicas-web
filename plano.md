# Plano: Inputs separados para token de validação (6 dígitos)

## Contexto

O formulário `ValidateRegisterTokenForm` usa hoje um único `Input` com máscara `000-000`. A solicitação é substituir essa UI por 6 campos individuais (um dígito cada), com hífen apenas visual, mantendo o valor interno do React Hook Form como string `XXX-XXX` e o auto-submit ao completar 6 dígitos. O contrato da API e o schema Zod permanecem inalterados.

## Validação arquitetural

- Feature: existente (`auth` — validação de token pós-cadastro)
- Reutiliza componente existente: sim (`Input`, `Label`, `Card`, `ValidateTokenOverlays`)
- Reutiliza GlobalModal / Loading / DataTable: sim (`ValidateTokenOverlays` já usa `Loading` e `GlobalModal`; sem alteração)
- Reutiliza hook existente: sim (`useValidateRegisterToken`)
- Reutiliza service existente: sim (`validateRegisterTokenClientService` / `validateRegisterTokenServerService`)
- Reutiliza schema existente: sim (`registerTokenSchema` — regex `^\d{3}-\d{3}$`)
- Reutiliza tipos existentes: sim (`RegisterTokenFormValues`, `ValidateRegisterTokenDto`)
- Usa shadcn/ui ou componente existente: sim (`Input`, `Label` de `@/components/ui`)
- Exige novo componente shadcn/ui: não
- Há impacto em autenticação: não (fluxo público pós-cadastro, sem cookie JWT)
- Há impacto em permissões/RBAC: não
- Há impacto em contrato de API: não (token continua `XXX-XXX` no form; services já normalizam para 6 dígitos na chamada externa)
- Há impacto em Route Handler: não
- Exige teste unitário/componente: sim

## Páginas/componentes afetados

- `src/features/auth/components/ValidateRegisterTokenForm/ValidateRegisterTokenForm.tsx`
- `src/features/auth/components/ValidateRegisterTokenForm/RegisterTokenDigitInputs/RegisterTokenDigitInputs.tsx` (novo)
- `src/features/auth/components/ValidateRegisterTokenForm/RegisterTokenDigitInputs/RegisterTokenDigitInputs.spec.tsx` (novo)
- `src/features/auth/components/ValidateRegisterTokenForm/ValidateRegisterTokenForm.spec.tsx`
- `src/features/auth/validators/registerToken/registerToken.ts`
- `src/features/auth/validators/registerToken/registerToken.spec.ts`
- `src/features/auth/components/CompanyRegisterForm/constants.ts` (constante de classe para dígito, se necessário)

## Contrato de API utilizado

- `POST /api/auth/validate-register-token` (Route Handler) → `POST {API_URL}/auth/validate-register-token` com `{ email, token }` (token normalizado para 6 dígitos no server/client service)
- Validação do payload no Route Handler via `validateRegisterTokenRequestSchema` (token no formato `^\d{3}-\d{3}$`)

## Dependências/configurações necessárias

Nenhuma.

## Estratégia de testes

- Unitário/componente: `RegisterTokenDigitInputs.spec.tsx`, `registerToken.spec.ts`, `ValidateRegisterTokenForm.spec.tsx`
- Cenários principais:
  - Renderiza 6 inputs com layout `XXX-XXX` e label acessível
  - Digitar dígito avança foco para o próximo campo
  - Backspace em campo vazio retorna foco ao campo anterior
  - Paste de `123456` ou `123-456` preenche os 6 campos e atualiza valor `123-456`
  - Valor parcial mantém string interna sem hífen até 3 dígitos (`12` → `"12"`, `1234` → `"123-4"`)
  - Auto-submit ao completar 6 dígitos continua chamando `validateToken` com `{ email, token: "123-456" }`
  - Não chama service antes de 6 dígitos
  - Fluxos de erro/sucesso/redirect permanecem inalterados
  - Helpers `splitRegisterTokenDigits` / `joinRegisterTokenDigits` / `parseRegisterTokenPaste` cobertos unitariamente

## Passos de implementação

### 1. Estender validators de token

- Arquivo: `src/features/auth/validators/registerToken/registerToken.ts`
- O que fazer:
  - Adicionar `splitRegisterTokenDigits(value: string): string[]` — retorna array de 6 strings (cada uma `""` ou um dígito), derivado de `stripRegisterTokenDigits`
  - Adicionar `joinRegisterTokenDigits(digits: string[]): string` — sanitiza cada slot, concatena e reutiliza `formatRegisterTokenInput`
  - Adicionar `parseRegisterTokenPaste(raw: string): string` — sanitiza entrada colada (`123456`, `123-456`, `12a3-45b6`) e retorna string formatada via `formatRegisterTokenInput`
  - Manter funções existentes (`formatRegisterTokenInput`, `normalizeRegisterToken`, `stripRegisterTokenDigits`) sem breaking change
- Spec primeiro: `src/features/auth/validators/registerToken/registerToken.spec.ts`
- Depende de: Nenhum

### 2. Spec do componente de dígitos

- Arquivo: `src/features/auth/components/ValidateRegisterTokenForm/RegisterTokenDigitInputs/RegisterTokenDigitInputs.spec.tsx`
- O que fazer:
  - Definir contrato do componente controlado: props `value`, `onChange`, `inputClassName`, `disabled?`, `idPrefix?`, `ariaDescribedBy?`
  - Cobrir: renderização dos 6 inputs + separador visual; avanço de foco ao digitar; backspace em vazio; paste completo; sincronização quando `value` muda externamente (ex.: clear programático)
  - Usar seletores acessíveis (`getByRole`, `getByLabelText`, `aria-label` por dígito)
- Spec primeiro: este arquivo (SDD — spec antes da implementação)
- Depende de: Passo 1 (helpers usados indiretamente nos testes de integração do componente; mocks não obrigatórios)

### 3. Implementar `RegisterTokenDigitInputs`

- Arquivo: `src/features/auth/components/ValidateRegisterTokenForm/RegisterTokenDigitInputs/RegisterTokenDigitInputs.tsx`
- O que fazer:
  - Renderizar layout flex: `[input][input][input] - [input][input][input]` com hífen em `<span aria-hidden="true">`
  - 6× `Input` shadcn com `maxLength={1}`, `inputMode="numeric"`, `type="text"`, `autoComplete="one-time-code"` apenas no primeiro campo
  - Classe visual: derivar de `REGISTER_INPUT_CLASS_NAME` trocando `w-full px-4` por largura fixa centralizada (ex.: `w-11` ou `w-12`, `px-0`, `text-center`); extrair constante `REGISTER_TOKEN_DIGIT_INPUT_CLASS_NAME` em `CompanyRegisterForm/constants.ts` se reuso facilitar leitura
  - `useRef` array de 6 refs para controle de foco
  - `onChange` por dígito: montar novo array de slots, chamar `joinRegisterTokenDigits`, propagar via `onChange(formatted)`
  - `onKeyDown`: Backspace em slot vazio → `focus` no índice anterior; ArrowLeft/ArrowRight navegam entre campos
  - `onPaste` no grupo ou no primeiro input: `preventDefault`, aplicar `parseRegisterTokenPaste`, propagar valor, focar último dígito preenchido ou o 6º se completo
  - Sincronizar inputs a partir de `value` via `splitRegisterTokenDigits` (componente controlado)
  - Acessibilidade:
    - Container com `role="group"` e `aria-labelledby` apontando para o `Label` externo (id estável, ex. `register-token-label`)
    - Cada input com `aria-label` descritivo (`Dígito 1 de 6`, …, `Dígito 6 de 6`)
    - Primeiro input com `id` compatível com `htmlFor` do `Label` pai (`register-token-digit-1`)
    - Manter `aria-describedby` do hint quando fornecido
- Spec primeiro: já escrito no passo 2
- Depende de: Passos 1 e 2

### 4. Integrar no `ValidateRegisterTokenForm`

- Arquivo: `src/features/auth/components/ValidateRegisterTokenForm/ValidateRegisterTokenForm.tsx`
- O que fazer:
  - Substituir `Input` único por `<RegisterTokenDigitInputs />`
  - Manter `useForm` com campo `token`, `form.watch("token")`, `form.setValue("token", …)` e lógica de `isTokenComplete` / auto-submit via `useEffect` inalterada
  - Remover `handleTokenChange` do input único; delegar a callback que chama `setErrorDismissed(false)` + `form.setValue("token", formatted, { shouldValidate: true })`
  - Atualizar `Label` para `htmlFor="register-token-digit-1"` e `id="register-token-label"` no label
  - Ajustar texto do hint se necessário (remover referência a “formato 000-000” no placeholder; manter orientação de 6 dígitos no hint)
  - Não alterar overlays, redirect, sessionStorage ou hook
- Spec primeiro: Não aplicável (alteração coberta pelo spec existente do form)
- Depende de: Passo 3

### 5. Atualizar spec do formulário

- Arquivo: `src/features/auth/components/ValidateRegisterTokenForm/ValidateRegisterTokenForm.spec.tsx`
- O que fazer:
  - Remover/ajustar asserção de `placeholder="000-000"` (inexistente nos 6 inputs)
  - Substituir interações `user.type(input, "123456")` por paste no primeiro dígito ou digitação sequencial nos 6 campos
  - Manter asserções de auto-submit, erro, sucesso, redirect e não reenvio do mesmo token
  - Garantir que testes de limpar e redigitar token (cenário pós-erro) funcionem com os novos inputs
- Spec primeiro: Não aplicável (atualização de spec existente)
- Depende de: Passo 4

## Riscos / atenções

- Testes que digitam `"123456"` em um único campo podem falhar; preferir `user.paste` ou digitar dígito a dígito com `userEvent`
- `autoComplete="one-time-code"` no primeiro campo pode preencher apenas o primeiro input em alguns browsers; avaliar listener de `onChange` no primeiro campo para detectar entrada multi-dígito (fallback de autofill SMS)
- Classe `REGISTER_INPUT_CLASS_NAME` usa `w-full`; inputs de dígito precisam largura fixa para não quebrar layout do card
- Garantir que valor parcial (`"123"`, `"123-4"`) continue passando na validação Zod apenas quando completo (`^\d{3}-\d{3}$`) — auto-submit não deve disparar antes
- Não duplicar lógica de formatação no componente; centralizar em `registerToken.ts`
- Manter `lastSubmittedTokenRef` e fluxo de erro inalterados para evitar reenvio automático após falha

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
- [x] Imports seguem regra híbrida: relativo perto, alias longe
- [x] Sem `any` nos tipos, exceto justificativa explícita
- [x] Sem duplicação de DTO, schema, hook, service ou componente
- [x] `npm run test` sem erros quando aplicável
- [ ] `npm run lint` sem erros
- [x] `npm run build` sem erros
