import { cn } from "@/lib/utils";

import { APP_NAV_ITEMS } from "./config";
import { NavMenuItem } from "./NavMenuItem";
import { isItemOrChildrenActive, useCompactNav } from "./utils";

type MainNavigationProps = {
  pathname: string;
};

export function MainNavigation({ pathname }: MainNavigationProps) {
  const { compact, isMobile } = useCompactNav();

  return (
    <>
      <nav
        aria-label="Principal"
        className="flex min-h-0 flex-1 flex-col overflow-visible"
      >
        <div className="overflow-visible group-data-[collapsed=true]:p-1">
          <div className="overflow-visible">
            <ul
              className={cn(
                "space-y-1 overflow-visible px-2",
                isMobile && "px-0.5",
                "group-data-[collapsed=true]:px-0.5",
              )}
            >
              {APP_NAV_ITEMS.map((item) => (
                <NavMenuItem
                  key={item.path}
                  item={item}
                  pathname={pathname}
                  isActive={isItemOrChildrenActive(pathname, item)}
                  compact={compact}
                />
              ))}
            </ul>
          </div>
        </div>
      </nav>

      <div data-slot="sidebar-footer" data-sidebar="footer">
        <div
          className={cn(
            "flex justify-center px-2 py-4 text-xs font-medium text-white group-data-[collapsed=true]:hidden",
            isMobile && "hidden",
          )}
        >
          Versão 1.0
        </div>
      </div>
    </>
  );
}
