"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AUTH_TOKEN_DIGIT_INPUT_CLASS_NAME } from "../../constants";
import { REGISTER_VALIDATION_EMAIL_KEY } from "../../constants/registerValidation";
import { useValidateRegisterToken } from "../../hooks/auth/useValidateRegisterToken";
import {
  registerTokenSchema,
  type RegisterTokenFormValues,
} from "../../schemas/registerTokenSchema";
import { normalizeRegisterToken } from "../../validators/registerToken/registerToken";

import { RegisterTokenDigitInputs } from "./RegisterTokenDigitInputs/RegisterTokenDigitInputs";
import { ValidateTokenOverlays } from "./ValidateTokenOverlays";

const RESEND_COOLDOWN_SECONDS = 60;

export function ValidateRegisterTokenForm() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const [resendErrorDismissed, setResendErrorDismissed] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    validateToken,
    resendToken,
    isPending,
    isSuccess,
    errorMessage,
    clearError,
    resetSuccess,
    isResendPending,
    isResendSuccess,
    resendErrorMessage,
    clearResendStatus,
  } = useValidateRegisterToken();

  const form = useForm<RegisterTokenFormValues>({
    resolver: zodResolver(registerTokenSchema),
    mode: "onChange",
    defaultValues: {
      token: "",
    },
  });

  const tokenValue = form.watch("token");
  const digitCount = normalizeRegisterToken(tokenValue).length;
  const showTokenHint = digitCount < 6;

  const isTokenComplete = registerTokenSchema.safeParse({
    token: tokenValue,
  }).success;

  const errorModalOpen = Boolean(errorMessage) && !errorDismissed;
  const resendErrorModalOpen =
    Boolean(resendErrorMessage) && !resendErrorDismissed;

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendCooldown((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [resendCooldown]);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem(REGISTER_VALIDATION_EMAIL_KEY);

    if (!storedEmail) {
      router.replace("/register");
      return;
    }

    setEmail(storedEmail);
  }, [router]);

  function handleTokenChange(formatted: string) {
    setErrorDismissed(false);
    clearResendStatus();
    form.setValue("token", formatted, { shouldValidate: true });
  }

  async function handleValidateToken(values: RegisterTokenFormValues) {
    if (!email) {
      return;
    }

    setErrorDismissed(false);
    clearResendStatus();

    await validateToken({
      email,
      token: normalizeRegisterToken(values.token),
    });
  }

  async function handleResendToken() {
    if (!email || resendCooldown > 0) {
      return;
    }

    setErrorDismissed(false);
    setResendErrorDismissed(false);
    clearError();
    setResendCooldown(RESEND_COOLDOWN_SECONDS);

    await resendToken({ email });
  }

  function handleDismissError() {
    setErrorDismissed(true);
    clearError();
  }

  function handleDismissResendError() {
    setResendErrorDismissed(true);
    clearResendStatus();
  }

  function handleConfirmSuccess() {
    sessionStorage.removeItem(REGISTER_VALIDATION_EMAIL_KEY);
    resetSuccess();
    router.push("/login");
  }

  if (!email) {
    return null;
  }

  return (
    <>
      <Card className="relative z-10 w-full max-w-md rounded-[32px] border border-white/20 bg-white/[0.14] shadow-2xl shadow-blue-950/40 ring-1 ring-white/10 backdrop-blur-2xl">
        <CardHeader className="space-y-5 px-7 pt-9 pb-2 text-center">
          <div className="mx-auto">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-auto w-[240px] max-w-full sm:w-[265px]"
            />
          </div>

          <div>
            <CardTitle className="text-2xl font-bold text-white">
              Validar cadastro
            </CardTitle>

            <p className="mt-2 text-base leading-6 text-white">
              Insira o token enviado para{" "}
              <span className="break-all font-medium text-blue-300/95">
                {email}
              </span>
            </p>
          </div>
        </CardHeader>

        <CardContent className="px-7 pb-5">
          <form
            className="space-y-5"
            noValidate
            onSubmit={form.handleSubmit(handleValidateToken)}
          >
            <div className="space-y-3">
              <Label
                id="register-token-label"
                htmlFor="register-token-digit-1"
                className="text-base text-white"
              >
                Token de validação
              </Label>

              <RegisterTokenDigitInputs
                value={tokenValue}
                onChange={handleTokenChange}
                inputClassName={AUTH_TOKEN_DIGIT_INPUT_CLASS_NAME}
                ariaDescribedBy={
                  showTokenHint ? "register-token-hint" : undefined
                }
              />

              {showTokenHint ? (
                <p
                  id="register-token-hint"
                  role="status"
                  className="text-base leading-5 text-blue-100/70"
                >
                  Informe o token de 6 dígitos enviado para seu email.
                </p>
              ) : null}
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                variant="default"
                disabled={!isTokenComplete || isPending}
                className="w-full"
              >
                {isPending ? "Validando..." : "Validar"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                disabled={isResendPending || isPending || resendCooldown > 0}
                onClick={handleResendToken}
                className="w-full font-semibold text-white"
              >
                {isResendPending
                  ? "Reenviando..."
                  : resendCooldown > 0
                    ? `Reenviar token (${resendCooldown}s)`
                    : "Reenviar token"}
              </Button>

              {isResendSuccess ? (
                <p className="text-center text-sm leading-5 text-blue-100/80">
                  Token reenviado para o email informado.
                </p>
              ) : null}
            </div>

            <p className="text-center text-sm text-blue-100/75">
              Já possui conta?{" "}
              <Link
                href="/login"
                className="font-semibold text-white underline-offset-4 transition hover:text-sky-200 hover:underline"
              >
                Faça login
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>

      <ValidateTokenOverlays
        isPending={isPending}
        isResendPending={isResendPending}
        isSuccess={isSuccess}
        errorModalOpen={errorModalOpen}
        resendErrorModalOpen={resendErrorModalOpen}
        errorMessage={errorMessage}
        resendErrorMessage={resendErrorMessage}
        onDismissError={handleDismissError}
        onDismissResendError={handleDismissResendError}
        onConfirmSuccess={handleConfirmSuccess}
        onCancelSuccess={resetSuccess}
      />
    </>
  );
}
