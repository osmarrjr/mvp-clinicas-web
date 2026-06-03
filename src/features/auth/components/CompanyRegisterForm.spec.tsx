import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CompanyRegisterForm } from "./CompanyRegisterForm";
import { useCompanyRegister } from "../hooks/useCompanyRegister";
import { useIbgeLocations } from "../hooks/useIbgeLocations";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("../hooks/useCompanyRegister", () => ({
  useCompanyRegister: vi.fn(),
}));

vi.mock("../hooks/useIbgeLocations", () => ({
  useIbgeLocations: vi.fn(),
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

const useCompanyRegisterMock = vi.mocked(useCompanyRegister);
const useIbgeLocationsMock = vi.mocked(useIbgeLocations);

function setupCompanyRegisterMock(
  overrides?: Partial<ReturnType<typeof useCompanyRegister>>,
) {
  const registerMock = vi.fn(async () => null);

  useCompanyRegisterMock.mockReturnValue({
    register: registerMock,
    isPending: false,
    isSuccess: false,
    errorMessage: null,
    clearError: vi.fn(),
    resetSuccess: vi.fn(),
    ...overrides,
  });

  return { registerMock };
}

function setupIbgeMock(overrides?: Partial<ReturnType<typeof useIbgeLocations>>) {
  useIbgeLocationsMock.mockReturnValue({
    states: [{ id: 35, sigla: "SP", nome: "São Paulo" }],
    cities: [{ id: 3550308, nome: "São Paulo" }],
    isLoadingStates: false,
    isLoadingCities: false,
    statesError: null,
    citiesError: null,
    clearStatesError: vi.fn(),
    clearCitiesError: vi.fn(),
    ...overrides,
  });
}

describe("CompanyRegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupIbgeMock();
    setupCompanyRegisterMock();
  });

  it("renderiza campos principais do cadastro", () => {
    render(<CompanyRegisterForm />);

    expect(screen.getByLabelText(/nome da empresa/i)).toBeTruthy();
    expect(screen.getByLabelText(/cpf ou cnpj/i)).toBeTruthy();
    expect(screen.getByText(/^estado$/i)).toBeTruthy();
    expect(screen.getByText(/^cidade$/i)).toBeTruthy();
    expect(screen.getByLabelText(/^email$/i)).toBeTruthy();
    expect(screen.getByText(/^plano$/i)).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /cadastrar empresa/i }),
    ).toHaveProperty("disabled", true);
  });

  it("exibe modal de erro da API", () => {
    setupCompanyRegisterMock({
      errorMessage: "Já existe um cadastro com este email.",
    });

    render(<CompanyRegisterForm />);

    expect(
      screen.getByText("Já existe um cadastro com este email."),
    ).toBeTruthy();
  });

  it("exibe modal de sucesso e redireciona ao confirmar", async () => {
    setupCompanyRegisterMock({ isSuccess: true });

    const user = userEvent.setup();
    render(<CompanyRegisterForm />);

    expect(screen.getByText(/cadastro realizado com sucesso/i)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: /confirmar/i }));

    expect(pushMock).toHaveBeenCalledWith("/login");
  });

  it("exibe loading ao carregar estados", () => {
    setupIbgeMock({ isLoadingStates: true });

    render(<CompanyRegisterForm />);

    expect(screen.getByText("Carregando estados")).toBeTruthy();
  });
});
