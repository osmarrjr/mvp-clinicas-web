import "server-only";

import { AppRole } from "@/lib/auth/types";

import type { ListStaffResponse, StaffMember } from "../types";

type ApiErrorShape = {
  code: string;
  message: string;
};

const STAFF_ROLES = [
  AppRole.Doctor,
  AppRole.Receptionist,
  AppRole.ClinicAdmin,
] as const;

export async function listStaffByRoleServerService(
  accessToken: string,
  role: AppRole,
): Promise<ListStaffResponse> {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    return {
      ok: false,
      error: {
        code: "ENV_ERROR",
        message: "",
      },
    };
  }

  try {
    const response = await fetch(`${apiUrl}/staff?role=${role}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    const body = (await response.json().catch(() => null)) as
      | ListStaffResponse
      | { ok: false; error: ApiErrorShape }
      | null;

    if (!body || !body.ok) {
      return {
        ok: false,
        error: {
          code: body?.error?.code ?? "STAFF_LIST_FAILED",
          message: body?.error?.message ?? "",
        },
      };
    }

    return body;
  } catch {
    return {
      ok: false,
      error: {
        code: "NETWORK_ERROR",
        message: "",
      },
    };
  }
}

export async function listAllStaffServerService(
  accessToken: string,
): Promise<ListStaffResponse> {
  const results = await Promise.all(
    STAFF_ROLES.map((role) => listStaffByRoleServerService(accessToken, role)),
  );

  const failedResult = results.find((result) => !result.ok);

  if (failedResult && !failedResult.ok) {
    return failedResult;
  }

  const allMembers = results.flatMap((result) =>
    result.ok ? result.data : [],
  );

  const byId = new Map<string, StaffMember>();

  for (const member of allMembers) {
    byId.set(member.id, member);
  }

  const merged = Array.from(byId.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR"),
  );

  return {
    ok: true,
    data: merged,
  };
}
