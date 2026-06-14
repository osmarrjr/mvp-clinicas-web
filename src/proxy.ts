import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  resolveAuthRouteRedirect,
  resolveProtectedRouteRedirect,
} from "@/lib/auth/route-guards";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const hasAccessToken = request.cookies.has("accessToken");

  const protectedRedirect = resolveProtectedRouteRedirect(pathname, hasAccessToken);
  if (protectedRedirect) {
    return NextResponse.redirect(new URL(protectedRedirect, request.url));
  }

  const authRedirect = resolveAuthRouteRedirect(pathname, hasAccessToken);
  if (authRedirect) {
    return NextResponse.redirect(new URL(authRedirect, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
