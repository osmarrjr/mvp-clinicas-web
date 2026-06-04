"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  fetchCitiesByUf,
  fetchStates,
  type IbgeMunicipality,
  type IbgeState,
} from "../services/ibgeClientService";

export function useIbgeLocations(stateUf?: string) {
  const [states, setStates] = useState<IbgeState[]>([]);
  const [cities, setCities] = useState<IbgeMunicipality[]>([]);

  const [isLoadingStates, setIsLoadingStates] = useState(true);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const [statesError, setStatesError] = useState<string | null>(null);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  const statesRequestIdRef = useRef(0);
  const citiesRequestIdRef = useRef(0);

  const normalizedUf = stateUf?.trim().toUpperCase() ?? "";

  useEffect(() => {
    const requestId = ++statesRequestIdRef.current;

    async function loadStates() {
      setIsLoadingStates(true);
      setStatesError(null);

      try {
        const data = await fetchStates();

        if (requestId !== statesRequestIdRef.current) return;

        setStates(data);
      } catch {
        if (requestId !== statesRequestIdRef.current) return;

        setStates([]);
        setStatesError("Não foi possível carregar os estados.");
      } finally {
        if (requestId === statesRequestIdRef.current) {
          setIsLoadingStates(false);
        }
      }
    }

    void loadStates();

    return () => {
      statesRequestIdRef.current += 1;
    };
  }, []);

  useEffect(() => {
    const requestId = ++citiesRequestIdRef.current;

    if (!normalizedUf) {
      setCities([]);
      setCitiesError(null);
      setIsLoadingCities(false);
      return;
    }

    async function loadCities() {
      setIsLoadingCities(true);
      setCitiesError(null);
      setCities([]);

      try {
        const data = await fetchCitiesByUf(normalizedUf);

        if (requestId !== citiesRequestIdRef.current) return;

        setCities(data);
      } catch {
        if (requestId !== citiesRequestIdRef.current) return;

        setCities([]);
        setCitiesError("Não foi possível carregar os municípios.");
      } finally {
        if (requestId === citiesRequestIdRef.current) {
          setIsLoadingCities(false);
        }
      }
    }

    void loadCities();

    return () => {
      citiesRequestIdRef.current += 1;
    };
  }, [normalizedUf]);

  const clearStatesError = useCallback(() => {
    setStatesError(null);
  }, []);

  const clearCitiesError = useCallback(() => {
    setCitiesError(null);
  }, []);

  return useMemo(
    () => ({
      states,
      cities,
      isLoadingStates,
      isLoadingCities,
      statesError,
      citiesError,
      clearStatesError,
      clearCitiesError,
    }),
    [
      states,
      cities,
      isLoadingStates,
      isLoadingCities,
      statesError,
      citiesError,
      clearStatesError,
      clearCitiesError,
    ],
  );
}
