import Link from "next/link";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type AppSidebarHeaderProps = {
  isMobile: boolean;
};

export function AppSidebarHeader({ isMobile }: AppSidebarHeaderProps) {
  const { open, openMobile, toggleSidebar } = useSidebar();

  const isSidebarOpen = isMobile ? openMobile : open;
  const ToggleIcon = isSidebarOpen ? ChevronsLeft : ChevronsRight;

  return (
    <SidebarHeader
      className={cn(
        "px-3 py-4",
        isMobile && "mt-0 px-0.5 py-2",
        "group-data-[collapsible=icon]:mt-2 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-2",
      )}
    >
      <div
        className={cn(
          "flex w-full flex-col items-center gap-3",
          isMobile && "gap-2",
          "group-data-[collapsible=icon]:gap-0",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Alternar menu lateral"
          onClick={toggleSidebar}
          className={cn(
            "h-8 w-8 shrink-0",
            !isMobile && "self-end",
            "group-data-[collapsible=icon]:self-center",
          )}
        >
          <ToggleIcon className="h-4 w-4" />
          <span className="sr-only">Alternar menu lateral</span>
        </Button>

        {!isMobile ? (
          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center group-data-[collapsible=icon]:hidden"
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="h-auto w-[160px] max-w-full object-contain"
            />
          </Link>
        ) : null}
      </div>
    </SidebarHeader>
  );
}
