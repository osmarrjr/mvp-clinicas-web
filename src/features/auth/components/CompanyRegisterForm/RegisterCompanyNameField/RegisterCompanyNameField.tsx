"use client";

import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { capitalizeFirstLetter } from "../../../validators/companyName/companyName";
import type { CompanyRegisterFormValues } from "../../../schemas/companyRegisterSchema";

type RegisterCompanyNameFieldProps = {
  register: UseFormRegister<CompanyRegisterFormValues>;
  setValue: UseFormSetValue<CompanyRegisterFormValues>;
  errors: FieldErrors<CompanyRegisterFormValues>;
  inputClassName: string;
};

export function RegisterCompanyNameField({
  register,
  setValue,
  errors,
  inputClassName,
}: RegisterCompanyNameFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="companyName" className="text-sm font-medium text-blue-50">
        Nome da empresa
      </Label>
      <Input
        id="companyName"
        placeholder="Digite o nome da empresa, pessoa física ou razão social"
        maxLength={70}
        aria-invalid={Boolean(errors.companyName)}
        className={inputClassName}
        {...register("companyName", {
          onBlur: (event) => {
            setValue("companyName", capitalizeFirstLetter(event.target.value), {
              shouldValidate: true,
              shouldDirty: true,
            });
          },
        })}
      />
      {errors.companyName?.message ? (
        <p className="text-sm font-medium text-red-200" role="alert">
          {errors.companyName.message}
        </p>
      ) : null}
    </div>
  );
}
