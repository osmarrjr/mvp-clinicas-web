import { AppRole } from "@/lib/auth/types";

export const STAFF_ROLE_LABELS: Record<AppRole, string> = {
  [AppRole.ClinicAdmin]: "Administrador",
  [AppRole.Doctor]: "Médico",
  [AppRole.Receptionist]: "Recepcionista",
};

export function getStaffRoleLabel(role: AppRole): string {
  return STAFF_ROLE_LABELS[role];
}
