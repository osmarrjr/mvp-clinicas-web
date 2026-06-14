"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";

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
import { getUserDisplayName } from "@/lib/auth/user-storage";

import { AUTH_ROUTES } from "../../constants";
import { useStoredUser } from "../../hooks/auth/useStoredUser";
import type { LoginUser } from "../../types";
import { LogoutButton } from "../LogoutButton/LogoutButton";

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
          className="rounded-full"
          aria-label="Abrir menu do usuário"
        >
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary">
              {user ? (
                getUserInitials(user)
              ) : (
                <UserRound className="size-4" aria-hidden />
              )}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium leading-none">
              {displayName}
            </span>
            {user && displayName !== user.email ? (
              <span className="text-xs text-muted-foreground">{user.email}</span>
            ) : null}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={AUTH_ROUTES.profile}>
            <UserRound />
            Perfil
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <LogoutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
