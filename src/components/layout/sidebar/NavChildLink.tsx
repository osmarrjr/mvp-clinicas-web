import Link from "next/link";

import { getMenuItemClass } from "./styles";
import { NavLinkContent } from "./NavLinkContent";
import type { AppNavItem } from "./types";
import { useCloseMobileSidebarOnNavigate } from "./utils";

type NavChildLinkProps = {
  item: AppNavItem;
};

export function NavChildLink({ item }: NavChildLinkProps) {
  const closeMobileSidebar = useCloseMobileSidebarOnNavigate();

  return (
    <Link
      href={item.path}
      aria-label={item.label}
      className={getMenuItemClass(false, false, { surface: "flyout" })}
      onClick={closeMobileSidebar}
    >
      <NavLinkContent item={item} surface="flyout" />
    </Link>
  );
}
