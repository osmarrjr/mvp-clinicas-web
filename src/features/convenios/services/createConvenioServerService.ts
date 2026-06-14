import "server-only";

import type { CreateConvenioRequest, CreateConvenioResponse } from "../types";

type ApiErrorShape = {
  code: string;
  message: string;
};

export async function createConvenioServerService(
  accessToken: string,
  payload: CreateConvenioRequest,
): Promise<CreateConvenioResponse> {
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
    const response = await fetch(`${apiUrl}/clinic-convenio-register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const body = (await response.json().catch(() => null)) as
      | CreateConvenioResponse
      | { ok: false; error: ApiErrorShape }
      | null;

    if (!body || !body.ok) {
      return {
        ok: false,
        error: {
          code: body?.error?.code ?? "CONVENIO_CREATE_FAILED",
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
