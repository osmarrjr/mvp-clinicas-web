# Autenticação — referência da feature Auth

## Objetivo

Documentar o padrão implementado na feature `auth`, usado como referência para login, Route Handlers de autenticação e proteção de sessão.

Leia este arquivo quando a tarefa envolver login, logout, cookies de sessão, Route Handler em `/api/auth/*` ou fluxo autenticado no client.

---

## Estrutura da feature

```txt
src/features/auth/
  components/
    LoginForm.tsx
    LoginForm.spec.tsx
  hooks/
    useLogin.ts
  schemas/
    loginSchema.ts
    loginSchema.spec.ts
  services/
    authClientService.ts
    authServerService.ts

src/app/
  (auth)/login/page.tsx
  api/auth/login/route.ts
```

---

## Fluxo de login (implementado)

```txt
LoginForm (Client Component)
 ↓ useLogin()
 ↓ authClientService()
 ↓ POST /api/auth/login (Route Handler)
 ↓ loginServerService()
 ↓ POST {API_URL}/auth/login (NestJS)
 ↓ Route Handler grava accessToken e refreshToken em cookies HTTP-only
 ↓ resposta ao client: { ok: true, data: { user } } — sem tokens no body
```

Regras:

- O client **nunca** recebe `accessToken` ou `refreshToken` no JSON de resposta.
- Cookies são definidos pelo Route Handler com `httpOnly: true`.
- Validação de payload usa o mesmo `loginSchema` no Route Handler e no formulário.

---

## Schema

```txt
src/features/auth/schemas/loginSchema.ts
```

Campos:

- `email` — obrigatório, formato email;
- `password` — obrigatório.

Tipo inferido: `LoginFormValues`.

---

## Services

### Server Service

```txt
src/features/auth/services/authServerService.ts
```

- Marcado com `"server-only"`.
- Chama `POST ${API_URL}/auth/login`.
- Retorna envelope tipado `LoginServerResponse` (`ok: true | false`).
- Trata erres de rede, env ausente e resposta inválida.

### Client Service

```txt
src/features/auth/services/authClientService.ts
```

- Chama `POST /api/auth/login` (Route Handler interno).
- Não acessa token nem cookie.
- Retorna o mesmo envelope `LoginServerResponse`.

---

## Hook

```txt
src/features/auth/hooks/useLogin.ts
```

Responsabilidades:

- expor `login(payload)` assíncrono;
- gerenciar `isPending`, `isSuccess`, `errorMessage`;
- mapear códigos de erro (`INVALID_CREDENTIALS`, `INTERNAL_ERROR`) para mensagens em português;
- expor `clearError()`.

Não usar TanStack Query para login — estado local com `useState` é suficiente para o fluxo atual.

---

## Route Handler

```txt
src/app/api/auth/login/route.ts
```

Responsabilidades:

1. Parsear e validar body com `loginSchema.safeParse`.
2. Chamar `loginServerService`.
3. Em sucesso, gravar cookies `accessToken` e `refreshToken` (HTTP-only).
4. Retornar apenas `{ ok: true, data: { user } }` ao client.
5. Mapear códigos de erro para status HTTP (`401` para `INVALID_CREDENTIALS`, etc.).

Variável de ambiente no servidor: `API_URL` (não expor no client).

---

## Componente de login

```txt
src/features/auth/components/LoginForm.tsx
```

Padrões:

- Client Component com React Hook Form + Zod;
- delega submit a `useLogin()`;
- exibe erros de validação por campo com `role="alert"`;
- exibe erro de API via `GlobalModal` (`LoginFormOverlays`);
- login bem-sucedido redireciona para `/dashboard`;
- primeiro acesso (`passwordChangeRequired`) exibe modal `warning` e redireciona para `/change-password`;
- bloqueia submit enquanto `isPending` ou formulário inválido;
- usa `Loading` de `@/components/Loader/loaderView` durante `isPending`.

Página fina:

```txt
src/app/(auth)/login/page.tsx
```

Renderiza apenas `<LoginForm />`.

---

## Contrato de API

Referência: `docs/api-contracts.md` — `POST /auth/login`.

Request:

```typescript
{
  email: string;
  password: string;
}
```

Response NestJS (200):

```typescript
{ ok: true, data: { accessToken: string; refreshToken: string; user: User } }
```

Erros conhecidos:

- `INVALID_CREDENTIALS` — credenciais inválidas.

---

## Testes

Specs existentes:

```txt
src/features/auth/schemas/loginSchema.spec.ts
src/features/auth/components/LoginForm.spec.tsx
```

Padrão do `LoginForm.spec.tsx`:

- mock de `useLogin`;
- mock de `Loading` para isolar o formulário;
- testes de renderização, validação, submit e feedback de erro.

---

## Checklist de autenticação

- [ ] Schema Zod separado e reutilizado no Route Handler.
- [ ] Server Service com `"server-only"`.
- [ ] Client Service chama Route Handler interno, não a API NestJS.
- [ ] Tokens gravados somente em cookies HTTP-only.
- [ ] Resposta ao client não expõe tokens.
- [ ] Erros mapeados para mensagens amigáveis em português.
- [ ] Formulário trata loading e erro na UI.
- [ ] Specs unitárias/componentes cobrem fluxo principal.
