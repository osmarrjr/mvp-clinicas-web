import { describe, it, expect, vi, beforeEach } from "vitest";

import { resendRegisterTokenClientService } from "./resendRegisterTokenClientService";

describe("resendRegisterTokenClientService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("envia email para o route handler de reenvio", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, data: { sent: true } }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await resendRegisterTokenClientService({
      email: "clinica@example.com",
    });

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/resend-register-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "clinica@example.com" }),
    });
    expect(result).toEqual({ ok: true, data: { sent: true } });
  });

  it("retorna erro quando a API falha", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          ok: false,
          error: {
            code: "VERIFICATION_LOOKUP_FAILED",
            message: "Falha ao localizar verificação.",
          },
        }),
      }),
    );

    const result = await resendRegisterTokenClientService({
      email: "clinica@example.com",
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "VERIFICATION_LOOKUP_FAILED",
        message: "Falha ao localizar verificação.",
      },
    });
  });
});
