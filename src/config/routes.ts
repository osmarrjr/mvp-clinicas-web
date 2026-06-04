export const AUTH_ROUTES = ["/login", "/register"] as const;

export const PROTECTED_ROUTES = [
  "/dashboard",
  "/patients",
  "/appointments",
  "/staff",
  "/reports",
  "/permissions",
  "/profile",
  "/settings",
  "/notifications",
  "/help",
] as const;

export type AuthRoute = (typeof AUTH_ROUTES)[number];
export type ProtectedRoute = (typeof PROTECTED_ROUTES)[number];

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
