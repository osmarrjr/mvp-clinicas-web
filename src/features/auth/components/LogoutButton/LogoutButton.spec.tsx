import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LogoutButton } from "./LogoutButton";

const logoutMock = vi.fn();

vi.mock("../../hooks/auth/useLogout", () => ({
  useLogout: () => ({
    logout: logoutMock,
    isPending: false,
  }),
}));

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenuItem: ({
    children,
    onSelect,
    disabled,
  }: {
    children: React.ReactNode;
    onSelect?: (event: { preventDefault: () => void }) => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect?.({ preventDefault: () => undefined })}
    >
      {children}
    </button>
  ),
}));

describe("LogoutButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza a opção Sair", () => {
    render(<LogoutButton />);

    expect(screen.getByRole("button", { name: /sair/i })).toBeTruthy();
  });

  it("chama logout ao clicar", async () => {
    const user = userEvent.setup();

    render(<LogoutButton />);

    await user.click(screen.getByRole("button", { name: /sair/i }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
