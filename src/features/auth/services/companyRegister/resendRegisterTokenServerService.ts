import "server-only";

import type {
  ResendRegisterTokenDto,
  ResendRegisterTokenResponse,
} from "../../types";

type ApiErrorShape = {
  code: string;
  message: string;
};

type ApiResendSuccess = {
  ok: true;
  data: { sent: boolean };
};

export async function resendRegisterTokenServerService(
  payload: ResendRegisterTokenDto,
): Promise<ResendRegisterTokenResponse> {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    return {
      ok: false,
      error: {
        code: "ENV_ERROR",
        message: "",
      },
    };
  }

  try {
    const response = await fetch(`${apiUrl}/auth/resend-email-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: payload.email,
      }),
      cache: "no-store",
    });

    const body = (await response.json().catch(() => null)) as
      | ApiResendSuccess
      | { ok: false; error: ApiErrorShape }
      | null;

    if (!response.ok || !body || !body.ok) {
      return {
        ok: false,
        error: {
          code: body && !body.ok ? body.error.code : "VALIDATION_ERROR",
          message: body && !body.ok ? (body.error.message ?? "") : "",
        },
      };
    }

    return {
      ok: true,
      data: { sent: body.data.sent },
    };
  } catch {
    return {
      ok: false,
      error: {
        code: "NETWORK_ERROR",
        message: "",
      },
    };
  }
}
