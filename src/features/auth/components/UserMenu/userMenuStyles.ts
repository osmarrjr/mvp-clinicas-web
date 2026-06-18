import { cn } from "@/lib/utils";

const USER_MENU_TEXT = "text-blue-700";
const USER_MENU_ICON = "text-blue-600";

export const USER_MENU_ITEM_CLASS = cn(
  "flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2",
  "text-[13px] font-semibold transition-colors",
  "bg-transparent",
  USER_MENU_TEXT,
  "hover:bg-slate-100 hover:text-blue-700",
  "focus:bg-slate-100 focus:text-blue-700",
  "data-[highlighted]:bg-slate-100 data-[highlighted]:text-blue-700",
  "not-data-[variant=destructive]:focus:**:!text-blue-700",
  "data-[highlighted]:**:!text-blue-700",
  "[&_svg]:text-blue-600",
  "focus:[&_svg]:!text-blue-600",
  "data-[highlighted]:[&_svg]:!text-blue-600",
);

export const USER_MENU_ICON_CLASS = cn("size-4 shrink-0", USER_MENU_ICON);

export const USER_MENU_LABEL_CLASS = USER_MENU_TEXT;
