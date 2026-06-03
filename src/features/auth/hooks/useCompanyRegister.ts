"use client";

import { useState } from "react";

import type { CompanyRegisterFormValues } from "../schemas/companyRegisterSchema";
import { registerClientService } from "../services/registerClientService";

const REGISTER_ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "Dados inválidos. Verifique os campos e tente novamente.",
  USER_ALREADY_EXISTS: "Já existe um cadastro com este email.",
  REGISTER_ERROR: "Não foi possível concluir o cadastro.",
  NETWORK_ERROR: "Erro de conexão com o servidor.",
  INTERNAL_ERROR: "Ocorreu um erro inesperado. Tente novamente.",
};

export function useCompanyRegister() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function register(payload: CompanyRegisterFormValues) {
    setIsPending(true);
    setIsSuccess(false);
    setErrorMessage(null);

    try {
      const response = await registerClientService(payload);

      if (!response.ok) {
        const message =
          REGISTER_ERROR_MESSAGES[response.error.code] ??
          response.error.message ??
          REGISTER_ERROR_MESSAGES.INTERNAL_ERROR;

        setErrorMessage(message);
        return null;
      }

      setIsSuccess(true);
      return response.data;
    } catch {
      setErrorMessage(REGISTER_ERROR_MESSAGES.INTERNAL_ERROR);
      return null;
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
    register,
    isPending,
    isSuccess,
    errorMessage,
    clearError,
    resetSuccess,
  };
}
