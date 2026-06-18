export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/appointments",
  "/staff",
  "/usuarios",
  "/convenios",
] as const;

export const AUTH_PUBLIC_ROUTES = ["/login", "/register"] as const;

export const AUTH_ROUTES_REDIRECT_WHEN_AUTHENTICATED = [
  "/login",
  "/register",
] as const;

export const AUTH_ROUTES_EXEMPT_FROM_AUTHENTICATED_REDIRECT = [
  "/change-password",
  "/register/validate-token",
] as const;
