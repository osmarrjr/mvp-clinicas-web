"use client";

import { AppSidebar, AppSidebarProvider } from "./AppSidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <AppSidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4 md:px-6">
          <SidebarTrigger aria-label="Alternar menu lateral" />
        </header>
        {children}
      </SidebarInset>
    </AppSidebarProvider>
  );
}
