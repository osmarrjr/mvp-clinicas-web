import { describe, expect, it } from "vitest";

import {
  formatRegisterTokenInput,
  normalizeRegisterToken,
} from "./registerToken";

describe("formatRegisterTokenInput", () => {
  it("formata progressivamente até 3 dígitos sem hífen", () => {
    expect(formatRegisterTokenInput("1")).toBe("1");
    expect(formatRegisterTokenInput("12")).toBe("12");
    expect(formatRegisterTokenInput("123")).toBe("123");
  });

  it("aplica máscara XXX-XXX a partir do 4º dígito", () => {
    expect(formatRegisterTokenInput("1234")).toBe("123-4");
    expect(formatRegisterTokenInput("12345")).toBe("123-45");
    expect(formatRegisterTokenInput("123456")).toBe("123-456");
  });

  it("sanitiza letras e caracteres especiais na entrada", () => {
    expect(formatRegisterTokenInput("12a3b4c5d6")).toBe("123-456");
  });

  it("limita a 6 dígitos numéricos", () => {
    expect(formatRegisterTokenInput("1234567890")).toBe("123-456");
  });
});

describe("normalizeRegisterToken", () => {
  it("remove hífen e retorna 6 dígitos", () => {
    expect(normalizeRegisterToken("123-456")).toBe("123456");
  });

  it("remove caracteres não numéricos", () => {
    expect(normalizeRegisterToken("12a3-45b6")).toBe("123456");
  });

  it("limita a 6 dígitos", () => {
    expect(normalizeRegisterToken("1234567890")).toBe("123456");
  });
});
