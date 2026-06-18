import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { LoginUser } from "../../types";
import { UserMenu } from "./UserMenu";

const USER: LoginUser = {
  id: "user-1",
  email: "user@example.com",
  name: null,
  phone: null,
};

const getStoredUserMock = vi.fn();

vi.mock("@/lib/auth/user-storage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth/user-storage")>();

  return {
    ...actual,
    getStoredUser: () => getStoredUserMock(),
    getUserDisplayName: (user: LoginUser) => user.name?.trim() || user.email,
  };
});

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

const logoutMock = vi.fn();

vi.mock("../../hooks/auth/useLogout", () => ({
  useLogout: () => ({
    logout: logoutMock,
    isPending: false,
  }),
}));

describe("UserMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStoredUserMock.mockReturnValue(USER);
  });

  it("renderiza menu com ícone padrão quando não há usuário armazenado", () => {
    getStoredUserMock.mockReturnValue(null);

    render(<UserMenu />);

    expect(
      screen.getByRole("button", { name: "Abrir menu do usuário" }),
    ).toBeTruthy();
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
    expect(screen.getByRole("menuitem", { name: /sair/i })).toBeTruthy();
  });

  it("chama logout ao clicar em Sair", async () => {
    const user = userEvent.setup();

    render(<UserMenu />);

    await user.click(
      screen.getByRole("button", { name: "Abrir menu do usuário" }),
    );
    await user.click(screen.getByRole("menuitem", { name: /sair/i }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
