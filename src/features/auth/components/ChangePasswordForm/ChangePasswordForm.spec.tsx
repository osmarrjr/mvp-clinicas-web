import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ChangePasswordForm } from "./ChangePasswordForm";
import { useChangePassword } from "../../hooks/auth/useChangePassword";

const pushMock = vi.fn();
const VALID_PASSWORD = "Abcdef1!";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("../../hooks/auth/useChangePassword", () => ({
  useChangePassword: vi.fn(),
}));

vi.mock("@/components/Loader/loaderView", () => ({
  Loading: ({ isOpen, message }: { isOpen: boolean; message: string }) =>
    isOpen ? <div>{message}</div> : null,
}));

vi.mock("./ChangePasswordOverlays", () => ({
  ChangePasswordOverlays: ({
    errorModalOpen,
    errorMessage,
    onDismissError,
  }: {
    errorModalOpen: boolean;
    errorMessage: string | null;
    onDismissError: () => void;
  }) =>
    errorModalOpen ? (
      <div role="alert">
        <span>{errorMessage}</span>
        <button type="button" onClick={onDismissError}>
          Fechar erro
        </button>
      </div>
    ) : null,
}));

const useChangePasswordMock = vi.mocked(useChangePassword);

function setupUseChangePasswordMock(
  overrides?: Partial<ReturnType<typeof useChangePassword>>,
) {
  const changePasswordMock = vi.fn(async () => true);

  const mockValue: ReturnType<typeof useChangePassword> = {
    changePassword: changePasswordMock,
    isPending: false,
    isSuccess: false,
    errorMessage: null,
    clearError: vi.fn(),
    resetSuccess: vi.fn(),
    ...overrides,
  };

  useChangePasswordMock.mockReturnValue(mockValue);

  return { changePasswordMock };
}

function getConfirmPasswordField() {
  return screen.getByPlaceholderText(/confirme a nova senha/i);
}

function getConfirmPasswordToggle() {
  const confirmInput = getConfirmPasswordField();
  const wrapper = confirmInput.closest("div.relative");

  if (!wrapper) {
    throw new Error("Confirm password wrapper not found");
  }

  return within(wrapper as HTMLElement).getByRole("button", {
    name: /exibir senha|ocultar senha/i,
  });
}

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mantém confirmar senha desabilitado quando a nova senha está vazia ou inválida", () => {
    setupUseChangePasswordMock();

    render(<ChangePasswordForm />);

    expect(getConfirmPasswordField()).toHaveProperty("disabled", true);
    expect(getConfirmPasswordToggle()).toHaveProperty("disabled", true);
    expect(
      screen.getByRole("button", { name: /salvar nova senha/i }),
    ).toHaveProperty("disabled", true);
  });

  it("habilita confirmar senha quando a nova senha é válida", async () => {
    setupUseChangePasswordMock();

    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    await user.type(
      screen.getByPlaceholderText(/digite a nova senha/i),
      VALID_PASSWORD,
    );

    await waitFor(() => {
      expect(getConfirmPasswordField()).toHaveProperty("disabled", false);
      expect(getConfirmPasswordToggle()).toHaveProperty("disabled", false);
    });
  });

  it("limpa e desabilita confirmar senha quando a nova senha deixa de ser válida", async () => {
    setupUseChangePasswordMock();

    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    const newPasswordInput =
      screen.getByPlaceholderText(/digite a nova senha/i);

    await user.type(newPasswordInput, VALID_PASSWORD);

    await waitFor(() => {
      expect(getConfirmPasswordField()).toHaveProperty("disabled", false);
    });

    await user.type(getConfirmPasswordField(), VALID_PASSWORD);

    await user.clear(newPasswordInput);
    await user.type(newPasswordInput, "abc");

    await waitFor(() => {
      expect(getConfirmPasswordField()).toHaveProperty("disabled", true);
      expect(getConfirmPasswordField()).toHaveProperty("value", "");
      expect(getConfirmPasswordToggle()).toHaveProperty("disabled", true);
    });
  });

  it("mantém submit desabilitado até o formulário ficar válido", async () => {
    setupUseChangePasswordMock();

    const user = userEvent.setup();
    render(<ChangePasswordForm />);

    const submitButton = screen.getByRole("button", {
      name: /salvar nova senha/i,
    });

    expect(submitButton).toHaveProperty("disabled", true);

    await user.type(
      screen.getByPlaceholderText(/digite a nova senha/i),
      VALID_PASSWORD,
    );

    await waitFor(() => {
      expect(getConfirmPasswordField()).toHaveProperty("disabled", false);
    });

    expect(submitButton).toHaveProperty("disabled", true);

    await user.type(getConfirmPasswordField(), VALID_PASSWORD);

    await waitFor(() => {
      expect(submitButton).toHaveProperty("disabled", false);
    });
  });
});
