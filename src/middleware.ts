import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  isAuthRoute,
  isProtectedRoute,
} from "@/config/routes";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  if (isProtectedRoute(pathname) && !accessToken) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute(pathname) && accessToken) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
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
    "/login",
    "/register",
  ],
};
