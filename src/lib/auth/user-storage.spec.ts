import { afterEach, describe, expect, it } from "vitest";

import { AppRole, type LoginUser } from "@/features/auth/types";

import {
  AUTH_USER_STORAGE_KEY,
  clearStoredUser,
  getStoredUser,
  getUserDisplayName,
  setStoredUser,
} from "./user-storage";

const USER: LoginUser = {
  id: "user-1",
  email: "user@example.com",
  name: null,
  phone: null,
};

describe("user-storage", () => {
  afterEach(() => {
    clearStoredUser();
  });

  it("persiste e recupera o usuário logado", () => {
    setStoredUser(USER);

    expect(window.localStorage.getItem(AUTH_USER_STORAGE_KEY)).toBe(
      JSON.stringify(USER),
    );
    expect(getStoredUser()).toEqual(USER);
  });

  it("persiste usuário enriquecido com name, phone e role", () => {
    const enrichedUser: LoginUser = {
      id: "user-1",
      email: "user@example.com",
      name: "Maria Silva",
      phone: "+5511999999999",
      role: AppRole.ClinicAdmin,
      clinicId: "clinic-1",
    };

    setStoredUser(enrichedUser);

    expect(getStoredUser()).toEqual(enrichedUser);
  });

  it("retorna null quando o conteúdo é inválido", () => {
    window.localStorage.setItem(AUTH_USER_STORAGE_KEY, '{"id":1}');

    expect(getStoredUser()).toBeNull();
  });

  it("limpa o usuário armazenado", () => {
    setStoredUser(USER);
    clearStoredUser();

    expect(getStoredUser()).toBeNull();
  });

  it("prioriza nome quando disponível no objeto user", () => {
    const userWithName: LoginUser = {
      ...USER,
      name: "Maria Silva",
    };

    expect(getUserDisplayName(userWithName)).toBe("Maria Silva");
    expect(getUserDisplayName(USER)).toBe(USER.email);
  });
});
