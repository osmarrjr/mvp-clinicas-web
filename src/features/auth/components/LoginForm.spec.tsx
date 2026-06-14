import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AUTH_ROUTES } from "../constants/authRoutes";
import { LoginForm } from "./LoginForm";
import { useLogin } from "../hooks/useLogin";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("../hooks/useLogin", () => ({
  useLogin: vi.fn(),
}));

vi.mock("@/components/Loader/loaderView", () => ({
  Loading: ({ isOpen, message }: { isOpen: boolean; message: string }) =>
    isOpen ? <div>{message}</div> : null,
}));

vi.mock("./LoginFormOverlays", () => ({
  LoginFormOverlays: ({
    errorModalOpen,
    errorMessage,
    passwordChangeRequired,
    onConfirmPasswordChange,
    onDismissError,
  }: {
    errorModalOpen: boolean;
    errorMessage: string | null;
    passwordChangeRequired: boolean;
    onConfirmPasswordChange: () => void;
    onDismissError: () => void;
  }) => (
    <>
      {errorModalOpen ? (
        <div role="alert">
          <span>{errorMessage}</span>
          <button type="button" onClick={onDismissError}>
            Fechar erro
          </button>
        </div>
      ) : null}
      {passwordChangeRequired ? (
        <div>
          <span>Alteração de senha necessária</span>
          <button type="button" onClick={onConfirmPasswordChange}>
            Alterar senha
          </button>
        </div>
      ) : null}
    </>
  ),
}));

const useLoginMock = vi.mocked(useLogin);

function setupUseLoginMock(overrides?: Partial<ReturnType<typeof useLogin>>) {
  const loginMock = vi.fn(async () => null);

  const clearErrorMock = vi.fn();
  const clearPasswordChangeRequiredMock = vi.fn();

  const mockValue: ReturnType<typeof useLogin> = {
    login: loginMock,
    isPending: false,
    passwordChangeRequired: false,
    errorMessage: null,
    clearError: clearErrorMock,
    clearPasswordChangeRequired: clearPasswordChangeRequiredMock,
    ...overrides,
  };

  useLoginMock.mockReturnValue(mockValue);

  return {
    loginMock,
    clearErrorMock,
    clearPasswordChangeRequiredMock,
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
    expect(screen.getByRole("link", { name: /clique aqui/i }).getAttribute("href")).toBe(
      "/register",
    );
  });

  it("mantém o botão desabilitado quando o formulário está vazio", () => {
    setupUseLoginMock();

    render(<LoginForm />);

    expect(screen.getByRole("button", { name: /^login$/i })).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("habilita o botão quando email e senha são válidos", async () => {
    setupUseLoginMock();

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/^email$/i), "user@example.com");
    await user.type(screen.getByLabelText(/^senha$/i), "123456");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^login$/i })).toHaveProperty(
        "disabled",
        false,
      );
    });
  });

  it("chama login com email e senha ao submeter formulário válido", async () => {
    const { loginMock } = setupUseLoginMock();

    loginMock.mockResolvedValue({
      user: { id: "1", email: "user@example.com" },
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/^email$/i), "user@example.com");
    await user.type(screen.getByLabelText(/^senha$/i), "123456");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /^login$/i })).toHaveProperty(
        "disabled",
        false,
      );
    });

    await user.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "123456",
      });
    });
  });

  it("redireciona para o dashboard após login bem-sucedido", async () => {
    const { loginMock } = setupUseLoginMock();

    loginMock.mockResolvedValue({
      user: { id: "1", email: "user@example.com" },
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/^email$/i), "user@example.com");
    await user.type(screen.getByLabelText(/^senha$/i), "123456");
    await user.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(AUTH_ROUTES.dashboard);
    });
  });

  it("exibe modal de erro quando houver errorMessage", () => {
    setupUseLoginMock({
      errorMessage: "E-mail ou senha inválidos.",
    });

    render(<LoginForm />);

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(screen.getByText("E-mail ou senha inválidos.")).toBeTruthy();
  });

  it("exibe modal de primeiro acesso quando passwordChangeRequired é true", async () => {
    const { clearPasswordChangeRequiredMock } = setupUseLoginMock({
      passwordChangeRequired: true,
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    expect(screen.getByText(/alteração de senha necessária/i)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /alterar senha/i }));

    expect(clearPasswordChangeRequiredMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith(AUTH_ROUTES.changePassword);
  });

  it("exibe estado de carregamento quando isPending é true", () => {
    setupUseLoginMock({
      isPending: true,
    });

    render(<LoginForm />);

    expect(screen.getByRole("button", { name: /entrando/i })).toHaveProperty(
      "disabled",
      true,
    );
  });
});
