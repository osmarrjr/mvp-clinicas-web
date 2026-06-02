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

## Tratamento de erro

Preferir tratamento por código semântico da API.

Exemplo:

```ts
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Email ou senha incorretos.',
  PATIENT_NOT_FOUND: 'Paciente não encontrado.',
  INVALID_STATUS_TRANSITION: 'Transição de status inválida.',
};
```

Nunca exibir o código técnico diretamente para o usuário.

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
