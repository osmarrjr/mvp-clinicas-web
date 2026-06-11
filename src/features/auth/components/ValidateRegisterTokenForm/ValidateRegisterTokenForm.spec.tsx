import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { useValidateRegisterToken } from "../../hooks/useValidateRegisterToken";
import { REGISTER_VALIDATION_EMAIL_KEY } from "../../constants/registerValidation";
import { ValidateRegisterTokenForm } from "./ValidateRegisterTokenForm";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: pushMock }),
}));

vi.mock("../../hooks/useValidateRegisterToken", () => ({
  useValidateRegisterToken: vi.fn(),
}));

vi.mock("@/components/Loader/loaderView", () => ({
  Loading: ({ isOpen, message }: { isOpen: boolean; message: string }) =>
    isOpen ? <div>{message}</div> : null,
}));

vi.mock("@/components/GlobalModal", () => ({
  GlobalModal: ({
    open,
    modalTitle,
    modalSubTitle,
    confirmLabel,
    onConfirm,
  }: {
    open: boolean;
    modalTitle: string;
    modalSubTitle?: string;
    confirmLabel?: string;
    onConfirm?: () => void;
  }) =>
    open ? (
      <div>
        <h2>{modalTitle}</h2>
        {modalSubTitle ? <p>{modalSubTitle}</p> : null}
        <button type="button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    ) : null,
}));

const useValidateRegisterTokenMock = vi.mocked(useValidateRegisterToken);

async function pasteToken(
  user: ReturnType<typeof userEvent.setup>,
  token: string,
) {
  const firstDigit = screen.getByLabelText("Dígito 1 de 6");
  await user.click(firstDigit);
  await user.paste(token);
}

function setupValidateTokenMock(
  overrides?: Partial<ReturnType<typeof useValidateRegisterToken>>,
) {
  const validateTokenMock = vi.fn(async () => null);

  useValidateRegisterTokenMock.mockReturnValue({
    validateToken: validateTokenMock,
    isPending: false,
    isSuccess: false,
    errorMessage: null,
    clearError: vi.fn(),
    resetSuccess: vi.fn(),
    ...overrides,
  });

  return { validateTokenMock };
}

describe("ValidateRegisterTokenForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    sessionStorage.setItem(
      REGISTER_VALIDATION_EMAIL_KEY,
      "clinica@example.com",
    );
    setupValidateTokenMock();
  });

  it("renderiza label e seis inputs de dígito", () => {
    render(<ValidateRegisterTokenForm />);

    expect(screen.getByText(/token de validação/i)).toBeTruthy();

    for (let digit = 1; digit <= 6; digit += 1) {
      expect(screen.getByLabelText(`Dígito ${digit} de 6`)).toBeTruthy();
    }
  });

  it("exibe aviso enquanto token incompleto", () => {
    render(<ValidateRegisterTokenForm />);

    expect(
      screen.getByText(/informe o token de 6 dígitos enviado para seu email/i),
    ).toBeTruthy();
  });

  it("aplica máscara XXX-XXX ao preencher os 6 dígitos", async () => {
    const user = userEvent.setup();
    render(<ValidateRegisterTokenForm />);

    await pasteToken(user, "123456");

    expect((screen.getByLabelText("Dígito 1 de 6") as HTMLInputElement).value).toBe(
      "1",
    );
    expect((screen.getByLabelText("Dígito 6 de 6") as HTMLInputElement).value).toBe(
      "6",
    );
  });

  it("dispara validação automaticamente ao completar 6 dígitos", async () => {
    const { validateTokenMock } = setupValidateTokenMock();
    const user = userEvent.setup();
    render(<ValidateRegisterTokenForm />);

    await pasteToken(user, "123456");

    await waitFor(() => {
      expect(validateTokenMock).toHaveBeenCalledWith({
        email: "clinica@example.com",
        token: "123-456",
      });
    });
  });

  it("não chama service antes de 6 dígitos", async () => {
    const { validateTokenMock } = setupValidateTokenMock();
    const user = userEvent.setup();
    render(<ValidateRegisterTokenForm />);

    await pasteToken(user, "12345");

    expect(validateTokenMock).not.toHaveBeenCalled();
  });

  it("exibe Loading durante isPending", () => {
    setupValidateTokenMock({ isPending: true });

    render(<ValidateRegisterTokenForm />);

    expect(screen.getByText("Validando token")).toBeTruthy();
  });

  it("exibe modal de sucesso e redireciona para /login", async () => {
    setupValidateTokenMock({ isSuccess: true });

    const user = userEvent.setup();
    render(<ValidateRegisterTokenForm />);

    expect(screen.getByText(/cadastro confirmado/i)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /ir para login/i }));

    expect(pushMock).toHaveBeenCalledWith("/login");
    expect(sessionStorage.getItem(REGISTER_VALIDATION_EMAIL_KEY)).toBeNull();
  });

  it("exibe modal de erro em falha da API", () => {
    setupValidateTokenMock({
      errorMessage:
        "Token inválido ou expirado. Verifique o código enviado para seu email.",
    });

    render(<ValidateRegisterTokenForm />);

    expect(
      screen.getByText(
        "Token inválido ou expirado. Verifique o código enviado para seu email.",
      ),
    ).toBeTruthy();
  });

  it("não reenvia automaticamente o mesmo token após falha", async () => {
    const errorMessage =
      "Token inválido ou expirado. Verifique o código enviado para seu email.";
    const { validateTokenMock } = setupValidateTokenMock();

    const user = userEvent.setup();
    const { rerender } = render(<ValidateRegisterTokenForm />);

    await pasteToken(user, "123456");

    await waitFor(() => {
      expect(validateTokenMock).toHaveBeenCalledTimes(1);
    });

    setupValidateTokenMock({
      validateToken: validateTokenMock,
      errorMessage,
    });
    rerender(<ValidateRegisterTokenForm />);

    await waitFor(() => {
      expect(
        screen.getByText(errorMessage),
      ).toBeTruthy();
    });

    expect(validateTokenMock).toHaveBeenCalledTimes(1);
  });

  it("exibe modal de erro novamente após alterar token e nova falha", async () => {
    const errorMessage =
      "Token inválido ou expirado. Verifique o código enviado para seu email.";
    const clearErrorMock = vi.fn();
    const { validateTokenMock } = setupValidateTokenMock({
      errorMessage,
      clearError: clearErrorMock,
    });

    const user = userEvent.setup();
    const { rerender } = render(<ValidateRegisterTokenForm />);

    expect(screen.getByText(errorMessage)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /fechar/i }));
    expect(clearErrorMock).toHaveBeenCalled();

    setupValidateTokenMock({
      validateToken: validateTokenMock,
      errorMessage: null,
      clearError: clearErrorMock,
    });
    rerender(<ValidateRegisterTokenForm />);

    expect(screen.queryByText(errorMessage)).toBeNull();

    await pasteToken(user, "654321");

    await waitFor(() => {
      expect(validateTokenMock).toHaveBeenCalledWith({
        email: "clinica@example.com",
        token: "654-321",
      });
    });

    setupValidateTokenMock({
      validateToken: validateTokenMock,
      errorMessage,
      clearError: clearErrorMock,
    });
    rerender(<ValidateRegisterTokenForm />);

    expect(screen.getByText(errorMessage)).toBeTruthy();
  });

  it("redireciona para /register se email ausente no sessionStorage", () => {
    sessionStorage.removeItem(REGISTER_VALIDATION_EMAIL_KEY);

    render(<ValidateRegisterTokenForm />);

    expect(pushMock).toHaveBeenCalledWith("/register");
  });
});
