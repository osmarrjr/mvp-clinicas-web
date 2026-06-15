"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { getErrorMessage } from "@/lib/api/error-messages";

import { staffQueryKeys } from "../constants/queryKeys";
import { listStaffClientService } from "../services/staffClientService";

export function useStaffList() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: staffQueryKeys.list,
    queryFn: async () => {
      const response = await listStaffClientService();

      if (!response.ok) {
        throw new Error(getErrorMessage(response.error.message));
      }

      return response.data;
    },
  });

  const clearError = useCallback(() => {
    queryClient.resetQueries({ queryKey: staffQueryKeys.list });
  }, [queryClient]);

  return {
    staff: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    errorMessage: query.isError
      ? (query.error?.message ?? getErrorMessage())
      : null,
    refetch: query.refetch,
    clearError,
  };
}
