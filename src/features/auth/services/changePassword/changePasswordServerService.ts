import "server-only";

import type { ChangePasswordRequest } from "../../schemas/changePasswordSchema";
import type { ChangePasswordResponse } from "../../types";

type ApiErrorShape = {
  code: string;
  message: string;
};

export async function changePasswordServerService(
  accessToken: string,
  payload: ChangePasswordRequest,
): Promise<ChangePasswordResponse> {
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
    const response = await fetch(`${apiUrl}/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const body = (await response.json().catch(() => null)) as
      | ChangePasswordResponse
      | { ok: false; error: ApiErrorShape }
      | null;

    if (!body || !body.ok) {
      return {
        ok: false,
        error: {
          code: body?.error?.code ?? "PASSWORD_CHANGE_FAILED",
          message: body?.error?.message ?? "",
        },
      };
    }

    return body;
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
