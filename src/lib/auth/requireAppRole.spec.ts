import { describe, it, expect, vi, beforeEach } from "vitest";

import { AppRole } from "./types";

const cookiesMock = vi.fn();
const requireServerSessionMock = vi.fn();
const forbiddenMock = vi.fn();
const decodeAccessTokenMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: () => cookiesMock(),
}));

vi.mock("./session", () => ({
  requireServerSession: () => requireServerSessionMock(),
}));

vi.mock("./jwt", () => ({
  decodeAccessToken: (...args: unknown[]) => decodeAccessTokenMock(...args),
}));

vi.mock("next/navigation", () => ({
  forbidden: () => {
    forbiddenMock();
    throw new Error("NEXT_FORBIDDEN");
  },
}));

const AUTHENTICATED_SESSION = { isAuthenticated: true as const };

describe("requireAppRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireServerSessionMock.mockResolvedValue(AUTHENTICATED_SESSION);
    cookiesMock.mockResolvedValue({
      get: () => ({ name: "accessToken", value: "token" }),
    });
  });

  it("calls forbidden when role is missing from token", async () => {
    decodeAccessTokenMock.mockReturnValue({
      id: "user-1",
      email: "admin@clinica.com",
      name: null,
      phone: null,
    });

    const { requireAppRole } = await import("./requireAppRole");

    await expect(requireAppRole([AppRole.ClinicAdmin])).rejects.toThrow(
      "NEXT_FORBIDDEN",
    );
    expect(forbiddenMock).toHaveBeenCalledTimes(1);
  });

  it("calls forbidden when role is not allowed", async () => {
    decodeAccessTokenMock.mockReturnValue({
      id: "user-1",
      email: "doctor@clinica.com",
      name: null,
      phone: null,
      role: AppRole.Doctor,
    });

    const { requireAppRole } = await import("./requireAppRole");

    await expect(
      requireAppRole([AppRole.ClinicAdmin, AppRole.Receptionist]),
    ).rejects.toThrow("NEXT_FORBIDDEN");
    expect(forbiddenMock).toHaveBeenCalledTimes(1);
  });

  it("returns session when role is allowed", async () => {
    decodeAccessTokenMock.mockReturnValue({
      id: "user-1",
      email: "admin@clinica.com",
      name: null,
      phone: null,
      role: AppRole.ClinicAdmin,
    });

    const { requireAppRole } = await import("./requireAppRole");
    const session = await requireAppRole([
      AppRole.ClinicAdmin,
      AppRole.Receptionist,
    ]);

    expect(session).toEqual(AUTHENTICATED_SESSION);
    expect(forbiddenMock).not.toHaveBeenCalled();
  });
});
