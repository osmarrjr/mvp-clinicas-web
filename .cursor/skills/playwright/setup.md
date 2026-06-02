# Playwright — Setup e Configuração

## Instalação

```bash
npm install -D @playwright/test dotenv
npx playwright install --with-deps chromium
```

---

## Scripts recomendados

Adicionar ao `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## Porta e baseURL

O projeto usa `http://localhost:3001` para o frontend quando a API local ocupa `3000`.

Se o projeto rodar em outra porta, configure:

```env
PLAYWRIGHT_BASE_URL=http://localhost:3001
```

---

## Configuração base

Criar `playwright.config.ts` na raiz do projeto:

```ts
import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const AUTH_FILE = path.join(__dirname, '.playwright/auth.json');
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001';

export default defineConfig({
  testDir: './e2e',
  outputDir: '.playwright/test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: '.playwright/report', open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'unauthenticated',
      testMatch: /.*\.unauth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'authenticated',
      testMatch: /^(?!.*\.unauth\.spec\.ts).*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
    },
  ],
  webServer: {
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
```

> Em CI, garanta que o build rode antes de `playwright test`, pois `npm run start` depende de build prévio.

---

## Estrutura recomendada

```txt
e2e/
  authenticated.setup.ts
  auth.unauth.spec.ts
  patients.spec.ts
  appointments.spec.ts
  staff.spec.ts
  pages/
    LoginPage.ts
    PatientsPage.ts
.playwright/
  auth.json
  test-results/
  report/
```

A estrutura exata pode variar conforme o `plano.md`.

---

## `.gitignore`

Adicionar:

```txt
.playwright/auth.json
.playwright/test-results/
.playwright/report/
```

---

## Comandos úteis

```bash
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:debug

npx playwright test e2e/patients.spec.ts
npx playwright test -g "deve criar paciente"
npx playwright show-report .playwright/report
npx playwright codegen http://localhost:3001
```

---

## Checklist de setup

- [ ] `@playwright/test` instalado.
- [ ] `dotenv` instalado.
- [ ] Chromium instalado.
- [ ] `playwright.config.ts` criado.
- [ ] Scripts E2E adicionados ao `package.json`.
- [ ] `.playwright/` adicionada ao `.gitignore`.
- [ ] `PLAYWRIGHT_BASE_URL` configurado quando necessário.
