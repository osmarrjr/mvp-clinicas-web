"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { APP_NAVIGATION } from "@/config/navigation";
import { cn } from "@/lib/utils";

type SidebarProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function Sidebar({ collapsed = false, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Menu principal"
      className={cn(
        "flex h-full flex-col gap-1 p-3",
        collapsed ? "items-center" : "",
      )}
    >
      {APP_NAVIGATION.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              collapsed ? "justify-center px-2" : "",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {!collapsed ? <span>{item.label}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
