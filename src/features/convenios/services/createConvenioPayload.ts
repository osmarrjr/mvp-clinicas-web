import type { CreateConvenioFormValues } from "../schemas/createConvenioSchema";
import type { CreateConvenioRequest } from "../types";

function normalizeOptionalField(value?: string): string | undefined {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
}

export function buildCreateConvenioPayload(
  values: CreateConvenioFormValues,
): CreateConvenioRequest {
  const payload: CreateConvenioRequest = {
    name: values.name.trim(),
    acronym: values.acronym.trim(),
    category: values.category,
  };

  const ansRegistration = normalizeOptionalField(values.ansRegistration);

  if (ansRegistration) {
    payload.ansRegistration = ansRegistration;
  }

  const cardNumberMask = normalizeOptionalField(values.cardNumberMask);

  if (cardNumberMask) {
    payload.cardNumberMask = cardNumberMask;
  }

  return payload;
}
