import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { AppRole } from "@/lib/auth/types";

import type { StaffMember } from "../types";
import {
  listAllStaffServerService,
  listStaffByRoleServerService,
} from "./staffServerService";

function createStaffMember(
  overrides: Partial<StaffMember> & Pick<StaffMember, "id" | "name" | "role">,
): StaffMember {
  return {
    email: "user@example.com",
    phone: null,
    clinic_id: "clinic-1",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("listStaffByRoleServerService", () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.API_URL = "https://api.example.com";
  });

  afterEach(() => {
    process.env.API_URL = originalApiUrl;
  });

  it("consulta GET /staff com role e token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      json: async () => ({
        ok: true,
        data: [createStaffMember({ id: "1", name: "Ana", role: AppRole.Doctor })],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await listStaffByRoleServerService("token-123", AppRole.Doctor);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/staff?role=doctor",
      {
        method: "GET",
        headers: {
          Authorization: "Bearer token-123",
        },
        cache: "no-store",
      },
    );
    expect(result).toEqual({
      ok: true,
      data: [createStaffMember({ id: "1", name: "Ana", role: AppRole.Doctor })],
    });
  });

  it("retorna ENV_ERROR quando API_URL está ausente", async () => {
    delete process.env.API_URL;

    const result = await listStaffByRoleServerService("token-123", AppRole.Doctor);

    expect(result).toEqual({
      ok: false,
      error: {
        code: "ENV_ERROR",
        message: "",
      },
    });
  });
});

describe("listAllStaffServerService", () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.API_URL = "https://api.example.com";
  });

  afterEach(() => {
    process.env.API_URL = originalApiUrl;
  });

  it("consolida 3 respostas, deduplica por id e ordena por name", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("role=doctor")) {
        return Promise.resolve({
          json: async () => ({
            ok: true,
            data: [
              createStaffMember({ id: "2", name: "Bruno", role: AppRole.Doctor }),
              createStaffMember({ id: "1", name: "Ana", role: AppRole.Doctor }),
            ],
          }),
        });
      }

      if (url.includes("role=receptionist")) {
        return Promise.resolve({
          json: async () => ({
            ok: true,
            data: [
              createStaffMember({
                id: "1",
                name: "Ana",
                role: AppRole.Receptionist,
              }),
            ],
          }),
        });
      }

      if (url.includes("role=clinic_admin")) {
        return Promise.resolve({
          json: async () => ({
            ok: true,
            data: [
              createStaffMember({
                id: "3",
                name: "Carlos",
                role: AppRole.ClinicAdmin,
              }),
            ],
          }),
        });
      }

      return Promise.reject(new Error("Unexpected URL"));
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await listAllStaffServerService("token-123");

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result).toEqual({
      ok: true,
      data: [
        createStaffMember({ id: "1", name: "Ana", role: AppRole.Receptionist }),
        createStaffMember({ id: "2", name: "Bruno", role: AppRole.Doctor }),
        createStaffMember({ id: "3", name: "Carlos", role: AppRole.ClinicAdmin }),
      ],
    });
  });

  it("propaga erro quando qualquer chamada retorna ok: false", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes("role=doctor")) {
        return Promise.resolve({
          json: async () => ({
            ok: true,
            data: [],
          }),
        });
      }

      if (url.includes("role=receptionist")) {
        return Promise.resolve({
          json: async () => ({
            ok: false,
            error: {
              code: "STAFF_FORBIDDEN",
              message: "Sem permissão para listar usuários.",
            },
          }),
        });
      }

      return Promise.resolve({
        json: async () => ({
          ok: true,
          data: [],
        }),
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await listAllStaffServerService("token-123");

    expect(result).toEqual({
      ok: false,
      error: {
        code: "STAFF_FORBIDDEN",
        message: "Sem permissão para listar usuários.",
      },
    });
  });
});
