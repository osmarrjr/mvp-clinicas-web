import { NextResponse } from "next/server";

import { resendRegisterTokenRequestSchema } from "@/features/auth/schemas/registerTokenSchema";
import { resendRegisterTokenServerService } from "@/features/auth/services/companyRegister/resendRegisterTokenServerService";
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

  const parsed = resendRegisterTokenRequestSchema.safeParse(json);

  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR");
  }

  const response = await resendRegisterTokenServerService(parsed.data);

  if (!response.ok) {
    return errorResponse(response.error.code, response.error.message);
  }

  return NextResponse.json(
    {
      ok: true,
      data: {
        sent: response.data.sent,
      },
    },
    { status: 201 },
  );
}
