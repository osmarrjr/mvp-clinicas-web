import { NextResponse } from "next/server";

import { loginSchema } from "@/features/auth/schemas/loginSchema";
import { loginServerService } from "@/features/auth/services/authServerService";

function getStatusByErrorCode(code: string) {
  const statusMap: Record<string, number> = {
    VALIDATION_ERROR: 400,
    INVALID_CREDENTIALS: 401,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
  };

  return statusMap[code] ?? 500;
}

function errorResponse(code: string, message: string, status = 500) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
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
    return errorResponse("INVALID_JSON", "Corpo da requisição inválido.", 400);
  }

  const parsed = loginSchema.safeParse(json);

  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Dados inválidos. Verifique os campos e tente novamente.",
      400,
    );
  }

  const response = await loginServerService(parsed.data);

  if (!response.ok) {
    return errorResponse(
      response.error.code,
      response.error.message,
      getStatusByErrorCode(response.error.code),
    );
  }

  const nextResponse = NextResponse.json({
    ok: true,
    data: {
      user: response.data.user,
    },
  });

  nextResponse.cookies.set("accessToken", response.data.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 15 minutos
  });

  nextResponse.cookies.set("refreshToken", response.data.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  return nextResponse;
}
