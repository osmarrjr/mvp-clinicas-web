import { cn } from "@/lib/utils";

const GRADIENT_BACKGROUND =
  "bg-[linear-gradient(90deg,#1d4ed8_0%,#2563eb_45%,#0ea5e9_100%)]";

const GRADIENT_BACKGROUND_ACTIVE_ITEM =
  "bg-[linear-gradient(90deg,#3b82f6_0%,#60a5fa_45%,#38bdf8_100%)]";

const GRADIENT_TEXT = cn(GRADIENT_BACKGROUND, "bg-clip-text text-transparent");

export const FLYOUT_PANEL_CLASS =
  "w-60 rounded-md border bg-white p-2 shadow-lg";

export const HOVER_FLYOUT_WRAPPER_CLASS = cn(
  "invisible pointer-events-none absolute left-full top-0 z-50 w-63 pl-3 opacity-0 transition-all duration-150",
  "group-hover/flyout:visible group-hover/flyout:pointer-events-auto group-hover/flyout:opacity-100",
  "group-focus-within/flyout:visible group-focus-within/flyout:pointer-events-auto group-focus-within/flyout:opacity-100",
);

function getTextClass(isActive: boolean) {
  return isActive ? "!text-white" : GRADIENT_TEXT;
}

function getIconClass(isActive: boolean, compact = false) {
  return cn(
    "shrink-0",
    compact ? "size-5" : "size-4",
    isActive ? "!text-white" : "!text-blue-600",
  );
}

export function getMenuItemClass(isActive: boolean, compact = false) {
  return cn(
    "flex h-auto w-full items-center gap-2 rounded-md text-sm font-medium leading-5 transition-colors",
    compact
      ? "flex-col items-center justify-center gap-1 px-0.5 py-1.5 group-data-[collapsible=icon]:!h-auto group-data-[collapsible=icon]:!w-full group-data-[collapsible=icon]:!max-w-full"
      : "px-2 py-3",
    isActive
      ? cn(GRADIENT_BACKGROUND_ACTIVE_ITEM, "!text-white hover:!text-white")
      : "!bg-transparent hover:!bg-slate-200/90 hover:!text-blue-700",
  );
}

export function getNavLabelClass(isActive: boolean, compact = false) {
  return cn(
    compact
      ? "max-w-full text-center text-[11px] font-medium leading-tight"
      : "flex-1 text-left text-sm leading-5 group-data-[collapsible=icon]:hidden",
    getTextClass(isActive),
  );
}

export function getNavIconClass(isActive: boolean, compact = false) {
  return getIconClass(isActive, compact);
}
