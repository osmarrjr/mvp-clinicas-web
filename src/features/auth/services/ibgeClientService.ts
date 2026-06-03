export type IbgeState = {
  id: number;
  sigla: string;
  nome: string;
};

export type IbgeMunicipality = {
  id: number;
  nome: string;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`IBGE HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function fetchStates(): Promise<IbgeState[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_IBGE_API_URL}/estados`,
    {
      cache: "no-store",
    },
  );
  const data = await parseJsonResponse<IbgeState[]>(response);
  return [...data].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export async function fetchCitiesByUf(uf: string): Promise<IbgeMunicipality[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_IBGE_API_URL}/estados/${uf}/municipios`,
    { cache: "no-store" },
  );
  const data = await parseJsonResponse<IbgeMunicipality[]>(response);
  return [...data].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}
