import { useCallback } from "react";

import { useSidebar } from "./SidebarContext";

import type { AppNavItem } from "./types";

export function isNavItemActive(pathname: string, itemPath: string): boolean {
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

export function isItemOrChildrenActive(pathname: string, item: AppNavItem): boolean {
  if (isNavItemActive(pathname, item.path)) {
    return true;
  }

  return (
    item.children?.some((child) => isNavItemActive(pathname, child.path)) ?? false
  );
}

export function useCompactNav() {
  const { state, isMobile } = useSidebar();

  return {
    compact: isMobile || state === "collapsed",
    isMobile,
  };
}

export function useCloseMobileSidebarOnNavigate() {
  const { isMobile, setOpenMobile } = useSidebar();

  return useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);
}
