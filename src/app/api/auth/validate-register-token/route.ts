import { NextResponse } from "next/server";

import { validateRegisterTokenRequestSchema } from "@/features/auth/schemas/registerTokenSchema";
import { validateRegisterTokenServerService } from "@/features/auth/services/companyRegister/validateRegisterTokenServerService";
import { ERROR_MESSAGES } from "@/lib/api/error-messages";

function getStatusByErrorCode(code: string) {
  const statusMap: Record<string, number> = {
    REGISTER_TOKEN_INVALID: 400,
    VALIDATION_ERROR: 400,
    NETWORK_ERROR: 502,
    ENV_ERROR: 500,
  };

  return statusMap[code] ?? 500;
}

function errorResponse(code: string, message: string, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message: ERROR_MESSAGES[code] ?? message,
      },
    },
    { status },
  );
}

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return errorResponse(
      "VALIDATION_ERROR",
      "Corpo da requisição inválido.",
      400,
    );
  }

  const parsed = validateRegisterTokenRequestSchema.safeParse(json);

  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Dados inválidos. Verifique o token e tente novamente.",
      400,
    );
  }

  const response = await validateRegisterTokenServerService(parsed.data);

  if (!response.ok) {
    return errorResponse(
      response.error.code,
      response.error.message,
      getStatusByErrorCode(response.error.code),
    );
  }

  return NextResponse.json(
    {
      ok: true,
      data: {
        message: response.data.message,
      },
    },
    { status: 200 },
  );
}
