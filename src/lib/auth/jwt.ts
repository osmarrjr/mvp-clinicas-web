import "server-only";

import { decodeJwt } from "jose";

import { AppRole, type SessionUser } from "./types";

export interface JwtAccessTokenPayload {
  sub?: string;
  email?: string;
  name?: string;
  phone?: string;
  role?: string;
  clinic_id?: string;
  exp?: number;
  iat?: number;
}

const APP_ROLE_VALUES = new Set<string>(Object.values(AppRole));

function normalizeRole(role: unknown): AppRole | undefined {
  if (typeof role !== "string" || !APP_ROLE_VALUES.has(role)) {
    return undefined;
  }

  return role as AppRole;
}

export function decodeAccessToken(token: string): SessionUser | null {
  let payload: JwtAccessTokenPayload;

  try {
    payload = decodeJwt(token) as JwtAccessTokenPayload;
  } catch {
    return null;
  }

  const id = typeof payload.sub === "string" ? payload.sub : undefined;
  const email = typeof payload.email === "string" ? payload.email : undefined;

  if (!id || !email) {
    return null;
  }

  if (typeof payload.exp === "number") {
    const nowSeconds = Math.floor(Date.now() / 1000);

    if (payload.exp <= nowSeconds) {
      return null;
    }
  }

  const name = typeof payload.name === "string" ? payload.name : null;
  const phone = typeof payload.phone === "string" ? payload.phone : null;
  const role = normalizeRole(payload.role);
  const clinicId =
    typeof payload.clinic_id === "string" ? payload.clinic_id : undefined;

  return {
    id,
    email,
    name,
    phone,
    ...(role !== undefined && { role }),
    ...(clinicId !== undefined && { clinicId }),
  };
}
