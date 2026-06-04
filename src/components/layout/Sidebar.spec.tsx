import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { APP_NAVIGATION } from "@/config/navigation";
import { Sidebar } from "./Sidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("Sidebar", () => {
  it("renderiza 10 itens com links de navegação", () => {
    render(<Sidebar />);

    expect(APP_NAVIGATION).toHaveLength(10);

    for (const item of APP_NAVIGATION) {
      const link = screen.getByRole("link", { name: item.label });
      expect(link.getAttribute("href")).toBe(item.href);
    }
  });

  it("destaca item ativo conforme rota atual", () => {
    render(<Sidebar />);

    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboardLink.className).toContain("bg-primary");
  });
});
