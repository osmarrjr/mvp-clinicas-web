import type { ClinicPlan } from "../types";

export const CLINIC_PLANS: { value: ClinicPlan; label: string }[] = [
  { value: "basic", label: "Plano basic - R$ 35,00" },
  { value: "assistant", label: "Plano assistant - R$ 75,00" },
  { value: "pro", label: "Plano pro - R$ 135,00" },
];
