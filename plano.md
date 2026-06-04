# Plano: Landing page institucional

## Contexto

A rota raiz (`/`) redireciona hoje para `/login`. É necessária uma landing page pública que apresente o produto, com navegação por seções (Home, Quem Somos, Funcionalidades, Suporte, Planos) e CTA para cadastro em `/register`.

## Validação arquitetural

- Feature: nova (`landing`)
- Reutiliza componente existente: sim (`Button`, `Card`, `Badge`, `Sheet` shadcn/ui; logo `/loading-logo.svg`; `CLINIC_PLAN_OPTIONS`)
- Reutiliza GlobalModal / Loading / DataTable: não aplicável
- Reutiliza hook existente: não
- Reutiliza service existente: não
- Reutiliza schema existente: não
- Reutiliza tipos existentes: sim (`ClinicPlanOption` via constantes de planos)
- Usa shadcn/ui ou componente existente: sim
- Exige novo componente shadcn/ui: não
- Há impacto em autenticação: não
- Há impacto em permissões/RBAC: não
- Há impacto em contrato de API: não
- Há impacto em Route Handler: não
- Exige teste unitário/componente: não
- Exige teste E2E: sim (smoke da landing e link para cadastro)

## Páginas/componentes afetados

- `src/app/page.tsx`
- `src/features/landing/components/LandingPage.tsx` (criar)
- `src/features/landing/components/LandingHeader.tsx` (criar)
- `e2e/landing/home.spec.ts` (criar)

## Contrato de API utilizado

Nenhum.

## Dependências/configurações necessárias

Nenhuma.

## Estratégia de testes

- Unitário/componente: Não aplicável
- E2E: `e2e/landing/home.spec.ts`
- Cenários principais:
  - `/` exibe landing com header e seções principais
  - Links de navegação apontam para âncoras corretas
  - CTA de planos redireciona para `/register`

## Passos de implementação

### 1. Header fixo com navegação

- Arquivo: `src/features/landing/components/LandingHeader.tsx`
- O que fazer: Logo à esquerda; links Home, Quem Somos, Funcionalidades, Suporte, Planos; menu mobile com `Sheet`; header sticky com blur; âncoras `#home`, `#quem-somos`, `#funcionalidades`, `#suporte`, `#planos`.
- Spec primeiro: Não aplicável
- Depende de: Nenhum

### 2. Página landing com seções

- Arquivo: `src/features/landing/components/LandingPage.tsx`
- O que fazer:
  - **Home**: hero com texto institucional solicitado e CTA secundário para planos.
  - **Quem Somos**: texto sobre missão e valores.
  - **Funcionalidades**: cards baseados nas features de `CLINIC_PLAN_OPTIONS` (agenda, prontuário, financeiro, relatórios, integrações, etc.).
  - **Suporte**: e-mail `suporte@mvpclinicas.com.br` e WhatsApp `(11) 98765-4321`.
  - **Planos**: prévia dos 3 planos reutilizando `CLINIC_PLAN_OPTIONS`; texto amigável com link/botão para `/register`.
  - Visual alinhado ao gradiente azul do fluxo de auth; responsivo mobile-first.
- Spec primeiro: Não aplicável
- Depende de: Passo 1

### 3. Substituir redirect na home

- Arquivo: `src/app/page.tsx`
- O que fazer: Renderizar `LandingPage` em vez de `redirect("/login")`; metadata descritiva.
- Spec primeiro: Não aplicável
- Depende de: Passo 2

### 4. Teste E2E smoke

- Arquivo: `e2e/landing/home.spec.ts`
- O que fazer: Validar título/hero, presença das seções e navegação para `/register`.
- Spec primeiro: `e2e/landing/home.spec.ts`
- Depende de: Passo 3

## Riscos / atenções

- Manter `/login` e `/register` inalterados; landing é rota pública adicional.
- Reutilizar `CLINIC_PLAN_OPTIONS` para evitar divergência com tela de cadastro.
- Acessibilidade: nav com `aria-label`, links de âncora descritivos, contraste no hero.
- Scroll suave via `scroll-smooth` no container da página.

## Checklist final

- [ ] Specs E2E escritas e passando quando aplicável
- [ ] shadcn/ui priorizado quando houver UI
- [ ] Acessibilidade considerada em navegação e CTAs
- [ ] Imports seguem regra híbrida
- [ ] `npm run lint` sem erros
- [ ] `npm run build` sem erros
