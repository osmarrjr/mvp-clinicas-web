"use client";

import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Eye, EyeOff, Info } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { CompanyRegisterFormValues } from "../../../schemas/companyRegisterSchema";
import { disabledFieldClassName } from "@/lib/styles/disabled-field";

const CONFIRM_PASSWORD_TOOLTIP =
  "Digite uma senha válida no campo acima antes de confirmar.";

type RegisterConfirmPasswordFieldProps = {
  form: UseFormReturn<CompanyRegisterFormValues>;
  passwordValue: string;
  confirmPasswordValue: string;
  isPasswordValid: boolean;
  inputClassName: string;
};

export function RegisterConfirmPasswordField({
  form,
  passwordValue,
  confirmPasswordValue,
  isPasswordValid,
  inputClassName,
}: RegisterConfirmPasswordFieldProps) {
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!isPasswordValid && confirmPasswordValue) {
      form.setValue("confirmPassword", "", { shouldValidate: true });
    }
  }, [confirmPasswordValue, form, isPasswordValid]);

  const showMismatch =
    isPasswordValid &&
    confirmPasswordValue.length > 0 &&
    passwordValue !== confirmPasswordValue;
  const schemaError =
    !showMismatch && form.formState.errors.confirmPassword?.message
      ? form.formState.errors.confirmPassword.message
      : null;
  const showSchemaError =
    isPasswordValid &&
    Boolean(schemaError) &&
    (form.formState.isSubmitted ||
      form.formState.touchedFields.confirmPassword);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label
          htmlFor="confirmPassword"
          className="text-base font-medium text-blue-50"
        >
          Confirmar senha
        </Label>

        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Informação sobre confirmar senha"
                className="inline-flex items-center justify-center rounded-full text-blue-100/80 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60"
              >
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>

            <TooltipContent
              side="top"
              align="center"
              className="max-w-[260px] text-center"
            >
              {CONFIRM_PASSWORD_TOOLTIP}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="relative">
        <Input
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Confirme sua senha"
          maxLength={20}
          disabled={!isPasswordValid}
          aria-invalid={Boolean(showMismatch || showSchemaError)}
          className={`${inputClassName} pr-12`}
          {...form.register("confirmPassword")}
        />

        <button
          type="button"
          disabled={!isPasswordValid}
          onClick={() => setShowConfirmPassword((current) => !current)}
          className={`absolute right-4 top-1/2 -translate-y-1/2  transition cursor-pointer ${disabledFieldClassName}`}
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

      {showMismatch ? (
        <p className="text-base font-medium text-red-200" role="alert">
          As senhas não conferem
        </p>
      ) : showSchemaError ? (
        <p className="text-base font-medium text-red-200" role="alert">
          {schemaError}
        </p>
      ) : null}
    </div>
  );
}
