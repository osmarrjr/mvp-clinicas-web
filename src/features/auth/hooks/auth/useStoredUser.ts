"use client";

import { useSyncExternalStore } from "react";

import {
  getStoredUser,
  subscribeToUserStorage,
} from "@/lib/auth/user-storage";
import type { LoginUser } from "@/features/auth/types";

export function useStoredUser(): LoginUser | null {
  return useSyncExternalStore(
    subscribeToUserStorage,
    getStoredUser,
    () => null,
  );
}
