import { describe, expect, it, afterEach } from "vitest";

import {
  MOCK_ACCESS_TOKEN,
  MOCK_REFRESH_TOKEN,
  MOCK_USER,
  isAuthMockEnabled,
} from "./mock";
import { AppRole } from "@/lib/api/types";

describe("auth mock", () => {
  afterEach(() => {
    delete process.env.AUTH_MOCK_ENABLED;
  });

  it("exporta usuário mock alinhado ao contrato", () => {
    expect(MOCK_USER).toMatchObject({
      id: expect.any(String),
      clinicId: expect.any(String),
      name: expect.any(String),
      email: expect.any(String),
      phone: null,
      sex: null,
      role: AppRole.ClinicAdmin,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it("exporta tokens mock fixos", () => {
    expect(MOCK_ACCESS_TOKEN).toBe("mock-access-token");
    expect(MOCK_REFRESH_TOKEN).toBe("mock-refresh-token");
  });

  it("isAuthMockEnabled retorna true apenas quando AUTH_MOCK_ENABLED=true", () => {
    expect(isAuthMockEnabled()).toBe(false);

    process.env.AUTH_MOCK_ENABLED = "true";
    expect(isAuthMockEnabled()).toBe(true);

    process.env.AUTH_MOCK_ENABLED = "false";
    expect(isAuthMockEnabled()).toBe(false);
  });
});
