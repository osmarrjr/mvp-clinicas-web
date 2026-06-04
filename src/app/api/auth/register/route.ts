import { NextResponse } from "next/server";

import { companyRegisterSchema } from "@/features/auth/schemas/companyRegisterSchema";
import { registerServerService } from "@/features/auth/services/registerServerService";

const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "Dados inválidos. Verifique os campos e tente novamente.",
  USER_ALREADY_EXISTS: "Já existe um cadastro com este email.",
  REGISTER_ERROR: "Não foi possível concluir o cadastro.",
  NETWORK_ERROR: "Erro de conexão com o servidor.",
  ENV_ERROR: "Serviço temporariamente indisponível.",
  INTERNAL_ERROR: "Ocorreu um erro inesperado. Tente novamente.",
};

function getStatusByErrorCode(code: string) {
  const statusMap: Record<string, number> = {
    VALIDATION_ERROR: 400,
    USER_ALREADY_EXISTS: 400,
    REGISTER_ERROR: 400,
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
    return errorResponse("VALIDATION_ERROR", "Corpo da requisição inválido.", 400);
  }

  const parsed = companyRegisterSchema.safeParse(json);

  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Dados inválidos. Verifique os campos e tente novamente.",
      400,
    );
  }

  const response = await registerServerService(parsed.data);

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
        clinicId: response.data.clinicId,
      },
    },
    { status: 201 },
  );
}
