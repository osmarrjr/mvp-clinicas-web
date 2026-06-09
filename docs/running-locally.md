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
```

Inicializar shadcn/ui:

```bash
npx shadcn@latest init
npx shadcn@latest add button input label form dialog select textarea badge card table dropdown-menu tabs alert sheet separator skeleton sonner
```

---

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
API_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

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

Se quiser evitar conflito com a API local em `3000`, configure o script:

```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "start": "next start -p 3001"
  }
}
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
