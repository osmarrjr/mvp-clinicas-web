"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { clearStoredUser } from "@/lib/auth/user-storage";

import { AUTH_ROUTES } from "../../constants";
import { logoutClientService } from "../../services/auth/authClientService";

export function useLogout() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function logout() {
    setIsPending(true);

    try {
      await logoutClientService();
    } finally {
      clearStoredUser();
      setIsPending(false);
      router.replace(AUTH_ROUTES.login);
      router.refresh();
    }
  }

  return {
    logout,
    isPending,
  };
}
