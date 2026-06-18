"use client";

import { LogOut } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { useLogout } from "../../hooks/auth/useLogout";
import {
  USER_MENU_LOGOUT_ICON_CLASS,
  USER_MENU_LOGOUT_ITEM_CLASS,
  USER_MENU_LOGOUT_LABEL_CLASS,
} from "../UserMenu/userMenuStyles";

export function LogoutButton() {
  const { logout, isPending } = useLogout();

  return (
    <DropdownMenuItem
      disabled={isPending}
      className={USER_MENU_LOGOUT_ITEM_CLASS}
      aria-label="Sair"
      onSelect={(event) => {
        event.preventDefault();
        void logout();
      }}
    >
      <LogOut aria-hidden="true" className={USER_MENU_LOGOUT_ICON_CLASS} />
      <span className={USER_MENU_LOGOUT_LABEL_CLASS}>
        {isPending ? "Saindo..." : "Sair"}
      </span>
    </DropdownMenuItem>
  );
}
