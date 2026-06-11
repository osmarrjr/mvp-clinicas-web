import { describe, expect, it } from "vitest";

import { registerTokenSchema } from "./registerTokenSchema";

describe("registerTokenSchema", () => {
  it("valida token no formato XXX-XXX", () => {
    const result = registerTokenSchema.safeParse({ token: "123-456" });

    expect(result.success).toBe(true);
  });

  it("rejeita token com letras", () => {
    const result = registerTokenSchema.safeParse({ token: "12a-456" });

    expect(result.success).toBe(false);
  });

  it("rejeita token incompleto", () => {
    const result = registerTokenSchema.safeParse({ token: "123-45" });

    expect(result.success).toBe(false);
  });

  it("rejeita token sem hífen", () => {
    const result = registerTokenSchema.safeParse({ token: "123456" });

    expect(result.success).toBe(false);
  });

  it("exige 6 dígitos no formato visual", () => {
    const result = registerTokenSchema.safeParse({ token: "123-45" });

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Informe o token no formato 000-000.",
      );
    }
  });
});
