# Plano: Ajustar formulário de cadastro de empresa (CompanyRegisterForm)

## Contexto

O formulário de cadastro em `CompanyRegisterForm.tsx` precisa alinhar placeholders, máscaras, limites de caracteres e regras de validação aos requisitos de negócio (nome, CPF/CNPJ, email, telefone, senha e confirmação de senha). O schema Zod e os validators em `src/lib/validators/` devem ser a fonte de verdade; a UI exibe feedback progressivo (mensagens de senha uma por vez, barra de força e confirmação de senha). Estado e cidade permanecem inalterados.

## Validação arquitetural

- Feature: existente (`auth`)
- Reutiliza componente existente: sim (`Input`, `Label`, `Button`, `Card`, `Tooltip`, `SearchableSelect`, `GlobalModal`, `Loading`, `PlanSelectionStep`)
- Reutiliza GlobalModal / Loading / DataTable: sim (`GlobalModal`, `Loading`; `DataTable` não aplicável)
- Reutiliza hook existente: sim (`useCompanyRegister`, `useIbgeLocations`)
- Reutiliza service existente: sim (`registerClientService`, `registerServerService` — sem enviar `phone` ao backend por enquanto)
- Reutiliza schema existente: sim (estender `companyRegisterSchema`)
- Reutiliza tipos existentes: sim (`CompanyRegisterFormValues`, `ClinicPlan`, `RegisterClinicDto`)
- Usa shadcn/ui ou componente existente: sim (`Input`, `Label`, `Button`, `Tooltip`)
- Exige novo componente shadcn/ui: não (barra de força com `div` + Tailwind; `Progress` do shadcn é opcional se a barra customizada não atender acessibilidade)
- Há impacto em autenticação: sim (fluxo de registro; validação reforçada de senha)
- Há impacto em permissões/RBAC: não
- Há impacto em contrato de API: não (campo `phone` coletado na UI; `docs/api-contracts.md` marca `phone` como pendente no `RegisterClinicDto`)
- Há impacto em Route Handler: sim (validação server-side via `companyRegisterSchema` em `POST /api/auth/register`)
- Exige teste unitário/componente: sim

## Páginas/componentes afetados

- `src/features/auth/schemas/companyRegisterSchema.ts`
- `src/features/auth/schemas/companyRegisterSchema.spec.ts`
- `src/lib/validators/password.ts`
- `src/lib/validators/password.spec.ts`
- `src/lib/validators/cpfCnpj.ts` (ajuste de uso — somente dígitos no cadastro)
- `src/lib/validators/phone.ts` (criar)
- `src/lib/validators/phone.spec.ts` (criar)
- `src/lib/validators/email.ts` (criar — validação customizada)
- `src/lib/validators/email.spec.ts` (criar)
- `src/lib/validators/companyName.ts` (criar — capitalize e regras de nome)
- `src/lib/validators/companyName.spec.ts` (criar)
- `src/features/auth/components/CompanyRegisterForm.tsx`
- `src/features/auth/components/CompanyRegisterForm.spec.tsx`
- `src/features/auth/components/RegisterPasswordField.tsx` (criar)
- `src/features/auth/components/RegisterPasswordField.spec.tsx` (criar)
- `src/features/auth/components/RegisterConfirmPasswordField.tsx` (criar)
- `src/features/auth/components/RegisterConfirmPasswordField.spec.tsx` (criar)
- `src/features/auth/components/RegisterPhoneField.tsx` (criar)
- `src/features/auth/components/RegisterPhoneField.spec.tsx` (criar)

## Contrato de API utilizado

- `POST /auth/register-admin` (via `POST /api/auth/register`) — campos enviados: `clinicName`, `taxId` (dígitos), `taxIdType`, `stateUf`, `city`, `cityIbgeId`, `email`, `password`, `plan`
- `phone` e `confirmPassword` **não** são enviados ao backend nesta entrega (coleta/validação apenas na UI e no schema do Route Handler)

## Dependências/configurações necessárias

- Nenhuma dependência npm nova
- Lista estática de senhas comuns em `src/lib/validators/password.ts` (ex.: `12345678`, `password`, `senha123`, etc.)
- Lista de DDDs válidos do Brasil em `src/lib/validators/phone.ts`
- Constante `VALID_BRAZILIAN_DDDS` reutilizável nos testes

## Estratégia de testes

- Unitário/componente: validators (`password`, `phone`, `email`, `companyName`), `companyRegisterSchema.spec.ts`, subcomponentes de campo, `CompanyRegisterForm.spec.tsx`
- Cenários principais:
  - Nome: obrigatório, mín. 5, máx. 70, primeira letra maiúscula
  - CPF/CNPJ: obrigatório, 11 ou 14 dígitos, máscara correta, rejeição de letras e dígitos inválidos
  - Email: regras customizadas (@ central, ponto após @, sem espaços/@@)
  - Telefone: máscara fixo/celular, DDD válido, 11º dígito = 9 quando 11 dígitos
  - Senha: mensagens sequenciais na UI, barra de força (fraca/média/forte), bloqueio de senha comum e dados pessoais (nome, CPF, CNPJ)
  - Confirmar senha: mensagem "As senhas não conferem" / "Senhas conferem" (sempre vermelho)
  - Formulário: renderiza novos campos após seleção de plano; submit permanece desabilitado quando inválido
  - Route Handler continua rejeitando payload inválido (schema expandido)

