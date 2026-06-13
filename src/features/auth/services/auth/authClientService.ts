import type { LoginFormValues } from "../../schemas/loginSchema";
import type { LoginServerResponse } from "./authServerService";

export async function loginClientService(
  payload: LoginFormValues,
): Promise<LoginServerResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as LoginServerResponse;

  if (!response.ok || !body.ok) {
    return {
      ok: false,
      error: {
        code: body.ok ? "INTERNAL_ERROR" : body.error.code,
        message: body.ok
          ? "Erro inesperado no login."
          : body.error.message,
      },
    };
  }

  return body;
}
