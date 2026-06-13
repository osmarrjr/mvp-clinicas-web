import { describe, expect, it } from "vitest";

import {
  buildRegisterApiPayload,
  resolveTaxIdType,
  toRegisterAdminDto,
} from "./registerPayload";

describe("resolveTaxIdType", () => {
  it("identifica CPF", () => {
    expect(resolveTaxIdType("52998224725")).toBe("cpf");
  });

  it("identifica CNPJ", () => {
    expect(resolveTaxIdType("11222333000181")).toBe("cnpj");
  });
});

describe("buildRegisterApiPayload", () => {
  it("inclui taxIdType e taxId somente com dígitos", () => {
    const payload = buildRegisterApiPayload({
      companyName: "Clínica Saúde",
      taxId: "529.982.247-25",
      uf: "SP",
      city: "São Paulo",
      email: "contato@clinica.com",
      phone: "11987654321",
      password: "Senha@123",
      confirmPassword: "Senha@123",
      plan: "basic",
    });

    expect(payload.taxId).toBe("52998224725");
    expect(payload.taxIdType).toBe("cpf");
  });

  it("define taxIdType como cnpj para 14 dígitos", () => {
    const payload = buildRegisterApiPayload({
      companyName: "Clínica Saúde",
      taxId: "11.222.333/0001-81",
      uf: "SP",
      city: "São Paulo",
      email: "contato@clinica.com",
      phone: "11987654321",
      password: "Senha@123",
      confirmPassword: "Senha@123",
      plan: "basic",
    });

    expect(payload.taxId).toBe("11222333000181");
    expect(payload.taxIdType).toBe("cnpj");
  });
});

describe("toRegisterAdminDto", () => {
  it("mapeia campos conforme contrato da API", () => {
    const dto = toRegisterAdminDto({
      companyName: "Clínica Saúde",
      taxId: "529.982.247-25",
      uf: "SP",
      city: "São Paulo",
      email: "contato@clinica.com",
      phone: "11987654321",
      password: "Senha@123",
      confirmPassword: "Senha@123",
      plan: "basic",
    });

    expect(dto).toEqual({
      companyName: "Clínica Saúde",
      taxId: "52998224725",
      taxIdType: "cpf",
      uf: "SP",
      city: "São Paulo",
      email: "contato@clinica.com",
      phone: "+5511987654321",
      password: "Senha@123",
      confirmPassword: "Senha@123",
      plan: "basic",
    });
  });
});
