export type ConvenioCategory = "particular" | "convenio";

export interface CreateConvenioRequest {
  name: string;
  acronym: string;
  category: ConvenioCategory;
  ansRegistration?: string;
  cardNumberMask?: string;
}

export interface Convenio {
  id: string;
  clinic_id: string;
  name: string;
  acronym: string;
  category: ConvenioCategory;
  ans_registration: string | null;
  card_number_mask: string | null;
  created_at: string;
  updated_at: string;
}

type ApiErrorShape = {
  code: string;
  message: string;
};

export type CreateConvenioResponse =
  | { ok: true; data: Convenio }
  | { ok: false; error: ApiErrorShape };
