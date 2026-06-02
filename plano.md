# Plano: Criar nova tela pública de login

## Contexto

A aplicação ainda não possui fluxo de autenticação implementado e precisa de uma tela pública de login para permitir o acesso de usuários existentes. Esta tarefa define a base de autenticação com formulário de email e senha obrigatórios, validação client-side e integração com o contrato oficial da API. O objetivo é garantir UX adequada (botão desabilitado até o formulário válido) e aderência arquitetural para segurança com cookies HTTP-only.

## Validação arquitetural

- Feature: nova
- Reutiliza componente existente: sim
- Reutiliza hook existente: não aplicável
- Reutiliza service existente: não aplicável
- Reutiliza schema existente: não aplicável
- Reutiliza tipos existentes: não aplicável
- Usa shadcn/ui ou componente existente: sim
- Exige novo componente shadcn/ui: sim
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
- `src/app/api/auth/login/route.ts`

## Contrato de API utilizado

- `POST /auth/login`

## Dependências/configurações necessárias

- Adicionar componente shadcn/ui de formulário (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`) caso `src/components/ui/form.tsx` ainda não exista.

## Estratégia de testes

- Unitário/componente: `src/features/auth/components/LoginForm.spec.tsx`
- E2E: `e2e/auth/login.spec.ts`
- Cenários principais:
  - Renderiza os campos obrigatórios `email` e `senha` e exibe a frase "Ainda não possui um cadastro? Clique aqui".
  - Mantém o botão de login desabilitado enquanto houver campos vazios ou inválidos.
  - Habilita o botão quando email e senha estiverem válidos e dispara submit para o fluxo de login.
  - Exibe feedback de erro amigável quando a API retornar `INVALID_CREDENTIALS`.
  - Fluxo E2E de login válido redireciona para área autenticada.

## Passos de implementação

### 1. Definir spec e schema de validação do login

- Arquivo: `src/features/auth/schemas/loginSchema.ts`
- O que fazer: criar schema Zod com `email` válido e `password` obrigatório, exportando tipo inferido para o formulário.
- Spec primeiro: `src/features/auth/components/LoginForm.spec.tsx`
- Depende de: Nenhum

### 2. Criar service client e Route Handler de autenticação

- Arquivo: `src/features/auth/services/authClientService.ts`
- O que fazer: criar client service que chama `POST /api/auth/login` (interno do Next) para evitar chamada autenticada direta à API NestJS no client.
- Spec primeiro: `src/features/auth/services/authClientService.spec.ts`
- Depende de: 1. Definir spec e schema de validação do login

### 3. Implementar Route Handler para proxy do contrato de login

- Arquivo: `src/app/api/auth/login/route.ts`
- O que fazer: receber `email` e `password`, chamar `POST /auth/login` no backend conforme `docs/api-contracts.md`, tratar envelope `{ ok, data/error }` e persistir tokens em cookie HTTP-only.
- Spec primeiro: `src/app/api/auth/login/route.spec.ts`
- Depende de: 2. Criar service client e Route Handler de autenticação

### 4. Construir componente de formulário de login

- Arquivo: `src/features/auth/components/LoginForm.tsx`
- O que fazer: implementar Client Component com React Hook Form + Zod resolver, campos obrigatórios de email/senha, botão desabilitado por estado de validade/preenchimento e frase solicitada abaixo do botão.
- Spec primeiro: `src/features/auth/components/LoginForm.spec.tsx`
- Depende de: 1. Definir spec e schema de validação do login

### 5. Criar página pública de login no App Router

- Arquivo: `src/app/(auth)/login/page.tsx`
- O que fazer: criar página pública (sem gate de autenticação prévia) como camada fina para renderizar o `LoginForm`.
- Spec primeiro: `Não aplicável`
- Depende de: 4. Construir componente de formulário de login

### 6. Cobrir fluxo funcional ponta a ponta

- Arquivo: `e2e/auth/login.spec.ts`
- O que fazer: validar fluxo público da tela, estados do botão, validações dos campos, mensagem fixa abaixo do botão e sucesso/erro do login.
- Spec primeiro: `e2e/auth/login.spec.ts`
- Depende de: 5. Criar página pública de login no App Router

## Riscos / atenções

- Garantir que tokens de login sejam gravados apenas em cookies HTTP-only no Route Handler, sem exposição em Client Component.
- Evitar duplicação de validação entre schema e componente; toda regra de campos deve ficar no Zod.
- Confirmar mapeamento de erro semântico `INVALID_CREDENTIALS` para mensagem amigável ao usuário.
- Se o componente `form` do shadcn/ui não existir, sua ausência pode atrasar a implementação do padrão de formulário acessível.
- Garantir acessibilidade mínima: labels associadas, erros próximos aos campos e botão com estado disabled sem perder contraste visual.

## Checklist final

- [ ] Specs unitárias/componentes escritas e passando quando aplicável
- [ ] Specs E2E escritas e passando quando aplicável
- [ ] Componente sem lógica de negócio: delega a hooks/services
- [ ] Tipos derivados dos contratos em `src/lib/api/types.ts`
- [ ] Estados de loading, erro e vazio tratados na UI
- [ ] Client Components não acessam token
- [ ] Route Handler usado para chamadas autenticadas do client
- [ ] shadcn/ui ou componente existente priorizado quando houver UI
- [ ] Acessibilidade considerada em formulários, botões, mensagens e navegação
- [ ] Imports seguem regra híbrida: relativo perto, alias longe
- [ ] Sem `any` nos tipos, exceto justificativa explícita
- [ ] Sem duplicação de DTO, schema, hook, service ou componente
- [ ] `npm run test` sem erros quando aplicável
- [ ] `npm run test:e2e` sem erros quando aplicável
- [ ] `npm run lint` sem erros
- [ ] `npm run build` sem erros
