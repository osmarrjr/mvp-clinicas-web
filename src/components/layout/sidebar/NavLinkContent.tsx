import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { getNavIconClass, getNavLabelClass } from "./styles";
import type { AppNavItem } from "./types";

type NavLinkContentProps = {
  item: AppNavItem;
  isActive: boolean;
  compact?: boolean;
  showChevron?: boolean;
};

export function NavLinkContent({
  item,
  isActive,
  compact = false,
  showChevron = false,
}: NavLinkContentProps) {
  const Icon = item.icon;

  return (
    <>
      <Icon aria-hidden="true" className={getNavIconClass(isActive, compact)} />

      <span className={getNavLabelClass(isActive, compact)}>{item.label}</span>

      {showChevron ? (
        <ChevronRight
          aria-hidden="true"
          className={cn(
            getNavIconClass(isActive),
            "group-data-[collapsed=true]:hidden",
          )}
        />
      ) : null}
    </>
  );
}
