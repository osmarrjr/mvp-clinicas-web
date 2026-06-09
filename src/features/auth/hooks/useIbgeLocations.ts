"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { ibgeQueryKeys } from "../constants/queryKeys";
import {
  fetchCitiesByUf,
  fetchStates,
  type IbgeMunicipality,
  type IbgeState,
} from "../services/ibgeClientService";

const IBGE_STALE_TIME = 1000 * 60 * 60 * 24;

export function useIbgeLocations(stateUf?: string) {
  const queryClient = useQueryClient();
  const normalizedUf = stateUf?.trim().toUpperCase() ?? "";

  const statesQuery = useQuery({
    queryKey: ibgeQueryKeys.states(),
    queryFn: fetchStates,
    staleTime: IBGE_STALE_TIME,
  });

  const citiesQuery = useQuery({
    queryKey: ibgeQueryKeys.cities(normalizedUf),
    queryFn: () => fetchCitiesByUf(normalizedUf),
    enabled: Boolean(normalizedUf),
    staleTime: IBGE_STALE_TIME,
  });

  const clearStatesError = useCallback(() => {
    queryClient.resetQueries({ queryKey: ibgeQueryKeys.states() });
  }, [queryClient]);

  const clearCitiesError = useCallback(() => {
    if (normalizedUf) {
      queryClient.resetQueries({
        queryKey: ibgeQueryKeys.cities(normalizedUf),
      });
    }
  }, [queryClient, normalizedUf]);

  return useMemo(
    () => ({
      states: (statesQuery.data ?? []) as IbgeState[],
      cities: (citiesQuery.data ?? []) as IbgeMunicipality[],
      isLoadingStates: statesQuery.isLoading,
      isLoadingCities: normalizedUf ? citiesQuery.isLoading : false,
      statesError: statesQuery.isError
        ? "Não foi possível carregar os estados."
        : null,
      citiesError:
        normalizedUf && citiesQuery.isError
          ? "Não foi possível carregar os municípios."
          : null,
      clearStatesError,
      clearCitiesError,
    }),
    [
      statesQuery.data,
      statesQuery.isLoading,
      statesQuery.isFetching,
      statesQuery.isError,
      citiesQuery.data,
      citiesQuery.isLoading,
      citiesQuery.isFetching,
      citiesQuery.isError,
      normalizedUf,
      clearStatesError,
      clearCitiesError,
    ],
  );
}
