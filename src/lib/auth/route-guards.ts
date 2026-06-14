import {
  AUTH_ROUTES_EXEMPT_FROM_AUTHENTICATED_REDIRECT,
  AUTH_ROUTES_REDIRECT_WHEN_AUTHENTICATED,
  PROTECTED_ROUTE_PREFIXES,
} from "@/config/navigation";

export function sanitizeInternalPath(path: string | null | undefined): string | null {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return null;
  }

  if (path.includes("://")) {
    return null;
  }

  return path;
}

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isExemptFromAuthenticatedRedirect(pathname: string): boolean {
  return AUTH_ROUTES_EXEMPT_FROM_AUTHENTICATED_REDIRECT.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function shouldRedirectAuthenticatedAuthRoute(pathname: string): boolean {
  if (isExemptFromAuthenticatedRedirect(pathname)) {
    return false;
  }

  return AUTH_ROUTES_REDIRECT_WHEN_AUTHENTICATED.some((route) => {
    if (pathname === route) {
      return true;
    }

    if (route === "/register" && pathname.startsWith("/register/validate-token")) {
      return false;
    }

    return pathname.startsWith(`${route}/`);
  });
}

export function resolveProtectedRouteRedirect(
  pathname: string,
  hasAccessToken: boolean,
): string | null {
  if (hasAccessToken || !isProtectedRoute(pathname)) {
    return null;
  }

  const safePath = sanitizeInternalPath(pathname);

  if (safePath) {
    return `/login?callbackUrl=${encodeURIComponent(safePath)}`;
  }

  return "/login";
}

export function resolveAuthRouteRedirect(
  pathname: string,
  hasAccessToken: boolean,
): string | null {
  if (!hasAccessToken || !shouldRedirectAuthenticatedAuthRoute(pathname)) {
    return null;
  }

  return "/dashboard";
}
