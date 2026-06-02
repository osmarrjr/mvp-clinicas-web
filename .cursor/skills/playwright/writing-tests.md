# Playwright — Escrita de Testes E2E

## Regra principal

Testar comportamento visível ao usuário, não detalhes de implementação.

A cobertura exata deve seguir o `plano.md`.

---

## Local dos testes

Testes Playwright ficam em:

```txt
e2e/
```

Exemplos:

```txt
e2e/auth.unauth.spec.ts
e2e/patients.spec.ts
e2e/appointments.spec.ts
e2e/staff.spec.ts
```

Page Objects, quando necessários:

```txt
e2e/pages/
```

---

## Seletores

Prioridade obrigatória:

1. `getByRole`
2. `getByLabel`
3. `getByPlaceholder`
4. `getByText`
5. `getByTestId`
6. `locator` com atributo estável

Exemplos:

```ts
page.getByRole('button', { name: /salvar/i });
page.getByRole('heading', { name: /pacientes/i });
page.getByLabel(/email/i);
page.getByPlaceholder(/buscar paciente/i);
page.getByText(/nenhum paciente cadastrado/i);
page.getByTestId('appointment-card');
page.locator('[data-testid="appointment-card"][data-status="triage"]');
```

Evitar:

```ts
page.locator('.card:first-child > div > p');
page.locator('//div[@class="patient-list"]/div[1]');
```

Use `data-testid` apenas quando não houver seletor acessível confiável.

---

## Padrão de teste

```ts
import { test, expect } from '@playwright/test';

test.describe('Patients — lista e criação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/patients');
  });

  test('deve exibir a página de pacientes', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /pacientes/i })).toBeVisible();
  });

  test('deve abrir formulário de criação', async ({ page }) => {
    await page.getByRole('button', { name: /novo paciente/i }).click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByLabel(/nome/i)).toBeVisible();
  });

  test('deve exibir erro de validação', async ({ page }) => {
    await page.getByRole('button', { name: /novo paciente/i }).click();
    await page.getByRole('button', { name: /salvar/i }).click();

    await expect(page.getByText(/nome é obrigatório/i)).toBeVisible();
  });
});
```

---

## Page Object Model

Usar Page Object somente para fluxos complexos ou repetidos.

```ts
// e2e/pages/PatientsPage.ts
import { expect, type Locator, type Page } from '@playwright/test';

export class PatientsPage {
  readonly heading: Locator;
  readonly newPatientButton: Locator;
  readonly searchInput: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { name: /pacientes/i });
    this.newPatientButton = page.getByRole('button', { name: /novo paciente/i });
    this.searchInput = page.getByPlaceholder(/buscar/i);
  }

  async goto() {
    await this.page.goto('/patients');
    await expect(this.heading).toBeVisible();
  }

  async createPatient(data: { name: string; email?: string }) {
    await this.newPatientButton.click();
    await this.page.getByLabel(/nome/i).fill(data.name);

    if (data.email) {
      await this.page.getByLabel(/email/i).fill(data.email);
    }

    await this.page.getByRole('button', { name: /salvar/i }).click();
  }
}
```

---

## Fluxos que devem ser cobertos

Priorizar, conforme o `plano.md`:

- login e redirecionamento de rotas protegidas;
- rotas públicas afetadas;
- CRUD principal de pacientes;
- criação e edição de agendamentos;
- transições válidas e inválidas de status;
- criação/listagem de equipe;
- mensagens de erro e validação;
- estados vazios, loading e erro quando aplicável.

---

## Acessibilidade

Todo teste deve favorecer a mesma navegação que o usuário faria.

Verificar quando aplicável:

- campos acessíveis por label;
- botões com nome acessível;
- feedback de erro visível;
- navegação por teclado em fluxos críticos;
- modais/dialogs com foco e fechamento previsível.

---

## O que evitar

- Testar classes CSS.
- Testar estrutura interna do DOM sem necessidade.
- Usar XPath.
- Criar teste fora do escopo do `plano.md`.
- Criar Page Object para fluxo simples.
- Fazer login manual repetido em todo teste autenticado.
- Manipular token diretamente no client.

---

## Checklist de escrita

- [ ] Teste verifica comportamento visível.
- [ ] Seletores acessíveis foram priorizados.
- [ ] Não há CSS frágil ou XPath.
- [ ] `data-testid` usado apenas quando necessário.
- [ ] Fluxo segue o escopo do `plano.md`.
- [ ] Fluxo autenticado usa setup reutilizável quando aplicável.
