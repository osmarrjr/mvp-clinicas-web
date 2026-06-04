import { expect, test } from '@playwright/test';

test.use({
  storageState: { cookies: [], origins: [] },
});

test.describe('Login público', () => {
  test('renderiza rota pública e mantém botão desabilitado até formulário válido', async ({
    page,
  }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByText('Ainda não possui um cadastro? Clique aqui')).toBeVisible();

    const submitButton = page.getByRole('button', { name: 'Login' });
    await expect(submitButton).toBeDisabled();

    await page.getByLabel('Email').fill('email-invalido');
    await page.getByLabel('Senha').fill('123456');
    await expect(submitButton).toBeDisabled();

    await page.getByLabel('Email').fill('user@example.com');
    await expect(submitButton).toBeEnabled();
  });

  test('submete login com sucesso', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          data: {
            accessToken: 'token',
            refreshToken: 'refresh',
            user: {
              id: '1',
              clinicId: 'clinic-1',
              name: 'Usuário',
              email: 'user@example.com',
              role: 'clinic_admin',
              phone: null,
              sex: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Senha').fill('123456');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Email ou senha incorretos.')).not.toBeVisible();
  });

  test('exibe erro amigável para credenciais inválidas', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Email ou senha incorretos.',
          },
        }),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Senha').fill('senha-incorreta');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText('Email ou senha incorretos.')).toBeVisible();
  });
});
