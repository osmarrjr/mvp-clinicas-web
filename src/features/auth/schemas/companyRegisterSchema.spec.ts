import { describe, expect, it } from "vitest";

import { companyRegisterSchema } from "./companyRegisterSchema";

const validBase = {
  companyName: "Clínica Saúde",
  taxId: "52998224725",
  uf: "SP",
  city: "São Paulo",
  email: "contato@clinica.com",
  phone: "11987654321",
  password: "Senha@123",
  confirmPassword: "Senha@123",
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
      taxId: "11222333000181",
    });
    expect(result.success).toBe(true);
  });

  it("aceita taxIdType explícito no payload", () => {
    const result = companyRegisterSchema.safeParse({
      ...validBase,
      taxIdType: "cpf",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.taxIdType).toBe("cpf");
    }
  });

  it("rejeita nome da empresa com menos de 5 caracteres", () => {
    const result = companyRegisterSchema.safeParse({
      ...validBase,
      companyName: "Abcd",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita nome sem letra maiúscula inicial", () => {
    const result = companyRegisterSchema.safeParse({
      ...validBase,
      companyName: "clínica saúde",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita CPF inválido", () => {
    const result = companyRegisterSchema.safeParse({
      ...validBase,
      taxId: "11111111111",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita CNPJ alfanumérico", () => {
    const result = companyRegisterSchema.safeParse({
      ...validBase,
      taxId: "AB123456789012",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita email inválido", () => {
    const result = companyRegisterSchema.safeParse({
      ...validBase,
      email: "email-invalido",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita telefone com DDD inválido", () => {
    const result = companyRegisterSchema.safeParse({
      ...validBase,
      phone: "00987654321",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita celular sem nono dígito 9", () => {
    const result = companyRegisterSchema.safeParse({
      ...validBase,
      phone: "11887654321",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita confirmação de senha diferente", () => {
    const result = companyRegisterSchema.safeParse({
      ...validBase,
      confirmPassword: "Outra@123",
    });
    expect(result.success).toBe(false);

    if (!result.success) {
      const issue = result.error.issues.find(
        (item) => item.path[0] === "confirmPassword",
      );
      expect(issue?.message).toBe("As senhas não conferem");
    }
  });

  it("rejeita senha sem caractere especial", () => {
    const result = companyRegisterSchema.safeParse({
      ...validBase,
      password: "Senha1234",
      confirmPassword: "Senha1234",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const passwordIssue = result.error.issues.find(
        (issue) => issue.path[0] === "password",
      );
      expect(passwordIssue?.message).toBe(
        "Senha deve possuir pelo menos um caractere especial",
      );
    }
  });

  it("rejeita senha curta", () => {
    const result = companyRegisterSchema.safeParse({
      ...validBase,
      password: "Ab1!",
      confirmPassword: "Ab1!",
    });

    expect(result.success).toBe(false);

    if (!result.success) {
      const passwordIssue = result.error.issues.find(
        (issue) => issue.path[0] === "password",
      );
      expect(passwordIssue?.message).toBe(
        "Senha deve ter no mínimo 8 dígitos",
      );
    }
  });

  it("rejeita campos obrigatórios vazios", () => {
    const result = companyRegisterSchema.safeParse({
      companyName: "",
      taxId: "",
      uf: "",
      city: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      plan: undefined,
    });
    expect(result.success).toBe(false);
  });
});
