import { expect, test } from '@playwright/test';

import { APP_NAVIGATION } from '../../src/config/navigation';

test.describe('Layout autenticado — dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
  });

  test('exibe sidebar com 10 links, header e conteúdo do dashboard', async ({
    page,
  }) => {
    await expect(page.getByRole('heading', { name: /^dashboard$/i })).toBeVisible();
    await expect(page.getByAltText('MVP Clínicas')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /alternar menu/i }),
    ).toBeVisible();

    expect(APP_NAVIGATION).toHaveLength(10);

    for (const item of APP_NAVIGATION) {
      await expect(
        page.getByRole('link', { name: item.label, exact: true }),
      ).toBeVisible();
    }
  });

  test('alternar menu está visível e clicável', async ({ page }) => {
    const toggleButton = page.getByRole('button', { name: /alternar menu/i });
    await toggleButton.click();
    await expect(toggleButton).toBeVisible();
  });
});
