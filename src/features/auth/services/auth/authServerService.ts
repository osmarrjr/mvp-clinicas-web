import "server-only";

import type { LoginFormValues } from "../../schemas/loginSchema";

type LoginSuccessData = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    clinicId: string;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    sex: string | null;
    createdAt: string;
    updatedAt: string;
  };
};

type ApiErrorShape = {
  code: string;
  message: string;
};

export type LoginServerResponse =
  | { ok: true; data: LoginSuccessData }
  | { ok: false; error: ApiErrorShape };

export async function loginServerService(
  payload: LoginFormValues,
): Promise<LoginServerResponse> {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    return {
      ok: false,
      error: {
        code: "ENV_ERROR",
        message: "API_URL não configurada.",
      },
    };
  }

  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        ok: false,
        error: {
          code: body?.error?.code ?? "LOGIN_ERROR",
          message: body?.error?.message ?? "Não foi possível realizar o login.",
        },
      };
    }

    return body as LoginServerResponse;
  } catch {
    return {
      ok: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Erro de conexão com o servidor.",
      },
    };
  }
}
