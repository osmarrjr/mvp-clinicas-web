import type { AppRole } from "@/lib/auth/types";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: AppRole;
  clinic_id: string;
  created_at: string;
  updated_at: string;
}

type ApiErrorShape = {
  code: string;
  message: string;
};

export type ListStaffResponse =
  | { ok: true; data: StaffMember[] }
  | { ok: false; error: ApiErrorShape };
