export type ClinicPlan = "basic" | "medium" | "pro";

export interface RegisterAdminDto {
  companyName: string;
  taxId: string;
  taxIdType: "cpf" | "cnpj";
  uf: string;
  city: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  plan: ClinicPlan;
}

export interface RegisterAdminSuccessData {
  status: number;
  message: string;
}

type ApiErrorShape = {
  code: string;
  message: string;
};

export type RegisterClinicResponse =
  | { ok: true; data: RegisterAdminSuccessData }
  | { ok: false; error: ApiErrorShape };

export interface ValidateRegisterTokenDto {
  email: string;
  token: string;
}

export interface ValidateRegisterTokenSuccessData {
  verified: boolean;
}

export type ValidateRegisterTokenResponse =
  | { ok: true; data: ValidateRegisterTokenSuccessData }
  | { ok: false; error: ApiErrorShape };

export interface ResendRegisterTokenDto {
  email: string;
}

export interface ResendRegisterTokenSuccessData {
  sent: boolean;
}

export type ResendRegisterTokenResponse =
  | { ok: true; data: ResendRegisterTokenSuccessData }
  | { ok: false; error: ApiErrorShape };

export interface LoginUser {
  id: string;
  email: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: LoginUser;
  passwordChangeRequired?: boolean;
}

export interface LoginClientData {
  user: LoginUser;
  passwordChangeRequired?: boolean;
}

export interface ChangePasswordSuccessData {
  changed: boolean;
}

export type ChangePasswordResponse =
  | { ok: true; data: ChangePasswordSuccessData }
  | { ok: false; error: ApiErrorShape };
