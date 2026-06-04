# Rodando localmente

## Pré-requisitos

- Node.js 22+
- npm
- Git
- API backend (`mvp-clinicas-api`) rodando localmente ou apontando para staging

Recomendado no Windows: instalar Node via NVM for Windows para facilitar troca de versões.

---

## Criar projeto do zero

```bash
npx create-next-app@latest mvp-clinicas-web
```

Respostas recomendadas no assistente do Next:

```txt
TypeScript? Yes
ESLint? Yes
Tailwind CSS? Yes
src/ directory? Yes
App Router? Yes
Turbopack? Yes
React Compiler? No
Customize import alias? No
Include AGENTS.md? Yes
```

O alias padrão `@/*` será mantido.

---

## Instalar dependências do projeto

```bash
npm install @tanstack/react-query @tanstack/react-table react-hook-form zod @hookform/resolvers
npm install clsx tailwind-merge lucide-react
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui
npm install -D @playwright/test
```

Inicializar shadcn/ui:

```bash
npx shadcn@latest init
npx shadcn@latest add button input label form dialog select textarea badge card table dropdown-menu tabs alert sheet separator skeleton sonner
```

Instalar browser do Playwright:

```bash
npx playwright install --with-deps chromium
```

---

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Mock de autenticação (somente desenvolvimento/QA — nunca em produção)
AUTH_MOCK_ENABLED=true

QA_EMAIL=
QA_PASSWORD=
PLAYWRIGHT_BASE_URL=http://localhost:3001
```

### Mock de autenticação (`AUTH_MOCK_ENABLED`)

Com `AUTH_MOCK_ENABLED=true` no `.env.local`, o Route Handler `POST /api/auth/login` tenta a API NestJS normalmente. Se a chamada falhar (credenciais inválidas, API indisponível ou `API_URL` ausente), o servidor grava cookies mock (`accessToken` / `refreshToken`) e responde `{ ok: true, data: { user } }` — permitindo entrar na área autenticada sem backend integrado.

Fluxo resumido:

```txt
LoginForm → POST /api/auth/login → loginServerService (NestJS)
  → sucesso: cookies reais da API
  → falha + AUTH_MOCK_ENABLED=true: cookies mock + redirecionamento para /dashboard
```

`QA_EMAIL` e `QA_PASSWORD` são opcionais com mock ativo (qualquer email/senha válidos no formulário funcionam nos E2E). Use credenciais reais apenas quando testar contra API integrada com `AUTH_MOCK_ENABLED=false`.

Nunca commitar `.env.local`.

---

## Executar em desenvolvimento

```bash
npm install
npm run dev
```

Acesse:

```txt
http://localhost:3000
```

Se quiser evitar conflito com a API local em `3000`, configure o script e a URL do Playwright:

```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "start": "next start -p 3001"
  }
}
```

No `.env.local`, defina também:

```env
PLAYWRIGHT_BASE_URL=http://localhost:3001
```

Acesse então:

```txt
http://localhost:3001
```

---

## Build de produção

```bash
npm run build
npm run start
```

---

## Testes unitários e de componente

Vitest + Testing Library. Specs ficam junto ao código em `src/**/*.spec.tsx`.

```bash
npm run test
npm run test:watch
```

Interface visual do Vitest (opcional):

```bash
npx vitest --ui
```

Configuração: `vitest.config.ts` e `vitest.setup.ts` na raiz do projeto.

---

## Testes E2E

Playwright. Specs ficam em `e2e/`. Configuração: `playwright.config.ts` na raiz.

O Playwright sobe o servidor automaticamente via `webServer` (`npm run dev` localmente; `npm run start` em CI após build).

```bash
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:debug
npx playwright show-report .playwright/report
```

Em CI ou quando quiser validar build de produção antes dos E2E:

```bash
npm run build
npm run test:e2e
```

Variáveis necessárias para E2E autenticado:

```txt
QA_EMAIL
QA_PASSWORD
PLAYWRIGHT_BASE_URL   # padrão: http://localhost:3001
```

Artefatos gerados em `.playwright/` (auth, traces, relatório) — não versionados.

---

## MCP Playwright no Cursor

Para habilitar MCP Playwright no Cursor, adicione ao `settings.json`:

```json
{
  "mcp_servers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

---

## Lint e formatação

```bash
npm run lint
npx prettier --check .
npx prettier --write .
```

Prettier está instalado como devDependency; não há script `format` no `package.json` — use `npx prettier` diretamente ou adicione um script se preferir.

---

## Estrutura esperada

A estrutura de código nasce conforme as features forem implementadas pelos agentes.

Componentes compartilhados já disponíveis:

```txt
src/components/GlobalModal/   → modal de confirmação/feedback
src/components/Loader/        → overlay Loading
src/components/Table/         → DataTable (TanStack Table)
src/features/auth/            → login (referência de auth)
```

```txt
docs/
  api-contracts.md
  architecture.md
  decisions.md
  roadmap.md
  running-locally.md
.cursor/
  agents/
  skills/
  rules/
  hooks/
```
