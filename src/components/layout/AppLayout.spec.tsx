import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { AppLayout } from "./AppLayout";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

vi.mock("@/features/auth/hooks/useLogout", () => ({
  useLogout: () => ({
    logout: vi.fn(),
    isPending: false,
  }),
}));

describe("AppLayout", () => {
  it("compõe sidebar, header e children", () => {
    render(
      <AppLayout>
        <p>Conteúdo interno</p>
      </AppLayout>,
    );

    expect(screen.getByRole("navigation", { name: "Menu principal" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Alternar menu" })).toBeTruthy();
    expect(screen.getByText("Conteúdo interno")).toBeTruthy();
  });
});
