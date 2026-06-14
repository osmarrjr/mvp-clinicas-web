"use client";

import { useMutation } from "@tanstack/react-query";

import { getErrorMessage } from "@/lib/api/error-messages";

import { authMutationKeys } from "../../constants/queryKeys";
import { resendRegisterTokenClientService } from "../../services/companyRegister/resendRegisterTokenClientService";
import { validateRegisterTokenClientService } from "../../services/companyRegister/validateRegisterTokenClientService";
import type {
  ResendRegisterTokenDto,
  ValidateRegisterTokenDto,
} from "../../types";

export function useValidateRegisterToken() {
  const validateMutation = useMutation({
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

  const resendMutation = useMutation({
    mutationKey: authMutationKeys.resendRegisterToken,
    mutationFn: async (payload: ResendRegisterTokenDto) => {
      let response;

      try {
        response = await resendRegisterTokenClientService(payload);
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
      return await validateMutation.mutateAsync(payload);
    } catch {
      return null;
    }
  }

  async function resendToken(payload: ResendRegisterTokenDto) {
    try {
      return await resendMutation.mutateAsync(payload);
    } catch {
      return null;
    }
  }

  function clearError() {
    validateMutation.reset();
  }

  function resetSuccess() {
    validateMutation.reset();
  }

  function clearResendStatus() {
    resendMutation.reset();
  }

  return {
    validateToken,
    resendToken,

    isPending: validateMutation.isPending,
    isSuccess: validateMutation.isSuccess,
    errorMessage: validateMutation.error?.message ?? null,

    isResendPending: resendMutation.isPending,
    isResendSuccess: resendMutation.isSuccess,
    resendErrorMessage: resendMutation.error?.message ?? null,

    clearError,
    resetSuccess,
    clearResendStatus,
  };
}
