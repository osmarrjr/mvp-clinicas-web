import type { CompanyRegisterFormValues } from "../../schemas/companyRegisterSchema";
import type { RegisterAdminDto } from "../../types";
import { detectTaxIdType, stripDigits } from "../../validators/cpfCnpj/cpfCnpj";
import { stripPhoneDigits } from "../../validators/phone/phone";

export type RegisterApiPayload = CompanyRegisterFormValues & {
  taxIdType: "cpf" | "cnpj";
};

export function resolveTaxIdType(taxId: string): "cpf" | "cnpj" {
  return detectTaxIdType(taxId) === "cnpj" ? "cnpj" : "cpf";
}

export function formatPhoneForApi(phone: string): string {
  return `+55${stripPhoneDigits(phone)}`;
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

export function toRegisterAdminDto(
  values: CompanyRegisterFormValues,
): RegisterAdminDto {
  const { taxId, taxIdType } = buildRegisterApiPayload(values);

  return {
    companyName: values.companyName,
    taxId,
    taxIdType,
    uf: values.uf,
    city: values.city,
    email: values.email,
    phone: formatPhoneForApi(values.phone),
    password: values.password,
    confirmPassword: values.confirmPassword,
    plan: values.plan,
  };
}
