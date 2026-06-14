# Data Fetching, Services, Auth e Route Handlers

## Regra principal

Componentes não fazem chamadas HTTP diretamente para a API NestJS.

O fluxo deve passar por services.

---

## Services

Estrutura recomendada dentro da feature:

```txt
features/
  patients/
    services/
      patientsServerService.ts
      patientsClientService.ts
```

---

## Server Service

Usado por:

- Server Components;
- Route Handlers;
- funções server-side;
- busca inicial de dados.

Exemplo:

```ts
export async function getPatients() {
  const response = await apiClient.get('/patients');
  return response.data;
}
```

---

## Client Service

Usado por:

- Client Components;
- hooks com TanStack Query;
- mutações client-side.

Client Service deve chamar Route Handlers internos do Next.js quando a chamada exigir autenticação.

Exemplo:

```ts
export async function createPatient(input: CreatePatientInput) {
  const response = await fetch('/api/patients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Erro ao criar paciente.');
  }

  return response.json();
}
```

---

## Route Handlers

Usar Route Handlers quando:

- Client Component precisar acessar rota autenticada;
- for necessário ler cookies HTTP-only;
- for necessário intermediar chamada para API NestJS;
- for necessário proteger token do client.

Fluxo obrigatório:

```txt
Client Component
 ↓
Client Service
 ↓
Route Handler Next.js
 ↓
Server Service / API Client
 ↓
NestJS
```

---

## Autenticação

Referência implementada: `.cursor/skills/react/auth.md`.

Nunca usar:

- localStorage;
- sessionStorage;
- token em Context API;
- token em Zustand;
- variável global com token;
- token exposto para Client Component.

Sempre usar:

- cookies HTTP-only;
- leitura de sessão no servidor;
- Route Handler para intermediar chamadas autenticadas do client.

### Login (referência)

```txt
LoginForm → useLogin → authClientService → POST /api/auth/login → loginServerService → NestJS
```

Arquivos:

```txt
src/features/auth/hooks/useLogin.ts
src/features/auth/services/authClientService.ts
src/features/auth/services/authServerService.ts
src/app/api/auth/login/route.ts
```

O Route Handler grava cookies e retorna apenas `{ user }` ao client.

---

## Client Components não acessam token

Correto:

```txt
Client Component
 ↓
/api/patients
 ↓
Route Handler lê cookie HTTP-only
 ↓
NestJS
```

Errado:

```txt
Client Component
 ↓
useAuthToken / localStorage / context token
 ↓
NestJS
```

---

## API Client

O API client deve tratar o envelope da API:

```ts
{ ok: true, data: T }
{ ok: false, error: { code: string, message: string } }
```

Exemplo base:

```ts
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

---

## TanStack Query

Usar apenas em Client Components.

Utilizar para:

- cache client-side;
- mutações;
- invalidação;
- atualização client-side;
- revalidação após ações do usuário.

Não usar TanStack Query em Server Components.

---

## Query Keys

Padronizar query keys por feature.

Exemplos:

```ts
['patients']
['patients', patientId]

['appointments']
['appointments', appointmentId]

['staff']
['staff', staffId]
```

Evitar strings espalhadas pelo projeto.

---

## Mutações

Mutações devem invalidar queries relacionadas.

Exemplo:

```ts
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
```

---

## Feedback ao usuário (modais)

Toda chamada a endpoint no client deve informar status e mensagem da resposta.

Regra completa: `.cursor/rules/api-feedback-modals.mdc`.

Resumo:

- **Erro:** `GlobalModal type="error"` sempre.
- **Sucesso:** `GlobalModal type="success"` em POST, PATCH ou DELETE quando necessário.
- **Login:** sucesso redireciona; primeiro acesso exibe modal `warning` → `/change-password`; erro com modal.
- **GET:** sem modal de sucesso; atualizar dados na UI.
- Usar `Loading` durante `isPending` e `getErrorMessage()` para mensagens.

---

## Tratamento de erro

A API retorna `error.message` em português. O frontend repassa essa mensagem ao usuário via `getErrorMessage()`:

```ts
import { getErrorMessage } from '@/lib/api/error-messages';

// Usa error.message da API; fallback genérico se ausente
const message = getErrorMessage(response.error.message);
```

Nunca exibir o código técnico (`error.code`) diretamente ao usuário.

---

## Checklist de data fetching

- [ ] Componentes não fazem HTTP direto para API NestJS.
- [ ] Server Service usado no servidor.
- [ ] Client Service usado no client.
- [ ] Route Handler usado para chamada autenticada do client.
- [ ] Cookie HTTP-only preservado.
- [ ] Token não aparece no client.
- [ ] TanStack Query usado somente em Client Component.
- [ ] Query keys padronizadas.
- [ ] Mutações invalidam queries relacionadas.
- [ ] Erros tratados por mensagem amigável.
- [ ] Feedback de endpoint segue `.cursor/rules/api-feedback-modals.mdc`.
