import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { NavChildLink } from "./NavChildLink";
import { NavLinkContent } from "./NavLinkContent";
import {
  FLYOUT_PANEL_CLASS,
  FLYOUT_WRAPPER_BASE_CLASS,
  FLYOUT_WRAPPER_HIDDEN_CLASS,
  FLYOUT_WRAPPER_VISIBLE_CLASS,
  getMenuItemClass,
} from "./styles";
import type { AppNavItem } from "./types";
import { useCloseMobileSidebarOnNavigate, useCompactNav } from "./utils";

type NavMenuItemProps = {
  item: AppNavItem;
  pathname: string;
  isActive: boolean;
  compact: boolean;
  openSubmenuPath?: string | null;
  onSubmenuChange?: (path: string | null) => void;
};

function NavMobileClickFlyout({
  item,
  isActive,
  compact,
  openSubmenuPath,
  onSubmenuChange,
}: NavMenuItemProps) {
  const rootRef = useRef<HTMLLIElement>(null);
  const open = openSubmenuPath === item.path;
  const closeFlyout = useCallback(
    () => onSubmenuChange?.(null),
    [onSubmenuChange],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onSubmenuChange?.(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, onSubmenuChange]);

  return (
    <li ref={rootRef} className="relative overflow-visible">
      <button
        type="button"
        className={getMenuItemClass(isActive, compact, { surface: "sidebar" })}
        aria-expanded={open}
        onClick={() => onSubmenuChange?.(open ? null : item.path)}
      >
        <NavLinkContent
          item={item}
          isActive={isActive}
          compact={compact}
          surface="sidebar"
        />
      </button>

      {open ? (
        <div className="absolute left-full top-0 z-50 w-63 pl-3">
          <div className={FLYOUT_PANEL_CLASS}>
            <div className="space-y-1">
              {item.children?.map((child) => (
                <NavChildLink
                  key={child.path}
                  item={child}
                  onNavigate={closeFlyout}
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
  const [hovered, setHovered] = useState(false);
  const hideUntilLeaveRef = useRef(false);
  const closeMobileSidebar = useCloseMobileSidebarOnNavigate();

  useEffect(() => {
    hideUntilLeaveRef.current = true;
    setHovered(false);
  }, [pathname]);

  function handleMouseEnter() {
    if (!hideUntilLeaveRef.current) {
      setHovered(true);
    }
  }

  function handleMouseLeave() {
    hideUntilLeaveRef.current = false;
    setHovered(false);
  }

  function handleChildNavigate() {
    hideUntilLeaveRef.current = true;
    setHovered(false);
  }

  return (
    <li
      className="relative overflow-visible"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        href={item.path}
        aria-label={item.label}
        data-active={isActive ? "true" : "false"}
        className={getMenuItemClass(isActive, compact, { surface: "sidebar" })}
        onClick={closeMobileSidebar}
      >
        <NavLinkContent
          item={item}
          isActive={isActive}
          compact={compact}
          showChevron={!compact}
          surface="sidebar"
        />
      </Link>

      <div
        className={cn(
          FLYOUT_WRAPPER_BASE_CLASS,
          hovered
            ? FLYOUT_WRAPPER_VISIBLE_CLASS
            : FLYOUT_WRAPPER_HIDDEN_CLASS,
        )}
      >
        <div className={FLYOUT_PANEL_CLASS}>
          <div className="space-y-1">
            {item.children?.map((child) => (
              <NavChildLink
                key={child.path}
                item={child}
                onNavigate={handleChildNavigate}
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
        className={getMenuItemClass(isActive, compact, { surface: "sidebar" })}
        onClick={closeMobileSidebar}
      >
        <NavLinkContent
          item={item}
          isActive={isActive}
          compact={compact}
          surface="sidebar"
        />
      </Link>
    </li>
  );
}

export function NavMenuItem({
  item,
  pathname,
  isActive,
  compact,
  openSubmenuPath,
  onSubmenuChange,
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
          openSubmenuPath={openSubmenuPath}
          onSubmenuChange={onSubmenuChange}
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
