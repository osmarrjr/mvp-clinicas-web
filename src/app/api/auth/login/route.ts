import { NextResponse } from "next/server";

import { loginSchema } from "@/features/auth/schemas/loginSchema";
import { loginServerService } from "@/features/auth/services/auth/authServerService";
import { getErrorMessage } from "@/lib/api/error-messages";
import { decodeAccessToken } from "@/lib/auth/jwt";

function errorResponse(code: string, message?: string, status = 400) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message: getErrorMessage(message),
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
    return errorResponse("INVALID_JSON");
  }

  const parsed = loginSchema.safeParse(json);

  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR");
  }

  const response = await loginServerService(parsed.data);

  if (!response.ok) {
    return errorResponse(response.error.code, response.error.message);
  }

  const decodedUser = decodeAccessToken(response.data.accessToken);

  if (!decodedUser) {
    return errorResponse("INVALID_TOKEN", undefined, 500);
  }

  const passwordChangeRequired = response.data.passwordChangeRequired === true;

  const nextResponse = NextResponse.json({
    ok: true,
    data: {
      user: decodedUser,
      passwordChangeRequired,
    },
  });

  nextResponse.cookies.set("accessToken", response.data.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: response.data.expiresIn,
  });

  nextResponse.cookies.set("refreshToken", response.data.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return nextResponse;
}
