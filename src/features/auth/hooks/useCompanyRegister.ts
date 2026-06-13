"use client";

import { useMutation } from "@tanstack/react-query";

import { getErrorMessage } from "@/lib/api/error-messages";

import { authMutationKeys } from "../constants/queryKeys";
import type { CompanyRegisterFormValues } from "../schemas/companyRegisterSchema";
import { registerClientService } from "../services/companyRegister/registerClientService";

export type UseCompanyRegisterOptions = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export function useCompanyRegister(options?: UseCompanyRegisterOptions) {
  const mutation = useMutation({
    mutationKey: authMutationKeys.register,
    mutationFn: async (payload: CompanyRegisterFormValues) => {
      let response;

      try {
        response = await registerClientService(payload);
      } catch {
        throw new Error(getErrorMessage("INTERNAL_ERROR"));
      }

      if (!response.ok) {
        const message = getErrorMessage(
          response.error.code,
          response.error.message,
        );

        throw new Error(message);
      }

      return response.data;
    },
    onSuccess: options?.onSuccess,
    onError: (error) => {
      options?.onError?.(error.message);
    },
  });

  async function register(payload: CompanyRegisterFormValues) {
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
    register,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    errorMessage: mutation.error?.message ?? null,
    clearError,
    resetSuccess,
  };
}
