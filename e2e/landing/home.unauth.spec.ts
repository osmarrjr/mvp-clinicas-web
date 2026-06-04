import { expect, test } from "@playwright/test";

test.use({
  storageState: { cookies: [], origins: [] },
});

test.describe("Landing page", () => {
  test("exibe seções principais e permite ir para cadastro", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: /gestão inteligente para o seu negócio de saúde/i,
      }),
    ).toBeVisible();

    await expect(page.locator("#quem-somos")).toBeVisible();
    await expect(page.locator("#funcionalidades")).toBeVisible();
    await expect(page.locator("#suporte")).toBeVisible();
    await expect(page.locator("#planos")).toBeVisible();

    await expect(
      page.getByRole("navigation", { name: "Navegação principal" }),
    ).toBeVisible();

    await page
      .getByRole("link", { name: "Cadastrar minha clínica", exact: true })
      .click();
    await expect(page).toHaveURL(/\/register$/);
  });
});
