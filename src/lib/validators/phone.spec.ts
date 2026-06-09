import { describe, expect, it } from "vitest";

import {
  VALID_BRAZILIAN_DDDS,
  formatPhone,
  getPhoneValidationError,
  isValidBrazilianDdd,
  stripPhoneDigits,
} from "./phone";

describe("stripPhoneDigits", () => {
  it("remove caracteres não numéricos", () => {
    expect(stripPhoneDigits("(11) 98765-4321")).toBe("11987654321");
  });
});

describe("formatPhone", () => {
  it("formata telefone fixo com 10 dígitos", () => {
    expect(formatPhone("1134567890")).toBe("(11) 3456-7890");
  });

  it("formata celular com 11 dígitos", () => {
    expect(formatPhone("11987654321")).toBe("(11) 98765-4321");
  });
});

describe("isValidBrazilianDdd", () => {
  it("aceita DDD válido", () => {
    expect(isValidBrazilianDdd("11")).toBe(true);
  });

  it("rejeita DDD inválido", () => {
    expect(isValidBrazilianDdd("00")).toBe(false);
  });

  it("exporta lista de DDDs válidos", () => {
    expect(VALID_BRAZILIAN_DDDS).toContain("11");
    expect(VALID_BRAZILIAN_DDDS).toContain("21");
  });
});

describe("getPhoneValidationError", () => {
  it("retorna null para telefone fixo válido", () => {
    expect(getPhoneValidationError("1134567890")).toBeNull();
  });

  it("retorna null para celular válido", () => {
    expect(getPhoneValidationError("11987654321")).toBeNull();
  });

  it("retorna erro quando telefone está vazio", () => {
    expect(getPhoneValidationError("")).toBe("Telefone é obrigatório.");
  });

  it("retorna erro quando telefone não tem 10 ou 11 dígitos", () => {
    expect(getPhoneValidationError("1198765")).toBe(
      "Telefone deve conter 10 ou 11 dígitos.",
    );
  });

  it("retorna erro quando DDD é inválido", () => {
    expect(getPhoneValidationError("00987654321")).toBe("DDD inválido.");
  });

  it("retorna erro quando celular não inicia com 9 no terceiro dígito", () => {
    expect(getPhoneValidationError("11887654321")).toBe(
      "Celular deve iniciar com 9 após o DDD.",
    );
  });
});
