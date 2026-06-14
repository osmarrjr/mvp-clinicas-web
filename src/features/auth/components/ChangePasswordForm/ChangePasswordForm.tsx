"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { disabledFieldClassName } from "@/lib/styles/disabled-field";

import {
  AUTH_FORM_INPUT_CLASS_NAME,
  AUTH_ROUTES,
  PASSWORD_REQUIREMENTS_TOOLTIP,
} from "../../constants";
import { useChangePassword } from "../../hooks/auth/useChangePassword";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "../../schemas/changePasswordSchema";
import { getPasswordValidationError } from "../../validators/password/password";
import { ChangePasswordOverlays } from "./ChangePasswordOverlays";

export function ChangePasswordForm() {
  const router = useRouter();
  const {
    changePassword,
    isPending,
    isSuccess,
    errorMessage,
    clearError,
    resetSuccess,
  } = useChangePassword();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorDismissed, setErrorDismissed] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = form.watch("newPassword");
  const confirmPassword = form.watch("confirmPassword");
  const isNewPasswordValid = useMemo(
    () => getPasswordValidationError(newPassword, {}) === null,
    [newPassword],
  );

  useEffect(() => {
    if (!isNewPasswordValid && confirmPassword) {
      form.setValue("confirmPassword", "", { shouldValidate: true });
    }
  }, [confirmPassword, form, isNewPasswordValid]);

  const errorModalOpen = Boolean(errorMessage) && !errorDismissed;
  const newPasswordError = form.formState.errors.newPassword?.message;
  const confirmPasswordError = form.formState.errors.confirmPassword?.message;
  const isSubmitDisabled = !form.formState.isValid || isPending;

  async function onSubmit(values: ChangePasswordFormValues) {
    setErrorDismissed(false);
    await changePassword(values);
  }

  function handleDismissError() {
    setErrorDismissed(true);
    clearError();
  }

  function handleConfirmSuccess() {
    resetSuccess();
    router.push(AUTH_ROUTES.dashboard);
  }

  return (
    <>
      <Card className="relative z-10 w-full max-w-md rounded-[32px] border border-white/20 bg-white/10 shadow-2xl shadow-blue-950/40 backdrop-blur-2xl">
        <CardHeader className="space-y-4 text-center pt-9 pb-5">
          <div>
            <CardTitle className="text-3xl font-bold tracking-tight text-white">
              Nova senha
            </CardTitle>
            <p className="mt-2 text-base text-blue-100/80">
              Defina uma senha segura para continuar
            </p>
          </div>
        </CardHeader>

        <CardContent className="px-7 pb-8">
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <div className="space-y-2">
              <Label
                htmlFor="newPassword"
                className="text-base font-medium text-blue-50"
              >
                Nova senha
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Digite a nova senha"
                  aria-invalid={Boolean(newPasswordError)}
                  title={PASSWORD_REQUIREMENTS_TOOLTIP}
                  className={AUTH_FORM_INPUT_CLASS_NAME}
                  {...form.register("newPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 transition hover:text-blue-700"
                  aria-label={
                    showNewPassword ? "Ocultar senha" : "Exibir senha"
                  }
                >
                  {showNewPassword ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
              {newPasswordError ? (
                <p className="text-base font-medium text-red-200" role="alert">
                  {newPasswordError}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-base font-medium text-blue-50"
              >
                Confirmar senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Confirme a nova senha"
                  disabled={!isNewPasswordValid}
                  aria-invalid={Boolean(confirmPasswordError)}
                  className={AUTH_FORM_INPUT_CLASS_NAME}
                  {...form.register("confirmPassword")}
                />
                <button
                  type="button"
                  disabled={!isNewPasswordValid}
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 transition cursor-pointer ${disabledFieldClassName}`}
                  aria-label={
                    showConfirmPassword ? "Ocultar senha" : "Exibir senha"
                  }
                >
                  {showConfirmPassword ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
              {confirmPasswordError ? (
                <p className="text-base font-medium text-red-200" role="alert">
                  {confirmPasswordError}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isSubmitDisabled}
            >
              {isPending ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <ChangePasswordOverlays
        isPending={isPending}
        errorModalOpen={errorModalOpen}
        errorMessage={errorMessage}
        onDismissError={handleDismissError}
        isSuccess={isSuccess}
        onConfirmSuccess={handleConfirmSuccess}
      />
    </>
  );
}
