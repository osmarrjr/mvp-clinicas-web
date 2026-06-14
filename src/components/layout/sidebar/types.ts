import type { LucideIcon } from "lucide-react";

export type AppNavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
  children?: AppNavItem[];
};
