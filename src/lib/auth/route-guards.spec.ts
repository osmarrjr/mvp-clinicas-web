import { describe, it, expect } from "vitest";

import {
  isProtectedRoute,
  resolveAuthRouteRedirect,
  resolveProtectedRouteRedirect,
  sanitizeInternalPath,
} from "./route-guards";

describe("sanitizeInternalPath", () => {
  it("accepts valid internal paths", () => {
    expect(sanitizeInternalPath("/dashboard")).toBe("/dashboard");
    expect(sanitizeInternalPath("/appointments/123")).toBe("/appointments/123");
  });

  it("rejects external URLs and protocol-relative paths", () => {
    expect(sanitizeInternalPath("https://evil.com")).toBeNull();
    expect(sanitizeInternalPath("//evil.com")).toBeNull();
    expect(sanitizeInternalPath("")).toBeNull();
    expect(sanitizeInternalPath(null)).toBeNull();
  });
});

describe("isProtectedRoute", () => {
  it("identifies protected route prefixes", () => {
    expect(isProtectedRoute("/dashboard")).toBe(true);
    expect(isProtectedRoute("/appointments")).toBe(true);
    expect(isProtectedRoute("/staff")).toBe(true);
    expect(isProtectedRoute("/staff/1")).toBe(true);
    expect(isProtectedRoute("/login")).toBe(false);
  });
});

describe("resolveProtectedRouteRedirect", () => {
  it("redirects unauthenticated users on protected routes with safe callbackUrl", () => {
    expect(resolveProtectedRouteRedirect("/dashboard", false)).toBe(
      "/login?callbackUrl=%2Fdashboard",
    );
    expect(resolveProtectedRouteRedirect("/appointments", false)).toBe(
      "/login?callbackUrl=%2Fappointments",
    );
  });

  it("does not redirect when accessToken is present", () => {
    expect(resolveProtectedRouteRedirect("/dashboard", true)).toBeNull();
  });

  it("does not redirect on public routes", () => {
    expect(resolveProtectedRouteRedirect("/login", false)).toBeNull();
  });
});

describe("resolveAuthRouteRedirect", () => {
  it("redirects authenticated users from login and register to dashboard", () => {
    expect(resolveAuthRouteRedirect("/login", true)).toBe("/dashboard");
    expect(resolveAuthRouteRedirect("/register", true)).toBe("/dashboard");
  });

  it("allows change-password when authenticated", () => {
    expect(resolveAuthRouteRedirect("/change-password", true)).toBeNull();
  });

  it("allows register validate-token when authenticated", () => {
    expect(resolveAuthRouteRedirect("/register/validate-token", true)).toBeNull();
  });

  it("does not redirect unauthenticated users", () => {
    expect(resolveAuthRouteRedirect("/login", false)).toBeNull();
  });
});
