import { cn } from "@/lib/utils";

export const AUTH_SHELL_BASE_BG = "bg-[#0b1748]";

export const AUTH_SHELL_OVERLAY_BG =
  "bg-[radial-gradient(ellipse_at_top,#1e3a8a_0%,#172554_42%,#0b1748_100%)]";

export const AUTH_SHELL_BORDER = "border-white/10";

export const AUTH_SHELL_FOREGROUND = "text-white";

export const AUTH_SHELL_MUTED = "text-sky-200/80";

export const AUTH_SHELL_ICON = "text-sky-300";

export const AUTH_SHELL_HOVER = "hover:bg-white/10 hover:text-white";

export const AUTH_SHELL_ACTIVE_BG = "bg-white/15";

export const AUTH_SHELL_ACTIVE_HOVER = "hover:bg-white/20";

export const AUTH_SHELL_FOCUS_RING = "focus-visible:ring-white/30";

export const AUTH_SHELL_GHOST_BUTTON = cn(
  "!text-white hover:!bg-white/10 hover:!text-white",
  "dark:!text-white dark:hover:!bg-white/10 dark:hover:!text-white",
  "focus-visible:!border-transparent",
  AUTH_SHELL_FOCUS_RING,
  "[&_svg]:!text-white",
);

export const AUTH_SHELL_ACCENT_GRADIENT =
  "bg-[linear-gradient(90deg,#1d4ed8_0%,#2563eb_45%,#0ea5e9_100%)]";