## Passos de implementação

### 1. Validators de nome, email e telefone

- Arquivo: `src/lib/validators/companyName.ts`, `src/lib/validators/email.ts`, `src/lib/validators/phone.ts`
- O que fazer:
  - `companyName.ts`: `capitalizeFirstLetter(value)`, `getCompanyNameValidationError(value)` — obrigatório, min 5, max 70, primeira letra maiúscula (`/^[A-ZÀ-ÿ]/`)
  - `email.ts`: `getEmailValidationError(value)` — obrigatório, max 70, tem `@`, não inicia/termina com `@`, parte local e domínio não vazias, pelo menos um `.` após `@`, sem espaços, sem `@@`
  - `phone.ts`: `stripPhoneDigits`, `formatPhone` (fixo `(99) 9999-9999`, celular `(99) 99999-9999`), `isValidBrazilianDdd`, `getPhoneValidationError(value)` — obrigatório, 10 ou 11 dígitos, DDD na lista válida, se 11 dígitos o 3º dígito (índice 2) deve ser `9`
- Spec primeiro: `src/lib/validators/companyName.spec.ts`, `email.spec.ts`, `phone.spec.ts`
- Depende de: Nenhum

### 2. Estender validators de senha

- Arquivo: `src/lib/validators/password.ts`
- O que fazer:
  - Atualizar `PASSWORD_REQUIREMENTS_TOOLTIP` para refletir requisitos completos (mín. 8, letras+números, maiúscula, especial, máx. 20)
  - `getPasswordHintMessage(password, context?)` — retorna **uma** mensagem por prioridade (para UI, não para submit):
    1. `"Senha deve ter no mínimo 8 dígitos"` (se vazio: `"Senha é obrigatória."`)
    2. `"Senha deve possuir letras e números"`
    3. `"Senha deve possuir pelo menos uma letra maiúscula"`
    4. `"Senha deve possuir pelo menos um caractere especial"`
    5. `"Senha comum, escolha uma senha mais segura"`
    6. `"Senha não pode conter nome, CPF e CNPJ"` (recebe `companyName` e `taxId` normalizados)
  - `getPasswordValidationError(password, context?)` — usa as mesmas regras para bloquear submit (mensagens alinhadas ao hint)
  - `getPasswordStrength(password)` — retorna `{ score: 0-100, label: 'fraca' | 'media' | 'forte' }`; exibir barra somente com 8+ caracteres; faixas: 0–30% vermelho, 31–80% amarelo, 81–100% verde
  - `isCommonPassword(password)` — lista estática normalizada (lowercase)
  - `passwordContainsPersonalData(password, { companyName, taxId })` — verifica substrings do nome (case-insensitive, palavras ≥ 3 chars) e dígitos de CPF/CNPJ
  - `.max(20)` aplicado no schema, não no validator isolado
- Spec primeiro: atualizar `src/lib/validators/password.spec.ts`
- Depende de: Nenhum

### 3. Atualizar schema Zod do cadastro

- Arquivo: `src/features/auth/schemas/companyRegisterSchema.ts`
- O que fazer:
  - `companyName`: usar `getCompanyNameValidationError` via `superRefine`; `.max(70)`
  - `taxId`: **somente dígitos** (11 CPF ou 14 CNPJ); remover ramo alfanumérico de CNPJ neste formulário; usar `stripDigits` + `isValidCpf`/`isValidCnpj`; mensagens: obrigatório, incompleto, inválido
  - `email`: `getEmailValidationError`; `.max(70)`
  - `phone`: `getPhoneValidationError`; armazenar valor mascarado ou só dígitos (preferir dígitos no estado do form, máscara só na UI — alinhar ao padrão de `taxId`)
  - `password`: `getPasswordValidationError` com contexto (`companyName`, `taxId`); `.max(20, "...")`
  - `confirmPassword`: obrigatório, `.max(20)`; `refine` em nível de objeto: `password === confirmPassword` com mensagem `"As senhas não conferem"`
  - Manter `stateUf`, `city`, `cityIbgeId`, `plan` inalterados
- Spec primeiro: atualizar `src/features/auth/schemas/companyRegisterSchema.spec.ts` (ajustar `validBase` com `phone`, `confirmPassword`, nome com 5+ chars; cobrir novas rejeições)
- Depende de: passos 1 e 2

### 4. Subcomponente RegisterPhoneField

- Arquivo: `src/features/auth/components/RegisterPhoneField.tsx`
- O que fazer:
  - Props: `control`/`register` do RHF, `errors`, `inputClassName`
  - Label "Telefone", placeholder `(00) 00000-0000`, `maxLength` compatível com máscara (15 chars)
  - `onChange` aplica `formatPhone(stripPhoneDigits(value))` com `setValue` + `shouldValidate: true`
  - Mensagem de erro do schema com `role="alert"`
  - `aria-invalid` quando houver erro
