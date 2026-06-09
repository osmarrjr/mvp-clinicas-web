import { describe, expect, it } from "vitest";

import { getEmailValidationError } from "./email";

describe("getEmailValidationError", () => {
  it("retorna null para email válido", () => {
    expect(getEmailValidationError("contato@empresa.com")).toBeNull();
  });

  it("retorna erro quando email está vazio", () => {
    expect(getEmailValidationError("")).toBe("Email é obrigatório.");
  });

  it("retorna erro quando email excede 70 caracteres", () => {
    expect(getEmailValidationError(`${"a".repeat(60)}@empresa.com`)).toBe(
      "Email deve ter no máximo 70 caracteres.",
    );
  });

  it("retorna erro quando email não contém @", () => {
    expect(getEmailValidationError("contatoempresa.com")).toBe(
      "Email deve conter @.",
    );
  });

  it("retorna erro quando email inicia com @", () => {
    expect(getEmailValidationError("@empresa.com")).toBe(
      "Email não pode iniciar ou terminar com @.",
    );
  });

  it("retorna erro quando email termina com @", () => {
    expect(getEmailValidationError("contato@")).toBe(
      "Email não pode iniciar ou terminar com @.",
    );
  });

  it("retorna erro quando parte local ou domínio está vazio", () => {
    expect(getEmailValidationError("contato@")).toBe(
      "Email não pode iniciar ou terminar com @.",
    );
    expect(getEmailValidationError("@empresa.com")).toBe(
      "Email não pode iniciar ou terminar com @.",
    );
  });

  it("retorna erro quando domínio não contém ponto", () => {
    expect(getEmailValidationError("contato@empresa")).toBe(
      "Email deve conter um ponto após o @.",
    );
  });

  it("retorna erro quando email contém espaços", () => {
    expect(getEmailValidationError("contato @empresa.com")).toBe(
      "Email não pode conter espaços.",
    );
  });

  it("retorna erro quando email contém @@", () => {
    expect(getEmailValidationError("contato@@empresa.com")).toBe(
      "Email não pode conter @@.",
    );
  });
});
