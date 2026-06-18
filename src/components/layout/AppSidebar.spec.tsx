import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { APP_NAV_ITEMS, AppSidebar } from "./AppSidebar";
import { SidebarProvider, useSidebar } from "./sidebar/SidebarContext";

const useIsMobileMock = vi.fn();

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => useIsMobileMock(),
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
    <SidebarProvider>
      <AppSidebar />
    </SidebarProvider>,
  );
}

function MobileToggleHarness() {
  const { toggleSidebar } = useSidebar();

  return (
    <button type="button" onClick={toggleSidebar}>
      Abrir menu mobile
    </button>
  );
}

describe("AppSidebar", () => {
  beforeEach(() => {
    useIsMobileMock.mockReturnValue(false);
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

  it("shows mobile overlay when menu is toggled", () => {
    useIsMobileMock.mockReturnValue(true);

    const { container } = render(
      <SidebarProvider>
        <MobileToggleHarness />
        <AppSidebar />
      </SidebarProvider>,
    );

    const panel = container.querySelector('[data-slot="sidebar-mobile"]');
    expect(panel?.getAttribute("aria-hidden")).toBe("true");

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu mobile" }));

    expect(panel?.getAttribute("aria-hidden")).toBe("false");
  });

  it("closes mobile overlay when backdrop is clicked", () => {
    useIsMobileMock.mockReturnValue(true);

    const { container } = render(
      <SidebarProvider>
        <MobileToggleHarness />
        <AppSidebar />
      </SidebarProvider>,
    );

    const panel = container.querySelector('[data-slot="sidebar-mobile"]');

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu mobile" }));
    expect(panel?.getAttribute("aria-hidden")).toBe("false");

    const backdrop = container.querySelector(".bg-black\\/20");
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);

    expect(panel?.getAttribute("aria-hidden")).toBe("true");
  });

  it("closes mobile overlay when Escape is pressed", () => {
    useIsMobileMock.mockReturnValue(true);

    const { container } = render(
      <SidebarProvider>
        <MobileToggleHarness />
        <AppSidebar />
      </SidebarProvider>,
    );

    const panel = container.querySelector('[data-slot="sidebar-mobile"]');

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu mobile" }));
    expect(panel?.getAttribute("aria-hidden")).toBe("false");

    fireEvent.keyDown(window, { key: "Escape" });

    expect(panel?.getAttribute("aria-hidden")).toBe("true");
  });

  it("closes mobile overlay when a navigation link is clicked", () => {
    useIsMobileMock.mockReturnValue(true);

    const { container } = render(
      <SidebarProvider>
        <MobileToggleHarness />
        <AppSidebar />
      </SidebarProvider>,
    );

    const panel = container.querySelector('[data-slot="sidebar-mobile"]');

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu mobile" }));
    expect(panel?.getAttribute("aria-hidden")).toBe("false");

    fireEvent.click(screen.getByRole("button", { name: "Agenda" }));
    fireEvent.click(screen.getByRole("link", { name: "Lista" }));

    expect(panel?.getAttribute("aria-hidden")).toBe("true");
  });

  it("hides footer version when desktop sidebar is collapsed", () => {
    const { container } = renderAppSidebar();

    const sidebarInner = container.querySelector('[data-slot="sidebar-inner"]');
    expect(sidebarInner?.getAttribute("data-collapsed")).toBe("false");
    expect(screen.getByText("Versão 1.0")).toBeTruthy();

    fireEvent.click(
      screen.getAllByRole("button", { name: "Alternar menu lateral" })[0]!,
    );

    expect(sidebarInner?.getAttribute("data-collapsed")).toBe("true");
    expect(screen.getByText("Versão 1.0").className).toContain(
      "group-data-[collapsed=true]:hidden",
    );
  });
});
