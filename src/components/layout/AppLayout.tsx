"use client";

import { useState, type ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  function handleToggleSidebar() {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileOpen((current) => !current);
      return;
    }

    setSidebarCollapsed((current) => !current);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background md:flex-row">
      <aside
        className={cn(
          "hidden shrink-0 border-r border-border bg-card transition-all duration-200 md:block",
          sidebarCollapsed ? "w-16" : "w-64",
        )}
      >
        <Sidebar collapsed={sidebarCollapsed} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="border-b border-border px-4 py-3">
            <SheetTitle className="text-left text-base">Menu</SheetTitle>
          </SheetHeader>
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <Header onToggleSidebar={handleToggleSidebar} />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
