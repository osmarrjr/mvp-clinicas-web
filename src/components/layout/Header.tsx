"use client";

import Link from "next/link";
import { PanelLeft, User } from "lucide-react";

import { useLogout } from "@/features/auth/hooks/useLogout";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type HeaderProps = {
  onToggleSidebar: () => void;
};

export function Header({ onToggleSidebar }: HeaderProps) {
  const { logout, isPending } = useLogout();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-9"
        aria-label="Alternar menu"
        onClick={onToggleSidebar}
      >
        <PanelLeft className="size-5" />
      </Button>

      <Link href="/dashboard" className="shrink-0">
        <img
          src="/loading-logo.svg"
          alt="MVP Clínicas"
          className="h-8 w-auto"
        />
      </Link>

      <div className="ml-auto flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9"
              aria-label="Menu do usuário"
            >
              <User className="size-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/profile">Conta</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/permissions">Permissões</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              role="menuitem"
              disabled={isPending}
              onSelect={(event) => {
                event.preventDefault();
                void logout();
              }}
            >
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
