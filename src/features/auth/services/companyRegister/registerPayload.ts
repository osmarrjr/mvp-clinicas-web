import type { CompanyRegisterFormValues } from "../../schemas/companyRegisterSchema";
import { detectTaxIdType, stripDigits } from "../../validators/cpfCnpj/cpfCnpj";

export type RegisterApiPayload = CompanyRegisterFormValues & {
  taxIdType: "cpf" | "cnpj";
};

export function resolveTaxIdType(taxId: string): "cpf" | "cnpj" {
  return detectTaxIdType(taxId) === "cnpj" ? "cnpj" : "cpf";
}

export function buildRegisterApiPayload(
  values: CompanyRegisterFormValues,
): RegisterApiPayload {
  const taxId = stripDigits(values.taxId);

  return {
    ...values,
    taxId,
    taxIdType: resolveTaxIdType(taxId),
  };
}
