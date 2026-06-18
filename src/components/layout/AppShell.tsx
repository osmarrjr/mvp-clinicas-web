"use client";

import { ChevronsLeft, ChevronsRight } from "lucide-react";

import {
  AUTH_SHELL_BORDER,
  AUTH_SHELL_FOREGROUND,
  AUTH_SHELL_GHOST_BUTTON,
} from "@/lib/theme/auth-shell-gradient";
import { cn } from "@/lib/utils";
import { UserMenu } from "@/features/auth/components/UserMenu/UserMenu";
import { Button } from "@/components/ui/button";

import { AppSidebar, AppSidebarProvider } from "./AppSidebar";
import { ShellGradientSurface } from "./ShellGradientSurface";
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
      <header className="w-full">
        <ShellGradientSurface
          className={cn(
            "h-14 w-full border-b",
            AUTH_SHELL_BORDER,
            AUTH_SHELL_FOREGROUND,
          )}
          contentClassName="flex items-center justify-between gap-2 px-2 md:px-6"
        >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={openMobile ? "Fechar menu" : "Abrir menu"}
          onClick={toggleSidebar}
          className={cn(
            "-ml-2 md:hidden",
            AUTH_SHELL_GHOST_BUTTON,
          )}
        >
          <MobileToggleIcon className="size-5 text-white" strokeWidth={2.25} />
        </Button>

        <div className="ml-auto">
          <UserMenu />
        </div>
        </ShellGradientSurface>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
