import { describe, expect, it } from "vitest";

import {
  getPasswordHintMessage,
  getPasswordStrength,
  getPasswordValidationError,
  isCommonPassword,
  passwordContainsPersonalData,
} from "./password";

describe("getPasswordValidationError", () => {
  it("retorna null para senha válida", () => {
    expect(getPasswordValidationError("Senha@123")).toBeNull();
  });

  it("retorna erro quando senha está vazia", () => {
    expect(getPasswordValidationError("")).toBe("Senha é obrigatória.");
  });

  it("retorna erro quando senha tem menos de 8 caracteres", () => {
    expect(getPasswordValidationError("Ab1!")).toBe(
      "Senha deve ter no mínimo 8 dígitos",
    );
  });

  it("retorna erro quando senha não possui letras e números", () => {
    expect(getPasswordValidationError("12345678!")).toBe(
      "Senha deve possuir letras e números",
    );
    expect(getPasswordValidationError("SenhaForte!")).toBe(
      "Senha deve possuir letras e números",
    );
  });

  it("retorna erro quando senha não possui letra maiúscula", () => {
    expect(getPasswordValidationError("senha@123")).toBe(
      "Senha deve possuir pelo menos uma letra maiúscula",
    );
  });

  it("retorna erro quando senha não possui caractere especial", () => {
    expect(getPasswordValidationError("Senha1234")).toBe(
      "Senha deve possuir pelo menos um caractere especial",
    );
  });

  it("retorna erro para senha comum", () => {
    expect(getPasswordValidationError("Password1!")).toBe(
      "Senha comum, escolha uma senha mais segura",
    );
  });

  it("retorna erro quando senha contém dados pessoais", () => {
    expect(
      getPasswordValidationError("Clinica@529", {
        companyName: "Clínica Saúde",
        taxId: "52998224725",
      }),
    ).toBe("Senha não pode conter nome, CPF e CNPJ");
  });
});

describe("getPasswordHintMessage", () => {
  it("retorna mensagem de obrigatório quando vazio", () => {
    expect(getPasswordHintMessage("")).toBe("Senha é obrigatória.");
  });

  it("retorna apenas uma mensagem por prioridade", () => {
    expect(getPasswordHintMessage("Ab1")).toBe(
      "Senha deve ter no mínimo 8 dígitos",
    );
    expect(getPasswordHintMessage("12345678!")).toBe(
      "Senha deve possuir letras e números",
    );
    expect(getPasswordHintMessage("senha@123")).toBe(
      "Senha deve possuir pelo menos uma letra maiúscula",
    );
    expect(getPasswordHintMessage("Senha1234")).toBe(
      "Senha deve possuir pelo menos um caractere especial",
    );
  });
});

describe("isCommonPassword", () => {
  it("identifica senhas comuns", () => {
    expect(isCommonPassword("12345678")).toBe(true);
    expect(isCommonPassword("password")).toBe(true);
    expect(isCommonPassword("Senha@123")).toBe(false);
  });
});

describe("passwordContainsPersonalData", () => {
  it("detecta substring do nome com 3+ caracteres", () => {
    expect(
      passwordContainsPersonalData("Clinica@123", {
        companyName: "Clínica Saúde",
        taxId: "",
      }),
    ).toBe(true);
  });

  it("detecta dígitos do CPF/CNPJ", () => {
    expect(
      passwordContainsPersonalData("Senha@529982", {
        companyName: "",
        taxId: "52998224725",
      }),
    ).toBe(true);
  });
});

describe("getPasswordStrength", () => {
  it("retorna score baixo para senha fraca", () => {
    const result = getPasswordStrength("aaaaaaaa");
    expect(result.label).toBe("fraca");
    expect(result.score).toBeLessThanOrEqual(30);
  });

  it("retorna score médio para senha média", () => {
    const result = getPasswordStrength("Senha@123");
    expect(result.label).toBe("media");
    expect(result.score).toBeGreaterThan(30);
    expect(result.score).toBeLessThanOrEqual(80);
  });

  it("retorna score alto para senha forte", () => {
    const result = getPasswordStrength("Senha@123Xyz!Ab#Cd");
    expect(result.label).toBe("forte");
    expect(result.score).toBeGreaterThan(80);
  });
});
