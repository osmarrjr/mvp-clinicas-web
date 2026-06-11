export type ClinicPlan = "basic" | "medium" | "pro";

export interface RegisterClinicDto {
  clinicName: string;
  taxId: string;
  taxIdType: "cpf" | "cnpj";
  uf: string;
  city: string;
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

export interface ValidateRegisterTokenDto {
  email: string;
  token: string;
}

export interface ValidateRegisterTokenSuccessData {
  message: string;
}

export type ValidateRegisterTokenResponse =
  | { ok: true; data: ValidateRegisterTokenSuccessData }
  | { ok: false; error: ApiErrorShape };
