# Playwright — Autenticação Reutilizável

## Objetivo

Padronizar fluxos E2E autenticados usando `storageState`, preservando a arquitetura do projeto baseada em cookies HTTP-only.

---

## Regras essenciais

- Não manipular token diretamente no client.
- Não usar `localStorage` ou `sessionStorage` para autenticação.
- Não expor token para testes ou componentes client-side.
- O teste deve simular o login como usuário faria.
- O estado autenticado deve ser salvo em `.playwright/auth.json`.
- `.playwright/auth.json` deve estar no `.gitignore`.

---

## Variáveis necessárias

Para fluxos autenticados, configurar no `.env.local`:

```env
QA_EMAIL=
QA_PASSWORD=
PLAYWRIGHT_BASE_URL=http://localhost:3001
```

---

## Setup de autenticação

Criar `e2e/authenticated.setup.ts`:

```ts
import { test as setup, expect } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '../.playwright/auth.json');

setup('autenticar usuário de QA', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel(/email/i).fill(process.env.QA_EMAIL!);
  await page.getByLabel(/senha/i).fill(process.env.QA_PASSWORD!);
  await page.getByRole('button', { name: /entrar|login/i }).click();

  await page.waitForURL(/\/dashboard/);
  await expect(page).toHaveURL(/\/dashboard/);

  // Salva o estado de autenticação, especialmente cookies HTTP-only.
  // Não usar token em localStorage/sessionStorage no app.
  await page.context().storageState({ path: AUTH_FILE });
});
```

---

## Nomenclatura recomendada

```txt
e2e/authenticated.setup.ts
e2e/auth.unauth.spec.ts
e2e/patients.spec.ts
e2e/appointments.spec.ts
```

Padrão:

- `*.unauth.spec.ts` para testes públicos ou não autenticados.
- `*.spec.ts` para testes autenticados.
- `*.setup.ts` para setup de autenticação.

---

## Testes de rotas protegidas

Exemplo:

```ts
import { test, expect } from '@playwright/test';

test.describe('Auth — proteção de rotas', () => {
  test('deve redirecionar /dashboard para /login quando não autenticado', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login/);
  });
});
```

---

## Checklist de autenticação

- [ ] `QA_EMAIL` configurado quando houver fluxo autenticado.
- [ ] `QA_PASSWORD` configurado quando houver fluxo autenticado.
- [ ] Setup autentica pela UI.
- [ ] `storageState` salvo em `.playwright/auth.json`.
- [ ] `.playwright/auth.json` não é versionado.
- [ ] Teste não manipula token diretamente.
- [ ] Teste não usa `localStorage` ou `sessionStorage` para autenticação.
