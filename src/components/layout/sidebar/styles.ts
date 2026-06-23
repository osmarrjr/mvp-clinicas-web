import {
  AUTH_SHELL_ACTIVE_BG,
  AUTH_SHELL_ACTIVE_HOVER,
  AUTH_SHELL_HOVER,
  AUTH_SHELL_ICON,
} from "@/lib/theme/auth-shell-gradient";
import { cn } from "@/lib/utils";

export const FLYOUT_PANEL_CLASS =
  "w-60 rounded-md border bg-white p-2 shadow-lg";

export const FLYOUT_WRAPPER_BASE_CLASS =
  "absolute left-full top-0 z-50 w-63 pl-3 transition-all duration-150";

export const FLYOUT_WRAPPER_VISIBLE_CLASS =
  "visible pointer-events-auto opacity-100";

export const FLYOUT_WRAPPER_HIDDEN_CLASS =
  "invisible pointer-events-none opacity-0";

export type MenuSurface = "sidebar" | "flyout";

type MenuItemClassOptions = {
  surface?: MenuSurface;
};

function getFlyoutTextClass() {
  return "text-blue-700";
}

function getSidebarTextClass(isActive: boolean) {
  return isActive ? "text-white" : "text-sky-100";
}

function getFlyoutIconClass(compact = false) {
  return cn("shrink-0 text-blue-600", compact ? "size-6" : "size-5");
}

function getSidebarIconClass(isActive: boolean, compact = false) {
  return cn(
    "shrink-0",
    compact ? "size-6" : "size-5",
    isActive ? "text-white" : AUTH_SHELL_ICON,
  );
}

export function getSidebarMenuItemClass(isActive: boolean, compact = false) {
  return cn(
    "flex h-auto w-full items-center gap-2.5 rounded-md text-base font-medium leading-6 transition-colors cursor-pointer",
    compact
      ? "flex-col items-center justify-center gap-1 px-0.5 py-1.5 group-data-[collapsed=true]:!h-auto group-data-[collapsed=true]:!w-full group-data-[collapsed=true]:!max-w-full"
      : "px-2 py-3",
    isActive
      ? cn(AUTH_SHELL_ACTIVE_BG, "text-white", AUTH_SHELL_ACTIVE_HOVER)
      : cn("bg-transparent", AUTH_SHELL_HOVER),
  );
}

export function getFlyoutMenuItemClass(compact = false) {
  return cn(
    "flex h-auto w-full items-center gap-2.5 rounded-md text-base font-medium leading-6 transition-colors cursor-pointer",
    compact
      ? "flex-col items-center justify-center gap-1 px-0.5 py-1.5 group-data-[collapsed=true]:!h-auto group-data-[collapsed=true]:!w-full group-data-[collapsed=true]:!max-w-full"
      : "px-2 py-3",
    "bg-transparent text-blue-700 hover:bg-slate-100 hover:text-blue-800",
  );
}

export function getMenuItemClass(
  isActive: boolean,
  compact = false,
  options?: MenuItemClassOptions,
) {
  const surface = options?.surface ?? "flyout";

  if (surface === "sidebar") {
    return getSidebarMenuItemClass(isActive, compact);
  }

  return getFlyoutMenuItemClass(compact);
}

export function getNavLabelClass(
  isActive: boolean,
  compact = false,
  surface: MenuSurface = "flyout",
) {
  const textClass =
    surface === "sidebar"
      ? getSidebarTextClass(isActive)
      : getFlyoutTextClass();

  return cn(
    compact
      ? "max-w-full text-center text-xs font-medium leading-snug"
      : "flex-1 text-left text-base leading-6",
    textClass,
  );
}

export function getNavIconClass(
  isActive: boolean,
  compact = false,
  surface: MenuSurface = "flyout",
) {
  if (surface === "sidebar") {
    return getSidebarIconClass(isActive, compact);
  }

  return getFlyoutIconClass(compact);
}
