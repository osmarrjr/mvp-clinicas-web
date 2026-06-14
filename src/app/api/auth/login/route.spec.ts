import { describe, it, expect, vi, beforeEach } from "vitest";

import { AppRole } from "@/lib/auth/types";

vi.mock("server-only", () => ({}));

const loginServerServiceMock = vi.fn();
const decodeAccessTokenMock = vi.fn();

vi.mock("@/features/auth/services/auth/authServerService", () => ({
  loginServerService: (...args: unknown[]) => loginServerServiceMock(...args),
}));

vi.mock("@/lib/auth/jwt", () => ({
  decodeAccessToken: (...args: unknown[]) => decodeAccessTokenMock(...args),
}));

const DECODED_USER = {
  id: "user-1",
  email: "admin@clinica.com",
  name: "Maria Silva",
  phone: "+5511999999999",
  role: AppRole.ClinicAdmin,
  clinicId: "clinic-1",
};

const LOGIN_PAYLOAD = {
  email: "admin@clinica.com",
  password: "secret123",
};

const LOGIN_RESULT = {
  accessToken: "raw-access-token",
  refreshToken: "raw-refresh-token",
  expiresIn: 3600,
  tokenType: "bearer",
  user: {
    id: "user-1",
    email: "admin@clinica.com",
    name: null,
    phone: null,
  },
};

function createLoginRequest(body: unknown = LOGIN_PAYLOAD) {
  return new Request("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns enriched user and sets raw token cookies on success", async () => {
    loginServerServiceMock.mockResolvedValue({
      ok: true,
      data: LOGIN_RESULT,
    });
    decodeAccessTokenMock.mockReturnValue(DECODED_USER);

    const { POST } = await import("./route");
    const response = await POST(createLoginRequest());
    const body = await response.json();

    expect(loginServerServiceMock).toHaveBeenCalledWith(LOGIN_PAYLOAD);
    expect(decodeAccessTokenMock).toHaveBeenCalledWith("raw-access-token");
    expect(body).toEqual({
      ok: true,
      data: {
        user: DECODED_USER,
        passwordChangeRequired: false,
      },
    });

    const cookies = response.cookies.getAll();
    expect(cookies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "accessToken",
          value: "raw-access-token",
          httpOnly: true,
        }),
        expect.objectContaining({
          name: "refreshToken",
          value: "raw-refresh-token",
          httpOnly: true,
        }),
      ]),
    );
  });

  it("does not set cookies when decode fails", async () => {
    loginServerServiceMock.mockResolvedValue({
      ok: true,
      data: LOGIN_RESULT,
    });
    decodeAccessTokenMock.mockReturnValue(null);

    const { POST } = await import("./route");
    const response = await POST(createLoginRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({
      ok: false,
      error: {
        code: "INVALID_TOKEN",
        message: expect.any(String),
      },
    });
    expect(response.cookies.getAll()).toEqual([]);
  });

  it("returns validation error for invalid payload", async () => {
    const { POST } = await import("./route");
    const response = await POST(createLoginRequest({ email: "invalid" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(loginServerServiceMock).not.toHaveBeenCalled();
  });
});
