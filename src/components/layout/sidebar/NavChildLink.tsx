import Link from "next/link";

import { getMenuItemClass } from "./styles";
import { NavLinkContent } from "./NavLinkContent";
import type { AppNavItem } from "./types";

type NavChildLinkProps = {
  item: AppNavItem;
  isActive: boolean;
};

export function NavChildLink({ item, isActive }: NavChildLinkProps) {
  return (
    <Link
      href={item.path}
      aria-label={item.label}
      data-active={isActive ? "true" : "false"}
      className={getMenuItemClass(isActive)}
    >
      <NavLinkContent item={item} isActive={isActive} />
    </Link>
  );
}
