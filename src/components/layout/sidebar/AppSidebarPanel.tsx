"use client";

import type { ReactNode } from "react";

import { AUTH_SHELL_BORDER } from "@/lib/theme/auth-shell-gradient";
import { cn } from "@/lib/utils";

import { SIDEBAR_EXPANDED_WIDTH, SIDEBAR_ICON_WIDTH } from "./config";
import { useSidebar } from "./SidebarContext";

type AppSidebarPanelProps = {
  children: ReactNode;
};

export function AppSidebarPanel({ children }: AppSidebarPanelProps) {
  const { state, isMobile } = useSidebar();

  if (isMobile) {
    return null;
  }

  const sidebarWidth =
    state === "collapsed" ? SIDEBAR_ICON_WIDTH : SIDEBAR_EXPANDED_WIDTH;

  return (
    <div
      className="group peer hidden md:block"
      data-state={state}
      data-slot="sidebar"
    >
      <div
        data-slot="sidebar-gap"
        className="relative bg-transparent transition-[width] duration-200 ease-linear"
        style={{ width: sidebarWidth }}
      />
      <div
        data-slot="sidebar-container"
        data-side="left"
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden h-svh overflow-visible border-r transition-[width] duration-200 ease-linear md:flex",
          AUTH_SHELL_BORDER,
        )}
        style={
          {
            width: sidebarWidth,
            "--sidebar-width": sidebarWidth,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </div>
  );
}
