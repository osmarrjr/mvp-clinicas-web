import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import { APP_NAV_ITEMS } from "./config";
import { NavMenuItem } from "./NavMenuItem";
import { isItemOrChildrenActive, useCompactNav } from "./utils";

type MainNavigationProps = {
  pathname: string;
};

export function MainNavigation({ pathname }: MainNavigationProps) {
  const { compact, isMobile } = useCompactNav();

  return (
    <>
      <SidebarContent className="group-data-[state=expanded]:overflow-visible">
        <SidebarGroup className="group-data-[collapsible=icon]:p-1">
          <SidebarGroupContent>
            <SidebarMenu
              className={cn(
                "space-y-1 px-2",
                isMobile && "px-0.5",
                "group-data-[collapsible=icon]:px-0.5",
                "group-data-[state=expanded]:overflow-visible",
              )}
            >
              {APP_NAV_ITEMS.map((item) => (
                <NavMenuItem
                  key={item.path}
                  item={item}
                  pathname={pathname}
                  isActive={isItemOrChildrenActive(pathname, item)}
                  compact={compact}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div
          className={cn(
            "flex justify-center px-2 py-4 text-xs font-medium text-[#1B1C1E] group-data-[collapsible=icon]:hidden",
            isMobile && "hidden",
          )}
        >
          Versão 1.0
        </div>
      </SidebarFooter>
    </>
  );
}
