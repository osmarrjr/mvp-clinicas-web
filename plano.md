# Plano: Menu do usuário no header, localStorage e logout

## Contexto

Após o login, os dados do objeto `user` (`id`, `email`) devem ficar disponíveis no client via `localStorage` para exibição no header. O `AppShell` precisa de um menu no canto direito com avatar, nome/e-mail, link de Perfil e ação Sair. O logout deve limpar `localStorage` e os cookies HTTP-only (`accessToken`, `refreshToken`) via Route Handler.

## Validação arquitetural

- Feature: existente (`auth`) + layout compartilhado (`AppShell`)
- Reutiliza componente existente: sim (`Button`, `DropdownMenu`)
- Reutiliza GlobalModal / Loading / DataTable: não (logout redireciona sem modal de sucesso)
- Reutiliza hook existente: estende fluxo de `useLogin`
- Reutiliza service existente: estende `authClientService`
- Reutiliza schema existente: não
- Reutiliza tipos existentes: sim (`LoginUser`)
- Usa shadcn/ui ou componente existente: sim (`dropdown-menu`, novo `avatar`)
- Exige novo componente shadcn/ui: sim (`avatar`)
- Há impacto em autenticação: sim
- Há impacto em permissões/RBAC: não
- Há impacto em contrato de API: não
- Há impacto em Route Handler: sim (`POST /api/auth/logout`)
- Exige teste unitário/componente: sim

## Páginas/componentes afetados

- `src/lib/auth/user-storage.ts` (novo)
- `src/lib/auth/user-storage.spec.ts` (novo)
- `src/components/ui/avatar.tsx` (novo)
- `src/features/auth/constants/authRoutes.ts` (adicionar `profile`)
- `src/features/auth/hooks/auth/useLogin.ts` (salvar user no localStorage)
- `src/features/auth/hooks/auth/useLogout.ts` (novo)
- `src/features/auth/services/auth/authClientService.ts` (adicionar `logoutClientService`)
- `src/app/api/auth/logout/route.ts` (novo)
- `src/features/auth/components/LogoutButton/LogoutButton.tsx` (novo)
- `src/features/auth/components/LogoutButton/LogoutButton.spec.tsx` (novo)
- `src/features/auth/components/UserMenu/UserMenu.tsx` (novo)
- `src/features/auth/components/UserMenu/UserMenu.spec.tsx` (novo)
- `src/components/layout/AppShell.tsx` (integrar `UserMenu` à direita)
- `src/features/auth/components/LoginForm.spec.tsx` (ajustar se necessário)

## Passos

### Passo 1 — Storage do usuário

- Criar `src/lib/auth/user-storage.spec.tsx` com contrato: `getStoredUser`, `setStoredUser`, `clearStoredUser`, chave constante.
- Criar `src/lib/auth/user-storage.ts` com helpers tipados em `LoginUser`.

### Passo 2 — Persistir user no login

- Atualizar `useLogin` para chamar `setStoredUser(response.data.user)` quando login for bem-sucedido (antes de retornar os dados).

### Passo 3 — Logout (service, route e hook)

- Adicionar `logoutClientService` em `authClientService.ts` (`POST /api/auth/logout`).
- Criar `src/app/api/auth/logout/route.ts` limpando cookies `accessToken` e `refreshToken` com `maxAge: 0`.
- Criar `useLogout` com `logout()`, `isPending`, limpeza de `localStorage` e redirect para `/login`.

### Passo 4 — Componente Sair

- Criar spec `LogoutButton.spec.tsx`: renderiza item "Sair", chama `logout` ao clicar, desabilita durante `isPending`.
- Criar `LogoutButton` como item de menu reutilizável (variant destructive).

### Passo 5 — Avatar e UserMenu

- Adicionar `src/components/ui/avatar.tsx` (padrão shadcn).
- Criar spec `UserMenu.spec.tsx`: exibe e-mail do usuário, opções Perfil e Sair.
- Criar `UserMenu` com trigger avatar, `DropdownMenuLabel` (nome ou e-mail), item Perfil (`/profile`), `LogoutButton`.

### Passo 6 — Header

- Atualizar `AppShell`: header com `justify-between`, `SidebarTrigger` à esquerda, `UserMenu` à direita.
- Adicionar `profile: "/profile"` em `AUTH_ROUTES`.

### Passo 7 — Validação

- Rodar `npm run test`, `npm run lint`, `npm run build`.

## Checklist

- [ ] User salvo no localStorage após login
- [ ] Avatar + dropdown no header direito
- [ ] Exibe nome (se existir) ou e-mail
- [ ] Opção Perfil navega para `/profile`
- [ ] Sair limpa localStorage e cookies
- [ ] Redirect para login após logout
- [ ] Specs passando
- [ ] Lint e build sem erros
