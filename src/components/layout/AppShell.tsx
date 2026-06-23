"use client";

import { ChevronsLeft, ChevronsRight } from "lucide-react";

import { UserMenu } from "@/features/auth/components/UserMenu/UserMenu";
import { Button } from "@/components/ui/button";

import { AppSidebar, AppSidebarProvider } from "./AppSidebar";
import { useSidebar } from "./sidebar/SidebarContext";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <AppSidebarProvider>
      <AppSidebar />
      <AppShellContent>{children}</AppShellContent>
    </AppSidebarProvider>
  );
}

function AppShellContent({ children }: AppShellProps) {
  const { openMobile, toggleSidebar } = useSidebar();

  const MobileToggleIcon = openMobile ? ChevronsLeft : ChevronsRight;

  return (
    <div className="flex min-h-svh min-w-0 flex-1 flex-col">
      <header className="relative z-10 w-full border-b border-gray-300/80 bg-sidebar shadow-[0_4px_24px_rgba(37,99,235,0.22)]">
        <div className="flex h-14 w-full items-center justify-between gap-2 px-2 md:px-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={openMobile ? "Fechar menu" : "Abrir menu"}
          onClick={toggleSidebar}
          className="-ml-2 md:hidden"
        >
          <MobileToggleIcon className="size-5" strokeWidth={2.25} />
        </Button>

        <div className="ml-auto">
          <UserMenu />
        </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
