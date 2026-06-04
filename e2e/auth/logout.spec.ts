import { expect, test } from '@playwright/test';

test.describe('Logout', () => {
  test('Sair limpa sessão e redireciona para /login', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('button', { name: /menu do usuário/i }).click();
    await page.getByRole('menuitem', { name: /^sair$/i }).click();

    await expect(page).toHaveURL(/\/login/);

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
