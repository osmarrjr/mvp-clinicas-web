import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";

import { SidebarProvider, useSidebar } from "./SidebarContext";
import { useCompactNav } from "./utils";

const useIsMobileMock = vi.fn();

vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => useIsMobileMock(),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}

describe("SidebarContext", () => {
  beforeEach(() => {
    useIsMobileMock.mockReturnValue(false);
  });

  it("starts expanded on desktop", () => {
    const { result } = renderHook(() => useSidebar(), { wrapper });

    expect(result.current.state).toBe("expanded");
    expect(result.current.open).toBe(true);
    expect(result.current.openMobile).toBe(false);
  });

  it("toggleSidebar collapses and expands on desktop", () => {
    const { result } = renderHook(() => useSidebar(), { wrapper });

    act(() => {
      result.current.toggleSidebar();
    });
    expect(result.current.state).toBe("collapsed");
    expect(result.current.open).toBe(false);

    act(() => {
      result.current.toggleSidebar();
    });
    expect(result.current.state).toBe("expanded");
    expect(result.current.open).toBe(true);
  });

  it("toggleSidebar opens mobile drawer when on mobile", () => {
    useIsMobileMock.mockReturnValue(true);

    const { result } = renderHook(() => useSidebar(), { wrapper });

    expect(result.current.openMobile).toBe(false);

    act(() => {
      result.current.toggleSidebar();
    });
    expect(result.current.openMobile).toBe(true);
  });

  it("setOpenMobile closes mobile drawer", () => {
    useIsMobileMock.mockReturnValue(true);

    const { result } = renderHook(() => useSidebar(), { wrapper });

    act(() => {
      result.current.toggleSidebar();
    });
    expect(result.current.openMobile).toBe(true);

    act(() => {
      result.current.setOpenMobile(false);
    });
    expect(result.current.openMobile).toBe(false);
  });

  it("useCompactNav returns compact true when desktop sidebar is collapsed", () => {
    const { result } = renderHook(
      () => ({
        sidebar: useSidebar(),
        compactNav: useCompactNav(),
      }),
      { wrapper },
    );

    expect(result.current.compactNav.compact).toBe(false);
    expect(result.current.compactNav.isMobile).toBe(false);

    act(() => {
      result.current.sidebar.toggleSidebar();
    });

    expect(result.current.compactNav.compact).toBe(true);
    expect(result.current.compactNav.isMobile).toBe(false);
  });

  it("useCompactNav returns compact true on mobile", () => {
    useIsMobileMock.mockReturnValue(true);

    const { result } = renderHook(() => useCompactNav(), { wrapper });

    expect(result.current.compact).toBe(true);
    expect(result.current.isMobile).toBe(true);
  });
});
