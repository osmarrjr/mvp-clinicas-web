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

  it("closes mobile submenu when a child link is clicked", () => {
    useIsMobileMock.mockReturnValue(true);

    render(
      <SidebarProvider>
        <MobileToggleHarness />
        <AppSidebar />
      </SidebarProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu mobile" }));

    const agendaButton = screen.getByRole("button", { name: "Agenda" });
    fireEvent.click(agendaButton);
    expect(agendaButton.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(screen.getByRole("link", { name: "Lista" }));

    expect(agendaButton.getAttribute("aria-expanded")).toBe("false");
  });

  it("closes mobile submenu when pathname changes", () => {
    useIsMobileMock.mockReturnValue(true);
    usePathnameMock.mockReturnValue("/agenda/lista");

    const { rerender } = render(
      <SidebarProvider>
        <MobileToggleHarness />
        <AppSidebar />
      </SidebarProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu mobile" }));

    const agendaButton = screen.getByRole("button", { name: "Agenda" });
    fireEvent.click(agendaButton);
    expect(agendaButton.getAttribute("aria-expanded")).toBe("true");

    usePathnameMock.mockReturnValue("/agenda/agendamentos");
    rerender(
      <SidebarProvider>
        <MobileToggleHarness />
        <AppSidebar />
      </SidebarProvider>,
    );

    expect(agendaButton.getAttribute("aria-expanded")).toBe("false");
  });

  it("closes mobile submenu when pathname changes", () => {
    useIsMobileMock.mockReturnValue(true);
    usePathnameMock.mockReturnValue("/agenda/lista");

    const { rerender } = render(
      <SidebarProvider>
        <MobileToggleHarness />
        <AppSidebar />
      </SidebarProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu mobile" }));

    const agendaButton = screen.getByRole("button", { name: "Agenda" });
    fireEvent.click(agendaButton);
    expect(agendaButton.getAttribute("aria-expanded")).toBe("true");

    usePathnameMock.mockReturnValue("/agenda/agendamentos");
    rerender(
      <SidebarProvider>
        <MobileToggleHarness />
        <AppSidebar />
      </SidebarProvider>,
    );

    expect(agendaButton.getAttribute("aria-expanded")).toBe("false");
  });

  it("keeps only one mobile submenu open at a time", () => {
    useIsMobileMock.mockReturnValue(true);

    render(
      <SidebarProvider>
        <MobileToggleHarness />
        <AppSidebar />
      </SidebarProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu mobile" }));

    const agendaButton = screen.getByRole("button", { name: "Agenda" });
    const conveniosButton = screen.getByRole("button", { name: "Convênios" });

    fireEvent.click(agendaButton);
    expect(agendaButton.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(conveniosButton);
    expect(agendaButton.getAttribute("aria-expanded")).toBe("false");
    expect(conveniosButton.getAttribute("aria-expanded")).toBe("true");
  });

  it("opens desktop submenu on hover and reopens after leaving once navigation dismissed it", () => {
    useIsMobileMock.mockReturnValue(false);
    usePathnameMock.mockReturnValue("/agenda/lista");

    renderAppSidebar();

    const agendaLink = screen.getByRole("link", { name: "Agenda" });
    const listItem = agendaLink.closest("li");
    expect(listItem).not.toBeNull();

    const flyout = listItem!.querySelector("[class*='absolute left-full']");
    expect(flyout).not.toBeNull();

    fireEvent.mouseEnter(listItem!);
    expect(flyout!.className).toContain("visible");

    fireEvent.click(screen.getByRole("link", { name: "Agendamentos" }));

    fireEvent.mouseEnter(listItem!);
    expect(flyout!.className).toContain("invisible");

    fireEvent.mouseLeave(listItem!);
    fireEvent.mouseEnter(listItem!);
    expect(flyout!.className).toContain("visible");
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
