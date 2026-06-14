import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { changePasswordRequestSchema } from "@/features/auth/schemas/changePasswordSchema";
import { changePasswordServerService } from "@/features/auth/services/changePassword/changePasswordServerService";
import { getErrorMessage } from "@/lib/api/error-messages";

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
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return errorResponse("AUTH_MISSING", undefined, 401);
  }

  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return errorResponse("INVALID_JSON");
  }

  const parsed = changePasswordRequestSchema.safeParse(json);

  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR");
  }

  const response = await changePasswordServerService(accessToken, parsed.data);

  if (!response.ok) {
    const status = response.error.code === "AUTH_INVALID" ? 401 : 400;
    return errorResponse(response.error.code, response.error.message, status);
  }

  return NextResponse.json(
    {
      ok: true,
      data: response.data,
    },
    { status: 201 },
  );
}
