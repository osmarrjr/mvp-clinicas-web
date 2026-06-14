import "server-only";

import type {
  ValidateRegisterTokenDto,
  ValidateRegisterTokenResponse,
} from "../../types";
import { normalizeRegisterToken } from "../../validators/registerToken/registerToken";

type ApiErrorShape = {
  code: string;
  message: string;
};

type ApiValidateSuccess = {
  ok: true;
  data: { verified: boolean };
};

export async function validateRegisterTokenServerService(
  payload: ValidateRegisterTokenDto,
): Promise<ValidateRegisterTokenResponse> {
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

  const normalizedCode = normalizeRegisterToken(payload.token);

  try {
    const response = await fetch(`${apiUrl}/auth/confirm-email-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: payload.email,
        code: normalizedCode,
      }),
      cache: "no-store",
    });

    const body = (await response.json().catch(() => null)) as
      | ApiValidateSuccess
      | { ok: false; error: ApiErrorShape }
      | null;

    if (!response.ok || !body || !body.ok) {
      return {
        ok: false,
        error: {
          code: body && !body.ok ? body.error.code : "VALIDATION_ERROR",
          message:
            body && !body.ok ? (body.error.message ?? "") : "",
        },
      };
    }

    return {
      ok: true,
      data: { verified: body.data.verified },
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
