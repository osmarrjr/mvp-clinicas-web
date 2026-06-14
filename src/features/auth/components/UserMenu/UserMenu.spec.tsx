import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { LoginUser } from "../../types";
import { UserMenu } from "./UserMenu";

const USER: LoginUser = {
  id: "user-1",
  email: "user@example.com",
};

const getStoredUserMock = vi.fn();

vi.mock("@/lib/auth/user-storage", () => ({
  getStoredUser: () => getStoredUserMock(),
  getUserDisplayName: (user: LoginUser) =>
    (user as LoginUser & { name?: string }).name?.trim() || user.email,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("../LogoutButton/LogoutButton", () => ({
  LogoutButton: () => <button type="button">Sair</button>,
}));

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStoredUserMock.mockReturnValue(USER);
  });

  it("não renderiza quando não há usuário armazenado", () => {
    getStoredUserMock.mockReturnValue(null);

    const { container } = render(<UserMenu />);

    expect(container.firstChild).toBeNull();
  });

  it("exibe o e-mail do usuário e as opções do menu", async () => {
    const user = userEvent.setup();

    render(<UserMenu />);

    await user.click(
      screen.getByRole("button", { name: "Abrir menu do usuário" }),
    );

    expect(screen.getByText(USER.email)).toBeTruthy();
    expect(
      screen.getByRole("menuitem", { name: /perfil/i }).getAttribute("href"),
    ).toBe("/profile");
    expect(screen.getByRole("button", { name: /sair/i })).toBeTruthy();
  });
});
