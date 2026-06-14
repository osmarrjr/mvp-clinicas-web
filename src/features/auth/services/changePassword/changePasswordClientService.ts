import type { ChangePasswordRequest } from "../../schemas/changePasswordSchema";
import type { ChangePasswordResponse } from "../../types";

export async function changePasswordClientService(
  payload: ChangePasswordRequest,
): Promise<ChangePasswordResponse> {
  const response = await fetch("/api/auth/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as ChangePasswordResponse;

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
