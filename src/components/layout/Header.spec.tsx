import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Header } from "./Header";

const logoutMock = vi.fn();

vi.mock("@/features/auth/hooks/useLogout", () => ({
  useLogout: () => ({
    logout: logoutMock,
    isPending: false,
  }),
}));

describe("Header", () => {
  it("renderiza logo, botão toggle e dropdown do usuário", async () => {
    const user = userEvent.setup();
    const onToggleSidebar = vi.fn();

    render(<Header onToggleSidebar={onToggleSidebar} />);

    expect(screen.getByAltText("MVP Clínicas")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Alternar menu" }),
    ).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Menu do usuário" }));

    expect(screen.getByRole("menuitem", { name: "Conta" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Permissões" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Sair" })).toBeTruthy();
  });

  it("dispara toggle ao clicar no botão de menu", async () => {
    const user = userEvent.setup();
    const onToggleSidebar = vi.fn();

    render(<Header onToggleSidebar={onToggleSidebar} />);

    await user.click(screen.getByRole("button", { name: "Alternar menu" }));

    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
  });
});
