"use client";

import { useMutation } from "@tanstack/react-query";

import { authMutationKeys } from "../constants/queryKeys";
import { validateRegisterTokenClientService } from "../services/companyRegister/validateRegisterTokenClientService";
import type { ValidateRegisterTokenDto } from "../types";

const VALIDATE_TOKEN_ERROR_MESSAGES: Record<string, string> = {
  REGISTER_TOKEN_INVALID:
    "Token inválido ou expirado. Verifique o código enviado para seu email.",
  VALIDATION_ERROR: "Dados inválidos. Verifique o token e tente novamente.",
  NETWORK_ERROR: "Erro de conexão com o servidor.",
  INTERNAL_ERROR: "Ocorreu um erro inesperado. Tente novamente.",
};

export function useValidateRegisterToken() {
  const mutation = useMutation({
    mutationKey: authMutationKeys.validateRegisterToken,
    mutationFn: async (payload: ValidateRegisterTokenDto) => {
      let response;

      try {
        response = await validateRegisterTokenClientService(payload);
      } catch {
        throw new Error(VALIDATE_TOKEN_ERROR_MESSAGES.INTERNAL_ERROR);
      }

      if (!response.ok) {
        const message =
          VALIDATE_TOKEN_ERROR_MESSAGES[response.error.code] ??
          response.error.message ??
          VALIDATE_TOKEN_ERROR_MESSAGES.INTERNAL_ERROR;

        throw new Error(message);
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
