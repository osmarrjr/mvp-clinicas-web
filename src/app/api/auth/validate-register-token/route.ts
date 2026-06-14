import { NextResponse } from "next/server";

import { validateRegisterTokenRequestSchema } from "@/features/auth/schemas/registerTokenSchema";
import { validateRegisterTokenServerService } from "@/features/auth/services/companyRegister/validateRegisterTokenServerService";
import { getErrorMessage } from "@/lib/api/error-messages";

function errorResponse(code: string, message?: string) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message: getErrorMessage(message),
      },
    },
    { status: 400 },
  );
}

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return errorResponse("VALIDATION_ERROR");
  }

  const parsed = validateRegisterTokenRequestSchema.safeParse(json);

  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR");
  }

  const response = await validateRegisterTokenServerService(parsed.data);

  if (!response.ok) {
    return errorResponse(response.error.code, response.error.message);
  }

  return NextResponse.json(
    {
      ok: true,
      data: {
        verified: response.data.verified,
      },
    },
    { status: 201 },
  );
}
