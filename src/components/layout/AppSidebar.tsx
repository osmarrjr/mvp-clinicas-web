"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import {
  AUTH_SHELL_BORDER,
  AUTH_SHELL_FOREGROUND,
} from "@/lib/theme/auth-shell-gradient";
import { cn } from "@/lib/utils";

import { ShellGradientSurface } from "./ShellGradientSurface";
import { AppSidebarHeader } from "./sidebar/AppSidebarHeader";
import { AppSidebarPanel } from "./sidebar/AppSidebarPanel";
import { MainNavigation } from "./sidebar/MainNavigation";
import { MobileSidebarOverlay } from "./sidebar/MobileSidebarOverlay";
import { SidebarProvider, useSidebar } from "./sidebar/SidebarContext";
import { useCompactNav } from "./sidebar/utils";

export { APP_NAV_ITEMS } from "./sidebar/config";
export type { AppNavItem } from "./sidebar/types";

type SidebarInnerProps = {
  pathname: string;
  isMobile: boolean;
};

function SidebarInner({ pathname, isMobile }: SidebarInnerProps) {
  const { state } = useSidebar();
  const isCollapsed = isMobile || state === "collapsed";

  return (
    <div
      data-sidebar="sidebar"
      data-slot="sidebar-inner"
      data-state={isMobile ? "expanded" : state}
      data-collapsed={isCollapsed ? "true" : "false"}
      className={cn(
        "group/sidebar group flex size-full flex-col overflow-visible",
        AUTH_SHELL_FOREGROUND,
      )}
    >
      <ShellGradientSurface
        className="h-full min-h-0"
        contentClassName="flex h-full min-h-0 flex-col"
      >
        <AppSidebarHeader isMobile={isMobile} />
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            !isMobile && cn("border-r", AUTH_SHELL_BORDER),
          )}
        >
          <MainNavigation pathname={pathname} />
        </div>
      </ShellGradientSurface>
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile } = useCompactNav();

  return (
    <>
      <AppSidebarPanel>
        <SidebarInner pathname={pathname} isMobile={isMobile} />
      </AppSidebarPanel>
      <MobileSidebarOverlay>
        <SidebarInner pathname={pathname} isMobile={isMobile} />
      </MobileSidebarOverlay>
    </>
  );
}

export function AppSidebarProvider({ children }: { children: ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
