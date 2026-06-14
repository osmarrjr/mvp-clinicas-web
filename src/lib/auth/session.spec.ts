import { describe, it, expect, vi, beforeEach } from "vitest";

const cookiesMock = vi.fn();
const redirectMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: () => cookiesMock(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    redirectMock(url);
    throw new Error("NEXT_REDIRECT");
  },
}));

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
  });

  it("returns minimal session when accessToken cookie is present", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) =>
        name === "accessToken" ? { name: "accessToken", value: "token" } : undefined,
    });

    const { getServerSession } = await import("./session");
    const session = await getServerSession();

    expect(session).toEqual({ isAuthenticated: true });
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

  it("returns session when accessToken cookie is present", async () => {
    cookiesMock.mockResolvedValue({
      get: (name: string) =>
        name === "accessToken" ? { name: "accessToken", value: "token" } : undefined,
    });

    const { requireServerSession } = await import("./session");
    const session = await requireServerSession();

    expect(session).toEqual({ isAuthenticated: true });
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
