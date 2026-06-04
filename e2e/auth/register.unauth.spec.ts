import { expect, test } from "@playwright/test";

test.use({
  storageState: { cookies: [], origins: [] },
});

const mockStates = [
  {
    id: 35,
    sigla: "SP",
    nome: "São Paulo",
    regiao: { id: 3, sigla: "SE", nome: "Sudeste" },
  },
];

const mockCities = [{ id: 3550308, nome: "São Paulo" }];

async function pickSearchableOption(
  page: import("@playwright/test").Page,
  triggerName: string | RegExp,
  searchLabel: string | RegExp,
  optionName: string | RegExp,
) {
  await page.getByRole("button", { name: triggerName }).click();
  await page.getByRole("textbox", { name: searchLabel }).fill(
    typeof optionName === "string" ? optionName.slice(0, 4) : "São",
  );
  await page.getByRole("option", { name: optionName }).click();
}

async function goToRegisterForm(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Selecionar Basic" }).click();
  await expect(page.getByText("Cadastro de empresa")).toBeVisible();
}

test.describe("Cadastro de empresa", () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      "**/servicodados.ibge.gov.br/api/v1/localidades/estados",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockStates),
        });
      },
    );

    await page.route(
      "**/servicodados.ibge.gov.br/api/v1/localidades/estados/SP/municipios",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockCities),
        });
      },
    );
  });

  test("renderiza rota pública e mantém botão desabilitado inicialmente", async ({
    page,
  }) => {
    await page.goto("/register");

    await expect(
      page.getByRole("heading", { name: "Escolha seu plano" }),
    ).toBeVisible();

    await goToRegisterForm(page);

    await expect(
      page.getByRole("button", { name: "Cadastrar empresa" }),
    ).toBeDisabled();
  });

  test("navega do login para cadastro pelo link Clique aqui", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("link", { name: "Clique aqui" }).click();

    await expect(page).toHaveURL(/\/register$/);
    await expect(
      page.getByRole("heading", { name: "Escolha seu plano" }),
    ).toBeVisible();
  });

  test("exibe modal de sucesso e redireciona para login", async ({ page }) => {
    await page.route("**/api/auth/register", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          data: { clinicId: "clinic-1" },
        }),
      });
    });

    await page.goto("/register");
    await goToRegisterForm(page);

    await page.getByLabel("Nome da empresa").fill("Clínica Exemplo");
    await page.getByLabel("CPF ou CNPJ").fill("52998224725");
    await page.getByLabel("Email").fill("contato@clinica.com");
    await page.getByRole("textbox", { name: "Senha" }).fill("Senha@123");

    await pickSearchableOption(
      page,
      "Selecione o estado",
      "Buscar estado...",
      "São Paulo",
    );
    await pickSearchableOption(
      page,
      "Selecione a cidade",
      "Buscar cidade...",
      "São Paulo",
    );

    await expect(
      page.getByRole("button", { name: "Cadastrar empresa" }),
    ).toBeEnabled();

    await page.getByRole("button", { name: "Cadastrar empresa" }).click();

    await expect(
      page.getByText("Cadastro realizado com sucesso"),
    ).toBeVisible();

    await page.getByRole("button", { name: "Confirmar" }).click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test("exibe modal de erro para falha de cadastro", async ({ page }) => {
    await page.route("**/api/auth/register", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          error: {
            code: "USER_ALREADY_EXISTS",
            message: "Já existe um cadastro com este email.",
          },
        }),
      });
    });

    await page.goto("/register");
    await goToRegisterForm(page);

    await page.getByLabel("Nome da empresa").fill("Clínica Exemplo");
    await page.getByLabel("CPF ou CNPJ").fill("52998224725");
    await page.getByLabel("Email").fill("contato@clinica.com");
    await page.getByRole("textbox", { name: "Senha" }).fill("Senha@123");

    await pickSearchableOption(
      page,
      "Selecione o estado",
      "Buscar estado...",
      "São Paulo",
    );
    await pickSearchableOption(
      page,
      "Selecione a cidade",
      "Buscar cidade...",
      "São Paulo",
    );

    await page.getByRole("button", { name: "Cadastrar empresa" }).click();

    await expect(
      page.getByText("Já existe um cadastro com este email."),
    ).toBeVisible();
  });
});
