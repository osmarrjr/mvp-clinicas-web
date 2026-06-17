import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppRole } from "@/lib/auth/types";
import { renderWithQueryClient } from "@/test-utils/renderWithQueryClient";

import type { StaffMember } from "../types";
import { StaffListPageContent } from "./StaffListPageContent";
import { useStaffList } from "../hooks/useStaffList";

vi.mock("../hooks/useStaffList", () => ({
  useStaffList: vi.fn(),
}));

vi.mock("@/components/Loader/loaderView", () => ({
  Loading: ({ isOpen, message }: { isOpen: boolean; message: string }) =>
    isOpen ? <div>{message}</div> : null,
}));

vi.mock("./StaffListOverlays", () => ({
  StaffListOverlays: ({
    isLoading,
    errorModalOpen,
    errorMessage,
    onDismissError,
  }: {
    isLoading: boolean;
    errorModalOpen: boolean;
    errorMessage: string | null;
    onDismissError: () => void;
  }) => (
    <>
      {isLoading ? <div>Carregando usuários</div> : null}
      {errorModalOpen ? (
        <div role="alert">
          <span>{errorMessage}</span>
          <button type="button" onClick={onDismissError}>
            Fechar erro
          </button>
        </div>
      ) : null}
    </>
  ),
}));

vi.mock("./StaffListTable", () => ({
  StaffListTable: ({
    data,
    isLoading,
  }: {
    data: StaffMember[];
    isLoading: boolean;
  }) => (
    <div>
      {isLoading ? <span>Carregando tabela</span> : null}
      {data.length === 0 && !isLoading ? (
        <span>Nenhum usuário cadastrado.</span>
      ) : null}
      {data.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Perfil</th>
            </tr>
          </thead>
          <tbody>
            {data.map((member) => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td>{member.email}</td>
                <td>{member.phone ?? "—"}</td>
                <td>{member.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  ),
}));

const useStaffListMock = vi.mocked(useStaffList);

function createStaffMember(
  overrides: Partial<StaffMember> & Pick<StaffMember, "id" | "name" | "role">,
): StaffMember {
  return {
    email: "user@example.com",
    phone: null,
    clinic_id: "clinic-1",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function setupUseStaffListMock(
  overrides?: Partial<ReturnType<typeof useStaffList>>,
) {
  const clearErrorMock = vi.fn();

  const mockValue: ReturnType<typeof useStaffList> = {
    staff: [],
    isLoading: false,
    isError: false,
    errorMessage: null,
    refetch: vi.fn(),
    clearError: clearErrorMock,
    ...overrides,
  };

  useStaffListMock.mockReturnValue(mockValue);

  return { clearErrorMock };
}

describe("StaffListPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza título e subtítulo", () => {
    setupUseStaffListMock();

    render(<StaffListPageContent />);

    expect(
      screen.getByRole("heading", { name: "Usuários" }),
    ).toBeTruthy();
    expect(
      screen.getByText("Membros da equipe cadastrados na clínica."),
    ).toBeTruthy();
  });

  it("renderiza Loading durante carregamento", () => {
    setupUseStaffListMock({ isLoading: true });

    render(<StaffListPageContent />);

    expect(screen.getByText("Carregando usuários")).toBeTruthy();
  });

  it("exibe GlobalModal de erro e permite dismiss via clearError", async () => {
    const user = userEvent.setup();
    const { clearErrorMock } = setupUseStaffListMock({
      isError: true,
      errorMessage: "Sem permissão para listar usuários.",
    });

    render(<StaffListPageContent />);

    expect(screen.getByRole("alert")).toBeTruthy();
    expect(
      screen.getByText("Sem permissão para listar usuários."),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Fechar erro" }));

    expect(clearErrorMock).toHaveBeenCalledTimes(1);
  });

  it("exibe tabela com colunas quando há dados", () => {
    setupUseStaffListMock({
      staff: [
        createStaffMember({
          id: "1",
          name: "Ana Silva",
          email: "ana@example.com",
          phone: "+5511999999999",
          role: AppRole.Doctor,
        }),
      ],
    });

    render(<StaffListPageContent />);

    expect(screen.getByRole("columnheader", { name: "Nome" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "E-mail" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Telefone" })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: "Perfil" })).toBeTruthy();
    expect(screen.getByText("Ana Silva")).toBeTruthy();
  });

  it("exibe estado vazio quando staff é array vazio", () => {
    setupUseStaffListMock({ staff: [] });

    render(<StaffListPageContent />);

    expect(screen.getByText("Nenhum usuário cadastrado.")).toBeTruthy();
  });

  it("não exibe modal de sucesso após carregar dados", async () => {
    setupUseStaffListMock({
      staff: [
        createStaffMember({ id: "1", name: "Ana", role: AppRole.Doctor }),
      ],
    });

    renderWithQueryClient(<StaffListPageContent />);

    await waitFor(() => {
      expect(screen.getByText("Ana")).toBeTruthy();
    });

    expect(screen.queryByText(/sucesso/i)).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
