"use client";

import { AppSidebar, AppSidebarProvider } from "./AppSidebar";
import { UserMenu } from "@/features/auth/components/UserMenu/UserMenu";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <AppSidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-2 border-b px-4 md:px-6">
          <SidebarTrigger className="md:hidden" aria-label="Abrir menu" />
          <div className="ml-auto">
            <UserMenu />
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </SidebarInset>
    </AppSidebarProvider>
  );
}
