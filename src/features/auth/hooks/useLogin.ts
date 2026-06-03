"use client";

import { useState } from "react";

import type { LoginFormValues } from "../schemas/loginSchema";
import { loginClientService } from "../services/authClientService";

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Email ou senha incorretos.",
  INTERNAL_ERROR: "Ocorreu um erro inesperado. Tente novamente.",
};

export function useLogin() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function login(payload: LoginFormValues) {
    setIsPending(true);
    setIsSuccess(false);
    setErrorMessage(null);

    try {
      console.log("payload", payload);
      const response = await loginClientService(payload);

      if (!response.ok) {
        const message =
          LOGIN_ERROR_MESSAGES[response.error.code] ??
          LOGIN_ERROR_MESSAGES.INTERNAL_ERROR;

        setErrorMessage(message);
        return null;
      }

      setIsSuccess(true);
      return response.data;
    } catch {
      setErrorMessage(LOGIN_ERROR_MESSAGES.INTERNAL_ERROR);
      return null;
    } finally {
      setIsPending(false);
    }
  }

  function clearError() {
    setErrorMessage(null);
  }

  return {
    login,
    isPending,
    isSuccess,
    errorMessage,
    clearError,
  };
}
