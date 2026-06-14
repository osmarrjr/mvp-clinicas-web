import Link from "next/link";

import { SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type AppSidebarHeaderProps = {
  isMobile: boolean;
};

export function AppSidebarHeader({ isMobile }: AppSidebarHeaderProps) {
  return (
    <SidebarHeader
      className={cn(
        "mt-5 px-3 py-4",
        isMobile && "mt-0 px-0.5 py-2",
        "group-data-[collapsible=icon]:mt-2 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-2",
      )}
    >
      <div
        className={cn(
          "flex w-full items-center gap-2",
          isMobile ? "justify-end" : "justify-between",
          "group-data-[collapsible=icon]:justify-center",
        )}
      >
        {!isMobile ? (
          <Link
            href="/dashboard"
            className="flex flex-1 items-center justify-center group-data-[collapsible=icon]:hidden"
          >
            <img
              src="/logo.png"
              alt="Logo"
              className="h-auto w-[160px] max-w-full object-contain"
            />
          </Link>
        ) : null}

        <SidebarTrigger aria-label="Alternar menu lateral" className="shrink-0" />
      </div>
    </SidebarHeader>
  );
}
