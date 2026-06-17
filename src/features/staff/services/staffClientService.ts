import type { ListStaffResponse } from "../types";

type ApiErrorShape = {
  code: string;
  message: string;
};

export async function listStaffClientService(): Promise<ListStaffResponse> {
  try {
    const response = await fetch("/api/staff");
    const body = (await response.json().catch(() => null)) as
      | ListStaffResponse
      | { ok: false; error: ApiErrorShape }
      | null;

    if (!body) {
      return {
        ok: false,
        error: {
          code: "PARSE_ERROR",
          message: "",
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
