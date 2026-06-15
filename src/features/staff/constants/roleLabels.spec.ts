import { describe, it, expect } from "vitest";

import { AppRole } from "@/lib/auth/types";

import { STAFF_ROLE_LABELS, getStaffRoleLabel } from "./roleLabels";

describe("STAFF_ROLE_LABELS", () => {
  it("retorna labels PT-BR para todos os valores de AppRole", () => {
    expect(STAFF_ROLE_LABELS[AppRole.ClinicAdmin]).toBe("Administrador");
    expect(STAFF_ROLE_LABELS[AppRole.Doctor]).toBe("Médico");
    expect(STAFF_ROLE_LABELS[AppRole.Receptionist]).toBe("Recepcionista");
  });
});

describe("getStaffRoleLabel", () => {
  it("retorna o label correspondente ao role", () => {
    expect(getStaffRoleLabel(AppRole.ClinicAdmin)).toBe("Administrador");
    expect(getStaffRoleLabel(AppRole.Doctor)).toBe("Médico");
    expect(getStaffRoleLabel(AppRole.Receptionist)).toBe("Recepcionista");
  });
});