- Spec primeiro: `src/features/auth/components/RegisterPhoneField.spec.tsx`
- Depende de: passo 3

### 5. Subcomponente RegisterPasswordField

- Arquivo: `src/features/auth/components/RegisterPasswordField.tsx`
- O que fazer:
  - Props: `form` (ou `control` + `watch`), `companyName`, `taxId`, `inputClassName`, `showPassword` toggle
  - Placeholder: `"Crie sua senha de acessos"`, `maxLength={20}`, tooltip com `PASSWORD_REQUIREMENTS_TOOLTIP`
  - Exibir **uma** mensagem de hint (`getPasswordHintMessage`) abaixo do campo, antes da barra
  - Barra de força (`getPasswordStrength`) visível apenas com senha ≥ 8 caracteres; cores: vermelho/amarelo/verde conforme faixas; `role="progressbar"` com `aria-valuenow`, `aria-valuemin`, `aria-valuemax` e label acessível
  - Erro de schema (`form.formState.errors.password`) abaixo da barra, com `role="alert"`
  - Botão mostrar/ocultar senha (reutilizar padrão atual)
- Spec primeiro: `src/features/auth/components/RegisterPasswordField.spec.tsx`
- Depende de: passo 2

### 6. Subcomponente RegisterConfirmPasswordField

- Arquivo: `src/features/auth/components/RegisterConfirmPasswordField.tsx`
- O que fazer:
  - Placeholder: `"Confirme sua senha"`, `maxLength={20}`, toggle de visibilidade opcional (mesmo padrão da senha)
  - Feedback em tempo real (não depende só do erro Zod): se `confirmPassword` preenchido, exibir `"Senhas conferem"` ou `"As senhas não conferem"` — **sempre** com classe vermelha (`text-red-200`), conforme requisito
  - Erro de schema no submit com `role="alert"`
- Spec primeiro: `src/features/auth/components/RegisterConfirmPasswordField.spec.tsx`
- Depende de: passo 3

### 7. Refatorar CompanyRegisterForm

- Arquivo: `src/features/auth/components/CompanyRegisterForm.tsx`
- O que fazer:
  - Adicionar `defaultValues`: `phone: ""`, `confirmPassword: ""`
  - Atualizar placeholders e `maxLength` nos campos existentes:
    - `companyName`: `"Digite o nome da empresa, pessoa física ou razão social"`; `onBlur` aplicar `capitalizeFirstLetter`; `maxLength={70}`
    - `taxId`: `"Digite o cpf/cnpj da empresa ou pessoa física"`; manter máscara via `formatTaxId` com entrada somente numérica (`stripDigits` antes de formatar)
    - `email`: placeholder `contato@empresa.com`, `maxLength={70}`
  - Inserir `RegisterPhoneField` após email
  - Substituir bloco de senha por `RegisterPasswordField` e `RegisterConfirmPasswordField`
  - Estado/cidade: sem alteração de comportamento
  - Passar `companyName` e `taxId` (watch) para validação contextual da senha
  - Manter `mode: "onChange"`, `isSubmitDisabled` e fluxo de planos/modais
- Spec primeiro: atualizar `src/features/auth/components/CompanyRegisterForm.spec.tsx`
- Depende de: passos 4, 5 e 6

### 8. Garantir mapeamento para API inalterado

- Arquivo: `src/features/auth/services/registerServerService.ts`
- O que fazer: confirmar que `toRegisterClinicDto` **não** inclui `phone` nem `confirmPassword`; `taxId` continua com `stripDigits`; `clinicName` recebe `companyName`
- Spec primeiro: Não aplicável (sem spec existente; validar via `companyRegisterSchema` + teste manual)
- Depende de: passo 3

## Riscos / atenções

- **CPF/CNPJ alfanumérico**: o validator atual suporta CNPJ com letras (nova regra Receita); o requisito pede somente números — simplificar apenas no cadastro, sem remover suporte global em `cpfCnpj.ts` se usado em outros fluxos
- **Telefone sem backend**: campo validado e coletado, mas não persistido até o contrato `RegisterClinicDto` incluir `phone`
- **Mensagens de senha na UI vs schema**: hints progressivos são responsabilidade do componente; submit bloqueado pelo schema com as mesmas regras
- **"Senhas conferem" em vermelho**: requisito explícito do usuário; não usar verde para feedback positivo
- **Força da senha**: definir algoritmo determinístico e documentado nos testes (comprimento, classes de caractere, penalidades) para evitar flutuação entre implementações
- **Tamanho do formulário**: extrair subcomponentes evita regressão e facilita testes; não mover validação para os componentes
- **Confirmação de senha no Route Handler**: o body JSON do client incluirá `confirmPassword`; o schema deve validar; o service server ignora o campo extra
- **Acessibilidade**: barra de força com `role="progressbar"`; mensagens com `role="alert"`; labels associados via `htmlFor`

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
- [x] `npm run lint` sem erros nos arquivos do plano (escopado: 0 erros; global: erros pré-existentes fora do escopo em `.cursor/hooks`, `Table/index.tsx`, `useIbgeLocations.ts`)
- [x] `npm run build` sem erros
