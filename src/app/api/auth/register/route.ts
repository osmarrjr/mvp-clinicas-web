import { NextResponse } from "next/server";

import { companyRegisterSchema } from "@/features/auth/schemas/companyRegisterSchema";
import { registerServerService } from "@/features/auth/services/companyRegister/registerServerService";
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

  const parsed = companyRegisterSchema.safeParse(json);

  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR");
  }

  const response = await registerServerService(parsed.data);

  if (!response.ok) {
    return errorResponse(response.error.code, response.error.message);
  }

  return NextResponse.json(
    {
      ok: true,
      data: {
        status: response.data.status,
        message: response.data.message,
      },
    },
    { status: 201 },
  );
}
