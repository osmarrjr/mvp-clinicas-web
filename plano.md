# Plano: Nova tela de login pública

## Contexto

A demanda cria o fluxo inicial de autenticação por email e senha para entrada no sistema. A tela deve ser pública, com validação obrigatória dos campos e controle de estado do botão para evitar submissões inválidas. O login precisa usar o contrato oficial da API e preservar a arquitetura de segurança com cookies HTTP-only via Route Handler.

## Validação arquitetural

- Feature: nova
- Reutiliza componente existente: sim
- Reutiliza hook existente: não
- Reutiliza service existente: não
- Reutiliza schema existente: não
- Reutiliza tipos existentes: sim
- Usa shadcn/ui ou componente existente: sim
- Exige novo componente shadcn/ui: não
- Há impacto em autenticação: sim
- Há impacto em permissões/RBAC: não
- Há impacto em contrato de API: não
- Há impacto em Route Handler: sim
- Exige teste unitário/componente: sim
- Exige teste E2E: sim

## Páginas/componentes afetados

- `src/app/(auth)/login/page.tsx`
- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/schemas/loginSchema.ts`
- `src/features/auth/services/authClientService.ts`
- `src/features/auth/services/authServerService.ts`
- `src/features/auth/hooks/useLogin.ts`
- `src/app/api/auth/login/route.ts`

## Contrato de API utilizado

- `POST /auth/login`

## Dependências/configurações necessárias

- Reutilizar componentes shadcn/ui já disponíveis: `button`, `input`, `label`, `card`, `alert`.
- Se o componente `form` do shadcn/ui ainda não estiver no projeto, registrar adição via `npx shadcn@latest add form`.

## Estratégia de testes

- Unitário/componente: `src/features/auth/schemas/loginSchema.spec.ts` e `src/features/auth/components/LoginForm.spec.tsx`
- E2E: `e2e/auth/login.spec.ts`
- Cenários principais:
  - Renderiza tela pública com campos obrigatórios e texto "Ainda não possui um cadastro? Clique aqui".
  - Botão de login permanece desabilitado até email válido e senha preenchida.
  - Submissão válida chama fluxo de login e trata erro semântico `INVALID_CREDENTIALS`.

## Passos de implementação

### 1. Definir contrato do formulário de login

- Arquivo: `src/features/auth/schemas/loginSchema.ts`
- O que fazer: criar schema Zod com `email` obrigatório e formato válido, `password` obrigatória, mensagens em português e tipo inferido para o formulário.
- Spec primeiro: `src/features/auth/schemas/loginSchema.spec.ts`
- Depende de: Nenhum

### 2. Implementar serviços de autenticação

- Arquivo: `src/features/auth/services/authServerService.ts` e `src/features/auth/services/authClientService.ts`
- O que fazer: criar service server para chamar `POST /auth/login` com envelope `{ ok, data/error }` e service client para chamar `POST /api/auth/login` sem expor token no client.
- Spec primeiro: `Não aplicável`
- Depende de: 1. Definir contrato do formulário de login

### 3. Criar Route Handler de login

- Arquivo: `src/app/api/auth/login/route.ts`
- O que fazer: receber payload do formulário, chamar server service, mapear erros semânticos e persistir `accessToken`/`refreshToken` em cookies HTTP-only.
- Spec primeiro: `Não aplicável`
- Depende de: 2. Implementar serviços de autenticação

### 4. Criar hook de login no client

- Arquivo: `src/features/auth/hooks/useLogin.ts`
- O que fazer: implementar mutation de login com estado de envio, tratamento de sucesso/erro e API simples para o formulário.
- Spec primeiro: `Não aplicável`
- Depende de: 2. Implementar serviços de autenticação

### 5. Construir componente LoginForm

- Arquivo: `src/features/auth/components/LoginForm.tsx`
- O que fazer: criar Client Component com React Hook Form + zodResolver, campos email/senha obrigatórios, botão desabilitado enquanto inválido ou enviando, e texto abaixo do botão: "Ainda não possui um cadastro? Clique aqui".
- Spec primeiro: `src/features/auth/components/LoginForm.spec.tsx`
- Depende de: 1. Definir contrato do formulário de login

### 6. Criar página pública de login

- Arquivo: `src/app/(auth)/login/page.tsx`
- O que fazer: criar página fina que renderiza o `LoginForm` em layout público sem exigir autenticação prévia.
- Spec primeiro: `Não aplicável`
- Depende de: 5. Construir componente LoginForm

### 7. Cobrir fluxo com E2E

- Arquivo: `e2e/auth/login.spec.ts`
- O que fazer: validar acesso público à rota, regras de habilitação do botão, submissão com sucesso e exibição de erro amigável em credenciais inválidas.
- Spec primeiro: `e2e/auth/login.spec.ts`
- Depende de: 6. Criar página pública de login

## Riscos / atenções

- Garantir que o Client Component não faça chamada autenticada direta ao backend NestJS; o fluxo deve passar por Route Handler.
- Evitar duplicação de schemas/services caso a feature `auth` já receba novos artefatos em paralelo.
- Tratar acessibilidade dos campos e mensagens de erro (labels, foco visível, feedback claro).

## Checklist final

- [x] Specs unitárias/componentes escritas e passando quando aplicável
- [ ] Specs E2E escritas e passando quando aplicável
- [x] Componente sem lógica de negócio: delega a hooks/services
- [ ] Tipos derivados dos contratos em `src/lib/api/types.ts`
- [x] Estados de loading, erro e vazio tratados na UI
- [x] Client Components não acessam token
- [x] Route Handler usado para chamadas autenticadas do client
- [x] shadcn/ui ou componente existente priorizado quando houver UI
- [x] Acessibilidade considerada em formulários, botões, mensagens e navegação
- [x] Imports seguem regra híbrida: relativo perto, alias longe
- [x] Sem `any` nos tipos, exceto justificativa explícita
- [x] Sem duplicação de DTO, schema, hook, service ou componente
- [x] `npm run test` sem erros quando aplicável
- [ ] `npm run test:e2e` sem erros quando aplicável
- [ ] `npm run lint` sem erros
- [x] `npm run build` sem erros
