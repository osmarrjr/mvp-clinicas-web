import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const cookiesMock = vi.fn();
const createConvenioServerServiceMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: () => cookiesMock(),
}));

vi.mock("@/features/convenios/services/createConvenioServerService", () => ({
  createConvenioServerService: (...args: unknown[]) =>
    createConvenioServerServiceMock(...args),
}));

const VALID_PAYLOAD = {
  name: "Convênio Saúde",
  acronym: "CVSAU",
  category: "convenio",
  ansRegistration: "123456",
  cardNumberMask: "0000-0000",
};

const CREATED_CONVENIO = {
  id: "convenio-1",
  clinic_id: "clinic-1",
  name: "Convênio Saúde",
  acronym: "CVSAU",
  category: "convenio",
  ans_registration: "123456",
  card_number_mask: "0000-0000",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

function createConvenioRequest(body: unknown = VALID_PAYLOAD) {
  return new Request("http://localhost/api/convenios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/convenios", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when accessToken cookie is absent", async () => {
    cookiesMock.mockResolvedValue({
      get: () => undefined,
    });

    const { POST } = await import("./route");
    const response = await POST(createConvenioRequest());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      ok: false,
      error: {
        code: "AUTH_MISSING",
        message: expect.any(String),
      },
    });
    expect(createConvenioServerServiceMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid JSON", async () => {
    cookiesMock.mockResolvedValue({
      get: () => ({ name: "accessToken", value: "token" }),
    });

    const { POST } = await import("./route");
    const response = await POST(
      new Request("http://localhost/api/convenios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "invalid-json",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("INVALID_JSON");
    expect(createConvenioServerServiceMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid schema payload", async () => {
    cookiesMock.mockResolvedValue({
      get: () => ({ name: "accessToken", value: "token" }),
    });

    const { POST } = await import("./route");
    const response = await POST(createConvenioRequest({ name: "ab" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("VALIDATION_ERROR");
    expect(createConvenioServerServiceMock).not.toHaveBeenCalled();
  });

  it("returns 201 on successful creation", async () => {
    cookiesMock.mockResolvedValue({
      get: () => ({ name: "accessToken", value: "token" }),
    });
    createConvenioServerServiceMock.mockResolvedValue({
      ok: true,
      data: CREATED_CONVENIO,
    });

    const { POST } = await import("./route");
    const response = await POST(createConvenioRequest());
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({
      ok: true,
      data: CREATED_CONVENIO,
    });
    expect(createConvenioServerServiceMock).toHaveBeenCalledWith(
      "token",
      expect.objectContaining({
        name: VALID_PAYLOAD.name,
        acronym: VALID_PAYLOAD.acronym,
        category: VALID_PAYLOAD.category,
      }),
    );
  });
});
