"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { REGISTER_TOKEN_DIGIT_INPUT_CLASS_NAME } from "../CompanyRegisterForm/constants";
import { REGISTER_VALIDATION_EMAIL_KEY } from "../../constants/registerValidation";
import { useValidateRegisterToken } from "../../hooks/useValidateRegisterToken";
import {
  registerTokenSchema,
  type RegisterTokenFormValues,
} from "../../schemas/registerTokenSchema";
import { normalizeRegisterToken } from "../../validators/registerToken/registerToken";

import { RegisterTokenDigitInputs } from "./RegisterTokenDigitInputs/RegisterTokenDigitInputs";
import { ValidateTokenOverlays } from "./ValidateTokenOverlays";

export function ValidateRegisterTokenForm() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [errorDismissed, setErrorDismissed] = useState(false);
  const lastSubmittedTokenRef = useRef<string | null>(null);

  const {
    validateToken,
    isPending,
    isSuccess,
    errorMessage,
    clearError,
    resetSuccess,
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

  useEffect(() => {
    const storedEmail = sessionStorage.getItem(REGISTER_VALIDATION_EMAIL_KEY);

    if (!storedEmail) {
      router.replace("/register");
      return;
    }

    setEmail(storedEmail);
  }, [router]);

  useEffect(() => {
    if (!email || !isTokenComplete || isPending || isSuccess) {
      return;
    }

    const normalizedToken = normalizeRegisterToken(tokenValue);

    if (lastSubmittedTokenRef.current === normalizedToken) {
      return;
    }

    lastSubmittedTokenRef.current = normalizedToken;
    setErrorDismissed(false);

    void validateToken({ email, token: tokenValue });
  }, [email, isTokenComplete, isPending, isSuccess, tokenValue, validateToken]);

  function handleTokenChange(formatted: string) {
    setErrorDismissed(false);
    form.setValue("token", formatted, { shouldValidate: true });
  }

  function handleDismissError() {
    setErrorDismissed(true);
    clearError();
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
        <CardHeader className="space-y-5 px-7 pt-9 pb-5 text-center">
          <div className="mx-auto">
            <img
              src="/loading-logo.svg"
              alt="Logo"
              className="h-auto w-[240px] max-w-full sm:w-[265px]"
            />
          </div>

          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              Validar cadastro
            </CardTitle>

            <p className="mt-2 text-base leading-6 text-blue-100/80">
              Insira o token enviado para{" "}
              <span className="break-all font-medium text-white">{email}</span>
            </p>
          </div>
        </CardHeader>

        <CardContent className="px-7 pb-8">
          <form className="space-y-5" noValidate>
            <div className="space-y-3">
              <Label
                id="register-token-label"
                htmlFor="register-token-digit-1"
                className="text-base font-medium text-blue-50"
              >
                Token de validação
              </Label>

              <RegisterTokenDigitInputs
                value={tokenValue}
                onChange={handleTokenChange}
                inputClassName={REGISTER_TOKEN_DIGIT_INPUT_CLASS_NAME}
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

            <p className="text-center text-base text-blue-100/75">
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
        isSuccess={isSuccess}
        errorModalOpen={errorModalOpen}
        errorMessage={errorMessage}
        onDismissError={handleDismissError}
        onConfirmSuccess={handleConfirmSuccess}
        onCancelSuccess={resetSuccess}
      />
    </>
  );
}
