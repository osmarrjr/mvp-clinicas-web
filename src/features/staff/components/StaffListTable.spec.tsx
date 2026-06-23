import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AppRole } from "@/lib/auth/types";

import type { StaffMember } from "../types";
import { StaffListTable } from "./StaffListTable";

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

function renderStaffListTable(ui: ReactElement) {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
}

describe("StaffListTable", () => {
  it("renderiza coluna de ações com botões de editar e excluir", () => {
    renderStaffListTable(
      <StaffListTable
        data={[
          createStaffMember({
            id: "1",
            name: "Ana Silva",
            role: AppRole.Doctor,
          }),
        ]}
        isLoading={false}
      />,
    );

    expect(screen.getByRole("columnheader", { name: "Ações" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Editar usuário" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Excluir usuário" })).toBeTruthy();
  });

  it("dispara callbacks de editar e excluir", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const member = createStaffMember({
      id: "1",
      name: "Ana Silva",
      role: AppRole.Doctor,
    });

    renderStaffListTable(
      <StaffListTable
        data={[member]}
        isLoading={false}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Editar usuário" }));
    await user.click(screen.getByRole("button", { name: "Excluir usuário" }));

    expect(onEdit).toHaveBeenCalledWith(member);
    expect(onDelete).toHaveBeenCalledWith(member);
  });
});
