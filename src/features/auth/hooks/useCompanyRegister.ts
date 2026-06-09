"use client";

import { useMutation } from "@tanstack/react-query";

import { authMutationKeys } from "../constants/queryKeys";
import type { CompanyRegisterFormValues } from "../schemas/companyRegisterSchema";
import { registerClientService } from "../services/registerClientService";

const REGISTER_ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "Dados inválidos. Verifique os campos e tente novamente.",
  USER_ALREADY_EXISTS: "Já existe um cadastro com este email.",
  REGISTER_ERROR: "Não foi possível concluir o cadastro.",
  NETWORK_ERROR: "Erro de conexão com o servidor.",
  INTERNAL_ERROR: "Ocorreu um erro inesperado. Tente novamente.",
};

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
        throw new Error(REGISTER_ERROR_MESSAGES.INTERNAL_ERROR);
      }

      if (!response.ok) {
        const message =
          REGISTER_ERROR_MESSAGES[response.error.code] ??
          response.error.message ??
          REGISTER_ERROR_MESSAGES.INTERNAL_ERROR;

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
    return mutation.mutateAsync(payload);
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
