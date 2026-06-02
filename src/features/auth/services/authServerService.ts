import 'server-only';
import type { LoginFormValues } from '../schemas/loginSchema';

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
  const response = await fetch(`${process.env.API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });

  const body = (await response.json()) as LoginServerResponse;

  if (!response.ok && body.ok) {
    return {
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro inesperado no login.',
      },
    };
  }

  return body;
}
