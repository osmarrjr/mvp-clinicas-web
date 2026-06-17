import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { listAllStaffServerService } from "@/features/staff/services/staffServerService";
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

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return errorResponse("AUTH_MISSING", undefined, 401);
  }

  const response = await listAllStaffServerService(accessToken);

  if (!response.ok) {
    const status = response.error.code === "AUTH_INVALID" ? 401 : 400;
    return errorResponse(response.error.code, response.error.message, status);
  }

  return NextResponse.json(
    {
      ok: true,
      data: response.data,
    },
    { status: 200 },
  );
}
