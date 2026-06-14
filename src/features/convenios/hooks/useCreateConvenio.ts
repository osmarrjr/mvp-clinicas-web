"use client";

import { useMutation } from "@tanstack/react-query";

import { getErrorMessage } from "@/lib/api/error-messages";

import { conveniosMutationKeys } from "../constants/queryKeys";
import type { CreateConvenioFormValues } from "../schemas/createConvenioSchema";
import { createConvenioClientService } from "../services/createConvenioClientService";

export type UseCreateConvenioOptions = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export function useCreateConvenio(options?: UseCreateConvenioOptions) {
  const mutation = useMutation({
    mutationKey: conveniosMutationKeys.create,
    mutationFn: async (payload: CreateConvenioFormValues) => {
      let response;

      try {
        response = await createConvenioClientService(payload);
      } catch {
        throw new Error(getErrorMessage());
      }

      if (!response.ok) {
        throw new Error(getErrorMessage(response.error.message));
      }

      return response.data;
    },
    onSuccess: options?.onSuccess,
    onError: (error) => {
      options?.onError?.(error.message);
    },
  });

  async function create(payload: CreateConvenioFormValues) {
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
    create,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    errorMessage: mutation.error?.message ?? null,
    clearError,
    resetSuccess,
  };
}
