import Link from "next/link";

import { getMenuItemClass } from "./styles";
import { NavLinkContent } from "./NavLinkContent";
import type { AppNavItem } from "./types";
import { useCloseMobileSidebarOnNavigate } from "./utils";

type NavChildLinkProps = {
  item: AppNavItem;
  onNavigate?: () => void;
};

export function NavChildLink({ item, onNavigate }: NavChildLinkProps) {
  const closeMobileSidebar = useCloseMobileSidebarOnNavigate();

  function handleClick() {
    onNavigate?.();
    closeMobileSidebar();
  }

  return (
    <Link
      href={item.path}
      aria-label={item.label}
      className={getMenuItemClass(false, false, { surface: "flyout" })}
      onClick={handleClick}
    >
      <NavLinkContent item={item} surface="flyout" />
    </Link>
  );
}
