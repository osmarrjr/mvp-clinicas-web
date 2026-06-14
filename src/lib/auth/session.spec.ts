import { describe, it, expect, vi, beforeEach } from "vitest";

import { AppRole } from "./types";

const cookiesMock = vi.fn();
const redirectMock = vi.fn();
const decodeAccessTokenMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: () => cookiesMock(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    redirectMock(url);
    throw new Error("NEXT_REDIRECT");
  },
}));

vi.mock("./jwt", () => ({
  decodeAccessToken: (token: string) => decodeAccessTokenMock(token),
}));

const DECODED_USER = {
  id: "user-1",
  email: "admin@clinica.com",
  name: "Maria Silva",
  phone: "+5511999999999",
  role: AppRole.ClinicAdmin,
  clinicId: "clinic-1",
};

describe("getServerSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when accessToken cookie is absent", async () => {
    cookiesMock.mockResolvedValue({
      get: () => undefined,
    });

    const { getServerSession } = await import("./session");
    const session = await getServerSession();

    expect(session).toBeNull();
    expect(decodeAccessTokenMock).not.toHaveBeenCalled();
  });

  it("returns null when token decode fails", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) =>
        name === "accessToken" ? { name: "accessToken", value: "token" } : undefined,
    });
    decodeAccessTokenMock.mockReturnValue(null);

    const { getServerSession } = await import("./session");
    const session = await getServerSession();

    expect(decodeAccessTokenMock).toHaveBeenCalledWith("token");
    expect(session).toBeNull();
  });

  it("returns enriched session when token is valid", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) =>
        name === "accessToken" ? { name: "accessToken", value: "token" } : undefined,
    });
    decodeAccessTokenMock.mockReturnValue(DECODED_USER);

    const { getServerSession } = await import("./session");
    const session = await getServerSession();

    expect(session).toEqual({
      isAuthenticated: true,
      user: DECODED_USER,
    });
  });
});

describe("requireServerSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to login when session is absent", async () => {
    cookiesMock.mockResolvedValue({
      get: () => undefined,
    });

    const { requireServerSession } = await import("./session");

    await expect(requireServerSession()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("returns session when accessToken decodes successfully", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) =>
        name === "accessToken" ? { name: "accessToken", value: "token" } : undefined,
    });
    decodeAccessTokenMock.mockReturnValue(DECODED_USER);

    const { requireServerSession } = await import("./session");
    const session = await requireServerSession();

    expect(session).toEqual({
      isAuthenticated: true,
      user: DECODED_USER,
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
