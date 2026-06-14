import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { NavChildLink } from "./NavChildLink";
import { NavLinkContent } from "./NavLinkContent";
import { FLYOUT_PANEL_CLASS, getMenuItemClass, HOVER_FLYOUT_WRAPPER_CLASS } from "./styles";
import type { AppNavItem } from "./types";
import { isNavItemActive } from "./utils";

type NavMenuItemProps = {
  item: AppNavItem;
  pathname: string;
  isActive: boolean;
  compact: boolean;
};

function NavClickFlyout({ item, pathname, isActive, compact }: NavMenuItemProps) {
  return (
    <SidebarMenuItem>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            isActive={isActive}
            className={getMenuItemClass(isActive, compact)}
          >
            <NavLinkContent item={item} isActive={isActive} compact={compact} />
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={12}
          className={FLYOUT_PANEL_CLASS}
        >
          {item.children?.map((child) => (
            <DropdownMenuItem
              key={child.path}
              asChild
              className="rounded-2xl p-0 focus:bg-transparent"
            >
              <NavChildLink
                item={child}
                isActive={isNavItemActive(pathname, child.path)}
              />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

function NavHoverFlyout({ item, pathname, isActive }: NavMenuItemProps) {
  return (
    <SidebarMenuItem className="group/flyout relative overflow-visible">
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
        <Link
          href={item.path}
          aria-label={item.label}
          data-active={isActive ? "true" : "false"}
          className={getMenuItemClass(isActive)}
        >
          <NavLinkContent item={item} isActive={isActive} showChevron />
        </Link>
      </SidebarMenuButton>

      <div className={HOVER_FLYOUT_WRAPPER_CLASS}>
        <div className={FLYOUT_PANEL_CLASS}>
          <div className="space-y-1">
            {item.children?.map((child) => (
              <NavChildLink
                key={child.path}
                item={child}
                isActive={isNavItemActive(pathname, child.path)}
              />
            ))}
          </div>
        </div>
      </div>
    </SidebarMenuItem>
  );
}

function NavSimpleItem({ item, isActive, compact }: NavMenuItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={compact ? undefined : item.label}
      >
        <Link
          href={item.path}
          aria-label={item.label}
          data-active={isActive ? "true" : "false"}
          className={getMenuItemClass(isActive, compact)}
        >
          <NavLinkContent item={item} isActive={isActive} compact={compact} />
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function NavMenuItem({
  item,
  pathname,
  isActive,
  compact,
}: NavMenuItemProps) {
  if (item.children?.length) {
    return compact ? (
      <NavClickFlyout
        item={item}
        pathname={pathname}
        isActive={isActive}
        compact={compact}
      />
    ) : (
      <NavHoverFlyout
        item={item}
        pathname={pathname}
        isActive={isActive}
        compact={compact}
      />
    );
  }

  return (
    <NavSimpleItem
      item={item}
      pathname={pathname}
      isActive={isActive}
      compact={compact}
    />
  );
}
