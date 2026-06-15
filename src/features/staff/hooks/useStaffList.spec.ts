import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { AppRole } from "@/lib/auth/types";
import { createQueryClient } from "@/lib/react-query/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

import type { StaffMember } from "../types";
import { listStaffClientService } from "../services/staffClientService";
import { useStaffList } from "./useStaffList";

vi.mock("../services/staffClientService", () => ({
  listStaffClientService: vi.fn(),
}));

const listStaffClientServiceMock = vi.mocked(listStaffClientService);

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

function createWrapper() {
  const queryClient = createQueryClient();
  queryClient.setDefaultOptions({
    queries: { retry: false },
    mutations: { retry: false },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe("useStaffList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("dispara fetch ao montar e expõe staff em sucesso", async () => {
    const staff = [
      createStaffMember({ id: "1", name: "Ana", role: AppRole.Doctor }),
    ];

    listStaffClientServiceMock.mockResolvedValue({
      ok: true,
      data: staff,
    });

    const { result } = renderHook(() => useStaffList(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(listStaffClientServiceMock).toHaveBeenCalledTimes(1);
    expect(result.current.staff).toEqual(staff);
    expect(result.current.isError).toBe(false);
    expect(result.current.errorMessage).toBeNull();
  });

  it("expõe errorMessage quando a API retorna ok: false", async () => {
    listStaffClientServiceMock.mockResolvedValue({
      ok: false,
      error: {
        code: "STAFF_FORBIDDEN",
        message: "Sem permissão para listar usuários.",
      },
    });

    const { result } = renderHook(() => useStaffList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.errorMessage).toBe(
      "Sem permissão para listar usuários.",
    );
    expect(result.current.staff).toEqual([]);
  });

  it("clearError reseta o estado de erro", async () => {
    listStaffClientServiceMock
      .mockResolvedValueOnce({
        ok: false,
        error: {
          code: "STAFF_LIST_FAILED",
          message: "Falha ao listar usuários.",
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        data: [],
      });

    const { result } = renderHook(() => useStaffList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    result.current.clearError();

    await waitFor(() => {
      expect(result.current.isError).toBe(false);
      expect(result.current.errorMessage).toBeNull();
    });
  });
});
