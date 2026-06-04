import { NextResponse } from "next/server";

import { loginSchema } from "@/features/auth/schemas/loginSchema";
import { loginServerService } from "@/features/auth/services/authServerService";
import {
  isAuthMockEnabled,
  MOCK_ACCESS_TOKEN,
  MOCK_REFRESH_TOKEN,
  MOCK_USER,
} from "@/lib/auth/mock";

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

function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string,
) {
  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
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

  if (response.ok) {
    const nextResponse = NextResponse.json({
      ok: true,
      data: {
        user: response.data.user,
      },
    });

    setAuthCookies(
      nextResponse,
      response.data.accessToken,
      response.data.refreshToken,
    );

    return nextResponse;
  }

  if (isAuthMockEnabled()) {
    const nextResponse = NextResponse.json({
      ok: true,
      data: {
        user: MOCK_USER,
      },
    });

    setAuthCookies(nextResponse, MOCK_ACCESS_TOKEN, MOCK_REFRESH_TOKEN);

    return nextResponse;
  }

  return errorResponse(
    response.error.code,
    response.error.message,
    getStatusByErrorCode(response.error.code),
  );
}
