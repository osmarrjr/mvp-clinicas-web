"use client";

import { useState } from "react";
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
import {
  getPasswordHintMessage,
  getPasswordStrength,
  PASSWORD_REQUIREMENTS_TOOLTIP,
} from "@/lib/validators/password";

import type { CompanyRegisterFormValues } from "../schemas/companyRegisterSchema";

type RegisterPasswordFieldProps = {
  form: UseFormReturn<CompanyRegisterFormValues>;
  companyName: string;
  taxId: string;
  inputClassName: string;
};

function getStrengthBarColor(label: "fraca" | "media" | "forte"): string {
  if (label === "fraca") return "bg-red-500";
  if (label === "media") return "bg-yellow-400";
  return "bg-green-500";
}

export function RegisterPasswordField({
  form,
  companyName,
  taxId,
  inputClassName,
}: RegisterPasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const password = form.watch("password") ?? "";
  const hintMessage = getPasswordHintMessage(password, { companyName, taxId });
  const strength =
    password.length >= 8 ? getPasswordStrength(password) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-blue-50">
          Senha
        </Label>

        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Requisitos da senha"
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
              {PASSWORD_REQUIREMENTS_TOOLTIP}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="relative">
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Crie sua senha de acessos"
          maxLength={20}
          aria-invalid={Boolean(form.formState.errors.password)}
          className={`${inputClassName} pr-12`}
          {...form.register("password")}
        />

        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-100/70 transition hover:text-white cursor-pointer"
          aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
        >
          {!showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      {hintMessage ? (
        <p className="text-sm font-medium text-red-200">{hintMessage}</p>
      ) : null}

      {strength ? (
        <div className="space-y-1">
          <div
            role="progressbar"
            aria-valuenow={strength.score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Força da senha: ${strength.label}`}
            className="h-2 w-full overflow-hidden rounded-full bg-white/10"
          >
            <div
              className={`h-full transition-all ${getStrengthBarColor(strength.label)}`}
              style={{ width: `${strength.score}%` }}
            />
          </div>
        </div>
      ) : null}

      {form.formState.errors.password?.message ? (
        <p className="text-sm font-medium text-red-200" role="alert">
          {form.formState.errors.password.message}
        </p>
      ) : null}
    </div>
  );
}
