import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LoginForm } from "./LoginForm";
import { useLogin } from "../hooks/useLogin";

vi.mock("../hooks/useLogin", () => ({
  useLogin: vi.fn(),
}));

vi.mock("@/components/Loader/loaderView", () => ({
  Loading: ({ isOpen, message }: { isOpen: boolean; message: string }) =>
    isOpen ? <div>{message}</div> : null,
}));

const useLoginMock = vi.mocked(useLogin);

function setupUseLoginMock(overrides?: Partial<ReturnType<typeof useLogin>>) {
  const loginMock = vi.fn(
    async (_payload: Parameters<ReturnType<typeof useLogin>["login"]>[0]) =>
      null,
  );

  const clearErrorMock = vi.fn();

  const mockValue: ReturnType<typeof useLogin> = {
    login: loginMock,
    isPending: false,
    isSuccess: false,
    errorMessage: null,
    clearError: clearErrorMock,
    ...overrides,
  };

  useLoginMock.mockReturnValue(mockValue);

  return {
    loginMock,
    clearErrorMock,
  };
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza os campos principais e o texto de cadastro", () => {
    setupUseLoginMock();

    render(<LoginForm />);

    expect(screen.getByLabelText(/^email$/i)).toBeTruthy();
    expect(screen.getByLabelText(/^senha$/i)).toBeTruthy();

    expect(screen.getByText(/ainda não possui cadastro/i)).toBeTruthy();
    const registerLink = screen.getByRole("link", { name: /clique aqui/i });
    expect(registerLink.getAttribute("href")).toBe("/register");
  });

  it("mantém o botão desabilitado quando o formulário está vazio", () => {
    setupUseLoginMock();

    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /^login$/i });

    expect(submitButton).toHaveProperty("disabled", true);
  });

  it("mantém o botão desabilitado com email inválido", async () => {
    setupUseLoginMock();

    const user = userEvent.setup();

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^senha$/i);
    const submitButton = screen.getByRole("button", { name: /^login$/i });

    await user.type(emailInput, "email-invalido");
    await user.type(passwordInput, "123456");

    expect(submitButton).toHaveProperty("disabled", true);
  });

  it("habilita o botão quando email e senha são válidos", async () => {
    setupUseLoginMock();

    const user = userEvent.setup();

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^senha$/i);
    const submitButton = screen.getByRole("button", { name: /^login$/i });

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "123456");

    await waitFor(() => {
      expect(submitButton).toHaveProperty("disabled", false);
    });
  });

  it("chama login com email e senha ao submeter formulário válido", async () => {
    const { loginMock } = setupUseLoginMock();

    const user = userEvent.setup();

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^senha$/i);
    const submitButton = screen.getByRole("button", { name: /^login$/i });

    await user.type(emailInput, "user@example.com");
    await user.type(passwordInput, "123456");

    await waitFor(() => {
      expect(submitButton).toHaveProperty("disabled", false);
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledTimes(1);
    });

    expect(loginMock).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "123456",
    });
  });

  it("alterna a visibilidade da senha", async () => {
    setupUseLoginMock();

    const user = userEvent.setup();

    render(<LoginForm />);

    const passwordInput = screen.getByLabelText(/^senha$/i);

    expect(passwordInput.getAttribute("type")).toBe("password");

    await user.click(screen.getByRole("button", { name: /exibir senha/i }));

    expect(passwordInput.getAttribute("type")).toBe("text");

    await user.click(screen.getByRole("button", { name: /ocultar senha/i }));

    expect(passwordInput.getAttribute("type")).toBe("password");
  });

  it("exibe mensagem de erro quando houver errorMessage", () => {
    setupUseLoginMock({
      errorMessage: "E-mail ou senha inválidos.",
    });

    render(<LoginForm />);

    expect(screen.getByText("E-mail ou senha inválidos.")).toBeTruthy();
  });

  it("exibe estado de carregamento quando isPending é true", () => {
    setupUseLoginMock({
      isPending: true,
    });

    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /entrando/i });

    expect(submitButton).toHaveProperty("disabled", true);
    expect(screen.getByText("Carregando")).toBeTruthy();
  });

  it("renderiza título Bem-vindo", () => {
    setupUseLoginMock();

    render(<LoginForm />);

    expect(screen.getByText("Bem-vindo")).toBeTruthy();
  });
});
