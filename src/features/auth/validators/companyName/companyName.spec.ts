import { describe, expect, it } from "vitest";

import {
  capitalizeFirstLetter,
  getCompanyNameValidationError,
} from "./companyName";

describe("capitalizeFirstLetter", () => {
  it("capitaliza a primeira letra", () => {
    expect(capitalizeFirstLetter("clínica saúde")).toBe("Clínica saúde");
  });

  it("retorna string vazia quando valor é vazio", () => {
    expect(capitalizeFirstLetter("")).toBe("");
  });
});

describe("getCompanyNameValidationError", () => {
  it("retorna null para nome válido", () => {
    expect(getCompanyNameValidationError("Clínica Saúde")).toBeNull();
  });

  it("retorna erro quando nome está vazio", () => {
    expect(getCompanyNameValidationError("")).toBe(
      "Nome da empresa é obrigatório.",
    );
  });

  it("retorna erro quando nome tem menos de 5 caracteres", () => {
    expect(getCompanyNameValidationError("Abcd")).toBe(
      "Nome da empresa deve ter pelo menos 5 caracteres.",
    );
  });

  it("retorna erro quando nome excede 70 caracteres", () => {
    expect(getCompanyNameValidationError("A".repeat(71))).toBe(
      "Nome da empresa deve ter no máximo 70 caracteres.",
    );
  });

  it("retorna erro quando primeira letra não é maiúscula", () => {
    expect(getCompanyNameValidationError("clínica saúde")).toBe(
      "Nome da empresa deve iniciar com letra maiúscula.",
    );
  });
});
