export enum AppRole {
  ClinicAdmin = "clinic_admin",
  Receptionist = "receptionist",
  Doctor = "doctor",
}

export enum Sex {
  Male = "male",
  Female = "female",
  Other = "other",
}

export interface User {
  id: string;
  clinicId: string;
  name: string;
  email: string;
  phone: string | null;
  sex: Sex | null;
  role: AppRole;
  createdAt: string;
  updatedAt: string;
}
