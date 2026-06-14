import type { LoginUser } from "@/features/auth/types";

export const AUTH_USER_STORAGE_KEY = "mvp-clinicas:user";
const AUTH_USER_STORAGE_EVENT = "mvp-clinicas:user-change";

function emitUserStorageChange(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_USER_STORAGE_EVENT));
}

export function subscribeToUserStorage(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(AUTH_USER_STORAGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(AUTH_USER_STORAGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function isLoginUser(value: unknown): value is LoginUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.email === "string"
  );
}

let cachedRaw: string | null | undefined;
let cachedUser: LoginUser | null = null;

function resetStoredUserCache(): void {
  cachedRaw = undefined;
  cachedUser = null;
}

export function getStoredUser(): LoginUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);

  if (raw === cachedRaw) {
    return cachedUser;
  }

  cachedRaw = raw;

  if (!raw) {
    cachedUser = null;
    return cachedUser;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    cachedUser = isLoginUser(parsed) ? parsed : null;
  } catch {
    cachedUser = null;
  }

  return cachedUser;
}

export function setStoredUser(user: LoginUser): void {
  if (typeof window === "undefined") {
    return;
  }

  const serialized = JSON.stringify(user);

  window.localStorage.setItem(AUTH_USER_STORAGE_KEY, serialized);
  cachedRaw = serialized;
  cachedUser = user;
  emitUserStorageChange();
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  resetStoredUserCache();
  emitUserStorageChange();
}

export function getUserDisplayName(user: LoginUser): string {
  const name = (user as LoginUser & { name?: string }).name?.trim();

  return name || user.email;
}
