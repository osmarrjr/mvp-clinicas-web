import Link from "next/link";

import { getMenuItemClass } from "./styles";
import { NavLinkContent } from "./NavLinkContent";
import type { AppNavItem } from "./types";
import { useCloseMobileSidebarOnNavigate } from "./utils";

type NavChildLinkProps = {
  item: AppNavItem;
  isActive: boolean;
};

export function NavChildLink({ item, isActive }: NavChildLinkProps) {
  const closeMobileSidebar = useCloseMobileSidebarOnNavigate();

  return (
    <Link
      href={item.path}
      aria-label={item.label}
      data-active={isActive ? "true" : "false"}
      className={getMenuItemClass(isActive)}
      onClick={closeMobileSidebar}
    >
      <NavLinkContent item={item} isActive={isActive} />
    </Link>
  );
}
