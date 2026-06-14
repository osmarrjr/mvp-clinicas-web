"use client";

import { ChevronsLeft, ChevronsRight } from "lucide-react";

import { AppSidebar, AppSidebarProvider } from "./AppSidebar";
import { UserMenu } from "@/features/auth/components/UserMenu/UserMenu";
import { Button } from "@/components/ui/button";
import { SidebarInset, useSidebar } from "@/components/ui/sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <AppSidebarProvider>
      <AppShellContent>{children}</AppShellContent>
    </AppSidebarProvider>
  );
}

function AppShellContent({ children }: AppShellProps) {
  const { openMobile, toggleSidebar } = useSidebar();

  const MobileToggleIcon = openMobile ? ChevronsLeft : ChevronsRight;

  return (
    <>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-2 border-b px-2 md:px-6 bg-sidebar">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Abrir menu"
            onClick={toggleSidebar}
            className="md:hidden -ml-2"
          >
            <MobileToggleIcon className="h-4 w-4" />
            <span className="sr-only">Abrir menu</span>
          </Button>

          <div className="ml-auto">
            <UserMenu />
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </SidebarInset>
    </>
  );
}
