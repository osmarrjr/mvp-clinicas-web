import type { CreateConvenioFormValues } from "../schemas/createConvenioSchema";
import type { CreateConvenioResponse } from "../types";
import { buildCreateConvenioPayload } from "./createConvenioPayload";

export async function createConvenioClientService(
  payload: CreateConvenioFormValues,
): Promise<CreateConvenioResponse> {
  const response = await fetch("/api/convenios", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildCreateConvenioPayload(payload)),
  });

  const body = (await response.json()) as CreateConvenioResponse;

  if (!response.ok || !body.ok) {
    return {
      ok: false,
      error: {
        code: body.ok ? "CONVENIO_CREATE_FAILED" : body.error.code,
        message: body.ok ? "" : (body.error.message ?? ""),
      },
    };
  }

  return body;
}
