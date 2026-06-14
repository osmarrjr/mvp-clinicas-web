"use client";

import Link from "next/link";
import {
  Bell,
  HelpCircle,
  Settings,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getUserDisplayName } from "@/lib/auth/user-storage";

import { AUTH_ROUTES } from "../../constants";
import { useStoredUser } from "../../hooks/auth/useStoredUser";
import type { LoginUser } from "../../types";
import { LogoutButton } from "../LogoutButton/LogoutButton";

const GRADIENT_BACKGROUND =
  "bg-[linear-gradient(90deg,#1d4ed8_0%,#2563eb_45%,#0ea5e9_100%)]";

const GRADIENT_TEXT = cn(GRADIENT_BACKGROUND, "bg-clip-text text-transparent");

const MENU_ITEM_CLASSES = cn(
  "flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2",
  "text-[13px] font-semibold transition-all duration-200",
  "bg-transparent hover:bg-slate-100 hover:text-blue-700",
  "focus:bg-slate-100 focus:text-blue-700",
  "data-[highlighted]:bg-slate-100 data-[highlighted]:text-blue-700",
);

const ICON_WRAPPER_CLASSES =
  "flex size-5 shrink-0 items-center justify-center text-blue-600";

type UserMenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const USER_MENU_ITEMS: UserMenuItem[] = [
  {
    label: "Perfil",
    href: AUTH_ROUTES.profile,
    icon: UserRound,
  },
  {
    label: "Configurações",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Notificações",
    href: "/notifications",
    icon: Bell,
  },
  {
    label: "Ajuda e suporte",
    href: "/support",
    icon: HelpCircle,
  },
];

function getUserInitials(user: LoginUser): string {
  const displayName = getUserDisplayName(user);
  const parts = displayName.trim().split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return displayName.slice(0, 2).toUpperCase();
}

export function UserMenu() {
  const user = useStoredUser();
  const displayName = user ? getUserDisplayName(user) : "Usuário";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 rounded-full p-0 hover:bg-transparent"
          aria-label="Abrir menu do usuário"
        >
          <div
            className={cn(
              "rounded-full p-[2px] shadow-sm transition-all duration-200",
              "hover:scale-105 hover:shadow-md",
              GRADIENT_BACKGROUND,
            )}
          >
            <Avatar className="size-9 border-2 border-background">
              <AvatarFallback
                className={cn(
                  GRADIENT_BACKGROUND,
                  "text-sm font-semibold text-white",
                )}
              >
                {user ? (
                  getUserInitials(user)
                ) : (
                  <UserRound className="size-5" aria-hidden />
                )}
              </AvatarFallback>
            </Avatar>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className={cn(
          "w-64 overflow-hidden rounded-3xl bg-white p-0",
          "shadow-[0_18px_50px_rgba(15,23,42,0.14)]",
        )}
      >
        <DropdownMenuLabel className="px-4 py-3 font-normal">
          <div className="flex items-center gap-3">
            <div className={cn("rounded-full p-[2px]", GRADIENT_BACKGROUND)}>
              <Avatar className="size-10 border-2 border-white bg-white">
                <AvatarFallback
                  className={cn(
                    GRADIENT_BACKGROUND,
                    "text-sm font-semibold text-white",
                  )}
                >
                  {user ? (
                    getUserInitials(user)
                  ) : (
                    <UserRound className="size-5" aria-hidden />
                  )}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-slate-900">
                {displayName}
              </span>

              {user && displayName !== user.email ? (
                <span className="mt-0.5 block truncate text-xs text-slate-500">
                  {user.email}
                </span>
              ) : (
                <span className="mt-0.5 block text-xs text-slate-500">
                  Administrador
                </span>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="mx-4 bg-slate-200" />

        <div className="space-y-0.5 p-2">
          {USER_MENU_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <DropdownMenuItem
                key={item.href}
                asChild
                className={MENU_ITEM_CLASSES}
              >
                <Link href={item.href}>
                  <span className={ICON_WRAPPER_CLASSES}>
                    <Icon className="size-4 bg-none" aria-hidden />
                  </span>

                  <span className={GRADIENT_TEXT}>{item.label}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator className="mt-3 mx-2 bg-slate-200" />

          <LogoutButton />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
