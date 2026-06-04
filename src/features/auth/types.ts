export type ClinicPlan = "basic" | "medium" | "pro";

export interface RegisterClinicDto {
  clinicName: string;
  taxId: string;
  taxIdType: "cpf" | "cnpj";
  stateUf: string;
  city: string;
  cityIbgeId?: number;
  email: string;
  password: string;
  plan: ClinicPlan;
}

export interface RegisterClinicSuccessData {
  clinicId: string;
}

type ApiErrorShape = {
  code: string;
  message: string;
};

export type RegisterClinicResponse =
  | { ok: true; data: RegisterClinicSuccessData }
  | { ok: false; error: ApiErrorShape };
