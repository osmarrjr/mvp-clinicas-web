import "server-only";

import type { LoginFormValues } from "../../schemas/loginSchema";
import type { LoginResult } from "../../types";

type ApiErrorShape = {
  code: string;
  message: string;
  verificationCodeResent?: boolean;
};

type LoginApiBody = {
  ok?: boolean;
  data?: LoginResult;
  error?: ApiErrorShape;
};

export type LoginServerResponse =
  | { ok: true; data: LoginResult }
  | { ok: false; error: ApiErrorShape };

function isLoginResult(value: unknown): value is LoginResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as LoginResult;

  return (
    typeof candidate.accessToken === "string" &&
    typeof candidate.refreshToken === "string" &&
    typeof candidate.expiresIn === "number" &&
    typeof candidate.tokenType === "string" &&
    Boolean(candidate.user?.id && candidate.user?.email)
  );
}

function mapPasswordChangeRequiredLogin(body: LoginApiBody): LoginServerResponse | null {
  if (body.error?.code !== "PASSWORD_CHANGE_REQUIRED" || !isLoginResult(body.data)) {
    return null;
  }

  return {
    ok: true,
    data: {
      ...body.data,
      passwordChangeRequired: true,
    },
  };
}

export async function loginServerService(
  payload: LoginFormValues,
): Promise<LoginServerResponse> {
  const apiUrl = process.env.API_URL;

  if (!apiUrl) {
    return {
      ok: false,
      error: {
        code: "ENV_ERROR",
        message: "",
      },
    };
  }

  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const body = (await response.json().catch(() => null)) as LoginApiBody | null;

    if (!body) {
      return {
        ok: false,
        error: {
          code: "LOGIN_ERROR",
          message: "",
        },
      };
    }

    const passwordChangeLogin = mapPasswordChangeRequiredLogin(body);

    if (passwordChangeLogin) {
      return passwordChangeLogin;
    }

    if (!response.ok || !body.ok || !isLoginResult(body.data)) {
      return {
        ok: false,
        error: {
          code: body.error?.code ?? "LOGIN_ERROR",
          message: body.error?.message ?? "",
          verificationCodeResent: body.error?.verificationCodeResent,
        },
      };
    }

    return {
      ok: true,
      data: body.data,
    };
  } catch {
    return {
      ok: false,
      error: {
        code: "NETWORK_ERROR",
        message: "",
      },
    };
  }
}
