export const ibgeQueryKeys = {
  all: ["ibge"] as const,
  states: () => [...ibgeQueryKeys.all, "states"] as const,
  cities: (uf: string) => [...ibgeQueryKeys.all, "cities", uf] as const,
};

export const authMutationKeys = {
  register: ["auth", "register"] as const,
};
