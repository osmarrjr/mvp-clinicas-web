export enum AppRole {
  ClinicAdmin = "clinic_admin",
  Receptionist = "receptionist",
  Doctor = "doctor",
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role?: AppRole;
  clinicId?: string;
}
