import { test as setup, expect } from '@playwright/test';
import path from 'node:path';

const AUTH_FILE = path.join(__dirname, '../../.playwright/auth.json');

setup('autenticar via login com mock habilitado', async ({ page }) => {
  const email = process.env.QA_EMAIL?.trim() || 'qa@example.com';
  const password = process.env.QA_PASSWORD?.trim() || 'senha-qualquer';

  await page.goto('/login');

  await page.locator('#email').pressSequentially(email, { delay: 20 });
  await page.locator('#password').pressSequentially(password, { delay: 20 });

  const submitButton = page.getByRole('button', { name: /^login$/i });
  await expect(submitButton).toBeEnabled({ timeout: 15_000 });
  await submitButton.click();

  await page.waitForURL(/\/dashboard/);
  await expect(page).toHaveURL(/\/dashboard/);

  await page.context().storageState({ path: AUTH_FILE });
});
