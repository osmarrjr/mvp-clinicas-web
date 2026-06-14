import "server-only";

import type { CompanyRegisterFormValues } from "../../schemas/companyRegisterSchema";
import type { RegisterClinicResponse } from "../../types";
import { toRegisterAdminDto } from "./registerPayload";

type ApiRegisterSuccess = {
  ok: true;
  data: { status: number; message: string };
};

type ApiErrorShape = {
  code: string;
  message: string;
};

export async function registerServerService(
  values: CompanyRegisterFormValues,
): Promise<RegisterClinicResponse> {
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

  const payload = toRegisterAdminDto(values);

  try {
    const response = await fetch(`${apiUrl}/auth/register-admin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const body = (await response.json().catch(() => null)) as
      | ApiRegisterSuccess
      | { ok: false; error: ApiErrorShape }
      | null;

    if (!response.ok || !body || !body.ok) {
      return {
        ok: false,
        error: {
          code: body && !body.ok ? body.error.code : "REGISTER_ERROR",
          message:
            body && !body.ok ? (body.error.message ?? "") : "",
        },
      };
    }

    return {
      ok: true,
      data: {
        status: body.data.status,
        message: body.data.message,
      },
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
