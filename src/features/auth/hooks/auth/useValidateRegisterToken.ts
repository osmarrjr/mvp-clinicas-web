"use client";

import { useMutation } from "@tanstack/react-query";

import { getErrorMessage } from "@/lib/api/error-messages";

import { authMutationKeys } from "../../constants/queryKeys";
import { validateRegisterTokenClientService } from "../../services/companyRegister/validateRegisterTokenClientService";
import type { ValidateRegisterTokenDto } from "../../types";

export function useValidateRegisterToken() {
  const mutation = useMutation({
    mutationKey: authMutationKeys.validateRegisterToken,
    mutationFn: async (payload: ValidateRegisterTokenDto) => {
      let response;

      try {
        response = await validateRegisterTokenClientService(payload);
      } catch {
        throw new Error(getErrorMessage());
      }

      if (!response.ok) {
        throw new Error(getErrorMessage(response.error.message));
      }

      return response.data;
    },
  });

  async function validateToken(payload: ValidateRegisterTokenDto) {
    try {
      return await mutation.mutateAsync(payload);
    } catch {
      return null;
    }
  }

  function clearError() {
    mutation.reset();
  }

  function resetSuccess() {
    mutation.reset();
  }

  return {
    validateToken,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    errorMessage: mutation.error?.message ?? null,
    clearError,
    resetSuccess,
  };
}
