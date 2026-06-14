"use client";

import { useState } from "react";

import { getErrorMessage } from "@/lib/api/error-messages";
import { setStoredUser } from "@/lib/auth/user-storage";

import type { LoginFormValues } from "../../schemas/loginSchema";
import type { LoginClientData } from "../../types";
import { loginClientService } from "../../services/auth/authClientService";

export function useLogin() {
  const [isPending, setIsPending] = useState(false);
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function login(
    payload: LoginFormValues,
  ): Promise<LoginClientData | null> {
    setIsPending(true);
    setPasswordChangeRequired(false);
    setErrorMessage(null);

    try {
      const response = await loginClientService(payload);

      if (!response.ok) {
        if (response.error.code === "PASSWORD_CHANGE_REQUIRED") {
          setPasswordChangeRequired(true);
          return null;
        }

        setErrorMessage(getErrorMessage(response.error.message));
        return null;
      }

      if (response.data.passwordChangeRequired) {
        setPasswordChangeRequired(true);
        return null;
      }

      setStoredUser(response.data.user);

      return response.data;
    } catch {
      setErrorMessage(getErrorMessage());
      return null;
    } finally {
      setIsPending(false);
    }
  }

  function clearError() {
    setErrorMessage(null);
  }

  function clearPasswordChangeRequired() {
    setPasswordChangeRequired(false);
  }

  return {
    login,
    isPending,
    passwordChangeRequired,
    errorMessage,
    clearError,
    clearPasswordChangeRequired,
  };
}
