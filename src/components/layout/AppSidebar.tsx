"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Sidebar, SidebarProvider, SidebarRail } from "@/components/ui/sidebar";

import { AppSidebarHeader } from "./sidebar/AppSidebarHeader";
import { SIDEBAR_ICON_WIDTH, SIDEBAR_MOBILE_WIDTH } from "./sidebar/config";
import { MainNavigation } from "./sidebar/MainNavigation";
import { useCompactNav } from "./sidebar/utils";

export { APP_NAV_ITEMS } from "./sidebar/config";
export type { AppNavItem } from "./sidebar/types";

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile } = useCompactNav();

  return (
    <Sidebar collapsible="icon" mobileWidth={SIDEBAR_MOBILE_WIDTH}>
      <AppSidebarHeader isMobile={isMobile} />
      <MainNavigation pathname={pathname} />
      <SidebarRail />
    </Sidebar>
  );
}

export function AppSidebarProvider({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width-icon": SIDEBAR_ICON_WIDTH,
        } as React.CSSProperties
      }
    >
      {children}
    </SidebarProvider>
  );
}
