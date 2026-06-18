"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

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
        "group/sidebar group flex size-full flex-col overflow-visible bg-sidebar text-sidebar-foreground",
      )}
    >
      <AppSidebarHeader isMobile={isMobile} />
      <MainNavigation pathname={pathname} />
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
