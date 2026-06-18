import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { NavChildLink } from "./NavChildLink";
import { NavLinkContent } from "./NavLinkContent";
import {
  FLYOUT_PANEL_CLASS,
  getMenuItemClass,
  HOVER_FLYOUT_WRAPPER_CLASS,
} from "./styles";
import type { AppNavItem } from "./types";
import {
  isNavItemActive,
  useCloseMobileSidebarOnNavigate,
  useCompactNav,
} from "./utils";

type NavMenuItemProps = {
  item: AppNavItem;
  pathname: string;
  isActive: boolean;
  compact: boolean;
};

function NavMobileClickFlyout({
  item,
  pathname,
  isActive,
  compact,
}: NavMenuItemProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <li ref={rootRef} className="relative overflow-visible">
      <button
        type="button"
        className={getMenuItemClass(isActive, compact)}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <NavLinkContent item={item} isActive={isActive} compact={compact} />
      </button>

      {open ? (
        <div className="absolute left-full top-0 z-50 w-63 pl-3">
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
      ) : null}
    </li>
  );
}

function NavHoverFlyout({
  item,
  pathname,
  isActive,
  compact,
}: NavMenuItemProps) {
  const closeMobileSidebar = useCloseMobileSidebarOnNavigate();

  return (
    <li className="group/flyout relative overflow-visible">
      <Link
        href={item.path}
        aria-label={item.label}
        data-active={isActive ? "true" : "false"}
        className={getMenuItemClass(isActive, compact)}
        onClick={closeMobileSidebar}
      >
        <NavLinkContent
          item={item}
          isActive={isActive}
          compact={compact}
          showChevron={!compact}
        />
      </Link>

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
    </li>
  );
}

function NavSimpleItem({ item, isActive, compact }: NavMenuItemProps) {
  const closeMobileSidebar = useCloseMobileSidebarOnNavigate();

  return (
    <li>
      <Link
        href={item.path}
        aria-label={item.label}
        data-active={isActive ? "true" : "false"}
        className={getMenuItemClass(isActive, compact)}
        onClick={closeMobileSidebar}
      >
        <NavLinkContent item={item} isActive={isActive} compact={compact} />
      </Link>
    </li>
  );
}

export function NavMenuItem({
  item,
  pathname,
  isActive,
  compact,
}: NavMenuItemProps) {
  const { isMobile } = useCompactNav();

  if (item.children?.length) {
    if (isMobile) {
      return (
        <NavMobileClickFlyout
          item={item}
          pathname={pathname}
          isActive={isActive}
          compact={compact}
        />
      );
    }

    return (
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
