# Decisões Técnicas — MVP Clínicas Web

## Token em cookie HTTP-only

`accessToken` e `refreshToken`, quando usados no frontend, devem ser salvos em cookie HTTP-only.

O frontend nunca deve ler token via:

- `document.cookie`;
- `localStorage`;
- `sessionStorage`;
- Context API;
- Zustand ou store global client-side.

Client Components não acessam token. Quando um Client Component precisar consumir rota autenticada, ele deve chamar um Route Handler interno do Next.js, que lerá o cookie HTTP-only no servidor.

---

## Route Handler como fronteira de autenticação do client

Chamadas autenticadas iniciadas no client seguem o fluxo:

```txt
Client Component
 ↓
Client Service
 ↓
Route Handler Next.js
 ↓
API NestJS
```

Essa decisão evita expor tokens ao JavaScript do navegador.

---

## Server Components por padrão

Preferimos Server Components para reduzir o bundle de JavaScript enviado ao cliente e executar fetch inicial no servidor.

Usar `'use client'` somente quando houver:

- estado local;
- eventos;
- formulários;
- browser APIs;
- TanStack Query;
- modais ou filtros interativos.

---

## TanStack Query somente em Client Components

Data fetching inicial em Server Components deve ser feito via services server-side.

TanStack Query deve ser usado apenas em Client Components para:

- mutações;
- cache client-side;
- revalidação;
- optimistic updates;
- invalidação após ação do usuário.

---

## Tipos derivados de `docs/api-contracts.md`

Todos os tipos TypeScript do frontend devem derivar dos contratos documentados em `docs/api-contracts.md`.

Tipos compartilhados ficam em:

```txt
src/lib/api/types.ts
```

Tipos específicos de domínio, quando necessários, ficam em:

```txt
src/features/<feature>/types.ts
```

Nunca redefinir localmente tipos que já existem em `src/lib/api/types.ts`.

---

## Tratamento de erros por código semântico

A API retorna erros no formato:

```ts
{ ok: false, error: { code: string, message: string } }
```

O frontend deve mapear `code` para mensagens amigáveis em português em arquivo central, por exemplo:

```txt
src/lib/api/error-messages.ts
```

Nunca exibir o `code` técnico diretamente ao usuário.

---

## Formulários com React Hook Form + Zod

Todo formulário deve usar React Hook Form + Zod.

O schema Zod deve ser separado do componente e ser a fonte de verdade da validação.

---

## shadcn/ui como base de UI

Sempre que possível, componentes visuais devem partir de:

1. componente já existente em `src/components/ui`;
2. componente shadcn/ui adicionado ao projeto;
3. componente próprio, somente quando não houver equivalente adequado.

Não recriar manualmente `Button`, `Input`, `Dialog`, `Select`, `Card`, `Table` ou equivalentes se o shadcn/ui atender.

---

## Política híbrida de imports

Imports próximos usam caminho relativo:

```ts
import { patientSchema } from '../schemas/patientSchema';
import { PatientForm } from './PatientForm';
```

Imports fora da área imediata usam alias `@/`:

```ts
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/client';
```

Evitar tanto alias para arquivo vizinho quanto caminho relativo profundo.
