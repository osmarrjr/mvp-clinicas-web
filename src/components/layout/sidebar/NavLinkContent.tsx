import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { getNavIconClass, getNavLabelClass, type MenuSurface } from "./styles";
import type { AppNavItem } from "./types";

type NavLinkContentProps = {
  item: AppNavItem;
  isActive?: boolean;
  compact?: boolean;
  showChevron?: boolean;
  surface?: MenuSurface;
};

export function NavLinkContent({
  item,
  isActive = false,
  compact = false,
  showChevron = false,
  surface = "flyout",
}: NavLinkContentProps) {
  const Icon = item.icon;

  return (
    <>
      <Icon aria-hidden="true" className={getNavIconClass(isActive, compact, surface)} />

      <span className={getNavLabelClass(isActive, compact, surface)}>{item.label}</span>

      {showChevron ? (
        <ChevronRight
          aria-hidden="true"
          className={cn(
            getNavIconClass(isActive, false, surface),
            "group-data-[collapsed=true]:hidden",
          )}
        />
      ) : null}
    </>
  );
}
