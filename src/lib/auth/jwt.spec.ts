import { describe, expect, it } from "vitest";

import { AppRole } from "./types";
import { decodeAccessToken } from "./jwt";

function createMockJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");

  return `${header}.${body}.signature`;
}

describe("decodeAccessToken", () => {
  it("maps valid JWT claims to SessionUser", () => {
    const token = createMockJwt({
      sub: "user-1",
      email: "admin@clinica.com",
      name: "Maria Silva",
      phone: "+5511999999999",
      role: AppRole.ClinicAdmin,
      clinic_id: "clinic-1",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    expect(decodeAccessToken(token)).toEqual({
      id: "user-1",
      email: "admin@clinica.com",
      name: "Maria Silva",
      phone: "+5511999999999",
      role: AppRole.ClinicAdmin,
      clinicId: "clinic-1",
    });
  });

  it("returns null for malformed JWT", () => {
    expect(decodeAccessToken("not-a-jwt")).toBeNull();
  });

  it("returns null when required claims are missing", () => {
    const token = createMockJwt({
      sub: "user-1",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    expect(decodeAccessToken(token)).toBeNull();
  });

  it("returns null when token is expired", () => {
    const token = createMockJwt({
      sub: "user-1",
      email: "admin@clinica.com",
      exp: Math.floor(Date.now() / 1000) - 60,
    });

    expect(decodeAccessToken(token)).toBeNull();
  });

  it("normalizes optional fields to null when absent", () => {
    const token = createMockJwt({
      sub: "user-1",
      email: "admin@clinica.com",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    expect(decodeAccessToken(token)).toEqual({
      id: "user-1",
      email: "admin@clinica.com",
      name: null,
      phone: null,
    });
  });

  it("ignores invalid role values", () => {
    const token = createMockJwt({
      sub: "user-1",
      email: "admin@clinica.com",
      role: "invalid_role",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    expect(decodeAccessToken(token)).toEqual({
      id: "user-1",
      email: "admin@clinica.com",
      name: null,
      phone: null,
    });
  });
});
