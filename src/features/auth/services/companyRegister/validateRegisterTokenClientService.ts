import type { ValidateRegisterTokenDto, ValidateRegisterTokenResponse } from "../../types";
import { normalizeRegisterToken } from "../../validators/registerToken/registerToken";

export async function validateRegisterTokenClientService(
  payload: ValidateRegisterTokenDto,
): Promise<ValidateRegisterTokenResponse> {
  const response = await fetch("/api/auth/validate-register-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      token: normalizeRegisterToken(payload.token),
    }),
  });

  const body = (await response.json()) as ValidateRegisterTokenResponse;

  if (!response.ok || !body.ok) {
    return {
      ok: false,
      error: {
        code: body.ok ? "VALIDATION_ERROR" : body.error.code,
        message: body.ok ? "" : (body.error.message ?? ""),
      },
    };
  }

  return body;
}
