"use client";

import { useState } from "react";

import { getErrorMessage } from "@/lib/api/error-messages";

import type { ChangePasswordFormValues } from "../schemas/changePasswordSchema";
import { changePasswordClientService } from "../services/changePassword/changePasswordClientService";

export function useChangePassword() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function changePassword(payload: ChangePasswordFormValues) {
    setIsPending(true);
    setIsSuccess(false);
    setErrorMessage(null);

    try {
      const response = await changePasswordClientService({
        newPassword: payload.newPassword,
      });

      if (!response.ok) {
        setErrorMessage(getErrorMessage(response.error.message));
        return false;
      }

      setIsSuccess(true);
      return true;
    } catch {
      setErrorMessage(getErrorMessage());
      return false;
    } finally {
      setIsPending(false);
    }
  }

  function clearError() {
    setErrorMessage(null);
  }

  function resetSuccess() {
    setIsSuccess(false);
  }

  return {
    changePassword,
    isPending,
    isSuccess,
    errorMessage,
    clearError,
    resetSuccess,
  };
}
