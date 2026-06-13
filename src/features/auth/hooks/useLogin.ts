"use client";

import { useState } from "react";

import { getErrorMessage } from "@/lib/api/error-messages";

import type { LoginFormValues } from "../schemas/loginSchema";
import { loginClientService } from "../services/auth/authClientService";

export function useLogin() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function login(payload: LoginFormValues) {
    setIsPending(true);
    setIsSuccess(false);
    setErrorMessage(null);

    try {
      const response = await loginClientService(payload);

      if (!response.ok) {
        setErrorMessage(
          getErrorMessage(response.error.code, response.error.message),
        );
        return null;
      }

      setIsSuccess(true);
      return response.data;
    } catch {
      setErrorMessage(getErrorMessage("INTERNAL_ERROR"));
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
