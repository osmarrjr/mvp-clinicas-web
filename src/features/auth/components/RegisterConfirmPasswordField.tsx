"use client";

import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { CompanyRegisterFormValues } from "../schemas/companyRegisterSchema";

type RegisterConfirmPasswordFieldProps = {
  form: UseFormReturn<CompanyRegisterFormValues>;
  passwordValue: string;
  confirmPasswordValue: string;
  inputClassName: string;
};

export function RegisterConfirmPasswordField({
  form,
  passwordValue,
  confirmPasswordValue,
  inputClassName,
}: RegisterConfirmPasswordFieldProps) {
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const confirmFeedback =
    confirmPasswordValue.length > 0
      ? passwordValue === confirmPasswordValue
        ? "Senhas conferem"
        : "As senhas não conferem"
      : null;

  return (
    <div className="space-y-2">
      <Label
        htmlFor="confirmPassword"
        className="text-sm font-medium text-blue-50"
      >
        Confirmar senha
      </Label>

      <div className="relative">
        <Input
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Confirme sua senha"
          maxLength={20}
          aria-invalid={Boolean(form.formState.errors.confirmPassword)}
          className={`${inputClassName} pr-12`}
          {...form.register("confirmPassword")}
        />

        <button
          type="button"
          onClick={() => setShowConfirmPassword((current) => !current)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-100/70 transition hover:text-white cursor-pointer"
          aria-label={
            showConfirmPassword
              ? "Ocultar confirmação de senha"
              : "Exibir confirmação de senha"
          }
        >
          {!showConfirmPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      {confirmFeedback ? (
        <p className="text-sm font-medium text-red-200">{confirmFeedback}</p>
      ) : null}

      {form.formState.errors.confirmPassword?.message ? (
        <p className="text-sm font-medium text-red-200" role="alert">
          {form.formState.errors.confirmPassword.message}
        </p>
      ) : null}
    </div>
  );
}
