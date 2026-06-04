import { AppRole, type User } from "@/lib/api/types";

export const MOCK_ACCESS_TOKEN = "mock-access-token";
export const MOCK_REFRESH_TOKEN = "mock-refresh-token";

export const MOCK_USER: User = {
  id: "mock-user-id",
  clinicId: "mock-clinic-id",
  name: "Usuário Mock",
  email: "mock@mvpclinicas.local",
  phone: null,
  sex: null,
  role: AppRole.ClinicAdmin,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export function isAuthMockEnabled(): boolean {
  return process.env.AUTH_MOCK_ENABLED === "true";
}
