import "server-only";

import type { CompanyRegisterFormValues } from "../schemas/companyRegisterSchema";
import type { RegisterClinicDto, RegisterClinicResponse } from "../types";
import { detectTaxIdType, stripDigits } from "@/lib/validators/cpfCnpj";

function toRegisterClinicDto(
  values: CompanyRegisterFormValues,
): RegisterClinicDto {
  const taxId = stripDigits(values.taxId);
  const taxIdType = detectTaxIdType(taxId);

  return {
    clinicName: values.companyName,
    taxId,
    taxIdType: taxIdType === "cnpj" ? "cnpj" : "cpf",
    stateUf: values.stateUf,
    city: values.city,
    cityIbgeId: values.cityIbgeId,
    email: values.email,
    password: values.password,
    plan: values.plan,
  };
}

type ApiRegisterSuccess = {
  ok: true;
  data: { clinicId?: string; userId?: string; accessToken?: string };
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
        message: "API_URL não configurada.",
      },
    };
  }

  const payload = toRegisterClinicDto(values);

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
            body && !body.ok
              ? body.error.message
              : "Não foi possível concluir o cadastro.",
        },
      };
    }

    const clinicId = body.data.clinicId;

    if (!clinicId) {
      return {
        ok: false,
        error: {
          code: "REGISTER_ERROR",
          message: "Resposta de cadastro inválida.",
        },
      };
    }

    return {
      ok: true,
      data: { clinicId },
    };
  } catch {
    return {
      ok: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Erro de conexão com o servidor.",
      },
    };
  }
}
