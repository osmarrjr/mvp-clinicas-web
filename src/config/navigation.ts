export type AppNavItem = {
  label: string;
  path: string;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Agenda", path: "/appointments" },
  { label: "Usuários", path: "/staff" },
];

export const PROTECTED_ROUTE_PREFIXES = [
  "/dashboard",
  "/appointments",
  "/staff",
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
