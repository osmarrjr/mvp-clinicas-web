import { describe, expect, it } from "vitest";

import { companyRegisterSchema } from "./companyRegisterSchema";

const validBase = {
  companyName: "Clínica Saúde",
  taxId: "529.982.247-25",
  stateUf: "SP",
  city: "São Paulo",
  email: "contato@clinica.com",
  plan: "basic" as const,
};

describe("companyRegisterSchema", () => {
  it("aceita payload válido com CPF", () => {
    const result = companyRegisterSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("aceita payload válido com CNPJ", () => {
    const result = companyRegisterSchema.safeParse({
      ...validBase,
      taxId: "11.222.333/0001-81",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita nome da empresa com menos de 3 caracteres", () => {
    const result = companyRegisterSchema.safeParse({
      ...validBase,
      companyName: "AB",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita CPF inválido com 11 dígitos", () => {
    const result = companyRegisterSchema.safeParse({
      ...validBase,
      taxId: "111.111.111-11",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/incompleto/i);
    }
  });

  it("aceita CNPJ válido sem acusar erro de CPF no 11º dígito", () => {
    const result = companyRegisterSchema.safeParse({
      ...validBase,
      taxId: "11.222.333/0001-81",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita email inválido", () => {
    const result = companyRegisterSchema.safeParse({
      ...validBase,
      email: "email-invalido",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita campos obrigatórios vazios", () => {
    const result = companyRegisterSchema.safeParse({
      companyName: "",
      taxId: "",
      stateUf: "",
      city: "",
      email: "",
      plan: undefined,
    });
    expect(result.success).toBe(false);
  });
});
