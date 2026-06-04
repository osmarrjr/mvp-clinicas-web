import { cookies } from "next/headers";

import type { User } from "@/lib/api/types";

import { MOCK_ACCESS_TOKEN, MOCK_USER, isAuthMockEnabled } from "./mock";

export type ServerSession = {
  user: User;
};

export async function getServerSession(): Promise<ServerSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return null;
  }

  if (isAuthMockEnabled() && accessToken === MOCK_ACCESS_TOKEN) {
    return { user: MOCK_USER };
  }

  return { user: MOCK_USER };
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession();
  return session !== null;
}
