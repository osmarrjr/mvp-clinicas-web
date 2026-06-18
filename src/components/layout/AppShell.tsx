"use client";

import { ChevronsLeft, ChevronsRight } from "lucide-react";

import { AppSidebar, AppSidebarProvider } from "./AppSidebar";
import { UserMenu } from "@/features/auth/components/UserMenu/UserMenu";
import { Button } from "@/components/ui/button";
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
      <header className="flex h-14 items-center justify-between gap-2 border-b bg-sidebar px-2 md:px-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={openMobile ? "Fechar menu" : "Abrir menu"}
          onClick={toggleSidebar}
          className="-ml-2 md:hidden"
        >
          <MobileToggleIcon className="h-4 w-4" />
        </Button>

        <div className="ml-auto">
          <UserMenu />
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
