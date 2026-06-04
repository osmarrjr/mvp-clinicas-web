import { describe, expect, it } from "vitest";

import { getPasswordValidationError } from "./password";

describe("getPasswordValidationError", () => {
  it("retorna null para senha válida", () => {
    expect(getPasswordValidationError("Senha@123")).toBeNull();
  });

  it("retorna erro quando senha está vazia", () => {
    expect(getPasswordValidationError("")).toBe("Senha é obrigatória.");
  });

  it("retorna erro quando senha tem menos de 8 caracteres", () => {
    expect(getPasswordValidationError("Ab1!")).toBe(
      "A senha deve ter no mínimo 8 caracteres.",
    );
  });

  it("retorna erro quando senha não contém letras", () => {
    expect(getPasswordValidationError("12345678!")).toBe(
      "A senha deve conter letras.",
    );
  });

  it("retorna erro quando senha não contém números", () => {
    expect(getPasswordValidationError("SenhaForte!")).toBe(
      "A senha deve conter números.",
    );
  });

  it("retorna erro quando senha não contém caractere especial", () => {
    expect(getPasswordValidationError("Senha1234")).toBe(
      "A senha deve conter pelo menos um caractere especial.",
    );
  });
});
