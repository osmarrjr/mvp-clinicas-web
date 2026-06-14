"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, LayoutDashboard, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { APP_NAV_ITEMS } from "@/config/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const NAV_ICONS: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/appointments": Calendar,
  "/staff": Users,
};

const GRADIENT_BACKGROUND =
  "bg-[linear-gradient(90deg,#1d4ed8_0%,#2563eb_45%,#0ea5e9_100%)]";

const GRADIENT_TEXT = cn(GRADIENT_BACKGROUND, "bg-clip-text text-transparent");

function isNavItemActive(pathname: string, itemPath: string): boolean {
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="items-center justify-center p-4">
        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center"
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="h-auto w-[160px] max-w-full object-contain"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-2">
              {APP_NAV_ITEMS.map((item) => {
                const Icon = NAV_ICONS[item.path];
                const isActive = isNavItemActive(pathname, item.path);

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      <Link
                        href={item.path}
                        aria-label={item.label}
                        data-active={isActive ? "true" : "false"}
                        className={cn(
                          "flex h-auto w-full items-center gap-2 rounded-2xl px-2 py-4 font-semibold",
                          isActive
                            ? cn(
                                GRADIENT_BACKGROUND,
                                "text-white! hover:!text-white",
                              )
                            : "bg-transparent! hover:bg-slate-200/90! hover:text-blue-700!",
                        )}
                      >
                        {Icon ? (
                          <Icon
                            aria-hidden="true"
                            className={cn(
                              "size-4 shrink-0",
                              isActive ? "text-white!" : "text-blue-600!",
                            )}
                          />
                        ) : null}

                        <span
                          className={isActive ? "text-white!" : GRADIENT_TEXT}
                        >
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

export function AppSidebarProvider({ children }: { children: ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}
