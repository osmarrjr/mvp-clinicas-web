import { expect, test } from '@playwright/test';

test.use({
  storageState: { cookies: [], origins: [] },
});

test.describe('Login público', () => {
  test('renderiza rota pública e mantém botão desabilitado até formulário válido', async ({
    page,
  }) => {
    await page.goto('/login');

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText('Bem-vindo')).toBeVisible();
    await expect(page.getByText(/ainda não possui cadastro/i)).toBeVisible();

    const submitButton = page.getByRole('button', { name: /^login$/i });
    await expect(submitButton).toBeDisabled();

    await page.getByLabel(/^email$/i).fill('email-invalido');
    await page.getByLabel(/^senha$/i).fill('123456');
    await expect(submitButton).toBeDisabled();

    await page.getByLabel(/^email$/i).fill('user@example.com');
    await expect(submitButton).toBeEnabled();
  });

  test('com mock habilitado redireciona para /dashboard mesmo quando a API falha', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.locator('#email').pressSequentially('user@example.com', { delay: 20 });
    await page.locator('#password').pressSequentially('123456', { delay: 20 });

    const submitButton = page.getByRole('button', { name: /^login$/i });
    await expect(submitButton).toBeEnabled({ timeout: 15_000 });
    await submitButton.click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole('heading', { name: /^dashboard$/i })).toBeVisible();
  });

  test('acesso a /dashboard sem cookie redireciona para /login', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
