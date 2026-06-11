"use client";

import type {
  FieldErrors,
  UseFormSetValue,
  UseFormTrigger,
} from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatTaxId, stripDigits } from "../../../validators/cpfCnpj/cpfCnpj";
import type { CompanyRegisterFormValues } from "../../../schemas/companyRegisterSchema";

type RegisterTaxIdFieldProps = {
  taxIdValue: string;
  setValue: UseFormSetValue<CompanyRegisterFormValues>;
  trigger: UseFormTrigger<CompanyRegisterFormValues>;
  errors: FieldErrors<CompanyRegisterFormValues>;
  inputClassName: string;
};

export function RegisterTaxIdField({
  taxIdValue,
  setValue,
  trigger,
  errors,
  inputClassName,
}: RegisterTaxIdFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="taxId" className="text-base font-medium text-blue-50">
        CPF ou CNPJ
      </Label>
      <Input
        id="taxId"
        placeholder="Digite o cpf/cnpj da empresa ou pessoa física"
        aria-invalid={Boolean(errors.taxId)}
        className={inputClassName}
        value={taxIdValue}
        onChange={(event) => {
          setValue("taxId", formatTaxId(stripDigits(event.target.value)), {
            shouldValidate: true,
            shouldDirty: true,
          });
        }}
        onBlur={() => {
          void trigger("taxId");
        }}
      />
      {errors.taxId?.message ? (
        <p className="text-base font-medium text-red-200" role="alert">
          {errors.taxId.message}
        </p>
      ) : null}
    </div>
  );
}
