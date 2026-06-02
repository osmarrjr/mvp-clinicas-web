'use client';

import { useState } from 'react';

import type { LoginFormValues } from '../schemas/loginSchema';
import { loginClientService } from '../services/authClientService';

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: 'Email ou senha incorretos.',
  INTERNAL_ERROR: 'Ocorreu um erro inesperado. Tente novamente.',
};

export function useLogin() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function login(payload: LoginFormValues) {
    setIsPending(true);
    setIsSuccess(false);
    setErrorMessage(null);

    const response = await loginClientService(payload);

    if (!response.ok) {
      setErrorMessage(
        LOGIN_ERROR_MESSAGES[response.error.code] ?? LOGIN_ERROR_MESSAGES.INTERNAL_ERROR,
      );
      setIsPending(false);
      throw new Error(response.error.code);
    }

    setIsSuccess(true);
    setIsPending(false);
    return response.data;
  }

  return {
    login,
    isPending,
    isSuccess,
    errorMessage,
  };
}
