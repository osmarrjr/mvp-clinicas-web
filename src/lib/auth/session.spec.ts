import { describe, expect, it, vi, beforeEach } from "vitest";

import { MOCK_ACCESS_TOKEN, MOCK_USER } from "./mock";
import { getServerSession, isAuthenticated } from "./session";

const cookiesMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: () => cookiesMock(),
}));

describe("session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.AUTH_MOCK_ENABLED;
  });

  it("getServerSession retorna null sem cookie accessToken", async () => {
    cookiesMock.mockResolvedValue({
      get: () => undefined,
    });

    await expect(getServerSession()).resolves.toBeNull();
    await expect(isAuthenticated()).resolves.toBe(false);
  });

  it("getServerSession retorna usuário quando accessToken mock está presente", async () => {
    process.env.AUTH_MOCK_ENABLED = "true";

    cookiesMock.mockResolvedValue({
      get: (name: string) =>
        name === "accessToken" ? { value: MOCK_ACCESS_TOKEN } : undefined,
    });

    await expect(getServerSession()).resolves.toEqual({ user: MOCK_USER });
    await expect(isAuthenticated()).resolves.toBe(true);
  });

  it("getServerSession retorna usuário quando há accessToken em sessão válida", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) =>
        name === "accessToken" ? { value: "real-api-token" } : undefined,
    });

    await expect(getServerSession()).resolves.toEqual({ user: MOCK_USER });
    await expect(isAuthenticated()).resolves.toBe(true);
  });
});
