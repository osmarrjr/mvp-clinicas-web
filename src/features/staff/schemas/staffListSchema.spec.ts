import { describe, expect, it } from "vitest";

import { AppRole } from "@/lib/auth/types";

import { staffListFilterSchema } from "./staffListSchema";

describe("staffListFilterSchema", () => {
  it("aceita filtros vazios", () => {
    const result = staffListFilterSchema.safeParse({});

    expect(result.success).toBe(true);
  });

  it("aceita filtros parciais", () => {
    const result = staffListFilterSchema.safeParse({
      name: "Ana",
      role: AppRole.Doctor,
    });

    expect(result.success).toBe(true);
  });

  it("rejeita perfil inválido", () => {
    const result = staffListFilterSchema.safeParse({
      role: "invalid_role",
    });

    expect(result.success).toBe(false);
  });
});
