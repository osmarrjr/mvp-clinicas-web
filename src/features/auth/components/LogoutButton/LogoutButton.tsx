"use client";

import { LogOut } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { useLogout } from "../../hooks/auth/useLogout";

export function LogoutButton() {
  const { logout, isPending } = useLogout();

  return (
    <DropdownMenuItem
      variant="destructive"
      disabled={isPending}
      className="px-4 py-4 "
      onSelect={(event) => {
        event.preventDefault();
        void logout();
      }}
    >
      <LogOut />
      {isPending ? "Saindo..." : "Sair"}
    </DropdownMenuItem>
  );
}
