import { ChevronsLeft, ChevronsRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useSidebar } from "./SidebarContext";

type AppSidebarHeaderProps = {
  isMobile: boolean;
};

export function AppSidebarHeader({ isMobile }: AppSidebarHeaderProps) {
  const { open, openMobile, toggleSidebar } = useSidebar();

  const isSidebarOpen = isMobile ? openMobile : open;
  const ToggleIcon = isSidebarOpen ? ChevronsLeft : ChevronsRight;

  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn(
        "flex flex-col gap-2 px-3 py-4 mt-6",
        isMobile && "mt-0 px-0.5 py-2",
        "group-data-[collapsed=true]:mt-2 group-data-[collapsed=true]:px-1 group-data-[collapsed=true]:py-2",
      )}
    >
      <div
        className={cn(
          "w-full items-center",
          isMobile
            ? "flex flex-col gap-2"
            : "grid grid-cols-[32px_1fr_32px] gap-3",
          "group-data-[collapsed=true]:flex group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:gap-0",
        )}
      >
        {!isMobile ? (
          <>
            <div />

            <div className="flex items-center justify-center group-data-[collapsed=true]:hidden">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-auto w-[160px] max-w-full cursor-default object-contain"
              />
            </div>
          </>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Alternar menu lateral"
          onClick={toggleSidebar}
          className={cn(
            "h-8 w-8 shrink-0 justify-self-end",
            isMobile && "self-center",
            "group-data-[collapsed=true]:self-center group-data-[collapsed=true]:justify-self-center",
          )}
        >
          <ToggleIcon className="h-4 w-4" />
          <span className="sr-only">Alternar menu lateral</span>
        </Button>
      </div>
    </div>
  );
}
