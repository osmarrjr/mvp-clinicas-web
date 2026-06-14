import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { APP_NAV_ITEMS, AppSidebar } from "./AppSidebar";

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

const usePathnameMock = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
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

function renderAppSidebar() {
  return render(
    <TooltipProvider>
      <SidebarProvider
        style={{ "--sidebar-width-icon": "6rem" } as React.CSSProperties}
      >
        <AppSidebar />
      </SidebarProvider>
    </TooltipProvider>,
  );
}

describe("AppSidebar", () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue("/agenda/lista");
  });

  it("renders navigation items with correct labels and links", () => {
    renderAppSidebar();

    for (const item of APP_NAV_ITEMS) {
      const link = screen.getByRole("link", { name: item.label });
      expect(link.getAttribute("href")).toBe(item.path);
    }
  });

  it("highlights the active item based on pathname", () => {
    usePathnameMock.mockReturnValue("/agenda/agendamentos");

    renderAppSidebar();

    expect(screen.getByRole("link", { name: "Agenda" }).getAttribute("data-active")).toBe(
      "true",
    );
    expect(screen.getByRole("link", { name: "Convênios" }).getAttribute("data-active")).toBe(
      "false",
    );
  });
});
