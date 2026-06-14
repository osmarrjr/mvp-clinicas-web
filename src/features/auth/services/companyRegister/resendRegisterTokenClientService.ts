import type {
  ResendRegisterTokenDto,
  ResendRegisterTokenResponse,
} from "../../types";

export async function resendRegisterTokenClientService(
  payload: ResendRegisterTokenDto,
): Promise<ResendRegisterTokenResponse> {
  const response = await fetch("/api/auth/resend-register-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
    }),
  });

  const body = (await response.json()) as ResendRegisterTokenResponse;

  if (!response.ok || !body.ok) {
    return {
      ok: false,
      error: {
        code: body.ok ? "RESEND_ERROR" : body.error.code,
        message: body.ok ? "" : (body.error.message ?? ""),
      },
    };
  }

  return body;
}
