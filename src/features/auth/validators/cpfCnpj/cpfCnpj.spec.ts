import { describe, expect, it } from "vitest";

import {
  detectTaxIdType,
  formatCnpj,
  formatCpf,
  formatTaxId,
  isValidCnpj,
  isValidCpf,
  isValidTaxId,
  stripDigits,
} from "./cpfCnpj";

describe("cpfCnpj", () => {
  it("stripDigits remove caracteres não numéricos", () => {
    expect(stripDigits("123.456.789-00")).toBe("12345678900");
  });

  it("formatCpf aplica máscara de CPF", () => {
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
  });

  it("formatCnpj aplica máscara de CNPJ", () => {
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("formatTaxId escolhe máscara conforme quantidade de dígitos", () => {
    expect(formatTaxId("52998224725")).toBe("529.982.247-25");
    expect(formatTaxId("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("detectTaxIdType identifica cpf e cnpj", () => {
    expect(detectTaxIdType("52998224725")).toBe("cpf");
    expect(detectTaxIdType("11222333000181")).toBe("cnpj");
  });

  it("valida CPF conhecido válido", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
  });

  it("rejeita CPF inválido", () => {
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("123")).toBe(false);
  });

  it("valida CNPJ conhecido válido", () => {
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
  });

  it("rejeita CNPJ inválido", () => {
    expect(isValidCnpj("11.111.111/1111-11")).toBe(false);
  });

  it("isValidTaxId delega para CPF ou CNPJ", () => {
    expect(isValidTaxId("529.982.247-25")).toBe(true);
    expect(isValidTaxId("11.222.333/0001-81")).toBe(true);
    expect(isValidTaxId("000")).toBe(false);
  });
});
