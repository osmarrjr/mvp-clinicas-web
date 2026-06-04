import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useLogin } from "./useLogin";
import { loginClientService } from "../services/authClientService";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock("../services/authClientService", () => ({
  loginClientService: vi.fn(),
}));

const loginClientServiceMock = vi.mocked(loginClientService);

describe("useLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loginClientServiceMock.mockResolvedValue({
      ok: true,
      data: {
        accessToken: "token",
        refreshToken: "refresh",
        user: {
          id: "1",
          clinicId: "clinic-1",
          name: "Usuário",
          email: "user@example.com",
          role: "clinic_admin",
          phone: null,
          sex: null,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      },
    });
  });

  it("redireciona para /dashboard após login bem-sucedido", async () => {
    const { result } = renderHook(() => useLogin());

    await result.current.login({
      email: "user@example.com",
      password: "123456",
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});
