"use client";

import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CompanyRegisterFormValues } from "../../../schemas/companyRegisterSchema";

type RegisterEmailFieldProps = {
  register: UseFormRegister<CompanyRegisterFormValues>;
  errors: FieldErrors<CompanyRegisterFormValues>;
  inputClassName: string;
};

export function RegisterEmailField({
  register,
  errors,
  inputClassName,
}: RegisterEmailFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="email" className="text-base font-medium text-blue-50">
        Email
      </Label>
      <Input
        id="email"
        type="email"
        autoComplete="email"
        placeholder="contato@empresa.com"
        maxLength={70}
        aria-invalid={Boolean(errors.email)}
        className={inputClassName}
        {...register("email")}
      />
      {errors.email?.message ? (
        <p className="text-base font-medium text-red-200" role="alert">
          {errors.email.message}
        </p>
      ) : null}
    </div>
  );
}
