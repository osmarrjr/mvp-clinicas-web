import type { CompanyRegisterFormValues } from "../../schemas/companyRegisterSchema";
import type { RegisterClinicResponse } from "../../types";
import { buildRegisterApiPayload } from "./registerPayload";

export async function registerClientService(
  payload: CompanyRegisterFormValues,
): Promise<RegisterClinicResponse> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildRegisterApiPayload(payload)),
  });

  const body = (await response.json()) as RegisterClinicResponse;

  if (!response.ok || !body.ok) {
    return {
      ok: false,
      error: {
        code: body.ok ? "REGISTER_ERROR" : body.error.code,
        message: body.ok
          ? "Não foi possível concluir o cadastro."
          : body.error.message,
      },
    };
  }

  return body;
}
