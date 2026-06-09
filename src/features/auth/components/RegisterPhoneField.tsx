"use client";

import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPhone, stripPhoneDigits } from "@/lib/validators/phone";

import type { CompanyRegisterFormValues } from "../schemas/companyRegisterSchema";

type RegisterPhoneFieldProps = {
  register: UseFormRegister<CompanyRegisterFormValues>;
  setValue: UseFormSetValue<CompanyRegisterFormValues>;
  phoneValue: string;
  errors: FieldErrors<CompanyRegisterFormValues>;
  inputClassName: string;
};

export function RegisterPhoneField({
  register,
  setValue,
  phoneValue,
  errors,
  inputClassName,
}: RegisterPhoneFieldProps) {
  const { ref } = register("phone");

  return (
    <div className="space-y-2">
      <Label htmlFor="phone" className="text-sm font-medium text-blue-50">
        Telefone
      </Label>
      <Input
        id="phone"
        type="tel"
        autoComplete="tel"
        placeholder="(00) 00000-0000"
        maxLength={15}
        aria-invalid={Boolean(errors.phone)}
        className={inputClassName}
        ref={ref}
        value={formatPhone(phoneValue)}
        onChange={(event) => {
          setValue("phone", stripPhoneDigits(event.target.value), {
            shouldValidate: true,
            shouldDirty: true,
          });
        }}
      />
      {errors.phone?.message ? (
        <p className="text-sm font-medium text-red-200" role="alert">
          {errors.phone.message}
        </p>
      ) : null}
    </div>
  );
}
