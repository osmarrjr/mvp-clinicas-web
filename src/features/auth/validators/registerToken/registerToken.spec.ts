import { describe, expect, it } from "vitest";

import {
  formatRegisterTokenInput,
  joinRegisterTokenDigits,
  normalizeRegisterToken,
  parseRegisterTokenPaste,
  splitRegisterTokenDigits,
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

describe("splitRegisterTokenDigits", () => {
  it("retorna 6 slots vazios para valor vazio", () => {
    expect(splitRegisterTokenDigits("")).toEqual(["", "", "", "", "", ""]);
  });

  it("distribui dígitos parciais nos primeiros slots", () => {
    expect(splitRegisterTokenDigits("12")).toEqual(["1", "2", "", "", "", ""]);
    expect(splitRegisterTokenDigits("123")).toEqual([
      "1",
      "2",
      "3",
      "",
      "",
      "",
    ]);
  });

  it("distribui token completo formatado nos 6 slots", () => {
    expect(splitRegisterTokenDigits("123-456")).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
    ]);
  });

  it("preserva slots vazios intermediários com placeholder", () => {
    expect(splitRegisterTokenDigits("12_456")).toEqual([
      "1",
      "2",
      "",
      "4",
      "5",
      "6",
    ]);
  });

  it("ignora caracteres não numéricos", () => {
    expect(splitRegisterTokenDigits("12a3-45b6")).toEqual([
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
    ]);
  });
});

describe("joinRegisterTokenDigits", () => {
  it("concatena slots vazios em string vazia", () => {
    expect(joinRegisterTokenDigits(["", "", "", "", "", ""])).toBe("");
  });

  it("formata valor parcial sem hífen até 3 dígitos", () => {
    expect(joinRegisterTokenDigits(["1", "2", "", "", "", ""])).toBe("12");
    expect(joinRegisterTokenDigits(["1", "2", "3", "", "", ""])).toBe("123");
  });

  it("aplica máscara XXX-XXX a partir do 4º dígito", () => {
    expect(joinRegisterTokenDigits(["1", "2", "3", "4", "", ""])).toBe("123-4");
    expect(joinRegisterTokenDigits(["1", "2", "3", "4", "5", "6"])).toBe(
      "123-456",
    );
  });

  it("preserva posições ao apagar dígito intermediário", () => {
    expect(joinRegisterTokenDigits(["1", "2", "", "4", "5", "6"])).toBe(
      "12_456",
    );
  });

  it("sanitiza slots com caracteres inválidos sem deslocar dígitos", () => {
    expect(joinRegisterTokenDigits(["1", "a", "3", "4", "5", "6"])).toBe(
      "1_3456",
    );
  });
});

describe("parseRegisterTokenPaste", () => {
  it("formata paste de 6 dígitos contínuos", () => {
    expect(parseRegisterTokenPaste("123456")).toBe("123-456");
  });

  it("formata paste já mascarado", () => {
    expect(parseRegisterTokenPaste("123-456")).toBe("123-456");
  });

  it("sanitiza caracteres não numéricos na colagem", () => {
    expect(parseRegisterTokenPaste("12a3-45b6")).toBe("123-456");
  });

  it("limita a 6 dígitos", () => {
    expect(parseRegisterTokenPaste("1234567890")).toBe("123-456");
  });
});
