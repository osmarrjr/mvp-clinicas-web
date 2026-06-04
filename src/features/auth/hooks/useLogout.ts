"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { logoutClientService } from "../services/authClientService";

export function useLogout() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function logout() {
    setIsPending(true);

    try {
      await logoutClientService();
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return {
    logout,
    isPending,
  };
}
