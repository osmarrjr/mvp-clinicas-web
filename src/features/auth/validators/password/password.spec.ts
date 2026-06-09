import { describe, expect, it } from "vitest";

import {
  getPasswordHintMessage,
  getPasswordStrength,
  getPasswordValidationError,
  passwordContainsEmailParts,
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

  it("retorna erro quando senha contém dados pessoais", () => {
    expect(
      getPasswordValidationError("Clinica@529", {
        companyName: "Clínica Saúde",
        taxId: "52998224725",
      }),
    ).toBe("Senha não pode conter Nome, CPF, CNPJ ou Email");
  });

  it("retorna erro quando senha contém partes do email", () => {
    expect(
      getPasswordValidationError("Contato@123", {
        email: "contato@empresa.com",
      }),
    ).toBe("Senha não pode conter Nome, CPF, CNPJ ou Email");
  });
});

describe("getPasswordHintMessage", () => {
  it("retorna null quando vazio", () => {
    expect(getPasswordHintMessage("")).toBeNull();
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

  it("detecta partes do email com 3+ caracteres", () => {
    expect(
      passwordContainsEmailParts("Empresa@123", "contato@empresa.com"),
    ).toBe(true);
    expect(passwordContainsEmailParts("Senha@123", "contato@empresa.com")).toBe(
      false,
    );
  });
});

describe("getPasswordStrength", () => {
  it("retorna score baixo para senha Fraca", () => {
    const result = getPasswordStrength("aaaaaaaa");
    expect(result.label).toBe("Fraca");
    expect(result.score).toBeLessThanOrEqual(30);
  });

  it("retorna score médio para senha média", () => {
    const result = getPasswordStrength("Senha@123");
    expect(result.label).toBe("Media");
    expect(result.score).toBeGreaterThan(30);
    expect(result.score).toBeLessThan(75);
  });

  it("retorna score alto para senha Forte", () => {
    const result = getPasswordStrength("Senha@123Xyz!Ab#Cd");
    expect(result.label).toBe("Forte");
    expect(result.score).toBeGreaterThanOrEqual(75);
  });

  it("classifica faixas em 30, 75 e 100", () => {
    expect(getPasswordStrength("aaaaaaaa").label).toBe("Fraca");
    expect(getPasswordStrength("Senha@123").label).toBe("Media");
    expect(getPasswordStrength("Senha@123Xyz!Ab#Cd").label).toBe("Forte");
  });
});
