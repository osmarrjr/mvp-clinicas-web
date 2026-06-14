import type { LoginFormValues } from "../../schemas/loginSchema";
import type { LoginClientData } from "../../types";

type LoginClientError = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

type LoginClientSuccess = {
  ok: true;
  data: LoginClientData;
};

export type LoginClientResponse = LoginClientSuccess | LoginClientError;

export async function loginClientService(
  payload: LoginFormValues,
): Promise<LoginClientResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as LoginClientResponse;

  if (!response.ok || !body.ok) {
    return {
      ok: false,
      error: {
        code: body.ok ? "INTERNAL_ERROR" : body.error.code,
        message: body.ok ? "" : (body.error.message ?? ""),
      },
    };
  }

  return body;
}
