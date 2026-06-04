import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

import { useLogout } from "./useLogout";
import { logoutClientService } from "../services/authClientService";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

vi.mock("../services/authClientService", () => ({
  logoutClientService: vi.fn(),
}));

const logoutClientServiceMock = vi.mocked(logoutClientService);

describe("useLogout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    logoutClientServiceMock.mockResolvedValue({ ok: true });
  });

  it("chama logoutClientService e redireciona para /login", async () => {
    const { result } = renderHook(() => useLogout());

    await result.current.logout();

    await waitFor(() => {
      expect(logoutClientServiceMock).toHaveBeenCalledTimes(1);
      expect(pushMock).toHaveBeenCalledWith("/login");
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("redireciona para /login mesmo quando logout falha", async () => {
    logoutClientServiceMock.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => useLogout());

    await result.current.logout();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
      expect(refreshMock).toHaveBeenCalled();
    });
  });
});
